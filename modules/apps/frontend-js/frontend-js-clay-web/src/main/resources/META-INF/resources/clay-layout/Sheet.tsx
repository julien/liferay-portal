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

import classNames from 'classnames';
import React from 'react';

interface IContainerProps extends React.HTMLAttributes<HTMLElement> {

	/**
	 * Element or component to render for container
	 */
	containerElement?:
		| string
		| React.JSXElementConstructor<{
				className: string;
				[key: string]: any;
		  }>;
}

const SheetHeader = React.forwardRef<HTMLElement, IContainerProps>(
	(
		{
			children,
			className,
			containerElement: ContainerElement = 'div',
			...otherProps
		}: IContainerProps,
		ref
	) => {
		return (
			<ContainerElement
				{...otherProps}
				className={classNames(className, 'sheet-header')}
				ref={ref}
			>
				{children}
			</ContainerElement>
		);
	}
);

SheetHeader.displayName = 'ClaySheetHeader';

const SheetFooter = React.forwardRef<HTMLElement, IContainerProps>(
	(
		{
			children,
			className,
			containerElement: ContainerElement = 'div',
			...otherProps
		}: IContainerProps,
		ref
	) => {
		return (
			<ContainerElement
				{...otherProps}
				className={classNames(className, 'sheet-footer')}
				ref={ref}
			>
				{children}
			</ContainerElement>
		);
	}
);

SheetFooter.displayName = 'ClaySheetFooter';

const SheetSection = React.forwardRef<HTMLElement, IContainerProps>(
	(
		{
			children,
			className,
			containerElement: ContainerElement = 'div',
			...otherProps
		}: IContainerProps,
		ref
	) => {
		return (
			<ContainerElement
				{...otherProps}
				className={classNames(className, 'sheet-section')}
				ref={ref}
			>
				{children}
			</ContainerElement>
		);
	}
);

SheetSection.displayName = 'ClaySheetSection';

interface IProps extends IContainerProps {

	/**
	 * Setting this to sets a max-width on the sheet
	 */
	size?: 'lg';
}

const Sheet = React.forwardRef<HTMLElement, IProps>(
	(
		{
			children,
			className,
			containerElement: ContainerElement = 'div',
			size,
			...otherProps
		}: IProps,
		ref
	) => {
		return (
			<ContainerElement
				{...otherProps}
				className={classNames(className, 'sheet', {
					[`sheet-${size}`]: size,
				})}
				ref={ref}
			>
				{children}
			</ContainerElement>
		);
	}
);

Sheet.displayName = 'ClaySheet';

export {Sheet, SheetFooter, SheetHeader, SheetSection};
