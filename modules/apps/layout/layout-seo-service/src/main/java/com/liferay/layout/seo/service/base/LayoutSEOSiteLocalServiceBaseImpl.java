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

package com.liferay.layout.seo.service.base;

import com.liferay.exportimport.kernel.lar.ExportImportHelperUtil;
import com.liferay.exportimport.kernel.lar.ManifestSummary;
import com.liferay.exportimport.kernel.lar.PortletDataContext;
import com.liferay.exportimport.kernel.lar.StagedModelDataHandlerUtil;
import com.liferay.exportimport.kernel.lar.StagedModelType;
import com.liferay.layout.seo.model.LayoutSEOSite;
import com.liferay.layout.seo.service.LayoutSEOSiteLocalService;
import com.liferay.layout.seo.service.persistence.LayoutSEOSitePersistence;
import com.liferay.portal.aop.AopService;
import com.liferay.portal.kernel.dao.db.DB;
import com.liferay.portal.kernel.dao.db.DBManagerUtil;
import com.liferay.portal.kernel.dao.jdbc.SqlUpdate;
import com.liferay.portal.kernel.dao.jdbc.SqlUpdateFactoryUtil;
import com.liferay.portal.kernel.dao.orm.ActionableDynamicQuery;
import com.liferay.portal.kernel.dao.orm.DefaultActionableDynamicQuery;
import com.liferay.portal.kernel.dao.orm.DynamicQuery;
import com.liferay.portal.kernel.dao.orm.DynamicQueryFactoryUtil;
import com.liferay.portal.kernel.dao.orm.ExportActionableDynamicQuery;
import com.liferay.portal.kernel.dao.orm.IndexableActionableDynamicQuery;
import com.liferay.portal.kernel.dao.orm.Projection;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.exception.SystemException;
import com.liferay.portal.kernel.model.PersistedModel;
import com.liferay.portal.kernel.module.framework.service.IdentifiableOSGiService;
import com.liferay.portal.kernel.search.Indexable;
import com.liferay.portal.kernel.search.IndexableType;
import com.liferay.portal.kernel.service.BaseLocalServiceImpl;
import com.liferay.portal.kernel.service.PersistedModelLocalService;
import com.liferay.portal.kernel.transaction.Transactional;
import com.liferay.portal.kernel.util.OrderByComparator;
import com.liferay.portal.kernel.util.PortalUtil;

import java.io.Serializable;

import java.util.List;

import javax.sql.DataSource;

import org.osgi.service.component.annotations.Reference;

/**
 * Provides the base implementation for the layout seo site local service.
 *
 * <p>
 * This implementation exists only as a container for the default service methods generated by ServiceBuilder. All custom service methods should be put in {@link com.liferay.layout.seo.service.impl.LayoutSEOSiteLocalServiceImpl}.
 * </p>
 *
 * @author Brian Wing Shun Chan
 * @see com.liferay.layout.seo.service.impl.LayoutSEOSiteLocalServiceImpl
 * @generated
 */
