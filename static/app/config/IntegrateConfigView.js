	define(function (require) {

	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin'),
		template = require('text!./tpl/integrate-config.html');
	var Helper = require('app/common/Helpers');
	
	var integrateConfigSchema = {
		"chatbot": {
			"type": "dict"
		},
		"uppos": {
			"type": "dict"
		},
		"ipos": {
			"type": "dict"
		},
		"stringee": {
			"type": "dict"
		},
		"zalo": {
			"type": "dict"
		}
	};

	return Gonrin.ModelView.extend({
		template: '',
		modelSchema: integrateConfigSchema,
		urlPrefix: "/api/v1/",
		collectionName: "config",
		selectedWorkstationIPOS: null,

		render: function () {
			var self = this;
			var translatedTemplate = gonrin.template(template)({
				static_url: self.getApp().staticURL
			});
			self.$el.html(translatedTemplate);

            if (self.viewData) {
                self.model.set(self.viewData);
            }
            this.applyBindings();
            this.eventRegister()
			this.switchUIRegister();
	
			if (this.model.get('ipos') && this.model.get('ipos').tenant && this.model.get('ipos').access_token) {
				$.ajax({
					url: self.getApp().serviceURL + "/api/v1/ipos/get_workstation_list",
					type: "GET",
					success: function(response) {
						var dataSource = response.map((workstation, index) => {
							return {
								value: workstation.Id,
								text: workstation.Pos_Name
							};
						});
						
						self.$el.find("#workstations").combobox({
							textField: "text",
							valueField: "value",
							dataSource: [{
								text: "Tất cả",
								value: "all"
							}].concat(dataSource),
							value: "all"
						});
						self.$el.find("#workstations").on("change.gonrin", function (event) {
							self.selectedWorkstationIPOS = event.target.value;
						});
					},
					error: function(xhr) {}
				});
			} else {
				this.$el.find("#workstations").combobox({
					textField: "text",
					valueField: "value",
					dataSource: [{
						text: "Tất cả",
						value: "all"
					}].concat([]),
					value: "all"
				});
			}

			$('[data-toggle="tooltip"]').tooltip();
        },

        eventRegister: function() {
			const self = this;
			self.model.on("change", function (event) {
				self.trigger("change", self.model.toJSON());
			});

			self.$el.find("input[name='broadcash_api']").unbind("change").bind("change", function(event) {
				var chatbot = self.model.get("chatbot") ? self.model.get("chatbot") : {};
				chatbot.broadcash_api = event.target.value;
				self.model.set("chatbot", chatbot);
			});
			// SET VALUE
			var chatbot = self.model.get("chatbot");
			if (chatbot && chatbot.broadcash_api) {
				self.$el.find("input[name='broadcash_api']").val(chatbot.broadcash_api);
			}

			self.$el.find("input[name='broadcash_token']").unbind("change").bind("change", function(event) {
				var chatbot = self.model.get("chatbot") ? self.model.get("chatbot") : {};
				chatbot.broadcash_token = event.target.value;
				self.model.set("chatbot", chatbot);
			});

			// SET VALUE 
			var chatbot = self.model.get("chatbot");
			if (chatbot && chatbot.broadcash_token) {
				self.$el.find("input[name='broadcash_token']").val(chatbot.broadcash_token);
			}
			
			// UP-POS START SETTING VALUES
			var uppos = self.model.get("uppos");
			if (uppos && uppos.workstation_api) {
				self.$el.find("input[name='workstation_api']").val(uppos.workstation_api);
			} else {
				if (!uppos) {
					uppos = {};
				}
				uppos.workstation_api = "https://upstart.vn/couchservice/pos/api/get-workstations";
				self.model.set("uppos", uppos);
				self.$el.find("input[name='workstation_api']").val(uppos.workstation_api);
			}

			self.$el.find("input[name='workstation_api']").unbind("change").bind("change", function(event) {
				var uppos = self.model.get("uppos") ? self.model.get("uppos") : {};
				uppos.workstation_api = event.target.value;
				self.model.set("uppos", uppos);
			});

			self.$el.find("#workstation_sync_btn").unbind("click").bind("click", function(event) {
				var uppos = self.model.get("uppos");
				var data = {
					"url": uppos.workstation_api
				};
				if (uppos && uppos.workstation_api) {
					loader.show();
					$.ajax({
						url: self.getApp().serviceURL + "/api/v1/sync-workstations",
						data: JSON.stringify(data),
						type: "POST",
						success: function(response) {
							loader.hide();
							$.notify({message: "Synchronize successfully"}, {type: "success"});
						},
						error: function(xhr, statusText, errorThrow) {
							loader.hide();
							$.notify({message: "Synchronize error"}, {type: "danger"});
						}
					})
				}
			});
			
			var uppos = self.model.get("uppos");
			if (uppos && uppos.product_api) {
				self.$el.find("input[name='product_api']").val(uppos.product_api);
			} else {
				if (!uppos) {
					uppos = {};
				}
				uppos.product_api = "https://upstart.vn/couchservice/pos/api/get-products";
				self.model.set("uppos", uppos);
				self.$el.find("input[name='product_api']").val(uppos.product_api);
			}

			self.$el.find("input[name='product_api']").unbind("change").bind("change", function(event) {
				var uppos = self.model.get("uppos") ? self.model.get("uppos") : {};
				uppos.product_api = event.target.value;
				self.model.set("uppos", uppos);
			});

			self.$el.find("#product_sync_btn").unbind("click").bind("click", function(event) {
				var uppos = self.model.get("uppos");
				var data = {
					"url": uppos.product_api
				};
				if (uppos && uppos.product_api) {
					loader.show();
					$.ajax({
						url: self.getApp().serviceURL + "/api/v1/sync-products",
						data: JSON.stringify(data),
						type: "POST",
						success: function(response) {
							loader.hide();
							$.notify({message: "Synchronize successfully"}, {type: "success"});
						},
						error: function(xhr, statusText, errorThrow) {
							loader.hide();
							$.notify({message: "Synchronize error"}, {type: "danger"});
						}
					})
				}
			});
			
			// SET VALUE 
			var uppos = self.model.get("uppos");
			if (uppos && uppos.category_api) {
				self.$el.find("input[name='category_api']").val(uppos.category_api);
			} else {
				if (!uppos) {
					uppos = {};
				}
				uppos.category_api = "https://upstart.vn/couchservice/pos/api/get-item-categories";
				self.model.set("uppos", uppos);
				self.$el.find("input[name='category_api']").val(uppos.category_api);
			}

			self.$el.find("input[name='category_api']").unbind("change").bind("change", function(event) {
				var uppos = self.model.get("uppos") ? self.model.get("uppos") : {};
				uppos.category_api = event.target.value;
				self.model.set("uppos", uppos);
			});
			
			self.$el.find("#category_sync_btn").unbind("click").bind("click", function(event) {
				var uppos = self.model.get("uppos");
				var data = {
					"url": uppos.category_api
				};
				if (uppos && uppos.category_api) {
					loader.show();
					$.ajax({
						url: self.getApp().serviceURL + "/api/v1/sync-categories",
						data: JSON.stringify(data),
						type: "POST",
						success: function(response) {
							loader.hide();
							$.notify({message: "Synchronize successfully"}, {type: "success"});
						},
						error: function(xhr, statusText, errorThrow) {
							loader.hide();
							$.notify({message: "Synchronize error"}, {type: "danger"});
						}
					})
				}
			});
			

			// IPOS START SETTING VALUES
			self.$el.find("input[name='workstation_parent']").unbind("change").bind("change", function(event) {
				var ipos = self.model.get("ipos") ? self.model.get("ipos") : {};
				ipos.tenant = event.target.value;
				self.model.set("ipos", ipos);
			});
			
			var ipos = self.model.get("ipos");
			if (ipos && ipos.tenant) {
				self.$el.find("input[name='workstation_parent']").val(ipos.tenant);
			}

			self.$el.find("input[name='coupon_prefix']").unbind("change").bind("change", function(event) {
				var ipos = self.model.get("ipos") ? self.model.get("ipos") : {};
				ipos.coupon_prefix = event.target.value;
				self.model.set("ipos", ipos);
			});
			// SET VALUE 
			var ipos = self.model.get("ipos");
			if (ipos && ipos.coupon_prefix) {
				self.$el.find("input[name='coupon_prefix']").val(ipos.coupon_prefix);
			}

			// SET VALUE 
			var ipos = self.model.get("ipos");
			self.$el.find("input[name='access_token']").unbind("change").bind("change", function(event) {
				var ipos = self.model.get("ipos") ? self.model.get("ipos") : {};
				ipos.access_token = event.target.value;
				self.model.set("ipos", ipos);
			});
			// SET VALUE 
			var ipos = self.model.get("ipos");
			if (ipos && ipos.access_token) {
				self.$el.find("input[name='access_token']").val(ipos.access_token);
			}

			self.$el.find("#btn_sync_ipos").unbind("click").bind("click", () => {
				var ipos = self.model.get("ipos");
				if (ipos && ipos.tenant && ipos.access_token) {
					loader.show();
					$.ajax({
						url: self.getApp().serviceURL + "/api/v1/ipos/sync_data",
						data: JSON.stringify({
							workstation_exid: self.selectedWorkstationIPOS
						}),
						type: "POST",
						success: function(response) {
							loader.hide();
							self.getApp().notify({message: "Done"}, {type: "success"});
						},
						error: function(xhr) {
							loader.hide();
							self.getApp().notify({message: "Lỗi, vui lòng thử lại hoặc liên hệ admin để được hỗ trợ"}, {type: "danger"});
						}
					});
				} else {
					self.getApp().notify({message: "Nhập mã hệ thống nhà hàng và Access token"}, {type: "danger"});
				}
			});


			self.$el.find("input[name='sms_brand']").unbind("change").bind("change", function(event) {
				var stringee = self.model.get("stringee") ? self.model.get("stringee") : {};
				stringee.sms_brand = event.target.value;
				self.model.set("stringee", stringee);
			});
			// SET VALUE 
			var stringee = self.model.get("stringee");
			if (stringee && stringee.sms_brand) {
				self.$el.find("input[name='sms_brand']").val(stringee.sms_brand);
			}

			self.$el.find("input[name='sms_api']").unbind("change").bind("change", function(event) {
				var stringee = self.model.get("stringee") ? self.model.get("stringee") : {};
				stringee.sms_api = event.target.value;
				self.model.set("stringee", stringee);
			});
			// SET VALUE 
			var stringee = self.model.get("stringee");
			if (stringee && stringee.sms_api) {
				self.$el.find("input[name='sms_api']").val(stringee.sms_api);
			}

			self.$el.find("input[name='sms_token']").unbind("change").bind("change", function(event) {
				var stringee = self.model.get("stringee") ? self.model.get("stringee") : {};
				stringee.sms_token = event.target.value;
				self.model.set("stringee", stringee);
			});
			// SET VALUE 
			var stringee = self.model.get("stringee");
			if (stringee && stringee.sms_token) {
				self.$el.find("input[name='sms_token']").val(stringee.sms_token);
			}

			// ZALO INTEGRATION
			var zaloInfo = self.model.get('zalo');
			console.log("zaloInfo ", zaloInfo);
			if (zaloInfo && zaloInfo.expired_at && parseInt(zaloInfo.expired_at) > Helper.now_timestamp()) {
				self.$el.find("#zalo_login_space").hide();
				self.$el.find("#zalo_oa_space").show();
				self.$el.find("#zalo_expire_time_space").show();
			} else {
				self.$el.find("#zalo_oa_space").hide();
				self.$el.find("#zalo_expire_time_space").hide();
				self.$el.find("#zalo_login_space").show();
			}

			self.$el.find("#btn_login_zalo").unbind("click").bind("click", () => {
				var zalo_app_id = self.getApp().ZaloAppID;
				var callback_api = self.getApp().serviceURL + '/api/v1/integration/zalo/webhook';
				var zalo_auth_api = "https://oauth.zaloapp.com/v3/oa/permission";
				var url = zalo_auth_api + "?app_id=" + zalo_app_id + "&redirect_uri=" + callback_api;
				var win = window.open(url, '_blank');
  				win.focus();
			})
        },

        switchUIRegister: function () {
			const self = this;
		}
	});

});