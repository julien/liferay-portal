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

type DisplayType =
	| 'primary'
	| 'secondary'
	| 'info'
	| 'danger'
	| 'success'
	| 'warning';

interface IProps extends React.HTMLAttributes<HTMLSpanElement> {

	/**
	 * Determines the color of the badge.
	 */
	displayType?: DisplayType;

	/**
	 * Info that is shown inside of the badge itself.
	 */
	label?: string | number;
}

const ClayBadge = React.forwardRef<HTMLSpanElement, IProps>(
	(
		{className, displayType = 'primary', label, ...otherProps}: IProps,
		ref
	) => (
		<span
			{...otherProps}
			className={classNames('badge', `badge-${displayType}`, className)}
			ref={ref}
		>
			<span className="badge-item badge-item-expand">{label}</span>
		</span>
	)
);

ClayBadge.displayName = 'ClayBadge';

export default ClayBadge;
