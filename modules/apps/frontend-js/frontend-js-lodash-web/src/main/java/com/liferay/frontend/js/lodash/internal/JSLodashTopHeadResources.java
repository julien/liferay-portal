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

package com.liferay.frontend.js.lodash.internal;

import com.liferay.frontend.js.lodash.configuration.JSLodashConfiguration;
import com.liferay.frontend.js.top.head.extender.TopHeadResources;
import com.liferay.portal.configuration.metatype.bnd.util.ConfigurableUtil;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Modified;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;

@Component(
	configurationPid = "com.liferay.frontend.js.lodash.configuration.JSLodashConfiguration",
	immediate = true
)
public class JSLodashTopHeadResources implements TopHeadResources {

	public JSLodashTopHeadResources() {
		_authenticatedJsResourcePaths = Collections.emptyList();
		_jsResourcePaths = Collections.emptyList();
		// TODO: sh
		_servletContextPath = "/o/frontend-js-lodash-web";
	}

	@Activate
	@Modified
	protected void activate(
		ComponentContext componentContext, Map<String, Object> properties)
		throws Exception {

		_jsLodashConfiguration = ConfigurableUtil.createConfigurable(
			JSLodashConfiguration.class, properties);

		if (_jsLodashConfiguration.enableLodash()) {
			_jsResourcePaths = Arrays.asList(
				"/lodash/lodash.js",
				"/lodash/util.js"
			);
		}
		else {
			_jsResourcePaths = Collections.emptyList();
		}
	}

	@Deactivate
	protected void deactivate(
		ComponentContext componentContext, Map<String, Object> properties)
		throws Exception {
		_jsLodashConfiguration = ConfigurableUtil.createConfigurable(
			JSLodashConfiguration.class, properties);
		_jsResourcePaths = Collections.emptyList();
	}

	@Override
	public Collection<String> getAuthenticatedJsResourcePaths() {
		return _authenticatedJsResourcePaths;
	}

	@Override
	public Collection<String> getJsResourcePaths() {
		return _jsResourcePaths;
	}

	@Override
	public String getServletContextPath() {
		return _servletContextPath;
	}

	// TODO: is this needed?
	public void setServletContextPath(String servletContextPath) {
		_servletContextPath = servletContextPath;
	}

	private Collection<String> _authenticatedJsResourcePaths;
	private volatile JSLodashConfiguration _jsLodashConfiguration;
	private Collection<String> _jsResourcePaths;
	private String _servletContextPath;

}