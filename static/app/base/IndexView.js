define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/index.html');
	var TemplateHelper = require('app/common/TemplateHelper');
	var Helpers = require('app/common/Helpers');
	var CONSTANT = require('app/common/Constants');

	return Gonrin.View.extend({
		template: template,
		render: function () {
			var self = this;
			self.applyBindings();
			self.loadData();
			this.loadContactLineTimeData();
		},

		loadData: function () {
			var self = this;
			var endOfToday = new Date();
			endOfToday.setHours(23, 59, 59, 999);
			var endOfTodayTimestamp = Helpers.localToTimestamp(endOfToday);

			var startOfToday = new Date();
			startOfToday.setHours(0, 0, 0, 0);
			var startOfTodayTimestamp = Helpers.localToTimestamp(startOfToday);

			var last7Days = new Date();
			last7Days.setHours(0, 0, 0, 0);
			last7Days.setDate(last7Days.getDate() - 7 + 1);
			var last7DaysTimestamp = Helpers.localToTimestamp(last7Days);

			var last14Days = new Date();
			last14Days.setHours(0, 0, 0, 0);
			last14Days.setDate(last14Days.getDate() - 14 + 1);
			var last14DaysTimestamp = Helpers.localToTimestamp(last14Days);

			var last1Month = new Date();
			last1Month.setHours(0, 0, 0, 0);
			last1Month.setMonth(last1Month.getMonth() - 1);
			last1Month.setDate(last1Month.getDate() + 1);
			var last1MonthTimestamp = Helpers.localToTimestamp(last1Month);

			// GET CONTACTS
			var endOfToday = new Date();
			endOfToday.setHours(23, 59, 59, 999);
			var endOfTodayTimestamp = Helpers.localToTimestamp(endOfToday);

			var startOfToday = new Date();
			startOfToday.setHours(0, 0, 0, 0);
			var startOfTodayTimestamp = Helpers.localToTimestamp(startOfToday);
			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/contact/count_new_contact",
				data: "from=" + startOfTodayTimestamp + "&to=" + endOfTodayTimestamp,
				type: "GET",
				success: function (response) {
					self.$el.find("#total_contact_count").html(TemplateHelper.numberFormat(response.total));
					self.$el.find("#new_contact_count").html(TemplateHelper.numberFormat(response.count));
				},
				error: function (xhr) {
					console.log("xhr ", xhr);
				}
			});


			var promotionCountApi = this.getApp().serviceURL + "/api/v1/report/promotion/count_running";
			$.ajax({
				url: promotionCountApi,
				data: "from=" + startOfTodayTimestamp + "&to=" + endOfTodayTimestamp,
				type: "GET",
				success: function (response) {
					self.$el.find("#count_running_campaign").html(TemplateHelper.numberFormat(response.count));

					var amount = response.amount;
					if (amount > 10000000 && amount <= 999999999) {
						amount = (Math.floor(amount / 100000) / 10) + " triệu";
						self.$el.find("#campaign_total_amount").html(amount);
					} else if (amount > 999999999) {
						amount = (Math.floor(amount / 10000000) / 100) + " tỉ";
						self.$el.find("#campaign_total_amount").html(amount);
					} else {
						self.$el.find("#campaign_total_amount").html(TemplateHelper.numberFormat(amount));
					}
				},
				error: function (xhr) {
					console.log("xhr ", xhr);
				}
			});
		},

		/**
		 * Data analysic and provide increasing or decreasing percentage of each figure
		 */
		dataAnalysis: function (data) {
			var prev_total_bill = 0;
			var prev_total_amount = 0;
			var prev_total_discount = 0;

			var total_bill = 0;
			var total_amount = 0;
			var total_discount = 0;

			data.prev_period.forEach(function (item, key) {
				prev_total_bill += item.bills;
				prev_total_amount += item.amount;
				prev_total_discount += item.discount_amount;
			});

			data.current_period.forEach(function (item, key) {
				total_bill += item.bills;
				total_amount += item.amount;
				total_discount += item.discount_amount;
			});

			var bill_percent_html = "";
			var amount_percent_html = "";
			var discount_percent_html = "";
			var bill_percent = Math.round((total_bill - prev_total_bill) / (prev_total_bill > 0 ? prev_total_bill : total_bill) * 10000) / 100;
			var amount_percent = Math.round((total_amount - prev_total_amount) / (prev_total_amount > 0 ? prev_total_amount : total_amount) * 10000) / 100;
			var discount_percent = Math.round((total_discount - prev_total_discount) / (prev_total_discount > 0 ? prev_total_discount : total_discount) * 10000) / 100;
			if (bill_percent < 0) {
				bill_percent_html = `<div style="color: #e21629; font-weight: 550;"><span class="fa fa-arrow-down"></span> ${bill_percent}%</div>`;
			} else {
				bill_percent_html = `<div style="color: #12842c; font-weight: 550;"><span class="fa fa-arrow-up"></span> ${bill_percent}%</div>`;
			}

			if (amount_percent < 0) {
				amount_percent_html = `<div style="color: #e21629; font-weight: 550;"><span class="fa fa-arrow-down"></span> ${amount_percent}%</div>`;
			} else {
				amount_percent_html = `<div style="color: #12842c; font-weight: 550;"><span class="fa fa-arrow-up"></span> ${amount_percent}%</div>`;
			}

			if (discount_percent < 0) {
				discount_percent_html = `<div style="color: #e21629; font-weight: 550;"><span class="fa fa-arrow-down"></span> ${discount_percent}%</div>`;
			} else {
				discount_percent_html = `<div style="color: #12842c; font-weight: 550;"><span class="fa fa-arrow-up"></span> ${discount_percent}%</div>`;
			}

			return JSON.parse(JSON.stringify({
				total_bill: total_bill,
				total_amount: total_amount,
				total_discount: total_discount,
				bill_percent: bill_percent_html,
				amount_percent: amount_percent_html,
				discount_percent: discount_percent_html
			}));

		},

		loadContactLineTimeData: function () {
			const self = this;
			var endOfToday = new Date();
			endOfToday.setHours(23, 59, 59, 999);
			var endOfTodayTimestamp = Helpers.localToTimestamp(endOfToday);
			var startTodayTimestamp = endOfTodayTimestamp - 86400000;

			const api = self.getApp().serviceURL + "/api/v1/report/contact/total_line_time";
			$.ajax({
				url: api,
				data: {
					'type': 'month',
					'from': startTodayTimestamp,
					'to': endOfTodayTimestamp
				},
				type: "GET",
				success: function (response) {
					self.renderLineChart(response);
				},
				error: function (xhr) { }
			})

		},

		renderLineChart: function (dataSource) {
			// #f59024
			var chart = c3.generate({
				bindto: "#amount_report",
				data: {
					json: dataSource,
					keys: {
						x: 'date',
						value: ['total']
					},
					names: {
						'total': 'Tổng số thành viên'
					},
					type: 'spline',
					types: {
						total: 'area'
					},
					labels: {
						format: function (v, id, i, j) { return v; }
					}
				},
				color: {
					pattern: ['#f59024']
				},
				legend: {
					show: false
				},
				tooltip: {
					format: {
						value: function (value) {
							return d3.format(",")(value);
						},
					},
				},
				axis: {
					x: {
						type: 'category'
					},
					y: {
						show: true,
						tick: {
							format: function (d) {
								var val = '';
								if (d >= 0 && d < 1000) {
									val = d;
								} else if (d >= 1000 && d < 1000000) {
									val = String(d / 1000) + "K";
								} else if (d >= 1000000 && d < 1000000000) {
									val = String(d / 1000000) + "M";
								} else {
									val = String(d / 1000000000) + "B";
								}
								return val;
							}
						}
					}
				}
			});

		}
	});

});