import {
	isDefAndNotNull,
	isFunction,
	isObject,
	isString
} from 'metal';

import PortletConstants from './PortletConstants.es';

import {
	encodeFormAsString,
	encodeParameter,
	isParmEqual,
	validateForm
} from './PortletUtil.es';

import RenderState from './RenderState.es';

// Constants used for URL Encoding/Decoding (copied from Pluto impl code)
// The delimiter & special chars for the value encoding are chosen
// from the URL reserved delimiter characters that ARE ENCODED by the URLEncoder
// so that they will not appear encoded parameter names or values.
// See RFC 3986 & URLEncoder documentation.

// const ACTION_PARAM = 'p_action_p_';

const CACHE_LEVEL = 'p_p_cacheability';

const HUB = 'p_p_hub';

const HUB_ACTION = '0';

const HUB_PARTIAL_ACTION = '1';

const HUB_RESOURCE = '2';

const PORTLET_MODE = 'p_p_mode';

const PUBLIC_RENDER_PARAM = 'p_r_p_';

const RENDER_PARAM = 'priv_r_p_';

const RESOURCE_ID = 'p_p_resource_id';

// const RESOURCE_PARAM = 'p_resource_p_';

const TOKEN_DELIM = '&';

const VALUE_DELIM = '=';

const WINDOW_STATE = 'p_p_state';

/**
 * Flag specifying whether history is to be processed
 * (true if browser supports HTML5 session history APIs)
 *
 * @property {boolean} doHistory
 */

const doHistory = (window.history && window.history.pushState);

const portletRegex = '^portlet[.].*';

/**
 * PortletInit
 */

class PortletInit {

	/**
	 * Constructor for PortletInit
	 * @param {string} portletId
	 */

	constructor(portletId) {
		this._portletId = portletId;

		this.constants = Object.assign({}, PortletConstants);

		if (!PortletInit._initialized) {

			// TODO: Think about how to pass the "initial data" for the render state.
			// i.e.
			// 1 - when running unit tests we use:
			//     PortletInit._renderState = portlet.test.getInitData();
			// 2 - when in portal we use:
			//     PortletInit._renderState = portlet.impl.getInitData();

			PortletInit._renderState = global.portlet.impl.getInitData();
			this.updateHistory(true);
			PortletInit._initialized = true;
		}

		PortletInit._registeredPortlets[portletId] = this;
	}

	/**
	 * Adds a client event listener.
	 *
	 * @param {string} type The type of listener
	 * @param {function} handler Function called when event occurs
	 * @returns {object} A handle that can be used to remove the event listener
	 */

	_addClientEventListener(type, handler) {
		const listener = {
			handler,
			type
		};

		PortletInit._clientEventListeners.push(listener);

		return listener;
	}

	/**
	 * Adds a system event listener.
	 *
	 * @param {string} type The name of the event to listen to
	 * @param {Function} handler The function called when the event is emitted
	 * @returns {Object} A handle that can be used to remove the event listener
	 */

	_addSystemEventListener(type, handler) {
		if (type !== 'portlet.onStateChange' && type !== 'portlet.onError') {
			throw new TypeError(`The system event type is invalid: ${type}`);
		}

		const id = this._portletId;

		const listener = {
			handler,
			id,
			type
		};

		PortletInit._systemEventListeners.push(listener);

		return listener;
	}

	/**
	 * Calls the portlet onStateChange method in an asynchronous manner in order
	 * to decouple the public API. This method is intended for use after
	 * portlet client registers an onStateChange listener.
	 * <p>
	 * In a real implementation, the portlet hub might need to communicate with
	 * the portal server to obtain data.
	 *
	 * @param {string} pid The portlet ID
	 * @private
	 */

	_updateStateForPortlet(pid) {
		let dup = false;
		const listeners = PortletInit._systemEventListeners.slice();
		const updateQueue = PortletInit._updateQueue;

		const l = listeners.length;

		for (let i = 0; i < l; i++) {
			const qdata = listeners[i];
			if (qdata.id === pid) {

				const k = updateQueue.length;

				for (let j = 0; j < k; j++) {
					if (updateQueue[j].id == qdata.id) {
						dup = true;
						break;
					}
				}
				if (!dup) {
					updateQueue.push(qdata);
				}
			}
		}

		if (updateQueue.length > 0) {
			setTimeout(
				() => {
					PortletInit._busy = true;

					while (updateQueue.length > 0) {
						const qdata = PortletInit._updateQueue.shift();

						const handler = qdata.handler;
						const id = qdata.id;

						const data = PortletInit._renderState.portlets[id].renderData;
						const state = new RenderState(PortletInit._renderState.portlets[id].state);

						if (!!data && !!data.content) {
							handler('portlet.onStateChange', state, data);
						}
						else {
							handler('portlet.onStateChange', state);
						}
					}

					PortletInit._busy = false;
				}
			);
		}
	}

