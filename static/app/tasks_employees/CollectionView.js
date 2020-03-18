define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/TasksEmployeesSchema.json');

	var Helper = require('app/common/Helpers');
	var TemplateHelper = require("app/common/TemplateHelper");

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "tasks_employees",
		uiControl: {
			// orderBy: [{ field: "created_at", direction: "desc" }],

			// fields: [
			// 	{ field: "task", label: "Công việc", textField: "task_name" },
			// 	{ field: "employee", label: "Nhân viên", textField: "full_name" },
			// 	{
			// 		field: "created_at", label: "Ngày tạo", template: function (rowObj) {
			// 			return Helper.setDatetime(rowObj.created_at);
			// 		}
			// 	}
			// ],
			// onRowClick: function (event) {
			// 	if (event.rowId) {
			// 		var path = this.collectionName + '/model?id=' + event.rowId;
			// 		this.getApp().getRouter().navigate(path);
			// 	}
			// }
		},

		render: function () {
			// this.applyBindings();
			this.eventRegister();
			return this;
		},
		eventRegister: function () {
			var self = this;
			$.ajax({
				url: self.getApp().serviceURL + '/api/v1/tasks_employees',
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
					self.getApp().notify("Lấy subtask k thành công", { type: "danger" });
				},
			});
		},
		loadGridData: function (dataSource) {
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
						label: "Công việc ngày hôm nay",
						template: function (rowObject) {

							var html = `<div style="overflow-x: hidden; background-color: #fff; padding: 5px 5px; position: relative;">
								<div class="row title">
									<div class="col-lg-12 col-sm-12 col-12">
										<div class="float-left">Code: <span style="color: #17a2b8;">${rowObject.task_code ? rowObject.task_code : ''}</span></div>
										<div class="float-right text-dark">${Helper.utcToLocal(moment.unix(rowObject.start_time).format("YYYY-MM-DDTHH:mm:ss"), "YYYY-MM-DD")}</div>
									</div>
								</div>`;
							html += `<div class="row">
									<div class="col-lg-12 col-sm-12 col-12">
										<div class="float-left mr-2">Todo: </div>
										<div class="btn-default float-left pl-1 pr-1">${rowObject.task_name}</div>
									</div>
								</div>`;

							html += `<div class="row">
								<div class="col-lg-12 col-sm-12 col-12">
									<div class="float-left mr-2">Start: </div>
									<div class="btn-default float-left pl-1 pr-1">${Helper.utcToLocal(moment.unix(rowObject.start_time).format("YYYY-MM-DDTHH:mm:ss"), "HH:mm")}</div>
									<div class="float-left mr-2">&#160;&#160;End: </div>
									<div class="btn-default float-left pl-1 pr-1">${Helper.utcToLocal(moment.unix(rowObject.end_time).format("YYYY-MM-DDTHH:mm:ss"), "HH:mm")}</div>
								</div>
							</div>`;
							html += `<div class="row">
							<div class="col-lg-12 col-sm-12 col-12">
								<div class="float-left mr-2">Assignee: </div>
								<div class="btn-default float-left pl-1 pr-1">${rowObject.employee_name}</div>
								<div class="float-left mr-2">&#160;&#160;Phone: </div>
								<div class="btn-default float-left pl-1 pr-1">${rowObject.employee_phone}</div>
								`;
							if (rowObject.status && rowObject.status == 1) {
								html += `<div class="btn-outline-success float-right pl-2 pr-2 pt-1 pb-1" style="border-radius: 4px;border: 2px solid #28a745; position: absolute; right: 20px; top: -17px; transform: rotate(30deg); font-weight: 600;">Done</div>`;
							} else if (rowObject.status == 0) {
								html += `<div class="btn-outline-warning float-right pl-1 pr-1" style="border-radius: 4px;border: 2px solid #ffc107; position: absolute; right: 20px; top: -17px; transform: rotate(30deg); font-weight: 600;">Pending</div>`;
							} else if (rowObject.status === 2) {
								html += `<div class="btn-outline-danger float-right pl-2 pr-2 pt-1 pb-1" style="border-radius: 4px;border: 2px solid #dc3545; position: absolute; right: 20px; top: -17px; transform: rotate(30deg); font-weight: 600;">In process</div>`;
							}
							html += `</div></div>`;
							html += `</div>
								</div>
							</div>`;
							return html;
						}
					}
				],
				onRowClick: function (event) {
					if (event.rowData.id) {
						var path = 'tasks/model?id=' + event.rowData.task_uid+'&backcol='+self.collectionName;

						self.getApp().getRouter().navigate(path);
					}
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