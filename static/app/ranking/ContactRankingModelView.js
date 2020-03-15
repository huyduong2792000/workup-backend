define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/contact-ranking-model.html'),
		schema = require('json!schema/ContactRankingSchema.json');
	var config = require('json!app/config.json');

	var RankingRuleSelection = require('app/ranking/RankingRuleSelection');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "contactranking",
		uiControl: {
			fields: [
				{
					field: "ranking_rule",
					uicontrol: "ref",
					textField: 'rule_name',
					foreignRemoteField: "id",
					foreignField: "ranking_rule_id",
					selectionMode: "single",
					dataSource: RankingRuleSelection
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
						label: "<span class='fa fa-chevron-left'></span> Quay lại",
						command: function () {
							var self = this;
							self.getApp().getRouter().navigate("contact/ranking/collection");
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-primary btn-sm",
						label: "<span class='fa fa-save'></span> Lưu",
						command: function () {
							var self = this;

							self.model.save(null, {
								success: function (model, respose, options) {
									self.getApp().notify({ message: "Save successfully" }, { type: "success" });
									// $.ajax({
									// 	url: self.getApp().serviceURL + "/api/v1/ranking/count_people_per_rank",
									// 	data: null,
									// 	type: "GET",
									// 	contentType: "application/json",
									// 	success: function (response) {

									// 		config.rankingList = response ? response : [];
									// 		if (response[response.length - 1].start_scores > 0) {
									// 			config.rankingStars = response.length;
									// 		} else {
									// 			config.rankingStars = response.length - 1;
									// 		}
									// 		$.ajax({
									// 			url: self.getApp().serviceURL + '/api/v1/contact/get_highest_score',
									// 			tyle: "GET",
									// 			contentType: "application/json",
									// 			success: function (response) {
									// 				config.highestScore = response ? response.score : 0;
									// 				config.rankingRate = config.highestScore / config.rankingStars;
									// 				self.getApp().getRouter().navigate("contact/ranking/collection");
									// 			},
									// 			error: function () {
									// 				self.getApp().getRouter().navigate("contact/ranking/collection");
									// 			}
									// 		});

									// 	},
									// 	error: function (model, xhr, options) {
									// 		self.getApp().getRouter().navigate("contact/ranking/collection");
									// 	}
									// });
									self.getApp().getRouter().navigate("contact/ranking/collection");
								},
								error: function (model, xhr, options) {
									console.log(xhr);
									self.getApp().notify({ message: xhr.responseJSON.error_message }, { type: "danger" });
								}
							});
						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger btn-sm",
						label: "<span class='fa fa-trash'></span> Xoá",
						visible: function () {
							return this.getApp().getRouter().getParam("id") !== null;
						},

						command: function () {
							var self = this;
							self.model.destroy({
								success: function (model, response) {

									// $.ajax({
									// 	url: self.getApp().serviceURL + "/api/v1/ranking/count_people_per_rank",
									// 	data: null,
									// 	type: "GET",
									// 	contentType: "application/json",
									// 	success: function (response) {

									// 		config.rankingList = response ? response : [];
									// 		if (response[response.length - 1].start_scores > 0) {
									// 			config.rankingStars = response.length;
									// 		} else {
									// 			config.rankingStars = response.length - 1;
									// 		}
									// 		$.ajax({
									// 			url: self.getApp().serviceURL + '/api/v1/contact/get_highest_score',
									// 			tyle: "GET",
									// 			contentType: "application/json",
									// 			success: function (response) {
									// 				config.highestScore = response.score;
									// 				config.rankingRate = config.highestScore / config.rankingStars;

									// 				self.getApp().getRouter().navigate("contact/ranking/collection");
									// 			},
									// 			error: function () {
									// 				self.getApp().getRouter().navigate("contact/ranking/collection");
									// 			}
									// 		});

									// 	},
									// 	error: function (model, xhr, options) {
									// 		self.getApp().getRouter().navigate("contact/ranking/collection");
									// 	}
									// });
									self.getApp().getRouter().navigate("contact/ranking/collection");
								},
								error: function (model, xhr, options) {
									self.getApp().notify({ message: JSON.parse(xhr.responseText).error_message }, { type: "danger" });
								}
							});
						}
					}
				]
			}
		],

		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				self.model.set('id', id);
				self.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.registerEvents();
						self.switchUIControlRegister();
					},
					error: function () {
						self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
					},
				});
			} else {
				self.applyBindings();
				self.registerEvents();
				self.switchUIControlRegister();
			}
		},

		registerEvents: function() {
			const self = this;

		},

		switchUIControlRegister: function () {
			var self = this;

			self.$el.find(".switch input[id='status_switch']").unbind("click").bind("click", function ($event) {
				if ($(this).is(":checked")) {
					self.model.set("status", "active");
				} else {
					self.model.set("status", "deactive");
				}
			})

			if (self.model.get("status") == "active") {
				self.$el.find(".switch input[id='status_switch']").trigger("click");
			}
		}
	});

});
