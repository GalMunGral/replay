const path = require("path");
const { ProvidePlugin } = require("webpack");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  resolve: {
    alias: {
      assets: path.resolve(__dirname, "assets"),
      "@runtime": path.resolve(__dirname, "lib/runtime"),
      "@components": path.resolve(__dirname, "src/components"),
      "@observables": path.resolve(__dirname, "src/observables"),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: "last 2 Chrome versions",
                  },
                },
              ],
            ],
            plugins: [
              "@babel/plugin-proposal-nullish-coalescing-operator",
              "./lib/babel/babel-plugin-transform-elements",
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(svg|jpg|png)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 8192,
          },
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/, // copied
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "/fonts",
            },
          },
        ],
      },
    ],
  },
  devtool: "source-map",
  plugins: [
    new ProvidePlugin({
      _: "lodash",
      observable: [
        path.resolve(__dirname, "lib/runtime/observable"),
        "observable",
      ],
      decor: [path.resolve(__dirname, "lib/runtime/decorator"), "decor"],
    }),
  ],
  output: {
    path: path.join(__dirname, "public/build"),
    filename: "main.js",
    publicPath: "/build",
  },
  devServer: {
    contentBase: [
      path.join(__dirname, "public"),
      path.join(__dirname, "assets"),
    ],
    historyApiFallback: true,
  },
};
