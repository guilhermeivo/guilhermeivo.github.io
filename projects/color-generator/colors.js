let colorRGB = {
    red: 0,
    green: 0,
    blue: 0
}

let colorHSL = {
    hue: 0,
    saturation: 0,
    lightness: 0
}

let colorHEX = '#';

function generateColorRGB() {
    colorRGB.red = Math.floor(Math.random() * 255);
    colorRGB.green = Math.floor(Math.random() * 255);
    colorRGB.blue = Math.floor(Math.random() * 255);

    return colorRGB;
}

function convertToHSL(colorRGB) {   
    let color = [
        colorRGB.red,
        colorRGB.green,
        colorRGB.blue
    ]

    // Organized colors (min, max)
    for (let i = 0; i < color.length; i++) {
        for (let j = 0; j < color.length - 1; j++) {
            if (color[j] > color[j + 1]) {
                let aux = color[j];
                color[j] = color[j + 1];
                color[j + 1] = aux;
            }
        }
    }

    let max = color[2] / 255;
    let min = color[0] / 255;
    let r = colorRGB.red / 255;
    let g = colorRGB.green / 255;
    let b = colorRGB.blue / 255;

    // Lightness
    colorHSL.lightness = (min + max) / 2;

    if (max == min) {
        colorHSL.hue = colorHSL.saturation = 0;
    } else {
        // Saturation
        if (colorHSL.lightness / 100 <= 0.5) {
            colorHSL.saturation = (max - min) / (max + min);
        } else {
            colorHSL.saturation = (max - min) / (2 - max - min);
        }

        // Hue
        switch (max) {
            case r:
                colorHSL.hue = (g - b) / (max - min) + (g < b ? 6 : 0);  

                break;
            case g:
                colorHSL.hue = ((b - r) / (max - min)) + 2;

                break;
            case b:
                colorHSL.hue = ((r - g) / (max - min)) + 4;

                break;
        }

        // Formating
        colorHSL.lightness = Math.floor(colorHSL.lightness * 100)
        colorHSL.saturation = Math.floor(colorHSL.saturation * 100)
        colorHSL.hue = Math.floor(colorHSL.hue * 60)
    }    

    return colorHSL;
}

function convertToHEX(colorRGB) { 
    colorHEX = '#';
    
    let color = [
        colorRGB.red,
        colorRGB.green,
        colorRGB.blue
    ]

    let temp = [];

    for (let i = 0; i < color.length; i++) {
        let indivisibleColor = indivisibleValue(color[i]);        

        if (indivisibleColor < 1) {
            indivisibleColor *= 16;
        }

        temp.push(Math.floor(indivisibleColor));
        temp.push(Math.floor((indivisibleColor - temp[temp.length - 1]) * 16));     
    } 

    for (let j = 0; j < temp.length; j++) {
        if (temp[j] > 9) {
            switch (temp[j] - 9) {
                case 1: temp[j] = 'A'; break;
                case 2: temp[j] = 'B'; break;
                case 3: temp[j] = 'C'; break;
                case 4: temp[j] = 'D'; break;
                case 5: temp[j] = 'E'; break;
                case 6: temp[j] = 'F'; break;
            }
        }
    }

    for (let j = 0; j < temp.length; j++) {
        colorHEX += temp[j];
    }

    return colorHEX;
}

function indivisibleValue(value) {
    if (value >= 15) {
        return indivisibleValue(value / 16)
    } else {
        return value;
    }
}