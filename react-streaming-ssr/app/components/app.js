import React from 'react';
import Stream from './stream';
import Header from './header';

const Suspense = typeof window==='undefined' ? p => p.children : React.Suspense;

export default function App () {
	return (
		<div id="app">
			<Header />
			<Suspense fallback={<div>loading</div>}>
				{new Array(100).fill().map(() => <Stream />)}
			</Suspense>
		</div>
	);
}
