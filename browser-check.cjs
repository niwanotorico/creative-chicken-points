const {chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({headless:true,channel:"msedge"});
const page=await browser.newPage({viewport:{width:375,height:812}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4178/creative-chicken-points/');
await page.waitForTimeout(7000);
console.log('REAL',await page.locator('#connection').innerText(),'errors',errors);
console.log('mobile overflow',await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
await page.screenshot({path:'mobile-review.png',fullPage:true});
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});