	/**
	 * Initiates a portlet action using the specified action parameters and
	 * element arguments.
	 *
	 * @memberof PortletInit
	 * @param {PortletParameters} params Action parameters to be added to the URL
	 * @param {HTMLFormElement} element DOM element of form to be submitted
	 * @returns {Promise} A Promise object that is resolved with no argument
	 *                    when the action request has completed.
	 * @throws {TypeError} Thrown if the input parameters are invalid
	 * @throws {AccessDeniedException}   Thrown if a blocking operation is already in progress.
	 * @throws {NotInitializedException} Thrown if a portlet ID is provided, but no onStateChange listener has been registered.
	 */

	action(params, element) {
		return new Promise((resolve, reject) => {
			let el = null;
			let i = arguments.length;
			let parms = null;
			while (--i >= 0) {
				const arg = arguments[i];
				const type = Object.prototype.toString.call(arg);

				if (arg instanceof HTMLFormElement) {
					if (el !== null) {
						throw new TypeError(`Too many [object HTMLFormElement] arguments: ${arg}, ${el}`);
					}
					el = arg;
				}
				else if (isObject(arg)) {
					this.validateParams(arg);
					if (parms !== null) {
						throw new TypeError('Too many parameters arguments');
					}
					parms = arg;
				}
				else if (arg !== undefined) {
					throw new TypeError(`Invalid argument type. Argument ${i + 1} is of type ${type}`);
				}
			}

			if (el) {
				validateForm(el);
			}

			this.setupAction(
				parms,
				el
			)
				.then(
					val => {
						resolve(val);
					}
				)
				.catch(
					err => {
						reject(err);
					}
				);
		});
	}

	/**
	 * Adds a listener function for specified event type.
	 *
	 * @memberof PortletInit
	 * @param {string} type The type of listener
	 * @param {function} handler Function called when event occurs
	 * @returns {object} A handle that can be used to remove the event listener
	 * @throws {TypeError} Thrown if the input parameters are invalid
	 */

	addEventListener(type, handler) {
		if (arguments.length > 2) {
			throw new TypeError(
				'Too many arguments passed to addEventListener'
			);
		}

		if (!isString(type) || !isFunction(handler)) {
			throw new TypeError(
				'Invalid arguments passed to addEventListener'
			);
		}

		let listener = null;

		if (type.startsWith('portlet.')) {
			listener = this._addSystemEventListener(type, handler);
			if (type === 'portlet.onStateChange') {
				this._updateStateForPortlet(this._portletId);
			}
		}
		else {
			listener = this._addClientEventListener(type, handler);
		}

		return listener;
	}

	/**
	 * Returns a promise for a resource URL with parameters set appropriately
	 * for the page state according to the resource parameters, cacheability
	 * option, and resource ID provided.
	 *
	 * @memberof   PortletInit
	 * @param {PortletParameters} params      Resource parameters to be added to the URL
	 * @param {string}            cache       Cacheability option. The strings defined under
	 *                                        {@link PortletConstants} should be used to specifiy cacheability.
	 * @param {string}            resourceId  Resource ID.
	 * @returns {Promise}  A Promise object. Returns a string representing the
	 *                     resource URL on successful resolution. Returns an Error object containing
	 *                     a descriptive message on failure.
	 * @throws {TypeError} Thrown if the input parameters are invalid
	 */

	createResourceUrl(params, cache, resourceId) {
		if (arguments.length > 3) {
			throw new TypeError('Too many arguments. 3 arguments are allowed.');
		}

		if (params) {
			if (isObject(params)) {
				this.validateParams(params);
			}
			else {
				throw new TypeError('Invalid argument type. Resource parameters must be a parameters object.');
			}
		}

		let cacheability = null;
		if (cache) {
			if (isString(cache)) {
				if (cache === 'cacheLevelPage' || cache === 'cacheLevelPortlet' || cache === 'cacheLevelFull') {
					cacheability = cache;
				}
				else {
					throw new TypeError(`Invalid cacheability argument: ${cache}`);
				}
			}
			else {
				throw new TypeError('Invalid argument type. Cacheability argument must be a string.');
			}
		}

		if (!cacheability) {
			cacheability = 'cacheLevelPage';
		}

		let rid = null;
		if (resourceId) {
			if (isString(resourceId)) {
				rid = resourceId;
			}
			else {
				throw new TypeError('Invalid argument type. Resource ID argument must be a string.');
			}
		}

		return this.getUrl('RESOURCE', this._portletId, params, cacheability, rid);
	}

	// decodes the update strings. The update string is
	// a JSON object containing the entire page state. This decoder
	// returns an object containing the portlet data for portlets whose
	// state has changed as compared to the current page state.

	decodeUpdateString(ustr) {
		const portlets = {};
		const ps = JSON.parse(ustr);

		for (let pid in ps.portlets) {
			if (ps.portlets.hasOwnProperty(pid)) {
				const nstate = ps.portlets[pid].state;
				const ostate = PortletInit._renderState.portlets[pid].state;

				if (!nstate || !ostate) {
					throw new Error('Invalid update string. ostate=', ostate, ', nstate=', nstate);
				}

				if (this.stateChanged(nstate, pid)) {
					portlets[pid] = ps.portlets[pid];
				}
			}
		}

		return portlets;
	}

