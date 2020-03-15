define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/switch-workstation.html'),
		schema = require('json!schema/WorkstationSchema.json');

	return Gonrin.DialogView.extend({
		dataSource: null,
		template: template,
		render: function () {
			var self = this;
			if (self.getApp().currentUser.currentWorkstation) {
				self.selectedItems = [self.getApp().currentUser.currentWorkstation];
			}
			self.$el.find("#grid").grid({
				orderByMode: "client",
				fields: [
					{ field: "workstation_name", label: "Tên đơn vị", visible: true }
				],
				dataSource: self.getApp().currentUser.workstations,
				primaryField: "name",
				selectionMode: "single",
				selectedItems: [],
				onRowClick: function (event) {
					self.trigger("onSelected", clone(event.selectedItems[0]));
					self.getApp().currentUser.currentWorkstation = event.selectedItems[0];
					self.close();
				}
			});

			return this;
		}

	});

});

