define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/TaskScheduleSchema.json');
	var TaskSelectView = require('app/tasks/SelectView');



	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "task_schedule",
		uiControl: {
			fields: [
				
				{
					field: "Tasks",
					uicontrol: "ref",
					textField: "task_name",
					selectionMode: "multiple",
					foreignRemoteField: "id",
					size: "large",
					dataSource: TaskSelectView
				},
				
			]
		},
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-default btn-sm",
						label: "TRANSLATE:BACK",
						command: function () {
							var self = this;
							Backbone.history.history.back();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "Lưu",
						command: function () {
							var self = this;
							// self.processSave();

							if (self.validated()) {

								self.model.save(null, {
									success: function (model, respose, options) {
										self.getApp().notify("Lưu thông tin thành công", { type: "info" });
										var path = self.collectionName + '/collection';
										self.getApp().getRouter().navigate(path);
									},
									error: function (model, xhr, options) {
										self.getApp().notify('Lưu thông tin không thành công!', { type: "warning" });

									}
								});
							}


						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger btn-sm",
						label: "TRANSLATE:DELETE",
						// visible: function(){
						// 	return this.getApp().getRouter().getParam("id") !== null;
						// },
						command: function () {
							var self = this;
							self.model.destroy({
								success: function (model, response) {
									self.getApp().notify('Xoá dữ liệu thành công');
									self.getApp().getRouter().navigate(self.collectionName + "/collection");
								},
								error: function (model, xhr, options) {
									self.getApp().notify('Xoá dữ liệu không thành công!');

								}
							});
						}
					},
				],
			}],

		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				//progresbar quay quay
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.eventRegister()
					},
					error: function () {
						self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
					},
				});
			} else {
				self.applyBindings();
				self.eventRegister()
			}
		},
		eventRegister: function() {
            const self = this;
            var id = this.getApp().getRouter().getParam("id");
			self.eventTimeWorking("#start_time_working",'start_time_working')
			self.eventTimeWorking("#end_time_working",'end_time_working')
			self.eventDayOfWeek()
			self.eventShiftOfDay()
		},

		eventDayOfWeek:function(){
			var self = this;
			var day_of_week = self.model.get('day_of_week') || 0;
			var list_indexof_day_hasbeen_select = self.getIndexHasBeenSelect(day_of_week)
			self.$el.find(".day_of_week").each(function(index,value){
				//check day has been select 	
				if(list_indexof_day_hasbeen_select.indexOf(index) != -1){
					$(this).toggleClass('text-light active-day-of-week')
				}
				//select new day of week and convert to 2^n
				$(this).click(function(){
					$(this).toggleClass('text-light active-day-of-week')
					if($(this).hasClass('active-day-of-week')){
						day_of_week += Math.pow(2,index)
					}else{
						day_of_week -= Math.pow(2,index)

						day_of_week = Math.max(0,day_of_week)
					}
					self.model.set({'day_of_week':day_of_week})
				})
			})
		},
		eventShiftOfDay:function(){
			var self = this;
			var shift_of_day = self.model.get('shift_of_day') || 0;
			var list_indexof_shift_hasbeen_select = self.getIndexHasBeenSelect(shift_of_day)
			self.$el.find(".shift_of_day").each(function(index,value){
				//check day has been select 	
				if(list_indexof_shift_hasbeen_select.indexOf(index) != -1){
					$(this).toggleClass('text-light active-shift-of-day')
				}
				//select new day of week and convert to 2^n
				$(this).click(function(){
					$(this).toggleClass('text-light active-shift-of-day')
					if($(this).hasClass('active-shift-of-day')){
						shift_of_day += Math.pow(2,index)
					}else{
						shift_of_day -= Math.pow(2,index)

						shift_of_day = Math.max(0,shift_of_day)
					}
					self.model.set({'shift_of_day':shift_of_day})
				})
			})
		},
		getIndexHasBeenSelect: function(dividend){
			let list_index_of_day_select =[];
			var div_resule = dividend;
			var index_of_day_select=0;
			while(div_resule>0){
				var quotient = div_resule%2;
				if(quotient == 1){
					list_index_of_day_select.push(index_of_day_select)
				}
				index_of_day_select +=1;
				div_resule = parseInt(div_resule/2)	
			}
			return list_index_of_day_select
		},
		eventTimeWorking :function(selector,field){
			var self = this;
			var time_working = null;
            if (self.model.get(field) != 0){
				time_working = moment.unix(self.model.get(field)).format("YYYY-MM-DD");
			}else{
				time_working = null
			}
			
            self.$el.find(selector).datetimepicker({
                defaultDate: time_working,
                format: "DD/MM/YYYY",
                icons: {
                    time: "fa fa-clock"
                }
            });

            self.$el.find(selector).on('change.datetimepicker', function(e) {
                if (e && e.date) {
					var dateFomart = moment(e.date).unix()
					self.model.set(field, dateFomart)
					self.clearDayOfWeek()
					self.calculateDayOfWeek()
                } else {
                    self.model.set(field, null);
				}
				
            });
		},
		calculateDayOfWeek:function(){
			var self = this
			var day_of_week = 0;
			let list_day_of_week = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
			let start_time_working = self.model.get('start_time_working')
			let end_time_working = self.model.get('end_time_working')
			let index_start_timeworking = self.findIndexTimeWorking(start_time_working)
			let index_end_time_working = self.findIndexTimeWorking(end_time_working)
			
			//check range start to end time working >7 ?
			start_time_working = new Date(start_time_working*1000)
			end_time_working = new Date(end_time_working*1000)
			const oneDay = 24 * 60 * 60 * 1000;
			const diffDays = Math.round(Math.abs((start_time_working - end_time_working) / oneDay));
			if(diffDays>7){
				self.fillDayOfWeek()
				return
			}
			
			if(index_start_timeworking <= index_end_time_working){
				for(var index = index_start_timeworking; index<=index_end_time_working; index++ ){
					day_of_week += Math.pow(2,index)
				}
			}else{
				index_start_timeworking = (list_day_of_week.length - index_start_timeworking)*-1
				for(var index = index_start_timeworking; index<=index_end_time_working; index++ ){
					day_of_week += Math.pow(2,index>=0?index:index+list_day_of_week.length)
				}
			}
			
			self.model.set({day_of_week:day_of_week})
			
			self.eventDayOfWeek()

		},

		findIndexTimeWorking:function(time_working){
			time_working = new Date(time_working*1000)
			var index_time_working = time_working.getDay() - 1; // index -1 because start by "monday" not sunday
			//[sunday,monday,tuesdsy...] -> [monday,tuesday,wednesday...]
			if (index_time_working == -1){
				return 6
			}else{
				return index_time_working
			}
		},

		fillDayOfWeek:function(){
			var self = this
			var day_of_week = 0;
			self.$el.find(".day_of_week").each(function(index,value){
				$(this).addClass('text-light active-day-of-week')
				if($(this).hasClass('active-day-of-week')){
					day_of_week += Math.pow(2,index)
				}else{
					day_of_week -= Math.pow(2,index)

					day_of_week = Math.max(0,day_of_week)
				}
				self.model.set({'day_of_week':day_of_week})
		
			})
		},
		clearDayOfWeek:function(){
			var self = this
			var day_of_week = 0;
			self.$el.find(".day_of_week").each(function(index,value){
				$(this).removeClass('text-light active-day-of-week')
				
			})
			self.model.set({'day_of_week':day_of_week})
		},
		validated: function () {
			let self = this;
			let start_time_working = self.model.get("start_time_working")
			let end_time_working = self.model.get("end_time_working")
			if (start_time_working == 0 || end_time_working == 0){
				self.getApp().notify("Thời gian bắt đầu, thời gian kết thúc không được bỏ trống!", { type: "warning" })
				return false
			}else{
				return true
			}

		},
	});

});