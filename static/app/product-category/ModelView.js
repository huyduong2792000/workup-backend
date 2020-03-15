define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/ProductCategorySchema.json');

	var ProductSelect = require("app/product/SelectView");


	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "productcategory",
		uiControl: {
			fields: [
				{
					field: "products",
					uicontrol: "ref",
					textField: "product_name",
					selectionMode: "multiple",
					dataSource: ProductSelect
				}
			]
		},

		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				this.model.set('id', id);
				loader.show();
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.switchUIRegister();
						loader.hide();
					},
					error: function () {
						loader.hide();
						self.getApp().notify({ message: "Lỗi hệ thống, vui lòng thử lại sau." }, { type: "danger" });
					},
				});
			} else {
				self.applyBindings();
				self.switchUIRegister();
			}

		},

		switchUIRegister: function () {
			const self = this;

			self.$el.find(".switch input[id='is_active']").unbind("click").bind("click", function ($event) {
				if ($(this).is(":checked")) {
					self.model.set("deleted", false);
				} else {
					self.model.set("deleted", true);
				}
			})

			if (!self.model.get("deleted")) {
				self.$el.find(".switch input[id='is_active']").trigger("click");
			}
		}
	});

});