	/**
	 * Dispatches a client event.
	 *
	 * @memberof PortletInit
	 * @param {string} type The type of listener.
	 * @param {any} payload The payload to be delivered.
	 * @returns {number} The number of events queued for delivery.
	 * @throws {TypeError} Thrown if the type is a system event type.
	 */

	dispatchClientEvent(type, payload) {
		if (arguments.length > 2) {
			throw new TypeError('Too many arguments passed to dispatchClientEvent');
		}

		if (!isString(type)) {
			throw new TypeError('Event type must be a string');
		}

		if (type.match(portletRegex)) {
			throw new TypeError('The event type is invalid: ' + type);
		}

		return PortletInit._clientEventListeners.reduce(
			(amount, listener) => {
				if (type.match(listener.type)) {
					listener.handler(type, payload);
					amount++;
				}
				return amount;
			},
			0
		);
	}

	/**
	 * Performs the actual action
	 *
	 * @param {Object} params Additional params
	 * @param {HTMLFormElement} element Form to be submitted. May be <code>null</code>
	 * @private
	 */

	executeAction(params, element) {
		return new Promise((resolve, reject) => {
			this.getUrl(
				'ACTION',
				this._portletId,
				params
			)
				.then(
					url => {
						const method = 'POST';
						let xhr;

						if (element) {
							const enctype = element.enctype;
							if (enctype === 'multipart\/form-data') {
								const formData = new FormData(element);

								xhr = fetch(
									url,
									{
										body: formData,
										method: method
									}
								);
							}
							else {
								const fstr = encodeFormAsString(this._portletId, element);
								const method = element.method ? element.method.toUpperCase() : 'GET';
								if (method === 'GET') {
									if (url.indexOf('?') >= 0) {
										url += `&${fstr}`;
									}
									else {
										url += `?${fstr}`;
									}

									xhr = fetch(
										url,
										{
											method: method
										}
									);
								}
								else {
									const headers = new Headers();
									headers.append('Content-Type', 'applicacion/x-www-form-urlencoded');
									headers.append('Content-Length', fstr.length);

									xhr = fetch(
										url,
										{
											headers: headers,
											method: method
										}
									);
								}
							}
						}
						else {
							xhr = fetch(
								url,
								{
									method: method
								}
							);
						}

						xhr
							.then(
								res => {
									return res.text();
								}
							)
							.then(
								text => {
									const updatedIds = this.updatePageStateFromString(text, this._portletId);
									resolve(updatedIds);
								}
							)
							.catch(
								err => {
									reject(err);
								}
							);
					}
				);
		}
		);
	}

	/**
	 * Helper for generating portlet mode & window state strings for the URL
	 */

	genPMWSString(pid) {
		const state = PortletInit._renderState.portlets[pid].state;

		const pm = state.portletMode;
		const ws = state.windowState;

		let str = '';

		str += TOKEN_DELIM + PORTLET_MODE + VALUE_DELIM + encodeURIComponent(pm);
		str += TOKEN_DELIM + WINDOW_STATE + VALUE_DELIM + encodeURIComponent(ws);

		return str;
	}

	/**
	 * Helper for generating parameter strings for the URL
	 */

	genParmString(pid, name, type, group) {
		let str = '';

		const data = PortletInit._renderState.portlets[pid];
		if (data && data.state && data.state.parameters) {
			const vals = data.state.parameters[name];
			if (vals !== undefined) {

				// If values are present, encode the mutlivalued parameter string

				if (type === PUBLIC_RENDER_PARAM) {
					str += encodeParameter(group, vals);
				}
				else if (type === RENDER_PARAM) {
					str += encodeParameter(RENDER_PARAM + name, vals);
				}
				else {
					str += encodeParameter(pid + name, vals);
				}
			}
		}
		return str;
	}

	/**
		* Gets the updated public parameters for the given portlet
		* ID and new render state.
		* Returns an object whose properties are the gruop indexes of the
		* updated public parameters. The values are the new public
		* parameter values.
		*
		* @param      {string}       pid      The portlet ID
		* @param      {RenderState} state    The new render state
		* @returns    {object}                object containing the updated PRPs

		*/

	getUpdatedPRPs(pid, state) {
		const prpNames = PortletInit._renderState.portlets[pid].pubParms;
		const prps = {};

		for (let name in prpNames) {
			if (prpNames.hasOwnProperty(name)) {
				if (!this.isParmInStateEqual(pid, state, name)) {
					const group = prpNames[name];
					prps[group] = state.parameters[name];
				}
			}
		}

		return prps;
	}

