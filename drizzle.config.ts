import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // ✅ REQUIRED
  dbCredentials: {
    url: process.env.DATABASE_URL!, // ✅ updated key
  },
} satisfies Config;
