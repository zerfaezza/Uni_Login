"use strict";
if (location.origin === "https://idp.tu-dresden.de" && location.pathname === "/idp/profile/SAML2/Redirect/SSO") {
    const usernameEl = document.getElementById("username");
    const passwordEl = document.getElementById("password");
    const submitBtn = document.querySelector("body > main > section:nth-child(2) > form > div > div > button");
    const Text = document.querySelector("#fudiscr-form > div:nth-child(2) > div > legend > nobr");
    const IndexRegex = /position\s(?<Index1>\d{1,2}) & (?<Index2>\d{1,2})/g;
    const inputBox = document.querySelector("#fudis_otp_input");
    const validateButton = document.querySelector("#fudiscr-form > div.grid.md-2 > div:nth-child(1) > button");
    const hasOtpFields = !!(inputBox && validateButton && Text);
    const hasPasswordField = !!passwordEl;
    function applyValues(items) {
        if (hasOtpFields) {
            tryFillIndexSecret(items);
            return;
        }
        if (hasPasswordField) {
            if (usernameEl && items.username)
                usernameEl.value = items.username;
            if (passwordEl && items.password)
                passwordEl.value = items.password;
            if (submitBtn && usernameEl && passwordEl && usernameEl.value && passwordEl.value) {
                setTimeout(() => submitBtn.click(), 300);
            }
        }
    }
    function tryFillIndexSecret(items) {
        if (!Text || !inputBox || !validateButton)
            return;
        const text = (Text.textContent || '').trim();
        if (!text)
            return;
        IndexRegex.lastIndex = 0;
        const m = IndexRegex.exec(text);
        if (!m || !m.groups)
            return;
        const i1 = parseInt(m.groups.Index1, 10);
        const i2 = parseInt(m.groups.Index2, 10);
        if (Number.isNaN(i1) || Number.isNaN(i2))
            return;
        const secret = (items && items.indexSecret) || localStorage.getItem('indexSecret');
        if (!secret)
            return;
        const s = String(secret).trim();
        const charA = s.charAt(Math.max(0, i1 - 1)) || '';
        const charB = s.charAt(Math.max(0, i2 - 1)) || '';
        const otp = (charA + charB).trim();
        if (!otp)
            return;
        inputBox.value = otp;
        setTimeout(() => validateButton.click(), 300);
    }
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        try {
            chrome.storage.local.get(['username', 'password', 'indexSecret'], (items) => {
                applyValues(items);
            });
        }
        catch (err) { /* ignore storage errors */ }
    }
    else if (typeof browser !== 'undefined' && browser.storage) {
        try {
            browser.storage.local.get(['username', 'password', 'indexSecret']).then((items) => { applyValues(items); }).catch(() => { });
        }
        catch (err) { /* ignore */ }
    }
    else {
        const items = {
            username: localStorage.getItem('username'),
            password: localStorage.getItem('password'),
            indexSecret: localStorage.getItem('indexSecret')
        };
        applyValues(items);
    }
}
