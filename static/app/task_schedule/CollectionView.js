define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/TaskScheduleSchema.json');

	var Helpers = require('app/common/Helpers');
	var templete_item_collection = require('text!./tpl/item_collection.html');
	var TimeFilterDialogView = require('app/common/filters/TimeFilterDialogView');

	var itemView = Gonrin.View.extend({

		templete_item: _.template(templete_item_collection),
		initialize:function(options){
			this.collectionName = options.collectionName
		},
		events:{
			'click':"routerModel"
		},
		render:function(){
			var self = this;
			var data_render = self.formatRender(this.model.toJSON())
			this.$el.html(this.templete_item(data_render));
			return self;
		},
		formatRender:function(data){
			var self = this
			var result = data
			result["day_of_week"] = self.formatDayOfWeek(result["day_of_week"])
			result["shift_of_day"] = self.formatShiftOfDay(result['shift_of_day'])
			result['Tasks'] = self.formatTasksName(result['Tasks'])
			result['active'] = self.formatActive(result['active'])
			result['start_time_working'] = moment.unix(result['start_time_working']).format("DD/MM/YYYY HH:MM");
			result['end_time_working'] = moment.unix(result['end_time_working']).format("DD/MM/YYYY HH:MM");
			result['create_at'] = Helpers.setDatetime(result['create_at']);

			return result
		},
		formatActive:function(active){
			var self = this;
			if(active == 1){
				return `<div class="btn-outline-success float-right pl-2 pr-2 pt-1 pb-1" style="border-radius: 4px;border: 2px solid #28a745; position: absolute; right: 20px; top: -17px; transform: rotate(30deg); font-weight: 600;">Active</div>`
			}else{
				return `<div class="btn-outline-danger float-right pl-2 pr-2 pt-1 pb-1" style="border-radius: 4px;border: 2px solid #dc3545; position: absolute; right: 20px; top: -17px; transform: rotate(30deg); font-weight: 600;">Deactive</div>`
			}
		},
		formatTasksName:function(tasks){
			var result = "";
			tasks.forEach(function(task,index){
				var task_name = task.task_name
				result += task_name + " ,"
			})
			result = result.slice(0,result.length-2)

			return result
		},
		formatShiftOfDay:function(shift_of_day){
			var self = this;
			var shifts = {0:"sáng",1:"chiều",2:"tối"};
			var result ="";
			var list_index_of_day_select = self.getIndexHasBeenSelect(shift_of_day)
			list_index_of_day_select.forEach(function(value,index){
				result +=" " + shifts[value] + ", "
			})
			return result
		},
		formatDayOfWeek:function(day_of_week){
			var self = this;
			var days = {0:"thứ 2",1:"thứ 3",2:"thứ 4",3:"thứ 5",4:"thứ 6",5:"thứ bảy", 6:"chủ nhật"};
			var result ="";
			var list_index_of_day_select = self.getIndexHasBeenSelect(day_of_week)
			list_index_of_day_select.forEach(function(value,index){
				result +=" " + days[value] + ", "
			})			
			result = result.slice(0,result.length-2)
			return result
		},
		
		getIndexHasBeenSelect: function(dividend){
			let list_index_select =[];
			var div_resule = dividend;
			var index_select=0;
			while(div_resule>0){
				var quotient = div_resule%2;
				if(quotient == 1){
					list_index_select.push(index_select)
				}
				index_select +=1;
				div_resule = parseInt(div_resule/2)	
			}
			return list_index_select
		},
		routerModel:function(){
			this.$el.addClass('click-collection-item')
			var path = this.collectionName + '/model?id=' + this.model.get('id');
			this.getApp().getRouter().navigate(path);
		},

		
	});


	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "task_schedule",
		uiControl: {
			orderBy: [{ field: "active", direction: "desc" }],
		},
		render: function () {
			var self = this;
			// this.applyBindings();
			if(this.collection.page == null){
				let start_today = new Date();
				start_today.setHours(0,0,0,0);
				start_today.setDate(start_today.getDate() + 1)
				let	timestamp_filter = Date.parse(start_today)/1000
				self.uiControl.filters = {"$and": [{ "start_time_working": { "$lte":timestamp_filter}},{ "end_time_working": { "$gt": timestamp_filter}}]}
				var url = `/api/v1/task_schedule?page=1&results_per_page=10&q=${self.setupUrl()}`
				self.collection.url = url
			}
			this.collection.fetch({
				success:function(data){
					self.renderCollectionItem()
					self.renderPagination()
				},
				error:function(){
					self.getApp().notify(" Lấy dữ liệu không thành công!", { type: "danger" })
				}
				
			})
			self.$el.find("#filter-data-by-status").off('change')
			var filter_data = self.$el.find("#filter-data-by-status");
			filter_data.on("change", function () {
				self.setupFilter();
			});
		},
		setupFilter: function () {
			var self = this;
			
			let active = self.$el.find("#filter-data-by-status").val();
			let start_today = new Date();
				start_today.setHours(0,0,0,0);
				start_today.setDate(start_today.getDate() + 1)
			let	timestamp_filter = Date.parse(start_today)/1000

			if (active == "0") {
				self.uiControl.filters = {"$and": [{ "start_time_working": { "$lte":timestamp_filter}},{ "end_time_working": { "$gte": timestamp_filter}}]}
				var url = `/api/v1/task_schedule?page=1&results_per_page=10&q=${self.setupUrl()}`
				self.collection.url = url
				self.render()

			} else if (active == "1") {
				let start_tomorrow = new Date();
				start_tomorrow.setHours(0,0,0,0);
				start_tomorrow.setDate(start_tomorrow.getDate() + 1)
				timestamp_filter = Date.parse(start_tomorrow)/1000

				self.uiControl.filters = {"$and": [{ "start_time_working": { "$lte": timestamp_filter }},{ "end_time_working": { "$gte": timestamp_filter}}]}
				var url = `/api/v1/task_schedule?page=1&results_per_page=10&q=${self.setupUrl()}`
				self.collection.url = url
				self.render()

			} else if(active == "2"){
				self.uiControl.filters ={}
				var url = `/api/v1/task_schedule?page=1&results_per_page=10&q=${self.setupUrl()}`
				self.collection.url = url
				self.render()
			} else if(active="3"){
				var timeFilterDialog = new TimeFilterDialogView();
				timeFilterDialog.dialog();
				timeFilterDialog.on('filter', (data) => {
					console.log('data',data)
					let from_time = data.from_time;
					let to_time = data.to_time;
					self.uiControl.filters = {"$and": [{ "start_time_working": { "$gte": from_time }},{ "end_time_working": { "$lte": to_time}}]}
					var url = `/api/v1/task_schedule?page=1&results_per_page=10&q=${self.setupUrl()}`
					self.collection.url = url
					self.render()
				});
			}
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
					var url = `/api/v1/task_schedule?page=${page}&results_per_page=10&q=${self.setupUrl()}`
					self.collection.url = url
					self.render()
					return
				})
			})
			self.$el.find("#previous").on('click',function(){
				let page = Math.max(self.collection.page -1,1)
				
				var url = `/api/v1/task_schedule?page=${page}&results_per_page=10&q=${self.setupUrl()}`
					self.collection.url = url
					self.render()
			})
			self.$el.find("#next").on('click',function(){
				var page = Math.min(self.collection.page +1,self.collection.totalPages)
				var url = `/api/v1/task_schedule?page=${page}&results_per_page=10&q=${self.setupUrl()}`
					self.collection.url = url
					self.render()
			})
		},
		renderCollectionItem:function(){
			var self = this
			self.$el.find("#collection-item").empty()
			if(self.collection.models.length ==0){
				self.$el.find('#no_res_grid').show()
			}else{
				self.$el.find('#no_res_grid').hide()
				self.collection.models.forEach(function(item,index){
					var item_view = new itemView({model:item,collectionName:self.collectionName});
					self.$el.find("#collection-item").append(item_view.render().el);
				})
			}
			
		}

	});

});