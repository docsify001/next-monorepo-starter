import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "index";
import { recommendationApps } from "schema";
import { zCreateRecommendationAppSchema, zUpdateRecommendationAppSchema, zSearchRecommendationAppsSchema, RecommendationApp, RecommendationAppWithApp, McpApp } from "types";

export const recommendationAppData = {
  // 创建推荐应用关联
  create: async (data: typeof zCreateRecommendationAppSchema._type) => {
    return await db.insert(recommendationApps).values(data).returning();
  },

  // 更新推荐应用关联
  update: async (id: string, data: typeof zUpdateRecommendationAppSchema._type) => {
    return await db.update(recommendationApps).set(data).where(eq(recommendationApps.id, id)).returning();
  },

  // 获取推荐应用关联
  getById: async (id: string) => {
    return db.query.recommendationApps.findFirst({
      where: eq(recommendationApps.id, id),
      with: {
        recommendation: true,
        app: true,
      },
    });
  },

  // 搜索推荐应用关联
  search: async (params: typeof zSearchRecommendationAppsSchema._type) => {
    const { query, page = 1, limit = 10, field, order, recommendationId, appId } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(or(like(recommendationApps.id, `%${query}%`)));
    }

    if (recommendationId) {
      conditions.push(eq(recommendationApps.recommendationId, recommendationId));
    }

    if (appId) {
      conditions.push(eq(recommendationApps.appId, appId));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "order") orderBy.push(orderDirection(recommendationApps.order));
      if (field === "createdAt") orderBy.push(orderDirection(recommendationApps.createdAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(recommendationApps.createdAt));
    }

    // 执行查询
    const results = await db.query.recommendationApps.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
      with: {
        recommendation: true,
        app: true,
      },
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(recommendationApps)
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

  // 删除推荐应用关联
  delete: async (id: string) => {
    return await db.delete(recommendationApps).where(eq(recommendationApps.id, id)).returning();
  },

  // 获取推荐应用
  getRecommendedAppsByCategory: async (category: string, limit = 10) => {
    return await db.query.recommendationApps.findMany({
      where: eq(recommendationApps.categoryId, category),
      limit,
      with: {
        app: true,
      },
    });
  },
  // 这个方法主要用于根据应用类型获取的推荐应用列表
  getRecommendedAppsByType: async (type: "client" | "server" | "application", limit = 10) => {
    return await db.query.recommendationApps.findMany({
      where: eq(recommendationApps.categoryId, type),
      limit,
      with: {
        app: true,
      },
    });
  },

  // 获取推荐应用
  getFeaturedApps: async (limit = 10) => {
    return await db.query.recommendationApps.findMany({
      where: eq(recommendationApps.type, "popular"),
      limit,
      with: {
        app: true,
      },
    });
  },

  /**
   * 获取应用被推荐的位置列表中的应用信息
   * @param appId 应用ID
   * @param limit 限制返回数量
   * @returns 返回推荐的应用信息数组
   */
  getAppRecommendedApps: async (appId: string, limit = 10) => {
    const results = await db.query.recommendationApps.findMany({
      where: and(
        eq(recommendationApps.appId, appId),
        eq(recommendationApps.status, "active")
      ),
      limit,
      orderBy: asc(recommendationApps.order),
      with: {
        app: true,
      }
    });

    // 只返回 app 字段
    return results.map(result => result.app);
  },
};