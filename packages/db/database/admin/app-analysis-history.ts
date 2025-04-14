import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { appAnalysisHistory } from "../../schema";
import { zCreateAppAnalysisHistorySchema, zUpdateAppAnalysisHistorySchema, zSearchAppAnalysisHistorySchema } from "../../types";

export const appAnalysisHistoryDataAccess = {
  // 创建应用分析历史
  create: async (data: typeof zCreateAppAnalysisHistorySchema._type) => {
    return await db.insert(appAnalysisHistory).values(data).returning();
  },

  // 更新应用分析历史
  update: async (id: string, data: typeof zUpdateAppAnalysisHistorySchema._type) => {
    return await db.update(appAnalysisHistory).set(data).where(eq(appAnalysisHistory.id, id)).returning();
  },

  // 获取应用分析历史
  getById: async (id: string) => {
    return db.query.appAnalysisHistory.findFirst({
      where: eq(appAnalysisHistory.id, id),
      with: {
        app: true,
      },
    });
  },

  // 搜索应用分析历史
  search: async (params: typeof zSearchAppAnalysisHistorySchema._type) => {
    const { query, page = 1, limit = 10, field, order, appId, status } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(or(like(appAnalysisHistory.id, `%${query}%`), like(appAnalysisHistory.version, `%${query}%`)));
    }

    if (appId) {
      conditions.push(eq(appAnalysisHistory.appId, appId));
    }

    if (status) {
      conditions.push(eq(appAnalysisHistory.status, status));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "version") orderBy.push(orderDirection(appAnalysisHistory.version));
      if (field === "status") orderBy.push(orderDirection(appAnalysisHistory.status));
      if (field === "startTime") orderBy.push(orderDirection(appAnalysisHistory.startTime));
      if (field === "endTime") orderBy.push(orderDirection(appAnalysisHistory.endTime));
      if (field === "createdAt") orderBy.push(orderDirection(appAnalysisHistory.createdAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(appAnalysisHistory.createdAt));
    }

    // 执行查询
    const results = await db.query.appAnalysisHistory.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
      with: {
        app: true,
      },
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(appAnalysisHistory)
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

  // 删除应用分析历史
  delete: async (id: string) => {
    return await db.delete(appAnalysisHistory).where(eq(appAnalysisHistory.id, id)).returning();
  },

  getListByAppId: async (appId: string) => {
    return await db.query.appAnalysisHistory.findMany({
      where: eq(appAnalysisHistory.appId, appId),
    });
  },

  startAnalysis: async (appId: string) => {
    return await db.insert(appAnalysisHistory).values({
      appId,
      status: "in_progress",
      startTime: new Date(),
      analysisResult: {},
    }).returning();
  },

  /**
   * 更新应用分析历史状态
   * @param id 应用分析历史ID
   * @param data 更新数据
   * @returns 更新后的应用分析历史
   */
  updateStatus: async (id: string, data: { status: string, startTime?: Date, id: string, endTime?: Date, error?: string, message?: string }) => {
    return await db.update(appAnalysisHistory).set(data).where(eq(appAnalysisHistory.id, id));
  },
}; 