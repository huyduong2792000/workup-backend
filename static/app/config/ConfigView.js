define(function (require) {

	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin'),
		template = require('text!./tpl/config.html'),
		schema = require('json!schema/ConfigurationSchema.json');

	var UserConfigView = require("app/config/UserConfigView");
	var FeatureConfigView = require("app/config/FeatureConfigView");
	var SecureConfigView = require("app/config/SecureConfigView");
	var IntegrateConfigView = require("app/config/IntegrateConfigView");

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		currentTab: "",
		userConfigData: null,
		originalAppConfigData: {},
		appConfigData: null,
		appConfig: null,
		urlPrefix: "/api/v1/",
		collectionName: "configuration",
		render: function () {
			var self = this;
			self.originalAppConfigData = {};
			this.applyBindings();
			this.loadData();
			$('[data-toggle="tooltip"]').tooltip();
		},

		loadData: function () {
			loader.show();
			const self = this;
			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/configuration",
				type: "GET",
				success: function (response) {
					loader.hide();
					if (response && response.objects.length > 0) {
						self.model.set(response.objects[0]);
						self.originalAppConfigData = clone(response.objects[0].data);
						self.appConfigData = clone(response.objects[0].data);
					}
					self.eventRegister();
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					loader.hide();
					if (XMLHttpRequest.status == 520) {
						// self.bindData(self.loadDefaultConfig());
					} else {
						self.getApp().notify({ message: "Hệ thống lỗi, thử lại sau." }, { type: "danger" });
					}
				}
			});
		},

		eventRegister: function () {
			const self = this;

			self.$el.find("a").each(function () {
				$(this).unbind("click").bind("click", function (event) {
					self.currentTab = $(this).attr("href");
					if ($(this).attr("href") == "#user_config") {
						var userConfig = self.getApp().currentUser.config_data;
						var userConfig = new UserConfigView({
							el: self.$el.find("#user_config"),
							viewData: userConfig
						});
						userConfig.render();
						userConfig.on("change", function (userConfigData) {
							self.userConfigData = userConfigData;
						});
					} else if ($(this).attr("href") == "#features") {
						console.log("features");
						var featureConfig = new FeatureConfigView({
							el: self.$el.find("#features"),
							viewData: self.appConfigData
						});
						featureConfig.render();
						featureConfig.on("change", function (featureConfigData) {
							console.log("featureConfigData ", featureConfigData);
							self.appConfigData = featureConfigData;
						});
					} else if ($(this).attr("href") == "#security") {
						var secureConfig = new SecureConfigView({
							el: self.$el.find("#security"),
							viewData: self.appConfigData
						});
						secureConfig.render();
						secureConfig.on("change", function (secureConfigData) {
							console.log("secureConfigData ", secureConfigData);
							self.appConfigData = secureConfigData;
						});
					} else if ($(this).attr("href") == "#integrate") {
						var integrateConfig = new IntegrateConfigView({
							el: self.$el.find("#integrate"),
							viewData: self.appConfigData
						});
						integrateConfig.render();
						integrateConfig.on("change", function (integrateConfigData) {
							console.log("integrateConfigData ", integrateConfigData);
							self.appConfigData = integrateConfigData;
						});
					}
				});
			});
			self.$el.find("a[href='#user_config']").click();

			self.$el.find("#save").unbind("click").bind("click", function (event) {
				if (self.currentTab == "#user_config") {
					// SAVE USER CONFIG
					console.log("currentUser ", self.getApp().currentUser);
					var api = self.getApp().serviceURL + "/api/v1/user/attrs";
					var user = {
						id: self.getApp().currentUser.id,
						config_data: self.userConfigData
					}
					$.ajax({
						url: api,
						data: JSON.stringify(user),
						type: "PUT",
						success: function (response) {
							self.getApp().notify({ message: "Đã lưu" }, { type: "success" });
							self.getApp().currentUser.config_data = self.userConfigData;
							self.getApp().renderTheme(self.getApp().currentUser.config_data, true);
						},
						error: function (xhr, textStatus, errorThrown) {
							self.getApp().notify({ message: xhr.responseJSON ? xhr.responseJSON.error_message : "Save Error" }, { type: "danger" });
						}
					})
				} else {
					// OVERRIDE CONTACT CODE PREFIX WHEN INTERGRATING IPOS
					// if (( (!self.originalAppConfigData.ipos || !self.originalAppConfigData.ipos.coupon_prefix) && (self.appConfigData.ipos && self.appConfigData.ipos.coupon_prefix))
					// 	|| ((self.appConfigData.ipos && self.appConfigData.ipos.coupon_prefix) && self.originalAppConfigData.ipos.coupon_prefix != self.appConfigData.ipos.coupon_prefix)) {
					// 	self.appConfigData.contact_code_prefix = self.appConfigData.ipos.coupon_prefix;
					// } else if ((!self.originalAppConfigData.contact_code_prefix && self.appConfigData.contact_code_prefix)
					// 	|| (self.originalAppConfigData.contact_code_prefix && !self.appConfigData.contact_code_prefix)
					// 	|| (self.originalAppConfigData.contact_code_prefix != self.appConfigData.contact_code_prefix)) {
						
					// 	if (self.appConfigData.ipos.coupon_prefix) {
					// 		self.appConfigData.ipos.coupon_prefix = self.appConfigData.contact_code_prefix;
					// 	}
					// }

					// SAVE APP CONFIG
					self.model.set("data", self.appConfigData);

					self.model.save(null, {
						success: function (model, respose, options) {
							self.getApp().notify({ message: "Đã lưu." }, { type: "success" });
						},
						error: function (model, xhr, options) {
							self.getApp().notify({ message: 'Lỗi, vui lòng thử lại sau.' }, { type: "danger" });
						}
					});
				}
			});

		}

	});

});