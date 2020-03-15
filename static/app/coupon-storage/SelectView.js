define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/select.html'),
		schema = require('json!schema/CouponStorageSchema.json');

	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "couponstorage",
		textField: "coupon_code",
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
			},
		],
		uiControl: {
			fields: [
				{ field: "coupon_code", label: "Mã Coupon" },
			],
			onRowClick: function (event) {
				this.uiControl.selectedItems = event.selectedItems;
			},
		},
		render: function () {
			this.applyBindings();
		}

	});

});