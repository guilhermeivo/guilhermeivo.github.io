const utilities = {
    possibleButtons: ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'],

    eventsClick() {
        // add events to identify keys
        window.addEventListener('keydown', event => {
            setup.keys = []
            setup.keys[event.code] = true

            utilities.restartGame()
        })

        setup.interface.navigationButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                setup.keys = []
                setup.keys[this.possibleButtons[index]] = true
    
                utilities.restartGame()
            })
        })

        setup.interface.extraButtons.forEach(button => {
            button.addEventListener('click', () => {   
                utilities.restartGame()
            })
        })
    },

    restartGame() {
        if (setup.inGame == false) {    
            setup.inGame = true
            setup.start()
        }
    }
}