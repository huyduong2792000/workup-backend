define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/WorkstationSchema.json');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "workstation",
		uiControl: {
			fields: []
		},
		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				//progresbar quay quay
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.switchUIRegister();
					},
					error: function () {
						self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
					},
				});
			} else {
				self.applyBindings();
				self.switchUIRegister();
			}

		},

		switchUIRegister: function () {
			const self = this;
			self.model.set("active", true);

			self.$el.find(".switch input[id='active']").unbind("click").bind("click", function ($event) {
				if ($(this).is(":checked")) {
					self.model.set("deleted", false);
				} else {
					self.model.set("deleted", true);
				}
			})

			if (!self.model.get("deleted")) {
				self.$el.find(".switch input[id='active']").trigger("click");
			}
		}
	});

});