import { pool } from "./db.mjs";
import { migrate } from "./schema.mjs";
import { universities, majors } from "../data/catalog.mjs";
import { questions, questionVersion } from "../data/questions.mjs";
await migrate();
const c = await pool.getConnection();
try {
  await c.beginTransaction();
  for (const university of universities)
    await c.execute(
      "INSERT INTO universities (id,data) VALUES (?,?) ON DUPLICATE KEY UPDATE data=VALUES(data)",
      [university.id, JSON.stringify(university)],
    );
  for (const major of majors)
    await c.execute(
      "INSERT INTO majors (id,university_id,data) VALUES (?,?,?) ON DUPLICATE KEY UPDATE data=VALUES(data)",
      [major.id, major.universityId, JSON.stringify(major)],
    );
  for (const q of questions)
    await c.execute(
      "INSERT INTO questions (id,group_code,content,version) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE group_code=VALUES(group_code),content=VALUES(content),version=VALUES(version)",
      [q.id, q.group, q.content, questionVersion],
    );
  await c.commit();
  console.log(
    `Đã nạp ${universities.length} trường, ${majors.length} ngành/chương trình, ${questions.length} câu hỏi vào MySQL. Dữ liệu người dùng được giữ nguyên.`,
  );
} catch (error) {
  await c.rollback();
  throw error;
} finally {
  c.release();
  await pool.end();
}
