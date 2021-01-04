createPopUp = {
    interface: {
        wrapper: '',
        popUp: '',
        button: [
            '',
            '',
            ''
        ],

        openPopUp(linkWebsite, linkCode) {
            this.wrapper = document.querySelector('#wrapper-pop-up')
            this.popUp = document.querySelector('#pop-up')
            this.button[0] = document.querySelector('#close-pop-up');
            this.button[1] = document.querySelector('.buttons-pop-up').children[0]
            this.button[2] = document.querySelector('.buttons-pop-up').children[1]

            this.button[1].href = linkCode
            this.button[2].href = linkWebsite

            this.button[0].addEventListener("click", () =>{ 
                this.wrapper.classList.remove("active")
            });

            this.wrapper.classList.add("active")
        }
    }
}