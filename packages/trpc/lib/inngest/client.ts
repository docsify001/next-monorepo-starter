import { EventSchemas, Inngest } from 'inngest';
import { z } from 'zod';

/**
 * 网站内容开始事件
 */
const WebsiteContentStartEventSchema = z.object({
  jobId: z.string(), // 抓取的任务id
  appId: z.string(),   //应用id
  userId: z.string(),  //发布人
  website: z.string(), //要抓取的网址
  status: z.string(),
});

/**
 * 网站内容结束事件
 */
const WebsiteContentEndEventSchema = z.object({
  jobId: z.string(), // 抓取的任务id
  status: z.string(), // 抓取的状态
  message: z.string().optional(), // 抓取的消息
  error: z.string().optional(), // 抓取的错误
  detail: z.object({
    favicon: z.string(),
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
    banner: z.string(),
    tags: z.array(z.string()),
    duration: z.number().optional(),
  }).optional(),
});

/**
 * 抓取github仓库开始事件
 */
const GithubRepoStartEventSchema = z.object({
  jobId: z.string(), // 抓取的任务id
  appId: z.string().optional(),   //应用id
  userId: z.string(),  //发布人
  github: z.string(), //要抓取的网址
  status: z.string(),
});

/**
 * 抓取github仓库结束事件
 */
const GithubRepoEndEventSchema = z.object({
  jobId: z.string(), // 抓取的任务id
  status: z.string(), // 抓取的状态
  message: z.string().optional(), // 抓取的消息
  error: z.string().optional(), // 抓取的错误
  detail: z.object({
    favicon: z.string(),
    version: z.string(), //当前版本
    features: z.array(z.string()), //特性
    readme: z.string(), //readme.md内容
    license: z.string(), //license
    stars: z.number(), //star数量
    forks: z.number(), //fork数量
    issues: z.number(), //issue数量
    pullRequests: z.number(), //pull request数量
    contributors: z.number(), //贡献者数量
    languages: z.array(z.string()),
    topics: z.array(z.string()),
    lastCommit: z.string(),
    lastCommitMessage: z.string(),
    lastCommitAuthor: z.string(),
    lastCommitDate: z.string(),
  }).optional(),
});

// 定义事件模式
export const eventSchemas = new EventSchemas().fromZod({
  'website-content/start': {
    data: WebsiteContentStartEventSchema,
  },
  'website-content/end': {
    data: WebsiteContentEndEventSchema,
  },
  'github-repo/start': {
    data: GithubRepoStartEventSchema,
  },
  'github-repo/end': {
    data: GithubRepoEndEventSchema,
  },
  // 用户提交应用后，需要进行github抓取
  'apps-submission-scraper/start': {
    data: GithubRepoStartEventSchema
  }
});

// 创建 inngest 客户端
export const inngest = new Inngest({
  id: 'apps-content-scraper',
  schemas: eventSchemas,
});

// 导出事件类型
export type WebsiteContentStartEvent = z.infer<typeof WebsiteContentStartEventSchema>;
export type WebsiteContentEndEvent = z.infer<typeof WebsiteContentEndEventSchema>;
export type GithubRepoStartEvent = z.infer<typeof GithubRepoStartEventSchema>;
export type GithubRepoEndEvent = z.infer<typeof GithubRepoEndEventSchema>;



