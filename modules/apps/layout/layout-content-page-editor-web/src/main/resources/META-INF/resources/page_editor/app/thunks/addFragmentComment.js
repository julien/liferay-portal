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

import addFragmentEntryLinkComment from '../actions/addFragmentEntryLinkComment';
import FragmentCommentService from '../services/FragmentCommentService';

export default function addFragmentComment({
	body,
	config,
	fragmentEntryLinkId,
	network,
	parentCommentId
}) {
	return dispatch => {
		const {fetcher} = network;

		return FragmentCommentService.addFragmentEntryLinkComment({
			body,
			config,
			fetcher,
			fragmentEntryLinkId,
			parentCommentId
		}).then(fragmentEntryLinkComment => {
			dispatch(
				addFragmentEntryLinkComment({
					fragmentEntryLinkComment,
					fragmentEntryLinkId,
					parentCommentId
				})
			);
		});
	};
}
