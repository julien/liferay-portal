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
	 * Adds `.container-fluid` class to create a fluid container that
	 * doesn't expand beyond a set width
	 */
	fluid?: boolean;

	/**
	 * Adds `.container-fluid-${size}` class to set max width on container.
	 */
	fluidSize?: 'sm' | 'md' | 'lg' | 'xl';

	/**
	 * Adds the `.container-form-${formSize}` class to properly space
	 * between application controls and the form. This class only modifies
	 * the padding on the container.
	 */
	formSize?: 'sm' | 'md' | 'lg' | 'xl';

	/**
	 * Adds the `.container-view` class to properly space between application
	 * controls and view pages (e.g., Card View, Table View, or List View).
	 * This class only modifies the padding on the container.
	 */
	view?: boolean;
}

const ClayContainer = React.forwardRef<HTMLElement, IProps>(
	(
		{
			children,
			className,
			containerElement: ContainerElement = 'div',
			fluid,
			fluidSize,
			formSize,
			view,
			...otherProps
		}: IProps,
		ref
	) => {
		return (
			<ContainerElement
				{...otherProps}
				className={classNames(className, {
					'container': !fluid,
					'container-fluid': fluid,
					[`container-form-${formSize}`]: formSize,
					'container-view': view,
					[`container-fluid-max-${fluidSize}`]: fluid && fluidSize,
				})}
				ref={ref}
			>
				{children}
			</ContainerElement>
		);
	}
);

ClayContainer.displayName = 'ClayContainer';

export default ClayContainer;
