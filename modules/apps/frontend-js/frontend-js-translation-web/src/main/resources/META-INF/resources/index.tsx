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

import ClayButton from '@clayui/button';
import ClayDropDown from '@clayui/drop-down';
import ClayForm from '@clayui/form';
import ClayIcon from '@clayui/icon';
import ClayLabel from '@clayui/label';
import ClayLayout from '@clayui/layout';
import React from 'react';
import ReactDOM from 'react-dom';

interface IItem {
	label: string;
	symbol: string;
}

interface ITranslations {
	[key: string]: string;
}

export type ButtonSize = null | 'regular' | 'small';

export type Variant  = null | 'default' | 'language selector' | 'translation selector';

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

const TranslationSelector: React.FunctionComponent<IProps> = ({
	ariaLabels = {
		default: 'Default',
		manageTranslations: 'Manage Translations',
		openLocalizations: 'Open Localizations',
		translated: 'Translated',
		untranslated: 'Not Translated',
	},
	buttonSize = 'regular',
	locales,
	onManageTranslations = () => {},
	onSelectedLocaleChange = () => {},
	selectedLocale,
	spritemap,
	translations,
	variant = 'default',
}: IProps) => {
	const [active, setActive] = React.useState(false);

	const defaultLanguage = locales[0];

	return (
		<ClayForm.Group>
			<ClayDropDown
				active={active}
				onActiveChange={setActive}
				trigger={
					<ClayButton
						displayType="secondary"
						monospaced
						onClick={() => setActive(!active)}
						small={buttonSize === 'small'}
						title={'title'}
					>
						<span className="inline-item">
							<ClayIcon
								spritemap={spritemap}
								symbol={selectedLocale.symbol}
							/>
						</span>
						<span className="btn-section">
							{selectedLocale.label}
						</span>
					</ClayButton>
				}
			>
				<ClayDropDown.ItemList>
					{locales.map((locale) => {
						const value = translations[locale.label];

						return (
							<ClayDropDown.Item
								key={locale.label}
								onClick={() => onSelectedLocaleChange(locale)}
							>
								<ClayLayout.ContentRow containerElement="span">
									<ClayLayout.ContentCol
										containerElement="span"
										expand
									>
										<ClayLayout.ContentSection>
											<ClayIcon
												className="inline-item inline-item-before"
												spritemap={spritemap}
												symbol={locale.symbol}
											/>

											{locale.label}
										</ClayLayout.ContentSection>
									</ClayLayout.ContentCol>
									{variant !== 'language selector' && (
										<ClayLayout.ContentCol containerElement="span">
											<ClayLayout.ContentSection>
												<ClayLabel
													displayType={
														locale.label ===
														defaultLanguage.label
															? 'info'
															: value
															? 'success'
															: 'warning'
													}
												>
													{locale.label ===
													defaultLanguage.label
														? ariaLabels.default
														: value
														? ariaLabels.translated
														: ariaLabels.untranslated}
												</ClayLabel>
											</ClayLayout.ContentSection>
										</ClayLayout.ContentCol>
									)}
								</ClayLayout.ContentRow>
							</ClayDropDown.Item>
						);
					})}
					{variant === 'default' && (
						<>
							<ClayDropDown.Divider />
							<ClayDropDown.Item onClick={onManageTranslations}>
								<ClayLayout.ContentRow containerElement="span">
									<ClayLayout.ContentCol
										containerElement="span"
										expand
									>
										<ClayLayout.ContentSection>
											<ClayIcon
												className="inline-item inline-item-before"
												spritemap={spritemap}
												symbol={'automatic-translate'}
											/>

											{ariaLabels.manageTranslations}
										</ClayLayout.ContentSection>
									</ClayLayout.ContentCol>
								</ClayLayout.ContentRow>
							</ClayDropDown.Item>
						</>
					)}
				</ClayDropDown.ItemList>
			</ClayDropDown>
		</ClayForm.Group>
	);
};

export default function(container: Element, props: IProps) {
	const element = <TranslationSelector {...props} />;
	ReactDOM.render(element, container);
}