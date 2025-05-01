import { router } from "../trpc";
import { apiKeysAppRouter } from "./apiKeys";

export const appRouter = router({
  apiKeys: apiKeysAppRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;