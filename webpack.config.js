const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle[hash].js',
        publicPath: process.env.NODE_ENV === 'production' ? '/WHFF-end/' : '/',
    },
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map', // Source maps em dev, desativado em prod

    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public', 'index.html')
        }),
        ...(process.env.NODE_ENV === 'production' ? [new CleanWebpackPlugin()] : []),
    ],

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ],
            },
            {
                test: /\.json$/, // Suporte para arquivos JSON
                type: 'asset/resource',
                generator: {
                    filename: 'data/[name][ext]', // Coloca os arquivos JSON em dist/data/
                },
            },
        ]
    },

    devServer: {
        port: 3000,
        historyApiFallback: true,
        hot: true,
        open: true,
        static: path.resolve(__dirname, 'public'),
        client: {
            logging: 'info',
            overlay: {
                errors: true,
                warnings: false,
            },
        },
    },
};