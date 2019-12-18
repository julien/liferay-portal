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

import React from 'react';
import {useDragLayer} from 'react-dnd';

const getItemStyles = currentOffset => {
	if (!currentOffset) {
		return {
			display: 'none'
		};
	}

	const {x, y} = currentOffset;
	const transform = `translate(${x}px, ${y}px)`;

	return {
		WebkitTransform: transform,
		transform
	};
};

export default function DragPreview({fragmentEntryLinks}) {
	const {currentOffset, isDragging, item} = useDragLayer(_monitor => ({
		currentOffset: _monitor.getSourceClientOffset(),
		isDragging: _monitor.isDragging(),
		item: _monitor.getItem()
	}));

	if (!isDragging) {
		return null;
	}

	const itemDetails = item.name
		? item
		: fragmentEntryLinks[item.config.fragmentEntryLinkId];

	return (
		<div className="page-editor-drag__preview-layer">
			<div
				className="page-editor-drag__preview"
				style={getItemStyles(currentOffset)}
			>
				{itemDetails && itemDetails.name
					? itemDetails.name
					: Liferay.Language.get('element')}
			</div>
		</div>
	);
}
