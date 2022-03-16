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
import warning from 'warning';

export const ClayIconSpriteContext = React.createContext('');

interface IProps extends React.SVGAttributes<SVGSVGElement> {
	className?: string;

	/**
	 * Path to the location of the spritemap resource.
	 */
	spritemap?: string;

	/**
	 * The id of the icon in the spritemap.
	 */
	symbol: string;
}

const ClayIcon = React.forwardRef<SVGSVGElement, IProps>(
	({className, spritemap, symbol, ...otherProps}: IProps, ref) => {
		let spriteMapVal = React.useContext(ClayIconSpriteContext);

		if (spritemap) {
			spriteMapVal = spritemap;
		}

		warning(
			spriteMapVal,
			'ClayIcon requires a `spritemap` via prop or ClayIconSpriteContext'
		);

		return (
			<svg
				{...otherProps}
				className={classNames(
					`lexicon-icon lexicon-icon-${symbol}`,
					className
				)}
				key={symbol}
				ref={ref}
				role="presentation"
			>
				<use xlinkHref={`${spriteMapVal}#${symbol}`} />
			</svg>
		);
	}
);

ClayIcon.displayName = 'ClayIcon';

export default ClayIcon;
