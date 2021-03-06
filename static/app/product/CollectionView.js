define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/ProductSchema.json');
	var TemplateHelper = require('app/common/TemplateHelper');
	var CustomFilterView = require('app/common/CustomFilterView');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "product",
		uiControl: {
			orderBy: [
				{ field: "deleted", direction: "asc" },
				{ field: "product_no", direction: "asc" }
			],
			fields: [
				{ field: "product_no", label: "Mã" },
				{ field: "product_exid", label: "Mã tích hợp" },
				{
					field: "product_name", label: "Tên sản phẩm", template: function (rowObject) {
						return `<div style="min-width: 140px;">${rowObject.product_name}</div>`;
					}
				},
				{
					field: "categories", label: "Loại", template: function (rowObject) {
						if (rowObject.categories.length) {
							var res = "";
							rowObject.categories.forEach(function (item, idx) {
								if (idx < rowObject.categories.length - 1) {
									res += item.category_name + ", ";
								} else {
									res += item.category_name;
								}
							});
							return `<div style="min-width: 150px;">${res}</div>`;
						}
						return `<div style="min-width: 150px;"></div>`;
					}
				},
				{
					field: "list_price", label: "Đơn giá", template: function (rowObj) {
						return `<div style="min-width: 110px;">${TemplateHelper.currencyFormat(rowObj.list_price, true)}</div>`;
					}
				},
				{
					field: "deleted", label: " ", template: function (rowObj) {
						return TemplateHelper.renderStatus(!rowObj.deleted);
					}
				}
			],
			onRowClick: function (event) {
				if (event.rowId) {
					var path = this.collectionName + '/model?id=' + event.rowId;
					this.getApp().getRouter().navigate(path);
				}
			},

			onRendered: function() {
				loader.hide();
			}

		},

		initialize: function() {
			loader.show();
		},

		render: function () {
			var self = this;
			function capitalizeFirstLetter(string) {
				return string.charAt(0).toUpperCase() + string.slice(1);
			}
			var filter = new CustomFilterView({
				el: self.$el.find("#filter"),
				sessionKey: "product_filter"
			});
			filter.render();

			if (!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var textUpper = !!filter.model.get("text") ? filter.model.get("text").trim().toUpperCase() : "";
				var textLower = !!filter.model.get("text") ? filter.model.get("text").trim().toLowerCase() : "";
				var textFirst = !!filter.model.get("text") ? capitalizeFirstLetter(filter.model.get("text").trim()) : "";
				var filters = {
					"$or": [
						{ "product_no": { "$like": text } },
						{ "product_no": { "$like": textUpper } },
						{ "product_no": { "$like": textLower } },
						{ "product_no": { "$like": textFirst } },
						{ "product_name": { "$like": text } },
						{ "product_name": { "$like": textUpper } },
						{ "product_name": { "$like": textLower } },
						{ "product_name": { "$like": textFirst } }
					]
				};
				self.uiControl.filters = filters;
			}
			self.applyBindings();

			filter.on('filterChanged', function (evt) {
				var $col = self.getCollectionElement();
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var textUpper = !!filter.model.get("text") ? filter.model.get("text").trim().toUpperCase() : "";
				var textLower = !!filter.model.get("text") ? filter.model.get("text").trim().toLowerCase() : "";
				var textFirst = !!filter.model.get("text") ? capitalizeFirstLetter(filter.model.get("text").trim()) : "";
				if ($col) {
					if (text !== null) {
						var filters = {
							"$or": [
								{ "product_no": { "$like": text } },
								{ "product_no": { "$like": textUpper } },
								{ "product_no": { "$like": textLower } },
								{ "product_no": { "$like": textFirst } },
								{ "product_name": { "$like": text } },
								{ "product_name": { "$like": textUpper } },
								{ "product_name": { "$like": textLower } },
								{ "product_name": { "$like": textFirst } }
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

			return this;
		}
	});

});