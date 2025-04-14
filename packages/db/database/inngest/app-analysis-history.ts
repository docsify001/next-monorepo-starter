import { AppAnalysisHistory, UpdateAppAnalysisHistory } from "@/lib/types/schema/app-analysis-history";
import { db } from "../db";
import { eq } from "drizzle-orm";
import * as schema from "@/database/schema";

export const appAnalysisHistoryDataAccess = {
	create: async (data: AppAnalysisHistory) => {
		const result = await db.insert(schema.appAnalysisHistory).values(data).returning();
		return result[0];
	},
	// 根据id获取应用分析历史记录，获取单条记录用get，获取多条记录用find
	getById: async (id: string) => {
		const result = await db.select().from(schema.appAnalysisHistory).where(eq(schema.appAnalysisHistory.id, id));
		return result[0];
	},

	/**
	 * 更新应用分析历史记录状态
	 * @param id 应用分析历史记录id
	 * @param data 更新数据
	 * @returns 更新后的应用分析历史记录
	 */
	updateStatus: async (id: string, data: UpdateAppAnalysisHistory) => {
		const result = await db.update(schema.appAnalysisHistory).set({
			...data,
			status: data.status,
			endTime: data.endTime,
		}).where(eq(schema.appAnalysisHistory.id, id)).returning();
		return result[0];
	},


}
