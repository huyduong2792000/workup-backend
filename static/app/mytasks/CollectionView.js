define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/TasksSchema.json');

	var Helpers = require('app/common/Helpers');


	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "mytasks",
		uiControl: {
			orderBy: [{ field: "created_at", direction: "desc" }],

			fields: [
				{ field: "task_code", label: "Mã công việc" },
				{ field: "task_name", label: "Tên công việc" },
				{ field: "tags", label: "Tags" },
				{ field: "priority", label: "Mực độ" },
				{ field: "status", label: "Trạng thái" },
				{ field: "link_issue", label: "Liên kết" },
				{ field: "original_estimate", label: "Ước tính ban đầu (phút)" },
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