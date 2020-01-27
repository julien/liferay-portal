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

import ClayButton from '@clayui/button';

/* eslint no-console: 0 */
import classNames from 'classnames';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';

import {LAYOUT_DATA_ITEM_DEFAULT_CONFIGURATIONS} from '../../config/constants/layoutDataItemDefaultConfigurations';
import {LAYOUT_DATA_ITEM_TYPES} from '../../config/constants/layoutDataItemTypes';
import {useSelector} from '../../store/index';
import ResizingContext from './ResizingContext';

function getColumnInfo({item, layoutData}) {
	const rowColumns = layoutData.items[item.parentId].children;
	const colIndex = rowColumns.indexOf(item.itemId);
	const nextColumnIndex = colIndex + 1;
	const nextColumn = {...layoutData.items[rowColumns[nextColumnIndex]]};
	const nextColumnConfig =
		typeof nextColumn === 'object' && Object.keys(nextColumn).length
			? nextColumn.config
			: {};

	return {
		colIndex,
		isLastColumn: rowColumns.indexOf(item.itemId) === rowColumns.length - 1,
		nextColumn: nextColumn ? nextColumn : {},
		nextColumnConfig: nextColumn ? nextColumnConfig : {},
		nextColumnIndex: colIndex + 1,
		rowColumns
	};
}

function getColumnsPosition({columnElement, nextColumnElement}) {
	let maxPosition = 0;
	let minPosition = 0;

	if (columnElement && nextColumnElement) {
		const nextColumnRect = nextColumnElement.getBoundingClientRect();
		maxPosition = nextColumnRect.left + nextColumnRect.width;
		minPosition = columnElement.getBoundingClientRect().left;
	}

	return {maxPosition, minPosition};
}

function calculateColumnsSizes({
	currentColumnSize,
	maxPosition,
	minPosition,
	mousePosition,
	nextColumnSize
}) {
	const position = Math.max(
		Math.min(mousePosition, maxPosition),
		minPosition
	);
	const maxColumns =
		(parseInt(currentColumnSize, 10) || 1) +
		(parseInt(nextColumnSize, 10) || 1) -
		1;
	const newCurrentColumns = Math.max(
		Math.round(
			((position - minPosition) / (maxPosition - minPosition)) *
				maxColumns
		),
		1
	);
	return {maxColumns, newCurrentColumns};
}

const Column = React.forwardRef(
	({children, className, item, ...props}, ref) => {
		const {
			config: {
				size = LAYOUT_DATA_ITEM_DEFAULT_CONFIGURATIONS[
					LAYOUT_DATA_ITEM_TYPES.column
				].size
			},
			itemId
		} = item;

		const layoutData = useSelector(state => state.layoutData);

		const {
			mouseX,
			onColumnSizeChanged,
			onResizeHandlerMouseDown,
			resizing
		} = useContext(ResizingContext);
		const columnRef = useRef(null);

		const {
			colIndex,
			isLastColumn,
			nextColumn,
			nextColumnConfig,
			nextColumnIndex
		} = useMemo(
			() =>
				getColumnInfo({
					item,
					layoutData
				}),
			[item, layoutData]
		);

		const [columnsSize, setColumnsSize] = useState({
			current: size,
			next: nextColumnConfig.size
		});

		const columnElement = columnRef.current;
		const nextColumnElement = document.getElementById(
			`page_editor-col-${nextColumnIndex}`
		);

		const {maxPosition, minPosition} = useMemo(
			() => getColumnsPosition({columnElement, nextColumnElement}),
			[columnElement, nextColumnElement]
		);

		useEffect(() => {
			if (resizing) {
				const {maxColumns, newCurrentColumns} = calculateColumnsSizes({
					currentColumnSize: columnsSize.current,
					maxPosition,
					minPosition,
					mousePosition: mouseX,
					nextColumnSize: columnsSize.next
				});

				setColumnsSize({
					current: newCurrentColumns,
					next: maxColumns - newCurrentColumns + 1
				});
			}
		}, [columnsSize, maxPosition, minPosition, mouseX, resizing]);

		useEffect(
			() => onColumnSizeChanged({columnsSize, itemId, nextColumn}),
			[columnsSize, itemId, nextColumn, onColumnSizeChanged]
		);

		const resizeHandler = (
			<div>
				{children}
				<ClayButton
					className="page-editor__col-resizer"
					onMouseDown={onResizeHandlerMouseDown}
				/>
			</div>
		);

		return (
			<>
				<div
					className={classNames(className, 'col', {
						[`col-${size}`]: size
					})}
					id={`page_editor-col-${colIndex}`}
					ref={node => {
						columnRef.current = node;
						if (ref) {
							ref.current = node;
						}
					}}
					{...props}
				>
					{!isLastColumn ? resizeHandler : children}
				</div>
			</>
		);
	}
);

export default Column;
