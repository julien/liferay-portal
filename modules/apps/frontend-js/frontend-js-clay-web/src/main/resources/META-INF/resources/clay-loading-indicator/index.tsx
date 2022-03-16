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
	 * Flag to indicate the 'light' variant
	 */
	light?: boolean;

	/**
	 * Flag to indicate the small size
	 */
	small?: boolean;
}

const ClayLoadingIndicator = React.forwardRef<HTMLSpanElement, IProps>(
	({className, light, small, ...otherProps}: IProps, ref) => {
		return (
			<span
				aria-hidden="true"
				{...otherProps}
				className={classNames(className, 'loading-animation', {
					'loading-animation-light': light,
					'loading-animation-sm': small,
				})}
				ref={ref}
			/>
		);
	}
);

ClayLoadingIndicator.displayName = 'ClayLoadingIndicator';

export default ClayLoadingIndicator;
