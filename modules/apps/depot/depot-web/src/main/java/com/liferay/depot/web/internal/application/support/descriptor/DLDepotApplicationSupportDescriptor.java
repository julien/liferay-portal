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

package com.liferay.depot.web.internal.application.support.descriptor;

import com.liferay.depot.web.internal.application.support.DepotApplicationSupportDescriptor;
import com.liferay.document.library.constants.DLPortletKeys;

import org.osgi.service.component.annotations.Component;

/**
 * @author Alejandro Tardín
 */
@Component(immediate = true, service = DepotApplicationSupportDescriptor.class)
public class DLDepotApplicationSupportDescriptor
	implements DepotApplicationSupportDescriptor {

	@Override
	public String getPortletId() {
		return DLPortletKeys.DOCUMENT_LIBRARY_ADMIN;
	}

}