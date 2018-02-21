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

package com.liferay.frontend.taglib.chart.model.geomap;

import com.liferay.frontend.taglib.chart.model.ChartObject;

/**
 * @author Julien Castelain
 */
public class GeomapColor extends ChartObject {

	public GeomapColorRange getRange() {
		return get("range", GeomapColorRange.class);
	}

	public String getSelected() {
		return get("selected", String.class);
	}

	public String getValue() {
		return get("value", String.class);
	}

	public void setRange(GeomapColorRange range) {
		set("range", range);
	}

	public void setSelected(String selected) {
		set("selected", selected);
	}

	public void setValue(String value) {
		set("value", value);
	}

}