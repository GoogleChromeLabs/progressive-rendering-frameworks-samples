import React from 'react';
import { Hydrator as ClientHydrator, ServerHydrator } from './hydrator';
import Intro from './intro';
import Header from './header';

let load = () => import('./stream');
let Hydrator = ClientHydrator;

if (typeof window === 'undefined') {
	Hydrator = ServerHydrator;
	load = () => require('./stream');
}

export default function App() {
	return (
		<div id="app">
			<Header />

			<Intro />

			{/* <Stream flush={flushing} /> */}
			<Hydrator load={load} />
		</div>
	);
}