	/**
	 * Returns a URL of the specified type.
	 *
	 * @memberof PortletInit
	 * @param {string} type   The URL type
	 * @param {string} pid		The portlet ID
	 * @param {Object} params Additional parameters.
	 *                        May be <code>null</code>
	 * @param {string} cache  Cacheability.
	 *                        Must be present if  type = "RESOURCE".
	 *                        May be <code>null</code>
	 * @param {string} resid  Resource ID.
	 *                        May be present if type = "RESOURCE".
	 *                        May be <code>null</code>
	 */

	getUrl(type, pid, params, cache, resid) {
		const renderState = PortletInit._renderState;

		let cacheability = 'cacheLevelPage';

		// let isAction = false;

		let url = '';

		// If target portlet not defined for render URL, set it to null

		if (type === 'RENDER' && pid === undefined) {
			pid = null;
		}

		if (type === 'RESOURCE') {
			url = decodeURIComponent(renderState.portlets[pid].encodedResourceURL);

			if (cache) {
				cacheability = cache;
			}

			url += TOKEN_DELIM + HUB + VALUE_DELIM + encodeURIComponent(HUB_RESOURCE);
			url += TOKEN_DELIM + CACHE_LEVEL + VALUE_DELIM + encodeURIComponent(cacheability);

			if (resid) {
				url += TOKEN_DELIM + RESOURCE_ID + VALUE_DELIM + encodeURIComponent(resid);
			}
		}
		else if (type === 'RENDER' && pid !== null) {
			url = decodeURIComponent(renderState.portlets[pid].encodedRenderURL);
		}
		else if (type === 'RENDER') {
			url = decodeURIComponent(renderState.encodedCurrentURL);
		}
		else if (type === 'ACTION') {
			url = decodeURIComponent(renderState.portlets[pid].encodedActionURL);
			url += TOKEN_DELIM + HUB + VALUE_DELIM + encodeURIComponent(HUB_ACTION);
		}
		else if (type === 'PARTIAL_ACTION') {
			url = decodeURIComponent(renderState.portlets[pid].encodedActionURL);
			url += TOKEN_DELIM + HUB + VALUE_DELIM + encodeURIComponent(HUB_PARTIAL_ACTION);
		}

		// Now add the state to the URL, taking into account cacheability if
		// we're dealing with a resource URL.

		// Put the private & public parameters on the URL if cacheability != FULL

		if (type !== 'RESOURCE' || cacheability !== 'cacheLevelFull') {

			// Add the state for the target portlet, if there is one.
			// (for the render URL, pid can be null, and the state will have
			// been added previously)

			if (pid) {
				const names = renderState.portlets[pid].state.parameters;
				let str = '';
				for (let name in names) {
					if (names.hasOwnProperty(name) && !this.isPRP(pid, name)) {
						str += this.genParmString(pid, name, RENDER_PARAM);
					}
				}
				url += str;
			}

			// Add the public render parameters for all portlets

			const prpstrings = {};
			let str = '';
			for (let group in renderState.prpMap) {
				if (renderState.prpMap.hasOwnProperty(group)) {
					for (let tpid in renderState.prpMap[group]) {
						if (renderState.prpMap[group].hasOwnProperty(tpid)) {
							const name = renderState.prpMap[group][tpid];
							const parts = name.split('|');

							// Only need to add parameter once, since it is shared

							if (!prpstrings.hasOwnProperty(group)) {
								prpstrings[group] = this.genParmString(parts[0], parts[1], PUBLIC_RENDER_PARAM, group);
								str += prpstrings[group];
							}
						}
					}
				}
			}
			url += str;
		}

		// Encode resource or action parameters
		// TODO: Just a doubt...
		//			<code>isAction</code> (in our case never set to true, in portals-pluto it is when the type is either 'ACTION' or 'PARTIAL_ACTION')
		//      <code>ptype</code>    (in our case never used)
		// @see https://github.com/ngriffin7a/liferay-portal/blob/portlet3/portal-web/docroot/js/javax.portlet/portletHub.js#L475-L484

		if (params) {

			// const ptype = isAction ? ACTION_PARAM : RESOURCE_PARAM;

			let str = '';
			for (let param in params) {
				if (params.hasOwnProperty(param)) {
					str += encodeParameter(pid + param, params[param]);
				}
			}
			url += str;
		}

		return Promise.resolve(url);
	}

	/**
	 * Returns true if an onStateChange listener is registered for the portlet
	 *
	 * @memberOf PortletInit
	 * @param {string} pid The portletID
	 * @returns {boolean} <code>true</code> if a listener is registered
	 */

	hasListener(portletId) {
		const listeners = PortletInit._systemEventListeners.slice();

		let found = false;

		const l = listeners.length;
		for (let i = 0; i < l; i++) {
			if (listeners[i].type === 'portlet.onStateChange' && listeners[i].id === portletId) {
				found = true;
			}
		}
		return found;
	}

	/**
	 * Tests whether a blocking operation is in progress.
	 *
	 * @memberof PortletInit
	 * @returns {boolean} true if a blocking
	 */

	isInProgress() {
		return PortletInit._busy;
	}

