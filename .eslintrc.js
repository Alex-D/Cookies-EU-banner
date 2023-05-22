/* eslint-env node, browser:false */

module.exports = {
	extends: [
		'@alex-d/eslint-config',
	],
	env: {
		node: true,
	},
	parserOptions: {
		project: './tsconfig.json',
	},
}
