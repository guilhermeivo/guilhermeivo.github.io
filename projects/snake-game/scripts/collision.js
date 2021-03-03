const collision = {
    collisions() {
        collision.fruitCollision()

        if (!setup.godMode) {
            collision.bodyCollision()
            collision.collisionEdges()
        }        
    },

    // checks if collision with any fruit
    fruitCollision() {
        let head = snake.position[0]

        if (
            fruit.position.x == head.x &&
            fruit.position.y == head.y
        ) {            
            fruit.position = fruit.generatePosition()

            setup.audio.appleCrunch.play()
            snake.increaseBody()
        }
    },

    // checks if collision with the body itself
    bodyCollision() {
        let head = snake.position[0]

        for (let i = 1, len = snake.position.length; i < len; i++) {
            if (
                head.x == snake.position[i].x &&
                head.y == snake.position[i].y
                ) {
                    setup.gameOver()
            }
        }
    },
    
    // checks if collision with map borders
    collisionEdges() {
        let head = snake.position[0]

        let width = setup.widthMap / setup.step
        let height = setup.heightMap / setup.step
               
        for (let i = 0; i < width; i++) {
            // top
            if (
                head.x == i &&
                head.y == -1
                ) {
                    setup.gameOver()
            }
            // bottom
            if (
                head.x == i &&
                head.y == Math.floor(height)
                ) {
                    setup.gameOver()
            }
        }

        for (let i = 0; i < height; i++) {
            //left
            if (
                head.x == -1 &&
                head.y == i
                ) {
                    setup.gameOver()
            }
            // right
            if (
                head.x == Math.floor(width) &&
                head.y == i
                ) {
                    setup.gameOver()
            }
        }
    }
}