	/**
	 * Function for checking if the parameter is public
	 */

	isPRP(pid, name) {
		let result = false;

		const prps = PortletInit._renderState.portlets[pid].pubParams;
		for (let prp in prps) {
			if (prps.hasOwnProperty(prp)) {
				if (name === prp) {
					result = true;
				}
			}
		}

		return result;
	}

	/**
	 * Compares the values of the named parameter in the new render state
	 * with the values of that parameter in the current state.
	 *
	 * @param {string} pid The portlet ID.
	 * @param {RenderState} state The new render state.
	 * @param {string} name The parameter name to check.
	 * @returns {boolean} true if the new parm value is different from the current value.
	 * @private
	 */

	isParmInStateEqual(pid, state, name) {
		const newVal = state.parameters[name];
		const oldVal = PortletInit._renderState.portlets[pid].state.parameters[name];

		return isParmEqual(newVal, oldVal);
	}

	/**
	 * Creates and returns a new PortletParameters object.
	 *
	 * @memberof PortletInit
	 * @param {Object} param An optional object to be copied
	 * @returns {Object} The new parameters object
	 */

	newParameters(params) {
		const newParams = {};

		for (let p in params) {
			if (params.hasOwnProperty(p)) {
				if (Array.isArray(params[p])) {
					newParams[p] = params[p].slice(0);
				}
			}
		}
		return newParams;
	}

	/**
	 * Creates and returns a new RenderState object.
	 *
	 * @memberof PortletInit
	 * @param {RenderState} state An optional RenderState object to be copied
	 * @returns {RenderState} The new RenderState object
	 */

	newState(opts) {
		return new RenderState(opts);
	}

	/**
	 * Removes a previously added listener function designated by the handle.
	 * The handle must be the same object previously returned by the
	 * addEventListener function.
	 *
	 * @memberof PortletInit
	 * @param {object} handle The handle of the listener to be removed
	 * @throws {TypeError} Thrown if the input parameters are invalid
	 * @throws {AccessDeniedException} Thrown if the event listener associated
	 * with this handle was registered by a different portlet
	 */

	removeEventListener(handle) {
		if (arguments.length > 1) {

			// TODO: Probably not needed

			throw new TypeError(
				'Too many arguments passed to removeEventListener'
			);
		}

		if (!isDefAndNotNull(handle)) {
			throw new TypeError(
				'The event handle provided is ' + typeof handle
			);
		}

		let found = false;

		const clientEventListeners = PortletInit._clientEventListeners;
		for (let i = clientEventListeners.length - 1; i >= 0; i--) {
			const listener = clientEventListeners[i];
			if (listener.id === handle.id && listener.type === handle.type) {
				found = true;
				clientEventListeners.splice(i, 1);
				break;
			}
		}

		const systemEventListeners = PortletInit._systemEventListeners;
		for (let i = systemEventListeners.length - 1; i >= 0; i--) {
			const listener = systemEventListeners[i];
			if (listener.id === handle.id && listener.type === handle.type) {
				found = true;
				systemEventListeners.splice(i, 1);
				break;
			}
		}

		if (!found) {
			throw new TypeError(
				'The event listener handle doesn\'t match any listeners.'
			);
		}
	}

	/**
	 * Sends an onError event to all registered error event handlers for a given
	 * portlet.
	 *
	 * @param {string} pid The portletID
	 * @param {string} err The error message
	 */

	reportError(pid, err) {
		const listeners = PortletInit._systemEventListeners.slice();
		listeners.map(
			listener => {
				if (listener.type === 'portlet.onError' && listener.id === pid) {
					setImmediate(
						() => {
							listener.handler('portlet.onError', err);
						}
					);
				}

				// The following line is only to make 'csf' happy

				return false;
			}
		);
	}

	/**
	* Callback function that must be called after a partial action has been
	* started.
	*
	* The page state is generated by the portal and transmitted to the client by
	* the portlet. The portlet client that initiated the partial action must
	* pass the page state string to this function.
	*
	* The callback should only be called once to conclude a partial action sequence.
	*
	* @param {string} pid  The portlet ID for operation
	* @param {string} ustr The new page state in string form
	* @throws {TypeError}  Thrown if the parameter is not a string
	* @name setPageState
	* @callback setPageState
	*/

	setPageState(pid, ustr) {
		if (!isString(ustr)) {
			throw new TypeError(`Invalid update string: ${ustr}`);
		}

		this._updatePageState(
			ustr,
			pid
		)
			.then(
				updatedIds => {
					this.updatePageState(updatedIds);
				},
				err => {
					PortletInit._busy = false;
					this.reportError(pid, err);
				}
			);
	}

	/**
		* Update page state passed in after partial action. The list of
		* ID's of updated portlets is passed back through a promise in order
		* to decouple the layers.
		*
		* @param   {string}    ustr     The
		* @param   {string}    pid      The portlet ID
		* @private
		*/

