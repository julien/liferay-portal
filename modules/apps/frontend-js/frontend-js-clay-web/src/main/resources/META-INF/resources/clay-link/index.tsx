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

import ClayLinkContext from './Context';

interface IProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {

	/**
	 * Renders the button as a block element.
	 */
	block?: boolean;

	/**
	 * Flag to indicate if link should be borderless.
	 */
	borderless?: boolean;

	/**
	 * Config for button props
	 */
	button?:
		| boolean
		| {
				block?: boolean;
				monospaced?: boolean;
				small?: boolean;
		  };

	/**
	 * Determines how the link is displayed.
	 */
	displayType?: 'primary' | 'secondary' | 'unstyled';

	/**
	 * Flag to indicate if link should be monospaced.
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

const ClayLink = React.forwardRef<HTMLAnchorElement, IProps>(
	(
		{
			block,
			borderless,
			button,
			children,
			className,
			displayType,
			monospaced,
			outline,
			rel,
			small,
			target,
			...otherProps
		}: IProps,
		ref
	) => {
		const TagOrComponent = React.useContext(ClayLinkContext);

		let classes;

		if (button) {
			button = button === true ? {} : button;

			classes = {
				'btn': !!button,
				'btn-block': button.block || block,
				'btn-monospaced': button.monospaced || monospaced,
				'btn-outline-borderless': borderless,
				'btn-sm': button.small || small,
				[`btn-${displayType}`]: displayType && !outline && !borderless,
				[`btn-outline-${displayType}`]:
					displayType && (outline || borderless),
			};
		}
		else {
			classes = {
				'link-monospaced': monospaced,
				'link-outline': outline,
				'link-outline-borderless': borderless,
				[`link-${displayType}`]: displayType && !outline,
				[`link-outline-${displayType}`]: displayType && outline,
			};
		}

		if (target && !rel) {
			rel = 'noreferrer noopener';
		}

		return (
			<TagOrComponent
				className={classNames(className, classes)}
				ref={ref}
				rel={rel}
				target={target}
				{...otherProps}
			>
				{children}
			</TagOrComponent>
		);
	}
);

ClayLink.displayName = 'ClayLink';

export {ClayLinkContext};

export default ClayLink;
