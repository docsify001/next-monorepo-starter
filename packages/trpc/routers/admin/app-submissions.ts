import { appSubmissionData } from "@repo/db/database/admin";
import {
  zCreateAppSubmissionSchema,
  zSearchAppSubmissionsSchema,
  zUpdateAppSubmissionSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const appSubmissionsRouter = router({
  // 创建应用提交
  create: adminProcedure
    .input(zCreateAppSubmissionSchema)
    .mutation(async ({ input }) => {
      return appSubmissionData.create(input);
    }),

  // 更新应用提交
  update: adminProcedure
    .input(zUpdateAppSubmissionSchema)
    .mutation(async ({ input }) => {
      return appSubmissionData.update(input);
    }),

  // 获取应用提交
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return appSubmissionData.get(input);
    }),

  // 搜索应用提交
  search: adminProcedure
    .input(zSearchAppSubmissionsSchema)
    .query(async ({ input }) => {
      return appSubmissionData.search(input);
    }),

  // 删除应用提交
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return appSubmissionData.delete(input);
    }),

  // 批准应用提交
  approve: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return appSubmissionData.approve(input.id);
    }),

  // 拒绝应用提交
  reject: adminProcedure
    .input(z.object({ id: z.string(), reason: z.string() }))
    .mutation(async ({ input }) => {
      return appSubmissionData.reject(input.id, input.reason);
    }),
}); 