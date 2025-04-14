
import { createId } from "@paralleldrive/cuid2"
import { db } from "../index"
import * as schema from "../schema"

async function main() {
  console.log("🌱 开始初始化数据库...")

  // 清空现有数据（谨慎使用，仅用于开发环境）
  await clearDatabase()

  // 创建测试用户
  const userId = await createTestUser()

  console.log("✅ 数据库初始化完成！")
}

async function clearDatabase() {
  console.log("🧹 清空现有数据...")

  // 按照依赖关系顺序删除数据
  await db.delete(schema.sessions)
  await db.delete(schema.accounts)
  await db.delete(schema.users)
}

async function createTestUser() {
  console.log("👤 创建测试用户...")

  const userId = createId()

  await db.insert(schema.users).values({
    id: userId,
    name: "测试用户",
    email: "test@example.com",
    emailVerified: new Date(),
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return userId
}

// 执行初始化
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("初始化失败:", error)
    process.exit(1)
  })

