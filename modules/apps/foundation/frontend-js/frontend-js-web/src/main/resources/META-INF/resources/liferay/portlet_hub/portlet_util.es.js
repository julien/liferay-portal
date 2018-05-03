import {
	isDefAndNotNull,
	isString
} from 'metal';

const TOKEN_DELIM = '&';

const VALUE_ARRAY_EMPTY = '';

const VALUE_DELIM = '=';

const VALUE_NULL = '';

/**
 * Function to extract data from form and encode
 * it as an 'application/x-www-form-urlencoded' string
 *
 * @param {HTMLFormElement} form Form to be submitted
 * @review
 */

const encodeFormAsString = function(pid, form) {
	const params = [];

	for (let i = 0; i < form.elements.length; i++) {
		const element = form.elements[i];
		const name = element.name;
		const tag = element.nodeName.toUpperCase();
		const type = tag === 'INPUT' ? element.type.toUpperCase() : '';
		const value = element.value;

		if (name && !element.disabled && type !== 'FILE') {
			if (tag === 'SELECT' && element.multiple) {
				const options = [...element.options];

				options.forEach(
					opt => {
						if (opt.checked) {
							const value = opt.value;

							const param = encodeURIComponent(pid + name) + '=' + encodeURIComponent(value);

							params.push(param);
						}
					}
				);
			}
			else if (
				(type !== 'CHECKBOX' && type !== 'RADIO') || element.checked) {
				let param = encodeURIComponent(pid + name) + '=' + encodeURIComponent(value);

				params.push(param);
			}
		}
	}

	return params.join('&');
};

/**
 * Helper for encoding a multivalued parameter
 *
 * @param name
 * @param vals
 * @returns {string}
 * @review
 */

const encodeParameter = function(name, vals) {
	let str = '';
	if (Array.isArray(vals)) {
		if (vals.length === 0) {
			str += TOKEN_DELIM + encodeURIComponent(name) + VALUE_DELIM + VALUE_ARRAY_EMPTY;
		}
		else {
			const l = vals.length;
			for (let i = 0; i < l; i++) {
				str += TOKEN_DELIM + encodeURIComponent(name);
				if (vals[i] === null) {
					str += VALUE_DELIM + VALUE_NULL;
				}
				else {
					str += VALUE_DELIM + encodeURIComponent(vals[i]);
				}
			}
		}
	}
	return str;
};

/**
 *
 * @param {*} form
 * @review
 */

const validateForm = function(form) {
	if (!(form instanceof HTMLFormElement)) {
		throw new TypeError('Element must be an HTMLFormElement');
	}

	const method = form.method ? form.method.toUpperCase() : undefined;

	if (method && method !== 'GET' && method !== 'POST') {
		throw new TypeError(`Invalid form method ${method}. Allowed methods are GET & POST`);
	}

	const enctype = form.enctype;

	if (enctype	&& enctype !== 'application\/x-www-form-urlencoded' && enctype !== 'multipart\/form-data') {
		throw new TypeError(`Invalid form enctype ${enctype}. Allowed: 'application\/x-www-form-urlencoded' & 'multipart\/form-data'`);
	}

	if (enctype && enctype === 'multipart\/form-data' && method !== 'POST') {
		throw new TypeError('Invalid method with multipart/form-data. Must be POST');
	}

	if (!enctype || enctype === 'application\/x-www-form-urlencoded') {
		const l = form.elements.length;

		for (let i = 0; i < l; i++) {
			if (form.elements[i].nodeName.toUpperCase() === 'INPUT' && form.elements[i].type.toUpperCase() === 'FILE') {
				throw new TypeError('Must use enctype = \'multipart/form-data\' with input type FILE.');
			}
		}
	}
};

/**
 * Verifies that the input parameters are in valid format.
 *
 * Parameters must be an object containing parameter names. It may also
 * contain no property names which represents the case of having no
 * parameters.
 *
 * If properties are present, each property must refer to an array of string
 * values. The array length must be at least 1, because each parameter must
 * have a value. However, a value of 'null' may appear in any array entry.
 *
 * To represent a <code>null</code> value, the property value must equal [null].
 *
 * @param {Object} params The parameters to check
 * @review
 * @throws {TypeError} Thrown if the parameters are incorrect
 */

const validateParams = function(params) {
	if (!isDefAndNotNull(params)) {
		throw new TypeError(`The parameter object is: ${typeof params}`);
	}

	for (let param in params) {
		if (params.hasOwnProperty(param)) {
			if (!Array.isArray(params[param])) {
				throw new TypeError(`${param} parameter is not an array`);
			}

			if (!params[param].length) {
				throw new TypeError(`${param} parameter is an empty array`);
			}
		}
	}
};

/**
 * Verifies that the input parameters are in valid format, that the portlet
 * mode and window state values are allowed for the portlet.
 *
 * @param {RenderState} state The render state object to check
 * @param {Object} portletData The porltet render state
 * @review
 * @throws {TypeError} Thrown if any component of the state is incorrect
 */

const validateState = function(state, portletData) {
	validateParams(state.parameters);

	const portletMode = state.portletMode;

	if (!isString(portletMode)) {
		throw new TypeError(`Invalid parameters. portletMode is ${typeof portletMode}`);
	}
	else {
		const allowedPortletModes = portletData.allowedPM;

		if (!allowedPortletModes.includes(portletMode.toLowerCase())) {
			throw new TypeError(`Invalid portletMode=${portletMode} is not in ${allowedPortletModes}`);
		}
	}

	const windowState = state.windowState;

	if (!isString(windowState)) {
		throw new TypeError(`Invalid parameters. windowState is ${typeof windowState}`);
	}
	else {
		const allowedWindowStates = portletData.allowedWS;

		if (!allowedWindowStates.includes(windowState.toLowerCase())) {
			throw new TypeError(`Invalid windowState=${windowState} is not in ${allowedWindowStates}`);
		}
	}
};

export {
	encodeFormAsString,
	encodeParameter,
	validateForm,
	validateParams,
	validateState
};