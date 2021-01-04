let paper

function init() {
    paper = document.querySelectorAll('.page') 

    paper.forEach(element => {
        for(let i = 1; i <= 3; i++) {
            if (element.children[i]) {
                element.children[i].style.opacity = 0
            }            
        }
    })

    let delay = 100

    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                if (paper[i].children[1]) {
                    paper[i].children[1].style.opacity = 1
                }   
    
                setTimeout(() => {
                    if (paper[i].children[2]) {
                        paper[i].children[2].style.opacity = 1
                    }  
    
                    setTimeout(() => {
                        if (paper[i].children[2]) {
                            paper[i].children[2].style.opacity = 1
                        }  
                    }, delay)  
                }, delay)  
            }, delay)  
        }
        

    }, 500)
    
}