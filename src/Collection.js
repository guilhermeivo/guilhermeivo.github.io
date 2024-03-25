export default class Collection {
    constructor(name) {
        this.name = name || `${ Math.floor(Math.random() * Math.pow(10, 5)) }_${ Date.now() }`
        this.objects = []

        this.type = 'collection'
    }
}