import { usersDataAccess } from "@repo/db/database/admin";
import {
  zCreateUserSchema,
  zSearchUsersSchema,
  zUpdateUserSchema,
} from "@repo/db/types";
import { z } from "zod";
import { adminProcedure, router } from "../../trpc";

export const usersRouter = router({
  // 创建用户
  create: adminProcedure
    .input(zCreateUserSchema)
    .mutation(async ({ input }) => {
      return usersDataAccess.create(input);
    }),

  // 更新用户
  update: adminProcedure
    .input(zUpdateUserSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return usersDataAccess.update(id, data);
    }),

  // 获取用户
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return usersDataAccess.getById(input.id);
    }),

  // 搜索用户
  search: adminProcedure
    .input(zSearchUsersSchema)
    .query(async ({ input }) => {
      return usersDataAccess.search(input);
    }),

  // 删除用户
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return usersDataAccess.delete(input.id);
    }),
}); 