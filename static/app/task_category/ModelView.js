define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/TaskCategorySchema.json');
	var Helpers = require('app/common/Helpers');
	var EmployeeSelectView = require('app/employee/SelectView');
	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "task_category",
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
						{ "value": 3, "text": "lowest" },
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
						self.eventRegister();
						self.renderTags()
						self.$el.find('#view_description').show()
						self.$el.find("#view_tags").show()
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
		getUniqueID: function () {
			let UID = Date.now() + ((Math.random() * 100000).toFixed())
			return 'UP' + UID.toUpperCase();
		},
		eventRegister: function () {
			const self = this;
			var id = this.getApp().getRouter().getParam("id");
			self.model.on('change:tags', () => {
				self.renderTags();
			});

			self.$el.find("#tags_space").unbind("click").bind("click", () => {
				var tagsEl = self.$el.find("#tags_space");
				if (!tagsEl.find("#typing").length) {
					$(`<input id="typing" class="form-control float-left" placeholder="Nhập tags" style="width: 200px;"/>`).appendTo(tagsEl).fadeIn();
					tagsEl.find("#typing").focus();
					tagsEl.find("#typing").unbind("keypress").bind("keypress", (event) => {
						if (event.keyCode == 13) {
							var val = tagsEl.find("#typing").val();
							var tags = self.model.get('tags');
							if (!tags || !Array.isArray(tags)) {
								tags = [];
							}
							var found = false;
							tags.forEach((item, index) => {
								if (item == val) {
									found = true;
								}
							});
							if (!found && val && val.trim()) {
								tags.push(val);

								self.model.set('tags', tags);
								self.model.trigger('change:tags');
							}
							tagsEl.find("#typing").remove();
						}
					});
				}

			});
		},
		renderTags: function () {
			const self = this;
			var tagsEl = self.$el.find("#tags_space");
			tagsEl.empty();
			var tags = self.model.get('tags');
			if (tags && Array.isArray(tags)) {
				tags.forEach((tag, index) => {
					$(`<span class="bg-warning float-left m-1" style="padding: 3px 10px; border-radius: 3px;">${tag}</span>`).appendTo(tagsEl).fadeIn();
				});
			}
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