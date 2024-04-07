`use strict`

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
                isOpen: false
            }
        }

        connectedCallback() {
            if (!this.rendered) {
                this.render()
                this.rendered = true
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

        render() {
            this.appendDOM(`<form></form>`)
        }
    })