         
# monorepo nextjs 启动模板（App Router）

## 安装

首先，创建一个 PostgreSQL 数据库，然后配置你的环境变量。

你可以在[这里](https://www.better-auth.com/docs/installation#set-environment-variables)生成 `BETTER_AUTH_SECRET`。

```bash
BETTER_AUTH_SECRET=""
DATABASE_URL=""
```

然后使用 drizzle-kit 生成你的数据库模式并执行迁移。

```bash
npx @better-auth/cli generate
npx drizzle-kit generate
npx drizzle-kit migrate
```

## 特性：

[Better Auth](https://better-auth.com)

[Better Auth UI](https://better-auth-ui.com)

[Better Auth TanStack](https://github.com/daveyplate/better-auth-tanstack)

[TanStack Query](https://tanstack.com/query)

[shadcn/ui](https://ui.shadcn.com)

[TailwindCSS 4.x](https://tailwindcss.com)

[Drizzle ORM](https://orm.drizzle.team)

[PostgreSQL](https://postgresql.org)

[Biome](https://biomejs.dev)

[Next.js 15.x](https://nextjs.org)

[Turborepo](https://turbo.build)

[Inngest](https://github.com/inngest/inngest)

## Next.js

这是一个使用 [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) 引导的 [Next.js](https://nextjs.org) 项目。

## 开始使用

首先，运行开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

用浏览器打开 [http://localhost:3000](http://localhost:3000) 查看结果。

你可以通过修改 `app/page.tsx` 来开始编辑页面。当你编辑文件时，页面会自动更新。

本项目使用 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 来自动优化和加载 [Geist](https://vercel.com/font)，这是 Vercel 的一个新字体系列。

## 了解更多

要了解更多关于 Next.js 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 的特性和 API。
- [学习 Next.js](https://nextjs.org/learn) - 一个交互式的 Next.js 教程。

你可以查看 [Next.js GitHub 仓库](https://github.com/vercel/next.js) - 欢迎你的反馈和贡献！


        