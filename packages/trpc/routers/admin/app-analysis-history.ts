import { appAnalysisHistoryDataAccess } from "@repo/db/database/admin";
import {
  zCreateAppAnalysisHistorySchema,
  zSearchAppAnalysisHistorySchema,
  zUpdateAppAnalysisHistorySchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const appAnalysisHistoryRouter = router({
  // 创建应用分析历史
  create: adminProcedure
    .input(zCreateAppAnalysisHistorySchema)
    .mutation(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.create(input);
    }),

  // 更新应用分析历史
  update: adminProcedure
    .input(zUpdateAppAnalysisHistorySchema)
    .mutation(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.update(input);
    }),

  // 获取应用分析历史
  get: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.get(input);
    }),

  // 搜索应用分析历史
  search: adminProcedure
    .input(zSearchAppAnalysisHistorySchema)
    .query(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.search(input);
    }),

  // 删除应用分析历史
  delete: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.delete(input);
    }),

  // 获取应用分析历史列表
  getListByAppId: adminProcedure
    .input(z.object({
      appId: z.string(),
    }))
    .query(async ({ input }) => {
      return await appAnalysisHistoryDataAccess.getListByAppId(input.appId);
    }),

  // 开始应用分析
  startAnalysis: adminProcedure
    .input(z.object({
      appId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const data = await appAnalysisHistoryDataAccess.startAnalysis(input.appId);
      return { ...data, status: "in_progress" };
    }),
}); 