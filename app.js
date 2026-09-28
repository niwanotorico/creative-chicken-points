import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, setPersistence, inMemoryPersistence } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, deleteDoc, serverTimestamp, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';
import { children, isAdmin, validRecord, balances } from './ledger.mjs';
const app = initializeApp({apiKey:'AIzaSyDZ9ejh0DacIkYsbn-heMSvY3W-v2DeFNQ',authDomain:'creative-chicken-points.firebaseapp.com',projectId:'creative-chicken-points',storageBucket:'creative-chicken-points.firebasestorage.app',messagingSenderId:'627959552960',appId:'1:627959552960:web:a101af5ea0c29ea1c14625'});
const auth = getAuth(app), db = getFirestore(app), ledger = collection(db,'records');
const $ = id => document.getElementById(id);
let records = [], ready = false, busy = false, visibleCount = 10;
const number = new Intl.NumberFormat('ja-JP');
const date = new Intl.DateTimeFormat('ja-JP',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
function message(text) { $('message').textContent = text; }
function errorText(e) {
  if(e.code === 'auth/popup-blocked') return 'ログイン画面がブロックされました。ChromeまたはEdgeで開き、ポップアップを許可してお試しください。';
  if(e.code === 'auth/popup-closed-by-user') return 'ログインをキャンセルしました。';
  if(e.code === 'auth/unauthorized-domain') return 'FirebaseでこのURLのドメインをログイン承認してください。';
  if(e.code === 'permission-denied') return '書き込みが許可されていません。管理者アカウントとFirestoreルールを確認してください。';
  return `接続または操作に失敗しました。通信状況を確認して再度お試しください。${e.code ? ` (${e.code})` : ''}`;
}
function render() {
  const totals = balances(records);
  children.forEach((child,i) => { $(['piyokichi','piyomi'][i]).textContent = ready ? number.format(totals[child]) : '—'; });
  $('entryForm').hidden = !isAdmin(auth.currentUser); $('save').disabled = busy || !ready;
  $('history').replaceChildren(); $('empty').hidden = !ready || records.length > 0; $('more').hidden = records.length <= visibleCount;
  for(const r of records.slice(0,visibleCount)) {
    const row = document.createElement('li'), body = document.createElement('div'), name = document.createElement('b'), reason = document.createElement('p'), time = document.createElement('small'), amount = document.createElement('span');
    body.className = 'record-body'; name.textContent = r.child; reason.textContent = r.reason;
    time.textContent = r.createdAt?.toDate ? date.format(r.createdAt.toDate()) : '日時を確認中';
    amount.className = `amount ${r.type}`; amount.textContent = `${r.type === 'earn' ? '+' : '−'}${number.format(r.points)} pt`;
    body.append(name,reason,time); row.append(body,amount);
    if(isAdmin(auth.currentUser) && !$('admin').hidden) {
      const remove = document.createElement('button'); remove.className = 'delete'; remove.textContent = '削除'; remove.disabled = busy || !ready;
      remove.addEventListener('click',async () => {
        if(!isAdmin(auth.currentUser) || busy || !ready) return;
        if(!confirm(`${r.child}の「${r.reason}」を削除しますか？残高も変わります。`)) return;
        busy = true; render();
        try { await deleteDoc(doc(ledger,r.id)); message('削除しました。'); } catch(e) { message(errorText(e)); } finally { busy = false; render(); }
      }); row.append(remove);
    }
    $('history').append(row);
  }
}
$('manage').addEventListener('click',() => { $('admin').hidden = !$('admin').hidden; $('manage').setAttribute('aria-expanded',String(!$('admin').hidden)); render(); });
$('more').addEventListener('click',() => { visibleCount += 20; render(); });
document.querySelectorAll('[data-points]').forEach(button => button.addEventListener('click',() => { $('points').value = button.dataset.points; }));
$('login').addEventListener('click',async () => {
  $('login').disabled = true;
  try { await setPersistence(auth,inMemoryPersistence); const provider = new GoogleAuthProvider(); provider.setCustomParameters({prompt:'select_account'}); await signInWithPopup(auth,provider); message(''); } catch(e) { message(errorText(e)); } finally { $('login').disabled = false; }
});
$('logout').addEventListener('click',async () => { try { await signOut(auth); message('ログアウトしました。'); } catch(e) { message(errorText(e)); } });
onAuthStateChanged(auth,user => {
  $('login').hidden = !!user; $('logout').hidden = !user;
  $('authStatus').textContent = isAdmin(user) ? 'ちきんとしてログイン中。ポイントを管理できます。' : user ? 'このアカウントでは編集できません。管理者アカウントでログインしてください。' : 'ポイントの管理にはGoogleログインが必要です。'; render();
});
$('entryForm').addEventListener('submit',async event => {
  event.preventDefault(); if(!isAdmin(auth.currentUser) || busy || !ready) return;
  const entry = {child:$('child').value,type:$('type').value,points:Number($('points').value),reason:$('reason').value.trim()};
  if(!validRecord(entry)) { message('1〜1,000,000の整数と理由を入力してください。'); return; }
  busy = true; render(); message('保存しています…');
  try { await setDoc(doc(ledger),{...entry,createdAt:serverTimestamp(),createdBy:auth.currentUser.email}); $('points').value = ''; $('reason').value = ''; message('記録しました。'); } catch(e) { message(errorText(e)); } finally { busy = false; render(); }
});
onSnapshot(ledger,{includeMetadataChanges:true},snapshot => {
  ready = !snapshot.metadata.fromCache;
  records = snapshot.docs.map(item => ({...item.data(),id:item.id})).filter(validRecord).sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0) || a.id.localeCompare(b.id));
  $('connection').textContent = ready ? '最新のポイントに同期しています' : '接続を確認しています。残高は接続後に表示します。'; render();
},e => { ready = false; $('connection').textContent = errorText(e); render(); });
window.addEventListener('offline',() => { ready = false; $('connection').textContent = 'オフラインです。接続すると残高を確認できます。'; render(); });
if('serviceWorker' in navigator) {
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange',() => { if(!reloading) { reloading = true; location.reload(); } });
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r => r.update()).catch(() => {});
}
