define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/ProductCategorySchema.json');
	var TemplateHelper = require('app/common/TemplateHelper');
	var CustomFilterView = require('app/common/CustomFilterView');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "productcategory",
		uiControl: {
			orderBy: [
				{ field: "deleted", direction: "asc" },
				{ field: "category_no", direction: "asc" },
				{ field: "category_name", direction: "asc" },
				{ field: "created_at", direction: "desc" }
			],
			fields: [
				{ field: "category_no", label: "Mã" },
				{ field: "category_name", label: "Tên Nhóm" },
				{
					field: "deleted",
					label: " ",
					template: function (rowObj) {
						return TemplateHelper.renderStatus(!rowObj.deleted);
					}
				}
			],
			onRowClick: function ($event) {
				if ($event.rowId) {
					var path = this.collectionName + '/model?id=' + $event.rowId;
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
				sessionKey: "category_filter"
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