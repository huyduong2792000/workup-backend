define(function (require) {
    "use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/TaskScheduleSchema.json');
	var TaskInfoSelectView = require('app/task_info/SelectView');
	var Helpers = require('app/common/Helpers');
    var ItemFilterView = Gonrin.View.extend({
		template_filter: _.template(`<div class="dropdown-item task-filter-item"><%= task_name %></div>`),
		initialize: function(options) {
            this.task_select = options.task_select
		},
		render:function(){
            var self = this;
            this.$el.html(this.template_filter(self.task_select));
			return this;
		},
    })
    return Gonrin.View.extend({
        // tagName:'li',
        template_filter:`<div id="task-filter"></div>`,
		// template_filter: `<div class="dropdown-item task-filter-item">Another action</div>`,
		initialize: function(options) {
            this.tasks_select = options.tasks_select
		},
		render:function(){
            var self = this;
            self.$el.empty()
            self.tasks_select.forEach(function (task_select,index){
                var item_filter_view = new ItemFilterView({task_select:task_select})
                self.$el.append(item_filter_view.render().el)
            })
			return this;
		},
	});
});