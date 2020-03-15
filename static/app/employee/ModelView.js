define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/EmployeeSchema.json');


	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "employee",
		uiControl: {
			fields: [
				{
					field: "position",
					uicontrol: "combobox",
					textField: "text",
					valueField: "id",
					dataSource: [
						{ id: "employee", text: "Nhân viên" },
						{ id: "leader", text: "Tổ trưởng" },

					]
				},
				{
					field: "gender",
					uicontrol: "combobox",
					textField: "text",
					valueField: "id",
					dataSource: [
						{ id: 1, text: "Nam" },
						{ id: 0, text: "Nữ" },

					]
				},
				
			]
		},
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-default btn-sm",
						label: "TRANSLATE:BACK",
						command: function () {
							var self = this;
							Backbone.history.history.back();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "Lưu nhân viên",
						command: function () {
							var self = this;
							// self.processSave();

							if (self.validated()) {

								self.model.save(null, {
									success: function (model, respose, options) {
										self.getApp().notify("Lưu thông tin thành công", { type: "info" });
										var path = self.collectionName + '/collection';
										self.getApp().getRouter().navigate(path);
									},
									error: function (model, xhr, options) {
										self.getApp().notify('Lưu thông tin không thành công!', { type: "warning" });

									}
								});
							}


						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger btn-sm",
						label: "TRANSLATE:DELETE",
						// visible: function(){
						// 	return this.getApp().getRouter().getParam("id") !== null;
						// },
						command: function () {
							var self = this;
							self.model.destroy({
								success: function (model, response) {
									self.getApp().notify('Xoá dữ liệu thành công');
									self.getApp().getRouter().navigate(self.collectionName + "/collection");
								},
								error: function (model, xhr, options) {
									self.getApp().notify('Xoá dữ liệu không thành công!');

								}
							});
						}
					},
				],
			}],

		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				//progresbar quay quay
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.eventRegister();
					},
					error: function () {
						self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
					},
				});
			} else {
				self.applyBindings();
				self.eventRegister();
			}
		},
		eventRegister: function() {
            const self = this;
            var id = this.getApp().getRouter().getParam("id");
			var birthday = false;
            if (self.model.get("birthday") && self.model.get("birthday").indexOf("T")) {
                birthday = moment(self.model.get("birthday"), "YYYY-MM-DDTHH:mm:ss");
            } else if (self.model.get("birthday") && self.model.get("birthday").indexOf("-")) {
                birthday = moment(self.model.get("birthday"), "YYYY-MM-DD");
            } else if (self.model.get("birthday")) {
                birthday = moment(self.model.get("birthday"), "DD/MM/YYYY");
			}
			
            // self.$el.find('#birthday').datetimepicker({
            //     defaultDate: birthday,
            //     format: "DD/MM/YYYY",
            //     icons: {
            //         time: "fa fa-clock"
            //     }
            // });

            // self.$el.find('#birthday').on('change.datetimepicker', function(e) {
            //     if (e && e.date) {
            //         self.model.set("birthday", e.date.format("YYYY-MM-DD"))
            //     } else {
            //         self.model.set("birthday", null);
            //     }
            // });


        },

		validated: function () {
			let self = this;
			let id = self.model.get('id');

			if (id) {
				let full_name = self.model.get('full_name');
				let email = self.model.get('email');
				let phone_number = self.model.get('phone_number');
				let id_identifier = self.model.get('id_identifier');
								
				if(full_name == null || email == null || phone_number == null || id_identifier == null){
					self.getApp().notify("Tên, tài khoản, số điện thoại và số cmnd không được bỏ trống!", { type: "warning" })
					return false;
				}else{
					return true;
				}
			} else {
				let password = self.$el.find('#password').val();
				let confirm_password = self.$el.find('#confirm_password').val();
				if (password.length > 5) {
					if (password == confirm_password) {
						self.model.set('password', password);
						self.model.set('confirm_password', password);
						return true;
					} else {
						self.getApp().notify("xác nhận mật khẩu không trùng khớp!", { type: "warning" })
						return false
					}
				} else {
					self.getApp().notify("mật khẩu phải dài hơn 6 ký tự!!", { type: "warning" })
					return false
				}
			}

		},
	});

});