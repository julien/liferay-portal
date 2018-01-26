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
String redirect = ParamUtil.getString(request, "redirect");

String backURL = ParamUtil.getString(request, "backURL", redirect);

Long selUserId = ParamUtil.getLong(request, "selUserId");

List<UADEntityTypeComposite> entityTypeComposites = (List<UADEntityTypeComposite>)request.getAttribute("entityTypeComposites");
%>

<liferay-ui:search-container
	emptyResultsMessage="no-data-requires-anonymization"
	id="UADEntityTypeComposites"
	iteratorURL="<%= currentURLObj %>"
>
	<liferay-ui:search-container-results
		results="<%= entityTypeComposites %>"
	/>

	<liferay-ui:search-container-row
		className="com.liferay.user.associated.data.util.UADEntityTypeComposite"
		escapedModel="<%= true %>"
		keyProperty="name"
		modelVar="entityTypeComposite"
	>
		<% UADEntityDisplay uadEntityDisplay = entityTypeComposite.getUADEntityDisplay(); %>

		<portlet:renderURL var="manageUserAssociatedDataEntitiesURL">
			<portlet:param name="mvcRenderCommandName" value="/user_associated_data/manage_user_associated_data_entities" />
			<portlet:param name="key" value="<%= entityTypeComposite.getKey() %>" />
			<portlet:param name="userId" value="<%= String.valueOf(entityTypeComposite.getUserId()) %>" />
		</portlet:renderURL>

		<liferay-ui:search-container-column-text
			href="<%= manageUserAssociatedDataEntitiesURL %>"
			name="name"
			value="<%= uadEntityDisplay.getEntityTypeName() %>"
		/>

		<liferay-ui:search-container-column-text
			href="<%= manageUserAssociatedDataEntitiesURL %>"
			name="description"
			value="<%= uadEntityDisplay.getEntityTypeDescription() %>"
		/>

		<liferay-ui:search-container-column-text
			href="<%= manageUserAssociatedDataEntitiesURL %>"
			name="count"
			property="count"
		/>

		<liferay-ui:search-container-column-text
			href="<%= manageUserAssociatedDataEntitiesURL %>"
			name="nonanonymizable-fields"
			value="<%= uadEntityDisplay.getEntityTypeNonAnonymizableFieldNames() %>"
		/>

		<liferay-ui:search-container-column-jsp
			cssClass="entry-action-column"
			path="/entity_type_action.jsp"
		/>
	</liferay-ui:search-container-row>

	<liferay-ui:search-iterator />
</liferay-ui:search-container>

<portlet:actionURL name="/user_associated_data/anonymize_user_associated_data" var="anonymizeUserAssociatedDataActionURL" />