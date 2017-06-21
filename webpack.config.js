
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

let all_in_one = false;

let file_loader = all_in_one ? 'url-loader' : 'file-loader';


module.exports = {
    devtool: "source-map",
    entry: {
        app: ['babel-polyfill', './src/index.js'],
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
            test: /\.html$/,
            loader: 'html-loader?attrs[]=link:href&attrs[]=script:src'
        }, {
            test: /\.css$/,
            loaders: [
                "file-loader?name=css/[name].[ext]",
                "extract-loader?publicPath=../",
                'css-loader'
            ]
        }, {
            test: /\.(woff|woff2|eot|ttf|svg)$/,
            loader: `${file_loader}?name=fonts/[name].[ext]`
        }, {
            test: path.join(__dirname, 'static/favicon.ico'),
            loader: `${file_loader}?name=favicon.ico`
        }, {
            test: /static\/favicon\//,
            loader: `${file_loader}?name=favicon/[name].[ext]`,
        }, {
            test: /\.(png)$/,
            exclude: /static\/favicon\//,
            loader: `${file_loader}?name=images/[name].[ext]`,
        }, {
            test: /(mithril|openpgp(\.worker)?)(\.min)?\.js$/,
            loader: 'file-loader?name=js/[name].[ext]'
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
            inlineSource: all_in_one ? '.js$' : null
        }),
        new HtmlWebpackInlineSourcePlugin()
    ]
};
