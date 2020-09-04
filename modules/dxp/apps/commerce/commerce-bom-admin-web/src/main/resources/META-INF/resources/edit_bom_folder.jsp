<%--
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
--%>

<%@ include file="/init.jsp" %>

<%
CommerceBOMAdminDisplayContext commerceBOMAdminDisplayContext = (CommerceBOMAdminDisplayContext)request.getAttribute(WebKeys.PORTLET_DISPLAY_CONTEXT);

CommerceBOMFolder commerceBOMFolder = commerceBOMAdminDisplayContext.getCommerceBOMFolder();

renderResponse.setTitle(LanguageUtil.get(request, "bill-of-materials"));
%>

<clay:navigation-bar
	inverted="<%= true %>"
	navigationItems="<%= CPNavigationItemRegistryUtil.getNavigationItems(renderRequest) %>"
/>

<liferay-frontend:screen-navigation
	containerCssClass="col-md-10"
	key="<%= CommerceBOMFolderScreenNavigationConstants.SCREEN_NAVIGATION_KEY %>"
	modelBean="<%= commerceBOMFolder %>"
	navCssClass="col-md-2"
	portletURL="<%= currentURLObj %>"
/>