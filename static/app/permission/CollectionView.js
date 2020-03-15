define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/permissionSchema.json');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "permission",
		uiControl: {
			orderBy: [{ field: "created_at", direction: "asc" }],
			fields: [
				{ field: "id", label: "ID", width: 50, readonly: true },
				{
					field: "role_id",
					label: "Role",
					width: 150,
					foreign: "role",
					foreignValueField: "id",
					foreignTextField: "role_name",
				},
				{ field: "subject", label: "Đối tượng", width: 150 },
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
		}
	});
});