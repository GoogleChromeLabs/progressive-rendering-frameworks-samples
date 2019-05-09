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

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { SheetsRegistry } from 'jss';
import JssProvider from 'react-jss/lib/JssProvider';
import { CACHE, collect } from './cached-fetch.js';
import App from './index.js';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createGenerateClassName from '@material-ui/core/styles/createGenerateClassName';

// 1: only render the first level of component data depenencies
// 2: render the 1st and 2nd (derivative data)
// etc
const MAX_DEPTH = 2;

function attempt(App, props, maxDepth = MAX_DEPTH, successHintCallback, depth = 0) {
	ReactDOMServer.renderToString(<App {...props} />);
	return collect().then(cache => {
		let html = ReactDOMServer.renderToString(<App {...props} />);
		if (successHintCallback) {
			successHintCallback(html);
		}
		if (++depth < maxDepth && Object.keys(CACHE).length > Object.keys(cache).length) {
			return attempt(App, props, maxDepth, null, depth);
		}
		return cache;
	});
}

export default function ssr(props, maxDepth, successHintCallback) {
	const sheetsRegistry = new SheetsRegistry();
	const sheetsManager = new Map();
	const ServerApp = (props) => {
		const generateClassName = createGenerateClassName();
		sheetsRegistry.reset();
		sheetsManager.clear();
		return (
			<JssProvider registry={sheetsRegistry} generateClassName={generateClassName}>
				<MuiThemeProvider sheetsManager={sheetsManager}>
					<App {...props} />
				</MuiThemeProvider>
			</JssProvider>
		);
	}

	return attempt(ServerApp, props, maxDepth, successHintCallback).then(cache => {
		let html = ReactDOMServer.renderToString(<ServerApp {...props} />);
		if (Object.keys(cache).length > 0) {
			html += `<script type="text/props">${JSON.stringify(cache)}</script>`;
		}
		html = `<style id="jss-server-side">${sheetsRegistry.toString()}</style>` + html;
		return html;
	});
}
