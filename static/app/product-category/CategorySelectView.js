define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/select.html'),
		schema = require('json!schema/ProductCategorySchema.json');
	var CustomFilterView = require('app/common/CustomFilterView');
	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "productcategory",
		uiControl: {
			orderBy: [
				{ field: "category_name", direction: "asc" },
				{ field: "created_at", direction: "desc" }
			],
			fields: [
				{ field: "category_no", label: "Mã" },
				{ field: "category_name", label: "Tên nhóm" },
				{
					field: "deleted",
					label: " ",
					width: "60px",
					template: function (rowObj) {
						return TemplateHelper.renderStatus(!rowObj.deleted);
					}
				}
			],
			// onRowClick: function (event) {
			// 	this.uiControl.selectedItems = event.selectedItems;
			// },
			onRowClick: function (event) {
                var selectedItems = event.selectedItems.map((item, index) => {
                    return {
                        id: item.id,
                        category_no: item.category_no,
                        category_name: item.category_name
                    }
                });

				this.uiControl.selectedItems = selectedItems;
			}
		},
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
				buttonClass: "btn btn-primary btn-md margin-left-5",
				label: "TRANSLATE:SELECT",
				command: function () {
					this.trigger("onSelected");
					this.close();
				}
			}
		],
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
				sessionKey: "category_dialog_filter"
			});
			filter.render();

			if (!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var textUpper = !!filter.model.get("text") ? filter.model.get("text").trim().toUpperCase() : "";
                var textLower = !!filter.model.get("text") ? filter.model.get("text").trim().toLowerCase() : "";
                var textFirst = !!filter.model.get("text") ? capitalizeFirstLetter(filter.model.get("text").trim()) : "";
				var filters = {
					"$or": [
						{ "category_no": { "$like": text } },
						{ "category_no": { "$like": textUpper } },
						{ "category_no": { "$like": textLower } },
						{ "category_name": { "$like": text } },
						{ "category_name": { "$like": textUpper } },
						{ "category_name": { "$like": textLower } },
						{ "category_name": { "$like": textFirst } }
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
								{ "category_no": { "$like": text } },
								{ "category_no": { "$like": textUpper } },
								{ "category_no": { "$like": textLower } },
								{ "category_name": { "$like": text } },
								{ "category_name": { "$like": textUpper } },
								{ "category_name": { "$like": textLower } },
								{ "category_name": { "$like": textFirst } }
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