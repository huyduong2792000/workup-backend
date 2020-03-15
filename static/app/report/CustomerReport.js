define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/customer-report.html');
	var TemplateHelper = require('app/common/TemplateHelper');
	var CONSTANT = require('app/common/Constants');
	var Helper = require('app/common/Helpers');
	var WorkstationSelectView = require('app/workstation/SelectView');
	var FindCouponDialog = require("app/coupon-storage/FindCouponDialog");

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
		isReload: true,
		birthdayData: [],
		selectedWorkstation: null,
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
				bindto: "#make-bill-customer",
				data: {
					// iris data from R
					columns: [
						['loading...', 100]
					],
					keys: {
						value: ['invoice', 'no_invoice']
					},
					labels: true,
					names: {
						'invoice': 'Khách thanh toán',
						'no_invoice': 'Khách chỉ đăng ký thành viên'
					},
					type: 'pie'
				},
//				color: {
//                    pattern: ['#1f77b4', '#3489a5', '#459f9f', '#24b9b9', '#45ae8c', '#39aa46']
//                },
				tooltip: {
					format: {
						value: function (value) {
							return d3.format(',.0f')(value);
						}
					}
				}
			});

			var contactGroupRevenueChart = c3.generate({
				bindto: "#revenue-by-contact-group",
				data: {
					// iris data from R
					columns: [
						['loading...', 100]
					],
					keys: {
						value: ['new_amount', 'loyal_amount']
					},
					labels: true,
					names: {
						'new_amount': 'Doanh thu khách mới',
						'loyal_amount': 'Doanh thu khách cũ'
					},
					type: 'pie'
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

			// chart 3
			var backFrequencyChart = c3.generate({
				bindto: "#comeback-frequency",
				data: {
					// iris data from R
					columns: [
						['loading...', 100]
					],
					labels: true,
					names: {
						'7 ngày': 'Khách quay lại trong 1 tuần',
						'14 ngày': 'Khách quay lại trong 2 tuần',
						'21 ngày': 'Khách quay lại trong 3 tuần',
						'28 ngày': 'Khách quay lại trong 4 tuần'
					},
					type: 'pie'
				},
				legend: {
					position: 'bottom'
				},
				tooltip: {
					format: {
						value: function (value) {
							return d3.format(',.0f')(value) + " khách";
						}
					}
				}
			});

			// chart 4
			var genderRatioChart = c3.generate({
				bindto: "#gender-ratio-chart",
				data: {
					// iris data from R
					columns: [
						['loading...', 100]
					],
					labels: true,
					names: {
						'male': 'Nam',
						'female': 'Nữ',
						'unknown': 'Không xác định'
					},
					type: 'pie'
				},
//				color: {
//                    pattern: ['#1f77b4', '#3489a5', '#459f9f', '#24b9b9', '#45ae8c', '#39aa46']
//                },
				legend: {
					position: 'bottom'
				},
				tooltip: {
					format: {
						value: function (value) {
							return d3.format(',.0f')(value) + " khách";
						}
					}
				}
			});

			// chart 5
			var birthdayChart = c3.generate({
				bindto: "#customer-birthday-by-month",
				data: {
					x: 'month',
					json: [],
					keys: {
						value: ['month', 'count']
					},
					type: 'bar',
					names: {
						'count': 'Số khách sinh nhật'
					},
					labels: {
						format: function (v, id, i, j) { return v; }
					},
					onclick: function (e) {
						// var finder = new FindCouponDialog({
						// 	viewData: {
						// 		name: "birthday",
						// 		month: e.x,
						// 		count: e.value
						// 	}
						// });
						// finder.dialog({
						// 	size: "large"
						// });
					},
					onmouseover: function (d, i) {
						// var finder = new FindCouponDialog({
						// 	viewData: {
						// 		name: "birthday",
						// 		month: d.x,
						// 		count: d.value
						// 	}
						// });
						// finder.dialog({
						// 	size: "large"
						// });
					},
					onmouseout: function (d, i) {
						//			        	alert("onmouseout");
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
						tick: {
							format: function (x) { return "Tháng " + x; }
							//   format: '%Y' // format string is also available for timeseries data
						}
					}
				}
			});

			if (!fromDatetime || !toDatetime) {
				return;
			}

			var new_register_contact_api = self.getApp().serviceURL + "/api/v1/contact/chart/new_register_contact";
			var revenue_by_contact_group = self.getApp().serviceURL + "/api/v1/contact/chart/revenue_by_contact_group";

			var queryStr1 = "from=" + fromDatetime + "&to=" + toDatetime;
			if (self.selectedWorkstation) {
				queryStr1 += "&workstation_id=" + self.selectedWorkstation;
			}
			loader.show();
			// chart 1
			$.ajax({
				url: new_register_contact_api,
				data: queryStr1,
				type: "GET",
				contentType: "application/json",
				success: function (response) {
					if (response && (response.invoice || response.no_invoice)) {
						var dataSource = [response];
						chart1.load({
							json: dataSource,
							keys: {
								value: ['invoice', 'no_invoice']
							},
							unload: ['loading...']
						});
						var total_new_customer = response.invoice + response.no_invoice;
						/////////
						self.$el.find("#new-customer").html(total_new_customer);

					} else {
						chart1.load({
							columns: [
								["Không có dữ liệu", 0.01]
							],
							unload: ['loading...'],
							colors: {
								"Không có dữ liệu": '#A1A1A1'
							}
						});
						self.$el.find("#new-customer").html("0");
					}
					loader.hide();
				},
				error: function (err) {
					loader.hide();
				}
			});

			// chart 2
			var contactGroupRevenueQuery = "from=" + fromDatetime + "&to=" + toDatetime;
			if (self.selectedWorkstation) {
				contactGroupRevenueQuery += "&workstation_id=" + self.selectedWorkstation;
			}
			loader.show();
			$.ajax({
				url: revenue_by_contact_group,
				data: contactGroupRevenueQuery,
				type: "GET",
				contentType: "application/json",
				success: function (response) {
					var dataSource = response;

					if (dataSource && dataSource.length > 0) {
						contactGroupRevenueChart.load({
							json: dataSource,
							keys: {
								value: ['new_amount', 'loyal_amount']
							},
							unload: ['loading...']
						});
					} else {
						contactGroupRevenueChart.load({
							columns: [
								["Không có dữ liệu", 0.01]
							],
							unload: ['loading...'],
							colors: {
								"Không có dữ liệu": '#A1A1A1'
							}
						});
					}
					//					contactGroupRevenueChart.legend.hide();

					var new_customer = 0;
					var loyal_customer = 0;
					var new_revenue = 0;
					var loyal_revenue = 0;
					response.forEach(function (item, index) {
						loyal_customer += item.loyal_customer;
						new_customer += item.new_customer;
						new_revenue += item.new_amount;
						loyal_revenue += item.loyal_amount;
					});
					self.$el.find("#loyal-customer").html(loyal_customer);
					self.$el.find("#new-customer-ratio").html(Math.round((new_customer ? new_customer : 0) / ((loyal_customer && (new_customer + loyal_customer) > 0) ? (new_customer + loyal_customer) : ((new_customer && new_customer > 0) ? new_customer : 1)) * 10000) / 100 + "%");
					loader.hide();
				},
				error: function (err) {
					console.log(err);
					loader.hide();
				}
			});

			// chart 3
			console.log(typeof (fromDatetime));
			var last3months = null;
			if (typeof (fromDatetime) == "string") {
				last3months = new Date(fromDatetime);
			} else {
				last3months = new Date(fromDatetime);
			}
			last3months.setHours(0, 0, 0, 0);
			last3months.setMonth(last3months.getMonth() - 3);

			var contact_comeback_frequency = self.getApp().serviceURL + "/api/v1/contact/chart/comeback_frequency";
			var backFrequencyQuery = "from=" + fromDatetime + "&to=" + toDatetime;
			if (self.selectedWorkstation) {
				backFrequencyQuery += "&workstation_id=" + self.selectedWorkstation;
			}
			loader.show();
			$.ajax({
				url: contact_comeback_frequency,
				data: backFrequencyQuery,
				type: "GET",
				success: function (response) {
					backFrequencyChart.load({
						columns: [
							['7 ngày', response['7days'].count],
							['14 ngày', response['14days'].count],
							['21 ngày', response['21days'].count],
							['28 ngày', response['28days'].count],
							['Trong vòng 3 tháng', response.others.count]
						],
						unload: ['loading...']
					});
					self.$el.find("#frequency-number").html(
							response['7days'].count
							+ response['14days'].count
							+ response['21days'].count
							+ response['28days'].count
							+ response.others.count
					);
					loader.hide();
				},
				error: function () {
					backFrequencyChart.load({
						columns: [
							["Không có dữ liệu", 0.01]
						],
						unload: ['loading...'],
						colors: {
							"Không có dữ liệu": '#A1A1A1'
						}
					});
					loader.hide();
				}
			})


			// chart 4
			var gender_analysis_api = self.getApp().serviceURL + "/api/v1/contact/chart/contact_gender_analysis";
			var genderRatioQuery = "from=" + fromDatetime + "&to=" + toDatetime;
			if (self.selectedWorkstation) {
				genderRatioQuery += "&workstation_id=" + self.selectedWorkstation;
			}
			loader.show();
			$.ajax({
				url: gender_analysis_api,
				data: genderRatioQuery,
				type: "GET",
				success: function (response) {
					if (response && response.length > 0) {
						var totalCustomer = 0;
						response.forEach(function (each) {
							totalCustomer += each.count;
						});
						if (totalCustomer > 0) {
							genderRatioChart.load({
								columns: [
									[response[0].gender_name, response[0].count],
									[response[1].gender_name, response[1].count],
									[response[2].gender_name, response[2].count]
								],
								unload: ['loading...']
							});
						} else {
							genderRatioChart.load({
								columns: [
									["Không có dữ liệu", 0.01]
								],
								unload: ['loading...'],
								colors: {
									"Không có dữ liệu": '#A1A1A1'
								}
							});
						}

						self.$el.find("#gender-total-number").html(totalCustomer);
					}
					loader.hide();
				},
				error: function () {
					genderRatioChart.load({
						columns: [
							["Không có dữ liệu", 0.01]
						],
						unload: ['loading...'],
						colors: {
							"Không có dữ liệu": '#A1A1A1'
						}
					});
					loader.hide();
				}
			})



			// chart 5
			var lastYear = new Date();
			lastYear.setHours(0, 0, 0, 0);
			lastYear.setFullYear(lastYear.getFullYear() - 1);
			//			lastYear.setDate(lastYear.getDate() + 1);

			var endOfToday = new Date();
			endOfToday.setHours(23, 59, 59, 999);

			var contact_birthday_counter_api = self.getApp().serviceURL + "/api/v1/contact/chart/contact_birthday_counter";
			var birthDayQuery = "from=" + fromDatetime + "&to=" + toDatetime;
			if (self.selectedWorkstation) {
				birthDayQuery += "&workstation_id=" + self.selectedWorkstation;
			}
			// using for load 1 time when getting page
			if (self.birthdayData.length <= 0 || self.isReload == true) {
				$.ajax({
					url: contact_birthday_counter_api,
					data: birthDayQuery,
					type: "GET",
					contentType: "application/json",
					success: function (response) {
						self.birthdayData = response;
						self.isReload = false;
						var dataSource = [];

						for (var i = 1; i <= 12; i++) {
							var data = {
								month: i,
								count: 0
							};
							self.birthdayData.forEach(function (contact, index) {
								if (contact.contact_birthday_month == i) {
									data.count += 1;
								}

							})
							dataSource.push(data);
						}

						birthdayChart.load({
							json: dataSource,
							keys: {
								value: ['month', 'count']
							},
						});

					}
				});
			} else {
				// filter data without calling api
				var dataSource = [];
				for (var i = 1; i <= 12; i++) {
					var data = {
						month: i,
						count: 0
					};
					self.birthdayData.forEach(function (contact, index) {
						if (contact.contact_birthday_month == i) {
							if (self.selectedWorkstation) {
								if (contact.workstation_id == self.selectedWorkstation) {
									data.count += 1;
								}
							} else {
								data.count += 1;
							}
						}

					})
					dataSource.push(data);

				}
				birthdayChart.load({
					json: dataSource,
					keys: {
						value: ['month', 'count']
					},
				});
			}


			// TOP Contact
			if (self.isReload == true) {
				var contactTOPApi = self.getApp().serviceURL + "/api/v1/contact/chart/get-top-contact"
				var contactTblQuery = "from=" + fromDatetime + "&to=" + toDatetime + "&order_by=bill&limit=5";
				if (self.selectedWorkstation) {
					contactTblQuery += "&workstation_id=" + self.selectedWorkstation;
				}
				$.ajax({
					url: contactTOPApi,
					data: contactTblQuery,
					type: "GET",
					success: function (response) {
						self.renderTopContactTable(response);
					},
					error: function () {

					}

				});
			}

		},


		renderTopContactTable: function (dataSource) {
			var self = this;
			self.$el.find("#top-contact-tbl").grid({
				orderByMode: "client",
				paginationMode: false,
				fields: [
					{
						field: "no", label: "#", visible: true, template: function (rowObj) {
							var text = null;

							dataSource.forEach(function (item, idx) {
								if (item.contact_phone == rowObj.contact_phone) {
									text = idx + 1;
								}
							});
							return "" + text;
						}
					},
					{ field: "contact_name", label: "Tên", visible: true },
					{ field: "contact_phone", label: "Phone", visible: true },
					{ field: "bills", label: "Lần", visible: true },
					{
						field: "amount", label: "Chi tiêu", visible: true, template: function (rowObj) {
							return TemplateHelper.currencyFormat(rowObj.amount, true, "");
						}
					}
				],
				dataSource: dataSource,
				primaryField: "contact_phone",
				selectionMode: "single",
				selectedItems: [],
				onRowClick: function (event) {
					//                	 self.trigger("onSelected", event.selectedItems[0]);
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