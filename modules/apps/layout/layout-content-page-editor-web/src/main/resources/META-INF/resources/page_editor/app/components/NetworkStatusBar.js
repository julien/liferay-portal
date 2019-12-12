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

import {useEventListener} from 'frontend-js-react-web';
import React, {useMemo, useState} from 'react';

import {SERVICE_NETWORK_STATUS_TYPES} from '../config/constants/serviceNetworkStatusTypes';

const getStatus = (isOnline, networkStatus, lastSaveDate) => {
	if (!isOnline) {
		return `${Liferay.Language.get('trying-to-reconnect')}...`;
	} else if (networkStatus === SERVICE_NETWORK_STATUS_TYPES.Fetching) {
		return Liferay.Language.get('saving-changes');
	} else if (lastSaveDate) {
		return lastSaveDate;
	}

	return null;
};

const NetworkStatusBar = ({service}) => {
	const {lastFetch, networkStatus} = service;

	const [isOnline, setIsOnline] = useState(true);

	const lastSaveDate = useMemo(() => {
		if (!lastFetch) return null;

		const lastSaveDateText = Liferay.Language.get('draft-saved-at-x');

		return lastSaveDateText.replace(
			'{0}',
			lastFetch.toLocaleTimeString(
				Liferay.ThemeDisplay.getBCP47LanguageId()
			)
		);
	}, [lastFetch]);

	useEventListener('online', () => setIsOnline(true), true, window);

	useEventListener('offline', () => setIsOnline(false), true, window);

	const status = getStatus(isOnline, networkStatus, lastSaveDate);

	return (
		<li className="d-inline nav-item text-truncate">
			{status && (
				<span className="lfr-portal-tooltip navbar-text">{status}</span>
			)}
		</li>
	);
};

export default NetworkStatusBar;
