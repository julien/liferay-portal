<%--
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
--%>

<%@ include file="/init.jsp" %>

<%
SelectLayoutPageTemplateEntryDisplayContext selectLayoutPageTemplateEntryDisplayContext = new SelectLayoutPageTemplateEntryDisplayContext(layoutsAdminDisplayContext, request);

List<LayoutPrototype> layoutPrototypes = selectLayoutPageTemplateEntryDisplayContext.getLayoutPrototypes();
%>

<liferay-ui:search-container
	total="<%= layoutPrototypes.size() %>"
>
	<liferay-ui:search-container-results
		results="<%= layoutPrototypes %>"
	/>

	<liferay-ui:search-container-row
		className="com.liferay.portal.kernel.model.LayoutPrototype"
		modelVar="layoutPrototype"
	>

		<%
		row.setCssClass("entry-card lfr-asset-item " + row.getCssClass());
		%>

		<liferay-ui:search-container-column-text>

			<%
			Map<String, Object> addLayoutPrototypeData = new HashMap<>();

			addLayoutPrototypeData.put("layout-prototype-id", layoutPrototype.getLayoutPrototypeId());
			%>

			<liferay-frontend:icon-vertical-card
				actionJspServletContext="<%= application %>"
				cssClass='<%= renderResponse.getNamespace() + "add-layout-prototype-action-option" %>'
				data="<%= addLayoutPrototypeData %>"
				icon="page"
				resultRow="<%= row %>"
				rowChecker="<%= searchContainer.getRowChecker() %>"
				title="<%= HtmlUtil.escape(layoutPrototype.getName(locale)) %>"
				url="javascript:;"
			/>
		</liferay-ui:search-container-column-text>
	</liferay-ui:search-container-row>

	<liferay-ui:search-iterator displayStyle="icon" markupView="lexicon" />
</liferay-ui:search-container>

<portlet:actionURL name="/layout/add_layout_prototype_layout" var="addLayoutPrototypeLayoutURL">
	<portlet:param name="mvcPath" value="/select_layout_page_template_entry.jsp" />
	<portlet:param name="groupId" value="<%= String.valueOf(layoutsAdminDisplayContext.getGroupId()) %>" />
	<portlet:param name="liveGroupId" value="<%= String.valueOf(layoutsAdminDisplayContext.getLiveGroupId()) %>" />
	<portlet:param name="stagingGroupId" value="<%= String.valueOf(layoutsAdminDisplayContext.getStagingGroupId()) %>" />
	<portlet:param name="parentLayoutId" value="<%= String.valueOf(layoutsAdminDisplayContext.getParentLayoutId()) %>" />
	<portlet:param name="privateLayout" value="<%= String.valueOf(layoutsAdminDisplayContext.isPrivateLayout()) %>" />
</portlet:actionURL>

<aui:script require="metal-dom/src/all/dom as dom,frontend-js-web/liferay/modal/commands/OpenSimpleInputModal.es as modalCommands">
	var addLayoutPrototypeActionOptionQueryClickHandler = dom.delegate(
		document.body,
		'click',
		'.<portlet:namespace />add-layout-prototype-action-option',
		function(event) {
			var actionElement = event.delegateTarget;

			debugger;

			modalCommands.openSimpleInputModal(
				{
					dialogTitle: '<liferay-ui:message key="add-page" />',
					formSubmitURL: '<%= addLayoutPrototypeLayoutURL %>',
					idFieldName: 'layoutPrototypeId',
					idFieldValue: actionElement.dataset.layoutPrototypeId,
					mainFieldName: 'name',
					mainFieldLabel: '<liferay-ui:message key="name" />',
					namespace: '<portlet:namespace />',
					spritemap: '<%= themeDisplay.getPathThemeImages() %>/lexicon/icons.svg'
				}
			);
		}
	);

	function handleDestroyPortlet () {
		addLayoutPrototypeActionOptionQueryClickHandler.removeListener();

		Liferay.detach('destroyPortlet', handleDestroyPortlet);
	}

	Liferay.on('destroyPortlet', handleDestroyPortlet);
</aui:script>