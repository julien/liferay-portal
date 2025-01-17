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

import {useModal} from '@clayui/modal';
import {Observer} from '@clayui/modal/src/types';
import {Dispatch, useState} from 'react';

import i18n from '../i18n';
import {Liferay} from '../services/liferay/liferay';

export type FormModalOptions = {
	modalState: any;
	observer: Observer;
	onClose: () => void;
	onError: () => void;
	onSave: (param?: any) => void;
	open: () => void;
	setVisible: Dispatch<boolean>;
	visible: boolean;
};

export type FormModal = {
	forceRefetch: number;
	modal: FormModalOptions;
};

type UseFormModal = {
	isVisible?: boolean;
	onSave?: (param: any) => void;
};

const useFormModal = ({
	isVisible = false,
	onSave: onSaveModal = () => {},
}: UseFormModal = {}): FormModal => {
	const [modalState, setModalState] = useState();
	const [visible, setVisible] = useState(isVisible);
	const {observer, onClose} = useModal({
		onClose: () => setVisible(false),
	});

	const [forceRefetch, setForceRefetch] = useState(0);

	return {
		forceRefetch,
		modal: {
			modalState,
			observer,
			onClose,
			onError: () => {
				Liferay.Util.openToast({
					message: i18n.translate('an-unexpected-error-occurred'),
					type: 'danger',
				});
			},
			onSave: (state?: any) => {
				Liferay.Util.openToast({
					message: i18n.translate(
						'your-request-completed-successfully'
					),
					type: 'success',
				});

				onClose();
				setForceRefetch(new Date().getTime());

				if (state) {
					setModalState(state);
					onSaveModal(state);
				}
			},
			open: () => setVisible(true),
			setVisible,
			visible,
		},
	};
};

export default useFormModal;
