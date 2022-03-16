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

interface IContentRowProps extends React.HTMLAttributes<HTMLDivElement> {

	/**
	 * Element or component to render for container
	 */
	containerElement?:
		| string
		| React.JSXElementConstructor<{
				className: string;
				[key: string]: any;
		  }>;

	/**
	 * Provides the benefit of aligning content via flexbox without losing the behavior
	 * of floated elements at the expense of extra markup.
	 */
	float?:
		| boolean
		| 'sm-down'
		| 'md-down'
		| 'end'
		| 'end-sm-down'
		| 'end-md-down';

	/*
	 * Give negative margins on the top, right, bottom, and left to offset the padding
	 */
	noGutters?: 'sm' | 'x' | 'y' | true;

	/*
	 * Gives padding to all autofit-cols that are direct children of autofit-row.
	 */
	padded?: boolean;

	/**
	 * Adds class for aligning items within the row.
	 */
	verticalAlign?: 'center' | 'end';
}

const ContentRow = React.forwardRef<HTMLElement, IContentRowProps>(
	(
		{
			children,
			className,
			containerElement: ContainerElement = 'div',
			float,
			noGutters,
			padded,
			verticalAlign,
			...otherProps
		}: IContentRowProps,
		ref
	) => (
		<ContainerElement
			{...otherProps}
			className={classNames(className, 'autofit-row', {
				'autofit-float': float === true,
				[`autofit-float-${float}`]: typeof float === 'string',
				'autofit-padded': padded,
				'autofit-padded-no-gutters': noGutters === true,
				[`autofit-padded-no-gutters-${noGutters}`]:
					typeof noGutters === 'string',
				[`autofit-row-${verticalAlign}`]: verticalAlign,
			})}
			ref={ref}
		>
			{children}
		</ContainerElement>
	)
);

ContentRow.displayName = 'ClayContentRow';

interface IContentColProps extends React.HTMLAttributes<HTMLDivElement> {

	/**
	 * Element or component to render for container
	 */
	containerElement?:
		| string
		| React.JSXElementConstructor<{
				className: string;
				[key: string]: any;
		  }>;

	/*
	 * Makes column expand and fill available space in row.
	 */
	expand?: boolean;

	/**
	 * Provides the benefit of aligning content via flexbox without losing the behavior
	 * of floated elements at the expense of extra markup.
	 */
	float?: 'end';

	/**
	 * Applies the `autofit-col-gutters` class
	 */
	gutters?: boolean;

	/**
	 * Applies the `autofit-col-shrink` class.
	 */
	shrink?: boolean;
}

const ContentCol = React.forwardRef<HTMLElement, IContentColProps>(
	(
		{
			children,
			className,
			containerElement: ContainerElement = 'div',
			expand,
			float,
			gutters,
			shrink,
			...otherProps
		}: IContentColProps,
		ref
	) => (
		<ContainerElement
			{...otherProps}
			className={classNames(className, 'autofit-col', {
				'autofit-col-expand': expand,
				'autofit-col-gutters': gutters,
				'autofit-col-shrink': shrink,
				[`autofit-col-${float}`]: float,
			})}
			ref={ref}
		>
			{children}
		</ContainerElement>
	)
);

ContentCol.displayName = 'ClayContentCol';

interface IColSectionProps extends React.HTMLAttributes<HTMLDivElement> {

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

const ContentSection = React.forwardRef<HTMLElement, IColSectionProps>(
	(
		{
			children,
			className,
			containerElement: ContainerElement = 'div',
			...otherProps
		}: IColSectionProps,
		ref
	) => {
		return (
			<ContainerElement
				{...otherProps}
				className={classNames(className, 'autofit-section')}
				ref={ref}
			>
				{children}
			</ContainerElement>
		);
	}
);

ContentSection.displayName = 'ClayContentSection';

export {ContentCol, ContentRow, ContentSection};
