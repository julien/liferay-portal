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

import {IClayAlertProps} from './index';

interface IToastContainerProps extends React.HTMLAttributes<HTMLDivElement> {

	/**
	 * Children of the ToastContainer must be a ClayAlert
	 */
	children?:
		| React.ReactElement<IClayAlertProps>
		| Array<React.ReactElement<IClayAlertProps>>;
}

const ClayToastContainer = ({
	children,
	className,
	...otherProps
}: IToastContainerProps) => {
	return (
		<div
			{...otherProps}
			className={classNames(className, 'alert-container container')}
		>
			<div className="alert-notifications alert-notifications-fixed">
				{children}
			</div>
		</div>
	);
};

export default ClayToastContainer;
