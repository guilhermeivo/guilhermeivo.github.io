import Vector3 from "../Math/Vector3.js"

export default class Button {
    constructor() {
        this.object = null
        this.inClick = false
        this.inAnimation = false
        this.position = 0
    }

    init(object) {
        this.object = object
    }

    async up() {
        if (!this.inClick) return

        this.inClick = false

        if (this.inAnimation) return

        let steps = 10
        for (let i = steps; i >= 0; i--) {
            if (this.inClick) return

            const t = i / steps
            const curve = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
            this.object.position.set(0, ((this.object.position.elements[1] - 0) * curve) + 0, 0)
            await new Promise(resolve => setTimeout(resolve, 1))
        }
    }

    async down() {
        if (this.inClick) return

        this.inClick = true
        this.inAnimation = true

        let steps = 10
        for (let i = steps; i >= 0; i--) {
            if (i < steps / 2) {
                this.inAnimation = false
                if (!this.inClick) {
                    this.inClick = true
                    this.up()
                    return
                }
            }

            const t = i / steps
            const curve = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
            this.object.position.set(0, ((this.object.position.elements[1] - -0.4) * curve) + -0.4, 0)
            await new Promise(resolve => setTimeout(resolve, 1))
        }
    }
}