	updatePageStateForPortlet(ustr, pid) {
		return new Promise((resolve, reject) => {
			try {
				const updatedIds = this.updatePageStateFromString(ustr, pid);
				resolve(updatedIds);
			}
			catch (e) {
				reject(new Error(`Partial Action decode status: ${e.message}`));
			}
		});
	}

	/**
	 * Sets up for the action.
	 *
	 * @param {PortletParameters} parms Additional parameters. May be <code>null</code>
	 * @param {HTMLFormElement}  element Form to be submitted May be <code>null</code>
	 * @throws {AccessDeniedException} Thrown if a blocking operation is already in progress.
	 * @throws {NotInitializedException} Thrown if a portlet ID is provided, but no onStateChange listener has been registered.
	 */

	setupAction(params, element) {
		return new Promise((resolve, reject) => {
			if (this.isInProgress()) {
				throw {
					message: 'Operation is already in progress',
					name: 'AccessDeniedException'
				};
			}

			if (!this.hasListener(this._portletId)) {
				throw {
					message: `No onStateChange listener registered for portlet: ${this._portletId}`,
					name: 'NotInitializedException'
				};
			}

			PortletInit._busy = true;

			this.executeAction(
				params,
				element
			)
				.then(
					updatedIds => {
						return this.updatePageState(updatedIds)
							.then(
								updatedIds => {
									resolve(updatedIds);
								}
							);
					},
					err => {
						PortletInit._busy = false;
						this.reportError(this._portletId, err);
					}
				);
		});
	}

	/**
	 * Sets the render state, which consists of the public and private render
	 * parameters, the portlet mode, and the window state.
	 *
	 * @memberof PortletInit
	 * @param {RenderState} state The new state to be set
	 * @throws {TypeError} Thrown if the input parameters are invalid
	 * @throws {AccessDeniedException} Thrown if a blocking operation is already in progress.
	 * @throws {NotInitializedException} Thrown if a portlet ID is provided, but no onStateChange listener has been registered.
	 */

	setRenderState(state) {
		if (!isObject(state)) {
			throw new TypeError('State must be an object');
		}

		this.validateState(state);
		this.updateState(state);
	}

	/**
	 * Sets state for the portlet.
	 * returns array of IDs for portlets that were affected by the change,
	 * taking into account the public render parameters.
	 *
	 * @param {Object} state The state to be set.
	 * @returns {Array}
	 */

	setState(state) {
		const prps = this.getUpdatedPRPs(this._portletId, state);
		const updatedIds = [];

		for (let group in prps) {
			if (prps.hasOwnProperty(group)) {
				const newVal = prps[group];

				// Access the PRP map to get affected portlets

				const groupMap = PortletInit._renderState.prpMap[group];
				for (let tpid in groupMap) {
					if (groupMap.hasOwnProperty(tpid) && tpid !== this._portletId) {
						const parts = groupMap[tpid].split('|');
						const pid = parts[0];
						const prpName = parts[1];

						if (newVal === undefined) {
							delete PortletInit._renderState.portlets[pid].state.parameters[prpName];
						}
						else {
							PortletInit._renderState.portlets[pid].state.parameters[prpName] = newVal.slice(0);
						}
						updatedIds.push(pid);
					}
				}
			}
		}

		// Update state for the initiating portlet.

		const pid = this._portletId;
		PortletInit._renderState.portlets[pid].state = state;
		updatedIds.push(pid);

		// Delete render data for all affected portlets in order to avoid dispatching
		// stale render data

		const l = updatedIds.length;
		for (let i = 0; i < l; i++) {
			const tpid = updatedIds[i];
			PortletInit._renderState.portlets[tpid].renderData.content = null;
		}

		// Update history for back-button support

		this.updateHistory();

		return new Promise((resolve, reject) => {

			// TODO: This is just for the reference implementation example, remove it.

			let simval = '';
			if (pid === 'SimulateCommError' && state.parameters.SimulateError !== undefined) {
				simval = state.parameters.SimulateError[0];
			}

			// TODO: This is just for the reference implementation example, remove it.
			// Reject promise if an error is to be simulated

			if (simval === 'reject') {
				reject(new Error('Simulated error occured when setting state!'));
			}
			else {
				resolve(updatedIds);
			}
		});
	}

	/**
	 * Returns true if input state differs from the current page state.
	 * Throws exception if input state is malformed.
	 */

	stateChanged(nstate, pid) {
		const ostate = PortletInit._renderState.portlets[pid].state;

		if (!nstate.portletMode || !nstate.windowState || !nstate.parameters) {
			throw new Error('Error decoding state:', nstate);
		}

		let result = false;
		if (nstate.porletMode !== ostate.portletMode) {
			result = true;
		}
		else if (nstate.windowState !== ostate.windowState) {
			result = true;
		}
		else {

			// Has a parameter changed or been added?

			for (let pname in nstate.parameters) {
				if (nstate.parameters.hasOwnProperty(pname)) {
					const nparm = nstate.parameters[pname];
					const oparm = ostate.parameters[pname];
					if (!isParmEqual(nparm, oparm)) {
						result = true;
					}
				}
			}

			// Make sure no parameter was deleted

			for (let pname in ostate.parameters) {
				if (ostate.parameters.hasOwnProperty(pname)) {
					if (!nstate.parameters[name]) {
						result = true;
					}
				}
			}
		}

		return result;
	}

