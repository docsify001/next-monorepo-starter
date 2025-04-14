import { claimsDataAccess } from "@repo/db/database/admin";
import {
  zCreateClaimSchema,
  zSearchClaimsSchema,
  zUpdateClaimSchema,
} from "@repo/db/types";
import { adminProcedure, router } from "../../trpc";
import { z } from "zod";

export const claimsRouter = router({
  // 创建声明
  create: adminProcedure
    .input(zCreateClaimSchema)
    .mutation(async ({ input }) => {
      return claimsDataAccess.create(input);
    }),

  // 更新声明
  update: adminProcedure
    .input(zUpdateClaimSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return claimsDataAccess.update(id, data);
    }),

  // 获取声明
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return claimsDataAccess.getById(input.id);
    }),

  // 搜索声明
  search: adminProcedure
    .input(zSearchClaimsSchema)
    .query(async ({ input }) => {
      return claimsDataAccess.search(input);
    }),

  // 删除声明
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return claimsDataAccess.delete(input.id);
    }),
}); 