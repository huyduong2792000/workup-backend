define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/select.html'),
		schema = require('json!schema/RoleSchema.json');

	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "role",
		textField: "display_name",
		tools: [
			{
				name: "close",
				type: "button",
				buttonClass: "btn btn-danger btn-md margin-left-5",
				label: "Close",
				command: function () {
					this.close();
				}
			},
			{
				name: "select",
				type: "button",
				buttonClass: "btn btn-primary btn-md margin-left-5",
				label: "TRANSLATE:SELECT",
				command: function () {
					this.trigger("onSelected");
					this.close();
				}
			}
		],
		uiControl: {
			fields: [
				{ field: "display_name", label: "Tên" },
				{ field: "description", label: "Mô tả" },
			],
			onRowClick: function (event) {
				this.uiControl.selectedItems = event.selectedItems;
			},
		},
		render: function () {
			this.applyBindings();
		}

	});

});