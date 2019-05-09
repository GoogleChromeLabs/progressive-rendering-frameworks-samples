/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import { rollup } from 'rollup';
import buble from 'rollup-plugin-buble';
// import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export function bundle({ entry, cache, format = 'es', nodeModules = true } = {}) {
	return rollup({
		input: entry,
		plugins: [
			buble({
				exclude: '**/node_modules/**',
				transforms: {
					asyncAwait: false,
					classes: false
				}
			}),
			replace({
				'process.env.NODE_ENV': JSON.stringify('production')
			}),
			nodeModules && nodeResolve({}),
			nodeModules && commonjs({})
		].filter(Boolean),
		cache
	}).then(result => {
		cache = result.cache;
		return result.generate({
			format,
			compact: true,
			sourceMap: false
		});
	}).then(({ output }) => {
		const code = output.filter(o => o.isEntry)[0].code;
		return { code, cache };
	});
}
