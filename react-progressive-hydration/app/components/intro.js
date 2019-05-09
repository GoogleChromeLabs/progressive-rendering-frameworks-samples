import React from 'react';

export default function Intro() {
	return (
		<div class="intro">
			<div class="hero"></div>
			<p>This is an example of how server-side rendered React can enable <strong>progressively hydrated</strong> experiences.</p>
			<p><strong>Scroll down.</strong> The flash of color you see is an indicator of JavaScript being fetched without any direct change to the UI.</p>
		</div>
	);
}
