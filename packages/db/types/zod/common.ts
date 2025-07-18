import { z } from "zod";

// Base Schemas
export const zBaseEntitySchema = z.object({
  id: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});


// 通用分页查询参数
export const zPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// 通用排序参数
export const zSortSchema = z.object({
  field: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

// 通用搜索参数
export const zSearchSchema = z.object({
  query: z.string().optional(),
  ...zPaginationSchema.shape,
  ...zSortSchema.shape,
});

// 资产类型枚举
export const zAssetTypeEnum = z.enum(["unknown", "avatar", "banner", "icon", "logo", "image", "document"])

export const zPublishStatusEnum = z.enum(["online", "offline"])

export type PublishStatus = z.infer<typeof zPublishStatusEnum>
export type Pagination = z.infer<typeof zPaginationSchema>;
export type Sort = z.infer<typeof zSortSchema>;
export type Search = z.infer<typeof zSearchSchema>;

export type AssetType = z.infer<typeof zAssetTypeEnum>