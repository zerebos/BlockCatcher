const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

/* eslint-disable quote-props */

module.exports = function(_, info) {
    return {
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
            new HtmlWebpackPlugin({
                title: "Output Management",
                template: "src/index.html"
            }),
            new webpack.DefinePlugin({
                "process.env.PRODUCTION": info.mode === "production"
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
};