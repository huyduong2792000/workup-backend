define(function (require) {

	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin'),
		template = require('text!./tpl/feature-config.html');

	var featureConfigSchema = {
		"contact_code_prefix": {
			"type": "string"
		},
		"contact_code_length": {
			"type": "number",
			"default": 5
		},
		"score": {
			"type": "dict"
		},
		"promotion_by_contact_info": {
			"type": "boolean",
			"default": true
		}
	};

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: featureConfigSchema,
		urlPrefix: "/api/v1/",
		collectionName: "config",

		render: function () {
			var self = this;
			if (self.viewData) {
				self.model.set(self.viewData);
			}
			this.applyBindings();
			this.eventRegister()
			this.switchUIRegister();
			$('[data-toggle="tooltip"]').tooltip();
		},

		eventRegister: function () {
			const self = this;
			self.model.on("change", function (event) {
				self.makeContactCodeReview();
				self.trigger("change", self.model.toJSON());
			});

			self.$el.find("#score_ratio").unbind("change").bind("change", function(event) {
				if (!parseFloat(event.target.value)) {
					self.$el.find("#score_ratio").val(0);
				}
				var score = self.model.get("score") ? self.model.get("score") : {};
				score.score_ratio = event.target.value;
				self.model.set("score", score);
			});
			
			// SET VALUE INTO SCORE RATIO INPUT WHEN INITAILIZE VIEW
			var score = self.model.get("score");
			if (score && score.score_ratio) {
				self.$el.find("#score_ratio").val(score.score_ratio);
			} else {
				self.$el.find("#score_ratio").val(0);
			}
			self.makeContactCodeReview();
		},

		switchUIRegister: function () {
			const self = this;
			self.$el.find(".switch input[id='promotion_by_contact_info_switch']").unbind("click").bind("click", function ($event) {
				if ($(this).is(":checked")) {
					self.model.set("promotion_by_contact_info", true);
				} else {
					self.model.set("promotion_by_contact_info", false);
				}
			});

			if (self.model.get("promotion_by_contact_info") == true) {
				self.$el.find(".switch input[id='promotion_by_contact_info_switch']").trigger("click");
			}
		},
		
		makeContactCodeReview: function() {
			const self = this;
			var contactCodeExample = "";
			if (self.model.get("contact_code_prefix")) {
				contactCodeExample += self.model.get("contact_code_prefix");
			}
			if (self.model.get("contact_code_length")) {
				for (var i = 1; i <= self.model.get("contact_code_length"); i++) {
					contactCodeExample += String(i);
				}
			}
			
			self.$el.find("#contact_code_review").html("("+contactCodeExample+")");
		}
	});

});