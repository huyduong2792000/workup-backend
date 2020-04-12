define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');
    
    var GroupItemView = Gonrin.View.extend({
        template_item: _.template(`<div class="row mb-0 py-1" style="border-top: 1px solid #dee2e6; font-size:16px;">
        <div class="col-lg-8 col-md-8 col-sm-8 col-8 text-center">
        <%= name %></div>
        <div class="col-lg-4 col-md-4 col-sm-4 col-4 float-right" id="follow">
        </div></div>`),
        initialize:function (options) {
            this.isFollow = options.isFollow
            this.groupSelect = options.groupSelect
            this.id_employee = options.id_employee
        },
        events:{
            'click #follow':'setGroupSelect'
        },
        setGroupSelect:function () {
            var self = this;
            let follow_el = self.$el.find("#follow")
            if (follow_el.hasClass('follow-group')){
                self.groupSelect.push(self.model)
                self.isFollow = true
                self.render()
            }else{
                if(self.id_employee != self.model.supervisor_uid){
                    self.groupSelect.splice(self.groupSelect.findIndex((group)=>group.id == self.model.id),1)
                    self.isFollow = false
                    self.render()
                }else{
                    self.getApp().notify({ message: "Quản trị viên không được rời nhóm" }, { type: "danger" });

                }
                
            }
        },
        render:function () {
            var self = this;
            this.$el.html(this.template_item(this.model))
            if(this.isFollow == true){
                self.$el.find('#follow').addClass("unfollow-group").text('unfollow')
            }else{
                self.$el.find('#follow').addClass("follow-group").text('follow')
            }
            return this
        }
    });
    return Gonrin.View.extend({
        initialize:function(options){
            this.groups = options.groups
            this.id_employee = options.id_employee
            this.page = 0
            this.total_pages=1
        },
        events:{
            'click #view-more-button':"loadMoreGroup"
        },
        render:function(){
            var self = this;
            self.$el.append(`<div class="row">
                            <div class="col-12">
                                <h5 class="text-uppercase">nhóm đã tham gia</h5>
                            </div>
                            </div>`)
            self.groups.forEach(function (group) {
                let group_itemview = new GroupItemView({id_employee:self.id_employee,groupSelect:self.groups,model:group,isFollow:true})
                self.$el.append(group_itemview.render().el)	
            })

            self.$el.append(`
            <div id="view-more-group"></div>
            <div class="row">
            <div class="col-lg-12 col-md-12 col-sm-12 col-12 text-right p-0 m-0" id="view-more-button"
            style="border-top: 1px solid #dee2e6;">xem thêm<i class="fas fa-chevron-circle-down"></i></div>
            </div>`)
            self.eventRegister()
            return self;
        },
        loadMoreGroup:function(){
            var self = this
            $.ajax({
                url: `/api/v1/task_group?page=${Math.min(self.page+=1,self.total_pages)}&results_per_page=15&q={%22order_by%22:[{%22field%22:%22created_at%22,%22direction%22:%22desc%22}]}`,
                method: "GET",
                contentType: "application/json",
                headers: {
                },
                beforeSend: function () {
                },
                success: function (data) {
                    self.total_pages = data.total_pages
                    self.renderMoreGroup(data.objects)
                },
                error: function (xhr, status, error) {
                    self.getApp().notify("Đã có lỗi xảy ra vui lòng thử lại sau ", { type: "danger" });
                },
            });
            
        },
        renderMoreGroup:function (more_groups) {
            var self = this;
            self.$el.find('#view-more-group').empty()
            more_groups.forEach(function(more_group){
                if(self.groups.findIndex((group) => group.id == more_group.id) == -1){
                    let group_itemview = new GroupItemView({id_employee:self.id_employee,groupSelect:self.groups,model:more_group,isFollow:false})
                    self.$el.find('#view-more-group').append(group_itemview.render().el)
                }
            })
        },
        eventRegister:function () {
            
        }
    })
})