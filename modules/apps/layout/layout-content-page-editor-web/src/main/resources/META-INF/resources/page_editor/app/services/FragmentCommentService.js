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
 * @typedef FragmentComment
 * @property {object} author
 * @property {string} body
 * @property {number} commentId
 * @property {string} dateDescription
 * @property {boolean} edited
 * @property {string} modifiedDescription
 * @property {boolean} resolved
 */

export default {
	/**
	 * Adds a new Fragment to the current layout
	 * @param {object} options
	 * @param {string} options.body Body of the comment
	 * @param {Function} options.fetcher service fetcher
	 * @param {object} options.config AppConfig
	 * @param {string} options.fragmentEntryLinkId Id of the Fragment
	 * @return {Promise<FragmentComment>} Created FragmentComment
	 */
	addFragmentEntryLinkComment({
		body,
		config,
		fetcher,
		fragmentEntryLinkId,
		parentCommentId = 0
	}) {
		const {addFragmentEntryLinkCommentURL} = config;

		return fetcher(addFragmentEntryLinkCommentURL, {
			body,
			fragmentEntryLinkId,
			parentCommentId
		});
	},

	/**
	 * Deletes a fragment comment
	 * @param {object} options
	 * @param {string} options.commentId Id of the comment
	 * @param {Function} options.fetcher service fetcher
	 * @param {object} options.config AppConfig
	 * @return {Promise<void>}
	 */
	deleteFragmentEntryLinkComment({commentId, config, fetcher}) {
		const {deleteFragmentEntryLinkCommentURL} = config;

		return fetcher(deleteFragmentEntryLinkCommentURL, {
			commentId
		});
	},

	/**
	 * Edits a fragment comment
	 * @param {object} options
	 * @param {string} options.body Body of the comment
	 * @param {string} options.commentId Id of the comment
	 * @param {Function} options.fetcher service fetcher
	 * @param {object} options.config AppConfig
	 * @param {boolean} options.resolved Whether the comment should be marked as resolved or not
	 * @return {Promise<FragmentComment>} Created FragmentComment
	 */
	editFragmentEntryLinkComment({body, commentId, config, fetcher, resolved}) {
		const {editFragmentEntryLinkCommentURL} = config;

		return fetcher(editFragmentEntryLinkCommentURL, {
			body,
			commentId,
			resolved
		});
	}
};
