import React, { useState, useEffect } from 'react';
import Counter from './counter';

// check if the page is scrolled
const isScrolled = () => typeof window !== 'undefined' && Math.round('scrollY' in window ? window.scrollY : window.pageYOffset) > 0;

// little helper for global event registration
function useGlobalListener(event, handler) {
	useEffect(() => {
		addEventListener(event, handler);
		return () => removeEventListener(event, handler);
	});
}

export default function Header() {
	const [scrolled, setScrolled] = useState(isScrolled);
	useGlobalListener('scroll', () => {
		setScrolled(isScrolled());
	});

	return (
		<header className={`header ${scrolled ? ' scrolled' : ''}`}>
			<h1 class="icon">🍔</h1>
			<h1>Progressive Hydration</h1>
			<Counter />
		</header>
	);
}