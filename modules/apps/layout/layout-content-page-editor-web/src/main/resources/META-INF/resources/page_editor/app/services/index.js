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

import React, {useState, useRef} from 'react';

import {SERVICE_NETWORK_STATUS_TYPES} from '../config/constants/serviceNetworkStatusTypes';
import serviceFetch from './serviceFetch';

const INITIAL_STATE = {
	error: null,
	lastFetch: null,
	status: SERVICE_NETWORK_STATUS_TYPES.Idle
};

export const NetworkContext = React.createContext(INITIAL_STATE);

export const NetworkProvider = ({children, config}) => {
	const [network, setNetwork] = useState(INITIAL_STATE);

	const fetcher = useRef(
		serviceFetch(config, newVal =>
			setNetwork(network => ({...network, ...newVal}))
		)
	);

	return (
		<NetworkContext.Provider value={{...network, fetcher: fetcher.current}}>
			{children}
		</NetworkContext.Provider>
	);
};
