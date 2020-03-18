define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/TasksSchema.json');
	var Helpers = require('app/common/Helpers');
	var EmployeeSelectView = require('app/employee/SelectView');
	var SubEmployeeSelectView = require('app/employee/SelectView');
	// var NoteView = require('app/tasks/NoteView');
	// var ContactAttributeView = require('app/contact/ContactAttributeView');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "tasks",
		uiControl: {
			fields: [
				{
					field: "status",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": 0, "text": "To do" },
						{ "value": 2, "text": "In Processing" },
						{ "value": 1, "text": "Done" },
					],
					value: 0
				},
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
					field: "employees",
					label: "Nhân viên",
					uicontrol: "ref",
					textField: "full_name",
					selectionMode: "multiple",
					size: "large",
					dataSource: EmployeeSelectView
				}

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
					self.model.set('active', 0);

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
						self.$el.find("#score").html(self.model.get("score") ? self.model.get("score") : 0);
						self.$el.find("#used_times").html(self.model.get("used_times"));
						self.loadDefaultData();
						self.eventRegister();
						self.get_sub_tasks();

						self.$el.find("#view_description").show();
						self.$el.find("#view_start_time").show();
						self.$el.find("#view_end_time").show();
						self.$el.find("#view_priority").show();
						self.$el.find("#view_original_estimate").show();
						self.$el.find("#view_status").show();

					},
					error: function () {
						self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
					},
				});
			} else {

				self.applyBindings();
				self.model.set('task_code', self.getUniqueID())
				self.loadDefaultData();
				self.eventRegister();
			}


		},
		getUniqueID: function () {
			let UID = Date.now() + ((Math.random() * 100000).toFixed())
			return 'UP' + UID.toUpperCase();
		},

		loadDefaultData: function () {
			const self = this;
			this.renderExtraAttributes();
			this.renderTags();
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
			var list_sub_task = []
			var sub_employee = this.$el.find('#sub_employee').ref({
				contex: this,
				textField: "full_name",
				selectionMode: "multiple",
				size: "large",
				dataSource: SubEmployeeSelectView
			});
			sub_employee.on('change.gonrin', function (e) {
				var sub_employee_val = sub_employee.data('gonrin').getValue() || [];
				// console.log(sub_employee_val);

			});


			self.$el.find(".add-row").click(function () {
				let sub_name = $("#sub_name").val();
				// console.log(sub_name);
				var sub_employee_val = sub_employee.data('gonrin').getValue() || [];
				let employees_name = [];
				sub_employee_val.forEach(element => {
					employees_name.push(element.full_name);
				});
				let sub_priority = $("#sub_priority").val();
				let sub_original_estimate = $("#sub_original_estimate").val();
				// let sub_employee = $("#sub_employee").val();
				// let sub_description = $("#sub_description").val();
				let sub_description = '';
				let sub_task_code = self.getUniqueID();

				let show_sub_priority = sub_priority;

				if (show_sub_priority == 1) {
					show_sub_priority = "highest"
				}
				if (show_sub_priority == 2) {
					show_sub_priority = "high"
				}
				if (show_sub_priority == 3) {
					show_sub_priority = "low"
				}
				if (show_sub_priority == 4) {
					show_sub_priority = "lowest"
				}

				let start_time = self.model.get("start_time");
				let end_time = self.model.get("end_time");
				let tags = self.model.get("tags");
				let parent_code = self.model.get("task_code");
				let attach_file = self.model.get("attach_file");
				let link_issue = self.model.get("link_issue");

				let sub_task = {
					"priority": sub_priority,
					"task_code": sub_task_code,
					"task_name": sub_name,
					"employees": sub_employee_val,
					"original_estimate": sub_original_estimate,
					"description": sub_description,
					"start_time": start_time,
					"end_time": end_time,
					"tags": tags,
					"attach_file": attach_file,
					"link_issue": link_issue,
					"parent_code": parent_code

				}
				// console.log(sub_task);

				$.ajax({
					url: self.getApp().serviceURL + "/api/v1/tasks",
					data: JSON.stringify(sub_task),
					method: "POST",
					contentType: "application/json",
					headers: {
					},
					beforeSend: function () {
					},
					success: function (data) {
						list_sub_task.push(sub_task)
						// <td>${ sub_priority}</td>
						// 	<td>${sub_original_estimate}</td>
						let markup = `<tr>
							<td><input type='checkbox' id="${data.id}" name='record'></td>
							<td> ${ sub_task_code}  </td>
							<td> ${ sub_name}  </td>
							<td>${ employees_name.toString()}</td>
							<td>${ sub_description}</td></tr>
							`;
						self.$el.find("table tbody").append(markup);
					},
					error: function (xhr, status, error) {
						self.getApp().notify("Chia nhỏ công việc không thành công", { type: "danger" });
					},
				});


			});

			$('#sub_priority').combobox({
				uicontrol: "combobox",
				textField: "text",
				valueField: "value",
				//dataSource: "http://abc.com/list.json",
				dataSource: [
					{ "value": 1, "text": "Highest" },
					{ "value": 2, "text": "high" },
					{ "value": 3, "text": "low" },
					{ "value": 3, "text": "lowest" },
				],

			});

			// Find and remove selected table rows
			$(".delete-row").click(function () {
				$("table tbody").find('input[name="record"]').each(function () {
					var thatEl = this;
					if ($(this).is(":checked")) {
						let id_task = this.attributes.id.value;
						$.ajax({
							url: self.getApp().serviceURL + '/api/v1/tasks/' + id_task,
							method: "PUT",
							data: JSON.stringify({ "active": 0 }),
							headers: {
							},
							beforeSend: function () {
							},
							success: function (data) {
								$(thatEl).parents("tr").remove();
							},
							error: function (xhr, status, error) {
								self.getApp().notify("xoá công việc không thành công", { type: "danger" });
							},
						});

					}
				});
			});

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
		get_sub_tasks: function () {
			var self = this;
			$.ajax({
				url: self.getApp().serviceURL + '/api/v1/tasks?results_per_page=1000&q={"filters":{"$and":[{"parent_code":{"$eq":"' + self.model.get("task_code") + '"}}]},"order_by":[{"field":"created_at","direction":"asc"}]}',
				method: "GET",
				contentType: "application/json",
				headers: {
				},
				beforeSend: function () {
				},
				success: function (data) {
					let subtasks = data['objects']
					if (subtasks.length > 0) {
						self.$el.find('#share_switch').attr('checked', true);
						self.$el.find('#form_sub_task').show();
					}
					subtasks.forEach(element => {
						let employees = element.employees;
						let employees_name = []
						employees.forEach(employee => {
							employees_name.push(employee.full_name);
						});
						// <td>${ element.priority}</td>
						// <td>${element.original_estimate}</td>
						let markup = `<tr>
						<td><input type='checkbox' id="${element.id}" name='record'></td>
						<td> ${ element.task_code}  </td>
						<td> ${ element.task_name}  </td>
						<td>${ employees_name.toString()}</td>
						<td>${ element.description}</td></tr>
						`;
						self.$el.find("table tbody").append(markup);
					});

				},
				error: function (xhr, status, error) {
					self.getApp().notify("Lấy subtask k thành công", { type: "danger" });
				},
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
		formartTime: function (selector, field) {
			var self = this;
			var time_working = null;
			if (self.model.get(field) != 0) {
				time_working = moment.unix(self.model.get(field)).format("YYYY-MM-DDTHH:mm:ss");
			} else {
				time_working = null
			}
			if (self.model.get(field)) {
				self.$el.find(selector).datetimepicker({
					defaultDate: time_working,
					format: "DD/MM/YYYYTHH:mm:ss",
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