const animationGenerate = {    
    animationClass: 'animate',
    targetDataAnimar: '',

    activeAnimation() {    
        this.targetDataAnimar = document.querySelectorAll('[data-animar]') 

        if (this.targetDataAnimar.length) {
            window.addEventListener('scroll', function() {
                animationGenerate.animeScroll()
            })
        }   
    },

    animeScroll() {
        const windowTop = window.pageYOffset + ((window.innerHeight) / 4)

        this.targetDataAnimar.forEach(element => {
            let elementCoords = element.getBoundingClientRect();

            if(windowTop > elementCoords.top) {
                element.classList.add(this.animationClass)
            }
        })              
    }    
}