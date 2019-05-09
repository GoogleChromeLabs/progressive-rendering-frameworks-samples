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
import cachedFetch from './cached-fetch';

export default class Comments extends React.Component {
	componentWillMount() {
		this.update(this.props);
	}

	componentWillReceiveProps(nextProps) {
		this.update(nextProps);
	}

	update(props) {
		const url = `/api/2.2/questions/${props.question}/comments?order=desc&sort=creation&site=stackoverflow&filter=!6JW86p(KK2A)N`;
		cachedFetch(url).use(data => {
			this.setState({ data });
		});
	}

	render() {
		const { data } = this.state || {};

		return (
			<div className="comments">
				{data && data.items.map(item => (
					<article className="comment" key={item.comment_id}>
						<div dangerouslySetInnerHTML={{ __html: item.body }} />
						<h5 className="author">
							<img src={item.owner.profile_image} />
							{item.owner.display_name}
						</h5>
						<time>{new Date(item.creation_date).toLocaleDateString()}</time>
					</article>
				))}
			</div>
		);
	}
}
