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

import React, {useState, useRef, useEffect} from 'react';

import {SERVICE_NETWORK_STATUS_TYPES} from '../config/constants/serviceNetworkStatusTypes';

const INITIAL_STATE = {
	error: null,
	lastFetch: null,
	status: SERVICE_NETWORK_STATUS_TYPES.Idle
};

export const NetworkContext = React.createContext(INITIAL_STATE);

/**
 * Observer is just for making a direct connection to serviceFetch to
 * avoid that we need to pass any callback to any thunk that uses a service.
 */
class Observer {
	handlers = [];

	subscribe(handler) {
		this.handlers.push(handler);
	}

	unsubscribe(handler) {
		this.handlers = this.handlers.filter(item => item !== handler);
	}

	fire(value) {
		this.handlers.forEach(handler => handler(value));
	}
}

export const networkObserver = new Observer();

/**
 * NetworkProvider is just to eventually prevent infinite looping in `useEffect`s
 * that contain Store dependencies that use some service. An infinite loop will be
 * caused in useEffect hook of the PageEditor component which calls the service
 * updateLayoutData when network information was saved to the store.
 */
export const NetworkProvider = ({children}) => {
	const [network, setNetwork] = useState(INITIAL_STATE);

	/**
	 * Adding in a `useRef` to prevent them from creating new references
	 * during new renderings.
	 */
	const handleNetworkStatus = useRef(value =>
		setNetwork(network => ({
			...network,
			...value
		}))
	);

	useEffect(() => {
		// This prevents eslint from throwing an warning because it thinks
		// `handleNetworkStatus.current` may change when useEffect cleanup is called.
		const onNetworkStatus = handleNetworkStatus.current;

		networkObserver.subscribe(onNetworkStatus);

		return () => {
			networkObserver.unsubscribe(onNetworkStatus);
		};
	}, []);

	return (
		<NetworkContext.Provider value={network}>
			{children}
		</NetworkContext.Provider>
	);
};
