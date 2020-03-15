define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/ranking.html'),
		schema = require('json!schema/ContactSchema.json');



	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "contact",
		uiControl: {
			fields: [],
		},
		render: function () {
			this.applyBindings();


			$('input.rating').rating({
				filled: 'glyphicon glyphicon-star',
				empty: 'glyphicon glyphicon-star-empty'
			});
		}
	});

});