define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin'),
		lodash = require('vendors/lodash/lodash');

	var template = require('text!./tpl/revenue-report.html');
	var TemplateHelper = require('app/common/TemplateHelper');
	var Helper = require('app/common/Helpers');
	var WorkstationSelectView = require('app/workstation/SelectView');
	var CONSTANT = require('app/common/Constants');

	var currencyFormat = {
		symbol: "VNĐ",		// default currency symbol is '$'
		format: "%v %s",	// controls output: %s = symbol, %v = value (can be object, see docs)
		decimal: ",",		// decimal point separator
		thousand: ".",		// thousands separator
		precision: 0,		// decimal places
		grouping: 3		// digit grouping (not implemented yet)
	};

	var percentFormat = {
		symbol: "%",		// default currency symbol is '$'
		format: "%v %s",	// controls output: %s = symbol, %v = value (can be object, see docs)
		decimal: ",",		// decimal point separator
		thousand: ".",		// thousands separator
		precision: 2,		// decimal places
		grouping: 3		// digit grouping (not implemented yet)
	};


	return Gonrin.View.extend({
		template: template,
		selectedWorkstation: null,
		previousEvent: {},
		render: function () {
			var self = this;
			self.applyBindings();
			self.$el.find("#xxx").html(CONSTANT.IMAGE_LOADER);

			self.eventRegister();
			$(this.$el.find(".quick-filter")[0]).trigger("click");
			return;
		},

		/**
		 * 
		 */
		eventRegister: function () {
			var self = this;
			this.$el.find(".quick-filter").unbind("click").bind("click", function ($event) {
				// remove available active buttons in quick filter
				self.$el.find(".quick-filter").each(function ($el) {
					if ($(this).hasClass("btn-coal") || $(this).hasClass("active")) {
						$(this).removeClass("btn-coal");
						$(this).removeClass("active");
					}
				});

				$(this).addClass("btn-coal active");

				if ($(this).val() === "today") {
                    var TODAY = new Date();
                    var startUtcTimestamp = Helper.datetimeToTimestamp(Helper.getStartDayTime(TODAY));
                    var endUtcTimestamp = Helper.datetimeToTimestamp(Helper.getEndDayTime(TODAY));
					self.loadChart(startUtcTimestamp, endUtcTimestamp);
                    // var cb = $('#more_options').data('gonrin');
                    // cb.setValue(null);

                } else if ($(this).val() === "week") {
                    var TODAY = new Date();
                    var firstDay = Helper.getStartDayOfWeek(TODAY);
                    var lastDay = Helper.getLastDayOfWeek(TODAY);
                    var startUtcTimestamp = Helper.datetimeToTimestamp(Helper.getStartDayTime(firstDay));
                    var endUtcTimestamp = Helper.datetimeToTimestamp(Helper.getEndDayTime(lastDay));
                    self.loadChart(startUtcTimestamp, endUtcTimestamp);
                    // var cb = $('#more_options').data('gonrin');
                    // cb.setValue(null);

                } else if ($(this).val() === "month") {
                    var TODAY = new Date();
                    var startDayOfPeriod = Helper.setDate(null, TODAY.getMonth() + 1, 1);
                    var endDayOfPeriod = Helper.setDate(null, TODAY.getMonth() + 2, 0);
                    var startUtcTimestamp = Helper.datetimeToTimestamp(Helper.getStartDayTime(startDayOfPeriod));
                    var endUtcTimestamp = Helper.datetimeToTimestamp(Helper.getEndDayTime(endDayOfPeriod));
                    self.loadChart(startUtcTimestamp, endUtcTimestamp);
                    // var cb = $('#more_options').data('gonrin');
                    // cb.setValue(null);

                } else if ($(this).val() === "year") {
                    var TODAY = new Date();
                    var startDayOfPeriod = Helper.setDate(null, 1, 1);
                    var endDayOfPeriod = Helper.setDate(null, 1, 0);
                    var startUtcTimestamp = Helper.datetimeToTimestamp(Helper.getStartDayTime(startDayOfPeriod));
                    var endUtcTimestamp = Helper.datetimeToTimestamp(Helper.getEndDayTime(endDayOfPeriod));
                    self.loadChart(startUtcTimestamp, endUtcTimestamp);
                    // var cb = $('#more_options').data('gonrin');
                    // cb.setValue(null);

                }

				self.savePrevousEvent("click", this);
			});


			self.$el.find("#filter-btn").unbind("click").bind("click", function () {
				var from = self.$el.find("#from-datetime").val();
				var to = self.$el.find("#to-datetime").val();
				// self.loadChart(from, to);

				// remove active in quick filter
				self.$el.find(".quick-filter").each(function ($el) {
					if ($(this).hasClass("btn-warning") || $(this).hasClass("active")) {
						$(this).removeClass("btn-warning");
						$(this).removeClass("active");
					}
				});

				self.savePrevousEvent("click", this);
			});


			var $workstationEl = self.$el.find("#workstation");

			$workstationEl.ref({
				textField: "name",
				//valueField: "id",
				selectionMode: "single",
				dataSource: WorkstationSelectView
			});

			$workstationEl.on("change.gonrin", function (evt) {
				if (!!evt.value) {
					self.selectedWorkstation = evt.value.id;
				} else {
					self.selectedWorkstation = null;
				}

				$(self.previousEvent.element).trigger(self.previousEvent.event);
			})

		},

		/**
		 * 
		 */
		loadChart: function (fromDatetime, toDatetime) {
			var self = this;
			if (typeof (fromDatetime) === "string") {
				fromDatetime = new Date(fromDatetime);
				fromDatetime.setHours(0, 0, 0, 0);
			}

			if (typeof (toDatetime) === "string") {
				toDatetime = new Date(toDatetime);
				toDatetime.setHours(23, 59, 59, 999);
			}

			console.log(fromDatetime);
			console.log(toDatetime);
			var deltaMiniseconds = toDatetime - fromDatetime;

			console.log(deltaMiniseconds)
			var revenueChart = c3.generate({
				bindto: "#revenue-report",
				data: {
					json: [],
					type: 'spline',
					type: 'bar',
					names: {
						'amount': 'Doanh thu'
					},
					labels: {
						format: function (v, id, i, j) {
							return d3.format('.3s')(v);
						}
					},
				},
//				color: {
//                    pattern: ['#1f77b4', '#3489a5', '#459f9f', '#24b9b9', '#45ae8c', '#39aa46']
//                },
				tooltip: {
					format: {
						value: function (value) {
							return d3.format(",")(value);
						},
					},
				},
				labels: true,
				axis: {
					x: {
						type: 'category',
						//			            tick: {
						//			            	fit: true
						//			               format: '%Y' // format string is also available for timeseries data
						//			            }
						tick: {
							rotate: 70,
							multiline: false,
							format: function (x) { return "Tháng " + x; }
						},
						height: 70
					},
					y: {
						tick: {
							format: d3.format(",.0f")
						}
					},
				}
			});

			if (!fromDatetime || !toDatetime) {
				return;
			}

			var getRevenueApi = self.getApp().serviceURL + "/api/v1/salesorder/chart/get_amount_by_date";


			var getRevenueQuery = "from=" + fromDatetime + "&to=" + toDatetime;
			if (self.selectedWorkstation) {
				getRevenueQuery += "&workstation_id=" + self.selectedWorkstation;
			}

			$.ajax({
				url: getRevenueApi,
				data: getRevenueQuery,
				type: "GET",
				contentType: "application/json",
				success: function (response) {
					var dataSource = response.current_period;

					var x = "";
					var data = [];
					var keys = [];
					var names = {};

					if (deltaMiniseconds <= 2764800000) {
						console.log("in-month");
						x = "order_day";
						data = dataSource;
						keys = ['order_day', 'amount'];
						names = { 'amount': 'Doanh thu' }
					} else {
						x = "order_month";
						keys = ['order_month', 'amount'];
						var currentMonth = {};
						dataSource.forEach(function (item, idx) {
							if (!currentMonth.order_month || currentMonth.order_month == item.order_month) {
								currentMonth.order_month = item.order_month;
								if (!currentMonth.amount) {
									currentMonth.amount = item.amount;
								} else {
									currentMonth.amount += item.amount;
								}
							} else {
								data.push(currentMonth);
								currentMonth = {};
							}
							if (idx == (dataSource.length - 1)) {
								data.push(currentMonth);
							}
						});
					}

					console.log(data);

					revenueChart.load({
						unload: true,
						x: x,
						json: data,
						keys: {
							value: keys
						}
					})

				},
				error: function (err) {

				}
			});

		},

		changeListener: async function (callbackFunc) {
			var self = this;
			var flag = true;
			var count = 0;
			while (flag) {
				count++;
				console.log("timer...", count);
				await self.sleep(50);
				if ((self.salesorderProducts != null && self.salesorders) || count == 600) {
					flag = false;
				}
			}
			console.log("STOP");
			callbackFunc();

		},

		sleep: function (ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},


		savePrevousEvent: function (eventName, $element) {
			var self = this;

			self.previousEvent = {
				"event": eventName,
				"element": $element
			}
		}

	});

});