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
import ClayIcon from '@clayui/icon';
import classNames from 'classnames';
import React, {useContext, useRef, useState} from 'react';
import {useDrag, useDrop} from 'react-dnd';

import {moveItem} from '../actions/index';
import {LAYOUT_DATA_ITEM_TYPES} from '../config/constants/layoutDataItemTypes';
import {DispatchContext} from '../reducers/index';
import Topper, {
	TopperInteractionsContext,
	TOPPER_ACTIVE,
	TOPPER_HOVER
} from './Topper';

const TopperBar = ({
	acceptDrop,
	active: activeTopper,
	children,
	item,
	layoutData,
	name
}) => {
	const [{active, hover}, dispatch] = useContext(TopperInteractionsContext);
	const [dragHover, setDragHover] = useState(null);
	const containerRef = useRef(null);
	const dispatchStore = useContext(DispatchContext);

	const [{isDragging}, drag] = useDrag({
		collect: monitor => ({
			isDragging: monitor.isDragging()
		}),
		end(_item, _monitor) {
			const result = _monitor.getDropResult();

			if (!result) {
				return;
			}

			const {itemId, position, siblingId} = result;

			if (itemId !== siblingId) {
				dispatchStore(moveItem({itemId, position, siblingId}));
			}
		},
		item: {
			...item,
			type: LAYOUT_DATA_ITEM_TYPES[item.type]
		}
	});

	const [{isOver}, drop] = useDrop({
		accept: acceptDrop,
		collect(_monitor) {
			return {
				isOver: _monitor.isOver({shallow: true})
			};
		},
		drop(_item, _monitor) {
			if (!_monitor.didDrop()) {
				return {
					itemId: _item.itemId,
					itemType: _monitor.getItemType(),
					position: dragHover,
					siblingId: item.itemId
				};
			}
		},
		hover(_item, _monitor) {
			const dragId = _item.itemId;
			const dragParentId = _item.parentId;
			const hoverId = item.itemId;

			// Don't replace items with themselves
			if (dragId === hoverId) {
				setDragHover(null);

				return;
			}

			// Determine rectangle on screen
			const hoverBoundingRect = containerRef.current.getBoundingClientRect();

			// Get vertical middle
			const hoverMiddleY =
				(hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

			// Determine mouse position
			const clientOffset = _monitor.getClientOffset();

			// Get pixels to the top
			const hoverClientY = clientOffset.y - hoverBoundingRect.top;

			if (dragParentId) {
				const parentChildren = layoutData.items[dragParentId].children;

				const dragIndex = parentChildren.findIndex(
					child => child === dragId
				);

				// When dragging downwards, only move when the cursor is below 50%
				// When dragging upwards, only move when the cursor is above 50%
				// Dragging downwards
				if (
					parentChildren[dragIndex + 1] !== hoverId &&
					hoverClientY < hoverMiddleY
				) {
					setDragHover(0);
					return;
				}

				// Dragging upwards
				if (
					parentChildren[dragIndex - 1] !== hoverId &&
					hoverClientY > hoverMiddleY
				) {
					setDragHover(1);
					return;
				}
			} else {
				if (hoverClientY < hoverMiddleY) {
					setDragHover(0);
					return;
				}

				if (hoverClientY > hoverMiddleY) {
					setDragHover(1);
					return;
				}
			}

			setDragHover(null);
		}
	});

	const handleTopperInteractions = (event, payload, type) => {
		event.stopPropagation();

		if (!acceptDrop.length || isDragging) {
			return;
		}

		dispatch({payload, type});
	};

	const styles = {
		'fragments-editor__topper-wrapper--active': active === item.itemId,
		'fragments-editor__topper-wrapper--hovered fragment-entry-link-wrapper--hovered':
			hover === item.itemId,
		'fragments-editor-border-bottom': dragHover === 1 && isOver,
		'fragments-editor-border-top': dragHover === 0 && isOver
	};

	if (!activeTopper) {
		return React.cloneElement(children, {
			className: classNames(
				'fragments-editor__drag-source fragments-editor__drag-source--fragment fragments-editor__drop-target fragments-editor__topper-wrapper fragment-entry-link-wrapper',
				children.className,
				styles
			),
			ref: node => {
				containerRef.current = node;
				drop(node);

				// Call the original ref, if any.
				const {ref} = children;
				if (typeof ref === 'function') {
					ref(node);
				}
			}
		});
	}

	return (
		<div
			className={classNames(
				'fragments-editor__drag-source fragments-editor__drag-source--fragment fragments-editor__drop-target fragments-editor__topper-wrapper fragment-entry-link-wrapper',
				styles
			)}
			onClick={event =>
				handleTopperInteractions(event, item.itemId, TOPPER_ACTIVE)
			}
			onMouseLeave={event =>
				handleTopperInteractions(event, null, TOPPER_HOVER)
			}
			onMouseOver={event =>
				handleTopperInteractions(event, item.itemId, TOPPER_HOVER)
			}
			ref={containerRef}
		>
			<Topper>
				<Topper.Item expand isDragHandler ref={drag}>
					<ul className="tbar-nav">
						<Topper.Item className="pr-0">
							<ClayIcon
								className="fragments-editor__topper__drag-icon fragments-editor__topper__icon"
								symbol="drag"
							/>
						</Topper.Item>
						<Topper.Item isTitle>{name}</Topper.Item>
					</ul>
				</Topper.Item>
				<Topper.Item>
					<ClayButton displayType="unstyled" small>
						<ClayIcon
							className="fragments-editor__topper__icon"
							symbol="comments"
						/>
					</ClayButton>
				</Topper.Item>
				<Topper.Item>
					<ClayButton displayType="unstyled" small>
						<ClayIcon
							className="fragments-editor__topper__icon"
							symbol="times-circle"
						/>
					</ClayButton>
				</Topper.Item>
			</Topper>
			<div
				className={classNames('fragment-entry-link-content', {
					dragged: isDragging
				})}
				ref={drop}
			>
				{children}
			</div>
		</div>
	);
};

export default TopperBar;
