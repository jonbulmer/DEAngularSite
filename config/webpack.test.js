var ExtractTextPlugin = require('extract-text-webpack-pugin');
var helpers = require('./helpers');

module.exports = {
    devtool: 'inline-source-map',

    reslove: {
        extentions: ['', '.ts', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },            
            {
                test: /\.html$/,
                loader: 'html'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'null'
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style','css!sass')
            },
            {
                test:/\.css$/,
                include: helpers.root('src','app'),
                loader: 'raw'
            }
        ]
    }

}