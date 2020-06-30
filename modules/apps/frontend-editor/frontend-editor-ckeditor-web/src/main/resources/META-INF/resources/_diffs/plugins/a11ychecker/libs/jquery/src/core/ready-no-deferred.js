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

define(['../core', '../var/document', '../var/isFunction'], (
	jQuery,
	document,
	isFunction
) => {
	'use strict';

	var readyCallbacks = [],
		whenReady = function (fn) {
			readyCallbacks.push(fn);
		},
		executeReady = function (fn) {

			// Prevent errors from freezing future callback execution (gh-1823)
			// Not backwards-compatible as this does not execute sync

			window.setTimeout(() => {
				fn.call(document, jQuery);
			});
		};

	jQuery.fn.ready = function (fn) {
		whenReady(fn);

		return this;
	};

	jQuery.extend({

		// Is the DOM ready to be used? Set to true once it occurs.

		isReady: false,

		// A counter to track how many items to wait for before
		// the ready event fires. See #6781

		readyWait: 1,

		ready(wait) {

			// Abort if there are pending holds or we're already ready

			if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
				return;
			}

			// Remember that the DOM is ready

			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be

			if (wait !== true && --jQuery.readyWait > 0) {
				return;
			}

			whenReady = function (fn) {
				readyCallbacks.push(fn);

				while (readyCallbacks.length) {
					fn = readyCallbacks.shift();
					if (isFunction(fn)) {
						executeReady(fn);
					}
				}
			};

			whenReady();
		},
	});

	// Make jQuery.ready Promise consumable (gh-1778)

	jQuery.ready.then = jQuery.fn.ready;

	/**
	 * The ready event handler and self cleanup method
	 */
	function completed() {
		document.removeEventListener('DOMContentLoaded', completed);
		window.removeEventListener('load', completed);
		jQuery.ready();
	}

	// Catch cases where $(document).ready() is called
	// after the browser event has already occurred.
	// Support: IE9-10 only
	// Older IE sometimes signals "interactive" too soon

	if (
		document.readyState === 'complete' ||
		(document.readyState !== 'loading' &&
			!document.documentElement.doScroll)
	) {

		// Handle it asynchronously to allow scripts the opportunity to delay ready

		window.setTimeout(jQuery.ready);
	}
	else {

		// Use the handy event callback

		document.addEventListener('DOMContentLoaded', completed);

		// A fallback to window.onload, that will always work

		window.addEventListener('load', completed);
	}
});
