define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/TasksSchema.json');

	var Helpers = require('app/common/Helpers');
	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "tasks",
		uiControl: {
			orderBy: [{ field: "created_at", direction: "desc" }, { field: "priority", direction: "desc" }],

			fields: [
				// { field: "task_code", label: "Mã công việc" },
				{ field: "task_name", label: "Tên công việc" },
				// { field: "tags", label: "Tags" },
				{
					field: "priority", label: "Mực độ", template: function (rowObj) {
						if (rowObj.priority == 1) {
							return `<p style="color:red;">highest</p>`;
						}
						if (rowObj.priority == 2) {
							return `<p style="color:#f25d00;">high</p>`;
						}
						if (rowObj.priority == 3) {
							return `<p style="color:#000000;">low</p>`;
						}
						if (rowObj.priority == 4) {
							return `<p style="color:#cda58d;">lowest</p>`;
						}
					}
				},
				{
					field: "status", label: "Tiến độ công việc", template: function (rowObj) {
						if (rowObj.status == 0) {
							return `<div class="btn-outline-warning " style="border-radius: 4px;border: 2px solid #ffc107;  transform: rotate(30deg); font-weight: 300; max-width: 60px;">Pending</div>`;
						}
						if (rowObj.status == 1) {
							return `<div class="btn-outline-success " style="border-radius: 4px;border: 2px solid #28a745;  transform: rotate(30deg); font-weight: 300; max-width: 60px;">Done</div>`;
						}
						if (rowObj.status == 2) {
							return `<div class="btn-outline-danger" style="border-radius: 4px;border: 2px solid #dc3545;  transform: rotate(30deg); font-weight: 300; max-width: 60px;">Process</div>`;
						}
					}
				},
				{ field: "employees", label: "Người nhận", textField:"full_name" },
				// {
				// 	field: "original_estimate", label: "Ước lượng", template: function (rowObj) {
				// 		let original_estimate = rowObj.original_estimate || null;

				// 		if (original_estimate != null) {
				// 			return `<p style="color:blue;">${original_estimate}  minute</p> `;
				// 		} else {
				// 			return `<p style="color:red;">Chưa ước lượng</p>`
				// 		}
				// 	}
				// },
				{
					field: "start_time", label: "T/g bắt đầu", template: function (rowObj) {
						return Helpers.utcToLocal(moment.unix(rowObj.start_time).format("YYYY-MM-DD HH:mm:ss"), "YYYY-MM-DD HH:mm:ss");
					}
				},
				{
					field: "end_time", label: "T/g kết thúc", template: function (rowObj) {
						return Helpers.utcToLocal(moment.unix(rowObj.end_time).format("YYYY-MM-DD HH:mm:ss"), "YYYY-MM-DD HH:mm:ss");
					}
				},
				{
					field: "active",
					label: "Trạng thái",
					template: function (rowObj) {
						return TemplateHelper.renderStatus(rowObj.active);
					}
				},

				// {
				// 	field: "created_at", label: "Ngày tạo", template: function (rowObj) {
				// 		return Helpers.setDatetime(rowObj.created_at);
				// 	}
				// }
			],
			onRowClick: function (event) {
				if (event.rowId) {
					var path = this.collectionName + '/model?id=' + event.rowId;
					this.getApp().getRouter().navigate(path);
				}
			}
		},

		render: function () {
			var self = this;
			self.applyBindings();
			self.registerEvent();
			return self;

		},
		registerEvent: function () {
			var self = this;
			self.$el.find('#data-search').keypress(function (e) {
				if (e.which == '13') {
					self.setupFilter();
				}
			});
			var filter_data = self.$el.find("#filter-data-by-status");
			filter_data.on("change", function () {
				self.setupFilter();
			});
			self.getApp().on("import_brand_template_closed", function (event) {
				self.setupFilter();
			});
		},
		setupFilter: function () {
			var self = this;
			let search_data = self.$el.find("#data-search").val();
			let active = self.$el.find("#filter-data-by-status").val();
			if (search_data != null) {

				if (active != "2") {
					self.getCollectionElement().data("gonrin").filter({ "$and": [{ "active": { "$eq": active } }, { "$or": [{ "task_name": { "$like": search_data } }, { "task_code": { "$like": search_data } }] }] });
				} else {
					self.getCollectionElement().data("gonrin").filter({ "$and": [{ "$or": [{ "task_name": { "$like": search_data } }, { "task_code": { "$like": search_data } }] }] });
				}
			}

		}

	});

});