// Read-only browser research for official sites that render their content with JavaScript.
import { chromium } from '@playwright/test';
const browser = await chromium.launch({ headless: true });
for (const url of process.argv.slice(2)) {
  const page = await browser.newPage({ ignoreHTTPSErrors: true });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(6500);
    console.log('\nSOURCE:', url, '\n', (await page.locator('body').innerText()).slice(0, 28000));
    console.log('RELEVANT LINKS:', await page.locator('a').evaluateAll(links => links.filter(a => /ngành|tuyển sinh|đào tạo|điểm trúng tuyển/i.test(a.innerText)).map(a => ({ title: a.innerText.slice(0,200), url: a.href })).filter((a,i,arr)=>arr.findIndex(b=>b.url===a.url)===i).slice(0, 65)));
  } catch (error) { console.log(url, error.message); }
  finally { await page.close(); }
}
await browser.close();
