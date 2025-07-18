import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { accounts, users } from "../../schema";
import { zCreateUserSchema, zSearchUsersSchema, zUpdateUserSchema } from "../../types";
import { createId } from "@paralleldrive/cuid2";
/**
 * Fetch user by email.
 *
 * @param email - The user's email address.
 * @returns The user or null if not found.
 */
export async function getUserByEmail(email: string) {
  try {
    return await db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.email, email);
      },
    });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Could not fetch user by email");
  }
}

/**
 * Fetch user by ID.
 *
 * @param id - The user's ID.
 * @returns The user or null if not found.
 */
export async function getUserById(id: string) {
  try {
    return await db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.id, id);
      },
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Could not fetch user by ID");
  }
}

/**
 * Verify the user's email.
 *
 * @param id - The user's ID.
 * @param email - The new email to set (optional).
 */
export async function verifyUserEmail(
  id: string,
  email?: string
) {
  console.info("[users.ts] [verifyUserEmail] 开始验证");
  const now = new Date();
  try {
    await db
      .update(users)
      .set({
        emailVerified: sql`now()`,
        email: email ? email : undefined,
      })
      .where(eq(users.id, id));
    console.info("[users.ts] [verifyUserEmail] 验证成功");
  } catch (error) {
    console.error("[users.ts] [verifyUserEmail] 验证失败", error);
    // throw new Error("Could not verify user email");
  }
}

/**
 * Create a new user.
 *
 * @param user - The user data.
 * @returns The newly created user or null if not created.
 */
export async function createUser(user: {
  email: string;
  password: string;
  name: string;
}) {
  const now = new Date();
  const [newUser] = await db
    .insert(users)
    .values({
      ...user,
      id: createId(), // 需要导入 createId
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .returning();
  return newUser ?? null;
}

export async function createUserByPhone(user: {
  phoneNumber: string; // 改为 phoneNumber 以匹配数据库 schema
  password: string;
  name: string;
}) {
  const now = new Date();
  const [newUser] = await db
    .insert(users)
    .values({
      ...user,
      id: createId(),
      email: `${user.phoneNumber}@starter.com`, // Provide a default value for email
      emailVerified: false,
      phoneNumberVerified: false,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .returning();
  return newUser ?? null;
}

/**
 * Update user's password.
 *
 * @param email - The user's email address.
 * @param password - The new password.
 */
export async function updateUserPassword(
  email: string,
  password: string
): Promise<void> {
  await db
    .update(users)
    .set({ password })
    .where(eq(users.email, email))
    .execute();
}

/**
 * Check if a user exists by ID.
 *
 * @param userId - The user's ID.
 * @returns True if user exists, otherwise false.
 */
export async function userExists(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return user !== null;
}

/**
 * Delete user and associated account data.
 *
 * @param userId - The user's ID.
 */
export async function deleteUserWithData(userId: string): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(accounts).where(eq(accounts.userId, userId));
      await tx.delete(users).where(eq(users.id, userId));
    });
  } catch (error) {
    console.error("Error deleting user with data:", error);
    throw new Error("Could not delete user with data");
  }
}

/**
 * Fetch user by phone number.
 *
 * @param phone - The user's phone number.
 * @returns The user or null if not found.
 */
export async function getUserByPhone(phone: string) {
  try {
    return await db.query.users.findFirst({
      where(fields, operators) {
        return operators.eq(fields.phoneNumber, phone);
      },
    });
  } catch (error) {
    console.error("Error fetching user by phone:", error);
    throw new Error("Could not fetch user by phone");
  }
}

// 用户数据访问模块
export const usersDataAccess = {
  // 创建用户
  create: async (data: typeof zCreateUserSchema._type) => {
    return db.insert(users).values({ ...data, id: data.id ?? createId() }).returning();
  },

  // 更新用户
  update: async (id: string, data: typeof zUpdateUserSchema._type) => {
    return db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
  },

  // 获取用户
  getById: async (id: string) => {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  // 搜索用户
  search: async (params: typeof zSearchUsersSchema._type) => {
    const { query, page = 1, limit = 10, field, order, banned, role } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(users.name, `%${query}%`),
          like(users.email, `%${query}%`)
        )
      );
    }

    if (banned !== undefined) {
      conditions.push(eq(users.banned, banned));
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    // 构建排序条件
    const orderBy = [];
    if (field) {
      const orderDirection = order === "desc" ? desc : asc;
      if (field === "name") orderBy.push(orderDirection(users.name));
      if (field === "email") orderBy.push(orderDirection(users.email));
      if (field === "createdAt") orderBy.push(orderDirection(users.createdAt));
    } else {
      // 默认按创建时间倒序
      orderBy.push(desc(users.createdAt));
    }

    // 执行查询
    const results = await db.query.users.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy,
      limit,
      offset,
    });

    // 获取总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = countResult[0]?.count ?? 0;

    return {
      data: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // 删除用户
  delete: async (id: string) => {
    return db.delete(users).where(eq(users.id, id)).returning();
  },
};