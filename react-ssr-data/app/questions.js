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

import React from 'react';
import Comments from './comments';
import cachedFetch from './cached-fetch';

export default class Questions extends React.Component {
	componentWillMount() {
		this.update(this.props);
	}

	componentDidMount() {
		requestAnimationFrame(() => {
			performance.mark('interactive');
			performance.measure('interactive', 'navigationStart', 'interactive');
			console.log(`Interactive: ${performance.getEntriesByName('interactive')[0].duration | 0}ms`);
		});
	}

	componentWillReceiveProps(nextProps) {
		this.update(nextProps);
	}

	update(props) {
		const url = `/api/2.2/questions?order=desc&sort=activity&tagged=${[].concat(props.tags || []).map(encodeURIComponent).join(',')}&site=stackoverflow`;
		cachedFetch(url).use(data => {
			this.setState({ data });
		});
	}

	render() {
		const { data } = this.state || {};
		const renders = (this.renders = (this.renders || 0) + 1);

		return (
			<div className="questions">
				<pre>
					Rendered on the {typeof window == 'undefined' ? 'server' : 'client'} ({renders} times)
        </pre>

				<section>
					{data && data.items.map((item, index) => (
						<article key={item.question_id}>
							<h4><a href={item.link} target="_blank">{item.title}</a></h4>
							<h5 className="author">
								<img src={item.owner.profile_image} />
								{item.owner.display_name}
							</h5>
							{index < 5 && <Comments question={item.question_id} />}
						</article>
					))}
				</section>
			</div>
		);
	}
}
