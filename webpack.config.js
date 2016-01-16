var webpack = require('webpack');

var plugins = [];
if (process.env.WEBPACK === 'release') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }));
}

module.exports = {
  entry: './build/main.js',
  output: {
    path: 'static/build',
    publicPath: 'static/build',
    filename: '_bundle.js'
  },
  devtool: 'source-map',
  plugins: plugins
};
