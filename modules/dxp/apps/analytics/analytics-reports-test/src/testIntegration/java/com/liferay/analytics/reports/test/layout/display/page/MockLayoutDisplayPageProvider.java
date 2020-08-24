/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 *
 *
 *
 */

package com.liferay.analytics.reports.test.layout.display.page;

import com.liferay.analytics.reports.test.MockObject;
import com.liferay.info.item.InfoItemReference;
import com.liferay.layout.display.page.LayoutDisplayPageObjectProvider;
import com.liferay.layout.display.page.LayoutDisplayPageProvider;
import com.liferay.portal.kernel.model.ClassName;
import com.liferay.portal.kernel.service.ClassNameLocalService;

import java.util.Locale;

/**
 * @author Cristina González
 */
public class MockLayoutDisplayPageProvider
	implements LayoutDisplayPageProvider<MockObject> {

	public MockLayoutDisplayPageProvider(
		ClassNameLocalService classNameLocalService) {

		_classNameLocalService = classNameLocalService;
	}

	@Override
	public String getClassName() {
		return MockObject.class.getName();
	}

	@Override
	public LayoutDisplayPageObjectProvider<MockObject>
		getLayoutDisplayPageObjectProvider(
			InfoItemReference infoItemReference) {

		return new MockLayoutDisplayPageObjectProvider(_classNameLocalService);
	}

	@Override
	public LayoutDisplayPageObjectProvider<MockObject>
		getLayoutDisplayPageObjectProvider(long groupId, String urlTitle) {

		return null;
	}

	@Override
	public String getURLSeparator() {
		return "/mock_separator";
	}

	public static class MockLayoutDisplayPageObjectProvider
		implements LayoutDisplayPageObjectProvider<MockObject> {

		public MockLayoutDisplayPageObjectProvider(
			ClassNameLocalService classNameLocalService) {

			ClassName className = classNameLocalService.getClassName(
				MockObject.class.getName());

			_classNameId = className.getClassNameId();
		}

		@Override
		public long getClassNameId() {
			return _classNameId;
		}

		@Override
		public long getClassPK() {
			return 0;
		}

		@Override
		public long getClassTypeId() {
			return 0;
		}

		@Override
		public String getDescription(Locale locale) {
			return null;
		}

		@Override
		public MockObject getDisplayObject() {
			return new MockObject();
		}

		@Override
		public long getGroupId() {
			return 0;
		}

		@Override
		public String getKeywords(Locale locale) {
			return null;
		}

		@Override
		public String getTitle(Locale locale) {
			return null;
		}

		@Override
		public String getURLTitle(Locale locale) {
			return null;
		}

		private final long _classNameId;

	}

	private final ClassNameLocalService _classNameLocalService;

}