module.exports = {
	presets: [
		['@babel/preset-env', {
			useBuiltIns: 'usage',
			corejs: 3,
			modules: false,
			loose: true
		}],
		'@babel/preset-react'
	],
	plugins: [
		'@babel/syntax-dynamic-import'
	]
};
