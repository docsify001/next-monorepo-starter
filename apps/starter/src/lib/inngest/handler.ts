import { inngest } from './client';
import type { WebsiteContentStartEvent } from './client';

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
        console.info("[api] [inngest] [handlers.ts] [handleWebsiteContentStarted] event", event)
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
        console.info("[api] [inngest] [handlers.ts] [handleWebsiteContentStarted] update-job-status-failed", error)
      });
    }
  }
);