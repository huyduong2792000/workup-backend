define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/PurchaseOrderSchema.json');
	var WorkstationSelectView = require("app/workstation/SelectView");

	var channels = [
		{ "value": "", "text": "-- Chọn --" },
		{ "value": "hotline", "text": "Hot-line" },
		{ "value": "facebook", "text": "Facebook" },
		{ "value": "zalo", "text": "Zalo" },
		{ "value": "other", "text": "Khác" }
	];

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "purchaseorder",
		uiControl: {
			fields: [
				{
					field: "workstation",
					uicontrol: "ref",
					textField: "name",
					selectionMode: "single",
					dataSource: WorkstationSelectView
				},
				{
					field: "contact_gender",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": "male", "text": "Anh" },
						{ "value": "female", "text": "Chị" },
					],
					value: "male"
				},
				{
					field: "status",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": "new", "text": "Mới" },
						{ "value": "quoted", "text": "Đã báo giá" },
						{ "value": "done", "text": "Hoàn thành" },
						{ "value": "canceled", "text": "Huỷ" }
					]
				},
				{
					field: "channel",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: channels
				}
			]
		},

		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				//progresbar quay quay
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
					},
					error: function () {
						self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
					},
				});
			} else {
				// self.model.set("workstation", self.getApp().currentUser.workstations[0] ? self.getApp().currentUser.workstations.length > 0 : null);
				self.applyBindings();
			}

		},
	});

});