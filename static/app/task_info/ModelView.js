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
					value: 0
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
		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");

			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.loadDefaultData();
						self.eventRegister();

						self.$el.find("#view_description").show();
						self.$el.find("#view_tags").show();
						self.$el.find("#view_active").show();
						
						

					},
					error: function () {
						self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
					},
				});
			} else {

				self.applyBindings();
				self.loadDefaultData();
				self.eventRegister();
			}


		},

		loadDefaultData: function () {
			const self = this;
			this.renderExtraAttributes();
			this.renderTags();
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
		renderExtraAttributes: function () {
			const self = this;
			var extra_attributes = self.model.get('extra_attributes');
			var extraAttributesEl = self.$el.find("#extra_attributes");
			extraAttributesEl.empty();
			if (extra_attributes && Array.isArray(extra_attributes)) {
				extra_attributes.forEach((attr, index) => {
					$(`<div class="col-lg-4 col-md-4 col-sm-12 col-12 float-left mb-3">
                        <label class="text-uppercase text-gray">${attr.label}</label>
                        <input class="form-control" type="text" value="${attr.value}" id="${attr.id}" readonly/>
                    </div>`).hide().appendTo(extraAttributesEl).fadeIn();

					self.$el.find("#" + attr.id).unbind("click").bind("click", (event) => {
						var contactAttributeView = new ContactAttributeView({
							viewData: {
								'action': 'update'
							}
						});
						contactAttributeView.model.set(attr);
						contactAttributeView.render();

						$(contactAttributeView.el).hide().appendTo(self.$el.find("#add_attribute_space")).fadeIn();
						contactAttributeView.on('change', (data) => {
							var attributeData = clone(data);
							var extra_attributes = self.model.get('extra_attributes');
							if (extra_attributes && Array.isArray(extra_attributes)) {
								extra_attributes.forEach((attr, index) => {
									if (attr.id == attributeData.id) {
										extra_attributes[index] = attributeData;
									}
								});
								self.model.set('extra_attributes', extra_attributes);
								self.model.trigger('change:extra_attributes');
							}
							contactAttributeView.destroy();
						});

						contactAttributeView.on('cancel', (data) => {
							contactAttributeView.destroy();
						});
					});
				});
			}
		},

		validate: function () {
			if (!this.model.get("phone") || !this.model.get("phone").trim()) {
				this.getApp().notify({ message: "Số điện thoại không thể để trống." }, { type: "danger" });
				return false;
			}

			if (!this.model.get("contact_name") || !this.model.get("contact_name").trim()) {
				this.getApp().notify({ message: "Tên khách hàng không thể để trống." }, { type: "danger" });
				return false;
			}
			return true;
		}
	});

});