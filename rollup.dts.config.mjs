import dts from 'rollup-plugin-dts'

import config from './rollup.config.mjs'
import rollupTypeScript from "@rollup/plugin-typescript";

config.output = [
	{
		file: 'dist/cookies-eu-banner.d.ts',
		format: 'es',
	},
]
config.plugins = [
	rollupTypeScript(),
	dts(),
]

export default config
