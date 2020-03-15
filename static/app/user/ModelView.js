define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/UserSchema.json');
	var config = require("json!app/config.json");

	var RoleSelectView = require('app/role/SelectView');
	var WorkstationSelectView = require('app/workstation/SelectView');

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
						label: "TRANSLATE:BACK",
						command: function () {
							var self = this;
							//Backbone.history.history.back();
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-primary btn-sm",
						label: "TRANSLATE:SAVE",
						command: function () {
							var self = this;

							if (!self.validate()) {
								return;
							}

							if (self.model.get("id")) {

								self.model.save(null, {
									success: function () {
										self.getApp().notify({ "message": "Thành công." }, { "type": "success" });
										if (self.model.get("id") == self.getApp().currentUser.id) {
											self.getApp().initialize();
											self.getApp().getRouter().navigate("index");
										} else {
											self.getApp().getRouter().navigate(self.collectionName + "/collection");
										}
									},
									error: function () {
										self.getApp().notify({ "message": "Lỗi, vui lòng thử lại sau." }, { "type": "danger" });
									}
								})


								//								var data = {
								//									id: self.model.get("id"),
								//									display_name: self.model.get("display_name")
								//								};
								//								
								//								$.ajax({
								//									url: self.getApp().serviceURL + "/api/v1/user/attrs",
								//									data: JSON.stringify(data),
								//									contentType: "application/json",
								//									type: "PUT",
								//									success: function() {
								//										self.getApp().notify({"message": "Đăng ký thành công."}, {"type": "success"});
								//										self.getApp().initialize();
								//									},
								//									error: function(xhr, ajaxOptions, thrownError) {
								//										$.notify({"message": "Đăng ký không thành công, thử lại sau."}, {"type": "danger"});
								//									}
								//								});
							}
						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger btn-sm",
						label: "TRANSLATE:DELETE",
						visible: function () {
							return this.getApp().getRouter().getParam("id") !== null;
						},
						command: function () {
							var self = this;
							self.model.destroy({
								success: function (model, response) {
									self.getApp().getRouter().navigate(self.collectionName + "/collection");
								},
								error: function (model, xhr, options) {
									self.getApp().notify('Delete error');
								}
							});
						}
					},
				]
			},
		],

		uiControl: {
			fields: [
				{
					field: "roles",
					label: "Loại người dùng",
					uicontrol: "ref",
					textField: "display_name",
					selectionMode: "multiple",
					dataSource: RoleSelectView
				},
				{
					field: "workstations",
					uicontrol: "ref",
					textField: "workstation_name",
					selectionMode: "multiple",
					dataSource: WorkstationSelectView
				},
				{
					field: "deleted",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": false, "text": "Active" },
						{ "value": true, "text": "Deactive" }
					]
				}
			]
		},

		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			var currentUser = this.getApp().currentUser;
			//console.log(currentUser.can("create1", "Account2"));
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


		validate: function () {
			var self = this;
			//			var password = self.$el.find("#password").val();
			//			var confirm_password = self.$el.find("#confirm_password").val();
			//			
			//			if ((password || confirm_password) && (password !== confirm_password)) {
			//				self.getApp().notify({message: "Mật khẩu không khớp"}, {type: "danger"});
			//				return false;
			//			}
			//			
			if (!self.model.get("phone") || !self.model.get("email")) {
				self.getApp().notify({ message: "Số điện thoại và email không được để trống." }, { type: "danger" });
				return false;
			}
			return true;
		}
	});

});