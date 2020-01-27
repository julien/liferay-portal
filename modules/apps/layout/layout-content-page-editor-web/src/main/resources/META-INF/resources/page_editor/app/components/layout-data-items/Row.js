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

/* eslint no-console: 0 */
import classNames from 'classnames';
import {useEventListener} from 'frontend-js-react-web';
import dom from 'metal-dom';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState
} from 'react';

import useMousePosition from '../../../core/hooks/useMousePosition';
import updateColSize from '../../actions/updateColSize';
import {LAYOUT_DATA_ITEM_DEFAULT_CONFIGURATIONS} from '../../config/constants/layoutDataItemDefaultConfigurations';
import {LAYOUT_DATA_ITEM_TYPES} from '../../config/constants/layoutDataItemTypes';
import {ConfigContext} from '../../config/index';
import {useDispatch, useSelector} from '../../store/index';
import resizeColumns from '../../thunks/resizeColumns';
import ColumnOverlayGrid from './ColumnOverlayGrid';
import ResizingContext from './ResizingContext';

const TOTAL_NUMBER_OF_COLUMNS = 12;

function getGridDeltas(colWidth) {
	return [...Array(TOTAL_NUMBER_OF_COLUMNS).keys()].reduce(
		(acc, current, index) => {
			if (index === 0) {
				return acc;
			}

			return [...acc, acc[current - 1] + colWidth];
		},
		[colWidth]
	);
}

function getCurrentGridPosition(mousePosition, gridSizes) {
	const indexArr = gridSizes.map(size => Math.abs(size - mousePosition));

	const min = Math.min.apply(Math, indexArr);

	return indexArr.indexOf(min);
}

const Row = React.forwardRef(({children, className, item, layoutData}, ref) => {
	const {gutters} = {
		...LAYOUT_DATA_ITEM_DEFAULT_CONFIGURATIONS[LAYOUT_DATA_ITEM_TYPES.row],
		...item.config
	};
	const parent = layoutData.items[item.parentId];
	const config = useContext(ConfigContext);
	const dispatch = useDispatch();
	const store = useSelector(state => state);
	const {mouseX} = useMousePosition();
	const rowRef = useRef(null);

	const [gridSizes, setGridSizes] = useState([]);
	const [highlightedColumn, setHighLightedColumn] = useState(0);
	const [resizing, setResizing] = useState(false);

	useEffect(() => {
		if (!rowRef.current) {
			return;
		}

		const rowWidth = rowRef.current.offsetWidth;
		const colWidth = Math.floor(rowWidth / TOTAL_NUMBER_OF_COLUMNS);
		const sizes = getGridDeltas(colWidth);
		// offsetLeft
		setGridSizes(sizes);
	}, [rowRef]);

	useEffect(() => {
		if (!resizing) {
			return;
		}

		const containerRef = dom.closest(
			rowRef.current,
			'.container, .container-fluid'
		);

		const mousePosition = mouseX - containerRef.offsetLeft;

		const index = getCurrentGridPosition(mousePosition, gridSizes);

		setHighLightedColumn(index);
	}, [gridSizes, resizing, mouseX]);

	function clearResizing() {
		if (resizing) {
			setResizing(false);
			setHighLightedColumn(0);
		}
	}

	function handleMouseLeave() {
		clearResizing();
	}

	const onResizeHandlerMouseDown = useCallback(() => setResizing(true), []);

	function onResizeHandlerMouseUp() {
		clearResizing();

		resizeColumns({
			config,
			layoutData: store.layoutData,
			store
		});
	}

	const onColumnSizeChanged = useCallback(
		({columnsSize, itemId, nextColumn}) => {
			if (resizing) {
				dispatch(
					updateColSize({
						itemId,
						nextColumnItemId: nextColumn.itemId,
						nextColumnSize: columnsSize.next,
						size: columnsSize.current
					})
				);
			}
		},
		[resizing, dispatch]
	);

	useEventListener('mouseup', onResizeHandlerMouseUp, false, document.body);
	useEventListener('mouseleave', handleMouseLeave, false, document.body);

	const rowContent = (
		<div
			className={classNames(className, 'row', {
				empty: !item.children.some(
					childId => layoutData.items[childId].children.length
				),
				'no-gutters': !gutters
			})}
			ref={node => {
				if (node) {
					rowRef.current = node;

					if (ref) {
						ref.current = node;
					}
				}
			}}
		>
			<ResizingContext.Provider
				value={{
					mouseX,
					onColumnSizeChanged,
					onResizeHandlerMouseDown,
					resizing,
					rowRef
				}}
			>
				{children}
			</ResizingContext.Provider>
			{resizing && (
				<ColumnOverlayGrid
					columnSpacing={gutters}
					highlightedColumn={highlightedColumn}
				/>
			)}
		</div>
	);

	return (
		<>
			{!parent || parent.type === LAYOUT_DATA_ITEM_TYPES.root ? (
				<div className="container-fluid p-0">{rowContent}</div>
			) : (
				rowContent
			)}
		</>
	);
});

export default Row;
