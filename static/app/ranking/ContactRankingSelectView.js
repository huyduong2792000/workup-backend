define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/contact-ranking-select.html'),
		schema = require('json!schema/ContactRankingSchema.json');
	var config = require('json!app/config.json');
	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "contactranking",
		tools: [
			{
				name: "close",
				type: "button",
				buttonClass: "btn btn-danger btn-md margin-left-5",
				label: "Close",
				command: function () {
					this.close();
				}
			},
			{
				name: "select",
				type: "button",
				buttonClass: "btn btn-primary btn-md margin-left-5",
				label: "TRANSLATE:SELECT",
				command: function () {
					this.trigger("onSelected");
					this.close();
				}
			}
		],
		uiControl: {
			orderBy: [
				{ field: "start_scores", direction: "desc" }
			],
			fields: [
				{ field: "name", label: "Tên hạng" },
				{ field: "start_scores", label: "Từ" },
				{ field: "end_scores", label: "Đến" }
			],
			onRowClick: function (event) {
				this.uiControl.selectedItems = event.selectedItems;
			}
		},
    	/**
    	 * 
    	 */
		render: function () {
			var self = this;
			self.applyBindings();
			return self;
		}

	});

});