import 'dotenv/config';
import mysql from 'mysql2/promise';
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1', port: Number(process.env.MYSQL_PORT || (process.env.VERCEL === '1' ? 3306 : 3310)),
  user: process.env.MYSQL_USER || 'unigate', password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'unigate', charset: 'utf8mb4',
  ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  connectionLimit: process.env.VERCEL === '1' ? 2 : 10, timezone: 'Z', decimalNumbers: true,
});
export async function query(sql, params = []) { const [rows] = await pool.execute(sql, params); return rows; }
export const parseJson = value => typeof value === 'string' ? JSON.parse(value) : value;
