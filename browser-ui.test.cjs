const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,channel:'msedge'});
const context=await browser.newContext({serviceWorkers:'block',viewport:{width:320,height:740}});
await context.route('https://www.gstatic.com/firebasejs/**',route=>{
 const url=route.request().url();let body;
 if(url.endsWith('firebase-app.js'))body='export function initializeApp(){return {}}';
 if(url.endsWith('firebase-auth.js'))body=`const auth={currentUser:null};let listener;export function getAuth(){return auth}export class GoogleAuthProvider{setCustomParameters(){}}export const inMemoryPersistence={};export async function setPersistence(){}export function onAuthStateChanged(a,cb){listener=cb;cb(null);window.mockUser=u=>{auth.currentUser=u;cb(u)}}export async function signInWithPopup(){}export async function signOut(){window.mockUser(null)}`;
 if(url.endsWith('firebase-firestore.js'))body=`let cb;let records=[{id:'one',child:'ぴよきち',type:'earn',points:1250,reason:'お手伝い'},{id:'two',child:'ぴよみ',type:'earn',points:830,reason:'工作'}];let seq=2;function send(){cb({metadata:{fromCache:false},docs:records.map(r=>({id:r.id,data:()=>({...r,createdAt:{toDate:()=>new Date(),toMillis:()=>1}})}))})}export function getFirestore(){return {}}export function collection(){return {}}export function doc(c,id){return {id:id||String(++seq)}}export function serverTimestamp(){return {}}export function onSnapshot(c,o,f){cb=f;send()}export async function setDoc(d,r){records.push({...r,id:d.id});send()}export async function deleteDoc(d){records=records.filter(r=>r.id!==d.id);send()}`;
 route.fulfill({contentType:'text/javascript',body});
});
const page=await context.newPage();await page.goto('http://127.0.0.1:4178/creative-chicken-points/');await page.waitForFunction(()=>document.querySelector('#piyokichi').textContent==='1,250');
assert.equal(await page.locator('#admin').isVisible(),false);assert.equal(await page.locator('.delete').count(),0);
await page.click('#manage');assert.equal(await page.locator('#entryForm').isVisible(),false);
await page.evaluate(()=>mockUser({email:'other@gmail.com'}));assert.equal(await page.locator('#entryForm').isVisible(),false);assert.equal(await page.locator('.delete').count(),0);
await page.evaluate(()=>mockUser({email:'getadry@gmail.com'}));assert.equal(await page.locator('#entryForm').isVisible(),true);
await page.click('[data-points="50"]');await page.fill('#reason','テスト加算');await page.click('#save');await page.waitForFunction(()=>document.querySelector('#piyokichi').textContent==='1,300');
await page.selectOption('#type','spend');await page.fill('#points','100');await page.fill('#reason','テスト消費');await page.click('#save');await page.waitForFunction(()=>document.querySelector('#piyokichi').textContent==='1,200');
page.on('dialog',d=>d.accept());await page.locator('li').filter({hasText:'テスト消費'}).locator('button').click();await page.waitForFunction(()=>document.querySelector('#piyokichi').textContent==='1,300');
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.click('#manage');assert.equal(await page.locator('.delete').count(),0);
await page.screenshot({path:'mobile-review.png',fullPage:true});
await page.click('#manage');await page.click('#logout');assert.equal(await page.locator('#entryForm').isVisible(),false);
console.log('PASS: anonymous/other/admin UI, quick buttons, earn/spend/delete realtime callbacks, logout, public controls, 320px overflow, Pages subpath (mock Firebase)');
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