	/**
	 * Starts partial action processing and returns a
	 * {@link PartialActionInit} object to the caller.
	 *
	 * @memberof PortletInit
	 * @param {PortletParameters} params Action parameters to be added to the URL
	 * @returns {Promise} A Promise object. Returns a {PortletActionInit} object
	 * containing a partial action URL and the setPageState callback function on
	 * successful resolution. Returns an Error object containing a descriptive
	 * message on failure.
	 * @throws {TypeError} Thrown if the input parameters are invalid
	 * @throws {AccessDeniedException} Thrown if a blocking operation is already
	 * in progress.
	 * @throws {NotInitializedException} Thrown if a portlet ID is provided, but
	 * no onStateChange listener has been registered.
	 */

	startPartialAction(actParams) {
		const instance = this;

		let parms = null;

		if (arguments.length > 1) {
			throw new TypeError('Too many arguments. 1 argument is allowed');
		}
		else if (isDefAndNotNull(actParams)) {
			if (isObject(actParams)) {
				this.validateParams(actParams);

				parms = actParams;
			}
			else {
				throw new TypeError(`Invalid argument type. Argument is of type ${typeof actParams}`);
			}
		}

		if (PortletInit._busy === true) {
			throw {
				message: 'Operation in progress',
				name: 'AccessDeniedException'
			};
		}
		else if (!this.hasListener(this._portletId)) {
			throw {
				message: `No onStateChange listener registered for portlet: ${this._portletId}`,
				name: 'NotInitializedException'
			};
		}

		PortletInit._busy = true;

		const paObj = {
			setPageState(ustr) {
				instance.setPageState(instance._portletId, ustr);
			},
			url: ''
		};

		return this.getUrl(
			'PARTIAL_ACTION',
			this._portletId,
			parms
		).then(
			url => {
				paObj.url = url;
				return paObj;
			}
		);
	}

	/**
	 * Called when the page state has been updated to allow the browser history to be taken care of.
	 *
	 * @param {boolean} replace Replace the state rather than pushing
	 */

	updateHistory(replace) {
		if (doHistory) {
			this.getUrl(
				'RENDER',
				null,
				{}
			).then(
				url => {
					const token = JSON.stringify(PortletInit._renderState);

					if (replace) {
						history.replaceState(token, '');
					}
					else {
						try {
							history.pushState(token, '', url);
						}
						catch (e) {
						}
					}
				}
			);
		}
	}

	updateState(state) {
		if (PortletInit._busy) {
			throw {
				message: 'Operation in progress',
				name: 'AccessDeniedException'
			};
		}
		else if (!this.hasListener(this._portletId)) {
			throw {
				message: `No onStateChange listener registered for portlet: ${this._portletId}`,
				name: 'NotInitializedException'
			};
		}

		PortletInit._busy = true;

		this.setState(state)
			.then(
				updatedIds => {
					this.updatePageState(updatedIds);
				}
			)
			.catch(
				err => {
					PortletInit._busy = false;
					this.reportError(this._portletId, err);
				}
			);
	}

	// TODO: Rename this function since it's pretty confusing to have
	//       2 function with the same name that do something different
	// @see: updatePageState

	_updatePageState(ustr) {
		return new Promise(
			(resolve, reject) => {
				try {
					const updatedIds = this.updatePageStateFromString(ustr, this._portletId);
					resolve(updatedIds);
				}
				catch (e) {
					reject(new Error(`Partial Action decode status: ${e.message}`));
				}
			}
		);
	}

	/**
	 *
	 * Accepts an object containing changed render states.
	 * Updates the state for each portlet present.
	 *
	 * @param {Array} updatedIds Array of portlet IDs to be updated
	 *
	 * TODO: Note that two <code>updatePageState</code> methods are defined:
	 * One in <code>portlet.js</code> and the other in <code>portletHubImpl.js.</code>
	 * They both do different things, so make sure both
	 * are implemented and correctly invoked.
	 *
	 * @see:
	 * https://github.com/apache/portals-pluto/blob/master/pluto-portal/src/main/webapp/javascript/portlet.js#L892-L911
	 * https://github.com/apache/portals-pluto/blob/master/pluto-portal/src/main/webapp/javascript/portletHubImpl.js#L711-L725
	 * https://github.com/apache/portals-pluto/blob/master/pluto-portal/src/main/webapp/javascript/portletHubImpl.js#L936
	 */

	updatePageState(updatedIds) {
		return new Promise((resolve, reject) => {
			if (updatedIds.length === 0) {
				PortletInit._busy = false;
			}
			else {
				const l = updatedIds.length;

				for (let i = 0; i < l; i++) {
					this._updateStateForPortlet(updatedIds[i]);
				}
			}
			resolve(updatedIds);
		});
	}

