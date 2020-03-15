define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/message-filter.html');
	var schema = {
		"contact_phone": {
			"type": "string"
		},
		"birthday_from": {
			"type": "string"
		},
		"birthday_to": {
			"type": "string"
		},
		"score_from": {
			"type": "string"
		},
		"score_to": {
			"type": "string"
		},
		"page_id": {
			"type": "string"
		}
	};


	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "message",
		uiControl: {
			fields: [
			]
		},
		render: function () {
			var self = this;
			this.applyBindings();
			
			this.model.on("change", function(event) {
				self.trigger("change", self.model.toJSON());
			});
			
			this.$el.find("#filter-btn").unbind("click").bind("click", function(event) {
				self.trigger("filter", self.model.toJSON());
			});
			
			self.$el.find('#birthday_from').datetimepicker({
				defaultDate: self.model.get("birthday_from") ? self.model.get("birthday_from") : false,
				format: "DD/MM",
				icons: {
					time: "fa fa-clock"
				}
			});

			self.$el.find('#birthday_from').on('change.datetimepicker', function (e) {
				if (e && e.date) {
					self.model.set("birthday_from", e.date.local().format("YYYY-MM-DD HH:mm:ss"))
				} else {
					self.model.set("birthday_from", null);
				}
			});
			
			self.$el.find('#birthday_to').datetimepicker({
				defaultDate: self.model.get("birthday_to") ? self.model.get("birthday_to") : false,
				format: "DD/MM",
				icons: {
					time: "fa fa-clock"
				}
			});

			self.$el.find('#birthday_to').on('change.datetimepicker', function (e) {
				if (e && e.date) {
					self.model.set("birthday_to", e.date.local().format("YYYY-MM-DD HH:mm:ss"))
				} else {
					self.model.set("birthday_to", null);
				}
			});
		},
	});

});