define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var itemTemplate = require('text!./tpl/productitem.html'),
		itemSchema = require('json!schema/SalesOrderProductsSchema.json');

	var currencyFormat = {
		symbol: "VNĐ",		// default currency symbol is '$'
		format: "%v %s",	// controls output: %s = symbol, %v = value (can be object, see docs)
		decimal: ",",		// decimal point separator
		thousand: ".",		// thousands separator
		precision: 0,		// decimal places
		grouping: 3		// digit grouping (not implemented yet)
	};

	return Gonrin.ItemView.extend({
		template: itemTemplate,
		tagName: 'tr',
		modelSchema: itemSchema,
		urlPrefix: "/api/v1/",
		collectionName: "salesorderproducts",
		foreignRemoteField: "id",
		foreignField: "salesorder_id",
		uiControl: {
			fields: [
				{
					field: "list_price",
					uicontrol: "currency",
					currency: currencyFormat,
					cssClass: "text-right"
				},
				{
					field: "net_amount",
					uicontrol: "currency",
					currency: currencyFormat,
					cssClass: "text-right"
				},
				{
					field: "discount_amount",
					uicontrol: "currency",
					currency: currencyFormat,
					cssClass: "text-right"
				},
			]
		},
		render: function () {
			var self = this;
			this.applyBindings();
			//console.log(JSON.stringify(self.model.attributes));
			self.calculateNetPrice();
			self.$el.find("#itemRemove").unbind("click").bind("click", function () {
				self.remove(true);
			});

			/*
			var productEl = this.$el.find("#product");
			
			//var selectedItems = [];
			var product_id = self.model.get("product_id");
			var product_name = self.model.get("product_name");
			
			if(product_name) {
				//selectedItems.push({"id": product_id, "product_name": product_name});
				productEl.val(JSON.stringify({"id": product_id, "product_name": product_name}));
			}
			
			
			productEl.off("change.gonrin").on("change.gonrin", function(e) {
				if (e && e.value) {
					self.model.set("product_id", e.value.id);
//						self.model.set("productsku", e.value.productsku);
					self.model.set("product_name", e.value.product_name);
					self.model.set("list_price", e.value.list_price);
					
					self.model.set("discount_percent", 0);
					self.model.set("discount_amount", 0);
					var quantity = self.model.get("quantity") || 1;
					self.model.set("quantity", quantity);
				}
			});*/

			self.model.on("change:list_price", function () {
				self.calculateNetPrice();
			});
			self.model.on("change:quantity", function () {
				self.calculateNetPrice();
			});
			self.model.on("change:discount_percent", function () {
				self.calculateNetPrice();
			});
			self.model.on("change:discount_amount", function () {
				self.calculateNetPrice();
			});
		},

		calculateNetPrice: function () {
			var self = this;
			var list_price = self.model.get("list_price");
			var quantity = self.model.get("quantity");
			var discount_percent = self.model.get("discount_percent");
			var discount_amount = self.model.get("discount_amount");

			var net_amount = (quantity || 0) * (list_price || 0);
			if (!!discount_percent) {
				net_amount = net_amount - (net_amount * discount_percent / 100);
			} else if (!!discount_amount) {
				net_amount = net_amount - (net_amount > discount_amount ? discount_amount : net_amount);
			}
			self.model.set("net_amount", net_amount);

		}
	});

});