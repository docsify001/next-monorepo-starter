import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { McpApp } from "@repo/db/types";
import { mcpAppsDataAccess } from "@repo/db/database/web";
import { adsDataAccess, tagsDataAccess } from "@repo/db/database/admin";

export const mcpappRouter = router({
  getAppById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { id } = input;
      // Mock data for demonstration
      const app = { id, name: `App ${id}` };
      return app;
    }),
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      const { slug } = input;
      return mcpAppsDataAccess.getBySlug(slug);
    }),

  getByTag: publicProcedure
    .input(
      z.object({
        tagName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { tagName } = input;
      const tag = await tagsDataAccess.getByName(tagName);
      if (tag && tag.id) {
        const apps = await mcpAppsDataAccess.getAppsByTagId(tag.id);
        return apps as McpApp[];
      }
      return [] as McpApp[];
    }),

  getBySubcategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { category } = input;

      return [] as McpApp[];
    }),

  getByTypeCategoryAndTag: publicProcedure
    .input(
      z.object({
        type: z.enum(["client", "server", "application"]),
        category: z.string().optional(),
        tag: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { type, category, tag } = input;
      const apps = await mcpAppsDataAccess.getByTypeCategoryAndTag({
        type,
        category,
        tag,
      });
      return apps;
    }),

  getByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { category } = input;

      return [] as McpApp[];
    }),

  getCountBadge: publicProcedure.query(async () => {
    const count = await mcpAppsDataAccess.getCount();
    const newCount = await mcpAppsDataAccess.getNewCount();
    return { count, newCount };
  }),

  getAdsListByType: publicProcedure
    .input(z.object({
      adType: z.enum(["banner", "listing"]),
    }))
    .query(async ({ input }) => {
      const { adType } = input;
      const ads = await adsDataAccess.getAdsListByType(adType);
      return ads;
    }),
});
