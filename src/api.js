export async function api(path, method='GET', body) {
  let response;
  try { response = await fetch(`/api${path}`, { method, credentials:'same-origin', headers:method==='GET' ? {} : { 'Content-Type':'application/json' }, ...(method==='GET' ? {} : { body:JSON.stringify(body ?? {}) }) }); }
  catch { throw new Error('Không kết nối được server. Kiểm tra npm run dev và MySQL.'); }
  const data = await response.json().catch(()=>({ error:'Server trả về dữ liệu không hợp lệ.' }));
  if (!response.ok) {
    if (response.status===401 && !path.startsWith('/auth/') && path!=='/me') window.dispatchEvent(new Event('session-expired'));
    throw Object.assign(new Error(data.error || 'Không thể thực hiện yêu cầu.'),{ status:response.status });
  }
  return data;
}
export const money = value => new Intl.NumberFormat('vi-VN').format(value)+' đ';
export const date = value => new Date(value).toLocaleString('vi-VN',{ dateStyle:'medium',timeStyle:'short' });
export const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
export function downloadJson(name, data) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const link=document.createElement('a'); link.href=url; link.download=name; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
