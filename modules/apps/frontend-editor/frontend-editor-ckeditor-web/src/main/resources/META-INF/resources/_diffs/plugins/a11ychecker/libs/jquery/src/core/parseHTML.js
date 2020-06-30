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
	'../core',
	'../var/document',
	'./var/rsingleTag',
	'../manipulation/buildFragment',

	// This is the only module that needs core/support

	'./support',
], (jQuery, document, rsingleTag, buildFragment, support) => {
	'use strict';

	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string

	jQuery.parseHTML = function (data, context, keepScripts) {
		if (typeof data !== 'string') {
			return [];
		}
		if (typeof context === 'boolean') {
			keepScripts = context;
			context = false;
		}

		var base, parsed, scripts;

		if (!context) {

			// Stop scripts or inline event handlers from being executed immediately
			// by using document.implementation

			if (support.createHTMLDocument) {
				context = document.implementation.createHTMLDocument('');

				// Set the base href for the created document
				// so any parsed elements with URLs
				// are based on the document's URL (gh-2965)

				base = context.createElement('base');
				base.href = document.location.href;
				context.head.appendChild(base);
			}
			else {
				context = document;
			}
		}

		parsed = rsingleTag.exec(data);
		scripts = !keepScripts && [];

		// Single tag

		if (parsed) {
			return [context.createElement(parsed[1])];
		}

		parsed = buildFragment([data], context, scripts);

		if (scripts && scripts.length) {
			jQuery(scripts).remove();
		}

		return jQuery.merge([], parsed.childNodes);
	};

	return jQuery.parseHTML;
});
