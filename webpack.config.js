
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const extract_html = new ExtractTextPlugin('index.html');
const extract_css = new ExtractTextPlugin('style.css');


const common_loaders = [
    {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
    }, {
        test: path.join(__dirname, 'static/favicon.ico'),
        loader: 'file-loader?name=favicon.ico'
    }, {
        test: /static\/favicon\//,
        loader: 'file-loader?name=favicon/[name].[ext]',
    }, {
        test: /\.(png)$/,
        exclude: /static\/favicon\//,
        loader: 'file-loader?name=images/[name].[ext]',
    }, { // Copy CSS vendor dependencies, and extract related dependencies (fonts, images)
        test: /\.css$/,
        include: /node_modules/,
        loaders: [
            "file-loader?name=[ext]/[name].[ext]",
            "extract-loader?publicPath=../",
            'css-loader'
        ],
    }, {
        test: /\.js$/,
        include: [/node_modules\/openpgp/, /node_modules\/mithril/],
        loader: 'file-loader?name=[ext]/[name].[ext]',
    }
];


module.exports = [
    { // HTML build config
        entry: './index.html',
        output: {
            pathinfo: (process.env.NODE_ENV !== 'production'),
            path: path.join(__dirname, 'dist'),
            filename: 'index.html'
        },
        module: {
            loaders: [{
                test: /\.html$/,
                loader: extract_html.extract({
                    use: {
                        loader: 'html-loader',
                        options: {
                            attrs: [
                                'link:href',
                                'script:src'
                            ]
                        }
                    }
                })
            }, { // Update source path to match location of other built chunks.
                test: /\.(js|css)$/,
                exclude: /node_modules/,
                loader: 'file-loader',
                options: {
                    emitFile: false,
                    name: './[ext]/[name].[ext]'
                }
            }
            ].concat(common_loaders)
        },
        plugins: [extract_html]
    }, {
        // CSS build config
        entry: './css/style.css',
        output: {
            pathinfo: (process.env.NODE_ENV !== 'production'),
            path: path.join(__dirname, 'dist/css'),
            filename: 'style.css'
        },
        module: {
            loaders: [{
                test: /\.css$/,
                exclude: /node_modules/,
                loader: extract_css.extract({
                    use: 'css-loader'
                })
            }]
        },
        plugins: [extract_css]
    }, {
        // JS build config
        devtool: "source-map",
        entry: {
            index: ['babel-polyfill', './src/index.js'],
        },
        output: {
            sourceMapFilename: "js/[name].js.map",
            pathinfo: (process.env.NODE_ENV !== 'production'),
            path: path.join(__dirname, 'dist'),
            filename: "js/[name].js"
        },
        externals: {
            mithril: 'm',
            openpgp: 'openpgp'
        },
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            }].concat(common_loaders)
        }
    }
];
