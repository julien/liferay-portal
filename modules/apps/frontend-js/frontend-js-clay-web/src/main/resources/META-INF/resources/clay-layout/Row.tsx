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

interface IProps extends React.HTMLAttributes<HTMLDivElement> {

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
	 * This removes the negative margins from .row and the
	 * horizontal padding from all immediate children columns
	 */
	gutters?: boolean;

	/**
	 * Horizontal positioning of row contents
	 */
	justify?: 'start' | 'center' | 'end' | 'around' | 'between';
}

const ClayRow = React.forwardRef<HTMLElement, IProps>(
	(
		{
			children,
			className,
			containerElement: ContainerElement = 'div',
			gutters = true,
			justify,
			...otherProps
		}: IProps,
		ref
	) => {
		return (
			<ContainerElement
				{...otherProps}
				className={classNames('row', className, {
					'no-gutters': !gutters,
					[`justify-content-${justify}`]: justify,
				})}
				ref={ref}
			>
				{children}
			</ContainerElement>
		);
	}
);

ClayRow.displayName = 'ClayRow';

export default ClayRow;
