import { serve } from 'inngest/next';
import { handleWebsiteContentStarted } from '@/lib/inngest/handler';
import { inngest } from '@/lib/inngest/client';

if (!process.env.INNGEST_SIGNING_KEY) {
  console.warn('[Inngest] Warning: INNGEST_SIGNING_KEY is not set');
}

if (!process.env.INNGEST_BASE_URL) {
  console.warn('[Inngest] Warning: INNGEST_BASE_URL is not set');
}

// 创建 Inngest 服务器
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleWebsiteContentStarted,
  ],
}); 