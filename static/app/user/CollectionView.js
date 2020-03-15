define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/UserSchema.json');

	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "user",
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "create",
						type: "button",
						buttonClass: "btn-primary btn-sm",
						label: "TRANSLATE:CREATE",
						command: function () {
							var self = this;
							return;
						}
					}
				]
			}
		],
		uiControl: {
			orderBy: [{ field: "created_at", direction: "asc" }],
			fields: [
				{
					field: "display_name", label: "Họ và tên", template: function (rowObject) {
						return `<div style="min-width: 135px;">${rowObject.display_name}</div>`;
					}
				},
				{
					field: "phone", label: "Phone", template: function (rowObject) {
						return `<div style="min-width: 133px;">${TemplateHelper.phoneFormat(rowObject.phone)}</div>`;
					}
				},
				{
					field: "email", label: "Email", template: function (rowObject) {
						return `<div style="min-width: 133px;">${rowObject.email}</div>`;
					}
				},
				{
					field: "deleted", label: " ", template: function (rowObject) {
						return `<div style="min-width: 40px;">${TemplateHelper.lockStatus(rowObject.deleted)}</div>`;
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