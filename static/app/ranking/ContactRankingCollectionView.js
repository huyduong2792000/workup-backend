define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/contact-ranking-collection.html'),
		schema = require('json!schema/ContactRankingSchema.json');
	var config = require('json!app/config.json');
	var TemplateHelper = require('app/common/TemplateHelper');

	return Gonrin.CollectionView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "contactranking",
		uiControl: {
			paginationMode: false,
			orderBy: [
				{ field: "ranking_order", direction: "asc" }
			],
			fields: [
				{ field: "name", label: "Rank" },
				{
					field: "ranking_order", label: "Rating", template: function (rowObj) {
						var div = TemplateHelper.rating(config.rankingStars - (rowObj.ranking_order - 1),
							1, config.rankingStars, config.rankingStars);
						return div;
					}
				},
				{ field: "start_scores", label: "Reached scores" },
				{
					field: "ranking_order", label: "Number of people", template: function (rowObj) {
						return `<span class="fa fa-user-tag"></span> <i id="${rowObj.ranking_order}"></i>`;
					}
				},
				{
					field: "status",
					label: "Trạng thái",
					width: "115px",
					template: function (rowData) {
						var html = "";
						if (rowData && rowData.status) {
							html = TemplateHelper.renderStatus(rowData.status == 'active');
						}

						return html;
					}
				}
			],
			onRowClick: function (event) {
				if (event.rowId) {
					var path = 'contact/ranking/model?id=' + event.rowId;
					this.getApp().getRouter().navigate(path);
				}
			},
			onChangePage: function (event) {
				var self = this;
				if (event.page) {

				}
			}
		},
		tools: [
			{
				name: "create",
				type: "button",
				buttonClass: "btn-primary btn-sm",
				label: "TRANSLATE:CREATE",
				command: function (event) {
					const path = 'contact/ranking/model';
					this.getApp().getRouter().navigate(path);
				}
			},
		],


		render: function () {
			var self = this;
			self.applyBindings();

			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/ranking/count_people_per_rank",
				data: null,
				type: "GET",
				contentType: "application/json",
				success: function (response) {
					config.rankingList = response;
					var rankingWithPeoples = (response && response.length > 0) ? response : [];
					rankingWithPeoples.forEach(function (item) {
						self.$el.find("#" + item.ranking_order).html(item.people_number);
					})
				},
				error: function (model, xhr, options) {
					//
				}
			});

			self.$el.find("#rank-count").html(config.rankingStars);
			return this;
		},

	});

});