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

import ButtonGroup from './Group';

export type DisplayType =
	| null
	| 'primary'
	| 'secondary'
	| 'link'
	| 'success'
	| 'warning'
	| 'danger'
	| 'info'
	| 'unstyled';

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {

	/**
	 * Flag to indicate if button is used within an alert component.
	 */
	alert?: boolean;

	/**
	 * Renders the button as a block element.
	 */
	block?: boolean;

	/**
	 * Flag to indicate if link should be borderless.
	 */
	borderless?: boolean;

	/**
	 * Determines how to button is displayed.
	 */
	displayType?: DisplayType;

	/**
	 * Flag to indicate if button should be monospaced.
	 */
	monospaced?: boolean;

	/**
	 * Flag to indicate if link need have an outline.
	 */
	outline?: boolean;

	/**
	 * Indicates button should be a small variant.
	 */
	small?: boolean;
}

const ClayButton = React.forwardRef<HTMLButtonElement, IProps>(
	(
		{
			alert,
			block,
			borderless,
			children,
			className,
			displayType = 'primary',
			monospaced,
			outline,
			small,
			type = 'button',
			...otherProps
		}: IProps,
		ref
	) => (
		<button
			className={classNames(className, 'btn', {
				'alert-btn': alert,
				'btn-block': block,
				'btn-monospaced': monospaced,
				'btn-outline-borderless': borderless,
				'btn-sm': small,
				[`btn-${displayType}`]: displayType && !outline && !borderless,
				[`btn-outline-${displayType}`]:
					displayType && (outline || borderless),
			})}
			ref={ref}
			type={type}
			{...otherProps}
		>
			{children}
		</button>
	)
);

ClayButton.displayName = 'ClayButton';

export default Object.assign(ClayButton, {Group: ButtonGroup});
