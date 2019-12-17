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

import {useIsMounted} from 'frontend-js-react-web';
import {debounce} from 'frontend-js-web';
import React, {useContext, useEffect, useState} from 'react';

import {ConfigContext} from '../config/index';
import * as Processors from '../processors/index';
import selectEditableValueContent from '../selectors/selectEditableValueContent';
import {StoreContext} from '../store/index';
import UnsafeHTML from './UnsafeHTML';

const resolveEditableValue = (state, config, fragmentEntryLinkId, editableId) =>
	new Promise(resolve => {
		// TODO manage mapped fields
		// both in display pages and content pages.
		// They should be fetched from backend dynamically

		resolve(
			selectEditableValueContent(
				state,
				config,
				fragmentEntryLinkId,
				editableId
			)
		);
	});

function FragmentContent({fragmentEntryLink}, ref) {
	const config = useContext(ConfigContext);
	const defaultContent = fragmentEntryLink.content.value.content;
	const {fragmentEntryLinkId} = fragmentEntryLink;
	const isMounted = useIsMounted();
	const state = useContext(StoreContext);

	// TODO if we set this to null and we conditionally render
	// UnsafeHTML we can avoid the initial double render.
	const [content, setContent] = useState(defaultContent);

	// Update content when defaultContent has changed.
	// For example when fragment configuration is updated.
	useEffect(() => {
		if (content !== defaultContent) {
			setContent(defaultContent);
		}
	}, [content, defaultContent]);

	useEffect(() => {
		let element = document.createElement('div');
		element.innerHTML = defaultContent;

		const updateContent = debounce(() => {
			if (isMounted()) {
				setContent(element.innerHTML);
			}
		}, 50);

		// TODO manage background images too
		// Keep post-it

		Array.from(element.querySelectorAll('lfr-editable')).forEach(
			editable => {
				resolveEditableValue(
					state,
					config,
					fragmentEntryLinkId,
					editable.getAttribute('id')
				).then(value => {
					if (element) {
						const processor =
							Processors[editable.getAttribute('type')] ||
							Processors.fallback;

						processor.render(editable, value);

						updateContent();
					}
				});
			}
		);

		return () => {
			element = null;
		};
	}, [config, state, defaultContent, fragmentEntryLinkId, isMounted]);

	// TODO add buggy buttons code to allow testing
	// TODO migrate existing processors
	// Render method can already be tested.
	// - Image
	// - RichText
	// - Text
	// - Link
	// - HTML

	// TODO enable/disable editors when editable is clicked
	// Needed in order to test all processors.

	// TODO activate editables on click,
	// show floating toolbar over each editable field

	// TODO show different borders if the editable is active, translated, mapped, etc.

	return <UnsafeHTML markup={content} ref={ref} />;
}

export default React.forwardRef(FragmentContent);
