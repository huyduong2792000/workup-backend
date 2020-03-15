define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/select.html'),
		schema = require('json!schema/WorkstationSchema.json');

	return Gonrin.CollectionDialogView.extend({
		//selectedItems : [],  //[] may be array if multiple selection
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "workstation",
		textField: "workstation_name",
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
			},
		],
		uiControl: {
			fields: [
				{ field: "workstation_name", label: "Tên điểm bán" }
			],
			onRowClick: function (event) {
				var select = [];
				for (var i = 0; i < event.selectedItems.length; i++) {
					var obj = {
						id: event.selectedItems[i].id,
						workstation_name: event.selectedItems[i].workstation_name,
					}
					select.push(obj);
				}
				this.uiControl.selectedItems = select;
			},
		},
		render: function () {
			this.applyBindings();
		}
	});

});