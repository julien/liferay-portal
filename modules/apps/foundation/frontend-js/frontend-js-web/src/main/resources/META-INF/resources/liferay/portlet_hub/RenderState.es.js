import {isObject, isString} from 'metal';

import PortletConstants from './portlet_constants.es';

class RenderState {

	constructor(state) {
		if (isObject(state)) {
			this.from(state);
		}
		else {
			this.parameters = {};
			this.portletMode = PortletConstants.VIEW;
			this.windowState = PortletConstants.NORMAL;
		}
	}

	/**
	 * Clone returns a copy of this RenderState instance.
	 *
	 * @memberof RenderState
	 * @return {RenderState} A RenderState instance with same properties.
	 */

	clone() {
		return new RenderState(this);
	}

	/**
	 * Returns an instance of RenderState based on a RenderState
	 */

	from(state) {
		this.parameters = {};

		for (let p in state.parameters) {
			if (state.parameters.hasOwnProperty(p) && Array.isArray(state.parameters[p])) {
				this.parameters[p] = state.parameters[p].slice(0);
			}
		}

		this.setPortletMode(state.portletMode);
		this.setWindowState(state.windowState);
	}

	/**
	 * Returns the portletMode for this RenderState.
	 *
	 * @returns {String}
	 */

	getPortletMode() {
		return this.portletMode;
	}

	/**
	 * Returns the string parameter value for the given name.
	 * If name designates a multi-valued parameter this function returns
	 * the first value in the values array. If the parameter is undefined
	 * this function returns the optional default parameter <code>def</code>.
	 *
	 * @memberof RenderState
	 * @param {String} name The name of the parameter to retreive.
	 * @param {?String} def  The default value of the parameter in case it is undefined.
	 */

	getValue(name, def) {
		if (!isString(name)) {
			throw new TypeError('Parameter name must be a string');
		}

		let res = this.parameters[name];
		if (Array.isArray(res)) {
			res = res[0];
		}

		if (res === undefined && def !== undefined) {
			res = def;
		}

		return res;
	}

	/**
	 * Gets the string array parameter value for the given <code>name</code>.
	 * If the parameter for the given name is undefined, this function
	 * returns the optional default value array <code>def</code>.
	 *
	 * @memberof RenderState
	 * @param {String} name  The name of the parameter to retrieve.
	 * @param {?Array} def   The default value for the parameter if it is undefined.
	 * @returns {Array}
	 */

	getValues(name, def) {
		if (!isString(name)) {
			throw new TypeError('Parameter name must be a string');
		}

		let res = this.parameters[name];
		if (res === undefined) {
			res = def;
		}
		return res;
	}

	/**
	 * Returns the windowState for this RenderState.
	 *
	 * TODO: This is needed because it's used in the portlet 3 tests
	 *
	 * @returns {String}
	 */

	getWindowState() {
		return this.windowState;
	}

	/**
	 * Removes the parameter with the given name.
	 *
	 * @memberof RenderState
	 * @param {String} name The name of the parameter to be removed.
	 */

	remove(name) {
		if (!isString(name)) {
			throw new TypeError('Parameter name must be a string');
		}

		if (this.parameters[name] !== undefined) {
			delete this.parameters[name];
		}
	}

	/**
	 * Sets the portletMode to the specified value.
	 *
	 * @memberof RenderState
	 * @param {String} pm The portlet mode to be set.
	 * @returns {String}
	 * @see {PortletConstants}
	 */

	setPortletMode(pm) {
		if (!isString(pm)) {
			throw new TypeError('Portlet Mode must be a string');
		}

		const mode = pm.toLowerCase();
		if (mode === PortletConstants.EDIT || mode === PortletConstants.HELP || mode === PortletConstants.VIEW) {
			this.portletMode = mode;
		}
	}

	/**
	 * Sets a parameter with a given name and value.
	 * The value may be a string or an array.
	 *
	 * @memberof RenderState
	 * @param {String} name	The name of the parameter.
	 * @param {Array|String} value  The value of the parameter.
	 */

	setValue(name, value) {
		if (!isString(name)) {
			throw new TypeError('Parameter name must be a string');
		}

		if (!isString(value) && value !== null && !Array.isArray(value)) {
			throw new TypeError('Parameter value must be a string, an array or null');
		}

		let val = value;
		if (!Array.isArray(value)) {
			val = [value];
		}
		this.parameters[name] = val;
	}

	/**
	 * Sets a parameter with a given name and value.
	 * The value may be a string or an array.
	 *
	 * @memberof RenderState
	 * @param {String} name	The name of the parameter.
	 * @param {Array|String} value  The value of the parameter.
	 */

	setValues(name, value) {
		this.setValue(name, value);
	}

	/**
	 * Sets the windowState to the specified value.
	 *
	 * @memberof RenderState
	 * @param {String} pm The portlet mode to be set.
	 * @returns {String}
	 * @see {PortletConstants}
	 */

	setWindowState(ws) {
		if (!isString(ws)) {
			throw new TypeError('Window State must be a string');
		}

		const state = ws.toLowerCase();
		if (state === PortletConstants.MAXIMIZED || state === PortletConstants.MINIMIZED || state === PortletConstants.NORMAL) {
			this.windowState = state;
		}
	}
}

export {RenderState};
export default RenderState;