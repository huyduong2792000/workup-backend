define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/select.html'),
		schema = require('json!schema/EmployeeSchema.json');
	var Helpers = require('app/common/Helpers');
	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "employee",
		textField: "full_name",
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
			fields: [
				{ field: "full_name", label: "Tên nhân viên" },
				{ field: "email", label: "Email" },
				{ field: "phone_number", label: "Điện thoại" },
				{ field: "avatar_url", label: "ẢNH ĐẠI DIỆN", visible: true, template: '<img src="{{avatar_url}}" alt="" style="max-height:60px">', width: 150 },
				{ field: "position", label: "Chức vụ" },
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