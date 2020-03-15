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
				{ field: "category_name", label: "Tên nhóm" }
			],
			onRowClick: function (event) {
				var select = [];
				for (var i = 0; i < event.selectedItems.length; i++) {
					var obj = {
						id: event.selectedItems[i].id,
						category_name: event.selectedItems[i].category_name,
					}
					select.push(obj);
				}
				this.uiControl.selectedItems = select;
				//this.uiControl.selectedItems = event.selectedItems;
			}
		},
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
    	/**
    	 * 
    	 */
		render: function () {
			var self = this;
			var filter = new CustomFilterView({
				el: self.$el.find("#filter"),
				sessionKey: "category_dialog_filter"
			});
			filter.render();

			if (!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var filters = {
					"$or": [
						{ "category_name": { "$like": text } }
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
								{ "category_name": { "$like": text } }
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