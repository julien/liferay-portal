
import {ADD_FRAGMENT_ENTRY_LINK} from './types';
import {fetch} from 'frontend-js-web';
import {LAYOUT_DATA_ITEM_TYPES} from '../config/constants/layoutDataItemTypes';
import addItem from './addItem';

function addFragmentEntryLink({
	fragmentEntryLink
}) {
	const {
		fragmentEntryLinkId
	} = fragmentEntryLink;

	return {
		type: ADD_FRAGMENT_ENTRY_LINK,
		fragmentEntryLinkId,
		fragmentEntryLink
	};
}

export default function addFragment({
	fragmentKey,
	fragmentGroupId,
	parentId,
	position
}) {
	return function(dispatch, getState, getConfig) {
		const {
			portletNamespace
		} = getConfig();

		const {
			addFragmentEntryLinkURL: url,
			classNameId,
			classPK,
			segmentsExperienceId
		} = getState();

		const formData = new FormData();

		formData.append(`${portletNamespace}fragmentKey`, fragmentKey);
		formData.append(`${portletNamespace}classNameId`, classNameId);
		formData.append(`${portletNamespace}classPK`, classPK);
		formData.append(`${portletNamespace}groupId`, fragmentGroupId);
		formData.append(
			`${portletNamespace}segmentsExperienceId`,
			segmentsExperienceId
		);

		fetch(url, {
			body: formData,
			method: 'POST'
		})
			.then(response => response.json())
			.then(fragmentEntryLink => {

				const {
					fragmentEntryLinkId
				} = fragmentEntryLink;

				dispatch(addFragmentEntryLink({
					fragmentEntryLink
				}));

				dispatch(addItem({
					config: {
						fragmentEntryLinkId
					},
					itemId: `thing-${Date.now()}`,
					itemType: LAYOUT_DATA_ITEM_TYPES.fragment,
					parentId,
					position
				}));

				setTimeout(() => {
					const {
						layoutData,
						updateLayoutPageTemplateDataURL
					} = getState();
					console.log('layoutData', layoutData);

					const formData = new FormData();
					formData.append(`${portletNamespace}classNameId`, classNameId);
					formData.append(`${portletNamespace}classPK`, classPK);
					formData.append(`${portletNamespace}data`, JSON.stringify(layoutData));
					formData.append(
						`${portletNamespace}segmentsExperienceId`,
						segmentsExperienceId
					);

					fetch(updateLayoutPageTemplateDataURL, {
						body: formData,
						method: 'POST'
					})
						.then(response => response.json())
						.then(value => {
							return value;
						});

				}, 500);
			});
	};
}
