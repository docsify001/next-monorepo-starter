import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { phoneNumber } from "better-auth/plugins"
import { admin } from "better-auth/plugins"
import { emailOTP } from "better-auth/plugins"

import { db } from "@repo/db"
import * as schema from "@repo/db/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema
  }),
  emailAndPassword: {
    enabled: true
  },
  plugins: [
    admin(),
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }, request) => {
        // 这里实现发送短信验证码的逻辑
        // 可以使用第三方短信服务，如阿里云、腾讯云等
        console.info(`发送验证码 ${code} 到手机号 ${phoneNumber}`);
        // 实际项目中需要替换为真实的短信发送逻辑
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => {
          return `${phoneNumber}@my-site.com`;
        }
      }
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Implement the sendVerificationOTP method to send the OTP to the user's email address
      },
    }),
  ],
}) as ReturnType<typeof betterAuth>
