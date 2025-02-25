export default class Screen {
    constructor(srcImage, width, height, marginX, marginY) {
        const canvas = document.createElement('canvas')

        this.width = width
        this.height = height

        this.marginX = marginX
        this.marginY = marginY

        canvas.width = width + (2 * this.marginX)
        canvas.height = height

        this.ctx = canvas.getContext("2d")

        this.image = new Image()
        this.image.src = srcImage

        this.imageBg = new Image()

        this.scrollHeight = 0

        this.opened = false
    }

    close() {
        this.opened = false
        this.scrollHeight = 0
    }

    open(focusElement) {
        this.opened = true
        if (focusElement) focusElement.focus()
    }

    scrollDown(maxScroll) {
        if (!this.opened) return

        this.scrollHeight += 50

        const spaceScreen = (this.imageBg.width / this.width) * (this.height - (3 * this.marginY))
        if (this.scrollHeight >= maxScroll - spaceScreen) this.scrollHeight = maxScroll - spaceScreen
    }

    scrollUp() {
        if (!this.opened) return

        this.scrollHeight -= 50
        if (this.scrollHeight < 0) this.scrollHeight = 0
    }

    update(content, maxScroll = 0) {
        let value = content.innerHTML
        if (!this.opened) {
            value = this.errorScreen()
        }

        const aSvgImage = `
        data:image/svg+xml,
        <svg xmlns="http://www.w3.org/2000/svg" width="${ content.clientWidth }" height="${ maxScroll }">
            <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml">
                    ${ value }
                </div>
            </foreignObject>
        </svg>`

        return new Promise((resolve, reject) => {
            this.imageBg.onload = () => {
                resolve(this.imageBg)
            }
            this.imageBg.onerror = reject
            this.imageBg.src = aSvgImage
        })
    }

    draw() {
        this.ctx.fillStyle = "black"
        this.ctx.fillRect(0, 0, this.width + (2 * this.marginX), this.height)
        this.ctx.scale(1, -1)

        this.ctx.drawImage(this.imageBg, 
            0, // sx
            this.scrollHeight, // sy
            this.imageBg.width, // sWidth,
            (this.imageBg.width / this.width) * (this.height - (2 * this.marginY)), // sHeight
            this.marginX, this.marginY, 
            this.width, -this.height + this.marginY)

        this.ctx.scale(1, -1)
        this.ctx.drawImage(this.image, 0, 0, this.width + (2 * this.marginX), this.height)

        // this.ctx.fillStyle = "green"
        // this.ctx.fillRect(0, 0, this.marginX, this.height)
        // this.ctx.fillRect(this.width + this.marginX, 0, this.marginX, this.height)

        // this.ctx.fillRect(this.width + this.marginX, 0, this.marginX, this.height)

        // this.ctx.fillStyle = "green"
        // this.ctx.fillRect(this.marginX + 100, this.marginY + 100, 50, 50)

        return new Promise((resolve, reject) => {
            try {
                const newScreenImage = new Image()
                newScreenImage.onload = () => {
                    resolve(newScreenImage)
                }
                newScreenImage.onerror = reject
                newScreenImage.src = this.ctx.canvas.toDataURL()
            } catch (error) {
                this.close()
                reject(error)
            }
        })
    }

    errorScreen() {
        return `<div style="padding: 48px; font: 24px monospace; color: rgb(255, 255, 255);"><h1>_</h1></div>`
    }
}