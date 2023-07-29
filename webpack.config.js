const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const isProduction = process.argv.some(a => a === "production");

/* eslint-disable quote-props */

module.exports = {
    mode: "development",
    entry: "./src/game.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                exclude: /\.lazy\.css$/i,
                use: ["style-loader", {loader: "css-loader", options: {"url": false, "import": false}}, "postcss-loader"],
            },
            {
                test: /\.lazy\.css$/i,
                use: [{loader: "style-loader", options: {injectType: "lazyStyleTag"}}, {loader: "css-loader", options: {"url": false, "import": false}}, "postcss-loader"],
            },
            {
                test: /\.(glsl|vert|frag)$/,
                type: "asset/source",
            },
        ]
    },
    plugins: [
        new CopyWebpackPlugin({patterns: [
            {
                from: "assets",
                to: "assets"
            }
        ]}),
        new HtmlWebpackPlugin({
            template: "src/index.html"
        }),
        new webpack.DefinePlugin({
            "process.env.PROD": isProduction
        }),
    ],
    devServer: {
        static: [path.join(__dirname, "assets")],
        compress: true,
        port: 9000,
    }
};