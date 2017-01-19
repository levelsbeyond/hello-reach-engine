var rucksack = require('rucksack-css');
var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
require('babel-polyfill');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var config = {
	devtool: 'source-map',
	context: path.join(__dirname, './src'),
	entry: {
		jsx: './index.js',
		vendor: ['react', 'debug']
	},
	output: {
		path: path.join(__dirname, './build'),
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.(css|scss)$/,
				loader: ExtractTextPlugin.extract(
					['css', 'sass'].join('!')
				)
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				loaders: ['babel-loader']
			},
		],
	},
	resolve: {
		root: path.join(__dirname, './src'),
		extensions: ['', '.js', '.jsx']
	},
	postcss: [
		rucksack({
			autoprefixer: true
		})
	],
	plugins: [
		new ExtractTextPlugin('styles.css', {
			allChunks: true
		}),
		new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
		new webpack.DefinePlugin({
			'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development') }
		}),
		new HtmlWebpackPlugin({title: 'Hello, Reach Engine.'})
	],
	devServer: {
		contentBase: './src',
		hot: true
	}
}

module.exports = config;
