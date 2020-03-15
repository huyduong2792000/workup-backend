define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/WorkstationSchema.json');

	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "workstation",
		uiControl: {
			fields: [
				{
					field: "workstation_name", label: "Điểm bán", template: function (rowObject) {
						return `<div style="min-width: 150px;">${rowObject.workstation_name}</div>`;
					}
				},
				{
					field: "phone", label: "Phone", template: function (rowObject) {
						return `<div style="min-width: 133px;">${TemplateHelper.phoneFormat(rowObject.phone ? rowObject.phone : "")}</div>`;
					}
				},
				{
					field: "address_street", label: "Địa chỉ", template: function (rowObject) {
						return `<div style="min-width: 120px;">${rowObject.address_street ? rowObject.address_street : ""}</div>`;
					}
				},
				{
					field: "deleted", label: " ", template: function (rowObj) {
						return TemplateHelper.renderStatus(!rowObj.deleted);
					}
				}
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