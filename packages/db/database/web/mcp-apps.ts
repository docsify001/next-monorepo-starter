import { apps, appCategories, appTags, categories, tags } from "@repo/db/schema";
import { and, count, eq, gte, like, SQL } from "drizzle-orm";
import { db } from "index";
import { AppType } from "types/zod/apps";


export const mcpAppsDataAccess = {
  getByTypeCategoryAndTag: async (params: { type: AppType; category?: string; tag?: string }) => {
    const { type, category, tag } = params;

    let conditions: SQL[] = [eq(apps.type, type)];

    // 如果指定了分类，添加分类过滤
    if (category) {
      conditions.push(eq(categories.slug, category));
    }

    // 如果指定了标签，添加标签过滤
    if (tag) {
      conditions.push(eq(tags.slug, tag));
    }

    const query = db
      .selectDistinct({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        type: apps.type,
        icon: apps.icon,
        website: apps.website,
        github: apps.github,
        stars: apps.stars,
        verified: apps.verified,
      })
      .from(apps)
      .leftJoin(appCategories, eq(apps.id, appCategories.appId))
      .leftJoin(categories, eq(appCategories.categoryId, categories.id))
      .leftJoin(appTags, eq(apps.id, appTags.appId))
      .leftJoin(tags, eq(appTags.tagId, tags.id))
      .where(and(...conditions));

    return query;
  },

  /**
   * 根据appId、分类、标签、查询条件查询应用。这里主要是用于搜索应用
   * @param params 
   * @returns 
   */
  getAppsBySearch: async (params: { appId?: string; limit?: number; category?: string; tag?: string; query?: string }) => {
    const { appId, limit, category, tag, query } = params;

    let conditions: SQL[] = [];

    if (appId) {
      conditions.push(eq(apps.id, appId));
    }

    if (category) {
      conditions.push(eq(categories.slug, category));
    }

    if (tag) {
      conditions.push(eq(tags.slug, tag));
    }

    if (query) {
      conditions.push(like(apps.name, `%${query}%`));
    }

    const queryDB = db
      .selectDistinct({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        type: apps.type,
        icon: apps.icon,
        website: apps.website,
        github: apps.github,
        stars: apps.stars,
        verified: apps.verified,
      })
      .from(apps)
      .leftJoin(appCategories, eq(apps.id, appCategories.appId))
      .leftJoin(categories, eq(appCategories.categoryId, categories.id))
      .leftJoin(appTags, eq(apps.id, appTags.appId))
      .leftJoin(tags, eq(appTags.tagId, tags.id))
      .where(and(...conditions));

    return queryDB;
  },

  /**
   * 根据slug查询应用
   * @param slug 应用slug
   * @returns 应用信息
   */
  getBySlug: async (slug: string) => {
    // 查询应用基本信息
    const appData = await db.select().from(apps).where(eq(apps.slug, slug)).limit(1);

    if (!appData || appData.length === 0) {
      return null;
    }

    // 由于我们已经检查了 appData 不为空且长度大于0，所以 app 一定存在
    const app = appData[0]!;

    // 查询应用分类
    const appCategoriesData = await db
      .select({
        category: categories,
      })
      .from(appCategories)
      .leftJoin(categories, eq(appCategories.categoryId, categories.id))
      .where(eq(appCategories.appId, app.id));

    // 查询应用标签
    const appTagsData = await db
      .select({
        tag: tags,
      })
      .from(appTags)
      .leftJoin(tags, eq(appTags.tagId, tags.id))
      .where(eq(appTags.appId, app.id));

    // 整理返回数据
    return {
      ...app,
      categories: appCategoriesData.map((item) => item.category),
      tags: appTagsData.map((item) => item.tag),
    };
  },

  getAppsByTagId: async (tagId: string) => {
    const query = db
      .select({
        id: apps.id,
        slug: apps.slug,
        name: apps.name,
        description: apps.description,
        type: apps.type,
        icon: apps.icon,
        website: apps.website,
        github: apps.github,
        stars: apps.stars,
        verified: apps.verified,
      })
      .from(apps)
      .innerJoin(appTags, eq(apps.id, appTags.appId))
      .where(eq(appTags.tagId, tagId));

    return query;
  },

  getCount: async () => {
    const totalCount = await db.select({ count: count() }).from(apps).where(and(eq(apps.status, "approved"), eq(apps.publishStatus, "online")));
    return totalCount[0]?.count ?? 0;
  },

  getNewCount: async () => {
    const newCount = await db.select({ count: count() }).from(apps).where(and(eq(apps.status, "approved"), eq(apps.publishStatus, "online"), gte(apps.createdAt, subDays(new Date(), 7))));
    return newCount[0]?.count ?? 0;
  },
};

function subDays(arg0: Date, arg1: number) {
  return new Date(arg0.getTime() - arg1 * 24 * 60 * 60 * 1000);
}
