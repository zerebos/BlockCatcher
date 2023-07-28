const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

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
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.lazy\.css$/i,
                use: [{loader: "style-loader", options: {injectType: "lazyStyleTag"}}, "css-loader"],
            },
            {
                test: /\.(glsl|vert|frag)$/,
                type: "asset/source",
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Output Management",
            template: "src/index.html"
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, "public"),
        },
        compress: true,
        port: 9000,
    }
};