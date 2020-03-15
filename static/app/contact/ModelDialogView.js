define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/ContactSchema.json');

	var AccountSelectView = require("app/account/SelectView");
	var SocialItemView = require("app/social/SocialItemView");

	return Gonrin.ModelDialogView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "contact",
		tools: [
			{
				name: "createandselect",
				type: "button",
				buttonClass: "btn-primary btn-sm",
				label: "TRANSLATE:CREATE",
				command: function () {
					var self = this;
					self.model.save(null, {
						success: function (model, respose, options) {
							self.getApp().notify({ message: "Save successfully" }, { type: "success" });
							//self.getApp().getRouter().navigate(self.collectionName + "/collection");
							self.trigger("onSelected");
							self.close();

						},
						error: function (model, xhr, options) {
							//self.alertMessage("Something went wrong while processing the model", false);
							self.getApp().notify({ message: 'Save error' }, { type: "danger" });
						}
					});

					//
				}
			},
		],
		uiControl: {
			fields: [
				{
					field: "gender",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": "male", "text": "Nam" },
						{ "value": "female", "text": "Nữ" },
					],
					value: "male"
				},
				{
					field: "account",
					uicontrol: "ref",
					textField: "accountname",
					//chuyen sang thanh object
					foreignRemoteField: "id",
					foreignField: "account_id",
					dataSource: AccountSelectView
				},
				{
					field: "social_contact",
					uicontrol: false,
					itemView: SocialItemView,
					tools: [
						{
							name: "create",
							type: "button",
							buttonClass: "btn-primary btn-xs float-right",
							label: "Thêm",
							command: "create"
						},
					],
					toolEl: "#socialcontact_additem"
				}
			],
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
					},
					error: function () {
						self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
					},
				});
			} else {
				self.applyBindings();
			}

		},
	});

});