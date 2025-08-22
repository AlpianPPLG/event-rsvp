/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "event_rsvp_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool for better performance
const pool = mysql.createPool(dbConfig)

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function getUserById(userId: number) {
  try {
    const query = "SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = ?"
    const results = (await executeQuery(query, [userId])) as any[]
    return results.length > 0 ? results[0] : null
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    throw error
  }
}

export async function updateUser(userId: number, userData: { name?: string; email?: string; avatar_url?: string }) {
  try {
    const fields = []
    const values = []

    if (userData.name) {
      fields.push("name = ?")
      values.push(userData.name)
    }

    if (userData.email) {
      fields.push("email = ?")
      values.push(userData.email)
    }

    if (userData.avatar_url !== undefined) {
      fields.push("avatar_url = ?")
      values.push(userData.avatar_url)
    }

    if (fields.length === 0) {
      throw new Error("No fields to update")
    }

    values.push(userId)

    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`
    await executeQuery(query, values)

    // Return updated user data
    return await getUserById(userId)
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

export default pool
