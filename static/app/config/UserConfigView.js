define(function (require) {

	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin'),
        template = require('text!./tpl/user-config.html');

	var ObjectRefactor = require("app/common/ObjectRefactor");
	
	var userConfigSchema = {
		"show_navbar": {
			"type": "boolean"
		},
		"theme_color": {
			"type": "string"
		}
	};

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: userConfigSchema,
		urlPrefix: "/api/v1/",
        collectionName: "user",

		render: function () {
			var self = this;
			if (self.viewData) {
				self.model.set(self.viewData);
			}
            this.applyBindings();
            this.eventRegister()
            this.switchUIRegister();
			this.$el.find("#theme_color").colorpicker('setValue', self.model.get("theme_color"));
			$('[data-toggle="tooltip"]').tooltip();
        },

        eventRegister: function() {
            const self = this;

            self.$el.find("#theme_color").unbind("change").bind("change", function(event) {
                self.model.set("theme_color", event.target.value);
                self.trigger("change", self.model.toJSON());
			});
        },

        switchUIRegister: function () {
			const self = this;
			self.$el.find(".switch input[id='show_navbar_switch']").unbind("click").bind("click", function ($event) {
				if ($(this).is(":checked")) {
					self.model.set("show_navbar", true);
				} else {
					self.model.set("show_navbar", false);
                }
                self.trigger("change", self.model.toJSON());
			});

			if (self.model.get("show_navbar") == true) {
				self.$el.find(".switch input[id='show_navbar_switch']").trigger("click");
			}
		}
	});

});