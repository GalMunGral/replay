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
                },
              },
            ],
          ],
          plugins: [
            "@babel/plugin-proposal-nullish-coalescing-operator",
            "./babel/babel-plugin-transform-elements",
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
};

const resolveConfig = {
  alias: {
    assets: path.join(__dirname, "assets"),
    lib: path.join(__dirname, "src/lib"),
  },
};

module.exports = {
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
