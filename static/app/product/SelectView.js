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
				name: "close",
				type: "button",
				buttonClass: "btn btn-danger btn-md margin-left-5",
				label: "Close",
				command: function () {
					this.close();
				}
			},
			{
				name: "select",
				type: "button",
				buttonClass: "btn-primary btn-md margin-left-5",
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
				this.uiControl.selectedItems = event.selectedItems;
			}
		},
    	/**
    	 * 
    	 */
		render: function () {
			var self = this;
			function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
			var filter = new CustomFilterView({
				el: self.$el.find("#filter"),
				sessionKey: "product_dialog_filter"
			});
			filter.render();

			var filters = {
				"$and": [
					{ "deleted": { "$eq": false } }
				]
			};

			if (!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var textUpper = !!filter.model.get("text") ? filter.model.get("text").trim().toUpperCase() : "";
                var textLower = !!filter.model.get("text") ? filter.model.get("text").trim().toLowerCase() : "";
                var textFirst = !!filter.model.get("text") ? capitalizeFirstLetter(filter.model.get("text").trim()) : "";
				filters = {
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
			} else {
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