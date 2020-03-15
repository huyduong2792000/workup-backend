define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/ServiceSchema.json');
	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "service",
		uiControl: {
			orderBy: [{ field: "created_at", direction: "desc" }],
			fields: [
				{ field: "service_no", label: "Mã dịch vụ" },
				{ field: "servicename", label: "Tên dịch vụ" },
				{ field: "list_price", label: "Đơn giá" },
				{ field: "usageunit", label: "Đơn vị" },
				{
					field: "deleted", label: "Trạng thái", width: "105px", template: function (rowObj) {
						return TemplateHelper.renderStatus(!rowObj.deleted);
					}
				},
			],
			onRowClick: function (event) {
				if (event.rowId) {
					var path = this.collectionName + '/model?id=' + event.rowId;
					this.getApp().getRouter().navigate(path);
				}
			}
		},
		render: function () {
			this.applyBindings();
			return this;
		},

	});

});