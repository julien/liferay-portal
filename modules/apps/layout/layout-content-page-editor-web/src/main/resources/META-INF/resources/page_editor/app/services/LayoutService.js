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

export default {
	/**
	 * Updates layout's layoutData
	 * @param {object} options
	 * @param {object} options.config Application config
	 * @param {string} options.segmentsExperienceId Current segmentsExperienceId
	 * @param {Function} options.fetcher service fetcher
	 * @param {object} options.layoutData New layoutData
	 * @return {Promise<void>}
	 */
	updateLayoutData({config, fetcher, layoutData, segmentsExperienceId}) {
		const {classNameId, classPK, updateLayoutPageTemplateDataURL} = config;

		return fetcher(updateLayoutPageTemplateDataURL, {
			classNameId,
			classPK,
			data: JSON.stringify(layoutData),
			segmentsExperienceId
		});
	}
};
