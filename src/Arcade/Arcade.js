import { readPixel } from "../GLUtil.js";
import Button from "./Button.js";
import Screen from "./Screen.js";

export default class Arcade {
    constructor(gl) {
        this.gl = gl
        this.isSimpleMode = false
        this.actualFocus = 0

        this.currentObjectOver = null
        this.wheelEventEndTimeout = null

        this.mouseEventX = -1
        this.mouseEventY = -1

        this.screenArcade = new Screen(
            '../resources/arcade/screen_blank.png',
            1000, 750,
            180, 150
        )

        this.buttonRotateRight = new Button(() => { 
            if (!this.screenArcade.opened || this.isSimpleMode) return
    
            this.screenArcade.scrollDown(document.querySelector('#screen>div').scrollHeight) 
        })

        this.buttonRotateLeft = new Button(() => { 
            if (!this.screenArcade.opened || this.isSimpleMode) return
    
            this.screenArcade.scrollUp() 
        })

        this.buttonFire = new Button(event => {
            if (!this.screenArcade.opened || this.isSimpleMode) return
            const cards = document.querySelector("#cards")
    
            if (event) event.preventDefault()
            let focusElement = this.actualFocus - 1
            if (focusElement < 0) focusElement = cards.children.length - 1
            cards.children[focusElement].click()
        })

        this.buttonThrust = new Button(event => {
            if (!this.screenArcade.opened || this.isSimpleMode) return
            const cards = document.querySelector("#cards")
    
            if (event) event.preventDefault()
            cards.children[this.actualFocus].focus()
            this.actualFocus++
            if (this.actualFocus >= cards.children.length) this.actualFocus = 0
        })

        this.buttonHyperSpace = new Button(() => { 
            if (this.isSimpleMode) return
    
            if (this.screenArcade.opened) this.screenArcade.close() 
            else this.screenArcade.open() 
        })

        this.onKeyupHandler = this.onKeyupHandler.bind(this)
        this.onMouseMoveHandler = this.onMouseMoveHandler.bind(this)
        this.onMouseupHandler = this.onMouseupHandler.bind(this)
    }

    switchMode(callback) {
        if (!this.isSimpleMode) {
            this.isSimpleMode = true
            document.querySelector('#screen').classList.add('simplified')
            document.querySelector('.shortcuts').style.display = 'none'
            document.querySelector('#canvas').style.display = 'none'
        } else {
            this.isSimpleMode = false
            document.querySelector('#screen').classList.remove('simplified')
            document.querySelector('.shortcuts').style.display = 'block'
            document.querySelector('#canvas').style.display = 'block'

            callback(0)
        }
    }

    updateScreen(scene) {
        this.screenArcade.update(document.querySelector('#screen'), document.querySelector('#screen>div').scrollHeight).then(() => {
            const screen = scene.children.filter(object => object.type == 'collection')[0]
                .children.filter(object => object.name == 'Screen')[0]

            this.screenArcade.draw()
                .then(image => {
                    screen.material.samplers.diffuseMap.setImageTexture(this.gl, image)
                })
        })
    }

    getMouseOver(scene) {
        if (!scene.children.filter(object => object.type == 'collection').length) return

        const pixelX = this.mouseEventX * this.gl.canvas.width / this.gl.canvas.clientWidth
        const pixelY = this.gl.canvas.height - this.mouseEventY * this.gl.canvas.height / this.gl.canvas.clientHeight - 1

        const data = readPixel(this.gl, pixelX, pixelY, 1, 1)
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24)

        scene.getById(scene.children.filter(object => object.type == 'collection')[0].children, id)
            .then(value => this.currentObjectOver = value)
    }

    getScreenMouseClick() {
        const pixelX = this.mouseEventX * this.gl.canvas.width / this.gl.canvas.clientWidth
        const pixelY = this.gl.canvas.height - this.mouseEventY * this.gl.canvas.height / this.gl.canvas.clientHeight - 1

        let widthData = 16
        let heightData = 16

        const data = readPixel(this.gl, pixelX, pixelY, widthData, heightData)

        let values = []
        const dataSize = widthData * heightData * 4
        for (let i = 0; i < dataSize; i+=4) {
            if (data[i + 0] == data[i + 1] && data[i + 0] == data[i + 2]) {
                if (!values.filter(value => value.number == data[i + 0]).length) {
                    values.push({ number: data[i + 0], amount: 1 })
                } else {
                    values.filter(value => value.number == data[i + 0])[0].amount++
                }
            }
        }
        if (!values.length) return

        values.sort((a, b) => b.amount - a.amount)
        if (values[0].amount < 8) return

        let smallestDistance = 255
        let value = document.querySelector('#cards').children[0]
        for (let card of document.querySelector('#cards').children) {
            const r = card.style.background.replace(/[^\d,]/g, '').split(',')[0]
            if (smallestDistance > Math.abs(r - values[0].number + 16)) {
                smallestDistance = Math.abs(r - values[0].number + 16)
                value = card
            }
        }
        if (smallestDistance > 16 / 2) return

        return value
    }

    onKeyupHandler(event) {
        switch (event.key) {
            case 'Escape':
                this.buttonHyperSpace.up()
                break
            case 'Tab':
                this.buttonThrust.up()
                break
            case 'Enter':
                this.buttonFire.up()
                break
            case 'ArrowUp':
            case 'ArrowLeft':
                this.buttonRotateLeft.up()
                break
            case 'ArrowDown':
            case 'ArrowRight':
                this.buttonRotateRight.up()
                break
        }
        document.removeEventListener('keyup', this.onKeyupHandler)
    }

    onMouseMoveHandler(event) {
        const rect = this.gl.canvas.getBoundingClientRect()
        this.mouseEventX = event.clientX - rect.left
        this.mouseEventY = event.clientY - rect.top

        if (!this.currentObjectOver) return

        switch (this.currentObjectOver.name) {
            case 'Button.RotateLeft':
            case 'Button.Fire':
            case 'Button.Thrust':
            case 'Button.HyperSpace':
            case 'Button.RotateRight':
                document.querySelector('#canvas').style.cursor = 'pointer'
                break
            case 'Screen':
                const value = this.getScreenMouseClick()
                if (value) {
                    document.querySelector('#canvas').style.cursor = 'pointer'
                    break
                }
            default:
                if (document.querySelector('#canvas').style.cursor != 'auto')
                    document.querySelector('#canvas').style.cursor = 'auto'
                break
        }
    }

    onMouseupHandler() {
        if (!this.currentObjectOver) return

        switch (this.currentObjectOver.name) {
            case 'Button.RotateRight':
                this.buttonRotateRight.up()
                break
            case 'Button.RotateLeft':
                this.buttonRotateLeft.up()
                break
            case 'Button.Fire':
                this.buttonFire.up()
                break
            case 'Button.Thrust':
                this.buttonThrust.up()
                break
            case 'Button.HyperSpace':
                this.buttonHyperSpace.up()
                break
            default:
                break
        }

        this.gl.canvas.removeEventListener('mouseup', this.onMouseupHandler)
    }
}