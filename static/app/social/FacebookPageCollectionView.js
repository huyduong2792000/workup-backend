define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/facebook-page-collection.html'),
		schema = require('json!schema/FacebookPageSchema.json');
	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "facebook_page",
		uiControl: {
			orderBy: [{ field: "page_name", direction: "asc" }],
			fields: [
				{ field: "page_profile_pic", label: " ", width: "40px", template: function(rowObject) {
					if (rowObject && rowObject.page_profile_pic) {
						return `<div style="height: 34px; width: 34px; border-radius: 5px; background-image: url(${rowObject.page_profile_pic}); background-size: cover; background-position: center;"></div>`;
					}
					return '';
				}},
				{ field: "page_id", label: "ID" },
				{ field: "page_name", label: "Page Name" },
				{
					field: "status",
					label: "Trạng thái",
					width: "108px",
					template: function (rowObj) {
						if (rowObj.status == "active") {
							return TemplateHelper.renderStatus(true);
						}
						return rowObj.status;
					}
				}
			],
			onRowClick: function (event) {
				if (event.rowId) {
					var path = 'facebook/page/model?id=' + event.rowId;
					this.getApp().getRouter().navigate(path);
				}
			}
		},
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

							self.getApp().getRouter().navigate("facebook/page/model");
						}
					},
				]
			},
		],

		render: function () {
			this.applyBindings();
			return this;
		},

	});

});