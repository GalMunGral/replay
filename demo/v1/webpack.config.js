const NodemonPlugin = require("nodemon-webpack-plugin");
const path = require("path");

const moduleConfig = {
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
                  node: "current",
                },
              },
            ],
          ],
          plugins: ["@replay/babel-plugin-transform-elements"],
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
            name: "[name].[ext]",
            outputPath: "/fonts",
          },
        },
      ],
    },
  ],
};

const resolveConfig = {
  alias: {
    assets: path.join(__dirname, "assets"),
    lib: path.join(__dirname, "src/lib"),
  },
};

const clientConfig = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    path: path.join(__dirname, "public/build"),
    filename: "main.js",
    publicPath: "/build",
  },
  resolve: resolveConfig,
  module: moduleConfig,
  devtool: "source-map",
  devServer: {
    contentBase: [
      path.join(__dirname, "public"),
      path.join(__dirname, "assets"),
    ],
    historyApiFallback: true,
  },
};

const serverConfig = {
  target: "node",
  mode: "development",
  entry: {
    server: "./src/server.js",
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].js",
    // publicPath: "/",
  },
  resolve: resolveConfig,
  module: moduleConfig,
  devtool: "source-map",
  plugins: [
    new NodemonPlugin({
      script: "./build/server.js",
    }),
  ],
};

module.exports = (env) =>
  env.mode === "SSR" ? [clientConfig, serverConfig] : clientConfig;
