import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "index";
import * as schema from "schema";
import { zCreateAppSchema, zUpdateAppSchema, zSearchAppsSchema, zCreateRecommendationAppSchema, PublishStatus, App, RelatedApp } from "../../types";

// 应用程序数据访问模块
export const appsDataAccess = {
  // 创建应用程序
  create: async (data: typeof zCreateAppSchema._type, createdBy: string) => {
    return await db.transaction(async (tx) => {
      // 1. 验证唯一性
      const existing = await tx.query.apps.findFirst({
        where: or(
          eq(schema.apps.slug, data.slug),
          and(eq(schema.apps.name, data.name), eq(schema.apps.type, data.type)),
          data.website ? eq(schema.apps.website, data.website) : undefined,
          data.github ? eq(schema.apps.github, data.github) : undefined
        ),
      });

      if (existing) {
        throw new Error("应用已存在");
      }

      // 2. 创建应用
      const [app] = await tx
        .insert(schema.apps)
        .values({ ...data, status: "pending", createdBy: createdBy, source: data?.source || "admin" })
        .returning();
      if (!app) {
        throw new Error("应用创建失败");
      }
      // 3. 关联分类
      if (data.categoryIds?.length) {
        await tx.insert(schema.appCategories).values(
          data.categoryIds.map((categoryId) => ({
            appId: app.id,
            categoryId,
          }))
        );
      }

      // 4. 关联标签
      if (data.tagIds?.length) {
        await tx.insert(schema.appTags).values(
          data.tagIds.map((tagId) => ({
            appId: app.id,
            tagId,
          }))
        );
      }

      return app;
    });
  },

  // 更新应用程序
  update: async (id: string, data: typeof zUpdateAppSchema._type, updatedBy: string) => {
    return db
      .update(schema.apps)
      .set({ ...data, updatedBy })
      .where(eq(schema.apps.id, id))
      .returning();
  },

  //审核状态
  updateStatus: async (id: string, status: "pending" | "approved" | "rejected" | "archived") => {
    return db.update(schema.apps).set({ status }).where(eq(schema.apps.id, id)).returning();
  },

  //上线/下线
  updatePublishStatus: async (id: string, status: "online" | "offline") => {
    return db.update(schema.apps).set({ publishStatus: status }).where(eq(schema.apps.id, id)).returning();
  },
  // 获取应用程序
  getById: async (id: string) => {
    return db.query.apps.findFirst({
      where: eq(schema.apps.id, id),
      with: {
        tags: true,
        categories: true,
      },
    });
  },

  getByIdWithRelations: async (id: string) => {
    return db.query.apps.findFirst({
      where: eq(schema.apps.id, id),
      with: {
        tags: true,
        categories: true,
        suggestions: true,
        claims: true,
        owner: true,
        relatedApps: true,
        recommendations: true,
        analysisHistory: true,
        rss: true,
      },
    });
  },

  // 搜索应用程序
  search: async (params: typeof zSearchAppsSchema._type) => {
    const { query, page = 1, limit = 10, field, order, type, status } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(or(like(schema.apps.name, `%${query}%`), like(schema.apps.description, `%${query}%`), like(schema.apps.slug, `%${query}%`)));
    }

    if (type) {
      conditions.push(eq(schema.apps.type, type));
    }

    if (status) {
      conditions.push(eq(schema.apps.status, status));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "name") orderBy.push(orderDirection(schema.apps.name));
      if (field === "slug") orderBy.push(orderDirection(schema.apps.slug));
      if (field === "createdAt") orderBy.push(orderDirection(schema.apps.createdAt));
      if (field === "updatedAt") orderBy.push(orderDirection(schema.apps.updatedAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(schema.apps.createdAt));
    }

    // 执行查询
    const results = await db.query.apps.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
      with: {
        tags: true,
        categories: true,
      },
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.apps)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = countResult[0]?.count ?? 0;

    return {
      data: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // 删除应用程序
  delete: async (id: string) => {
    return db.delete(schema.apps).where(eq(schema.apps.id, id)).returning();
  },

  // 获取相关应用
  getRelatedApps: async (id: string): Promise<RelatedApp[]> => {
    const result = await db
      .select({
        id: schema.apps.id,
        name: schema.apps.name,
        description: schema.apps.description,
        icon: schema.apps.icon,
        similarity: schema.relatedApps.similarity,
      })
      .from(schema.relatedApps)
      .innerJoin(schema.apps, eq(schema.apps.id, schema.relatedApps.relatedAppId))
      .where(eq(schema.relatedApps.appId, id));
    return result;
  },

  // 获取 RSS 订阅
  getRssFeeds: async (id: string) => {
    return await db.select().from(schema.appRss).where(eq(schema.appRss.appId, id));
  },

  // 获取广告
  getAds: async (id: string) => {
    return await db.select().from(schema.ads).where(eq(schema.ads.appId, id));
  },

  // 获取建议
  getSuggestions: async (id: string) => {
    return await db.select().from(schema.suggestions).where(eq(schema.suggestions.appId, id));
  },

  // 获取所有权声明
  getClaims: async (id: string) => {
    return await db.select().from(schema.claims).where(eq(schema.claims.appId, id));
  },

  // 获取所有者信息
  getOwner: async (id: string) => {
    const app = await db
      .select({
        ownerId: schema.apps.ownerId,
      })
      .from(schema.apps)
      .where(eq(schema.apps.id, id));

    if (!app[0]?.ownerId) return null;

    const owner = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        image: schema.users.image,
      })
      .from(schema.users)
      .where(eq(schema.users.id, app[0].ownerId));
    if (owner.length === 0) return null;
    const otherApps = await db
      .select({
        id: schema.apps.id,
        name: schema.apps.name,
      })
      .from(schema.apps)
      .where(eq(schema.apps.ownerId, app[0].ownerId));
    return {
      ...owner[0],
      otherApps: otherApps,
    };
  },

  // 获取推荐
  getRecommendations: async (id: string) => {
    return db.select().from(schema.recommendations).where(eq(schema.recommendations.appId, id));
  },

  // 更新相关应用
  updateRelatedApps: async (id: string, relatedAppIds: string[]) => {
    return db.transaction(async (tx) => {
      // 删除现有关系
      await tx.delete(schema.relatedApps).where(eq(schema.relatedApps.appId, id));

      // 添加新关系
      if (relatedAppIds.length > 0) {
        await tx.insert(schema.relatedApps).values(
          relatedAppIds.map((relatedId) => ({
            appId: id,
            relatedAppId: relatedId,
            similarity: 1,
          }))
        );
      }
    });
  },

  // 更新 RSS 订阅
  updateRssFeeds: async (id: string, feeds: { title: string; feedUrl: string; description?: string }[]) => {
    return db.transaction(async (tx) => {
      await tx.delete(schema.appRss).where(eq(schema.appRss.appId, id));

      if (feeds.length > 0) {
        await tx.insert(schema.appRss).values(
          feeds.map((feed) => ({
            appId: id,
            ...feed,
          }))
        );
      }
    });
  },

  // 获取标签
  getTags: async (id: string) => {
    return db.query.appTags.findMany({
      where: eq(schema.appTags.appId, id),
      with: {
        tag: true,
      },
    });
  },

  // 获取分类
  getCategories: async (id: string) => {
    return db.query.appCategories.findMany({
      where: eq(schema.appCategories.appId, id),
      with: {
        category: true,
      },
    });
  },

  // 添加标签
  addTag: async (appId: string, tagId: string) => {
    return db.insert(schema.appTags).values({ appId, tagId });
  },

  // 添加分类
  addCategory: async (appId: string, categoryId: string) => {
    return db.insert(schema.appCategories).values({ appId, categoryId });
  },

  // 移除标签
  removeTag: async (appId: string, tagId: string) => {
    return db.delete(schema.appTags).where(and(eq(schema.appTags.appId, appId), eq(schema.appTags.id, tagId)));
  },

  // 移除分类
  removeCategory: async (appId: string, categoryId: string) => {
    return db.delete(schema.appCategories).where(and(eq(schema.appCategories.appId, appId), eq(schema.appCategories.id, categoryId)));
  },

  // 更新标签
  updateTags: async (appId: string, tagIds: string[]) => {
    return db.transaction(async (tx) => {
      // 删除现有标签
      await tx.delete(schema.appTags)
        .where(eq(schema.appTags.appId, appId));

      // 添加新标签
      if (tagIds.length > 0) {
        await tx.insert(schema.appTags).values(
          tagIds.map(tagId => ({
            appId,
            tagId
          }))
        );
      }

      // 返回更新后的标签
      return tx.query.appTags.findMany({
        where: eq(schema.appTags.appId, appId),
        with: {
          tag: true
        }
      });
    });
  },

  // 更新分类
  updateCategories: async (appId: string, categoryIds: string[]) => {
    return db.transaction(async (tx) => {
      // 删除现有分类
      await tx.delete(schema.appCategories)
        .where(eq(schema.appCategories.appId, appId));

      // 添加新分类
      if (categoryIds.length > 0) {
        await tx.insert(schema.appCategories).values(
          categoryIds.map(categoryId => ({
            appId,
            categoryId
          }))
        );
      }

      // 返回更新后的分类
      return tx.query.appCategories.findMany({
        where: eq(schema.appCategories.appId, appId),
        with: {
          category: true
        }
      });
    });
  },

  // 获取提交
  getSubmission: async (id: string) => {
    return db.select().from(schema.appSubmissions).where(eq(schema.appSubmissions.approvedAppId, id));
  },

  // 更新提交
  updateSubmission: async (id: string, data: { status: string; reason: string }) => {
    return db.update(schema.appSubmissions).set(data).where(eq(schema.appSubmissions.id, id));
  },

  // 删除提交
  deleteSubmission: async (id: string) => {
    return db.delete(schema.appSubmissions).where(eq(schema.appSubmissions.id, id));
  },

  // 拒绝声明
  rejectClaim: async (claimId: string, appId: string) => {
    return db.update(schema.claims).set({ status: "rejected" }).where(eq(schema.claims.id, claimId)).returning();
  },

  // 批准声明
  approveClaim: async (claimId: string, appId: string) => {
    return db.update(schema.claims).set({ status: "approved" }).where(eq(schema.claims.id, claimId)).returning();
  },

  // 搜索应用
  searchApps: async (query: string, page: number, limit: number): Promise<App[]> => {
    return db.query.apps.findMany({
      where: like(schema.apps.name, `%${query}%`),
      limit,
      offset: (page - 1) * limit,
    });
  },

  // 添加相关应用
  addRelatedApp: async (appId: string, relatedAppId: string) => {
    return db.insert(schema.relatedApps).values({ appId, relatedAppId });
  },

  // 移除相关应用
  removeRelatedApp: async (appId: string, relatedAppId: string) => {
    return db.delete(schema.relatedApps).where(and(eq(schema.relatedApps.appId, appId), eq(schema.relatedApps.relatedAppId, relatedAppId)));
  },

  // 添加推荐
  addRecommendation: async (data: typeof zCreateRecommendationAppSchema._type) => {
    return db.insert(schema.recommendationApps).values(data);
  },

  // 移除推荐
  removeRecommendation: async (id: string) => {
    return db.delete(schema.recommendationApps).where(
      eq(schema.recommendations.id, id)
    );
  },


  // 获取用户提交的应用
  getSubmittedApps: async (userId: string) => {
    return db.query.apps.findMany({
      where: eq(schema.apps.userId, userId),
    });
  },

  // 获取用户提交的应用数量
  getSubmittedAppsCount: async (userId: string) => {
    const value = await db.select({ count: sql<number>`count(*)` }).from(schema.apps).where(eq(schema.apps.userId, userId));
    return value[0]?.count || 0;
  },

};