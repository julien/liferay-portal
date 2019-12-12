/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import {fetch} from 'frontend-js-web';
import {useCallback, useReducer} from 'react';

import {SERVICE_NETWORK_STATUS_TYPES} from '../../app/config/constants/serviceNetworkStatusTypes';

/**
 * Returns a new formData built from the given object.
 * @param {{ portletNamespace: string }} config Application configuration constants
 * @param {object} body
 * @return {FormData}
 * @review
 */
function getFormData({portletNamespace}, body) {
	const formData = new FormData();

	Object.entries(body).forEach(([key, value]) => {
		formData.append(`${portletNamespace}${key}`, value);
	});

	return formData;
}

const initialState = {
	error: null,
	lastFetch: null,
	networkStatus: SERVICE_NETWORK_STATUS_TYPES.Unused
};

const reducer = (state, action) => ({
	...state,
	...action
});

const useService = config => {
	const [state, dispatch] = useReducer(reducer, initialState);

	/**
	 * Performs a POST request to the given url and parses an expected object response.
	 * If the response status is over 400, or there is any "error" or "exception"
	 * properties on the response object, it rejects the promise with an Error object.
	 * @param {string} url
	 * @param {object} [body={}]
	 * @private
	 * @return {Promise<object>}
	 * @review
	 */
	const fetcher = useCallback(
		(url, body = {}) => {
			dispatch({networkStatus: SERVICE_NETWORK_STATUS_TYPES.Fetching});

			return fetch(url, {
				body: getFormData(config, body),
				method: 'POST'
			})
				.then(
					response =>
						new Promise((resolve, reject) => {
							response
								.clone()
								.json()
								.then(body => resolve([response, body]))
								.catch(() => response.clone().text())
								.then(body => resolve([response, body]))
								.catch(reject);
						})
				)
				.then(([response, body]) => {
					if (typeof body === 'object') {
						if ('exception' in body) {
							dispatch({
								error: body.exception,
								networkStatus:
									SERVICE_NETWORK_STATUS_TYPES.Error
							});
							return;
						} else if ('error' in body) {
							dispatch({
								error: body.error,
								networkStatus:
									SERVICE_NETWORK_STATUS_TYPES.Error
							});
							return;
						}
					}

					if (response.status >= 400) {
						dispatch({
							error: `${response.status} ${body}`,
							networkStatus: SERVICE_NETWORK_STATUS_TYPES.Error
						});
						return;
					}

					dispatch({
						error: null,
						lastFetch: new Date(),
						networkStatus: SERVICE_NETWORK_STATUS_TYPES.Unused
					});
					return body;
				});
		},
		[config]
	);

	return {fetcher, ...state};
};

export default useService;
