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

import {ClayIcon, ClayLayout} from '../index';
import Footer from './Footer';
import ToastContainer from './ToastContainer';

const useAutoClose = (autoClose?: boolean | number, onClose = () => {}) => {
	const startedTimeRef = React.useRef<number>(0);
	const timerRef = React.useRef<number | undefined>(undefined);
	const timeToCloseRef = React.useRef(autoClose === true ? 10000 : autoClose);

	let pauseTimer = () => {};
	let startTimer = () => {};

	if (autoClose) {
		pauseTimer = () => {
			if (timerRef.current) {
				timeToCloseRef.current =
					(timeToCloseRef.current as number) -
					(Date.now() - startedTimeRef.current);

				clearTimeout(timerRef.current);

				timerRef.current = undefined;
			}
		};

		startTimer = () => {
			startedTimeRef.current = Date.now();
			timerRef.current = window.setTimeout(
				onClose,
				timeToCloseRef.current as number
			);
		};
	}

	React.useEffect(() => {
		if (autoClose && onClose) {
			startTimer();

			return pauseTimer;
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		pauseAutoCloseTimer: pauseTimer,
		startAutoCloseTimer: startTimer,
	};
};

export type DisplayType = 'danger' | 'info' | 'success' | 'warning';

export interface IClayAlertProps extends React.HTMLAttributes<HTMLDivElement> {

	/**
	 * A React Component to render the alert actions.
	 */
	actions?: React.ReactNode;

	/**
	 * Flag to indicate alert should automatically call `onClose`. It also
	 * accepts a duration (in ms) which indicates how long to wait. If `true`
	 * is passed in, the timeout will be 10000ms.
	 */
	autoClose?: boolean | number;

	/**
	 * Determines the style of the alert.
	 */
	displayType?: DisplayType;

	/**
	 * Flag to indicate if close icon should be show. This prop is used in
	 * conjunction with the `onClose`prop;
	 */
	hideCloseIcon?: boolean;

	/**
	 * Callback function for when the 'x' is clicked.
	 */
	onClose?: () => void;

	/**
	 * Path to the spritemap that Icon should use when referencing symbols.
	 */
	spritemap?: string;

	/**
	 * The summary of the Alert, often is something like 'Error' or 'Info'.
	 */
	title?: string;

	/**
	 * Determines the variant of the alert.
	 */
	variant?: 'feedback' | 'stripe' | 'inline';
}

const ICON_MAP = {
	danger: 'exclamation-full',
	info: 'info-circle',
	success: 'check-circle-full',
	warning: 'warning-full',
};

const VARIANTS = ['inline', 'feedback'];

const ClayAlert: React.FunctionComponent<IClayAlertProps> & {
	Footer: typeof Footer;
	ToastContainer: typeof ToastContainer;
} = ({
	actions,
	autoClose,
	children,
	className,
	displayType = 'info',
	hideCloseIcon = false,
	onClose,
	spritemap,
	title,
	variant,
	...otherProps
}: IClayAlertProps) => {
	const {pauseAutoCloseTimer, startAutoCloseTimer} = useAutoClose(
		autoClose,
		onClose
	);

	const ConditionalContainer: React.FunctionComponent<{}> = ({children}) =>
		variant === 'stripe' ? (
			<div className="container">{children}</div>
		) : (
			<>{children}</>
		);

	const showDismissible = onClose && !hideCloseIcon;

	const AlertIndicator = () => (
		<span className="alert-indicator">
			<ClayIcon spritemap={spritemap} symbol={ICON_MAP[displayType]} />
		</span>
	);

	return (
		<div
			{...otherProps}
			className={classNames(className, 'alert', {
				'alert-dismissible': showDismissible,
				'alert-feedback alert-indicator-start': variant === 'feedback',
				'alert-fluid': variant === 'stripe',
				'alert-inline': variant === 'inline',
				[`alert-${displayType}`]: displayType,
			})}
			onMouseOut={startAutoCloseTimer}
			onMouseOver={pauseAutoCloseTimer}
			role="alert"
		>
			<ConditionalContainer>
				<ClayLayout.ContentRow className="alert-autofit-row">
					{!VARIANTS.includes(variant as string) && (
						<ClayLayout.ContentCol>
							<ClayLayout.ContentSection>
								<AlertIndicator />
							</ClayLayout.ContentSection>
						</ClayLayout.ContentCol>
					)}

					<ClayLayout.ContentCol expand>
						<ClayLayout.ContentSection>
							{VARIANTS.includes(variant as string) && (
								<AlertIndicator />
							)}

							{title && <strong className="lead">{title}</strong>}

							{children}

							{variant !== 'inline' && actions && (
								<Footer>{actions}</Footer>
							)}
						</ClayLayout.ContentSection>
					</ClayLayout.ContentCol>

					{variant === 'inline' && actions && (
						<ClayLayout.ContentCol>
							<ClayLayout.ContentSection>
								{actions}
							</ClayLayout.ContentSection>
						</ClayLayout.ContentCol>
					)}
				</ClayLayout.ContentRow>

				{showDismissible && (
					<button
						aria-label="Close"
						className="close"
						onClick={onClose}
						type="button"
					>
						<ClayIcon spritemap={spritemap} symbol="times" />
					</button>
				)}
			</ConditionalContainer>
		</div>
	);
};

ClayAlert.Footer = Footer;
ClayAlert.ToastContainer = ToastContainer;

export default ClayAlert;
