let bntEdit = document.querySelector('.btnEdit');
let boxEdit = document.querySelector('.edit-password');
let btnGerar = document.querySelector('.btnGerar');
let txtPassword = document.querySelector('.txtPassword');
let chkUppercase = document.querySelector('#uppercase');
let chkNumbers = document.querySelector('#numbers');
let chkSpecial = document.querySelector('#special');
let rgLength = document.querySelector('#rangePassword');
let numberSlider = document.querySelector('.number-slider');

bntEdit.addEventListener('click', () => {
    numberSlider.textContent = rgLength.value;

    boxEdit.classList.toggle('active');
});

rgLength.addEventListener('input', () => {
    numberSlider.textContent = rgLength.value;
})

btnGerar.addEventListener('click', () => { 
    let settings = {
        handlerUppercase: chkUppercase.checked, 
        handlerNumber: chkNumbers.checked, 
        handlerSpecial: chkSpecial.checked
    }
    
    let password = generatePassword(
        rgLength.value, 
        settings
    );

    txtPassword.value = password;

    copyPassword(password);
});