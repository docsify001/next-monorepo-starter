import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./schema.ts",
  dialect: "postgresql",
  verbose: true,
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
