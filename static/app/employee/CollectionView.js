define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/AccountSchema.json');

	var Helpers = require('app/common/Helpers');


	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "employee",
		uiControl: {
			orderBy: [{ field: "created_at", direction: "desc" }],
			fields: [
				{ field: "full_name", label: "Tên nhân viên" ,width:150},
				{ field: "email", label: "Email" },
				{ field: "birthday", label: "Sinh nhật" },
				{ field: "phone_number", label: "Điện thoại" },
				{ field: "id_identifier", label: "Số CMND" },
				{ field: "avatar_url", label: "ẢNH ĐẠI DIỆN", visible: true, template: '<img src="{{avatar_url}}" alt="" style="max-height:60px">'},
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
				{
					field: "created_at", label: "Ngày tạo", template: function (rowObj) {
						return Helpers.setDatetime(rowObj.created_at);
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