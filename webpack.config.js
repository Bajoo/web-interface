

module.exports = {
    devtool: "source-map",
    entry: "./src/index.js",
    output: {
        sourceMapFilename: "bundle.js.map",
        pathinfo: (process.env.NODE_ENV !== 'production'),
        path: __dirname + '/bin/', //Path where the bundle should be exported
        filename: "bundle.js"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            options: {
                presets: ['es2015'],
                plugins: [
                    ["babel-plugin-transform-builtin-extend", {
                        globals: ["Error", "Array"]
                    }]
                ]
            },
            exclude: [/node_modules/]
        }]
    }
};
