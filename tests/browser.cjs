// Optional browser integration check: install Playwright separately, start npm run serve, then run node tests/browser.cjs.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
fs.mkdirSync('test-results',{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4173');await page.locator('.hero').waitFor();
 await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});
 assert.equal(await page.locator('nav a[aria-current]').innerText(),'首页');
 await page.locator('.hero .primary').click();await page.locator('.form-table').waitFor();
 assert.equal(await page.locator('.form-table tbody tr').count(),8);
 await page.locator('[data-pref=kana]').click();assert(await page.locator('body').evaluate(e=>e.classList.contains('hide-kana')));
 await page.reload();await page.locator('.article-card').waitFor();assert(await page.locator('body').evaluate(e=>e.classList.contains('hide-kana')));
 await page.locator('[data-pref=kana]').click();
 await page.locator('nav a[data-page=vocabulary]').click();await page.locator('.vocab-card').first().waitFor();assert.equal(await page.locator('.vocab-card').count(),24);
 await page.locator('#vocab-search').fill('音楽');assert.equal(await page.locator('.vocab-card').count(),1);
 await page.locator('[data-mode=meaning]').click();const input=page.locator('.practice-input');
 await input.fill('おんがく');await input.press('Enter');assert.match(await page.locator('.practice-feedback').innerText(),/写对/);
 await page.locator('[data-mode=reading]').click();await input.fill('音楽');await input.press('Enter');assert.match(await page.locator('.practice-feedback').innerText(),/再看看/);
 await input.fill('おんがく');
 await input.dispatchEvent('compositionstart');await input.dispatchEvent('keydown',{key:'Enter',isComposing:true});assert.equal(await page.locator('.practice-feedback').innerText(),'');
 await input.dispatchEvent('compositionend');await page.waitForTimeout(100);await input.press('Enter');assert.match(await page.locator('.practice-feedback').innerText(),/写对/);
 await page.locator('#reset-filters').click();await page.locator('#pos').selectOption('动词');await page.locator('#verb-class').selectOption('二类');assert.equal(await page.locator('.vocab-card').count(),3);
 await page.locator('#date-from').fill('2026-11-13');await page.locator('.empty-results').waitFor();await page.locator('#reset-filters').click();
 await page.locator('nav a[data-page=songs]').click();await page.locator('[data-artist=Vaundy]').click();assert.equal(await page.locator('.song-card').count(),5);
 await page.locator('a[href="#/songs/odoriko"]').first().click();assert.match(await page.locator('.context-note').innerText(),/只见过一次/);
 await page.locator('a[href="#/grammar/experience"]').click();await page.locator('.article-card h1').filter({hasText:'～ことがある：经历'}).waitFor();assert.equal(await page.locator('.article-card h1').innerText(),'～ことがある：经历');
 await page.evaluate(()=>window.scrollTo({top:600,behavior:'instant'}));await page.waitForTimeout(500);
 await page.locator('nav a[data-page=home]').click();assert.match(await page.locator('.hero .primary').getAttribute('href'),/experience\?resume=1/);
 await page.locator('.hero .primary').click();await page.waitForFunction(()=>scrollY>100);assert(await page.evaluate(()=>scrollY>100));
 await page.locator('#sync-open').click();assert.match(await page.locator('#auth-area').innerText(),/尚未连接/);await page.locator('.dialog-close').click();
 await page.locator('#theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.goto('http://localhost:4173/#/grammar/na-adj');await page.locator('.song-example').first().waitFor();assert(await page.locator('#grammar-lyric-list .song-example').count()>=6);await page.locator('#grammar-artist').selectOption('YOASOBI');assert.equal(await page.locator('#grammar-lyric-list .song-example').count(),1);await page.screenshot({path:'test-results/grammar-dark.png',fullPage:true});
 await page.locator('#theme-toggle').click();
 await page.setViewportSize({width:390,height:844});
 for(const route of ['home','grammar/na-adj','vocabulary','songs','songs/odoriko']){
  await page.goto('http://localhost:4173/#/'+route);await page.waitForTimeout(180);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow: ${route}`);
 }
 await page.goto('http://localhost:4173/#/home');await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
 // Mock only the external service; the production auth/sync frontend runs unchanged.
 const sync=await browser.newPage();let calls=0;
 await sync.route('**/assets/config.js',route=>route.fulfill({contentType:'application/javascript',body:"window.NIHONGO_CONFIG={supabaseUrl:'https://test.supabase.co',supabasePublishableKey:'public-test'};"}));
 await sync.route('https://test.supabase.co/**',async route=>{
  const req=route.request();if(req.method()==='OPTIONS')return route.fulfill({status:200,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'}});
  const common={contentType:'application/json',headers:{'access-control-allow-origin':'*'}};
  if(req.url().includes('/auth/v1/token'))return route.fulfill({...common,body:JSON.stringify({access_token:'test',refresh_token:'refresh',expires_at:Date.now()/1000+3600,user:{id:'user-a',email:'test@example.test'}})});
  if(req.url().includes('/rpc/')){calls++;return route.fulfill({...common,body:JSON.stringify({...req.postDataJSON().incoming,kana:{value:false,updatedAt:Date.now()+100}})});}
  return route.fulfill({...common,status:204,body:''});
 });
 await sync.goto('http://localhost:4173');await sync.locator('.hero').waitFor();await sync.locator('#sync-open').click();await sync.locator('#email').fill('test@example.test');await sync.locator('#password').fill('test-only');await sync.locator('#sign-in button').click();await sync.locator('#sign-out').waitFor();
 assert(calls>0);assert.equal(await sync.locator('#sync-label').innerText(),'已同步');assert(await sync.locator('body').evaluate(e=>e.classList.contains('hide-kana')));
 await sync.locator('#sign-out').click();await sync.locator('#sign-in').waitFor();assert.equal(await sync.locator('#sync-label').innerText(),'本机保存');
 assert.deepEqual(errors,[]);console.log('PASS: routes, filters, typing, IME, reading persistence, mobile overflow, dark mode, local status and mocked cloud sign-in/merge/sign-out.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
