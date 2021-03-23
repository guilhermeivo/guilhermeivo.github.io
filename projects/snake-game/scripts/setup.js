const setup = {
    widthMap: 201,
    heightMap: 161,    
    step: 20,
    keys: [],
    inGame: false,
    gameSpeed: 200,
    godMode: false,

    audio: {
        // audios
        appleCrunch: 'AppleCrunch',
        dieSound: 'DieSound',

        loadAudio(filename) {
            const file = `../audio/${filename}.mp3?cb=${new Date().getTime()}`
            const audio = new Audio(file)

            audio.load()

            return audio
        },

        loadAudios() {
            if (typeof(this.appleCrunch) == 'object') return

            this.appleCrunch = this.loadAudio(this.appleCrunch)
            this.dieSound = this.loadAudio(this.dieSound)
        } 
    },

    interface: {
        displayGame: document.querySelector('#gameSnake'),

        buttons: [
            document.querySelector('.buttonTop'),
            document.querySelector('.buttonLeft'),
            document.querySelector('.buttonBottom'),
            document.querySelector('.buttonRight'),
            document.querySelector('.buttonA'),
            document.querySelector('.buttonB')
        ],
        
        navigationButtons: [
            document.querySelector('.buttonTop'),
            document.querySelector('.buttonLeft'),
            document.querySelector('.buttonBottom'),
            document.querySelector('.buttonRight')
        ],

        extraButtons: [
            document.querySelector('.buttonA'),
            document.querySelector('.buttonB')
        ]
    },

    load() {
        // loads the audios for the game
        this.audio.loadAudios()

        utilities.eventsClick()     
    },

    start() {          
        this.createBoard()   
        this.mainScreen()

        // reset variables
        fruit.position = fruit.generatePosition()
        snake.position = []
        snake.position[0] = {x: 4, y: 4}
        snake.increaseBody()
        snake.increaseBody()
        snake.movimentationDirection = ['Right']

        // start the game
        this.load()
        this.update()
    },

    // updates the game screen
    update() {    
        if (this.inGame == true) {    
            setTimeout(() => {                
                this.createBoard()
                fruit.draw()
                snake.draw()
                collision.collisions()

                this.update()
            }, this.gameSpeed)
        }
    },

    // create borders and define the width of the map
    createBoard() {
        let canvas = this.interface.displayGame
        
        canvas.width  = this.widthMap
        canvas.height = this.heightMap

        let ctx = canvas.getContext('2d')

        let width = canvas.width
        let height = canvas.height

        // height
        for (let i = 0; i <= width; i += this.step) {
            ctx.moveTo(i, 0)
            ctx.lineTo(i, height)
        }

        // width
        for (let i= 0; i <= height; i += this.step) {
            ctx.moveTo(0, i)
            ctx.lineTo(width, i)
        }

        ctx.strokeStyle = '#3f5e36'
        ctx.lineWidth = 1

        ctx.stroke() 
    },

    gameOver() {
        this.inGame = false
        this.audio.dieSound.play()

        this.mainScreen('Game Over')
    },

    // draws the main screen
    mainScreen(title = 'Snake Game') {
        let canvas = this.interface.displayGame
        let ctx = canvas.getContext('2d')

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = snake.colorBody
        ctx.textAlign = 'center'

        ctx.font = '28px "DotGothic16"'
        ctx.fillText(title, canvas.width / 2, canvas.height / 2)

        ctx.font = '16px "DotGothic16"'
        ctx.fillText('Press any button', canvas.width / 2, (canvas.height / 2) + 25)
        ctx.fillText('to start', canvas.width / 2, (canvas.height / 2) + 40)        
    }
}