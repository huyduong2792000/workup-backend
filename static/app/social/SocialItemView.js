define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var itemTemplate = require('text!./tpl/socialitemview.html');

	var itemSchema = {};

	var listSocials = [
		{
			"value": "zalo",
			"text": "zalo"
		},
		{
			"value": "facebook",
			"text": "facebook"
		}
	];

	return Gonrin.ItemView.extend({
		template: itemTemplate,
		tagName: 'tr',
		modelSchema: itemSchema,
		urlPrefix: "/api/v1/",
		collectionName: "socialcontact",
		foreignRemoteField: "id",
		foreignField: "contact_id",
		uiControl: {
			fields: [
				{
					field: "name",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: listSocials
				}
			]
		},
		render: function () {
			var self = this;
			this.applyBindings();

			self.$el.find("#itemRemove").unbind("click").bind("click", function () {
				// true mean: to remove item in database, you must save parent model
				self.remove(true);
			});
		}
	});

});