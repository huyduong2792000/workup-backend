define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/RoleSchema.json');
	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "role",
		uiControl: {
			orderBy: [{ field: "created_at", direction: "asc" }],
			fields: [
				{ field: "id", label: "ID", visible: false },
				{ field: "role_name", visible: true},
				{ field: "display_name", label: "Tên" },
				{ field: "description", label: "Ghi chú" },
				{
					field: "deleted",
					label: " ",
					width: "60px",
					template: function (rowObj) {
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