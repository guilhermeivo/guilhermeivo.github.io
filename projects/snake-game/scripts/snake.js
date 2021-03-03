const snake = {    
    position: [
        {}
    ],    
    colorBody: '#569445',
    colorHead: '#5a8050',

    // move the snake around the map
    move() {
        let head = this.position[0]
        let dx = 0
        let dy = 0

        // puts the whole body in the front position
        for (let i = this.position.length - 1; i > 0; i--) {
            this.position[i].x = this.position[i - 1].x
            this.position[i].y = this.position[i - 1].y
        }

        // puts the head in the position corresponding to the direction
        if (setup.keys['ArrowUp'] || setup.keys['KeyW']) {
            dx = 0
            dy -= 1
        } else if (setup.keys['ArrowLeft'] || setup.keys['KeyA']) {
            dx -= 1
            dy = 0
        } else if (setup.keys['ArrowDown'] || setup.keys['KeyS']) {
            dx = 0
            dy += 1
        } else if (setup.keys['ArrowRight'] || setup.keys['KeyD']) {
            dx += 1
            dy = 0
        } else {
            dx += 1
            dy = 0
        }
        
        head.x += dx
        head.y += dy
    },

    // increases the size of the snake
    increaseBody() {
        this.position.push({
            x: 0,
            y: 0
        })
    },

    // draw the snake on the map
    draw() {
        this.move()

        this.position.forEach(partSnake => {
            this.drawPart(partSnake)
        })
    },

    drawPart(snakePart) {
        let head = this.position[0]
        let canvas = setup.interface.displayGame

        let ctx = canvas.getContext('2d')

        if (snakePart === head) {
            ctx.fillStyle = this.colorHead
        } else {
            ctx.fillStyle = this.colorBody
        }

        
        ctx.fillRect(
            (snakePart.x * setup.step) + 1, 
            (snakePart.y * setup.step) + 1, 
            setup.step - 2, 
            setup.step - 2
        )  
    }
}