define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/TaskGroupSchema.json');

	var Helpers = require('app/common/Helpers');
	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "task_group",
		uiControl: {
			orderBy: [{ field: "created_at", direction: "desc" }],

			fields: [
				{ field: "name", label: "Tên nhóm" },
				{ field: "priority", label: "Mức độ" },
				{ field: "supervisor", label: "Người giám sát" , textField:"full_name"},
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
		registerEvent: function(){
			var self = this;
			self.$el.find('#data-search').keypress(function (e) {
				if (e.which == '13') {
					self.setupFilter();
				}
			});
			var filter_data = self.$el.find("#filter-data-by-priority");
			filter_data.on("change", function () {
				self.setupFilter();
			});
			self.getApp().on("import_brand_template_closed", function (event) {
				self.setupFilter();
			});
		},
		setupFilter: function () {
			var self = this;
			let search_data = Helpers.replaceToAscii(self.$el.find("#data-search").val());
			let priority = self.$el.find("#filter-data-by-priority").val();
			console.log(priority)
			if(priority !="0"){
				self.getCollectionElement().data("gonrin").filter({ "$and": [{ "priority": { "$eq": priority } }, { "unsigned_name": { "$likeI": search_data.toLowerCase() } }] });
			}else{
				self.getCollectionElement().data("gonrin").filter({ "$and": [{ "unsigned_name": { "$likeI": search_data.toLowerCase() } }] });
			}
		}

	});

});