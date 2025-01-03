const types = {
    button: {
        id: 'button',
        defaultEvent: 'click'
    },
    checkbox: { 
        id: 'checkbox',
        defaultEvent: 'change',
        value: 'checked'
    },
    color: {
        id: 'color'
    },
    date: {
        id: 'date'
    },
    datetime: {
        id: 'datetime'
    },
    datetimeLocal: {
        id: 'datetime-local'
    },
    email: {
        id: 'email'
    },
    file: {
        id: 'file',
        defaultEvent: null
    },
    hidden: {
        id: 'hidden',
        defaultEvent: null
    },
    image: {
        id: 'image',
        defaultEvent: null
    },
    month: {
        id: 'month'
    },
    number: {
        id: 'number'
    },
    password: {
        id: 'password'
    },
    radio: {
        id: 'radio',
        defaultEvent: 'change',
        value: 'checked'
    },
    range: {
        id: 'range'
    },
    reset: {
        id: 'reset',
        defaultEvent: null
    },
    search: {
        id: 'search'
    },
    submit: {
        id: 'submit',
        defaultEvent: null
    },
    tel: {
        id: 'tel'
    },
    text: {
        id: 'text'
    },
    time: {
        id: 'time'
    },
    url: {
        id: 'url'
    },
    week: {
        id: 'week'
    }
}

export default customElements.define('overlay-debug',
    class extends HTMLElement {
        constructor() {
            super()

            this.rendered = false
            this.state = { 
                isOpen: false,
                isMouseDown: false,
                offset: [ 10, 10 ],
                title: this.hasAttribute('title') ? this.getAttribute('title') : ''
            }

            this.onMouseDownHandler = this.onMouseDownHandler.bind(this)
            this.onMouseUpHandler = this.onMouseUpHandler.bind(this)
            this.onMouseMove = this.onMouseMove.bind(this)
            this.onCloseHandler = this.onCloseHandler.bind(this)
        }

        connectedCallback() {
            if (!this.rendered) {
                this.render()
                this.rendered = true
                this.addEventsListeners()
            }
        }
    
        disconnectedCallback() {
            this.removeEventsListeners()
        }

        addContent(label, { type, configs = {}, event }) {
            if (!types.hasOwnProperty(type)) return

            const id = `${ type.toLowerCase().trim() }${ label[0].trim().toUpperCase() }${ label.trim().substring(1) }`

            const element = this.querySelector('form').appendDOM(`
            <div>
                ${
                    type != types.button.id 
                    ? `<label for="${ id }"><b>${ label }</b></label>`
                    : ''
                }
                <input type="${ type.toLowerCase().trim() }" id="${ id }" name="${ label }"
                    ${
                        Object.keys(configs).map(key => {
                            return `${ key }= "${ configs[key] }"`
                        }).join('')
                    }
                />
                ${
                    type == types.range.id
                    ? `<p id="${ id }Preview">a</p>`
                    : ''
                }
            </div>
            `)

            if (types[type].defaultEvent === null) return

            element.querySelector(`input#${ id }`).addEventListener(types[type].defaultEvent || 'input', event || this.saveValue)

            event ? event(element.querySelector(`input#${ id }`)) : this.saveValue(element.querySelector(`input#${ id }`))
        }

        addAllContents(contents) {
            contents.forEach(content => {
                this.addContent(content.label, content)
            })
        }

        saveValue(arg) {
            const target = arg.target || arg

            window[`DEBUG_${ target.id.split(target.type)[1].toUpperCase() }`] = target[types[target.type].value || 'value']

            const setLabel = (value, max) => {
                let _range = max.length
                let _value = value.toString()
    
                for (let i = 0; i < _range; i++) {
                    if (_value.length < _range) _value = `0${ _value }`
                }
    
                return _value
            }

            if (target.type != types.range.id) return
            const preview = document.querySelector(`#${ target.id }Preview`)
            preview.textContent = setLabel(window[`DEBUG_${ target.id.split(target.type)[1].toUpperCase() }`], target.max)
        }

        addEventsListeners() {
            if (this.querySelector('#menu')) {
                this.querySelector('#menu').addEventListener('mousedown', this.onMouseDownHandler, true)
                this.querySelector('#close').addEventListener('click', this.onCloseHandler)
            }
        }

        onMouseDownHandler(event) {
            this.state.isDown = true
            this.state.offset = [
                this.offsetLeft - event.clientX,
                this.offsetTop - event.clientY
            ]

            if (this.querySelector('#menu')) {
                this.querySelector('#menu').style.cursor = 'grabbing'
            }

            document.addEventListener('mouseup', this.onMouseUpHandler, true)
            document.addEventListener('mousemove', this.onMouseMove, true)
        }

        onMouseUpHandler(event) {
            this.state.isDown = false

            if (this.querySelector('#menu')) {
                this.querySelector('#menu').style.cursor = 'grab'
            }

            this.querySelector('#menu').removeEventListener('mousedown', this.onMouseDownHandler)
            document.removeEventListener('mouseup', this.onMouseUpHandler)
            document.removeEventListener('mousemove', this.onMouseMove)
        }

        onMouseMove(event) {
            if (this.state.isDown) {
                event.preventDefault()
                const mousePosition = {
                    x: event.clientX,
                    y: event.clientY
                }
                const position = [
                    mousePosition.x + this.state.offset[0],
                    mousePosition.y + this.state.offset[1]
                ]

                if (position[0] < 0) position[0] = 0
                if (position[1] < 0) position[1] = 0
                if (position[0] > window.innerWidth - this.offsetWidth) position[0] = window.innerWidth - this.offsetWidth
                if (position[1] > window.innerHeight - this.offsetHeight) position[1] = window.innerHeight - this.offsetHeight

                this.style.left = position[0] + 'px'
                this.style.top  = position[1] + 'px'
            }
        }

        removeEventsListeners() {
            this.querySelectorAll('input').forEach(element => {
                element.removeEventListener('change', this.saveValue)
                delete window[`DEBUG_${ element.id.split(element.type)[1].toUpperCase() }`]
            })
        }

        toggle() {
            if (this.state.isOpen) this.style.display = 'none'
            else this.style.display = 'flex'

            this.state.isOpen = !this.state.isOpen
        }

        onCloseHandler() {
            this.querySelector('form').style.display == 'none' ?
                this.querySelector('form').style.display = 'block' :
                this.querySelector('form').style.display = 'none'
        }

        render() {
            this.appendDOM(`
                ${
                    this.state.title ?
                        (() => {
                            return (`
                                <div id="menu">
                                    <span class="icon" id="close">
                                        <svg height="10" width="10" xmlns="http://www.w3.org/2000/svg">
                                            <polygon points="0,0 10,0 5,10" style="fill:black;" />
                                        </svg> 
                                    </span>
                                    <span>${ this.state.title }</span>
                                    <span class="icon">
                                        <svg height="12" width="12" xmlns="http://www.w3.org/2000/svg">
                                        </svg> 
                                    </span>
                                </div>
                            `)
                        })() :
                        ''
                }
                <form></form>
            `)

            this.style.left = this.state.offset[0] + 'px';
            this.style.top  = this.state.offset[1] + 'px';
            if (this.querySelector('#menu')) {
                this.querySelector('#menu').style.cursor = 'grab'
            }
        }
    })