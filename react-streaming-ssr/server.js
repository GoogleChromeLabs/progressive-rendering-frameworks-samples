import path from 'path';
import fetch from 'node-fetch';
import express from 'express';
import ssr from './build/ssr/main.js';
import DATA from './data.json';

global.fetch = function (url, opts) {
	if (url[0] == '/') {
		let { address, port } = listener.address();
		if (address == '::') address = 'localhost';
		url = `http://${address}:${port}${url}`;
	}
	return fetch(url, opts);
};

const app = express();

app.get('/favicon.ico', (req, res) => res.end());

app.use('/client.js', (req, res) => res.redirect('/build/client.js'));

// Simulate slow network using an artificial delay for page & resource requests:
const DELAY = 500;
app.use((req, res, next) => {
	setTimeout(() => {
		next();
	}, DELAY);
});

/** API Proxy */
app.get('/api/users', (req, res) => {
	res.json(DATA.map(user => ({
		id: user.login.uuid,
		username: user.login.username,
		name: user.name.first + ' ' + user.name.last
	})));
});
app.get('/api/users/:user', (req, res) => {
	const user = DATA.filter(user => user.login.uuid === req.params.user || user.login.username === req.params.user)[0];
	if (user) res.json(user);
	else res.status(404).json({ error: 'user not found' });
});

const BEFORE = `
<!DOCTYPE html><html><head>
  <script type="module" defer src="/build/client.js"></script><link rel="stylesheet" href="/style.css"></head>
  <body><div id="approot">
`.replace(/\n\s*/g, '');

/** SSR */
app.get('/', async (request, response) => {
	try {
		const renderComplete = ssr({
			url: request.url,
			streaming: false
		});
		response.useChunkedEncodingByDefault = true;
		response.writeHead(200, {
			'content-type': 'text/html',
			'content-transfer-encoding': 'chunked',
			'x-content-type-options': 'nosniff'
		});
		response.write(BEFORE);
		response.flushHeaders();
		const html = await renderComplete;
		response.write(html);
		response.write('</div></body></html>');
		response.end();
	}
	catch (err) {
		if (!response.headersSent) {
			response.writeHead(500, {
				// @see https://twitter.com/_developit/status/1123041336054177792
				'content-type': 'text/pain'
			});
		}
		response.end(String(err && err.stack || err));
	}
});

app.get('/streaming', async (request, response) => {
	try {
		const stream = await ssr({
			url: request.url
		});
		// Wait until data starts flowing to send a 200 OK,
		// so errors don't trigger "headers already sent".
		const start = Date.now();
		stream.on('data', function handleData() {
			console.log('Render Start: ', Date.now() - start);
			stream.off('data', handleData);
			response.useChunkedEncodingByDefault = true;
			response.writeHead(200, {
				'content-type': 'text/html',
				'content-transfer-encoding': 'chunked',
				'x-content-type-options': 'nosniff'
			});
			response.write(BEFORE);
			response.flushHeaders();
		});
		await new Promise((resolve, reject) => {
			stream.on('error', err => {
				stream.unpipe(response);
				reject(err);
			});
			stream.on('end', () => {
				console.log('Render End: ', Date.now() - start);
				response.write('</div></body></html>');
				response.end();
				resolve();
			});
			stream.pipe(response, { end: false });
		});
	}
	catch (err) {
		response.writeHead(500, {
			'content-type': 'text/pain'
		});
		response.end(String(err && err.stack || err));
		return;
	}
});

app.use(express.static(path.resolve(__dirname, 'app')));
app.use('/build', express.static(path.resolve(__dirname, 'build')));

const listener = app.listen(process.env.PORT || 2048, () => {
	console.log('Your app is listening on port ' + listener.address().port);
});
