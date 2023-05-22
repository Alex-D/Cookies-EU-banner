import rollupTypeScript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'

export default {
	input: 'src/index.ts',
	output: [
		{
			file: 'dist/cookies-eu-banner.mjs',
			format: 'es',
		},
	],
	plugins: [
		rollupTypeScript(),
		terser(),
	],
}
