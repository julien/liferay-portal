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

/**
 * @license Copyright (c) 2014-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/license
 */

(function () {
	'use strict';

	CKEDITOR.plugins.a11ychecker.quickFixes.get({
		langCode: 'pt-br',
		name: 'QuickFix',
		callback(QuickFix) {
			var emptyWhitespaceRegExp = /^[\s\n\r]+$/g;

			/**
			 * QuickFix adding a caption in the `table` element.
			 *
			 * @member CKEDITOR.plugins.a11ychecker.quickFix
			 * @class AddTableCaption
			 * @constructor
			 * @param {CKEDITOR.plugins.a11ychecker.Issue} issue Issue QuickFix is created for.
			 */
			function AddTableCaption(issue) {
				QuickFix.call(this, issue);
			}

			AddTableCaption.prototype = new QuickFix();

			AddTableCaption.prototype.constructor = AddTableCaption;

			AddTableCaption.prototype.display = function (form) {
				form.setInputs({
					caption: {
						type: 'text',
						label: this.lang.captionLabel,
					},
				});
			};

			/**
			 * @param {Object} formAttributes Object containing serialized form inputs. See
			 * {@link CKEDITOR.plugins.a11ychecker.ViewerForm#serialize}.
			 * @param {Function} callback Function to be called when a fix was applied. Gets QuickFix object
			 * as a first parameter.
			 */
			AddTableCaption.prototype.fix = function (
				formAttributes,
				callback
			) {
				var issueElement = this.issue.element,
					caption = issueElement
						.getDocument()
						.createElement('caption');

				caption.setHtml(formAttributes.caption);

				// Prepend the caption.

				issueElement.append(caption, true);

				if (callback) {
					callback(this);
				}
			};

			AddTableCaption.prototype.validate = function (formAttributes) {
				var proposedCaption = formAttributes.caption,
					ret = [];

				// Test if the caption has only whitespaces.

				if (
					!proposedCaption ||
					proposedCaption.match(emptyWhitespaceRegExp)
				) {
					ret.push(this.lang.errorEmpty);
				}

				return ret;
			};

			AddTableCaption.prototype.lang = {
				captionLabel: 'Legenda da tabela',
				errorEmpty: 'O texto da legenda da tabela não pode estar vazio',
			};
			CKEDITOR.plugins.a11ychecker.quickFixes.add(
				'pt-br/AddTableCaption',
				AddTableCaption
			);
		},
	});
})();
