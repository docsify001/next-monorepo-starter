import { appsDataAccess, suggestionsDataAccess } from "@repo/db/database/admin";

import { protectedProcedure, router } from "../../trpc";
import { z } from "zod";

export const mcpSuggestionsRouter = router({
  // 创建建议
  create: protectedProcedure
    .input(z.object({
      appId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      console.log("[suggestion] [create] input", input);
      if (!input.appId) {
        throw new Error("应用ID不能为空");
      }
      const app = await appsDataAccess.getById(input.appId);
      if (!app) {
        throw new Error("应用不存在");
      }
      return suggestionsDataAccess.create({
        ...input,
        appId: input.appId,
        appName: app.name,
        appSlug: app.slug,
        appType: app.type,
        userId: ctx.user.id,
        userName: ctx.user.name,
        userEmail: ctx.user.email,
        upvotes: 0,
        status: "pending",
      });
    }),


  // 获取建议
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return suggestionsDataAccess.getById(input.id);
    }),

  // 删除建议
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return suggestionsDataAccess.deleteByUserId(input.id, ctx.user.id);
    }),
}); 