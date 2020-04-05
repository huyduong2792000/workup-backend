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
	var TaskItemView = require('./TaskItemView')
	
	return Gonrin.CollectionView.extend({
		render: function () {
			// this.applyBindings();
			var self = this;
			self.collection = self.viewData
			self.loadGridData()
			return self;
		},
		loadGridData: function () {
			var self = this;
			self.$el.append(`<div class="row p-0 m-0" style="border-top: 1px solid #00bcd4;background-color:#e3fffe;">
			<div class="col-lg-4 col-sm-4 col-4 p-0 m-0">
				<div class="text-center mx-0">Tên việc</div>
			</div>
			<div class="col-lg-4 col-sm-4 col-4 px-0">
				<div class="pr-1 text-center">Số người nhận</div>
			</div>
			
			<div class="col-lg-4 col-sm-4 col-4">
				<div class="text-center" >act</div>
			</div>
		</div>`)
			self.collection.forEach(function (task,index) {
				var task_view = new TaskItemView({model:task})
				self.$el.append(task_view.render().$el)
			})
			
		}
	});

});