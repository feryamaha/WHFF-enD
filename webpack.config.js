/* const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle[hash].js',
        publicPath: '/',
    },
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',

    resolve: {
        extensions: ['.js', '.jsx', '.scss'],
    },

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
                test: /\.json$/,
                type: 'json',
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/, // Regra para imagens
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name][ext]', // Coloca as imagens na pasta dist/assets/
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
}; */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const path = require('path');

// Log para depurar o ambiente
console.log('NODE_ENV durante o build:', process.env.NODE_ENV);

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
            publicPath: process.env.NODE_ENV === 'production' ? '/WHFF-enD/' : '/', // Forçar publicPath no plugin
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