public abstract class LayoutSEOSiteLocalServiceBaseImpl
	extends BaseLocalServiceImpl
	implements AopService, IdentifiableOSGiService, LayoutSEOSiteLocalService {

	/**
	 * NOTE FOR DEVELOPERS:
	 *
	 * Never modify or reference this class directly. Use <code>LayoutSEOSiteLocalService</code> via injection or a <code>org.osgi.util.tracker.ServiceTracker</code> or use <code>com.liferay.layout.seo.service.LayoutSEOSiteLocalServiceUtil</code>.
	 */

	/**
	 * Adds the layout seo site to the database. Also notifies the appropriate model listeners.
	 *
	 * @param layoutSEOSite the layout seo site
	 * @return the layout seo site that was added
	 */
	@Indexable(type = IndexableType.REINDEX)
	@Override
	public LayoutSEOSite addLayoutSEOSite(LayoutSEOSite layoutSEOSite) {
		layoutSEOSite.setNew(true);

		return layoutSEOSitePersistence.update(layoutSEOSite);
	}

	/**
	 * Creates a new layout seo site with the primary key. Does not add the layout seo site to the database.
	 *
	 * @param layoutSEOSiteId the primary key for the new layout seo site
	 * @return the new layout seo site
	 */
	@Override
	@Transactional(enabled = false)
	public LayoutSEOSite createLayoutSEOSite(long layoutSEOSiteId) {
		return layoutSEOSitePersistence.create(layoutSEOSiteId);
	}

	/**
	 * Deletes the layout seo site with the primary key from the database. Also notifies the appropriate model listeners.
	 *
	 * @param layoutSEOSiteId the primary key of the layout seo site
	 * @return the layout seo site that was removed
	 * @throws PortalException if a layout seo site with the primary key could not be found
	 */
	@Indexable(type = IndexableType.DELETE)
	@Override
	public LayoutSEOSite deleteLayoutSEOSite(long layoutSEOSiteId)
		throws PortalException {

		return layoutSEOSitePersistence.remove(layoutSEOSiteId);
	}

	/**
	 * Deletes the layout seo site from the database. Also notifies the appropriate model listeners.
	 *
	 * @param layoutSEOSite the layout seo site
	 * @return the layout seo site that was removed
	 */
	@Indexable(type = IndexableType.DELETE)
	@Override
	public LayoutSEOSite deleteLayoutSEOSite(LayoutSEOSite layoutSEOSite) {
		return layoutSEOSitePersistence.remove(layoutSEOSite);
	}

	@Override
	public DynamicQuery dynamicQuery() {
		Class<?> clazz = getClass();

		return DynamicQueryFactoryUtil.forClass(
			LayoutSEOSite.class, clazz.getClassLoader());
	}

	/**
	 * Performs a dynamic query on the database and returns the matching rows.
	 *
	 * @param dynamicQuery the dynamic query
	 * @return the matching rows
	 */
	@Override
	public <T> List<T> dynamicQuery(DynamicQuery dynamicQuery) {
		return layoutSEOSitePersistence.findWithDynamicQuery(dynamicQuery);
	}

	/**
	 * Performs a dynamic query on the database and returns a range of the matching rows.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.layout.seo.model.impl.LayoutSEOSiteModelImpl</code>.
	 * </p>
	 *
	 * @param dynamicQuery the dynamic query
	 * @param start the lower bound of the range of model instances
	 * @param end the upper bound of the range of model instances (not inclusive)
	 * @return the range of matching rows
	 */
	@Override
	public <T> List<T> dynamicQuery(
		DynamicQuery dynamicQuery, int start, int end) {

		return layoutSEOSitePersistence.findWithDynamicQuery(
			dynamicQuery, start, end);
	}

	/**
	 * Performs a dynamic query on the database and returns an ordered range of the matching rows.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.layout.seo.model.impl.LayoutSEOSiteModelImpl</code>.
	 * </p>
	 *
	 * @param dynamicQuery the dynamic query
	 * @param start the lower bound of the range of model instances
	 * @param end the upper bound of the range of model instances (not inclusive)
	 * @param orderByComparator the comparator to order the results by (optionally <code>null</code>)
	 * @return the ordered range of matching rows
	 */
	@Override
	public <T> List<T> dynamicQuery(
		DynamicQuery dynamicQuery, int start, int end,
		OrderByComparator<T> orderByComparator) {

		return layoutSEOSitePersistence.findWithDynamicQuery(
			dynamicQuery, start, end, orderByComparator);
	}

	/**
	 * Returns the number of rows matching the dynamic query.
	 *
	 * @param dynamicQuery the dynamic query
	 * @return the number of rows matching the dynamic query
	 */
	@Override
	public long dynamicQueryCount(DynamicQuery dynamicQuery) {
		return layoutSEOSitePersistence.countWithDynamicQuery(dynamicQuery);
	}

	/**
	 * Returns the number of rows matching the dynamic query.
	 *
	 * @param dynamicQuery the dynamic query
	 * @param projection the projection to apply to the query
	 * @return the number of rows matching the dynamic query
	 */
	@Override
	public long dynamicQueryCount(
		DynamicQuery dynamicQuery, Projection projection) {

		return layoutSEOSitePersistence.countWithDynamicQuery(
			dynamicQuery, projection);
	}

	@Override
	public LayoutSEOSite fetchLayoutSEOSite(long layoutSEOSiteId) {
		return layoutSEOSitePersistence.fetchByPrimaryKey(layoutSEOSiteId);
	}

	/**
	 * Returns the layout seo site matching the UUID and group.
	 *
	 * @param uuid the layout seo site's UUID
	 * @param groupId the primary key of the group
	 * @return the matching layout seo site, or <code>null</code> if a matching layout seo site could not be found
	 */
	@Override
	public LayoutSEOSite fetchLayoutSEOSiteByUuidAndGroupId(
		String uuid, long groupId) {

		return layoutSEOSitePersistence.fetchByUUID_G(uuid, groupId);
	}

	/**
	 * Returns the layout seo site with the primary key.
	 *
	 * @param layoutSEOSiteId the primary key of the layout seo site
	 * @return the layout seo site
	 * @throws PortalException if a layout seo site with the primary key could not be found
	 */
	@Override
	public LayoutSEOSite getLayoutSEOSite(long layoutSEOSiteId)
		throws PortalException {

		return layoutSEOSitePersistence.findByPrimaryKey(layoutSEOSiteId);
	}

	@Override
	public ActionableDynamicQuery getActionableDynamicQuery() {
		ActionableDynamicQuery actionableDynamicQuery =
			new DefaultActionableDynamicQuery();

		actionableDynamicQuery.setBaseLocalService(layoutSEOSiteLocalService);
		actionableDynamicQuery.setClassLoader(getClassLoader());
		actionableDynamicQuery.setModelClass(LayoutSEOSite.class);

		actionableDynamicQuery.setPrimaryKeyPropertyName("layoutSEOSiteId");

		return actionableDynamicQuery;
	}

	@Override
	public IndexableActionableDynamicQuery
		getIndexableActionableDynamicQuery() {

		IndexableActionableDynamicQuery indexableActionableDynamicQuery =
			new IndexableActionableDynamicQuery();

		indexableActionableDynamicQuery.setBaseLocalService(
			layoutSEOSiteLocalService);
		indexableActionableDynamicQuery.setClassLoader(getClassLoader());
		indexableActionableDynamicQuery.setModelClass(LayoutSEOSite.class);

		indexableActionableDynamicQuery.setPrimaryKeyPropertyName(
			"layoutSEOSiteId");

		return indexableActionableDynamicQuery;
	}

	protected void initActionableDynamicQuery(
		ActionableDynamicQuery actionableDynamicQuery) {

		actionableDynamicQuery.setBaseLocalService(layoutSEOSiteLocalService);
		actionableDynamicQuery.setClassLoader(getClassLoader());
		actionableDynamicQuery.setModelClass(LayoutSEOSite.class);

		actionableDynamicQuery.setPrimaryKeyPropertyName("layoutSEOSiteId");
	}

	@Override
	public ExportActionableDynamicQuery getExportActionableDynamicQuery(
		final PortletDataContext portletDataContext) {

		final ExportActionableDynamicQuery exportActionableDynamicQuery =
			new ExportActionableDynamicQuery() {

				@Override
				public long performCount() throws PortalException {
					ManifestSummary manifestSummary =
						portletDataContext.getManifestSummary();

					StagedModelType stagedModelType = getStagedModelType();

					long modelAdditionCount = super.performCount();

					manifestSummary.addModelAdditionCount(
						stagedModelType, modelAdditionCount);

					long modelDeletionCount =
						ExportImportHelperUtil.getModelDeletionCount(
							portletDataContext, stagedModelType);

					manifestSummary.addModelDeletionCount(
						stagedModelType, modelDeletionCount);

					return modelAdditionCount;
				}

			};

		initActionableDynamicQuery(exportActionableDynamicQuery);

		exportActionableDynamicQuery.setAddCriteriaMethod(
			new ActionableDynamicQuery.AddCriteriaMethod() {

				@Override
				public void addCriteria(DynamicQuery dynamicQuery) {
					portletDataContext.addDateRangeCriteria(
						dynamicQuery, "modifiedDate");
				}

			});

		exportActionableDynamicQuery.setCompanyId(
			portletDataContext.getCompanyId());

		exportActionableDynamicQuery.setPerformActionMethod(
			new ActionableDynamicQuery.PerformActionMethod<LayoutSEOSite>() {

				@Override
				public void performAction(LayoutSEOSite layoutSEOSite)
					throws PortalException {

					StagedModelDataHandlerUtil.exportStagedModel(
						portletDataContext, layoutSEOSite);
				}

			});
		exportActionableDynamicQuery.setStagedModelType(
			new StagedModelType(
				PortalUtil.getClassNameId(LayoutSEOSite.class.getName())));

		return exportActionableDynamicQuery;
	}

	/**
	 * @throws PortalException
	 */
	@Override
	public PersistedModel deletePersistedModel(PersistedModel persistedModel)
		throws PortalException {

		return layoutSEOSiteLocalService.deleteLayoutSEOSite(
			(LayoutSEOSite)persistedModel);
	}

	@Override
	public PersistedModel getPersistedModel(Serializable primaryKeyObj)
		throws PortalException {

		return layoutSEOSitePersistence.findByPrimaryKey(primaryKeyObj);
	}

	/**
	 * Returns all the layout seo sites matching the UUID and company.
	 *
	 * @param uuid the UUID of the layout seo sites
	 * @param companyId the primary key of the company
	 * @return the matching layout seo sites, or an empty list if no matches were found
	 */
	@Override
	public List<LayoutSEOSite> getLayoutSEOSitesByUuidAndCompanyId(
		String uuid, long companyId) {

		return layoutSEOSitePersistence.findByUuid_C(uuid, companyId);
	}

	/**
	 * Returns a range of layout seo sites matching the UUID and company.
	 *
	 * @param uuid the UUID of the layout seo sites
	 * @param companyId the primary key of the company
	 * @param start the lower bound of the range of layout seo sites
	 * @param end the upper bound of the range of layout seo sites (not inclusive)
	 * @param orderByComparator the comparator to order the results by (optionally <code>null</code>)
	 * @return the range of matching layout seo sites, or an empty list if no matches were found
	 */
	@Override
	public List<LayoutSEOSite> getLayoutSEOSitesByUuidAndCompanyId(
		String uuid, long companyId, int start, int end,
		OrderByComparator<LayoutSEOSite> orderByComparator) {

		return layoutSEOSitePersistence.findByUuid_C(
			uuid, companyId, start, end, orderByComparator);
	}

	/**
	 * Returns the layout seo site matching the UUID and group.
	 *
	 * @param uuid the layout seo site's UUID
	 * @param groupId the primary key of the group
	 * @return the matching layout seo site
	 * @throws PortalException if a matching layout seo site could not be found
	 */
	@Override
	public LayoutSEOSite getLayoutSEOSiteByUuidAndGroupId(
			String uuid, long groupId)
		throws PortalException {

		return layoutSEOSitePersistence.findByUUID_G(uuid, groupId);
	}

	/**
	 * Returns a range of all the layout seo sites.
	 *
	 * <p>
	 * Useful when paginating results. Returns a maximum of <code>end - start</code> instances. <code>start</code> and <code>end</code> are not primary keys, they are indexes in the result set. Thus, <code>0</code> refers to the first result in the set. Setting both <code>start</code> and <code>end</code> to <code>com.liferay.portal.kernel.dao.orm.QueryUtil#ALL_POS</code> will return the full result set. If <code>orderByComparator</code> is specified, then the query will include the given ORDER BY logic. If <code>orderByComparator</code> is absent, then the query will include the default ORDER BY logic from <code>com.liferay.layout.seo.model.impl.LayoutSEOSiteModelImpl</code>.
	 * </p>
	 *
	 * @param start the lower bound of the range of layout seo sites
	 * @param end the upper bound of the range of layout seo sites (not inclusive)
	 * @return the range of layout seo sites
	 */
	@Override
	public List<LayoutSEOSite> getLayoutSEOSites(int start, int end) {
		return layoutSEOSitePersistence.findAll(start, end);
	}

	/**
	 * Returns the number of layout seo sites.
	 *
	 * @return the number of layout seo sites
	 */
	@Override
	public int getLayoutSEOSitesCount() {
		return layoutSEOSitePersistence.countAll();
	}

	/**
	 * Updates the layout seo site in the database or adds it if it does not yet exist. Also notifies the appropriate model listeners.
	 *
	 * @param layoutSEOSite the layout seo site
	 * @return the layout seo site that was updated
	 */
	@Indexable(type = IndexableType.REINDEX)
	@Override
	public LayoutSEOSite updateLayoutSEOSite(LayoutSEOSite layoutSEOSite) {
		return layoutSEOSitePersistence.update(layoutSEOSite);
	}

	@Override
	public Class<?>[] getAopInterfaces() {
		return new Class<?>[] {
			LayoutSEOSiteLocalService.class, IdentifiableOSGiService.class,
			PersistedModelLocalService.class
		};
	}

	@Override
	public void setAopProxy(Object aopProxy) {
		layoutSEOSiteLocalService = (LayoutSEOSiteLocalService)aopProxy;
	}

	/**
	 * Returns the OSGi service identifier.
	 *
	 * @return the OSGi service identifier
	 */
	@Override
	public String getOSGiServiceIdentifier() {
		return LayoutSEOSiteLocalService.class.getName();
	}

	protected Class<?> getModelClass() {
		return LayoutSEOSite.class;
	}

	protected String getModelClassName() {
		return LayoutSEOSite.class.getName();
	}

	/**
	 * Performs a SQL query.
	 *
	 * @param sql the sql query
	 */
	protected void runSQL(String sql) {
		try {
			DataSource dataSource = layoutSEOSitePersistence.getDataSource();

			DB db = DBManagerUtil.getDB();

			sql = db.buildSQL(sql);
			sql = PortalUtil.transformSQL(sql);

			SqlUpdate sqlUpdate = SqlUpdateFactoryUtil.getSqlUpdate(
				dataSource, sql);

			sqlUpdate.update();
		}
		catch (Exception e) {
			throw new SystemException(e);
		}
	}

	protected LayoutSEOSiteLocalService layoutSEOSiteLocalService;

	@Reference
	protected LayoutSEOSitePersistence layoutSEOSitePersistence;

	@Reference
	protected com.liferay.counter.kernel.service.CounterLocalService
		counterLocalService;

	@Reference
	protected com.liferay.portal.kernel.service.GroupLocalService
		groupLocalService;

}