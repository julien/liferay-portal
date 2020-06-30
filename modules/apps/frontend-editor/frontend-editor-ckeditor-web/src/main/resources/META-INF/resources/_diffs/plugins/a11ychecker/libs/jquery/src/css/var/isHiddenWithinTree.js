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

define([
	'../../core',
	'../../core/isAttached',

	// css is assumed

], (jQuery, isAttached) => {
	'use strict';

	// isHiddenWithinTree reports if an element has a non-"none" display style (inline and/or
	// through the CSS cascade), which is useful in deciding whether or not to make it visible.
	// It differs from the :hidden selector (jQuery.expr.pseudos.hidden) in two important ways:
	// * A hidden ancestor does not force an element to be classified as hidden.
	// * Being disconnected from the document does not force an element to be classified as hidden.
	// These differences improve the behavior of .toggle() et al. when applied to elements that are
	// detached or contained within hidden ancestors (gh-2404, gh-2863).

	return function (elem, el) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument

		elem = el || elem;

		// Inline style trumps all

		return (
			elem.style.display === 'none' ||
			(elem.style.display === '' &&

				// Otherwise, check computed style
				// Support: Firefox <=43 - 45
				// Disconnected elements can have computed display: none, so first confirm that elem is
				// in the document.

				isAttached(elem) &&
				jQuery.css(elem, 'display') === 'none')
		);
	};
});
