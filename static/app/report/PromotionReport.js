define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/promotion-report.html');
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
			var chart1 = c3.generate({
				bindto: "#promotion-report",
				data: {
					// iris data from R
					columns: [
						['loading...', 100]
					],
					keys: {
						value: ['discounted_bills', 'non_discounted_bills']
					},
					labels: true,
					names: {
						'discounted_bills': 'Áp dụng khuyến mãi',
						'non_discounted_bills': 'Không áp dụng khuyến mãi'
					},
					type: 'pie'
				},
//				color: {
//                    pattern: ['#1f77b4', '#3489a5', '#459f9f', '#24b9b9', '#45ae8c', '#39aa46']
//                },
				tooltip: {
					format: {
						value: function (value) {
							return d3.format(',.0f')(value) + " hoá đơn";
						}
					}
				}
			});

			var chart2 = c3.generate({
				bindto: "#each-promotion-revenue-report",
				data: {
					// iris data from R
					columns: [
						['loading...', 100]
					],
					type: 'pie',
					legend: {
						show: true
					},
					onclick: function (d, i) {
						//			        	console.log("onclick", d, i);
					},
					onmouseover: function (d, i) { },
					onmouseout: function (d, i) { }
				},
//				color: {
//                    pattern: ['#1f77b4', '#3489a5', '#459f9f', '#24b9b9', '#45ae8c', '#39aa46']
//                },
				tooltip: {
					format: {
						value: function (value) {
							return d3.format(',.0f')(value) + "đ";
						}
					}
				}
			});

			var chart3 = c3.generate({
				bindto: "#revenue-by-each-promotion",
				data: {
					x: 'promotion_name',
					json: [],
					keys: {
						value: ['promotion_name', 'discount', 'amount']
					},
					type: 'bar',
					groups: [
						['amount', 'discount']
					],
					order: function (area1, area2) {
						return area1.id > area2.id;
					},
					names: {
						'amount': 'Doanh thu',
						'discount': 'Tiền giảm'
					},
					labels: {
						format: function (v, id, i, j) { return d3.format(",")(v); },
			            // format: {
			            //     data1: d3.format("$"),
			            //     data1: function (v, id, i, j) { return "Format for data1"; },
			            // }
					}
				},
				legend: {
					show: false
				},
				tooltip: {
					order: function (area1, area2) {
						return area1.id < area2.id;
					},
					format: {
						value: function (value) {
							return d3.format(',.0f')(value) + "đ";
						}
					}
				},
				axis: {
					x: {
						type: 'category',
						tick: {
							fit: true,
							outer: false
						}
					}
				}
			});

			if (!fromDatetime || !toDatetime) {
				return;
			}

			var numberWorkstationBillApi = self.getApp().serviceURL + "/api/v1/salesorder/chart/bill_number_by_workstation";
			var eachPromotionRevenueApi = self.getApp().serviceURL + "/api/v1/salesorder/chart/each_promotion_profit";

			var queryStr1 = "from=" + fromDatetime + "&to=" + toDatetime;
			if (self.selectedWorkstation) {
				queryStr1 += "&workstation_id=" + self.selectedWorkstation;
			}
			loader.show();
			$.ajax({
				url: numberWorkstationBillApi,
				data: queryStr1,
				type: "GET",
				contentType: "application/json",
				success: function (response) {
					var dataSource = response;
					if (dataSource !== null && dataSource.length > 0) {
						chart1.load({
							json: dataSource,
							keys: {
								value: ['discounted_bills', 'non_discounted_bills']
							},
							unload: ['loading...']
						});
					} else {
						chart1.load({
							columns: [
								["Không có dữ liệu", 0.01]
							],
							unload: ['loading...'],
							colors: {
								"Không có dữ liệu": '#A1A1A1'
							}
						})
					}
					loader.hide();
				},
				error: function (xhr) {
					loader.hide();
				}
			});


			var queryStr2 = "from=" + fromDatetime + "&to=" + toDatetime;
			if (self.selectedWorkstation) {
				queryStr2 += "&workstation_id=" + self.selectedWorkstation;
			}
			loader.show();
			$.ajax({
				url: eachPromotionRevenueApi,
				data: queryStr2,
				type: "GET",
				contentType: "application/json",
				success: function (response) {
					var dataSource = [];
					var promotionCount = 0;
					var totalDiscount = 0;
					var totalAmount = 0;
					response.forEach(function (item, index) {
						if (item.promotion_name !== "other") {
							promotionCount++;
							totalDiscount += item.discount;
							totalAmount += item.amount;
							dataSource.push([
								item.promotion_name.substring(0, 25) + "...",
								item.amount
							]);
						} else {
							//							dataSource.push([
							//								"Không áp dụng khuyến mãi",
							//								item.amount
							//							]);
						}

					});

					if (dataSource.length > 0) {
						chart2.load({
							columns: dataSource,
							unload: ['loading...']
						});
					} else {
						chart2.load({
							columns: [
								["Không có dữ liệu", 0.01]
							],
							unload: ['loading...'],
							colors: {
								"Không có dữ liệu": '#A1A1A1'
							}
						});
					}
					//					chart2.legend.hide();

					var chart3DataSource = response.filter(function (obj) {
						if (obj.promotion_name !== 'other') {
							return obj;
						}
					})
					chart3.load({
						json: chart3DataSource,
						keys: {
							value: ['promotion_name', 'discount', 'amount']
						},
					});



					self.$el.find("#promotion-count").html(promotionCount);
					self.$el.find("#discount-summary").html(accounting.formatMoney(totalDiscount,
						currencyFormat.symbol,
						currencyFormat.precision,
						currencyFormat.thousand,
						currencyFormat.decimal,
						currencyFormat.format));
					self.$el.find("#amount-summary").html(accounting.formatMoney(totalAmount,
						currencyFormat.symbol,
						currencyFormat.precision,
						currencyFormat.thousand,
						currencyFormat.decimal,
						currencyFormat.format));
					self.$el.find("#discount-ratio").html(Math.round((totalDiscount ? totalDiscount : 0) / ((totalAmount && totalAmount > 0) ? totalAmount : ((totalDiscount && totalDiscount > 0) ? totalDiscount : 1)) * 10000) / 100 + "%");
					loader.hide();
				},
				error: function (err) {
					console.log(err);
					loader.hide();
				}
			});
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