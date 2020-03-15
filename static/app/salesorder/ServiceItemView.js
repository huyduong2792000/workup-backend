define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var itemTemplate = require('text!./tpl/serviceitem.html'),
		itemSchema = require('json!schema/SalesOrderServicesSchema.json');

	var ServiceSelectView = require('app/service/SelectView');

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
		collectionName: "salesorderservices",
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
					field: "net_price",
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
			self.calculateNetPrice();

			this.applyBindings();

			self.$el.find("#itemRemove").unbind("click").bind("click", function () {
				self.remove(true);
			});


			var el = this.$el.find("#service");

			//var selectedItems = [];
			var service_id = self.model.get("service_id");
			var servicename = self.model.get("servicename");
			if (!!service_id) {
				//selectedItems.push({"id": product_id, "product_name": product_name});
				el.val(JSON.stringify({ "id": service_id, "servicename": servicename }));
			}


			el.ref({
				textField: "servicename",
				dataSource: ServiceSelectView,
			});

			el.off("change.gonrin").on("change.gonrin", function (e) {
				//console.log(e);
				if ((!!e) && (!!e.value)) {
					self.model.set("service_id", e.value.id);
					self.model.set("service_no", e.value.service_no);
					self.model.set("servicename", e.value.servicename);

					self.model.set("list_price", e.value.unit_price);
					self.model.set("discount_percent", 0);
					self.model.set("discount_amount", 0);
					var quantity = self.model.get("quantity") || 1;
					self.model.set("quantity", quantity);
				}
			});

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

			var net_price = (quantity || 0) * (list_price || 0);
			if (!!discount_percent) {
				net_price = net_price - (net_price * discount_percent / 100);
			} else if (!!discount_amount) {
				net_price = net_price - (net_price > discount_amount ? discount_amount : net_price);
			}
			self.model.set("net_price", net_price);

		}
	});

});