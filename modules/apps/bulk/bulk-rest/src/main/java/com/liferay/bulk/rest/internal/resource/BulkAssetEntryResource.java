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

package com.liferay.bulk.rest.internal.resource;

import com.liferay.asset.kernel.model.AssetEntry;
import com.liferay.asset.kernel.service.AssetEntryLocalService;
import com.liferay.asset.kernel.service.AssetTagLocalService;
import com.liferay.bulk.rest.internal.model.BulkActionResponseModel;
import com.liferay.bulk.rest.internal.model.BulkAssetEntryCommonTagsActionModel;
import com.liferay.bulk.rest.internal.model.BulkAssetEntryCommonTagsModel;
import com.liferay.bulk.rest.internal.model.BulkAssetEntryUpdateTagsActionModel;
import com.liferay.bulk.selection.BulkSelection;
import com.liferay.bulk.selection.BulkSelectionFactory;
import com.liferay.document.library.kernel.model.DLFileEntryConstants;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.repository.model.FileEntry;
import com.liferay.portal.kernel.security.permission.ActionKeys;
import com.liferay.portal.kernel.security.permission.PermissionChecker;
import com.liferay.portal.kernel.security.permission.PermissionCheckerFactoryUtil;
import com.liferay.portal.kernel.security.permission.resource.ModelResourcePermission;
import com.liferay.portal.kernel.util.ContentTypes;
import com.liferay.portal.kernel.util.SetUtil;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Locale;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Stream;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Adolfo Pérez
 */
@Component(
	immediate = true,
	property = {
		"osgi.jaxrs.application.select=(osgi.jaxrs.name=bulk-application)",
		"osgi.jaxrs.resource=true"
	},
	service = BulkAssetEntryResource.class
)
@Path("/asset")
public class BulkAssetEntryResource {

	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/tags/{classNameId}/common")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public BulkAssetEntryCommonTagsModel getAssetEntryCommonTags(
		@Context User user, @Context Locale locale,
		@PathParam("classNameId") long classNameId,
		BulkAssetEntryCommonTagsActionModel
			bulkAssetEntryCommonTagsActionModel) {

		try {
			BulkSelection<FileEntry> selection = _bulkSelectionFactory.create(
				bulkAssetEntryCommonTagsActionModel.getParameterMap());

			PermissionChecker permissionChecker =
				PermissionCheckerFactoryUtil.create(user);

			Stream<FileEntry> fileEntryStream = selection.stream();

			Set<String> commonTags = fileEntryStream.map(
				_getFileEntryTagsSet(permissionChecker)
			).reduce(
				SetUtil::intersect
			).orElse(
				Collections.emptySet()
			);

			return new BulkAssetEntryCommonTagsModel(
				selection.describe(locale), new ArrayList<>(commonTags));
		}
		catch (Exception e) {
			return new BulkAssetEntryCommonTagsModel(e);
		}
	}

	@Consumes(ContentTypes.APPLICATION_JSON)
	@Path("/tags/{classNameId}")
	@POST
	@Produces(ContentTypes.APPLICATION_JSON)
	public BulkActionResponseModel updateAssetEntryTags(
		@Context User user, @PathParam("classNameId") long classNameId,
		BulkAssetEntryUpdateTagsActionModel
			bulkAssetEntryUpdateTagsActionModel) {

		try {
			return _editTags(user, bulkAssetEntryUpdateTagsActionModel);
		}
		catch (Exception e) {
			return new BulkActionResponseModel(e);
		}
	}

	private BulkActionResponseModel _editTags(
			User user,
			BulkAssetEntryUpdateTagsActionModel
				bulkAssetEntryUpdateTagsActionModel)
		throws Exception {

		BulkSelection<FileEntry> selection = _bulkSelectionFactory.create(
			bulkAssetEntryUpdateTagsActionModel.getParameterMap());

		Stream<FileEntry> fileEntryStream = selection.stream();

		PermissionChecker permissionChecker =
			PermissionCheckerFactoryUtil.create(user);

		boolean append = bulkAssetEntryUpdateTagsActionModel.getAppend();

		fileEntryStream.forEach(
			fileEntry -> {
				try {
					if (!_fileEntryModelResourcePermission.contains(
							permissionChecker, fileEntry, ActionKeys.UPDATE)) {

						return;
					}

					AssetEntry assetEntry = _assetEntryLocalService.fetchEntry(
						DLFileEntryConstants.getClassName(),
						fileEntry.getFileEntryId());

					Collection<String> newTagNames =
						bulkAssetEntryUpdateTagsActionModel.getToAddTagNames();

					if (append) {
						Set<String> currentTagNamesSet = SetUtil.fromArray(
							assetEntry.getTagNames());

						currentTagNamesSet.removeAll(
							bulkAssetEntryUpdateTagsActionModel.
								getToRemoveTagNames());
						currentTagNamesSet.addAll(
							bulkAssetEntryUpdateTagsActionModel.
								getToAddTagNames());

						newTagNames = currentTagNamesSet;
					}

					_assetEntryLocalService.updateEntry(
						assetEntry.getUserId(), assetEntry.getGroupId(),
						assetEntry.getClassName(), assetEntry.getClassPK(),
						assetEntry.getCategoryIds(),
						newTagNames.toArray(new String[newTagNames.size()]));
				}
				catch (PortalException pe) {
					if (_log.isWarnEnabled()) {
						_log.warn(pe, pe);
					}
				}
			});

		return BulkActionResponseModel.SUCCESS;
	}

	private Function<FileEntry, Set<String>> _getFileEntryTagsSet(
		PermissionChecker permissionChecker) {

		return fileEntry -> {
			try {
				if (_fileEntryModelResourcePermission.contains(
						permissionChecker, fileEntry, ActionKeys.UPDATE)) {

					return SetUtil.fromArray(
						_assetTagLocalService.getTagNames(
							DLFileEntryConstants.getClassName(),
							fileEntry.getFileEntryId()));
				}

				return Collections.emptySet();
			}
			catch (PortalException pe) {
				if (_log.isWarnEnabled()) {
					_log.warn(pe, pe);
				}

				return Collections.emptySet();
			}
		};
	}

	private static final Log _log = LogFactoryUtil.getLog(
		BulkAssetEntryResource.class);

	@Reference
	private AssetEntryLocalService _assetEntryLocalService;

	@Reference
	private AssetTagLocalService _assetTagLocalService;

	@Reference(
		target = "(model.class.name=com.liferay.portal.kernel.repository.model.FileEntry)"
	)
	private BulkSelectionFactory<FileEntry> _bulkSelectionFactory;

	@Reference(
		target = "(model.class.name=com.liferay.portal.kernel.repository.model.FileEntry)"
	)
	private ModelResourcePermission<FileEntry>
		_fileEntryModelResourcePermission;

}