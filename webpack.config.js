

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Adiciona o plugin
const path = require('path');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle[hash].js',
        publicPath: process.env.NODE_ENV === 'production' ? '/WHFF-enD/' : '/',
    },
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',

    resolve: {
        extensions: ['.js', '.jsx', '.scss'],
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public', 'index.html'),
        }),
        ...(process.env.NODE_ENV === 'production' ? [new CleanWebpackPlugin()] : []),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'public/data'),
                    to: path.resolve(__dirname, 'dist/data'),
                },
            ],
        }),
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
                test: /\.json$/,
                type: 'json',
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name][ext]',
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