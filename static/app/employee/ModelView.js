define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/EmployeeSchema.json');
	var Helpers = require('app/common/Helpers');
	var TaskGroupSelectView = require('app/task_group/SelectView');
	var GroupView = require('./GroupView')
	

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
				{
					field: "task_groups",
					uicontrol: "ref",
					textField: "name",
					selectionMode: "multiple",
					foreignRemoteField: "id",
					size: "large",
					dataSource: TaskGroupSelectView
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
							// self.model.set({'deleted':true})
							self.model.destroy({
								success: function (model, respose, options) {
									self.getApp().notify("Xoá dữ liệu thành công", { type: "info" });
									var path = self.collectionName + '/collection';
									self.getApp().getRouter().navigate(path);
								},
								error: function (model, xhr, options) {
									self.getApp().notify('Xoá dữ liệu không thành công!!', { type: "warning" });

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
			self.eventTabs()
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
		eventTabs:function () {
			var self = this;
			let data_tab_mygroup;
			self.$el.find("#mygroup").click(function (){
				self.$el.find("#myinfo").removeClass('active-tab')
				$(this).addClass('active-tab')
				self.$el.find("#card-content-info").hide()
				if(data_tab_mygroup == undefined){
					self.$el.find("#card-content-group").show()
					var group_view = new GroupView(
						{el:self.$el.find("#card-content-group"),
						groups:self.model.get('task_groups'),
						id_employee:self.model.get('id')})
						self.$el.find("#card-content-group").append(group_view.render().$el)
					data_tab_mygroup = self.$el.find("#card-content-group").children()
				}else{
					self.$el.find("#card-content-group").show()
					self.$el.find("#card-content-group").append(data_tab_mygroup)
				}
			})
			self.$el.find("#myinfo").click(function (){
				$(this).addClass('active-tab')
				self.$el.find("#mygroup").removeClass('active-tab')
				self.$el.find("#card-content-group").hide()
				self.$el.find("#card-content-info").show()
			})
		},
		renderValidate:function(check,field_validate,field_invalid){
			var self = this
			if(check == false){
				self.$el.find(field_validate).addClass('invalid')
				self.$el.find(field_invalid).show()
			}else{
				self.$el.find(field_validate).removeClass('invalid')
				self.$el.find(field_invalid).hide()
			}
		},
		validateEmail:function() {
			var self = this;
			let email = self.model.get('email');
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			var check = re.test(String(email).toLowerCase())
			self.renderValidate(check,'#email','#email-invalid-feedback')
			return check;
		},
		validatePhone:function(){
			var self = this
			var phone_number = self.model.get('phone_number');
			var check = Helpers.validatePhone(phone_number)
			self.renderValidate(check,'#phone_number','#phone_number-invalid-feedback')
			return check;
		},
		validateIdentifier:function(){
			var self = this;
			var id_identifier = self.model.get('id_identifier');
			var re = /^\d+$/;
			var check = re.test(id_identifier);
			self.renderValidate(check,'#id_identifier','#id_identifier-invalid-feedback')
			return check;
		},
		validateFullname:function(){
			var self = this;
			var full_name = self.model.get('full_name');
			var check = (full_name!=null?true:false)
			self.renderValidate(check,'#full_name','#full_name-invalid-feedback')
			return check;
		},
		validated: function () {
			var self = this;
			var id = self.model.get('id');
			let check_fullname = self.validateFullname()
			let check_email = self.validateEmail()
			let check_identifier = self.validateIdentifier()
			let check_phone = self.validatePhone()
			if(check_fullname&&check_email&&check_identifier&&check_phone){
				return true
			}else{
				return false
			}
			// if (id) {
				
								
			// 	if(full_name == null || email == null || phone_number == null || id_identifier == null){
			// 		self.getApp().notify("Tên, tài khoản, số điện thoại và số cmnd không được bỏ trống!", { type: "warning" })
			// 		return false;
			// 	}else{
			// 		return true;
			// 	}
			// } else{
			// 	let full_name = self.model.get('full_name');
			// 	let email = self.model.get('email');
			// 	let phone_number = self.model.get('phone_number');
			// 	let id_identifier = self.model.get('id_identifier');
								
			// 	if(full_name == null || email == null || phone_number == null || id_identifier == null){
			// 		self.getApp().notify("Tên, tài khoản, số điện thoại và số cmnd không được bỏ trống!", { type: "warning" })
			// 		return false;
			// 	}else{
			// 		return true;
			// 	}
			// }
			// else {
			// 	let password = self.$el.find('#password').val();
			// 	let confirm_password = self.$el.find('#confirm_password').val();
			// 	if (password.length > 5) {
			// 		if (password == confirm_password) {
			// 			self.model.set('password', password);
			// 			self.model.set('confirm_password', password);
			// 			return true;
			// 		} else {
			// 			self.getApp().notify("xác nhận mật khẩu không trùng khớp!", { type: "warning" })
			// 			return false
			// 		}
			// 	} else {
			// 		self.getApp().notify("mật khẩu phải dài hơn 6 ký tự!!", { type: "warning" })
			// 		return false
			// 	}
			// }

		},
	});

});