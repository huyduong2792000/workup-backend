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

	var TaskItemView = Gonrin.View.extend({
		template_item:_.template(`<div class="row">
		<div class="col-lg-3 col-sm-3 col-3">
			<div class="float-left mx-0">Tên:</div>
			<div class="float-left mx-0 "><span style="color: #17a2b8;"><%= task_name %></span></div>
		</div>
		<div class="col-lg-3 col-sm-3 col-3 px-0">
			<div class="pr-1 float-left">đang làm:<br> <%= sum_employee %> (người)</div>
		</div>
		<div class="col-lg-3 col-sm-3 col-3 px-0">
			<div class="pr-1 float-left">trạng thái:<br> <%= task_status %></div>
		</div>
		<div class="col-lg-3 col-sm-3 col-3">
			<div class="pr-1 float-left" ><%= task_event %></div>
		</div>
	</div>`),
		events:{
			"click #add-employee":"addEmployee",
			'click #remove-employee':"removeEmployee"
		},
		render:function () {
			var self = this;
			var data_render = self.convertDataRender(self.model)
			self.$el.html(self.template_item(data_render))
			return self
		},
		addEmployee:function () {
			var self = this;
			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/task_change_employee?id="+self.model.id+"&method=add_employee",
				type: "PUT",
				success: function (response) {
					
				},
				error: function (xhr) {
					console.log("xhr ", xhr);
				}
			});
		},
		removeEmployee:function () {
			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/task_change_employee?id="+self.model.id+"&method=remove_employee",
				type: "PUT",
				success: function (response) {
					
				},
				error: function (xhr) {
					console.log("xhr ", xhr);
				}
			});
		},
		convertDataRender:function (data) {
			var self = this
			var result = {};
			var sum_employee = data.employee.length
			var task_status = data.status
			if(task_status == 0){
				result['task_status'] = `<span class="text-danger">Ko có người<span>`
				result['task_event'] = `<span class="text-success" id="add-employee">Nhận<span>`
			}else if(task_status == 2){
				result['task_status'] = `<span class="text-warning">Đang làm<span>`
				if(data.employee.findIndex((employee_id)=>employee_id==self.getApp().currentUser.employee_uid)){
					result['task_event'] = `<span class="text-success" id="done">Xong<span>
											<span class="text-danger" id="remove-employee">Hủy<span>`
				}
				result['task_event'] = `<span class="text-success" id="add-employee">Nhận<span>`
			}else{
				result['task_status'] = `<span class="text-success">Đã xong<span>`
				result['task_event'] = `<span class="text-success"><i class="fas fa-check"></i><span>`
			}
			result['sum_employee'] = sum_employee>0?`<span>${sum_employee}</span>`:`<span class="text-danger">${sum_employee}</span>`
			result['task_name'] = data.task_name
			
			return result
		}
	})
	return Gonrin.CollectionView.extend({
		render: function () {
			// this.applyBindings();
			var self = this;
			self.$el = self.viewData.el
			self.collection = self.viewData.rowData.tasks
			self.loadGridData()
		},
		loadGridData: function () {
			var self = this;
			self.$el.find("#tasks-collection").empty()
			self.collection.forEach(function (task,index) {
				var task_view = new TaskItemView({model:task})
				self.$el.find("#tasks-collection").append(task_view.render().el)
			})

		}

	});

});