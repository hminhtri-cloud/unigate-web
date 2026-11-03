import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { randomBytes, createHash, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { query, pool, parseJson } from './db.mjs';
import { questionVersion, questionNotice } from '../data/questions.mjs';
import { calculateResult, combinationScores, fields, interestFit, subjects } from '../shared/domain.mjs';

const scrypt = promisify(scryptCallback);
const digest = value => createHash('sha256').update(value).digest('hex');
const fail = (status, message) => Object.assign(new Error(message), { status });
const passwordSchema = z.string().min(8, 'Mật khẩu cần ít nhất 8 ký tự.').max(128);
const emailSchema = z.string().trim().toLowerCase().email('Email chưa đúng định dạng.').max(254);
const safeUser = user => ({ id: user.id, email: user.email, name: user.name, school: user.school, grade: user.grade });
const cookieToken = req => (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('unigate_session='))?.slice(16) || '';
const publicResult = row => ({ id: row.id, scores: parseJson(row.scores), answers: parseJson(row.answers), code: row.code, version: row.version, createdAt: row.created_at });
const answerSchema = z.record(z.string().regex(/^([1-9]|[1-5][0-9]|60)$/), z.number().int().min(1).max(5));
const subjectSchema = z.object(Object.fromEntries(Object.keys(subjects).map(key => [key, z.number().min(0).max(10).optional()]))).strict();

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${(await scrypt(password, salt, 64)).toString('hex')}`;
}
async function verifyPassword(password, encoded) {
  const [salt, hash] = encoded.split(':');
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}
async function createSession(res, id) {
  const token = randomBytes(32).toString('hex');
  await query('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY))', [digest(token), id]);
  res.cookie('unigate_session', token, { httpOnly: true, sameSite: 'strict', secure: process.env.VERCEL === '1' || process.env.COOKIE_SECURE === 'true', maxAge: 604800000, path: '/' });
}
async function authenticate(req, res, next) {
  const rows = await query('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()', [digest(cookieToken(req))]);
  if (!rows[0]) throw fail(401, 'Vui lòng đăng nhập để tiếp tục.');
  req.user = rows[0]; next();
}
async function transactionForUser(userId, work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('SELECT id FROM users WHERE id=? FOR UPDATE', [userId]);
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (process.env.VERCEL === '1') app.set('trust proxy', 1);
  app.use((req,res,next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (req.path.startsWith('/api')) res.setHeader('Cache-Control', 'no-store');
    if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
      if (req.headers['sec-fetch-site'] === 'cross-site') return res.status(403).json({ error: 'Yêu cầu phải đến từ UniGate.' });
      if (!req.is('application/json')) return res.status(415).json({ error: 'Yêu cầu cần định dạng JSON.' });
      if (req.headers.origin && ![`http://${req.headers.host}`, `https://${req.headers.host}`, 'http://localhost:5185','http://127.0.0.1:5185'].includes(req.headers.origin)) return res.status(403).json({ error: 'Nguồn yêu cầu không hợp lệ.' });
    }
    next();
  });
  app.use(express.json({ limit: '32kb' }));
  const authLimiter = rateLimit({ windowMs: 15*60*1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Bạn thử quá nhiều lần. Hãy thử lại sau 15 phút.' } });
  app.get('/api/health', async (req,res) => { await query('SELECT 1'); res.json({ ok: true, database: 'MySQL' }); });
  app.post('/api/auth/register', authLimiter, async (req,res) => {
    const body = z.object({ name: z.string().trim().min(2).max(80), email: emailSchema, password: passwordSchema }).parse(req.body);
    const hash = await hashPassword(body.password);
    let result;
    try { result = await query('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)', [body.name, body.email, hash]); }
    catch (error) { if (error.code === 'ER_DUP_ENTRY') throw fail(409,'Email này đã có tài khoản.'); throw error; }
    await createSession(res, result.insertId);
    res.status(201).json(safeUser((await query('SELECT * FROM users WHERE id=?',[result.insertId]))[0]));
  });
  app.post('/api/auth/login', authLimiter, async (req,res) => {
    const body = z.object({ email: emailSchema, password: z.string().min(1).max(128) }).parse(req.body);
    const [user] = await query('SELECT * FROM users WHERE email=?', [body.email]);
    if (!user || !await verifyPassword(body.password, user.password_hash)) throw fail(401,'Email hoặc mật khẩu chưa đúng.');
    await createSession(res,user.id); res.json(safeUser(user));
  });
  app.post('/api/auth/logout', async (req,res) => {
    await query('DELETE FROM sessions WHERE token_hash=?', [digest(cookieToken(req))]);
    res.clearCookie('unigate_session',{ path:'/' }); res.json({ ok:true });
  });
  app.get('/api/catalog', async (req,res) => {
    const universities = (await query('SELECT data FROM universities ORDER BY id')).map(row => parseJson(row.data));
    const majors = (await query('SELECT data FROM majors ORDER BY id')).map(row => parseJson(row.data));
    res.json({ universities, majors, fields, updatedAt: '2026-10-31' });
  });
  app.use('/api',authenticate);
  app.get('/api/me', (req,res) => res.json(safeUser(req.user)));
  app.put('/api/me', async (req,res) => {
    const body = z.object({ name:z.string().trim().min(2).max(80), school:z.string().trim().max(120), grade:z.enum(['10','11','12','other']) }).parse(req.body);
    await query('UPDATE users SET name=?,school=?,grade=? WHERE id=?',[body.name,body.school,body.grade,req.user.id]); res.json({ ...safeUser(req.user), ...body });
  });
  app.put('/api/me/password', authLimiter, async (req,res) => {
    const body = z.object({ currentPassword:z.string().max(128), newPassword:passwordSchema }).parse(req.body);
    if (!await verifyPassword(body.currentPassword,req.user.password_hash)) throw fail(400,'Mật khẩu hiện tại chưa đúng.');
    const hash = await hashPassword(body.newPassword);
    await transactionForUser(req.user.id, async c => {
      await c.execute('UPDATE users SET password_hash=? WHERE id=?',[hash,req.user.id]);
      await c.execute('DELETE FROM sessions WHERE user_id=?',[req.user.id]);
    });
    await createSession(res,req.user.id); res.json({ ok:true });
  });
  app.get('/api/questions', async (req,res) => {
    const rows = await query('SELECT id,content FROM questions WHERE version=? ORDER BY id',[questionVersion]);
    res.json({ questions:rows, version:questionVersion, notice:questionNotice });
  });
  app.get('/api/draft',async (req,res) => {
    const [row] = await query('SELECT answers,version FROM drafts WHERE user_id=?',[req.user.id]);
    res.json(row && row.version===questionVersion ? parseJson(row.answers) : {});
  });
  app.put('/api/draft',async (req,res) => {
    const body = z.object({ answers:answerSchema, version:z.literal(questionVersion) }).parse(req.body);
    await query('INSERT INTO drafts (user_id,answers,version) VALUES (?,?,?) ON DUPLICATE KEY UPDATE answers=VALUES(answers),version=VALUES(version)',[req.user.id,JSON.stringify(body.answers),questionVersion]); res.json({ ok:true });
  });
  app.delete('/api/draft',async (req,res) => { await query('DELETE FROM drafts WHERE user_id=?',[req.user.id]); res.json({ ok:true }); });
  app.post('/api/results', async (req,res) => {
    const body = z.object({ answers:answerSchema, version:z.literal(questionVersion), requestId:z.string().uuid() }).parse(req.body);
    const questions = (await query('SELECT id,group_code FROM questions WHERE version=? ORDER BY id',[questionVersion])).map(q => ({ id:q.id,group:q.group_code }));
    if (questions.length !== 60 || Object.keys(body.answers).length !== 60) throw fail(400,'Cần hoàn thành đủ 60 câu hỏi.');
    const calculated = calculateResult(questions,body.answers);
    const result = await transactionForUser(req.user.id,async c => {
      await c.execute('INSERT INTO results (user_id,request_id,answers,scores,code,version) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE request_id=VALUES(request_id)',[req.user.id,body.requestId,JSON.stringify(body.answers),JSON.stringify(calculated.scores),calculated.code,questionVersion]);
      await c.execute('DELETE FROM drafts WHERE user_id=?',[req.user.id]);
      const [rows] = await c.execute('SELECT * FROM results WHERE user_id=? AND request_id=?',[req.user.id,body.requestId]); return rows[0];
    });
    res.status(201).json(publicResult(result));
  });
  app.get('/api/results',async (req,res) => res.json((await query('SELECT * FROM results WHERE user_id=? ORDER BY id DESC',[req.user.id])).map(publicResult)));
  app.get('/api/recommendations',async (req,res) => {
    const [result] = await query('SELECT scores FROM results WHERE user_id=? ORDER BY id DESC LIMIT 1',[req.user.id]);
    if (!result) return res.json([]);
    const scores = parseJson(result.scores);
    const majors = (await query('SELECT data FROM majors')).map(row => parseJson(row.data));
    res.json(majors.map(major => ({ id:major.id, fit:interestFit(scores,major.holland), reason:`Gợi ý biên tập dựa trên nhóm ${major.holland.split('').join(' – ')}; không phải xác suất trúng tuyển.` })).sort((a,b) => b.fit-a.fit || a.id.localeCompare(b.id)));
  });
  app.get('/api/scores',async (req,res) => {
    const [row] = await query('SELECT subjects,dgnl FROM scores WHERE user_id=?',[req.user.id]);
    const values = row ? parseJson(row.subjects) : {};
    res.json({ subjects:values,dgnl:row?.dgnl ?? null, combinations:combinationScores(values) });
  });
  app.put('/api/scores',async (req,res) => {
    const body = z.object({ subjects:subjectSchema, dgnl:z.number().min(0).max(1200).nullable() }).parse(req.body);
    await query('INSERT INTO scores (user_id,subjects,dgnl) VALUES (?,?,?) ON DUPLICATE KEY UPDATE subjects=VALUES(subjects),dgnl=VALUES(dgnl)',[req.user.id,JSON.stringify(body.subjects),body.dgnl]);
    res.json({ ...body, combinations:combinationScores(body.subjects) });
  });
  app.get('/api/wishes',async (req,res) => res.json(await query('SELECT major_id AS majorId,position,note FROM wishes WHERE user_id=? ORDER BY position,major_id',[req.user.id])));
  app.post('/api/wishes',async (req,res) => {
    const body = z.object({ majorId:z.string().max(80) }).parse(req.body);
    if (!(await query('SELECT id FROM majors WHERE id=?',[body.majorId])).length) throw fail(404,'Không tìm thấy ngành này.');
    await transactionForUser(req.user.id,async c => {
      const [rows] = await c.execute('SELECT major_id,position FROM wishes WHERE user_id=?',[req.user.id]);
      if (rows.some(row => row.major_id===body.majorId)) return;
      if (rows.length>=50) throw fail(400,'Bạn có thể lưu tối đa 50 nguyện vọng.');
      await c.execute('INSERT INTO wishes (user_id,major_id,position) VALUES (?,?,?)',[req.user.id,body.majorId,Math.max(0,...rows.map(r=>r.position))+1]);
    }); res.status(201).json({ ok:true });
  });
  app.put('/api/wishes/order',async (req,res) => {
    const { ids } = z.object({ ids:z.array(z.string().max(80)).max(50) }).parse(req.body);
    await transactionForUser(req.user.id,async c => {
      const [rows] = await c.execute('SELECT major_id FROM wishes WHERE user_id=?',[req.user.id]);
      if (ids.length!==rows.length || new Set(ids).size!==ids.length || rows.some(r=>!ids.includes(r.major_id))) throw fail(400,'Danh sách đã thay đổi. Vui lòng tải lại.');
      for (const [i,id] of ids.entries()) await c.execute('UPDATE wishes SET position=? WHERE user_id=? AND major_id=?',[i+1,req.user.id,id]);
    }); res.json({ ok:true });
  });
  app.put('/api/wishes/:id',async (req,res) => {
    const { note } = z.object({ note:z.string().max(500) }).parse(req.body);
    const result = await query('UPDATE wishes SET note=? WHERE user_id=? AND major_id=?',[note,req.user.id,req.params.id]);
    if (!result.affectedRows) throw fail(404,'Nguyện vọng không tồn tại.'); res.json({ ok:true });
  });
  app.delete('/api/wishes/:id',async (req,res) => { await query('DELETE FROM wishes WHERE user_id=? AND major_id=?',[req.user.id,req.params.id]); res.json({ ok:true }); });
  app.use('/api',(req,res) => res.status(404).json({ error:'Không tìm thấy API.' }));
  const dist = fileURLToPath(new URL('../dist/',import.meta.url));
  app.use(express.static(dist));
  app.get('/{*path}',(req,res) => res.sendFile(`${dist}/index.html`));
  app.use((error,req,res,next) => {
    if (error instanceof z.ZodError) return res.status(400).json({ error:'Thông tin chưa hợp lệ. Kiểm tra các trường đã nhập.', details:error.issues.map(x=>({ field:x.path.join('.'),message:x.message })) });
    if (error.type==='entity.parse.failed') return res.status(400).json({ error:'Nội dung JSON chưa hợp lệ.' });
    if (!error.status || error.status>=500) console.error(error);
    res.status(error.status || 500).json({ error:error.status ? error.message : 'Không thể xử lý yêu cầu. Vui lòng thử lại.' });
  });
  return app;
}
