define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/changepassword.html'),
		schema = require('json!schema/UserSchema.json');
	var config = require('json!app/config.json');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "user",
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-secondary btn-sm",
						label: "Quay lại",
						command: function () {
							var self = this;
							Backbone.history.history.back();
							//self.getApp().getRouter().navigate(self.collectionName + "/collection");
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-primary btn-sm",
						label: "Đổi mật khẩu",
						command: function () {
							var self = this;
							var pass = self.$el.find("#password").val();
							var newpass = self.$el.find("#newpassword").val();
							var confirm = self.$el.find("#confirm_password").val();

							if (newpass === confirm) {
								var currentUser = self.getApp().currentUser;
								console.log(config.account_portal + "/api/" + config.account_portal_version + "/user/change-password");
								$.ajax({
									url: config.account_portal + "/api/" + config.account_portal_version + "/user/change-password",
									method: 'POST',
									data: JSON.stringify({ id: currentUser.id, password: pass, new_password: newpass, confirm_password: confirm }),
									dataType: "json",
									contentType: "application/json",
									success: function (data) {
										self.getApp().notify({ message: data.message }, { type: "info" });
										var intervalId = setInterval(function () {
											self.getApp().getRouter().navigate("logout");
											clearInterval(intervalId);
										}, 3000);
									},
									error: function (request, status, error) {
										self.getApp().notify({ message: JSON.parse(request.responseText).error_message }, { type: "danger" });
									}

								});
							} else {
								self.getApp().notify({ message: "Mật khẩu mới không khớp với nhập lại mật khẩu mới" }, { type: "danger" });
							}
						}
					}
				],
			}
		],
		render: function () {
			var self = this;
			self.applyBindings();
		},
	});

});