define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/AccountSchema.json');


	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "account",
		uiControl: {
			fields: [
				{
					field: "industry",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": "banking", "text": "Ngân hàng" },
						{ "value": "education", "text": "Giáo dục" },
						{ "value": "finance", "text": "Tài chính" },
						{ "value": "healthcare", "text": "Y tế" },
						{ "value": "technology", "text": "Công nghệ" }
					],
				},
				{
					field: "account_type",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": null, "text": "Chọn" },
						{ "value": "customer", "text": "Khách hàng" },
						{ "value": "partner", "text": "Đối tác" },
						{ "value": "reseller", "text": "Đại lý" },
						{ "value": "analyst", "text": "Analyst" },
						{ "value": "competitor", "text": "Đối thủ" },
						{ "value": "intergrator", "text": "intergrator" },
						{ "value": "invester", "text": "Đầu tư" },
						{ "value": "press", "text": "Báo chí" },
						{ "value": "prospect", "text": "Prospect" },
						{ "value": "other", "text": "Khác" },
					],
				},
				{
					field: "rating",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": null, "text": "Chọn" },
						{ "value": "acquired", "text": "Đã mua" },
						{ "value": "active", "text": "Tích cực" },
						{ "value": "market_failed", "text": "Market Failed" },
						{ "value": "project_cancelled", "text": "project_cancelled" },
						{ "value": "shutdown", "text": "Shutdown" },
					],
				},
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
				self.applyBindings();
			}
		},
	});

});