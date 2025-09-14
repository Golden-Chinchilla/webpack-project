// webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
    mode: "development",                   // 或 production
    entry: "./src/index.tsx",              // 入口
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]   // 支持 ts/tsx
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                use: "swc-loader",               // 用 swc 转译 TS/JSX
                exclude: /node_modules/
            },
            {
                test: /\.css/,
                use: ["style-loader", "css-loader", "postcss-loader"],
                // use: ["style-loader", "css-loader"],
                exclude: /node_modules/ // 处理 CSS 和 Tailwind
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "public/index.html"), // 以它为模板
        }),
        new webpack.DefinePlugin({
            'INFURA_KEY': JSON.stringify(process.env.INFURA_KEY),
        }),
    ],
};
