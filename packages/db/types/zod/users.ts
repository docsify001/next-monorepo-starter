import { z } from "zod";
import { zBaseEntitySchema, zSearchSchema } from "./common";

// 枚举类型定义
export const zUserRoleEnum = z.enum(["user", "admin"]);
export const zProviderTypeEnum = z.enum(["oauth", "email", "credentials"]);

// 用户搜索
export const zSearchUsersSchema = zSearchSchema.extend({
  banned: z.boolean().optional(),
  role: zUserRoleEnum.optional(),
});

// 用户创建
export const zCreateUserSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  phoneNumber: z.string().optional(),
  image: z.string().optional(),
  role: zUserRoleEnum.default("user"),
  emailVerified: z.boolean().default(false),
  phoneNumberVerified: z.boolean().default(false),
  banned: z.boolean().default(false),
  bannedReason: z.string().optional(),
  banExpires: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// 用户更新
export const zUpdateUserSchema = zCreateUserSchema.partial();

export const zUserSchema = zCreateUserSchema;

export type User = z.infer<typeof zUserSchema>;
export type CreateUser = z.infer<typeof zCreateUserSchema>;
export type UpdateUser = z.infer<typeof zUpdateUserSchema>;
