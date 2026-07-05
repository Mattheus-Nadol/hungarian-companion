const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    page.on('console', msg => console.log('console>', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('pageerror>', err && err.message));
    await page.goto('http://localhost:8000', { waitUntil: 'load', timeout: 10000 });
    const h1 = await page.locator('h1').first().innerText().catch(() => null);
    console.log('h1:', h1);
    const body = await page.content();
    console.log('body length:', body.length);
    console.log(body.slice(0, 1200));
  } catch (e) {
    console.error('error during fetch:', e && e.message ? e.message : e);
  } finally {
    await browser.close();
  }
})();
