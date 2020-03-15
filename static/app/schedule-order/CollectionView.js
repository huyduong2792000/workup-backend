define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/PurchaseOrderSchema.json');
	var TemplateHelper = require('app/common/TemplateHelper');
	var Helpers = require('app/common/Helpers');
	var CustomFilterView = require('app/common/CustomFilterView');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "purchaseorder",
		uiControl: {
			orderBy: [
				{ field: "created_at", direction: "desc" }
			],
			fields: [
				{
					field: "created_at", label: "Thời gian tạo", template: function (rowObject) {
						return `<div style="min-width: 100px;">${Helpers.setDatetime(rowObject.created_at)}</div>`;
					}
				},
				{
					field: "contact_name", label: "Tên khách hàng", template: function (rowObject) {
						return `<div style="min-width: 135px;">${rowObject.contact_name}</div>`;
					}
				},
				{
					field: "contact_phone", label: "Số điện thoại", template: function (rowObject) {
						return `<div style="min-width: 133px;">${TemplateHelper.phoneFormat(rowObject.contact_phone ? rowObject.contact_phone : "")}</div>`;
					}
				},
				{
					field: "order_time", label: "Thời gian Order", template: function (rowObject) {
						return `<div style="min-width: 100px;">${Helpers.setDatetime(rowObject.order_time)}</div>`;
					}
				},
				{ field: "people_number", label: "Số người" },
				{ field: "status", label: "Trạng thái", width: "105px" }
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

			var filter = new CustomFilterView({
				el: self.$el.find("#filter"),
				sessionKey: "purchaseorder_filter"
			});
			filter.render();

			if (!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				// check search text is numberic
				var people = !!text && Number.isInteger(parseInt(text)) ? parseInt(text) : null;
				var filters = {
					"$or": [
						{ "contact_name": { "$like": text } },
						{ "contact_phone": { "$like": text } },
						{ "table_id": { "$like": text } },
						{ "order_time": { "$like": text } }
					]
				};
				if (people) {
					filters['$or'].push({ "people_number": { "$eq": people } });
				}
				self.uiControl.filters = filters;
			}
			self.applyBindings();

			filter.on('filterChanged', function (evt) {
				var $col = self.getCollectionElement();
				var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null) {
						// check search text is numberic
						var people = !!text && Number.isInteger(parseInt(text)) ? parseInt(text) : null;
						var filters = {
							"$or": [
								{ "contact_name": { "$like": text } },
								{ "contact_phone": { "$like": text } },
								{ "table_id": { "$like": text } },
								{ "order_time": { "$like": text } }
							]
						};

						if (people) {
							filters['$or'].push({ "people_number": { "$eq": people } });
						}
						$col.data('gonrin').filter(filters);
						//self.uiControl.filters = filters;
					} else {
						self.uiControl.filters = null;
					}
				}
				self.applyBindings();
			});
			return;
		}
	});

});