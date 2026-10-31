import { writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
const path = new URL('../.env', import.meta.url);
try {
  await writeFile(path, `MYSQL_HOST=127.0.0.1\nMYSQL_PORT=3310\nMYSQL_DATABASE=unigate\nMYSQL_USER=unigate\nMYSQL_PASSWORD=${randomBytes(24).toString('hex')}\nMYSQL_ROOT_PASSWORD=${randomBytes(24).toString('hex')}\nPORT=3001\n`, { flag: 'wx', mode: 0o600 });
  console.log('Đã tạo .env với mật khẩu ngẫu nhiên cho MySQL riêng của UniGate.');
} catch (error) { if (error.code === 'EEXIST') console.log('.env đã tồn tại, giữ nguyên cấu hình.'); else throw error; }
