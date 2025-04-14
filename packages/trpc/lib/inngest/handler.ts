import { analyzeRepositoryStack } from './anaylyser';
import { inngest } from './client';
import type { WebsiteContentStartEvent, GithubRepoStartEvent } from './client';
import { appAnalysisHistoryDataAccess } from '@repo/db/database/admin';

// 内容抓取开始事件
export const handleWebsiteContentStarted = inngest.createFunction(
  { id: 'handle-website-content-started' },
  { event: 'website-content/start' },
  async ({ event, step }: { event: { data: WebsiteContentStartEvent }, step: any }) => {
    const { jobId, appId, userId, website, status } = event.data;
    const startTime = Date.now();

    try {
      // 更新任务状态为进行中
      await step.run('website-content-status', async () => {
        return await appAnalysisHistoryDataAccess.updateStatus(jobId, {
          status: 'processing',
          startTime: new Date(),
          id: jobId
        });
      });

      // 这里需要真实的抓取并分析网站内容
      const result = await appAnalysisHistoryDataAccess.updateStatus(jobId, {
        status: 'completed',
        endTime: new Date(),
        id: jobId
      });

      const duration = Date.now() - startTime;
      // 发送推送完成事件
      await step.run('website-content-completed', async () => {
        await inngest.send({
          name: 'website-content/end',
          data: {
            jobId,
            status: 'completed',
            message: '网站内容抓取完成'
          },
        });
      });

    } catch (error) {
      const duration = Date.now() - startTime;

      // 发送错误事件
      await step.run('send-error-event', async () => {
        await inngest.send({
          name: 'website-content/end',
          data: {
            jobId,
            status: 'failed',
            error: error instanceof Error ? error.message : '未知错误'
          },
        });
      });

      // 更新任务状态为失败
      await step.run('update-job-status-failed', async () => {
        return await appAnalysisHistoryDataAccess.updateStatus(jobId, {
          status: 'failed',
          endTime: new Date(),
          error: error instanceof Error ? error.message : '未知错误',
          id: jobId
        });
      });
    }
  }
);

// 处理github仓库开始事件
export const handleGithubRepoStartProgress = inngest.createFunction(
  { id: 'handle-github-repo-start' },
  { event: 'github-repo/start' },
  async ({ event, step }: { event: { data: GithubRepoStartEvent }, step: any }) => {
    const { jobId, status } = event.data;
    console.info("[api] [inngest] [handlers.ts] [handleGithubRepoStartProgress] event", event)
    try {
      // 更新任务状态为进行中
      await step.run('website-content-status', async () => {
        return await appAnalysisHistoryDataAccess.updateStatus(jobId, {
          status: 'processing',
          startTime: new Date(),
          id: jobId
        });
      });

      // 获取github仓库信息
      const { stack, repository } = await analyzeRepositoryStack(event.data.github);

      // 更新任务状态为完成
      await step.run('update-job-status-completed', async () => {
        return await appAnalysisHistoryDataAccess.updateStatus(jobId, {
          status: 'completed',
          endTime: new Date(),
          id: jobId
        });
      });

    } catch (error) {
      console.error("[api] [inngest] [handlers.ts] [handleGithubRepoStartProgress] error", error)
      await step.run('update-job-status-failed', async () => {
        return await appAnalysisHistoryDataAccess.updateStatus(jobId, {
          status: 'failed',
          endTime: new Date(),
          error: error instanceof Error ? error.message : '未知错误',
          id: jobId
        });
      });
    }
  }
);

