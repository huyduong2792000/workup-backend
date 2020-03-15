define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/AccountSchema.json');

	var Helpers = require('app/common/Helpers');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "account",
		uiControl: {
			orderBy: [{ field: "created_at", direction: "desc" }],
			fields: [
				{ field: "account_no", label: "Mã" },
				{ field: "accountname", label: "Tên công ty" },
				{ field: "phone", label: "Điện thoại" },
				{
					field: "address",
					label: "Địa chỉ",
					template: function (obj) {
						var address = "";
						address = address + (obj.bill_address_street !== null ? obj.bill_address_street + ", " : "");
						address = address + (obj.bill_address_city !== null ? obj.bill_address_city + ", " : "");
						address = address + (obj.bill_address_country !== null ? obj.bill_address_country : "");
						return address;
					}
				}, // địa chỉ là chuỗi địa chỉ chi tiết - quận/huyện - tỉnh/tp
				{
					field: "created_at", label: "Ngày tạo", template: function (rowObj) {
						return Helpers.setDatetime(rowObj.created_at);
					}
				}
			],
			onRowClick: function (event) {
				if (event.rowId) {
					var path = this.collectionName + '/model?id=' + event.rowId;
					this.getApp().getRouter().navigate(path);
				}
			}
		},

		render: function () {
			this.applyBindings();
			return this;
		},

	});

});