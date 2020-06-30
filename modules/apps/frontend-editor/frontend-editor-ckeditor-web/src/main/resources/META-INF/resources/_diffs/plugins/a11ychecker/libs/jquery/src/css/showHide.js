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

define(['../core', '../data/var/dataPriv', '../css/var/isHiddenWithinTree'], (
	jQuery,
	dataPriv,
	isHiddenWithinTree
) => {
	'use strict';

	var defaultDisplayMap = {};

	function getDefaultDisplay(elem) {
		var temp,
			doc = elem.ownerDocument,
			nodeName = elem.nodeName,
			display = defaultDisplayMap[nodeName];

		if (display) {
			return display;
		}

		temp = doc.body.appendChild(doc.createElement(nodeName));
		display = jQuery.css(temp, 'display');

		temp.parentNode.removeChild(temp);

		if (display === 'none') {
			display = 'block';
		}
		defaultDisplayMap[nodeName] = display;

		return display;
	}

	function showHide(elements, show) {
		var display,
			elem,
			values = [],
			index = 0,
			length = elements.length;

		// Determine new display value for elements that need to change

		for (; index < length; index++) {
			elem = elements[index];
			if (!elem.style) {
				continue;
			}

			display = elem.style.display;
			if (show) {

				// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
				// check is required in this first loop unless we have a nonempty display value (either
				// inline or about-to-be-restored)

				if (display === 'none') {
					values[index] = dataPriv.get(elem, 'display') || null;
					if (!values[index]) {
						elem.style.display = '';
					}
				}
				if (elem.style.display === '' && isHiddenWithinTree(elem)) {
					values[index] = getDefaultDisplay(elem);
				}
			}
			else {
				if (display !== 'none') {
					values[index] = 'none';

					// Remember what we're overwriting

					dataPriv.set(elem, 'display', display);
				}
			}
		}

		// Set the display of the elements in a second loop to avoid constant reflow

		for (index = 0; index < length; index++) {
			if (values[index] != null) {
				elements[index].style.display = values[index];
			}
		}

		return elements;
	}

	jQuery.fn.extend({
		show() {
			return showHide(this, true);
		},
		hide() {
			return showHide(this);
		},
		toggle(state) {
			if (typeof state === 'boolean') {
				return state ? this.show() : this.hide();
			}

			return this.each(function () {
				if (isHiddenWithinTree(this)) {
					jQuery(this).show();
				}
				else {
					jQuery(this).hide();
				}
			});
		},
	});

	return showHide;
});
