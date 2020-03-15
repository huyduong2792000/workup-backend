define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');
	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/CouponStorageSchema.json');
	var Helpers = require('app/common/Helpers');
	var TemplateHelper = require('app/common/TemplateHelper');
	var CustomFilterView = require('app/common/CustomFilterView');
	var ReleaseVoucherDialogView = require("app/coupon-storage/ReleaseVoucherDialogView");

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "couponstorage",
		params: {
			"$and": [
				{ "deleted": { "$eq": false } },
				{
					"$or": [
						{ "status": { "$eq": "active" } },
						{ "status": { "$eq": "notified" } },
						{ "status": { "$eq": "used" } },
						{ "status": { "$eq": "locked" } },
						{ "status": { "$eq": "log" } },
						{ "status": { "$eq": "scanning" } }
					]
				}
			]
		},
		tools: [
			{
				name: "default",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "create",
						type: "button",
						buttonClass: "btn-coal btn-sm",
						label: "Tạo 1 mã voucher",
						command: function () {
							var self = this;
							self.getApp().getRouter().navigate("couponstorage/model");
						}
					},
					{
						name: "release-voucher",
						type: "button",
						buttonClass: "btn-orange btn-sm",
						label: "Phát hành nhiều voucher",
						command: function () {
							var self = this;
							var releaseVoucherView = new ReleaseVoucherDialogView();
							releaseVoucherView.dialog();

							releaseVoucherView.on("close", function (data) {
								if (data) {
									releaseVoucherView.close();
									self.getApp().notify({ message: "Thành công" }, { type: "success" });
									self.render();
								}
							})
						}
					},

				]
			},
		],
		uiControl: {
			orderBy: [
				{ field: "deleted", direction: "desc" },
				{ field: "created_at", direction: "desc" },
				{ field: "used_at", direction: "desc" }
			],
			fields: [
				{
					field: "coupon_code", label: "Mã Coupon", width: "130px", template: function (rowData) {
						return rowData.coupon_code ? rowData.coupon_code : '';
					}
				},
				{
					field: "promotion_name", label: "Tên khuyến mại", template: function (rowData) {
						return `<a class="tbl-link" href="#couponstorage/model?id=${rowData.id}"><div style="min-width: 350px; min-height: 34px;">${rowData.promotion_name ? rowData.promotion_name : ""}</div></a>`;
					}
				},
				{
					field: "contact_name", label: "Tên Khách hàng", template: function (rowData) {
						return `<div style="min-width: 170px">${rowData.contact_name ? rowData.contact_name : ""}</div>`;
					}
				},
				{
					field: "used_at", label: "Thời điểm sử dụng", template: function (rowObj) {
						return `<div style="min-width: 150px">${rowObj.used_at ? Helpers.setDatetime(rowObj.used_at, { format: "DD/MM/YYYY HH:mm" }) : ''}</div>`;
					}
				},
				{
					field: "coupon_expire_at", label: "Ngày hết hạn", template: function (rowObj) {
						return `<div style="min-width: 130px">${Helpers.setDatetime(rowObj.coupon_expire_at, { format: "DD/MM/YYYY HH:mm" })}</div>`;
					}
				},
				{
					field: "deleted", label: " ", width: "60px", template: function (rowObj) {
						var html = '';
						if (rowObj && rowObj.deleted) {
							html = '<div class="text-center text-danger"><i class="fas fa-times-circle"></i></div>';
						} else {
							if (rowObj && rowObj.status == 'log') {
								html = '<div class="text-center text-secondary"><i class="fas fa-history"></i></div>';
							} else if (rowObj && rowObj.status == 'scanning') {
								html = '<div class="text-center text-warning"><i class="fas fa-spinner"></i></div>';
							} else if (rowObj && rowObj.status == 'locked') {
								html = '<div class="text-center text-danger"><i class="fas fa-lock"></i></div>';
							} else if (rowObj && rowObj.status == 'used') {
								html = '<div class="text-center text-secondary"><i class="fas fa-power-off"></i></div>';
							} else if (rowObj && rowObj.status == 'notified') {
								html = '<div class="text-center text-success"><i class="fas fa-bullhorn"></i></div>';
							} else if (rowObj && rowObj.status == 'active') {
								html = '<div class="text-center text-success"><i class="fas fa-check-circle"></i></div>';
							}
						}
						return html;
					}
				}
			],
			onRowClick: function (event) {
				if (event.rowId) {
					// var path = this.collectionName + '/model?id=' + event.rowId;
					// this.getApp().getRouter().navigate(path);
					Clipboard.copy(event.rowData.coupon_code);
					this.getApp().notify({ message: "Copied '" + event.rowData.coupon_code + "'" }, { type: "success" });
				}
				return;
			},
			onRendered: function (event) {
				loader.hide();
			},
			refresh: true
		},

		initialize: function () {
			loader.show();
		},

		render: function () {
			const self = this;
			function capitalizeFirstLetter(string) {
				return string.charAt(0).toUpperCase() + string.slice(1);
			}
			var filters = {};
			var filter = new CustomFilterView({
				el: self.$el.find("#filter"),
				sessionKey: "coupon_filter"
			});
			filter.render();

			if (!filter.isEmptyFilter()) {
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var textUpper = !!filter.model.get("text") ? filter.model.get("text").trim().toUpperCase() : "";
				var textLower = !!filter.model.get("text") ? filter.model.get("text").trim().toLowerCase() : "";
				var textFirst = !!filter.model.get("text") ? capitalizeFirstLetter(filter.model.get("text").trim()) : "";
				filters = clone(self.params);
				filters['$and'].push({
					"$or": [
						{ "coupon_code": { "$like": textUpper } },
						{ "contact_phone": { "$like": text } },
						{ "contact_no": { "$like": textUpper } },
						{ "contact_name": { "$like": textFirst } },
						{ "contact_name": { "$like": textLower } },
						{ "contact_name": { "$like": textUpper } },
						{ "promotion_name": { "$like": text } },
						{ "promotion_name": { "$like": textUpper } },
						{ "promotion_name": { "$like": textLower } },
						{ "promotion_name": { "$like": textFirst } }
					]
				});
				self.uiControl.filters = filters;
			} else {
				var filters = clone(this.params);
				self.uiControl.filters = filters;
				self.applyBindings();
			}

			filter.on('filterChanged', function (evt) {
				var $col = self.getCollectionElement();
				var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var textUpper = !!filter.model.get("text") ? filter.model.get("text").trim().toUpperCase() : "";
				var textLower = !!filter.model.get("text") ? filter.model.get("text").trim().toLowerCase() : "";
				var textFirst = !!filter.model.get("text") ? capitalizeFirstLetter(filter.model.get("text").trim()) : "";
				if ($col) {
					if (text) {
						filters = clone(self.params);
						filters['$and'].push({
							"$or": [
								{ "coupon_code": { "$like": textUpper } },
								{ "contact_phone": { "$like": text } },
								{ "contact_no": { "$like": textUpper } },
								{ "contact_name": { "$like": textFirst } },
								{ "contact_name": { "$like": textLower } },
								{ "contact_name": { "$like": textUpper } },
								{ "promotion_name": { "$like": text } },
								{ "promotion_name": { "$like": textUpper } },
								{ "promotion_name": { "$like": textLower } },
								{ "promotion_name": { "$like": textFirst } }
							]
						});
						$col.data('gonrin').filter(filters);
					} else {
						$col.data('gonrin').filter(clone(self.params));
					}
				}
				self.applyBindings();
			});
			return this;
		}
	});

});