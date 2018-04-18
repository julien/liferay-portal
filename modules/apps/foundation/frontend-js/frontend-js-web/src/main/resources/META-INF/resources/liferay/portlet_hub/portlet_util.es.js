const TOKEN_DELIM = '&';

const VALUE_ARRAY_EMPTY = '';

const VALUE_DELIM = '=';

const VALUE_NULL = '';

/**
 * Function to extract data from form and encode
 * it as an 'application/x-www-form-urlencoded' string
 *
 * @param   {HTMLFormElement}  form    Form to be submitted
 * @private
 */

const encodeFormAsString = function(pid, form) {
	const params = [];

	const l = form.elements.length;

	for (let i = 0; i < l; i++) {
		const el = form.elements[i];
		const name = el.name;
		const tag = el.nodeName.toUpperCase();
		const type = tag === 'INPUT' ? el.type.toUpperCase() : '';
		const val = el.value;

		if (name && !el.disabled && type !== 'FILE') {
			if (tag === 'SELECT' && el.multiple) {
				const options = [...el.options];
				options.forEach(
					opt => {
						if (opt.checked) {
							const val = opt.value;

							const param = encodeURIComponent(pid + name) + '=' + encodeURIComponent(val);

							params.push(param);
						}
					}
				);
			}
			else if ((type !== 'CHECKBOX' && type !== 'RADIO') || el.checked) {
				let param = encodeURIComponent(pid + name) + '=' + encodeURIComponent(val);
				params.push(param);
			}
		}
	}

	const fstr = params.join('&');
	return fstr;
}

/**
 * Helper for encoding a multivalued parameter
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
}

/**
 * Compares the values of two parameters and returns true if they are equal.
 * The values are either string arrays or undefined
 *
 * @param {string[]} parm1 First parameter
 * @param {string[]} parm2 2nd parameter
 * @returns {boolean} true if the new parm value is equal to the current value
 */

const isParmEqual = function(param1, param2) {
	let ret = true;

	if (param1 === undefined && param2 === undefined) {
		ret = true;
	}

	if (param1 === undefined || param2 === undefined) {
		ret = false;
	}
	else {
		if (param1.length !== param2.length) {
			ret = false;
		}

		for (let i = param1.length - 1; i >= 0; i--) {
			if (param1[i] !== param2[i]) {
				ret = false;
			}
		}
	}

	return ret;
}

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

	// If the data is supposed to be urlencoded, we don't suport FILE element

	if (!enctype || enctype === 'application\/x-www-form-urlencoded') {
		const l = form.elements.length;
		for (let i = 0; i < l; i++) {
			if (form.elements[i].nodeName.toUpperCase() === 'INPUT' && form.elements[i].type.toUpperCase() === 'FILE') {
				throw new TypeError('Must use enctype = \'multipart/form-data\' with input type FILE.');
			}
		}
	}
}

export {
	encodeFormAsString,
	encodeParameter,
	isParmEqual,
	validateForm
};