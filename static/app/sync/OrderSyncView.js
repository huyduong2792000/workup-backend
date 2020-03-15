define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/sync-order.html');
	var TemplateHelper = require('app/common/TemplateHelper');

	var schema = {
		"order_no": {
			"type": "string"
		},
		"contact_phone": {
			"type": "string"
		},
		"contact_name": {
			"type": "string"
		},
		"contact_birthday": {
			"type": "datetime"
		},
		"contact_email": {
			"type": "string"
		}
	};

	var FormbarService_API = "http://localhost:8000/formbar/api/get-order"

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "prevordering",
		uiControl: {
			fields: [
			],
		},
		tools: [
			{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary btn-sm",
				label: "Quay lại",
				command: function () {
					var self = this;
					Backbone.history.history.back();
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-primary btn-sm",
				label: "TRANSLATE:SAVE",
				command: function () {
					var self = this;

				}
			},
		],

		render: function () {
			var self = this;
			self.applyBindings();

			self.model.on("change:order_no", function ($event) {
				$.ajax({
					url: self.getApp().serviceURL + "/api/v1/contact/get",
					data: "phone=" + self.model.get("contact_phone"),
					type: "GET",
					success: function (response) {
						if (response) {
							self.model.set("contact_name", response.contact_name);
							self.model.set("contact_birthday", response.contact_birthday);
							self.model.set("contact_email", response.email);
						}
					},
					error: function (err) {
						self.getApp().getRouter().notify({ message: "ERROR: Không tìm được thông tin KH" }, { type: "danger" });
					}
				})
			});

			self.model.on("change:contact_phone", function ($event) {
				$.ajax({
					url: self.getApp().serviceURL + "/api/v1/contact/get",
					data: "phone=" + self.model.get("contact_phone"),
					type: "GET",
					success: function (response) {
						if (response) {
							self.model.set("contact_name", response.contact_name);
							self.model.set("contact_birthday", response.contact_birthday);
							self.model.set("contact_email", response.email);
						}
					},
					error: function (err) {
						self.getApp().getRouter().notify({ message: "ERROR: Không tìm được thông tin KH" }, { type: "danger" });
					}
				})
			});
		},
	});

});