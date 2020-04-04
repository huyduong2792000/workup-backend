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
	var TasksCollectionView = require('./TasksCollectionView')
	var TaskItemView = require('./TaskItemView')

	var GroupItemView = Gonrin.View.extend({
		template_item:_.template(`<div id="group-info" class="pb-0 mb-0" style="overflow-x: hidden;">
									<div class="row py-1" style="background-color: #315294;
															color: white">
										<div class="col-lg-4 col-sm-4 col-4 ">
											<div class="text-left">Tên group</div>
										</div>
										<div class="col-lg-4 col-sm-4 col-4 p-0">
											<div class="text-left">Công việc</div>
										</div>
										<div class="col-lg-4 col-sm-4 col-4 p-0">
											<div class="">Leader</div>
										</div>
									</div>
									<div class="row ">
										<div class="col-lg-4 col-sm-4 col-4">
											<div class="row mx-0 align-middle"><span style="color: #17a2b8;"><%= name %></span></div>
										</div>
									<div class="col-lg-4 col-sm-4 col-4">
											<div class="pr-1 row text-success">Xong: <%= done %></div>
											<div class="pr-1 row text-secondary">Đang xử lý: <%= processing %></div>
											<div class="pr-1 row text-danger">Chưa xong:<%= todo %></div>	
										</div>
									<div class="col-lg-4 col-sm-4 col-4">
											<div class="row pr-1"><%= supervisor_full_name %></div>
											<div class="row pr-1">Số điện thoại</div>
											<div class="row pr-1"><%= supervisor_phone_number %></div>
										</div>
									</div>
								</div>
							<div id="tasks-collection"></div>`),
		events:{
			"click #group-info":"toggleTaskView"
		},
		toggleTaskView:function () {
			var self = this;
			self.$el.find("#tasks-collection").toggle('fast','linear')
		},
		render:function () {
			var self = this;
			var data_view = self.convertViewData(self.model)
			self.$el.html(self.template_item(data_view))
			var task_view = new TasksCollectionView({viewData:self.model.tasks})
			self.$el.find("#tasks-collection").empty()
			self.$el.find("#tasks-collection").append(task_view.render().$el)
			self.$el.find("#tasks-collection").hide()
			return this
		},
		convertViewData:function (data) {
			var self = this
			var result = {}
			result['name'] = data.name
			result['done'] = self.calculateTaskStatus(data,1)
			result['processing'] = self.calculateTaskStatus(data,2)
			result['todo'] = self.calculateTaskStatus(data,0)
			result['supervisor_full_name'] = data.supervisor.full_name
			result['supervisor_phone_number'] = data.supervisor.phone_number
			return result;
		},
		calculateTaskStatus:function (group,status) {
			let total_tasks = group.tasks.length
			let sum_tasks = 0
			group.tasks.forEach(function (task,index){
				if(task.status == status){
					sum_tasks +=1
				}
			})
			return sum_tasks + '/' + total_tasks
		},
	})
	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "tasks_today",

		render: function () {
			// this.applyBindings();
			var self = this;
			self.eventRegister();
			let url = self.getApp().serviceURL + '/api/v1/tasks_today'
			self.filterData(url)
			return this;
		},
		eventRegister: function () {
			var self = this;
			var from_time = null;
			var to_time = null;
			var status = null;
			self.$el.find('#groups-tab').off('click')
			self.$el.find('#groups-tab').click(function (){
				$(this).addClass("active-tab")
				self.$el.find("#mytasks-tab").removeClass("active-tab")
				self.render()
				self.$el.find("#mytasks-tab-data").hide()
				self.$el.find("#groups-tab-data").show()
			})
			self.$el.find('#mytasks-tab').off('click')
			self.$el.find('#mytasks-tab').click(function () {
				$(this).addClass("active-tab")
				self.$el.find("#groups-tab").removeClass("active-tab")
				self.render()
				self.$el.find("#mytasks-tab-data").show()
				self.$el.find("#groups-tab-data").hide()
			})
			var filter_data = self.$el.find("#btn_filter_done");
			filter_data.off('click')
			filter_data.on("click", function (){
				self.$el.find('#btn_filter_inprocess').attr('checked', false);
				self.$el.find('#btn_filter_pending').attr('checked', false);
				if (self.$el.find('#btn_filter_done').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_today?status=1'
					self.filterData(url)
				}
				if (!self.$el.find('#btn_filter_done').is(':checked') && !self.$el.find('#btn_filter_inprocess').is(':checked') && !self.$el.find('#btn_filter_pending').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_today'
					self.filterData(url)
				}

			});
			var filter_data = self.$el.find("#btn_filter_inprocess");
			filter_data.off('click')
			filter_data.on("change", function () {
				self.$el.find('#btn_filter_done').attr('checked', false);
				self.$el.find('#btn_filter_pending').attr('checked', false);
				if (self.$el.find('#btn_filter_inprocess').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_today?status=2'
					self.filterData(url)
				}
				if (!self.$el.find('#btn_filter_done').is(':checked') && !self.$el.find('#btn_filter_inprocess').is(':checked') && !self.$el.find('#btn_filter_pending').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_today'
					self.filterData(url)
				}

			});
			var filter_data = self.$el.find("#btn_filter_pending");
			filter_data.off('click')
			filter_data.on("change", function () {
				self.$el.find('#btn_filter_inprocess').attr('checked', false);
				self.$el.find('#btn_filter_done').attr('checked', false);
				if (self.$el.find('#btn_filter_pending').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_today?status=0'
					self.filterData(url)
				}
				if (!self.$el.find('#btn_filter_done').is(':checked') && !self.$el.find('#btn_filter_inprocess').is(':checked') && !self.$el.find('#btn_filter_pending').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_today'
					self.filterData(url)
				}

			});

			self.$el.find("#btn_tasks_filter").unbind('click').bind("click", function () {
				var timeFilterDialog = new TimeFilterDialogView();
				timeFilterDialog.dialog();
				timeFilterDialog.on('filter', (data) => {
					from_time = data.from_time;
					to_time = data.to_time;
					let url = self.getApp().serviceURL + '/api/v1/tasks_today?start_time=' + from_time + '&end_time=' + to_time;
					self.$el.find('#btn_filter_done').attr('checked', false);
					self.$el.find('#btn_filter_pending').attr('checked', false);
					self.$el.find('#btn_filter_inprocess').attr('checked', false);
					self.filterData(url)

				});
			});
		},
		filterData: function (url) {
			var self = this;
			$.ajax({
				url: url,
				method: "GET",
				contentType: "application/json",
				// headers: {
				// },
				beforeSend: function () {
				},
				success: function (data) {
					self.collection = data
					self.loadGroupsView(data);
					self.loadMyTasksView(data);
				},
				error: function (xhr, status, error) {
					self.getApp().notify("Lấy subtask không thành công", { type: "danger" });
				},
			});
		},
		loadMyTasksView:function (dataSource) {
			var self = this
			var list_task = dataSource.reduce(((list_task,group)=>list_task.concat(group.tasks)),[])
			var my_list_task = []
			var my_id = self.getApp().currentUser.employee_uid
			for (const[index,task] of list_task.entries()){
				if(task.employees.findIndex((employee)=>employee.id == my_id) != -1){
					my_list_task.push(task)
				}					
			}
			self.$el.find("#mytasks-tab-data #grid").empty()
			my_list_task.forEach(function (task,index) {
				var task_view = new TaskItemView({model:task})
				self.$el.find("#mytasks-tab-data #grid").append(task_view.render().$el)
			})
		},
		loadGroupsView: function (dataSource) {
			var self = this
			let total_group = dataSource.length
			var self = this;
			self.$el.find("#groups-tab-data #grid").empty()
			self.$el.find("#groups-tab #grid").append(`<div style="background-color: #315294 ; padding: .50rem; font-size: 15px; margin-top: 5px; color: #fff;">
			<label style="margin-bottom: 0px;">Số group: ${total_group}</label>
			</div>`)
			dataSource.forEach(function (group,index) {
				var group_view = new GroupItemView({model:group})
				self.$el.find("#groups-tab-data #grid").append(group_view.render().el)
				
			})

		}

	});

});