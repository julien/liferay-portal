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

/**
 * - Unused (0) When no request is happening the status will be `unused`.
 * - Fetching (1) When no request is happening the status will be `unused`.
 * - Error (2) When any timeout or request `error` occurs, the status will be set
 * 	 to error.
 */
export const SERVICE_NETWORK_STATUS_TYPES = {
	Error: 2,
	Fetching: 1,
	Unused: 0
};
