// popup.ts - typed version of the popup script

const usernameEl = document.getElementById('username') as HTMLInputElement;
const passwordEl = document.getElementById('password') as HTMLInputElement;
const indexSecretEl = document.getElementById('indexSecret') as HTMLInputElement;
const keepOpenChk = document.getElementById('keepOpenChk') as HTMLInputElement | null;
const openWindowBtn = document.getElementById('openWindowBtn') as HTMLButtonElement | null;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;

function showStatus(msg: string, color = 'green'){
  if(!statusEl) return;
  statusEl.textContent = msg;
  statusEl.style.color = color;
  setTimeout(()=>{ statusEl.textContent = ''; }, 2500);
}

function loadValues(){
  if(typeof chrome !== 'undefined' && chrome.storage){
    chrome.storage.local.get(['username','password','indexSecret'], (items: any)=>{
      if(items.username && usernameEl) usernameEl.value = items.username;
      if(items.password && passwordEl) passwordEl.value = items.password;
      if(items.indexSecret && indexSecretEl) indexSecretEl.value = items.indexSecret;
      if(items.keepOpen !== undefined && keepOpenChk) keepOpenChk.checked = !!items.keepOpen;
    });
  } else if(typeof browser !== 'undefined' && browser.storage){
    browser.storage.local.get(['username','password','indexSecret']).then((items: any)=>{
      if(items.username && usernameEl) usernameEl.value = items.username;
      if(items.password && passwordEl) passwordEl.value = items.password;
      if(items.indexSecret && indexSecretEl) indexSecretEl.value = items.indexSecret;
    });
  } else {
    if(usernameEl) usernameEl.value = localStorage.getItem('username') || '';
    if(passwordEl) passwordEl.value = localStorage.getItem('password') || '';
    if(indexSecretEl) indexSecretEl.value = localStorage.getItem('indexSecret') || '';
    if(keepOpenChk) keepOpenChk.checked = localStorage.getItem('keepOpen') === '1';
  }
}

function saveValues(){
  const data = {
    username: usernameEl ? usernameEl.value : '',
    password: passwordEl ? passwordEl.value : '',
    indexSecret: indexSecretEl ? indexSecretEl.value : '',
    keepOpen: keepOpenChk ? !!keepOpenChk.checked : false
  };

  if(typeof chrome !== 'undefined' && chrome.storage){
    chrome.storage.local.set(data, ()=>{
      showStatus('Saved');
    });
  } else if(typeof browser !== 'undefined' && browser.storage){
    browser.storage.local.set(data).then(()=> showStatus('Saved'));
  } else {
    if(data.username) localStorage.setItem('username', data.username);
    if(data.password) localStorage.setItem('password', data.password);
    if(data.indexSecret) localStorage.setItem('indexSecret', data.indexSecret);
    localStorage.setItem('keepOpen', data.keepOpen ? '1' : '0');
    showStatus('Saved (localStorage)');
  }
}

function clearValues(){
  if(!confirm('Clear saved credentials?')) return;
  if(typeof chrome !== 'undefined' && chrome.storage){
    chrome.storage.local.remove(['username','password','indexSecret'], ()=>{
      if(usernameEl) usernameEl.value = ''; if(passwordEl) passwordEl.value = ''; if(indexSecretEl) indexSecretEl.value = ''; showStatus('Cleared','red');
    });
  } else if(typeof browser !== 'undefined' && browser.storage){
    browser.storage.local.remove(['username','password','indexSecret']).then(()=>{
      if(usernameEl) usernameEl.value = ''; if(passwordEl) passwordEl.value = ''; if(indexSecretEl) indexSecretEl.value = ''; showStatus('Cleared','red');
    });
  } else {
    localStorage.removeItem('username'); localStorage.removeItem('password'); localStorage.removeItem('indexSecret');
    localStorage.removeItem('keepOpen');
    if(usernameEl) usernameEl.value = ''; if(passwordEl) passwordEl.value = ''; if(indexSecretEl) indexSecretEl.value = ''; showStatus('Cleared','red');
  }
}

saveBtn?.addEventListener('click', saveValues);
clearBtn?.addEventListener('click', clearValues);
document.addEventListener('DOMContentLoaded', ()=>{
  loadValues();
  // prevent copying from password and indexSecret fields
  const blockCopy = (e: ClipboardEvent)=> e.preventDefault();
  passwordEl?.addEventListener('copy', blockCopy);
  indexSecretEl?.addEventListener('copy', blockCopy);
  passwordEl?.addEventListener('cut', blockCopy);
  indexSecretEl?.addEventListener('cut', blockCopy);
  // block keyboard shortcuts (Ctrl/Cmd+C/X/A) and selection
  const blockCopyKey = (e: KeyboardEvent)=>{
    const k = e.key?.toLowerCase();
    if((e.ctrlKey || e.metaKey) && (k === 'c' || k === 'x' || k === 'a')){
      e.preventDefault();
    }
  };
  passwordEl?.addEventListener('keydown', blockCopyKey);
  indexSecretEl?.addEventListener('keydown', blockCopyKey);
  passwordEl?.addEventListener('selectstart', (e)=> e.preventDefault());
  indexSecretEl?.addEventListener('selectstart', (e)=> e.preventDefault());
  // disable context menu on those fields to reduce copy
  passwordEl?.addEventListener('contextmenu', (e)=> e.preventDefault());
  indexSecretEl?.addEventListener('contextmenu', (e)=> e.preventDefault());

  openWindowBtn?.addEventListener('click', ()=>{
    try {
      if(typeof chrome !== 'undefined' && chrome.windows && chrome.windows.create){
        chrome.windows.create({ url: chrome.runtime.getURL('popup.html'), type: 'popup', width: 360, height: 420 });
      } else {
        window.open('popup.html', '_blank', 'popup,noopener,width=360,height=420');
      }
    } catch (e) { /* ignore */ }
  });
});
