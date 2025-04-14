import { z } from "zod";
import { zPublishStatusEnum, zSearchSchema } from "./common";
import { zTagSchema } from "./tags";
// 枚举类型定义
export const zAppTypeEnum = z.enum(["client", "server", "application"]);
export const zAppSourceEnum = z.enum(["automatic", "submitted", "admin"]);
export const zAppStatusEnum = z.enum(["pending", "approved", "rejected", "archived"]);
export const zAppSubmissionStatusEnum = z.enum(["pending", "approved", "rejected", "in_review"]);

export type AppType = z.infer<typeof zAppTypeEnum>;
export type AppSource = z.infer<typeof zAppSourceEnum>;
export type AppStatus = z.infer<typeof zAppStatusEnum>;
export type AppSubmissionStatus = z.infer<typeof zAppSubmissionStatusEnum>;

// 应用创建
export const zCreateAppSchema = z.object({
  slug: z.string().min(1, "Slug不能为空"),
  name: z.string().min(1, "名称不能为空"),
  description: z.string().min(1, "描述不能为空"),
  longDescription: z.string().optional(),
  type: zAppTypeEnum,
  icon: z.string().optional(),
  website: z.string().url("网站格式不正确").optional().or(z.literal("")),
  github: z.string().url("GitHub链接格式不正确").optional().or(z.literal("")),
  docs: z.string().url("文档链接格式不正确").optional().or(z.literal("")),
  version: z.string().optional(),
  license: z.string().optional(),
  scenario: z.string().optional(),
  features: z.array(z.string()).optional(),
  tools: z.record(z.any()).optional(),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  banner: z.string().optional(),
  source: zAppSourceEnum.optional(),
  publishStatus: zPublishStatusEnum.optional(),
});

export const zAppSchema = zCreateAppSchema.extend({
  id: z.string(),
  slug: z.string().min(1, "Slug不能为空"),
  name: z.string().min(1, "名称不能为空"),
  description: z.string().min(1, "描述不能为空"),
  longDescription: z.string().optional().nullable(),
  type: zAppTypeEnum,
  icon: z.string().optional().nullable(),
  stars: z.number().int().optional(),
  website: z.string().url("网站格式不正确").optional().nullable().or(z.literal("")),
  github: z.string().url("GitHub链接格式不正确").optional().nullable().or(z.literal("")),
  docs: z.string().url("文档链接格式不正确").optional().nullable().or(z.literal("")),
  version: z.string().optional().nullable(),
  license: z.string().optional().nullable(),
  scenario: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  tools: z.record(z.any()).optional().nullable(),
  ownerId: z.string().optional().nullable(),
  ownerName: z.string().optional().nullable(),
  categoryIds: z.array(z.string()).optional().nullable(),
  tagIds: z.array(z.string()).optional().nullable(),
  banner: z.string().optional().nullable(),
  source: zAppSourceEnum.optional().default("admin"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 应用更新
export const zUpdateAppSchema = z.object({
  id: z.string(),
  slug: z.string().min(1, "Slug不能为空").optional(),
  name: z.string().min(1, "名称不能为空").optional(),
  description: z.string().min(1, "描述不能为空").optional(),
  longDescription: z.string().optional(),
  type: zAppTypeEnum.optional(),
  source: zAppSourceEnum.optional(),
  status: zAppStatusEnum.optional(),
  analysed: z.boolean().optional(),
  icon: z.string().optional(),
  website: z.string().url("网站格式不正确").optional(),
  github: z.string().url("GitHub链接格式不正确").optional(),
  docs: z.string().url("文档链接格式不正确").optional(),
  version: z.string().optional(),
  license: z.string().optional(),
  featured: z.boolean().optional(),
  scenario: z.string().optional(),
  forks: z.number().int().optional(),
  issues: z.number().int().optional(),
  pullRequests: z.number().int().optional(),
  contributors: z.number().int().optional(),
  lastCommit: z.date().optional(),
  supportedServers: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  tools: z.record(z.any()).optional(),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
  verified: z.boolean().optional(),
});

// 应用搜索
export const zSearchAppsSchema = zSearchSchema.extend({
  type: zAppTypeEnum.optional(),
  source: zAppSourceEnum.optional(),
  status: zAppStatusEnum.optional(),
  analysed: z.boolean().optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  ownerId: z.string().optional(),
});

export type App = z.infer<typeof zAppSchema>;
export type CreateApp = z.infer<typeof zCreateAppSchema>;
export type UpdateApp = z.infer<typeof zUpdateAppSchema>;
export type SearchApps = z.infer<typeof zSearchAppsSchema>;



/**
 * 以下为 web 端使用的类型定义
 * 
 */

export const zMcpAppSchema = zAppSchema.extend({
  upvotes: z.number().int().optional(),
  status: zAppSubmissionStatusEnum.optional(),
  tags: z.array(zTagSchema),
});

export type McpApp = z.infer<typeof zMcpAppSchema>;

// 服务器工具类型
export const ServerToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  usage: z.string().optional(),
  examples: z.array(z.string()).optional(),
  parameters: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        description: z.string(),
        required: z.boolean().optional(),
        default: z.union([z.string(), z.number(), z.boolean()]).optional(),
      }),
    )
    .optional(),
  returns: z
    .object({
      type: z.string(),
      description: z.string(),
    })
    .optional(),
})
export type ServerTool = z.infer<typeof ServerToolSchema>