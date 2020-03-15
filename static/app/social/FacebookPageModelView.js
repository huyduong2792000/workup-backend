define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/facebook-page-model.html'),
		schema = require('json!schema/FacebookPageSchema.json');

	var WorkstationSelectView = require("app/workstation/SelectView");


	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "facebook_page",
		uiControl: {
			fields: [
				{
					field: "workstations",
					uicontrol: "ref",
					textField: "workstation_name",
					selectionMode: "multiple",
					dataSource: WorkstationSelectView
				}
			]
		},
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-secondary btn-sm",
						label: "TRANSLATE:BACK",
						command: function () {
							var self = this;
							self.getApp().getRouter().navigate("facebook/page");
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-primary btn-sm",
						label: "TRANSLATE:SAVE",
						command: function () {
							var self = this;

							if (this.getApp().getRouter().getParam("id")) {
								self.model.save(null, {
									success: function (model, respose, options) {
										self.getApp().notify({ message: "Thành công." }, { type: "success" });
										self.getApp().getRouter().navigate("facebook/page");
									},
									error: function (model, xhr, options) {
										self.getApp().notify({ message: "Lỗi hệ thống, thử lại sau." }, { type: "danger" });
									}
								});
							} else {
								$.ajax({
									url: self.getApp().serviceURL + "/api/v1/facebook_page",
									data: JSON.stringify(self.model.toJSON()),
									type: "POST",
									success: function (response) {
										self.getApp().notify({ message: "Thành công." }, { type: "success" });
										self.getApp().getRouter().navigate("facebook/page");
									},
									error: function (model, xhr, options) {
										self.getApp().notify({ message: "Lỗi hệ thống, thử lại sau." }, { type: "danger" });
									}
								})
							}
						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger btn-sm",
						label: "TRANSLATE:DELETE",
						visible: function () {
							return this.getApp().getRouter().getParam("id") !== null;
						},
						command: function () {
							var self = this;
							self.model.destroy({
								success: function (model, respose, options) {
									self.getApp().notify({ message: "Đã xoá." }, { type: "success" });
									self.getApp().getRouter().navigate("facebook/page");
								},
								error: function (model, xhr, options) {
									self.getApp().notify('Save error');
								}
							});
						}
					},
				]
			},
		],

		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				//progresbar quay quay
				this.model.set('page_id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.loadWorkstations();
					},
					error: function () {
						self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
					},
				});
			} else {
				self.applyBindings();
				self.loadWorkstations();
			}

			$('[data-toggle="tooltip"]').tooltip();

		},

		loadWorkstations: function() {
			const self = this;

			// $.ajax({
			// 	url: self.getApp().serviceURL + "/api/v1/workstation",
			// 	data: null,
			// 	type: "GET",
			// 	success: function(response) {
			// 		if (response && response.objects) {
			// 			self.$el.find("#workstations").ref({
			// 				textField: "workstation_name",
			// 				selectionMode: "multiple",
			// 				dataSource: response.objects
			// 			});
			// 		}
			// 	},
			// 	error: function(xhr) {
			// 		self.$el.find("#workstations").ref({
			// 			textField: "workstation_name",
			// 			selectionMode: "multiple",
			// 			dataSource: []
			// 		});
			// 	}
			// })

		}
	});

});