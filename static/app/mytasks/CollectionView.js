define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/TasksEmployeesSchema.json');

	var Helpers = require('app/common/Helpers');


	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "tasks_employees",
		uiControl: {
			orderBy: [{ field: "created_at", direction: "desc" }],

			fields: [
				{ field: "task", label: "Công việc", textField: "task_name" },
				{ field: "employee", label: "Nhân viên", textField: "full_name" },
				{
					field: "created_at", label: "Ngày tạo", template: function (rowObj) {
						return Helpers.setDatetime(rowObj.created_at);
					}
				}
			],
			onRowClick: function (event) {
				if (event.rowId) {
					var path = this.collectionName + '/model?id=' + event.rowId;
					this.getApp().getRouter().navigate(path);
				}
			}
		},

		render: function () {
			this.applyBindings();
			this.eventRegister();
			return this;
		},
		eventRegister: function(){
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
					console.log(data);
					let dataSource = [];
					self.loadGridData(dataSource);
					
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
						field: "order_datetime",
						label: " ",
						template: function (rowObject) {
							var html = `<div style="overflow-x: hidden; background-color: #fff; padding: 5px 5px; position: relative;">
								<div class="row title">
									<div class="col-lg-12 col-sm-12 col-12">
										<div class="float-left">Hoá đơn mã: <span style="color: #17a2b8;">${rowObject.salesorder_no ? rowObject.salesorder_no : ''}</span></div>
										<div class="float-right text-dark">${Helper.utcToLocal(rowObject.order_datetime, "YYYY-MM-DD")}</div>
									</div>
								</div>`;
							html += `<div class="row">
									<div class="col-lg-12 col-sm-12 col-12">
										<div class="float-left mr-2">Thanh toán: </div>
										<div class="btn-default float-left pl-1 pr-1">${TemplateHelper.currencyFormat(rowObject.amount, false, 'đ')}</div>
									</div>
								</div>`;
							html += `<div class="row">
									<div class="col-lg-12 col-md-12 col-sm-12 col-12">
										<div class="btn-default float-left mr-2 pl-1 pr-1" style="border-radius: 4px; border: 0.5px solid #ccc;">${Helper.utcToLocal(rowObject.created_at, "HH:mm")}</div>
										<div class="btn-default float-left mr-2 pl-1 pr-1" style="border-radius: 4px; border: 0.5px solid #ccc;">${Helper.utcToLocal(rowObject.updated_at, "HH:mm")}</div>`;
							if (rowObject && rowObject.payment_status && rowObject.payment_status == "paid" && !rowObject.deleted) {
								html += `<div class="btn-outline-success float-right pl-2 pr-2 pt-1 pb-1" style="border-radius: 4px;border: 2px solid #28a745; position: absolute; right: 20px; top: -17px; transform: rotate(30deg); font-weight: 600;">PAID</div>`;
							} else if (rowObject && rowObject.payment_status && rowObject.payment_status == "ordering" && !rowObject.deleted) {
								html += `<div class="btn-outline-warning float-right pl-1 pr-1" style="border-radius: 4px;">Đang đợi</div>`;
							} else if (rowObject.deleted === true) {
								html += `<div class="btn-outline-danger float-right pl-2 pr-2 pt-1 pb-1" style="border-radius: 4px;border: 2px solid #dc3545; position: absolute; right: 20px; top: -17px; transform: rotate(30deg); font-weight: 600;">REMOVED</div>`;
							} else {
								html += `<div class="btn-outline-default float-right pl-1 pr-1" style="border-radius: 4px;">${rowObject.payment_status}</div>`;
							}
							if (rowObject.total_discount_amount > 0) {
								html += `<div class="btn-default text-danger float-left pl-1 pr-1" style="border-radius: 4px; border: 0.5px solid #ccc;">
									<span class="fa fa-tag" style="font-size: 12px;"></span>
									${TemplateHelper.currencyFormat(rowObject.total_discount_amount, false, 'đ')}
								</div>`;
							}
							html += `</div>
								</div>
							</div>`;
							return html;
						}
					}
				],
				onRowClick: function (event) {
					if (event.rowData._id) {
						var path = 'salesorder/model?id=' + event.rowData._id;
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