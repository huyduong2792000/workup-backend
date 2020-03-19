define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/collection.html'),
		schema = require('json!schema/TaskScheduleSchema.json');

	var Helpers = require('app/common/Helpers');
	var templete_item_collection = require('text!./tpl/item_collection.html');
	var itemView = Gonrin.View.extend({
		// tagName:'tr',

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
			result['start_time_working'] = moment.unix(result['start_time_working']).format("DD/MM/YYYY ");
			result['end_time_working'] = moment.unix(result['end_time_working']).format("DD/MM/YYYY ");
			result['create_at'] = Helpers.setDatetime(result['create_at']);
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
			orderBy: [{ field: "start_time_working", direction: "desc" }],
			// fields: [
			// 	{ field: "day_of_week", label: "Thứ" },
			// 	{ field: "shift_of_day", label: "Giờ làm" },
			// 	{
			// 		field: "start_time_working", label: "Ngày bắt đầu", template: function (rowObj) {
			// 			return moment.unix(rowObj.start_time_working).format("DD/MM/YYYY ");
			// 		}
			// 	},
			// 	{
			// 		field: "end_time_working", label: "Ngày kết thúc", template: function (rowObj) {
			// 			return moment.unix(rowObj.end_time_working).format("DD/MM/YYYY");
			// 		}
			// 	},
			// 	{
			// 		field: "created_at", label: "Ngày tạo", template: function (rowObj) {
			// 			return Helpers.setDatetime(rowObj.created_at);
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
			var self = this;
			// this.applyBindings();
			console.log('collection',this.collection)
			this.collection.fetch({
				success:function(data){
					self.renderCollectionItem()
				},
				error:function(){
					self.getApp().notify(" Lấy dữ liệu không thành công!", { type: "danger" })
				}
				
			})
			
			return this;
		},
		renderCollectionItem:function(){
			var self = this
			self.collection.models.forEach(function(item,index){
				var item_view = new itemView({model:item,collectionName:self.collectionName});
				self.$el.find("#collection-item").append(item_view.render().el);
			})
		}

	});

});