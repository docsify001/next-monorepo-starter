import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "index";
import { appSubmissions, users } from "schema";
import { zCreateAppSubmissionSchema, zUpdateAppSubmissionSchema, zSearchAppSubmissionsSchema } from "../../types";

export const appSubmissionData = {
  // 创建应用提交，只有用户才会创建，管理员不会创建，只会更新
  create: async (data: typeof zCreateAppSubmissionSchema._type) => {
    return await db.insert(appSubmissions).values({
      userId: data.userId,
      status: data.status,
      name: data.name,
      description: data.description,
      longDescription: data.longDescription,
      type: data.type,
      website: data.website,
      github: data.github,
      docs: data.docs,
      favicon: data.favicon,
      logo: data.logo,
    }).returning();
  },

  // 更新应用提交
  update: async (data: typeof zUpdateAppSubmissionSchema._type) => {
    const { id, ...updateData } = data;
    return await db
      .update(appSubmissions)
      .set(updateData)
      .where(eq(appSubmissions.id, id))
      .returning();
  },

  // 获取应用提交
  getById: async (id: string) => {
    return await db
      .select()
      .from(appSubmissions)
      .where(eq(appSubmissions.id, id));
  },

  // 搜索应用提交
  search: async (data: typeof zSearchAppSubmissionsSchema._type) => {
    const {
      page = 1,
      limit = 10,
      field = "createdAt",
      order = "desc",
      appId,
      userId,
      status
    } = data;

    const offset = (page - 1) * limit;

    const baseQuery = db
      .select({
        submission: appSubmissions,
        user: users
      })
      .from(appSubmissions)
      .leftJoin(users, eq(appSubmissions.userId, users.id));

    // 构建where条件
    const conditions = [];

    if (appId) {
      conditions.push(eq(appSubmissions.approvedAppId, appId));
    }
    if (userId) {
      conditions.push(eq(appSubmissions.userId, userId));
    }
    if (status) {
      conditions.push(eq(appSubmissions.status, status));
    }

    // 应用所有条件
    const finalQuery = conditions.length > 0
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    // 添加排序和分页
    const query = finalQuery.limit(limit).offset(offset);

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appSubmissions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = countResult[0]?.count ?? 0;

    // 根据字段名添加排序
    let results;
    switch (field) {
      case "createdAt":
        results = await query.orderBy(order === "desc" ? desc(appSubmissions.createdAt) : asc(appSubmissions.createdAt));
        break;
      case "updatedAt":
        results = await query.orderBy(order === "desc" ? desc(appSubmissions.updatedAt) : asc(appSubmissions.updatedAt));
        break;
      case "status":
        results = await query.orderBy(order === "desc" ? desc(appSubmissions.status) : asc(appSubmissions.status));
        break;
      default:
        results = await query.orderBy(desc(appSubmissions.createdAt));
    }

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

  // 删除应用提交
  delete: async (id: string) => {
    return await db
      .delete(appSubmissions)
      .where(eq(appSubmissions.id, id))
      .returning();
  },

  // 批准应用提交
  approve: async (id: string) => {
    return await db
      .update(appSubmissions)
      .set({ status: "approved" })
      .where(eq(appSubmissions.id, id))
      .returning();
  },

  // 拒绝应用提交
  reject: async (id: string, reason: string) => {
    return await db
      .update(appSubmissions)
      .set({ status: "rejected", rejectionReason: reason })
      .where(eq(appSubmissions.id, id))
      .returning();
  },

  /**
   * 获取用户提交的应用
   * @param userId 用户ID
   * @returns 用户提交的应用
   */
  getSubmissionsByUserId: async (userId: string) => {
    return await db.query.appSubmissions.findMany({
      where: (appSubmissions, { eq }) => eq(appSubmissions.userId, userId),
      with: {
        approvedApp: true,
      },
    });
  },

  getSubmittedAppsCount: async (userId: string) => {
    const count = await db.select({
      count: sql<number>`count(*)`
    })
      .from(appSubmissions)
      .where(eq(appSubmissions.userId, userId));
    return count[0]?.count ?? 0;
  },


}; 
