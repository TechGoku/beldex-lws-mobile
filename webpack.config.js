const path = require('path');
const fs = require('fs');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const Dotenv = require('dotenv-webpack')

function readServerUrlFromEnvFile() {
  const envFiles = ['.env', '.env.defaults'];

  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, envFile);
    if (!fs.existsSync(envPath)) {
      continue;
    }

    const envContents = fs.readFileSync(envPath, 'utf8');
    const serverUrlMatch = envContents.match(/^SERVER_URL=(.+)$/m);

    if (serverUrlMatch) {
      return serverUrlMatch[1].trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    }
  }

  return 'lwsapi.beldex.dev';
}

const devProxyTarget = `https://${readServerUrlFromEnvFile()}`;

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'index_bundle.js',
    publicPath: '/'
  },
  devServer: {
    historyApiFallback: true,
    proxy: [
      {
        context: ['/api'],
        target: devProxyTarget,
        changeOrigin: true,
        secure: true,
        pathRewrite: { '^/api': '' }
      }
    ],
    // static: './dist',
    // port: 3000,
    // contentBase: path.resolve(__dirname, "dist"),
    // historyApiFallback: { index: "/", disableDotRule: true },
  },
  module: {
    rules: [
      {
        test: /\.(jsx|js)?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(tsx|ts)?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

      {
        test: /\.(jpe?g|png|gif|svg|woff2?|ttf|eot)$/i,
        // webpack 5 asset modules, NOT url-loader: with url-loader the emitted
        // .woff assets contained the JS module source ("export default ...")
        // instead of font bytes, so the WebView failed to decode every font.
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              // Prefer `dart-sass`
              implementation: require("sass"),
            },
          },
        ],
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json', '.scss'],
    fallback: {
      fs: false,
      util: require.resolve('util/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify'),
      vm: require.resolve('vm-browserify'),
      process: require.resolve('process/browser')
    }
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './public/index.html',
      filename: './index.html',
      favicon:'./public/favicon.ico'
    }),
    new webpack.ProvidePlugin({
      process: 'process',
      Buffer: ['buffer', 'Buffer'],
    }),
    new CopyPlugin({
      patterns: [
        { from: './node_modules/@bdxi/beldex-app-bridge/BeldexLibAppCpp_WASM.js', to: '../dist/assets/BeldexLibAppCpp_WASM.js', force: true, noErrorOnMissing: true },
        { from: './node_modules/@bdxi/beldex-app-bridge/BeldexLibAppCpp_WASM.wasm', to: '../dist/assets/BeldexLibAppCpp_WASM.wasm', force: true, noErrorOnMissing: true },
      ]
    }),
    new Dotenv({
      defaults: true
    })
    // new webpack.ProvidePlugin({dist
    //   process: 'process/browser',
    // }),
  ]
}
