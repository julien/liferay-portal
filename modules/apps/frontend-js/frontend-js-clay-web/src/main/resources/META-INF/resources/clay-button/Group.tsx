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

export interface IButtonGroupProps
	extends React.HTMLAttributes<HTMLDivElement> {

	/**
	 * Flag to indicate the spacing between the buttons.
	 */
	spaced?: boolean;

	/**
	 * Flag to indicate if buttons are stacked vertically.
	 */
	vertical?: boolean;
}

const ClayButtonGroup: React.FunctionComponent<IButtonGroupProps> = ({
	children,
	className,
	role = 'group',
	spaced,
	vertical,
	...otherProps
}: IButtonGroupProps) => (
	<div
		{...otherProps}
		className={classNames(
			className,
			vertical ? 'btn-group-vertical' : 'btn-group'
		)}
		role={role}
	>
		{spaced
			? React.Children.map(children, (child, i) =>
					React.cloneElement(
						<div className="btn-group-item">{child}</div>,
						{key: i}
					)
			  )
			: children}
	</div>
);

export default ClayButtonGroup;
