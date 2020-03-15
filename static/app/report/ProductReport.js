define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin'),
		lodash = require('vendors/lodash/lodash');

	var template = require('text!./tpl/product-report.html');
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
		salesorderProducts: null,
		salesorders: null,
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

			var productAmountChart = c3.generate({
				bindto: "#product-amount-report",
				data: {
					// iris data from R
					columns: [
						['loading...', 100]
					],
					labels: true,
					type: 'pie'
				},
//				color: {
//                    pattern: ['#1f77b4', '#3489a5', '#459f9f', '#24b9b9', '#45ae8c', '#39aa46']
//                },
				legend: {
					show: false,
					position: 'inset'
				},
				tooltip: {
					format: {
						value: function (value) {
							return d3.format(',.0f')(value) + "đ";
						}
					}
				}
			});

			var productQuantityChart = c3.generate({
				bindto: "#product-quantity-report",
				data: {
					// iris data from R
					columns: [
						['loading...', 100]
					],
					labels: true,
					type: 'pie'
				},
//				color: {
//                    pattern: ['#1f77b4', '#3489a5', '#459f9f', '#24b9b9', '#45ae8c', '#39aa46']
//                },
				legend: {
					show: false
				},
				tooltip: {
					format: {
						value: function (value) {
							return d3.format(',.0f')(value) + " sản phẩm";
						}
					}
				}
			});


			// chart 3
			var productAveragePerBillChart = c3.generate({
				bindto: "#product-per-bill",
				data: {
					x: 'product_name',
					json: [],
					//			        	'product_name': 'Tets 1',
					//			        	'quantity_average': 5.51
					//			        },{
					//			        	'product_name': 'Tets 18',
					//			        	'quantity_average': 10.51
					//			        }],
					keys: {
						value: ['product_name', 'amount']
					},
					names: {
						'amount': 'Doanh thu',
					},
					type: 'bar',
					labels: {
						format: function (v, id, i, j) {
							return d3.format('.3s')(v);
						}
					},
					tooltip: {
					},
					onclick: function (e) {
						//				    	console.log(e);
					}
				},
//				color: {
//                    pattern: ['#1f77b4', '#3489a5', '#459f9f', '#24b9b9', '#45ae8c', '#39aa46']
//                },
				legend: {
					show: false
				},
				axis: {
					x: {
						type: 'category',
						//			            tick: {
						//			            	fit: true
						//			               format: '%Y' // format string is also available for timeseries data
						//			            }
						tick: {
							rotate: 75,
							multiline: false
						},
						height: 150
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

			var top20MostProductApi = self.getApp().serviceURL + "/api/v1/product/chart/get_product_revenue";

			var topProductQuery = "from=" + fromDatetime + "&to=" + toDatetime;
			if (self.selectedWorkstation) {
				topProductQuery += "&workstation_id=" + self.selectedWorkstation;
			}
			loader.show();
			$.ajax({
				url: top20MostProductApi,
				data: topProductQuery,
				type: "GET",
				contentType: "application/json",
				success: function (response) {
					var dataSource = response;
					if (dataSource !== null && dataSource.length > 0) {

						var sortedDataSourceAmount = lodash.orderBy(clone(dataSource), ['amount'], ['desc']);
						var sortedDataSourceQuantity = lodash.orderBy(dataSource, ['quantity'], ['desc']);
						//						var sortedDataSourceAvg = lodash.orderBy(dataSource, ['quantity_average'], ['desc']);

						var productsAmount = [];
						var dataAmount = {};

						var limit = 20;
						var otherProductAmount = 0;
						var otherProductAmountCount = 0;
						var mostProduct = sortedDataSourceAmount[0].product_name;
						sortedDataSourceAmount.forEach(function (item, idx) {
							if (limit > 0) {
								if (dataAmount.hasOwnProperty(item.product_name)) {
									dataAmount[item.product_name] += item.amount;
								} else {
									productsAmount.push(item.product_name);
									dataAmount[item.product_name] = item.amount;
								}
							} else {
								otherProductAmountCount += 1;
								otherProductAmount += item.amount;
							}
							//
							totalOrderCount += item.amount;
							limit--;
						});
						if (otherProductAmount > 0) {
							productsAmount.push(otherProductAmountCount + " món khác");
							dataAmount[otherProductAmountCount + " món khác"] = otherProductAmount;
						}


						var productsQuantity = [];
						var dataQuantity = {};

						var limit = 20;
						var otherProductQuantity = 0;
						var otherProductQuantityCount = 0;
						var totalProducts = 0;
						var totalOrderCount = 0;
						sortedDataSourceAmount.forEach(function (item, idx) {
							if (limit > 0) {

								if (dataQuantity.hasOwnProperty(item.product_name)) {
									dataQuantity[item.product_name] += item.quantity;
								} else {
									productsQuantity.push(item.product_name);
									dataQuantity[item.product_name] = item.quantity;
									totalProducts += 1;
									limit--;
								}
							} else {
								totalProducts += 1;
								otherProductQuantityCount += 1;
								otherProductQuantity += item.quantity;
							}
							totalOrderCount += item.quantity;
						})
						if (otherProductQuantity > 0) {
							productsQuantity.push(otherProductQuantityCount + " món khác");
							dataQuantity[otherProductQuantityCount + ' món khác'] = otherProductQuantity;
						}

						self.$el.find("#sale-product-count").html(TemplateHelper.currencyFormat(totalProducts, false, ""));
						self.$el.find("#order-count").html(TemplateHelper.currencyFormat(totalOrderCount, false, " lần"));
						self.$el.find("#most-revenue-product").html(mostProduct);

						var limit = 20;
						var sortedDataSourceAvg = sortedDataSourceAmount.splice(0, limit);



						//////////// loading real data
						productAmountChart.load({
							json: [dataAmount],
							keys: {
								value: productsAmount
							},
							unload: true,
						});

						productQuantityChart.load({
							json: [dataQuantity],
							keys: {
								value: productsQuantity
							},
							unload: true,
						});

						productAveragePerBillChart.load({
							json: sortedDataSourceAvg,
							keys: {
								value: ['product_name', 'amount']
							},
						});

					} else {
						self.$el.find("#sale-product-count").html(TemplateHelper.currencyFormat(0, false, ""));
						self.$el.find("#order-count").html(TemplateHelper.currencyFormat(0, false, " lần"));
						self.$el.find("#most-revenue-product").html("");
						productAmountChart.load({
							columns: [
								["Không có dữ liệu", 0.01]
							],
							unload: true,
							colors: {
								"Không có dữ liệu": '#A1A1A1'
							}
						});

						productQuantityChart.load({
							columns: [
								["Không có dữ liệu", 0.01]
							],
							unload: true,
							colors: {
								"Không có dữ liệu": '#A1A1A1'
							}
						});


					}
					loader.hide();
				},
				error: function (err) {
					loader.hide();
				}
			});

		},

		renderBuyAverageProduct: function () {

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