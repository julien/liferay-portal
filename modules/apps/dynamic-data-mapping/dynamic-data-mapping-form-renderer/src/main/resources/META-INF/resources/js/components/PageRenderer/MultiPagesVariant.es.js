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

import ClayButton, {ClayButtonWithIcon} from '@clayui/button';
import {ClayDropDownWithItems} from '@clayui/drop-down';
import React from 'react';

import {EVENT_TYPES, usePage} from '../../hooks/usePage.es';
import {Placeholder} from './DefaultVariant.es';

export const Container = ({children, page, pageIndex, pages}) => {
	const {dispatch, store} = usePage();
	const {editingLanguageId} = store;

	const pageSettingsItems = [
		{
			label: Liferay.Language.get('reset-page'),
			onClick: () =>
				dispatch({payload: {pageIndex}, type: EVENT_TYPES.PAGE_RESET}),
		},
		pageIndex > 0
			? {
					label: Liferay.Language.get('remove-page'),
					onClick: () =>
						dispatch({
							payload: pageIndex,
							type: EVENT_TYPES.PAGE_DELETED,
						}),
			  }
			: false,
	].filter(Boolean);

	const onAddSuccessPage = () => {
		const successPageSettings = {
			body: {
				[editingLanguageId]: Liferay.Language.get(
					'your-information-was-successfully-received-thank-you-for-filling-out-the-form'
				),
			},
			enabled: true,
			title: {
				[editingLanguageId]: Liferay.Language.get('thank-you'),
			},
		};

		dispatch({
			payload: successPageSettings,
			type: EVENT_TYPES.SUCCESS_CHANGED,
		});
		dispatch({payload: pages.length, type: EVENT_TYPES.CHANGE_ACTIVE_PAGE});
	};

	return (
		<div className="page">
			<div className="fade sheet show tab-pane" role="tabpanel">
				<div className="form-builder-layout">
					<h5 className="pagination">{page.pagination}</h5>

					{children}
				</div>
			</div>

			<div className="ddm-paginated-builder-dropdown">
				<ClayDropDownWithItems
					className="dropdown-action"
					items={pageSettingsItems}
					trigger={
						<ClayButtonWithIcon
							displayType="unstyled"
							symbol="ellipsis-v"
						/>
					}
				/>
			</div>

			<div className="add-page-button-container">
				<div className="horizontal-line" />
				<ClayButton
					className="add-page-button"
					displayType="secondary"
					onClick={() =>
						dispatch({
							payload: {pageIndex},
							type: EVENT_TYPES.PAGE_ADDED,
						})
					}
					small
				>
					{Liferay.Language.get('new-page')}
				</ClayButton>
				<div className="horizontal-line" />
			</div>

			{pages.length - 1 === pageIndex && (
				<div className="add-page-button-container">
					<div className="horizontal-line" />
					<ClayButton
						className="add-page-button"
						displayType="secondary"
						onClick={onAddSuccessPage}
						small
					>
						{Liferay.Language.get('add-success-page')}
					</ClayButton>
					<div className="horizontal-line" />
				</div>
			)}
		</div>
	);
};

export const Page = ({
	children,
	editable,
	empty,
	header: Header,
	pageIndex,
}) => (
	<div
		className="active ddm-form-page lfr-ddm-form-page"
		data-ddm-page={pageIndex}
	>
		{Header}

		{empty && editable ? (
			<div className="row">
				<div
					className="col col-ddm col-empty col-md-12 last-col lfr-initial-col mb-4 mt-5"
					data-ddm-field-column="0"
					data-ddm-field-page={pageIndex}
					data-ddm-field-row="0"
				>
					<div className="ddm-empty-page ddm-target">
						<p className="ddm-empty-page-message">
							{Liferay.Language.get(
								'drag-fields-from-the-sidebar-to-compose-your-form'
							)}
						</p>
					</div>
				</div>
			</div>
		) : (
			children
		)}
	</div>
);

export const Rows = ({children, editable, pageIndex, rows}) => {
	if (!rows) {
		return null;
	}

	return rows.map((row, index) => (
		<div key={index}>
			{index === 0 && editable && (
				<Placeholder
					isRow
					pageIndex={pageIndex}
					rowIndex={0}
					size={12}
				/>
			)}

			{children({index, row})}

			{editable && (
				<Placeholder
					isRow
					pageIndex={pageIndex}
					rowIndex={index + 1}
					size={12}
				/>
			)}
		</div>
	));
};
