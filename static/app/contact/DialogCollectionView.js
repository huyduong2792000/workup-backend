define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/dialog-collection.html'),
		schema = require('json!schema/ContactSchema.json');
	var CustomFilterView = require('app/common/CustomFilterView');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "contact",
		uiControl: {
			orderBy: [
				{ field: "bdate", direction: "asc" }
			],
			fields: [
				{ field: "contact_no", label: "Mã" },
				{ field: "contact_name", label: "Họ & Tên" },
				{ field: "phone", label: "Số điện thoại" },
				{ field: "bmonth", label: "Tháng sinh", cssClass: "text-right" },
				{ field: "bdate", label: "Ngày sinh", cssClass: "text-right" }
			],
			onRowClick: function (event) {
				this.uiControl.selectedItems = event.selectedItems;
			},
			onChangePage: function (event) {
				var self = this;
			},
			onRendered: function () {
				var self = this;
				self.trigger("loaded", self.uiControl.dataSource);
			}
		},
		tools: null,
		render: function () {
			var self = this;
			this.uiControl.selectedItems = [];
			self.applyBindings();
			return this;
		}

	});

});