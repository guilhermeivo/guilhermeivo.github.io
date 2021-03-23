const snake = {    
    position: [
        {}
    ],    
    colorBody: '#569445',
    colorHead: '#5a8050',
    movimentationDirection: ['Right'],

    // move the snake around the map
    move() {
        let head = this.position[0]
        let direction = {
            dx: 0,
            dy: 0
        }

        // puts the whole body in the front position
        for (let i = this.position.length - 1; i > 0; i--) {
            this.position[i].x = this.position[i - 1].x
            this.position[i].y = this.position[i - 1].y
        }

        // puts the head in the position corresponding to the direction
        if (setup.keys['ArrowUp'] || setup.keys['KeyW']) {
            direction = this.movimentationToUp()         
        } else if (setup.keys['ArrowLeft'] || setup.keys['KeyA']) {
            direction = this.movimentationToLeft()  
        } else if (setup.keys['ArrowDown'] || setup.keys['KeyS']) {
            direction = this.movimentationToDown()
        } else if (setup.keys['ArrowRight'] || setup.keys['KeyD']) {
            direction = this.movimentationToRight() 
        } else {
            direction = this.movimentationToRight() 
        }
        
        head.x += direction.dx
        head.y += direction.dy
    },

    movimentationToLeft() {
        if (this.movimentationDirection[this.movimentationDirection.length - 1] !== 'Right') {
            let direction = {
                dx: -1,
                dy: 0
            }

            this.movimentationDirection.push('Left')

            return direction
        } else {
            return this.movimentationToRight()
        } 
    },
    movimentationToRight() {
        if (this.movimentationDirection[this.movimentationDirection.length - 1] !== 'Left') {
            let direction = {
                dx: +1,
                dy: 0
            }

            this.movimentationDirection.push('Right')  

            return direction
        } else {
            return this.movimentationToLeft()
        } 
    },
    movimentationToUp() {
        if (this.movimentationDirection[this.movimentationDirection.length - 1] !== 'Down') {
            let direction = {
                dx: 0,
                dy: -1
            }

            this.movimentationDirection.push('Up')  

            return direction
        } else {
            return this.movimentationToDown()
        }  
    },
    movimentationToDown() {
        if (this.movimentationDirection[this.movimentationDirection.length - 1] !== 'Up') {
            let direction = {
                dx: 0,
                dy: +1
            }

            this.movimentationDirection.push('Down')  

            return direction
        } else {
            return this.movimentationToUp()
        }
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