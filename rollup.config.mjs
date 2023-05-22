import rollupTypeScript from '@rollup/plugin-typescript'

export default {
	input: 'src/index.ts',
	output: [
		{
			file: 'dist/check-disk-space.cjs',
			format: 'cjs',
			exports: 'named',
		},
		{
			file: 'dist/check-disk-space.mjs',
			format: 'es',
		},
	],
	plugins: [
		rollupTypeScript(),
	],
	external: [
		'child_process',
		'fs',
		'os',
		'path',
		'process',
	],
}
