define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/TaskScheduleSchema.json');

	var Helpers = require('app/common/Helpers');


	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "task_schedule",
		uiControl: {
			orderBy: [{ field: "start_time_working", direction: "desc" }],
			fields: [
				{ field: "day_of_week", label: "Thứ" },
				{ field: "hour_of_day", label: "Giờ làm" },
				{
					field: "start_time_working", label: "Ngày bắt đầu", template: function (rowObj) {
						return Helpers.setDatetime(rowObj.start_time_working);
					}
				},
				{
					field: "end_time_working", label: "Ngày kết thúc", template: function (rowObj) {
						return Helpers.setDatetime(rowObj.end_time_working);
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