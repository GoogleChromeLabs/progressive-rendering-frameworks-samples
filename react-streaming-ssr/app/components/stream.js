import React from 'react';

let r;

function getData() {
	if (typeof window==='undefined') {
		// during SSR, load data from a file synchronously:
		return __non_webpack_require__('../../data.json').map(user => ({
			id: user.login.uuid,
			username: user.login.username,
			name: user.name.first + ' ' + user.name.last
		}));
	}
	else {
		// at runtime, request via the API:
		r = r || fetch('/api/users').then(r => r.json());
		if ('value' in r) return r.value;
		// throw a Promise to re-render once available:
		throw (r.then(v => r.value = v));
	}
}

export default function Stream() {
	const items = getData();

	return (
		<div className="stream">
			{items.map(profile =>
				<Profile profile={profile} />
			)}
		</div>
	);
}

function Profile({ profile }) {
	return (
		<div className="profile">
			<h4>{profile.name}</h4>
			<h5>{profile.username}</h5>
		</div>
	);
}
