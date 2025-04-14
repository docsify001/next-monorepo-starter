import { appsDataAccess, recommendationDataAccess } from "@repo/db/database/admin";
import {
  zAppSourceEnum,
  zCreateAppSchema,
  zSearchAppsSchema,
  zUpdateAppSchema,
  zPublishStatusEnum,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../../trpc";

export const appsRouter = router({
  // 创建应用
  create: adminProcedure.input(zCreateAppSchema).mutation(async ({ input, ctx }) => {
    const data = { ...input, source: zAppSourceEnum.enum.admin, publishStatus: zPublishStatusEnum.enum.offline };
    return appsDataAccess.create(data, ctx.user.id);
  }),

  // 更新应用
  update: adminProcedure.input(zUpdateAppSchema).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    return appsDataAccess.update(id, data, ctx.user.id);
  }),

  // 获取应用
  getById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return appsDataAccess.getById(input.id);
  }),

  getByIdWithRelations: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return appsDataAccess.getByIdWithRelations(input.id);
  }),
  // 搜索应用
  search: adminProcedure.input(zSearchAppsSchema).query(async ({ input }) => {
    return appsDataAccess.search(input);
  }),

  // 删除应用
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    return appsDataAccess.delete(input.id);
  }),

  // 获取相关应用
  getRelatedApps: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return appsDataAccess.getRelatedApps(input.id);
  }),

  // 获取 RSS 订阅
  getRssFeeds: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return appsDataAccess.getRssFeeds(input.id);
  }),

  // 获取广告
  getAds: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return appsDataAccess.getAds(input.id);
  }),

  // 获取建议
  getSuggestions: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return appsDataAccess.getSuggestions(input.id);
  }),

  // 获取所有权声明
  getClaims: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return appsDataAccess.getClaims(input.id);
  }),

  // 获取所有者
  getOwner: adminProcedure.input(z.object({ id: z.string().optional().nullish() })).query(async ({ input }) => {
    if (!input.id) {
      return null;
    }
    return appsDataAccess.getOwner(input.id);
  }),

  // 获取该应用被推荐的列表，即会创建多个recommandation，每个recommendation会有多个应用，
  getRecommendations: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return recommendationDataAccess.getRecommendationsByAppid(input.id);
  }),

  // 更新相关应用
  updateRelatedApps: adminProcedure
    .input(
      z.object({
        id: z.string(),
        relatedAppIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return appsDataAccess.updateRelatedApps(input.id, input.relatedAppIds);
    }),

  // 更新 RSS 订阅
  updateRssFeeds: adminProcedure
    .input(
      z.object({
        id: z.string(),
        feeds: z.array(
          z.object({
            title: z.string(),
            feedUrl: z.string(),
            description: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      return appsDataAccess.updateRssFeeds(input.id, input.feeds);
    }),

  getTags: adminProcedure.input(z.object({ appId: z.string() })).query(async ({ input }) => {
    return appsDataAccess.getTags(input.appId);
  }),

  getCategories: adminProcedure.input(z.object({ appId: z.string() })).query(async ({ input }) => {
    return appsDataAccess.getCategories(input.appId);
  }),

  // 添加标签
  addTag: adminProcedure.input(z.object({ appId: z.string(), tagId: z.string() })).mutation(async ({ input }) => {
    return appsDataAccess.addTag(input.appId, input.tagId);
  }),

  // 添加分类
  addCategory: adminProcedure.input(z.object({ appId: z.string(), categoryId: z.string() })).mutation(async ({ input }) => {
    return appsDataAccess.addCategory(input.appId, input.categoryId);
  }),

  removeTag: adminProcedure.input(z.object({ appId: z.string(), tagId: z.string() })).mutation(async ({ input }) => {
    return appsDataAccess.removeTag(input.appId, input.tagId);
  }),

  removeCategory: adminProcedure.input(z.object({ appId: z.string(), categoryId: z.string() })).mutation(async ({ input }) => {
    return appsDataAccess.removeCategory(input.appId, input.categoryId);
  }),

  // 更新标签
  updateTags: adminProcedure
    .input(
      z.object({
        appId: z.string(),
        tagIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return appsDataAccess.updateTags(input.appId, input.tagIds);
    }),

  // 更新分类
  updateCategories: adminProcedure
    .input(
      z.object({
        appId: z.string(),
        categoryIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return appsDataAccess.updateCategories(input.appId, input.categoryIds);
    }),

  // 获取提交
  getSubmission: publicProcedure.input(z.object({ id: z.string().optional() })).query(async ({ input }) => {
    if (!input.id) {
      return null;
    }
    return appsDataAccess.getSubmission(input.id);
  }),

  // 更新提交
  updateSubmission: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          status: z.string(),
          reason: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      return appsDataAccess.updateSubmission(input.id, input.data);
    }),

  // 删除提交
  deleteSubmission: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    return appsDataAccess.deleteSubmission(input.id);
  }),

  rejectClaim: adminProcedure.input(z.object({ claimId: z.string(), appId: z.string() })).mutation(async ({ input }) => {
    return appsDataAccess.rejectClaim(input.claimId, input.appId);
  }),

  approveClaim: adminProcedure.input(z.object({ claimId: z.string(), appId: z.string() })).mutation(async ({ input }) => {
    return appsDataAccess.approveClaim(input.claimId, input.appId);
  }),

  searchApps: adminProcedure
    .input(
      z.object({
        query: z.string(),
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return appsDataAccess.searchApps(input.query, input.page || 1, input.limit || 10);
    }),

  //
  addRelatedApp: adminProcedure
    .input(
      z.object({
        appId: z.string(),
        relatedAppId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return appsDataAccess.addRelatedApp(input.appId, input.relatedAppId);
    }),

  removeRelatedApp: adminProcedure
    .input(
      z.object({
        appId: z.string(),
        relatedAppId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return appsDataAccess.removeRelatedApp(input.appId, input.relatedAppId);
    }),

  // 添加推荐
  addRecommendation: adminProcedure.input(z.object({
    appId: z.string(),
    recommendedAppId: z.string(),
  })).mutation(async ({ input }) => {
    return appsDataAccess.addRecommendation(input.appId, input.recommendedAppId);
  }),

  removeRecommendation: adminProcedure.input(z.object({
    appId: z.string(),
    recommendedAppId: z.string(),
  })).mutation(async ({ input }) => {
    return appsDataAccess.removeRecommendation(input.recommendedAppId);
  }),

  //上线/下线
  updatePublishStatus: adminProcedure.input(z.object({
    id: z.string(),
    status: z.enum(["online", "offline"]),
  })).mutation(async ({ input }) => {
    return appsDataAccess.updatePublishStatus(input.id, input.status);
  }),

  //审核状态
  updateStatus: adminProcedure.input(z.object({
    id: z.string(),
    status: z.enum(["pending", "approved", "rejected", "archived"]),
  })).mutation(async ({ input }) => {
    return appsDataAccess.updateStatus(input.id, input.status);
  }),
});
