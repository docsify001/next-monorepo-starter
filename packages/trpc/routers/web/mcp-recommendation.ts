import { recommendationAppData } from "@repo/db/database/admin";
import { z } from "zod";
import { publicProcedure, router } from "../../trpc";

export const mcpRecommendationsRouter = router({
  // 获取推荐应用
  getRecommendedAppsByType: publicProcedure
    .input(
      z.object({
        type: z.enum(["client", "server", "application"]),
        limit: z.coerce.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await recommendationAppData.getRecommendedAppsByType(input.type, input.limit ?? 10);
    }),

  // 获取推荐应用
  getFeaturedApps: publicProcedure
    .input(
      z.object({
        limit: z.coerce.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await recommendationAppData.getFeaturedApps(input.limit ?? 10);
    }),

  getAppRecommendedApps: publicProcedure
    .input(
      z.object({
        appId: z.string(), //当前正在访问的appid
        limit: z.coerce.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await recommendationAppData.getAppRecommendedApps(input.appId, input.limit ?? 10);
    }),
}); 