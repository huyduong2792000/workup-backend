define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/select.html'),
		schema = require('json!schema/ProductSchema.json');
	var CustomFilterView = require('app/common/CustomFilterView');
	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "product",
		textField: "product_name",
		tools: [
			{
				name: "select",
				type: "button",
				buttonClass: "btn-primary btn-sm",
				label: "TRANSLATE:SELECT",
				command: function () {
					this.trigger("onSelected");
					this.close();
				}
			}
		],
		uiControl: {
			fields: [
				{ field: "product_name", label: "Tên sản phẩm" },
				{ field: "product_no", label: "Mã sản phẩm" },
				{ field: "list_price", label: "Đơn giá" },
				{
					field: "deleted",
					label: " ",
					width: "60px",
					template: function (rowObject) {
						return TemplateHelper.renderStatus(!rowObject.deleted);
					}
				}
			],
			onRowClick: function (event) {
				var select = [];
				for (var i = 0; i < event.selectedItems.length; i++) {
					var obj = {
						id: event.selectedItems[i].id,
						product_exid: event.selectedItems[i].product_exid,
						product_no: event.selectedItems[i].product_no,
						product_name: event.selectedItems[i].product_name
					}
					select.push(obj);
				}
				this.uiControl.selectedItems = select;
			}
		},
    	/**
    	 * 
    	 */
		render: function () {
			var self = this;

			var filter = new CustomFilterView({
				el: self.$el.find("#filter"),
				sessionKey: "product_dialog_filter"
			});
			filter.render();

			if (!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var filters = {
					"$or": [
						{ "product_no": { "$like": text } },
						{ "product_name": { "$like": text } },
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
								{ "product_no": { "$like": text } },
								{ "product_name": { "$like": text } },
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