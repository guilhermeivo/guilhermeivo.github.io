const generateCardProjects = {
    projectsList: [
        {
            title: "API - Accuweather",
            description: "Website consumindo dados da API do Accuweather.",
            link: [
                "https://github.com/guilhermeivo/accuweather-api",
            ],
            img: "illustration_weather"
        },
        {
            title: "Travel",
            description: "Página principal esquematizada com o tema sobre viagens.",
            link: [
                "https://github.com/guilhermeivo/landing-page-travel",
                "https://guilhermeivo.github.io/projects/landing-page-travel"
            ],
            img: "illustration_adventure"
        },
        {
            title: "Gerador de cores",
            description: "Gerador de cores com os padõres RGB. HEX e HSL.",
            link: [
                "https://github.com/guilhermeivo/color-generator",
                "https://guilhermeivo.github.io/projects/color-generator"
            ],
            img: "illustration_color"
        },
        {
            title: "Gerador de senhas",
            description: "Gerador de senhas com customização de caracteres.",
            link: [
                "https://github.com/guilhermeivo/password-generator",
                "https://guilhermeivo.github.io/projects/password-generator"
            ],
            img: "illustration_password"
        },
        {
            title: "Snake Game",
            description: "O clássico jogo da cobrinha no console gameboy.",
            link: [
                "https://github.com/guilhermeivo/snake-game",
                "https://guilhermeivo.github.io/projects/snake-game/index.html"
            ],
            img: "illustration_gaming"
        },
        {
            title: "TCM Codezone",
            description: "Projeto desenvolvido para trabalho de conclusão de módulo (TCM).",
            link: [
                "https://github.com/guilhermeivo/tcm-codezone",
                "https://guilhermeivo.github.io/projects/TCM-CodeZone/"
            ],
            img: "illustration_code"
        },
        {
            title: "TODO List",
            description: "Projeto desenvolvido para matéria Programação Web II (PW).",
            link: [
                "https://github.com/guilhermeivo/lista-projetos"
            ],
            img: "illustration_todo"
        }
    ],

    interface: {
        list_card: document.querySelector(".list-card"),

        card: document.createElement("a"),
        img: document.createElement("img"),
        div: document.createElement("div"),
        title: document.createElement("h2"),
        description: document.createElement("p"),

        divUp: document.createElement("div"),

        createCard(title, description, link, imgName) {

            this.card.classList.add("card")
            this.card.setAttribute("data-animar", "top")            
            this.img.src = `./assets/images/${imgName}.svg`
            this.title.textContent = title
            this.description.textContent = description

            this.card.appendChild(this.img)
            this.card.appendChild(this.div)
            this.div.appendChild(this.title)
            this.div.appendChild(this.description)

            this.divUp.appendChild(this.card)
        }
    },

    generate() {
        let element = ""

        for (let i = 0; i < this.projectsList.length; i++) {
            this.interface.createCard(
                this.projectsList[i].title,
                this.projectsList[i].description,
                this.projectsList[i].link,
                this.projectsList[i].img
            )

            element += this.interface.divUp.innerHTML
        }

        this.interface.list_card.innerHTML = element  

        this.interface.list_card.onLoad = this.generateLinks()
    },

    generateLinks() {
        let listCard = document.querySelector('.list-card');

        for (let i = 0; i < this.projectsList.length; i++) {
            if (this.projectsList[i].link[1]) {
                listCard.children[i].addEventListener('click', () => {
                    createPopUp.interface.openPopUp(
                        this.projectsList[i].link[1],
                        this.projectsList[i].link[0]
                    )
                })
            } else {
                listCard.children[i].href = this.projectsList[i].link[0]
            }
        }
    }
}