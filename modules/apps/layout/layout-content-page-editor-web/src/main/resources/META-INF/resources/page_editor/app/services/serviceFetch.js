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

import {SERVICE_NETWORK_STATUS_TYPES} from '../config/constants/serviceNetworkStatusTypes';

/**
 * Returns a new FormData built from the given object.
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

/**
 * Performs a POST request to the given url and parses an expected object response.
 * If the response status is over 400, or there is any "error" or "exception"
 * properties on the response object, it rejects the promise with an Error object.
 * @param {object} config
 * @param {Function} onServiceStatus
 * @private
 * @return {Function}
 * @review
 */
export default function serviceFetch(config, onServiceStatus) {
	return (url, body = {}) => {
		onServiceStatus({status: SERVICE_NETWORK_STATUS_TYPES.Fetching});

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
						onServiceStatus({
							error: body.exception,
							status: SERVICE_NETWORK_STATUS_TYPES.Error
						});
						return;
					} else if ('error' in body) {
						onServiceStatus({
							error: body.error,
							status: SERVICE_NETWORK_STATUS_TYPES.Error
						});
						return;
					}
				}

				if (response.status >= 400) {
					onServiceStatus({
						error: `${response.status} ${body}`,
						status: SERVICE_NETWORK_STATUS_TYPES.Error
					});
					return;
				}

				onServiceStatus({
					error: null,
					lastFetch: new Date(),
					status: SERVICE_NETWORK_STATUS_TYPES.Idle
				});
				return body;
			});
	};
}
