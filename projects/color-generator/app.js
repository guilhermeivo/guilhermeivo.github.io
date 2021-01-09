let generateColor = document.querySelectorAll('.color');
let hexNumbers = document.querySelector('#hex');
let rgbNumbers = document.querySelector('#rgb');
let hslNumbers = document.querySelector('#hsl');

setColorBox();

for (let i = 0; i < generateColor.length; i++) {
    generateColor[i].addEventListener('click', () => {
        setColorBox();
    });
}

function setColorBox() {
    let colorRGB = generateColorRGB();
    let colorHSL = convertToHSL(colorRGB);
    let colorHEX = convertToHEX(colorRGB);

    // Set background color
    for (let j = 0; j < generateColor.length; j++) {
        generateColor[j].style.background = `rgb(${colorRGB.red},${colorRGB.green},${colorRGB.blue})`;
    }

    // Alter text
    hexNumbers.children[1].textContent = `${colorHEX}`;
    rgbNumbers.children[1].textContent = `${colorRGB.red}, ${colorRGB.green}, ${colorRGB.blue}`;
    hslNumbers.children[1].textContent = `${colorHSL.hue}, ${colorHSL.saturation}%, ${colorHSL.lightness}%`;   
}