import React, { useState } from 'react';

export default function CounterButton() {
	const [count, setCount] = useState(0);

	return <button class="counter" onClick={() => setCount(count + 1)}>{count}</button>;
}
