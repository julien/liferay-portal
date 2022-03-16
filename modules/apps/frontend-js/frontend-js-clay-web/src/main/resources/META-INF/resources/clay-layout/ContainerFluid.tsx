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

import Container from './Container';

interface IProps
	extends Omit<
		React.ComponentProps<typeof Container>,
		'fluid' | 'fluidSize'
	> {
	size?: React.ComponentProps<typeof Container>['fluidSize'] | false;
}

const ClayContainerFluid = React.forwardRef<HTMLElement, IProps>(
	({children, size = 'xl', ...otherProps}: IProps, ref) => {
		return (
			<Container
				{...otherProps}
				fluid
				fluidSize={size === false ? undefined : size}
				ref={ref}
			>
				{children}
			</Container>
		);
	}
);

ClayContainerFluid.displayName = 'ClayContainerFluid';

export default ClayContainerFluid;
