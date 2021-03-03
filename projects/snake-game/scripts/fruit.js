const fruit = {
    position: [
        {}
    ],
    color: '#ff0000',

    // generates a random position within the map for the fruit
    generatePosition() {
        let newPositionFood

        let positionX
        let positionY

        let width = setup.widthMap / setup.step
        let height = setup.heightMap / setup.step

        // checks if the fruit will stay inside the snake's body
        do {
            positionX = Math.floor(Math.random() * (Math.floor(width)))
            positionY = Math.floor(Math.random() * (Math.floor(height)))

            for (let i = 0; i < snake.position.length; i++) {
                if (
                    positionX == snake.position[i].x &&
                    positionY == snake.position[i].y
                    ) {
                    positionX = -1
                }
            }
        } while (positionX < 0)

        newPositionFood = {
            x: positionX,
            y: positionY
        }
    
        return newPositionFood
    },

    // draw the fruit on the map
    draw() {
        let canvas = setup.interface.displayGame

        let ctx = canvas.getContext('2d')

        ctx.fillStyle = this.color

        ctx.fillRect(
            (this.position.x * setup.step) + 1, 
            (this.position.y * setup.step) + 1, 
            setup.step - 2, 
            setup.step - 2
        )  
    }
}