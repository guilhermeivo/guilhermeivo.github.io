export default {
    vertice: [
        // Front face
        -1.0, -1.0, 1.0, 
        1.0, -1.0, 1.0, 
        1.0, 1.0, 1.0, 
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0, 
        -1.0, 1.0, -1.0, 
        1.0, 1.0, -1.0, 
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0, 
        -1.0, 1.0, 1.0, 
        1.0, 1.0, 1.0, 
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0, 
        1.0, -1.0, -1.0, 
        1.0, -1.0, 1.0, 
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0, 
        1.0, 1.0, -1.0, 
        1.0, 1.0, 1.0, 
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0, 
        -1.0, -1.0, 1.0, 
        -1.0, 1.0, 1.0, 
        -1.0, 1.0, -1.0,
    ],

    verticeIndice: [
        0, 1, 2, 0, 2, 3, // front
        4, 5, 6, 4, 6, 7, // back 
        8, 9, 10, 8, 10, 11, // top
        12, 13, 14, 12, 14, 15, // bottom 
        16, 17, 18, 16, 18, 19, // right
        20, 21, 22, 20, 22, 23, // left
    ],

    colorWithIndices: [
        236, 240, 241, // Front face: white
        236, 240, 241, // 
        236, 240, 241, // 
        236, 240, 241, // 
        231, 76, 60, // Back face: red
        231, 76, 60, // 
        231, 76, 60, // 
        231, 76, 60, // 
        46, 204, 113, // Top face: green
        46, 204, 113, // 
        46, 204, 113, // 
        46, 204, 113, // 
        52, 152, 219, // Bottom face: blue
        52, 152, 219, //
        52, 152, 219, //
        52, 152, 219, //
        241, 196, 15, // Right face: yellow
        241, 196, 15, // 
        241, 196, 15, // 
        241, 196, 15, // 
        155, 89, 182, // Left face: purple
        155, 89, 182, // 
        155, 89, 182, // 
        155, 89, 182, // 
    ],

    texcoordWithIndices: [
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
        0, 0,
    ]
}