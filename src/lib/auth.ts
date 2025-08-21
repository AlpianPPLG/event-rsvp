import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

export interface User {
  id: number
  name: string
  email: string
  role: "user" | "admin"
  avatar_url?: string
  created_at: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const results = (await executeQuery(
      "SELECT id, name, email, role, avatar_url, created_at FROM users WHERE email = ?",
      [email],
    )) as any[]

    return results.length > 0 ? results[0] : null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const results = (await executeQuery(
      "SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?",
      [id],
    )) as any[]

    return results.length > 0 ? results[0] : null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function createUser(name: string, email: string, password: string): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(password)
    const result = (await executeQuery("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ])) as any

    if (result.insertId) {
      return getUserById(result.insertId)
    }
    return null
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}
