import {mergeState} from './core.js';
const KEY='nihongo-atlas-v1';
const config=window.NIHONGO_CONFIG || {};
const url=(config.supabaseUrl||'').replace(/\/$/,'');
export const configured=!!(url && config.supabasePublishableKey);
let session, state={}, timer, refreshing, syncing=false, pending=false, revision=0;
let storageWorking=true;
function read(key,fallback) {try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}}
function write(key,value) {try{localStorage.setItem(key,JSON.stringify(value));}catch{storageWorking=false;}}
session=read(KEY+'-session',null);
// A config change must not reuse credentials from a different project.
if(session?.project!==url)session=null;
const stateKey=()=>KEY+'-state-'+(session?.user?.id||'local');
state=read(stateKey(),{});
function notify(status) {window.dispatchEvent(new CustomEvent('sync-status',{detail:status}));}
export function getValue(key,fallback) {return state[key]?.value ?? fallback;}
export function status() {return {configured,signedIn:!!session?.user,email:session?.user?.email,storageWorking};}
export function putValue(key,value) {
 state[key]={value,updatedAt:Date.now()}; revision++;write(stateKey(),state);
 if(session) {notify('pending');clearTimeout(timer);timer=setTimeout(syncNow,650);} else notify(storageWorking?'local':'memory');
}
async function api(path,body,token) {
 const response=await fetch(url+path,{method:'POST',headers:{apikey:config.supabasePublishableKey,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});
 if(!response.ok) {if(response.status===401||response.status===400)throw new Error('登录信息无效或已过期，请检查账号后重新登录。');throw new Error('暂时无法同步。内容已保存在本机，稍后会重试。');}
 return response.status===204?null:response.json();
}
async function accessToken() {
 if(!session)throw new Error('请先登录。');
 if((session.expires_at||0)>Date.now()/1000+60)return session.access_token;
 if(!refreshing) { const userId=session.user.id; refreshing=api('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token}).then(result=>{
 if(session?.user?.id!==userId)throw new Error('登录状态已改变。');
 session={...result,expires_at:result.expires_at||Date.now()/1000+result.expires_in,project:url};write(KEY+'-session',session);return session.access_token;
 }).finally(()=>{refreshing=null;}); }
 return refreshing;
}
export async function signIn(email,password) {
 if(!configured)throw new Error('此网站尚未连接同步服务。');
 const next=await api('/auth/v1/token?grant_type=password',{email,password});
 // Anonymous reading preferences can be carried into the selected account.
 const local=read(KEY+'-state-local',{});
 session={...next,expires_at:next.expires_at||Date.now()/1000+next.expires_in,project:url};write(KEY+'-session',session);state=mergeState(read(stateKey(),{}),local);revision++;
 write(stateKey(),state);window.dispatchEvent(new Event('preferences-updated'));await syncNow();
}
export async function signOut() {
 const previous=session;session=null;clearTimeout(timer);write(KEY+'-session',null);
 state=read(KEY+'-state-local',{});revision++;notify('local');window.dispatchEvent(new Event('preferences-updated'));
 if(previous)try{await api('/auth/v1/logout',{},previous.access_token);}catch{}
}
export async function syncNow() {
 if(!configured||!session)return;
 if(syncing){pending=true;return;}
 syncing=true;const userId=session.user.id;const startRevision=revision;
 try {
  notify('pending');const token=await accessToken();
  const remote=await api('/rest/v1/rpc/merge_learning_state',{incoming:state},token);
  if(session?.user?.id!==userId)return;
  state=mergeState(state,remote||{});write(stateKey(),state);notify('synced');window.dispatchEvent(new Event('preferences-updated'));
 } catch(error) {notify('error');window.dispatchEvent(new CustomEvent('sync-error',{detail:error.message}));}
 finally {syncing=false;if(pending||revision!==startRevision){pending=false;if(session)timer=setTimeout(syncNow,650);}}
}
window.addEventListener('online',()=>syncNow());
window.addEventListener('storage',e=>{if(e.key===stateKey()){state=mergeState(state,read(stateKey(),{}));window.dispatchEvent(new Event('preferences-updated'));}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncNow();});
export function startSync(){if(session)syncNow();else notify(storageWorking?'local':'memory');}
