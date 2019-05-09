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

import path from 'path';
import vm from 'vm';
import { bundle } from './bundler';
import fetch from 'node-fetch';
import express from 'express';
import compression from 'compression';


const STACK_EXCHANGE_KEY = process.env.STACK_EXCHANGE_KEY;
if (!STACK_EXCHANGE_KEY) {
	console.error(`
  Error: No Stack Exchange key provided.
  Register at https://stackapps.com/apps/oauth/register,
  then provide the "Key" value when running:
    STACK_EXCHANGE_KEY=abc123 npm start
  `);
}

// Fetch used during SSR that allows requesting from the Express server
function fetchWithLoopback(url, opts) {
	if (url[0] == '/') {
		let { address, port } = listener.address();
		if (address == '::') address = 'localhost';
		url = `http://${address}:${port}${url}`;
	}
	return fetch(url, opts);
}


const MIMES = {
	js: 'application/javascript',
	mjs: 'application/javascript',
	css: 'text/css',
	html: 'text/html'
};

const CACHES = new Map();

const app = express();

app.use(compression());

/** SSR */
app.get('/', async (request, response) => {
	const file = path.resolve(__dirname, '..', 'app', 'server.js');
	const { code, cache } = await bundle({
		entry: file,
		cache: CACHES.get(file),
		format: 'cjs'
	})
	CACHES.set(file, cache);
	const mod = { exports: {} };
	try {
		vm.runInNewContext(code, {
			require,
			module: mod,
			exports: mod.exports,
			setTimeout,
			clearTimeout,
			fetch: fetchWithLoopback
		});
	} catch (e) {
		console.log('Error running server bundle: ', e);
	}
	let html;
	let sent = false;
	const ready = () => {
		if (sent) return;
		sent = true;
		response.writeHead(200);
		response.write(
			`<!DOCTYPE html><html><head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="/style.css">
        <script type="module" defer src="/client.js"></script>
      </head><body>`
		);
	};
	try {
		const render = mod.exports && mod.exports.default || mod.exports;
		html = await render({
			url: request.url
		}, request.query.depth, ready);
	} catch (e) { console.log(e); }
	ready();
	response.end(`<div id="approot">${html}</div></body></html>`);
});

app.use('/', (req, res, next) => {
	const url = req.url.replace(/[^/]+\/\.\.(\/|$)/g, '$1');
	const file = path.resolve(__dirname, '..', 'app', url.substring(1));
	const ext = (file.match(/\.([a-z0-9]+)$/) || [])[1];

	// only process JS files:
	if (ext !== 'js' && ext !== 'mjs') return next();

	const start = Date.now();
	const cache = CACHES.get(file);
	bundle({ entry: file, cache }).then(({ code, cache }) => {
		CACHES.set(file, cache);
		res.writeHead(200, {
			'content-type': MIMES[ext],
			'x-bundle-time': Date.now() - start
		});
		res.end(code);
	});
});

app.use(express.static(path.resolve(__dirname, '..', 'app')));

app.get('/favicon.ico', (req, res) => res.end());

/** API Proxy */
app.use('/api', (req, res, next) => {
	const url = new URL(req.url, 'https://api.stackexchange.com');
	const params = new URLSearchParams(url.search);
	params.set('key', STACK_EXCHANGE_KEY);
	url.search = params;
	const headers = {};
	for (let i in req.headers) if (i != 'host' && i != 'cookie') headers[i] = req.headers[i];
	fetch(url.href, {
		method: req.method,
		body: req.body,
		headers
	}).then(r => {
		res.writeHead(r.status, res.headers);
		r.body.pipe(res);
	}).catch(next);
});

const listener = app.listen(process.env.PORT || 2048, () => {
	console.log('Your app is listening on port ' + listener.address().port);
});
