function generatePassword(length = 16, settings) {
    const charsetLettersLowercase = 'abcdefghijklmnopqrstuvwxyz';
    const charsetLettersUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charsetNumber = '1234567890';
    const charsetSpecial = '!@#$%^&*()_+=[]';    

    let amountCharset = 1;
    let charset = '';
    let password = '';

    if (typeof settings === 'undefined') {
        settings = {};
    }

    if (settings.handlerUppercase) {
        amountCharset++;
    }
    if (settings.handlerNumber) {
        amountCharset++;
    }
    if (settings.handlerSpecial) {
        amountCharset++;
    }

    for (let i = 0; i < length; i++) {
        charset += charsetLettersLowercase[Math.floor(Math.random() * charsetLettersLowercase.length)];

        if (settings.handlerUppercase) {
            charset += charsetLettersUppercase[Math.floor(Math.random() * charsetLettersUppercase.length)];
        }
        if (settings.handlerNumber) {
            charset += charsetNumber[Math.floor(Math.random() * charsetNumber.length)];
        }
        if (settings.handlerSpecial) {
            charset += charsetSpecial[Math.floor(Math.random() * charsetSpecial.length)];
        }        

        password += charset[Math.floor(Math.random() * amountCharset)];
        
        charset = '';
    }

    return password;
}

function copyPassword(value) {
    const textarea = document.createElement('textarea');

    textarea.value = value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
}