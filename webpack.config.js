import path from 'path'

export default {
    entry: {
        index: './src/index.js',
        common: './src/common/common.js',
        components: './src/components/index.js',
        example: './src/example.js'
    },
    output: {
    filename: '[name].bundle.js',
        path: path.resolve('', 'dist'),
    },
};