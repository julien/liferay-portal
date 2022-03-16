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

import warning from 'warning';

import Col from './Col';
import Container from './Container';
import ContainerFluid from './ContainerFluid';
import {ContentCol, ContentRow, ContentSection} from './Content';
import Row from './Row';
import {Sheet, SheetFooter, SheetHeader, SheetSection} from './Sheet';

export {
	Col,
	Container,
	ContainerFluid,
	ContentCol,
	ContentRow,
	ContentSection,
	Row,
	Sheet,
	SheetFooter,
	SheetHeader,
	SheetSection,
};

const ClayLayout: React.FunctionComponent<{}> & {
	Col: typeof Col;
	Container: typeof Container;
	ContainerFluid: typeof ContainerFluid;
	ContentCol: typeof ContentCol;
	ContentRow: typeof ContentRow;
	ContentSection: typeof ContentSection;
	Row: typeof Row;
	Sheet: typeof Sheet;
	SheetFooter: typeof SheetFooter;
	SheetHeader: typeof SheetHeader;
	SheetSection: typeof SheetSection;
} = () => {
	warning(
		true,
		`ClayLayout is a no-op and is not expected to be used by itself. Try using one of the many namespaced components like '<ClayLayout.ContainerFluid>'`
	);

	return null;
};

ClayLayout.Col = Col;
ClayLayout.Container = Container;
ClayLayout.ContainerFluid = ContainerFluid;
ClayLayout.ContentCol = ContentCol;
ClayLayout.ContentRow = ContentRow;
ClayLayout.ContentSection = ContentSection;
ClayLayout.Row = Row;
ClayLayout.Sheet = Sheet;
ClayLayout.SheetFooter = SheetFooter;
ClayLayout.SheetHeader = SheetHeader;
ClayLayout.SheetSection = SheetSection;

export default ClayLayout;
