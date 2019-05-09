import React, { useRef, useEffect } from 'react';
import DATA from '../../data.json';

// function maybeFetch(url, opts) {
// 	const controller = typeof AbortController!=='undefined' && new AbortController();
// 	const req = fetch(url, {
// 		...opts,
// 		signal: controller && controller.signal
// 	});
// 	req.cancel = () => {
// 		controller && controller.abort();
// 	};
// 	return req;
// }

// function usePromise(fetcher, props) {
// 	const v = useMemo(fetcher, props);
// 	if ('value' in v) return v.value;
// 	throw v.then(value => { v.value = value; });
// }

// let r;

// function getData() {
// 	let [data, set] = useState();
// 	let [loading, setLoading] = useState(false);

// 	if (data) return data;
// 	if (loading) return;
// 	if (typeof window==='undefined') {
// 		set(data = __non_webpack_require__('../../data.json').map(user => ({
// 			id: user.login.uuid,
// 			username: user.login.username,
// 			name: user.name.first + ' ' + user.name.last
// 		})));
// 	}
// 	else {
// 		setLoading(true);
// 		fetch('/api/users').then(r => r.json()).then(data => {
// 			set(data);
// 			setLoading(false);
// 		});
// 		// r = r || fetch('/api/users').then(r => r.json());
// 		// if ('value' in r) return r.value;
// 		// throw (r.then(v => r.value = v));
// 	}
// }

// export default function Stream() {
// 	// let [items, setItems] = useState([]);
// 	// useEffect(() => {
// 	// 	const req = maybeFetch('/api');
// 	// 	req.then(r => r.json()).then(setItems);
// 	// 	return req.cancel;
// 	// }, []);

// 	const items = DATA.map(user => ({
// 		id: user.login.uuid,
// 		username: user.login.username,
// 		name: user.name.first + ' ' + user.name.last
// 	}));
// 	// const items = getData();

// 	// if (!items) {
// 	// 	return <div class="stream loading">Loading...</div>;
// 	// }

// 	// let items;
// 	// if (typeof window==='undefined') {
// 	// 	items = __non_webpack_require__('../../data.json').map(user => ({
// 	// 		id: user.login.uuid,
// 	// 		username: user.login.username
// 	// 	}));
// 	// }
// 	// else {
// 	// 	items = usePromise(async () => console.log('fetching') || await (await fetch('/api')).json());
// 	// }

// 	return (
// 		<div className="stream">
// 			{items.map((profile, index) =>
// 				<Profile profile={profile} index={index} />
// 			)}
// 		</div>
// 	);
// }

export default function Stream() {
	const items = DATA.map(user => ({
		id: user.login.uuid,
		username: user.login.username,
		name: user.name.first + ' ' + user.name.last,
		avatar: user.picture.medium
	}));

	return (
		<div className="stream">
			{items.map(profile =>
				<Profile profile={profile} />
			)}
		</div>
	);
}


function Profile({ profile }) {
	const base = useRef();
	useEffect(() => {
		flash(base.current);
	}, []);

	return (
		<div className="list-group-item" ref={base}>
			<div className="avatar">
      	<img alt="avatar" src={profile.avatar} loading="lazy" />
    	</div>
			<div className="details">
				<div className="info">
					<p className="name">{profile.name}</p>
					<p className="location">{profile.username}</p>
				</div>
			</div>
		</div>
	);
}

/** Turn an element purple and then fade out. */
function flash(element) {
	element.style.backgroundColor = '#bd7aff';
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			element.style.transition = 'background-color 2s ease';
			element.style.backgroundColor = 'transparent';
		});
	});
}
