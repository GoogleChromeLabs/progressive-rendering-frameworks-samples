import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './components/app';

export default async function ssr({ streaming, ...props }) {
	if (streaming) {
		return ReactDOMServer.renderToNodeStream(<App {...props} />);
	}
	else {
		return ReactDOMServer.renderToString(<App {...props} />);
	}
}
