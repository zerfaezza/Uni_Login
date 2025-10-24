function getCredentials(callback: (items: any) => void) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['username', 'password', 'indexSecret'], callback);
    }
}

function handleTUDresdenSSO() {
    const usernameEl = document.getElementById("username") as HTMLInputElement | null;
    const passwordEl = document.getElementById("password") as HTMLInputElement | null;
    const submitBtn = document.querySelector("body > main > section:nth-child(2) > form > div > div > button") as HTMLButtonElement | null;

    const otpText = document.querySelector("#fudiscr-form > div:nth-child(2) > div > legend > nobr");
    const otpInputBox = document.querySelector("#fudis_otp_input") as HTMLInputElement | null;
    const otpValidateBtn = document.querySelector("#fudiscr-form > div.grid.md-2 > div:nth-child(1) > button") as HTMLButtonElement | null;

    const tokenSelect = document.querySelector("#fudis_selected_token_ids_input") as HTMLSelectElement | null;
    const tokenButton = document.querySelector("#fudiscr-form > div.grid.md-2 > div > button") as HTMLButtonElement | null;

    if (tokenSelect && tokenButton) {
        const firstOption = tokenSelect.querySelector("option:nth-child(1)") as HTMLOptionElement | null;
        if (firstOption) {
            tokenSelect.value = firstOption.value;
            tokenSelect.dispatchEvent(new Event('change', { bubbles: true }));
            setTimeout(() => tokenButton.click(), 300);
        }
        return;
    }

    if (otpInputBox && otpValidateBtn && otpText) {
        getCredentials((items: any) => {
            const text = (otpText.textContent || '').trim();
            const regex = /position\s(?<Index1>\d{1,2}) & (?<Index2>\d{1,2})/g;
            const match = regex.exec(text);
            
            if (match && (match as any).groups) {
                const i1 = parseInt((match as any).groups.Index1, 10);
                const i2 = parseInt((match as any).groups.Index2, 10);
                const secret = items?.indexSecret || '';
                
                if (secret && !Number.isNaN(i1) && !Number.isNaN(i2)) {
                    const charA = secret.charAt(Math.max(0, i1 - 1)) || '';
                    const charB = secret.charAt(Math.max(0, i2 - 1)) || '';
                    const otp = (charA + charB).trim();
                    
                    if (otp && otpInputBox) {
                        otpInputBox.value = otp;
                        setTimeout(() => otpValidateBtn?.click(), 300);
                    }
                }
            }
        });
        return;
    }

    if (usernameEl && passwordEl && submitBtn) {
        getCredentials((items: any) => {
            if (items.username) usernameEl.value = items.username;
            if (items.password) passwordEl.value = items.password;
            if (usernameEl.value && passwordEl.value) {
                setTimeout(() => submitBtn.click(), 300);
            }
        });
    }
}

function handleBildungsportal() {
    const universitySelect = document.querySelector("#id2") as HTMLSelectElement | null;
    const submitButton = document.querySelector("#id12") as HTMLButtonElement | null;
    
    if (universitySelect && submitButton) {
        universitySelect.value = "13";
        universitySelect.dispatchEvent(new Event('change', { bubbles: true }));
        setTimeout(() => submitButton.click(), 300);
    }
}

function handleSELMA() {
    const usernameEl = document.querySelector("#field_user") as HTMLInputElement | null;
    const passwordEl = document.querySelector("#field_pass") as HTMLInputElement | null;
    const loginBtn = document.querySelector("#logIn_btn") as HTMLButtonElement | null;
    
    if (usernameEl && passwordEl && loginBtn) {
        getCredentials((items: any) => {
            if (items.username) usernameEl.value = items.username;
            if (items.password) passwordEl.value = items.password;
            if (usernameEl.value && passwordEl.value) {
                setTimeout(() => loginBtn.click(), 300);
            }
        });
    }
}

if (location.origin === "https://idp.tu-dresden.de" && location.pathname === "/idp/profile/SAML2/Redirect/SSO") {
    handleTUDresdenSSO();
} else if (location.origin === "https://bildungsportal.sachsen.de" && location.pathname.startsWith("/opal/shiblogin")) {
    handleBildungsportal();
} else if (location.origin === "https://selma.tu-dresden.de" && location.pathname.startsWith("/APP/EXTERNALPAGES/")) {
    handleSELMA();
}

