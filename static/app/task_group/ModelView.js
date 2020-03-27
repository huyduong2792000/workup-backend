define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/TaskGroupSchema.json');
	var Helpers = require('app/common/Helpers');
	var EmployeeSelectView = require('app/employee/SelectView');
	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "task_group",
		uiControl: {
			fields: [
				{
					field: "priority",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": 1, "text": "Highest" },
						{ "value": 2, "text": "high" },
						{ "value": 3, "text": "low" },
						{ "value": 4, "text": "lowest" },
					],
					value: 2
				},
				{
					field: "supervisor",
					uicontrol: "ref",
					textField: "full_name",
					selectionMode: "single",
					foreignRemoteField: "id",
					size: "large",
					dataSource: EmployeeSelectView
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
					},
					error: function () {
						self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
					},
				});
			} else {

				self.applyBindings();
				// self.model.set('task_code', self.getUniqueID())
				// self.eventRegister();
			}

		},
		

		validate: function () {
			return true;
		}
	});

});