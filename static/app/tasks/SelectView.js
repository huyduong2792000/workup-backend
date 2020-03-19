define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/select.html'),
		schema = require('json!schema/TasksSchema.json');
	var Helpers = require('app/common/Helpers');
	var templete_item_select = require('text!app/tasks/tpl/item_select.html');

	var itemView = Gonrin.View.extend({
		tagName:'div',
		templete_item: _.template(templete_item_select),
		initialize:function(options){
			this.selectedItems = options.selectedItems
		},
		events:{
			'click #task_name_field':"showDetail",
			'click #select_task':"selectTask",
			'click #detail':"closeDetail"
		},
		render:function(){
			var self = this;
			this.$el.html(this.templete_item(this.model.toJSON()));
			self.renderSelectTask()
			return self;
		},
		closeDetail:function(){
			var self = this;
			self.$el.find('#detail').slideUp()
		},
		selectTask:function(){
			var self = this
			if (self.$el.find('#select_task').prop("checked") == true){
				self.selectedItems.push(self.model.toJSON())
				self.renderSelectTask()
			}else{
				var index_check = self.selectedItems.findIndex(function(value,index){
					return value.id == self.model.get('id')
				})
				self.selectedItems.splice(index_check,1)
			}
		},
		renderSelectTask:function(){
			var self = this;
			
			var index_check = self.selectedItems.findIndex(function(value,index){
				return value.id == self.model.get('id')
			})
			if (index_check != -1){
				self.$el.find('#select_task').prop('checked',true)
			}
			console.log('index_check',index_check)
		},
		showDetail:function(){
			var self = this;
			$('.detail').slideUp()
			self.$el.find('#detail').slideToggle()
		},
	
	});
	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "tasks",
		textField: "task_name",
		tools: [
			{
				name: "close",
				type: "button",
				buttonClass: "btn btn-danger btn-md margin-left-5",
				label: "Close",
				command: function () {
					this.close();
				}
			},
			{
				name: "select",
				type: "button",
				buttonClass: "btn btn-primary btn-md margin-left-5",
				label: "TRANSLATE:SELECT",
				command: function () {
					this.trigger("onSelected");
					this.close();
				}
			},
		],
		uiControl: {
			orderBy: [{ field: "created_at", direction: "desc" }],

			// fields: [
			// 	{ field: "task_name", label: "Tên" },
			// 	// { field: "priority", label: "Mức độ" },
			// 	{ field: "status", label: "Trạng thái" },
			// 	{
			// 		field: "start_time", label: "Thời gian bắt đầu", template: function (rowObj) {
			// 			return Helpers.setDatetime(rowObj.start_time);
			// 		}
			// 	},
			// 	{
			// 		field: "end_time", label: "Thời gian kết thúc", template: function (rowObj) {
			// 			return Helpers.setDatetime(rowObj.end_time);
			// 		}
			// 	},
			// ],
			// onRowClick: function (event) {
			// 	this.uiControl.selectedItems = event.selectedItems;
			// },
		},
		render: function () {
			// this.applyBindings();
			var self = this;
			this.collection.fetch({
				success:function(data){
					self.renderSelectItem()
				},
				error:function(){
					self.getApp().notify(" Lấy dữ liệu không thành công!", { type: "danger" })
				}
				
			})
			
			return this;
		},
		renderSelectItem:function(){
			var self = this
			self.$el.find("#task-select-item").empty()
			
			self.$el.find("#task-select-item").css('height',screen.height-160)
			self.collection.models.forEach(function(item,index){
				var item_view = new itemView({model:item,selectedItems:self.uiControl.selectedItems});
				self.$el.find("#task-select-item").append(item_view.render().el);
			})
		}

	});

});