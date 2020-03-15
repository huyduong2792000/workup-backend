define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/SalesOrderSchema.json');
	var Helpers = require('app/common/Helpers');
	var TemplateHelper = require('app/common/TemplateHelper');
	var CustomFilterView = require('app/common/CustomFilterView');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "salesorder",
		uiControl: {
			orderBy: [
				{ field: "order_time", direction: "desc" },
				{ field: "salesorder_no", direction: "desc" },
				{ field: "discount_amount", direction: "desc" }
			],
			fields: [
				{
					field: "salesorder_no", label: "Số hoá đơn", template: function (rowObject) {
						return `<div style="min-width: 118px;">${rowObject.salesorder_no}</div>`;
					}
				},
				{
					field: "contact_name", label: "Tên khách hàng", template: function (rowObject) {
						return `<div style="min-width: 150px;">${rowObject.contact_name ? rowObject.contact_name : ""}</div>`;
					}
				},
				// {
				// 	field: "contact_phone", label: "Số điện thoại", template: function (rowObject) {
				// 		return `<div style="min-width: 133px;">${TemplateHelper.phoneFormat(rowObject.contact_phone ? rowObject.contact_phone : "")}</div>`;
				// 	}
				// },
				{
					field: "amount", label: "Tổng tiền", visible: true, template: function (rowObject) {
						return `<div style="min-width: 133px;">${TemplateHelper.currencyFormat(rowObject.amount, true)}</div>`;
					}
				},
				{
					field: "discount_amount", label: "Chiết khấu", template: function (rowObject) {
						return `<div style="min-width: 120px;">${TemplateHelper.currencyFormat(rowObject.discount_amount + rowObject.discount_other_amount, true)}</div>`;
					}
				},
				{
					field: "order_time", label: "Thời gian", width: "160px", template: function (rowObject) {
						return `<div class="text-center" style="width: 160px;">${Helpers.utcToLocal(rowObject.order_time, "DD/MM/YYYY HH:DD")}</div>`;
					}
				}
			],
			onRowClick: function (event) {
				if (event.rowId) {
					var path = this.collectionName + '/model?id=' + event.rowId;
					this.getApp().getRouter().navigate(path);
				}
			},
			onRendered: function (event) {
				loader.hide();
			}
		},

		initialize: function () {
			loader.show();
		},

		render: function () {
			var self = this;

			var filter = new CustomFilterView({
				el: self.$el.find("#filter"),
				sessionKey: "salesorder_filter"
			});
			filter.render();

			if (!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var filters = {
					"$or": [
						{ "salesorder_no": { "$like": text } },
						{ "contact_name": { "$like": text } },
						{ "contact_phone": { "$like": text } },
						//						{"workstation_name": {"$like": text }},
						{ "promotion_name": { "$like": text } },
						{ "created_by_name": { "$like": text } }
					]
				};
				self.uiControl.filters = filters;
			}
			self.applyBindings();

			filter.on('filterChanged', function (evt) {
				var $col = self.getCollectionElement();
				var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null) {
						var filters = {
							"$or": [
								{ "salesorder_no": { "$like": text } },
								{ "contact_name": { "$like": text } },
								{ "contact_phone": { "$like": text } },
								//								{"workstation_name": {"$like": text }},
								{ "promotion_name": { "$like": text } },
								{ "created_by_name": { "$like": text } }
							]
						};
						$col.data('gonrin').filter(filters);
						//self.uiControl.filters = filters;
					} else {
						self.uiControl.filters = null;
					}
				}
				self.applyBindings();
			});
			return;
		},

	});

});