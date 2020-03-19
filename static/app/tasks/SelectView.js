define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/select.html'),
		schema = require('json!schema/TasksSchema.json');
	var Helpers = require('app/common/Helpers');
	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "tasks",
		textField: "task_name",
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
			},
		],
		uiControl: {
			orderBy: [{ field: "created_at", direction: "desc" }],

			fields: [
				{ field: "task_name", label: "Tên" },
				// { field: "priority", label: "Mức độ" },
				{ field: "status", label: "Trạng thái" },
				{
					field: "start_time", label: "Thời gian bắt đầu", template: function (rowObj) {
						return Helpers.setDatetime(rowObj.start_time);
					}
				},
				{
					field: "end_time", label: "Thời gian kết thúc", template: function (rowObj) {
						return Helpers.setDatetime(rowObj.end_time);
					}
				},
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