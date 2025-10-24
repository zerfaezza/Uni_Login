"use strict";
// popup.ts - typed version of the popup script
const usernameEl = document.getElementById('username');
const passwordEl = document.getElementById('password');
const indexSecretEl = document.getElementById('indexSecret');
const showPasswordBtn = document.getElementById('showPasswordBtn');
const showIndexBtn = document.getElementById('showIndexBtn');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const statusEl = document.getElementById('status');
const confirmDialog = document.getElementById('confirmDialog');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
function showStatus(msg, color = 'green') {
    if (!statusEl)
        return;
    statusEl.textContent = msg;
    statusEl.style.color = color;
    setTimeout(() => { statusEl.textContent = ''; }, 2500);
}
function loadValues() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['username', 'password', 'indexSecret'], (items) => {
            if (items.username && usernameEl)
                usernameEl.value = items.username;
            if (items.password && passwordEl)
                passwordEl.value = items.password;
            if (items.indexSecret && indexSecretEl)
                indexSecretEl.value = items.indexSecret;
        });
    }
}
function saveValues() {
    const data = {
        username: usernameEl ? usernameEl.value : '',
        password: passwordEl ? passwordEl.value : '',
        indexSecret: indexSecretEl ? indexSecretEl.value : ''
    };
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set(data, () => {
            showStatus('Saved');
        });
    }
}
function clearValues(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    // Show custom confirmation dialog
    if (confirmDialog)
        confirmDialog.style.display = 'block';
}
function performClear() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.remove(['username', 'password', 'indexSecret'], () => {
            if (usernameEl)
                usernameEl.value = '';
            if (passwordEl)
                passwordEl.value = '';
            if (indexSecretEl)
                indexSecretEl.value = '';
            showStatus('Cleared', 'red');
        });
    }
    if (confirmDialog)
        confirmDialog.style.display = 'none';
}
function cancelClear() {
    if (confirmDialog)
        confirmDialog.style.display = 'none';
}
saveBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveValues();
});
clearBtn?.addEventListener('click', clearValues);
confirmYes?.addEventListener('click', performClear);
confirmNo?.addEventListener('click', cancelClear);
document.addEventListener('DOMContentLoaded', () => {
    loadValues();
    // prevent copying from password and indexSecret fields
    const blockCopy = (e) => e.preventDefault();
    passwordEl?.addEventListener('copy', blockCopy);
    indexSecretEl?.addEventListener('copy', blockCopy);
    passwordEl?.addEventListener('cut', blockCopy);
    indexSecretEl?.addEventListener('cut', blockCopy);
    // block keyboard shortcuts (Ctrl/Cmd+C/X/A) and selection
    const blockCopyKey = (e) => {
        const k = e.key?.toLowerCase();
        if ((e.ctrlKey || e.metaKey) && (k === 'c' || k === 'x' || k === 'a')) {
            e.preventDefault();
        }
    };
    passwordEl?.addEventListener('keydown', blockCopyKey);
    indexSecretEl?.addEventListener('keydown', blockCopyKey);
    passwordEl?.addEventListener('selectstart', (e) => e.preventDefault());
    indexSecretEl?.addEventListener('selectstart', (e) => e.preventDefault());
    // disable context menu on those fields to reduce copy
    passwordEl?.addEventListener('contextmenu', (e) => e.preventDefault());
    indexSecretEl?.addEventListener('contextmenu', (e) => e.preventDefault());
    // Toggle password visibility on click
    const toggleVisibility = (input, btn) => {
        const isVisible = input.type === 'text';
        input.type = isVisible ? 'password' : 'text';
        const visOff = btn.querySelector('.vis-off');
        const visOn = btn.querySelector('.vis-on');
        if (visOff && visOn) {
            visOff.style.display = isVisible ? '' : 'none';
            visOn.style.display = isVisible ? 'none' : '';
        }
    };
    showPasswordBtn?.addEventListener('click', () => {
        if (passwordEl)
            toggleVisibility(passwordEl, showPasswordBtn);
    });
    showIndexBtn?.addEventListener('click', () => {
        if (indexSecretEl)
            toggleVisibility(indexSecretEl, showIndexBtn);
    });
});
