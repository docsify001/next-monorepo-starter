// ===== 支付相关 =====
import { z } from "zod";
import { zInvoiceTypeEnum, zInvoiceStatusEnum, zPaymentStatusEnum, zPaymentTypeEnum, zPaymentMethodEnum, zSearchSchema } from "./common";

// 支付创建
export const zCreatePaymentSchema = z.object({
  userId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().min(1, "描述不能为空"),
  invoiceType: zInvoiceTypeEnum,
  invoiceData: z.record(z.any()),
});

// 支付更新
export const zUpdatePaymentSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  description: z.string().min(1, "描述不能为空").optional(),
  invoiceType: zInvoiceTypeEnum.optional(),
  invoiceData: z.record(z.any()).optional(),
  status: zInvoiceStatusEnum.optional(),
});

// 支付查询
export const getPaymentSchema = z.object({
  id: z.string(),
});

// 支付搜索
export const zSearchPaymentsSchema = zSearchSchema.extend({
  status: zPaymentStatusEnum.optional(),
  userId: z.string().optional(),
  invoiceType: zInvoiceTypeEnum.optional(),
  method: zPaymentMethodEnum.optional(),
  type: zPaymentTypeEnum.optional(),
});


export const zPaymentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["ad", "subscription", "service", "other"]),
  relatedId: z.string().optional(),
  amount: z.number().positive("金额必须为正数"),
  currency: z.string().default("CNY").nullish(),
  method: z.enum(["wechat", "alipay", "bank_transfer"]),
  transactionId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: zPaymentStatusEnum,
  completedAt: z.date().optional(),
  refundedAt: z.date().optional(),
  refundReason: z.string().optional(),
  invoiceType: zInvoiceTypeEnum,
  invoiceData: z.record(z.any()),
});



// 支付相关类型
export type Payment = z.infer<typeof zPaymentSchema>;
export type PaymentCreate = z.infer<typeof zCreatePaymentSchema>;
export type PaymentUpdate = z.infer<typeof zUpdatePaymentSchema>;
export type PaymentSearch = z.infer<typeof zSearchPaymentsSchema> & {
  field?: "id" | "amount" | "status" | "createdAt" | "updatedAt";
};
