import { recommendationDataAccess } from "@repo/db/database/admin";
import {
  zCreateRecommendationSchema,
  zSearchRecommendationsSchema,
  zUpdateRecommendationSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const recommendationsRouter = router({
  // 创建推荐
  create: adminProcedure
    .input(zCreateRecommendationSchema)
    .mutation(async ({ input }) => {
      return await recommendationDataAccess.create(input);
    }),

  // 更新推荐
  update: adminProcedure
    .input(zUpdateRecommendationSchema)
    .mutation(async ({ input }) => {
      return await recommendationDataAccess.update(input.id, input);
    }),

  // 获取推荐
  get: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await recommendationDataAccess.getById(input.id);
    }),

  // 搜索推荐
  search: adminProcedure
    .input(zSearchRecommendationsSchema)
    .query(async ({ input }) => {
      return await recommendationDataAccess.search(input);
    }),

  // 删除推荐
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await recommendationDataAccess.delete(input.id);
    }),
}); 