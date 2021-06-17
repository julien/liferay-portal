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
interface IItem {
	label: string;
	symbol: string;
}
interface ITranslations {
	[key: string]: string;
}
export declare type ButtonSize = null | 'regular' | 'small';
export declare type Variant =
	| null
	| 'default'
	| 'language selector'
	| 'translation selector';
interface IProps extends React.HtmlHTMLAttributes<HTMLDivElement> {

	/**
	 * Labels for the aria attributes
	 */
	ariaLabels?: {
		default: string;
		openLocalizations: string;
		translated: string;
		untranslated: string;
		manageTranslations: string;
	};

	/**
	 * Button size to use "regular" or "default"
	 */
	buttonSize?: ButtonSize;

	/**
	 * List of locales to allow localization for
	 */
	locales: Array<IItem>;

	/**
	 * Callback that gets called the "Manage Translations" drop down item is clicked
	 */
	onManageTranslations?: () => void;

	/**
	 * Callback that gets called when a selected locale gets changed
	 */
	onSelectedLocaleChange?: (val: IItem) => void;

	/**
	 * Exposes the currently selected locale
	 */
	selectedLocale: IItem;

	/**
	 * Path to the location of the spritemap resource.
	 */
	spritemap?: string;

	/**
	 * Translations provided to the component to be used and modified by it
	 */
	translations: ITranslations;

	/**
	 */
	variant?: Variant;
}
export default function (container: Element, props: IProps): void;
export {};
