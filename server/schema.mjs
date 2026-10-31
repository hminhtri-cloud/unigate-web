import { pool } from './db.mjs';
export async function migrate() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS universities (id VARCHAR(20) PRIMARY KEY, data JSON NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS majors (id VARCHAR(80) PRIMARY KEY, university_id VARCHAR(20) NOT NULL, data JSON NOT NULL, FOREIGN KEY (university_id) REFERENCES universities(id))`,
    `CREATE TABLE IF NOT EXISTS questions (id INT PRIMARY KEY, group_code CHAR(1) NOT NULL, content TEXT NOT NULL, version VARCHAR(30) NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(254) NOT NULL UNIQUE, name VARCHAR(80) NOT NULL, password_hash VARCHAR(256) NOT NULL, school VARCHAR(120) NOT NULL DEFAULT '', grade VARCHAR(20) NOT NULL DEFAULT '12', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS sessions (token_hash CHAR(64) PRIMARY KEY, user_id INT NOT NULL, expires_at DATETIME NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS results (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, request_id CHAR(36) NOT NULL, answers JSON NOT NULL, scores JSON NOT NULL, code CHAR(3) NOT NULL, version VARCHAR(30) NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY submission (user_id, request_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS drafts (user_id INT PRIMARY KEY, answers JSON NOT NULL, version VARCHAR(30) NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS scores (user_id INT PRIMARY KEY, subjects JSON NOT NULL, dgnl DECIMAL(6,2) NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS wishes (user_id INT NOT NULL, major_id VARCHAR(80) NOT NULL, position INT NOT NULL, note VARCHAR(500) NOT NULL DEFAULT '', PRIMARY KEY (user_id, major_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (major_id) REFERENCES majors(id))`,
  ];
  for (const sql of statements) await pool.query(sql);
}
