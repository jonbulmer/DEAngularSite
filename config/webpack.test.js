var ExtractTextPlugin = require('extract-text-webpack-plugin');
var helpers = require('./helpers');

module.exports = {
    devtool: 'inline-source-map',

    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },            
            {
                test: /\.html$/,
                loader: 'html-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'null'
            },
            {
                test: /\.scss$/,
                use: ['style-loader',
                'css-loader',
                'sass-loader']
            },
            {
                test:/\.css$/,
                include: helpers.root('src','app'),
                loader: 'raw-loader'
            }
        ]
    }

}