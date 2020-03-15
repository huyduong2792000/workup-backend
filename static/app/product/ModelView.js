define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/ProductSchema.json');

	var CategoryCollectionView = require("app/product-category/CategorySelectView");


	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "product",
		uiControl: {
			fields: [
				{
					field: "categories",
					uicontrol: "ref",
					textField: "category_name",
					selectionMode: "multiple",
					dataSource: CategoryCollectionView
				},
				{
					field: "deleted",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": false, "text": "Active" },
						{ "value": true, "text": "Deactive" }
					],
				}
			]
		},

		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				//progresbar quay quay
				this.model.set('id', id);
				loader.show();
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.switchUIControlRegister();
						loader.hide();
					},
					error: function () {
						loader.hide();
						self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
					},
				});
			} else {
				self.applyBindings();
				self.switchUIControlRegister();
			}
		},

		switchUIControlRegister: function () {
			var self = this;

			self.$el.find(".switch input[id='deleted_switch']").unbind("click").bind("click", function ($event) {
				if ($(this).is(":checked")) {
					self.model.set("deleted", false);
				} else {
					self.model.set("deleted", true);
				}
			})

			if (self.model.get("deleted") === null || self.model.get("deleted") === false) {
				self.$el.find(".switch input[id='deleted_switch']").trigger("click");
			}
		}
	});

});