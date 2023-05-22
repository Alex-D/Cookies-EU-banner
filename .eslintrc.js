/* eslint-env node, browser:false */

module.exports = {
	extends: [
		'@alex-d/eslint-config',
	],
	env: {
		browser: true,
	},
	parserOptions: {
		project: './tsconfig.json',
	},
}
