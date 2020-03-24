define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/TaskInfoSchema.json');
	var Helpers = require('app/common/Helpers');
	var EmployeeSelectView = require('app/employee/SelectView');
	var SubEmployeeSelectView = require('app/employee/SelectView');
	// var NoteView = require('app/tasks/NoteView');
	// var ContactAttributeView = require('app/contact/ContactAttributeView');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "task_info",
		uiControl: {
			fields: [
		
				{
					field: "active",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": 1, "text": "Actice" },
						{ "value": 0, "text": "Deactive" },
					],
					value: 1
				},
				

			],
		},
		tools: [{
			name: "defaultgr",
			type: "group",
			groupClass: "toolbar-group",
			buttons: [{
				name: "back",
				type: "button",
				buttonClass: "btn-secondary btn-sm",
				label: "<span class='fa fa-chevron-left'></span> Quay lại",
				command: function () {
					var self = this;
					var backcol = self.getApp().getRouter().getParam("backcol");
					if (backcol != null) {
						self.getApp().getRouter().navigate(backcol + "/collection");
					} else {
						self.getApp().getRouter().navigate(self.collectionName + "/collection");
					}
				}
			},
			{
				name: "save",
				type: "button",
				buttonClass: "btn-coal btn-sm",
				label: "<span class='fa fa-save'></span> Lưu",
				command: function () {
					var self = this;
					// if (!self.validate()) {
					// 	return;
					// }
					console.log(self.model);
					
					self.model.save(null, {
						success: function (model, respose, options) {
							self.getApp().notify({ message: "Thành công." }, { type: "success" });
							var backcol = self.getApp().getRouter().getParam("backcol");
							if (backcol != null) {
								self.getApp().getRouter().navigate(backcol + "/collection");
							} else {
								self.getApp().getRouter().navigate(self.collectionName + "/collection");
							}
						},
						error: function (modelData, xhr, options) {
							if (xhr && xhr.responseJSON && xhr.responseJSON.error_message) {
								self.getApp().notify({ message: xhr.responseJSON.error_message }, { type: "danger" });
								return;
							}
							self.getApp().notify({ message: "Lỗi hệ thống, thử lại sau." }, { type: "danger" });
						}
					});
				}
			},
			{
				name: "delete",
				type: "button",
				buttonClass: "btn-danger btn-sm",
				label: "<span class='fa fa-trash'></span> Xoá",
				visible: function () {
					var backcol = this.getApp().getRouter().getParam("backcol");
					if (backcol != null) {
						return false;
					} else {
						return this.getApp().getRouter().getParam("id") !== null;
					}
				},
				command: function () {
					var self = this;
					self.model.set('deleted', true);

					self.model.save(null, {
						success: function (model, respose, options) {
							self.getApp().notify({ message: "Đã xoá" });
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
						},
						error: function (modelData, xhr, options) {
							if (xhr && xhr.responseJSON && xhr.responseJSON.error_message) {
								self.getApp().notify({ message: xhr.responseJSON.error_message }, { type: "danger" });
								return;
							}
							self.getApp().notify({ message: "Lỗi hệ thống, thử lại sau." }, { type: "danger" });
						}
					});

				}
			},
			]
		},],
        /**
         * 
         */
		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");

			if (id) {
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
				self.model.set('task_code', self.getUniqueID())
				self.eventRegister();
			}


		},
		getUniqueID: function () {
			let UID = Date.now() + ((Math.random() * 100000).toFixed())
			return 'UP' + UID.toUpperCase();
		},

	
		switchUIControlRegister: function () {
			var self = this;

			self.$el.find(".switch input[id='share_switch']").unbind("click").bind("click", function ($event) {
				if ($(this).is(":checked")) {
					let id = self.model.get('id');
					if (!id) {
						self.model.save(null, {
							success: function (model, respose, options) {
								self.getApp().notify({ message: "Công việc đã sẵn sàng chia chỏ" }, { type: "success" });
								self.$el.find('#form_sub_task').show();
							},
							error: function (modelData, xhr, options) {
								self.$el.find('#form_sub_task').hide();
								if (xhr && xhr.responseJSON && xhr.responseJSON.error_message) {
									self.getApp().notify({ message: xhr.responseJSON.error_message }, { type: "danger" });
									return;
								}
								self.getApp().notify({ message: "Lỗi hệ thống, thử lại sau." }, { type: "danger" });
							}
						});

					} else {
						self.$el.find('#form_sub_task').show();
					}
				} else {
					self.$el.find('#form_sub_task').hide();
				}
			});

		},
		eventRegister: function () {
			const self = this;
			var id = this.getApp().getRouter().getParam("id");
			self.switchUIControlRegister()
			self.formartTime("#start_time", 'start_time')
			self.formartTime("#end_time", 'end_time')
			
		},
		
		formartTime: function (selector, field) {
			var self = this;
			var time_working = null;
			if (self.model.get(field) != 0) {
				time_working = moment.unix(self.model.get(field)).format("YYYY-MM-DD HH:mm:ss");
			} else {
				time_working = null
			}
			if (self.model.get(field)) {
				self.$el.find(selector).datetimepicker({
					defaultDate: time_working,
					format: "DD/MM/YYYY HH:mm:ss",
					icons: {
						time: "fa fa-clock"
					}
				});
			}

			self.$el.find(selector).on('change.datetimepicker', function (e) {
				if (e && e.date) {
					let dateFomart = moment(e.date).unix()
					self.model.set(field, dateFomart)
				} else {
					self.model.set(field, null);
				}
			});
		},
		

		validate: function () {
			// if (!this.model.get("phone") || !this.model.get("phone").trim()) {
			// 	this.getApp().notify({ message: "Số điện thoại không thể để trống." }, { type: "danger" });
			// 	return false;
			// }

			// if (!this.model.get("contact_name") || !this.model.get("contact_name").trim()) {
			// 	this.getApp().notify({ message: "Tên khách hàng không thể để trống." }, { type: "danger" });
			// 	return false;
			// }
			return true;
		}
	});

});