	/**
	 * Updates page state from string and returns array of portlet IDs
	 * to be updated.
	 *
	 * @param {string} ustr The update string.
	 * @param {string} pid  The portlet ID.
	 */

	updatePageStateFromString(ustr, pid) {
		const portlets = this.decodeUpdateString(ustr);
		const updatedIds = [];

		let stateUpdated = false;

		// Update portlets and collect IDs of affected portlets.

		for (let tpid in portlets) {
			if (portlets.hasOwnProperty(tpid)) {
				const portlet = portlets[tpid];

				PortletInit._renderState.portlets[tpid] = portlet;
				updatedIds.push(tpid);
				stateUpdated = true;
			}
		}

		// pid will be null or undefined when called from onpopstate routine.
		// In that case, don't update history.

		if (stateUpdated && pid) {
			this.updateHistory();
		}

		return updatedIds;
	}

	/**
	 * Verifies that the input parameters are in valid format.
	 *
	 * Parameters must be an object containing parameter names. It may also
	 * contain no property names which represents the case of having no
	 * parameters.
	 *
	 * If properties are present, each property must refer to a array of string
	 * values. The array length must be at least 1, because each parameter must
	 * have a value. However, a value of 'null' may appear in any array entry.
	 *
	 * To represent a <code>null</code> value, the property value must equal [null].
	 *
	 * @param {Object} params The parameters to check
	 * @throws {TypeError} Thrown if the parameters are incorrect
	 */

	validateParams(params) {
		if (params === null || params === undefined) {
			throw new TypeError(`The parameter object is: ${typeof params}`);
		}

		for (let p in params) {
			if (params.hasOwnProperty(p)) {
				if (!Array.isArray(params[p])) {
					throw new TypeError(`${p} parameter is not an array`);
				}
				if (params[p].length < 1) {
					throw new TypeError(`${p} parameter is an empty array`);
				}
			}
		}
	}

	/**
	 * Verifies that the input parameters are in valid format, that the portlet
	 * mode and window state values are allowed for the portlet.
	 *
	 * @param {string} pid The portlet ID
	 * @param {RenderState} state The render state object to check
	 * @throws {TypeError} Thrown if any component of the state is incorrect
	 */

	validateState(state) {
		this.validateParams(state.parameters);

		const portletData = PortletInit._renderState.portlets[this._portletId];

		if (!isString(state.portletMode)) {
			throw new TypeError(`Invalid parameters. portletMode is ${typeof state.portletMode}`);
		}
		else {
			const portletModes = portletData.allowedPM;
			state.portletMode = state.portletMode.toLowerCase();

			if (portletModes.indexOf(state.portletMode) === -1) {
				throw new TypeError(`Invalid portletMode=${state.portletMode} is not in ${portletModes}`);
			}
		}

		if (!isString(state.windowState)) {
			throw new TypeError(`Invalid parameters. windowState is ${typeof state.windowState}`);
		}
		else {
			const windowStates = portletData.allowedWS;
			state.windowState = state.windowState.toLowerCase();

			if (windowStates.indexOf(state.windowState) === -1) {
				throw new TypeError(`Invalid windowState=${state.windowState} is not in ${windowStates}`);
			}
		}
	}
}

/**
 * Determines if blocking action is currently in process.
 *
 * @memberof PortletInit
 * @static
 * @type {boolean}
 */

PortletInit._busy = false;

/**
 * A flag indicating if an event listener has been
 * added for the <code>window.popstate</code> event
 *
 * @memberof PortletInit
 * @static
 * @type {boolean}
 */

PortletInit._hasWindowPopStateListener = false;

/**
 * Contains client event listeners added from all instances of PortletInit.
 *
 * @memberof PortletInit
 * @static
 * @type {Array}
 */

PortletInit._clientEventListeners = [];

/**
 * A flag indicating if the PortletInit has been initialized
 *
 * @memberof PortletInit
 * @static
 * @type {Array}
 */

PortletInit._initialized = false;

/**
 * The render state containing the all portlets and public parameters map.
 *
 * @memberof PortletInit
 * @static
 * @type {Object}
 */

PortletInit._renderState = {
	encodedCurrentURL: '',
	portlets: {},
	prpMap: {}
};

/**
 * The currently registered portlets.
 *
 * @memberof PortletInit
 * @static
 * @type {Object}
 */

PortletInit._registeredPortlets = {};

/**
 * An array containing the system event listeners
 * (For <code>'portlet.onStateChange'</code> and
 * <code>'portlet.onError'</code> events).
 *
 * @memberof PortletInit
 * @static
 * @type {Array}
 */

PortletInit._systemEventListeners = [];

/**
 * An array containing the event listeners currently queued for being dispatched.
 *
 * @memberof PortletInit
 * @static
 * @type {Array}
 */

PortletInit._updateQueue = [];

export default PortletInit;