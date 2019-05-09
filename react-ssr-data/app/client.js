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
import ReactDOM from 'react-dom';
import JssProvider from 'react-jss/lib/JssProvider';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createGenerateClassName from '@material-ui/core/styles/createGenerateClassName';
import App from './index';
import { collect } from './cached-fetch';

const generateClassName = createGenerateClassName();

ReactDOM.hydrate(
	<JssProvider generateClassName={generateClassName}>
		<MuiThemeProvider>
			<App url={location.pathname} />
		</MuiThemeProvider>
	</JssProvider>,
	window.approot
);

collect().then(() => {
	requestAnimationFrame(() => {
		performance.mark('hydrated');
		performance.measure('hydrated', 'navigationStart', 'hydrated');
		console.log(`Hydrated: ${performance.getEntriesByName('hydrated')[0].duration | 0}ms`);
	});
});
