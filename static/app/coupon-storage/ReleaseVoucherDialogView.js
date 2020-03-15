define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');
	var template = require('text!./tpl/release-voucher-dialog.html');
	var Helpers = require('app/common/Helpers');
	var WorkstationSelectView = require("app/workstation/SelectView");
	var PromotionSelectView = require("app/promotion/SelectView");

	var schema = {
		"promotion_id": {
			"type": "string"
		},
		"use_times": {
			"type": "number",
			"default": 1
		},
		"coupon_prefix": {
			"type": "string"
		},
		"coupon_type": {
			"type": "string"
		},
		"value": {
			"type": "number",
			"default": 0
		},
		"without_promotion_condition": {
			"type": "boolean",
			"default": false
		},
		"expired_time": {
			"type": "number"
		},
		"limit": {
			"type": "number",
			"default": 0
		},
		"workstation_id": {
			"type": "number"
		}
	};
	var conponType = [
		{ text: "Mã coupon", value: null },
		{ text: "Mã voucher", value: 'value' }
	];

	return Gonrin.ModelDialogView.extend({
		template: template,
		modelSchema: schema,
		viewData: null,
		data: null,
		urlPrefix: "/api/v1/",
		collectionName: "couponstorage",
		uiControl: {
			fields: [
				{
					field: "promotion_id",
					uicontrol: "ref",
					textField: "promotion_name",
					valueField: "id",
					selectionMode: "single",
					dataSource: PromotionSelectView
				},
				{
					field: "coupon_type",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: conponType
				},
				{
					field: "workstation_id",
					uicontrol: "ref",
					textField: "workstation_name",
					valueField: "id",
					selectionMode: "single",
					dataSource: WorkstationSelectView
				}
			]
		},
		tools: null,

		render: function () {
			loader.show();
			var self = this;
			this.applyBindings();
			this.registerEvents();

			var timer = setTimeout(() => {
				self.switchUI();
				clearTimeout(timer);
			}, 150);
		},

		registerEvents: function() {
			const self = this;
			self.model.on("change:coupon_type", (event) => {
				self.model.set('value', 0);
				if (self.model.get('coupon_type') !== "value") {
					self.$el.find("#coupon_value_space").fadeOut();
				} else {
					self.$el.find("#coupon_value_space").fadeIn();
				}
			});

			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/promotion/get",
				type: "GET",
				success: function (response) {
					loader.hide();
					self.$el.find("#promotion").combobox({
						textField: "promotion_name",
						valueField: "promotion_id",
						dataSource: response
					});
				},
				error: function () {
					loader.hide();
				}
			});

			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/workstation/get_all",
				type: "GET",
				success: function (response) {
					loader.hide();
					self.$el.find("#workstation").combobox({
						textField: "workstation_name",
						valueField: "id",
						dataSource: [{
							"id": null,
							"workstation_name": "Tất cả hệ thống"
						}].concat(response)
					});
				},
				error: function () {
					loader.hide();
				}
			});

			self.$el.find("#expired_time").combobox({
				textField: "text",
				valueField: "value",
				dataSource: [
					{
						"value": "1d",
						"text": "Hết ngày mai"
					},
					{
						"value": "1w",
						"text": "Sau 1 tuần"
					},
					{
						"value": "2w",
						"text": "Sau 2 tuần"
					},
					{
						"value": "3w",
						"text": "Sau 3 tuần"
					},
					{
						"value": "1m",
						"text": "Sau 1 tháng"
					},
					{
						"value": "2w",
						"text": "Sau 2 tháng"
					},
					{
						"value": "3w",
						"text": "Sau 3 tháng"
					},
					{
						"value": "6w",
						"text": "Sau 6 tháng"
					},
					{
						"value": "1y",
						"text": "Hết năm nay"
					},
					{
						"value": "custom",
						"text": "Khác"
					}
				]
			});

			self.$el.find("#expired_time").on("change.gonrin", function (event) {
				if (event.target.value == "custom") {
					self.$el.find("#expired_time_picker_space").fadeIn();
					self.model.set("expired_time", null);
				} else {
					var value = event.target.value;
					self.$el.find("#expired_time_picker_space").fadeOut();
					var endOfToday = new Date();
					endOfToday.setHours(23, 59, 59, 999);
					var endOfTodayTimestamp = Helpers.localToTimestamp(endOfToday);
					var deltaTime = null;
					switch(value.charAt(1)) {
						case "d":
							deltaTime = parseInt(value.charAt(0)) * 86400000;
							break;
						case "w":
							deltaTime = parseInt(value.charAt(0)) * (86400000 * 7);
							break;
						case "m":
							deltaTime = parseInt(value.charAt(0)) * (86400000 * 30);
							break;
						case "y":
							deltaTime = parseInt(value.charAt(0)) * (86400000 * 365);
							break;
						default:
							break;
					}

					self.model.set("expired_time", endOfTodayTimestamp + deltaTime);
				}
			});

			self.$el.find('#expired_time_picker').datetimepicker({
				defaultDate: self.model.get("expired_time") ? self.model.get("expired_time") : null,
				format: "DD/MM/YYYY HH:mm",
				icons: {
					time: "fa fa-clock"
				}
			});

			self.$el.find('#expired_time_picker').on('change.datetimepicker', function (e) {
				if (e && e.date) {
					self.model.set("expired_time", e.date.local().unix() * 1000);
				} else {
					self.model.set("expired_time", null);
				}
			});

			self.$el.find("#promotion").on("change.gonrin", function (event) {
				self.model.set("promotion_id", event.target.value);
			});
			self.$el.find("#workstation").on("change.gonrin", function (event) {
				self.model.set("workstation_id", event.target.value);
			});

			self.$el.find("#btn_generate").unbind("click").bind("click", function (event) {
				if (!self.validate()) {
					return;
				}
				$.alert({
					title: 'Xác nhận',
					content: "Có chắc chắn tạo " + self.model.get('limit', 0) + " mã voucher?",
					buttons: {
						"Cancel": {
							btnClass: 'btn-danger',
							action: function () {
								return;
							}
						},
						"OK": {
							btnClass: 'btn-coal',
							action: function () {
								var data = self.model.toJSON();
								loader.show("Chờ giây lát...");
								$.ajax({
									url: self.getApp().serviceURL + "/api/v1/voucher/generate",
									data: JSON.stringify(data),
									type: "POST",
									success: function (response) {
										loader.hide();
										self.trigger("close", { "status": 200 });
									},
									error: function () {
										loader.hide();
									}
								});
							}
						}
					}
				});
			});

			self.$el.find("#btn_cancel").unbind("click").bind("click", () => {
				self.model.set(null);
				self.close();
			});
		},

		switchUI: function () {
			const self = this;
			self.$el.find(".switch input[id='without_condition_switch']").unbind("click").bind("click", function ($event) {
				if ($(this).is(":checked")) {
					self.model.set("without_promotion_condition", true);
				} else {
					self.model.set("without_promotion_condition", false);
				}
			});

			if (self.model.get("without_promotion_condition") == true) {
				self.$el.find(".switch input[id='without_condition_switch']").trigger("click");
			}
		},

		validate: function() {
			const self = this;

			if (!parseInt(self.model.get('limit')) || parseInt(self.model.get('limit')) <= 0) {
				self.getApp().notify({message: "Nhập số lượng voucher muốn phát hành"}, {type: "danger"});
				return false;
			}

			if (!self.model.get('promotion_id')) {
				self.getApp().notify({message: "Chọn chương trình khuyến mãi"}, {type: "danger"});
				return false;
			}

			if (!self.model.get('expired_time')) {
				self.getApp().notify({message: "Chọn thời gian hết hạn mã voucher"}, {type: "danger"});
				return false;
			}

			if (self.model.get('coupon_prefix') && self.model.get('coupon_prefix').length > 4) {
				self.getApp().notify({message: "Quá độ dài quy định của mã bắt đầu"}, {type: "danger"});
				return false;
			}
			return true;
		}
	});
});