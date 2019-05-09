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

export const CACHE = {};

let restored = false;
function restore() {
	restored = true;
	const c = typeof document !== 'undefined' && document.querySelector('script[type="text/props"]');
	if (c) {
		const entries = JSON.parse(c.textContent);
		for (let i in entries) {
			(CACHE[i] = Promise.resolve(entries[i])).value = entries[i];
		}
	}
}

export function getCache(url) {
	if (typeof window !== 'undefined' && !restored) restore();
	return CACHE[url] && CACHE[url].value;
}

export default function cachedFetch(url) {
	if (typeof window !== 'undefined' && !restored) restore();
	let req = CACHE[url];
	if (!req) {
		req = CACHE[url] = fetch(url).then(r => r.json()).then(value => req.value = value);
	}
	req.use = withValue;
	return req;
}

function withValue(successCallback, errorCallback) {
	if ('value' in this) {
		successCallback(this.value);
	}
	else {
		this.then(successCallback, errorCallback);
	}
}

export function collect() {
	const keys = Object.keys(CACHE);
	return Promise.all(keys.map(c => CACHE[c]))
		.then(() => new Promise(r => setTimeout(r, 10)))
		.then(() => {
			if (Object.keys(CACHE).join() !== keys.join()) {
				return collect();
			}
			const entries = {};
			for (let i in CACHE) {
				entries[i] = CACHE[i].value;
			}
			return entries;
		});
}
