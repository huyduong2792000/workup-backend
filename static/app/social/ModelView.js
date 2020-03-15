define(function (require) {
	"use strict";

	var $ = require("jquery"),
		_ = require("underscore"),
		Gonrin = require("gonrin");

	var template = require("text!./tpl/model.html");

	var schema = {};

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "socialcontact",
		uiControl: {
			fields: []
		},
		tools: [
			{
				name: "apply",
				type: "button",
				buttonClass: "btn-primary btn-sm",
				label: "Lưu",
				command: function () {
					this.model.save(null, {})
				}
			}
		],

		render: function () {
			var self = this;
			console.log("SocialModelView: ", self.model.get("contact_id"));
			self.applyBindings();
		}
	});

});