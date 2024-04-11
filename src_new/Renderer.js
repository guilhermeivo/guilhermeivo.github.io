export default class Renderer {
    constructor() {
        this.domElement = null
    }

    render(scene, camera) {
        this.renderScene(scene, camera)
    }

    renderScene(scene, camera) {
        const objects = scene.children

        this.renderObjects(objects, scene, camera)
    }

    renderObjects(objectList, scene, camera) {
        objectList.forEach(object => {
            this.renderObject(object, scene, camera)
        })
    }

    renderObject(object, scene, camera) {
        object.onBeforeRender()

        // calc matrices
        

        object.onBeforeRender()

        // set program, material, drawarray, ...

        object.onAfterRender()
    }
}