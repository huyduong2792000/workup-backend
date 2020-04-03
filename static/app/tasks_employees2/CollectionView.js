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

			var filter_data = self.$el.find("#btn_filter_done");
			filter_data.on("change", function () {
				self.$el.find('#btn_filter_inprocess').attr('checked', false);
				self.$el.find('#btn_filter_pending').attr('checked', false);
				if (self.$el.find('#btn_filter_done').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_employees?status=1'
					self.filterData(url)
				}
				if (!self.$el.find('#btn_filter_done').is(':checked') && !self.$el.find('#btn_filter_inprocess').is(':checked') && !self.$el.find('#btn_filter_pending').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_employees'
					self.filterData(url)
				}

			});
			var filter_data = self.$el.find("#btn_filter_inprocess");
			filter_data.on("change", function () {
				self.$el.find('#btn_filter_done').attr('checked', false);
				self.$el.find('#btn_filter_pending').attr('checked', false);
				if (self.$el.find('#btn_filter_inprocess').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_employees?status=2'
					self.filterData(url)
				}
				if (!self.$el.find('#btn_filter_done').is(':checked') && !self.$el.find('#btn_filter_inprocess').is(':checked') && !self.$el.find('#btn_filter_pending').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_employees'
					self.filterData(url)
				}

			});
			var filter_data = self.$el.find("#btn_filter_pending");
			filter_data.on("change", function () {
				self.$el.find('#btn_filter_inprocess').attr('checked', false);
				self.$el.find('#btn_filter_done').attr('checked', false);
				if (self.$el.find('#btn_filter_pending').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_employees?status=0'
					self.filterData(url)
				}
				if (!self.$el.find('#btn_filter_done').is(':checked') && !self.$el.find('#btn_filter_inprocess').is(':checked') && !self.$el.find('#btn_filter_pending').is(':checked')) {
					let url = self.getApp().serviceURL + '/api/v1/tasks_employees'
					self.filterData(url)
				}

			});

			self.$el.find("#btn_tasks_filter").unbind('click').bind("click", function () {
				var timeFilterDialog = new TimeFilterDialogView();
				timeFilterDialog.dialog();
				timeFilterDialog.on('filter', (data) => {
					from_time = data.from_time;
					to_time = data.to_time;
					let url = self.getApp().serviceURL + '/api/v1/tasks_employees?start_time=' + from_time + '&end_time=' + to_time;
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
					self.loadGridData(data);
				},
				error: function (xhr, status, error) {
					self.getApp().notify("Lấy subtask không thành công", { type: "danger" });
				},
			});
		},
		calculateTaskTodo:function (group,status) {
			let total_tasks = group.tasks.length
			let sum_tasks = 0
			group.tasks.forEach(function (task,index){
				if(task.status == status){
					sum_tasks +=1
				}
			})
			return sum_tasks + '/' + total_tasks
		},
		loadGridData: function (dataSource) {
			let total_tasks = dataSource.length
			var self = this;
			self.$el.find("#grid").grid({
				primaryField: "id",
				paginationMode: null,
				datatableClass: "table native",
				tableHeaderClass: "hide",
				selectedTrClass: "bg-default",
				fields: [
					{
						field: "id",
						label: "Công việc ngày hôm nay: " + total_tasks + " việc",
						template: function (rowObject) {

							var html = `<div class="pb-0 mb-0" style="overflow-x: hidden; background-color: #fff; position: relative;">
								<div class="row ">
									<div class="col-lg-4 col-sm-4 col-4">
										<div class="row mx-0">Tên group</div>
										<div class="row mx-0 align-middle"><span style="color: #17a2b8;">${rowObject.name ? rowObject.name : ''}</span></div>
									</div>`;
							html += `<div class="col-lg-4 col-sm-4 col-4">
										<div class="pr-1 row">Công việc</div>
										<div class="pr-1 row text-success">Xong: ${self.calculateTaskTodo(rowObject,1)}</div>
										<div class="pr-1 row text-secondary">Đang xử lý: ${self.calculateTaskTodo(rowObject,2)}</div>
										<div class="pr-1 row text-danger">Chưa xong: ${self.calculateTaskTodo(rowObject,0)}</div>	
									</div>`;

							html += `<div class="col-lg-4 col-sm-4 col-4">
										<div class="row mr-2">Leader</div>
										<div class="row pr-1">${rowObject.supervisor.full_name}</div>
										<div class="row pr-1">Số điện thoại</div>
										<div class="row pr-1">${rowObject.supervisor.phone_number}</div>
									</div>
								</div>
							</div>`;
							html += `<div id="tasks-collection"></div>`
							return html;
						}
					}
				],
				onRowClick: function (event) {
					var tasks_collection_view = new TasksCollectionView({viewData:event})
					tasks_collection_view.render()
				},

				events: {
					// "rowclick": function(e){
					// 	console.log(e);
					// },
					// "rowdblclick": function (event) {
					//     var self = this;
					//     if (event.rowData.id) {
					// 		var path = 'tasks/model?id=' + event.rowData.task_uid + '&backcol=' + self.collectionName;

					// 		self.getApp().getRouter().navigate(path);
					// 	}
					// },
				},
				onRendered: function () {
					loader.hide();
				},
				refresh: true,
				dataSource: dataSource
			});

		}

	});

});