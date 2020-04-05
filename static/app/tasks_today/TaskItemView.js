define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/TasksEmployeesSchema.json');

	var Helper = require('app/common/Helpers');
	// var TemplateHelper = require("app/common/TemplateHelper");
	var TimeFilterDialogView = require('app/common/filters/TimeFilterDialogView');

	return Gonrin.View.extend({
		template_item:_.template(`<div class="row p-0 m-0" style="border-top: 1px solid #00bcd4;">
		<div class="col-lg-4 col-sm-4 col-4  ">
			<div class="text-center mx-0 "><span style="color: #17a2b8;"><%= task_name %></span></div>
		</div>
		<div class="col-lg-4 col-sm-4 col-4">
			<div class="pr-1 text-center"><%= sum_employee %></div>
		</div>
		<div class="col-lg-4 col-sm-4 col-4">
			<div class="text-center" ><%= task_event %></div>
		</div>
	</div>`),
		events:{
			"click #add-employee":"addEmployee",
			'click #remove-employee':"removeEmployee",
			'click #done':'setDoneTask',
			'dblclick':"routeTask"
		},
		render:function () {
			var self = this;
            self.$el.empty()
			var data_render = self.convertDataRender(self.model)
			self.$el.html(self.template_item(data_render))
			return self
		},
		routeTask:function () {
			var self = this;
			var path = 'tasks/model?id=' + self.model.id + '&backcol=tasks_today';
			self.getApp().getRouter().navigate(path);
		},
		addEmployee:function () {
			var self = this;
			
			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/task_change_employee?id="+self.model.id+"&method=add_employee",
				type: "PUT",
				beforeSend: function () {
					loader.show()
                },
				success: function (response) {
					loader.hide()
					self.model = response
					self.render()
				},
				error: function (xhr) {
					self.getApp().notify({ message: "Tài khoản này không phải nhân viên" }, { type: "danger" })
				}
			});
		},
		removeEmployee:function (){
			var self = this;
			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/task_change_employee?id="+self.model.id+"&method=remove_employee",
				type: "PUT",
				beforeSend: function () {
					loader.show()
                },
				success: function (response) {
					loader.hide()
					self.model = response
					self.render()
				},
				error: function (xhr) {
					self.getApp().notify({ message: "Đã có lỗi sảy ra" }, { type: "danger" })
				}
			});
		},
		setDoneTask:function () {
			var self = this;
			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/task_change_employee?id="+self.model.id+"&method=done",
				type: "PUT",
				beforeSend: function () {
					loader.show()
                },
				success: function (response) {
					loader.hide()
					self.model = response
					self.render()
				},
				error: function (xhr) {
					self.getApp().notify({ message: "Đã có lỗi sảy ra" }, { type: "danger" })
				}
			});	
		},
		convertDataRender:function (data) {
			var self = this
			var result = {};
			var sum_employee = data.employees.length
			var task_status = data.status
			if(task_status == 0){
				result['task_status'] = `<span class="text-danger">Chưa ai làm<span>`
				result['task_event'] = `<span class="text-success align-middle" style="" id="add-employee">Nhận<span>`
			}else if(task_status == 2){
				result['task_status'] = `<span class="text-warning">Đang làm<span>`
				if(data.employees.findIndex((employee)=>employee.id==self.getApp().currentUser.employee_uid ) != -1){
					result['task_event'] = `<span class="text-danger mr-2" id="remove-employee">Hủy</span>
											<span class="text-success px-2" id="done">Xong</span>`
				}else{
					result['task_event'] = `<span class="text-success px-2" id="add-employee">Nhận<span>`

				}
			}else{
				result['task_status'] = `<span class="text-success">Đã xong<span>`
				result['task_event'] = `<span class="text-success"><i class="fas fa-check"></i><span>`
			}
			result['sum_employee'] = sum_employee>0?`<span>${sum_employee}</span>`:`<span class="text-danger">${sum_employee}</span>`
			result['task_name'] = data.task_name
			
			return result
		}
    })
})