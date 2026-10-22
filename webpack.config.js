const path = require('path');
// creates index.html file by a template index.ejs
const HtmlWebpackPlugin = require('html-webpack-plugin');
// copies the assets folder into dist folder
const CopyWebpackPlugin = require('copy-webpack-plugin');
// output folder location
const distFolder = "./dist";

module.exports = (env, argv) => ({
  mode: argv.mode || 'development',
  entry: './src/index.ts',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.ejs'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' }
      ],
    })
  ],
  devtool: argv.mode === 'production' ? 'source-map' : 'inline-source-map',
  devServer: {
    static: distFolder
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    splitChunks: {
        cacheGroups: {
            // only initial chunks, so lazily loaded modules (inspector) stay in their own chunk
            commons: {
                test: /[\\/]node_modules[\\/]/,
                name: "vendors",
                chunks: "initial"
            }
        }
    }
  },
  performance: {
    hints: false
  },
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ]
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, distFolder),
    // cleans dist folder
    clean: true
  }
});
