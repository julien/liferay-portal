/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 * This library is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import {
	ClayAlert,
	ClayBadge,
	ClayButton,
	ClayIcon,
	ClayLayout,
	ClayLink,
	ClayLoadingIndicator,
} from '@liferay/frontend-js-clay-web';
import React from 'react';

const spritemap = `${Liferay.ThemeDisplay.getPathThemeImages()}/clay/icons.svg`;

export default function ClaySampleComponent() {
	return (
		<div>
			<ClayLayout.ContainerFluid view>
				<ClayLayout.Row justify="center">
					<ClayLayout.Col size={4}>Clay Alert</ClayLayout.Col>

					<ClayLayout.Col size={8}>
						<ClayAlert
							displayType="info"
							spritemap={spritemap}
							title="Info"
							variant="stripe"
						>
							This is an alert!
						</ClayAlert>
					</ClayLayout.Col>
				</ClayLayout.Row>

				<ClayLayout.Row justify="center">
					<ClayLayout.Col size={4}>Clay Badge</ClayLayout.Col>

					<ClayLayout.Col size={8}>
						<ClayBadge displayType="danger" label="Badge" />
					</ClayLayout.Col>
				</ClayLayout.Row>

				<ClayLayout.Row justify="center">
					<ClayLayout.Col size={4}>Clay Button</ClayLayout.Col>

					<ClayLayout.Col size={8}>
						<ClayButton
							displayType="success"
							onClick={() => {
								alert('You clicked on a button');
							}}
						>
							This is a button
						</ClayButton>
					</ClayLayout.Col>
				</ClayLayout.Row>

				<ClayLayout.Row justify="center">
					<ClayLayout.Col size={4}>Clay Icon</ClayLayout.Col>

					<ClayLayout.Col size={8}>
						<ClayIcon spritemap={spritemap} symbol="user" />
					</ClayLayout.Col>
				</ClayLayout.Row>

				<ClayLayout.Row justify="center">
					<ClayLayout.Col size={4}>
						Clay Loading Indicator
					</ClayLayout.Col>

					<ClayLayout.Col size={8}>
						<ClayLoadingIndicator small />
					</ClayLayout.Col>
				</ClayLayout.Row>

				<ClayLayout.Row justify="center">
					<ClayLayout.Col size={4}>Clay Icon</ClayLayout.Col>

					<ClayLayout.Col size={8}>
						<ClayIcon spritemap={spritemap} symbol="user" />
					</ClayLayout.Col>
				</ClayLayout.Row>

				<ClayLayout.Row justify="center">
					<ClayLayout.Col size={4}>Clay Link</ClayLayout.Col>

					<ClayLayout.Col size={8}>
						<ClayLink displayType="primary" small />
					</ClayLayout.Col>
				</ClayLayout.Row>
			</ClayLayout.ContainerFluid>
		</div>
	);
}
