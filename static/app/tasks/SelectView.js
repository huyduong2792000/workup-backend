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
			var data_render = this.model.toJSON()
			self.renderTime(data_render)
			this.$el.html(this.templete_item(data_render));
			self.renderSelectTask()
			return self;
		},
		renderTime:function(data_render){
			var self = this;
			var result = data_render
			if ( result['start_time'] != null){
				result['start_time'] =  moment.unix(self.model.get('start_time')).format("DD/MM/YY");
			}else{
				result['start_time'] = ""
			}
			if ( result['end_time'] != null){
				result['end_time'] =  moment.unix(self.model.get('end_time')).format("DD/MM/YY");
			}else{
				result['end_time'] = ""
			}
			return result
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
		},
		render: function () {
			var self = this
			// this.applyBindings();
			if(this.collection.page == null){
				self.uiControl.filters = {"$and": [{ "task_many_times": {"$eq":true}}]}
				var url = `/api/v1/tasks?page=1&results_per_page=10&q=${self.setupUrl()}`
				self.collection.url = url
			}
			this.collection.fetch({
				success:function(data){
					// console.log('collection',self.collection)
					self.renderSelectItem()
					self.renderPagination()
				},
				error:function(){
					self.getApp().notify(" Lấy dữ liệu không thành công!", { type: "danger" })
				}
				
			})
			
			return this;
		},
		setupUrl:function(){
			var self = this
			let filters = self.uiControl.filters||{}
			// console.log(filters)
			let order_by = self.uiControl.orderBy||{ field: "created_at", direction: "desc" }
			let url = {"filters":filters,"order_by":order_by}
			return JSON.stringify(url)
		},
		renderPagination:function(){
			var self = this;
			self.$el.find('#pag_grid ul').empty()
			self.$el.find("#next").off('click')
			self.$el.find("#previous").off('click')
			for (var i = 0 ;i< Math.min(self.collection.totalPages); i++){
				var html = `
					<li class="page-item ">
						<a class="page-link link-call-server" id="nav_item_pag_grid_1" href="javascript:void(0)"";>${i+1}</a>     
					</li>`
				self.$el.find('#pag_grid ul').append(html)
			}
			
			self.$el.find(".link-call-server").each(function(index,value){ 
				if(index+1 == self.collection.page){
					$(this).addClass('bg-primary text-light')
					var offset_parent = $('#pag_grid ul').offset().left +  10
					var offset_child = $(this).offset().left
					$('#pag_grid ul').animate({
						scrollLeft: offset_child - offset_parent
					}, 500);
				}
				$(this).click(function(){
					var page = index+1
					
					self.$el.find("#next").click(function(){
						page = Math.min(self.collection.page +1,self.collection.totalPages)
					})
					// $(this).css("marginLeft","10px")
					var url = `/api/v1/tasks?page=${page}&results_per_page=10&q=${self.setupUrl()}`
					self.collection.url = url
					self.render()
					return
				})
			})
			self.$el.find("#previous").on('click',function(){
				var page = Math.max(self.collection.page -1,1)
				var url = `/api/v1/tasks?page=${page}&results_per_page=10&q=${self.setupUrl()}`
					self.collection.url = url
					self.render()
			})
			self.$el.find("#next").on('click',function(){
				var page = Math.min(self.collection.page +1,self.collection.totalPages)
				var url = `/api/v1/tasks?page=${page}&results_per_page=10&q=${self.setupUrl()}`
					self.collection.url = url
					self.render()
			})
		},
		renderSelectItem:function(){
			var self = this
			// console.log(screen.height)
			self.$el.find("#task-select-item").empty()
			self.$el.find("#task-select-item").css('height',screen.height-5*screen.height/19)
			self.collection.models.forEach(function(item,index){
				var item_view = new itemView({model:item,selectedItems:self.uiControl.selectedItems});
				self.$el.find("#task-select-item").append(item_view.render().el);
			})
		}

	});

});