define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/TaskInfoSchema.json');

	var Helpers = require('app/common/Helpers');
	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "task_info",
		uiControl: {
			orderBy: [{ field: "created_at", direction: "desc" }],

			fields: [
				{ field: "task_code", label: "Mã công việc" },
				{ field: "task_name", label: "Tên công việc" },
				// { field: "tags", label: "Tags" },
				{ field: "description", label: "Mô tả" },
				// { field: "original_estimate", label: "Thời gian ước tính(phút)" },

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