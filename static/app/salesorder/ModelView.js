define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html'),
		schema = require('json!schema/SalesOrderSchema.json');
	var config = require('json!app/config.json');

	var productSchema = require('json!schema/SalesOrderProductsSchema.json');
	var serviceSchema = require('json!schema/SalesOrderServicesSchema.json');

	var ContactModelDialogView = require('app/contact/ModelDialogView');
	var ProductItemView = require('app/salesorder/ProductItemView');

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

	var Model = Gonrin.Model.extend({
		defaults: Gonrin.getDefaultModel(schema),
		computeds: {
			netAmountFormat: function () {
				var net_amount = this.get("net_amount");
				return net_amount !== null ? accounting.formatMoney(net_amount, currencyFormat.symbol, currencyFormat.precision,
					currencyFormat.thousand, currencyFormat.decimal, currencyFormat.format
				) : null;
			},
			totalFormat: function () {
				var amount = this.get("amount");
				return amount !== null ? accounting.formatMoney(amount, currencyFormat.symbol, currencyFormat.precision,
					currencyFormat.thousand, currencyFormat.decimal, currencyFormat.format
				) : null;
			},

			totalDiscountAmount: function () {
				var net_amount = this.get("net_amount");
				//				var coupon_discount = this.get("coupon_discount");
				var discount_percent = this.get("discount_percent");
				var discount_amount = this.get("discount_amount");
				var discount_other_amount = this.get("discount_other_amount");
				var totalDiscount = discount_amount + discount_other_amount;
				return totalDiscount !== null ? accounting.formatMoney(totalDiscount, currencyFormat.symbol, currencyFormat.precision,
					currencyFormat.thousand, currencyFormat.decimal, currencyFormat.format
				) : 0;
			},
			totalDiscountPercent: function () {
				var net_amount = this.get("net_amount");
				var discount_percent = this.get("discount_percent");
				var discount_amount = this.get("discount_amount");
				var discount_other_amount = this.get("discount_other_amount");
				var totalDiscount = discount_amount + discount_other_amount;
				var totalPercent = (totalDiscount / net_amount) * 100;
				return totalPercent !== null ? accounting.formatMoney(totalPercent, percentFormat.symbol, percentFormat.precision,
					percentFormat.thousand, percentFormat.decimal, percentFormat.format
				) : 0;
			}

		},
		urlRoot: "/crm/" + tenant_id + "/api/v1/salesorder"
	});

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		modelClass: Model,
		urlPrefix: "/api/v1/",
		collectionName: "salesorder",
		uiControl: {
			fields: [
				{
					field: "discount_amount",
					uicontrol: "currency",
					currency: currencyFormat,
					cssClass: "text-right"
				},
				{
					field: "discount_percent",
					uicontrol: "currency",
					currency: percentFormat,
					cssClass: "text-right"
				},
				{
					field: "tax_amount",
					uicontrol: "currency",
					currency: currencyFormat,
					cssClass: "text-right"
				},
				{
					field: "tax_percent",
					uicontrol: "currency",
					currency: percentFormat,
					cssClass: "text-right"
				}, {
					field: "card_swipe_fee_amount",
					uicontrol: "currency",
					currency: currencyFormat,
					cssClass: "text-right"
				},
				{
					field: "card_swipe_fee_percent",
					uicontrol: "currency",
					currency: percentFormat,
					cssClass: "text-right"
				},
				{
					field: "taxtype",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: [
						{ "value": "group", "text": "Theo hoá đơn" },
						{ "value": "individual", "text": "Theo hàng hoá" },
					],
					value: "male"
				},
				{
					field: "salesorderproducts",
					uicontrol: false,
					itemView: ProductItemView,
					tools: [
						{
							name: "create",
							type: "button",
							buttonClass: "btn btn-primary btn-sm",
							label: "Thêm món",
							command: "create"
						},
					],
					toolEl: "#salesorderproducts_addItem"
				},
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
							self.getApp().getRouter().navigate(self.collectionName + "/collection");
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-primary btn-sm",
						label: "TRANSLATE:SAVE",
						command: function () {
							var self = this;

							if (self.model.get("id")) {
								self.getApp().notify({ message: "Không thể sửa hoá đơn." }, { type: "warning" });
								return;
							} else {
								self.model.save(null, {
									success: function (model, respose, options) {
										self.getApp().notify({ message: "Thành công." }, { type: "success" });
										self.getApp().getRouter().navigate(self.collectionName + "/collection");
									},
									error: function (model, xhr, options) {
										self.getApp().notify({ message: "Lỗi hệ thống, thử lại sau." }, { type: "danger" });
									}
								});
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
							self.getApp().notify({ message: "Không thể xoá hoá đơn." }, { type: "danger" });
							return;
						}
					},
				]
			},
		],
		/**
		 * 
		 */
		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			if (id) {
				//progress bar
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						if (!self.model.get("tax_percent")) {
							self.model.set("tax_percent", 0)
						}
						if (!self.model.get("tax_amount")) {
							self.model.set("tax_amount", 0)
						}
						self.subcribeEvents();
						var promotion = self.model.get("promotion");
						if (promotion) {
							self.setPromotionName(promotion.promotionname);
						}
					},
					error: function () {
						self.getApp().notify({ message: "Lỗi hệ thống, vui lòng thử lại sau." }, { type: "danger" });
					},
				});
			} else {
				var currentUser = self.getApp().currentUser;

				self.model.set("created_by", currentUser.id);
				self.model.set("created_by_name", currentUser.fullname);

				var currentWorkstation = self.getApp().data("currentWorkstation");
				if (currentWorkstation) {
					self.model.set("workstation_id", currentWorkstation.id);
					self.model.set("workstation_name", currentWorkstation.workstation_name);
				}


				//default sales order 10% taxes:
				self.model.set("tax_percent", 10);

				self.applyBindings();

				self.subcribeEvents();

				self.$el.find("#addContact").unbind("click").bind("click", function () {
					self.showAddContactDialog();
				});

				self.$el.find("#searchContact").unbind("click").bind("click", function () {
					var phone = self.$el.find("#searchText").val();
					if (phone) {
						self.searchContact(phone);
					}

				});
			}

			self.model.on("change:contact_phone", function () {
				self.getPromotion();
			})

		},
		searchCouponCode: function () {
			var self = this;
			//check is set promotion
			if ((!!self.model.get("promotion_id")) || (!!self.model.get("coupon_id"))) {
				self.getApp().alert("Hoá đơn này đã được hưởng khuyến mại");
				return;
			}
			//get Promotion

			var contact_id = self.model.get("contact_id");
			var coupon_code = self.model.get("coupon_code");
			//var coupon_code = self.$el.find("#coupon_code").val();
			if (!!contact_id && (contact_id !== '') && !!coupon_code && (coupon_code !== '')) {
				var url = self.getApp().serviceURL + "/api/get_promotion_by_coupon_code";
				$.ajax({
					url: url,
					data: { "contact_id": contact_id, "coupon_code": coupon_code },
					dataType: "json",
					contentType: "application/json",
					success: function (data) {
						//console.log(data);
						self.applyPromotion(data.promotion);
						//     					self.model.set("coupon_id", data.id);
						//     					self.model.set("coupon_code", data.coupon_code);
					},
					error: function (xhr, status, error) {
						try {
							self.getApp().notify({ message: $.parseJSON(xhr.responseText).error_message }, { type: "danger" });
							//				    	    self.model.set("coupon_id", null);
							//	     					self.model.set("coupon_code", null);
						}
						catch (err) {
							self.getApp().notify({ message: xhr.responseText }, { type: "danger" });
						}
					},
				});
			} else {
				self.getApp().alert("Bạn chưa nhập thông tin khách hàng hoặc chưa điền mã Coupon");
			}

		},
		subcribeEvents: function () {
			var self = this;

			self.$el.find("#searchCouponCode").unbind("click").bind("click", function () {
				self.searchCouponCode();
			});

			self.model.on('change:salesorderproducts', function () {
				self.calculateNetAmount();
			});
			self.model.on('change:salesorderservices', function () {
				self.calculateNetAmount();
			});
			self.model.on('change:discount_amount', function () {
				self.calculateTotal();
			});
			self.model.on('change:discount_percent', function () {
				self.calculateTotal();
			});
			self.model.on('change:tax_percent', function () {
				self.calculateTotal();
			});

			self.model.on('change:card_swipe_fee_percent', function () {
				var tax_credit_card_percent = self.model.get("card_swipe_fee_percent");
				var tax_credit_card_amount = self.model.get("card_swipe_fee_amount");
				if (parseFloat(tax_credit_card_percent) >= 0) {
					var net_amount = self.model.get("net_amount") || 0;
					var amount = self.model.get("amount") || 0;
					var tax_credit_card_amount = (net_amount * tax_credit_card_percent) / 100;
					//					amount += tax_credit_card_amount
					self.model.set("card_swipe_fee_amount", tax_credit_card_amount);
					self.calculateTotal();
					//					self.model.set("amount", amount);
				}
			});


			self.model.on('change:card_swipe_fee_amount', function () {
				var tax_credit_card_percent = self.model.get("card_swipe_fee_percent");
				var tax_credit_card_amount = self.model.get("card_swipe_fee_amount");
				if (parseFloat(tax_credit_card_amount) >= 0) {
					var net_amount = self.model.get("net_amount") || 0;
					var amount = self.model.get("amount") || 0;
					var tax_credit_card_percent = tax_credit_card_amount * 100 / net_amount;
					self.model.set("card_swipe_fee_percent", tax_credit_card_percent);
					self.calculateTotal();
					//					self.model.set("amount", amount);
				}
			});

		},
		calculateNetAmount: function () {
			var self = this;
			var net_amount = 0;
			var products = self.model.get("salesorderproducts");

			for (var i = 0; i < products.length; i++) {
				net_amount += (products[i].net_amount || 0)
			}

			var services = self.model.get("salesorderservices");
			for (var i = 0; i < services.length; i++) {
				net_amount += (services[i].net_amount || 0)
			}

			console.log("net_amount:", net_amount);
			self.model.set("net_amount", net_amount);

			//add taxes
			self.calculateTotal();

			//add total
		},

		calculateTotal: function () {
			var self = this;
			var net_amount = self.model.get("net_amount") || 0;
			var amount = net_amount;

			//discount
			var discount_percent = self.model.get("discount_percent");
			var discount_amount = self.model.get("discount_amount");
			var card_swipe_fee_percent = self.model.get("card_swipe_fee_percent");
			var card_swipe_fee_amount = self.model.get("card_swipe_fee_amount");

			if (discount_amount) {
				amount = amount - (amount > discount_amount ? discount_amount : amount);
			} else if (discount_percent) {
				amount = amount - net_amount * discount_percent / 100;
			}

			if (card_swipe_fee_amount) {
				amount = parseFloat(amount) + parseFloat(card_swipe_fee_amount);
			} else if (card_swipe_fee_percent && !card_swipe_fee_amount) {
				amount = parseFloat(amount) + (parseFloat(net_amount) * parseFloat(card_swipe_fee_percent) / 100);
			}

			//taxes:
			var taxtype = self.model.get("taxtype");

			if (taxtype === "group") {
				var tax_percent = self.model.get("tax_percent");
				if (tax_percent) {
					amount = amount - (net_amount * discount_percent / 100);
					var tax_amount = net_amount * tax_percent / 100;
					self.model.set("tax_amount", tax_amount);
					amount = amount + tax_amount;
				}
			} else if (taxtype === "individual") {

			}

			self.model.set("amount", amount);
		},
		showAddContactDialog: function () {
			var self = this;
			var contactDialog = new ContactModelDialogView();
			var phone = self.$el.find("#searchText").val();
			if (phone !== '') {
				contactDialog.model.set("phone", phone)
			}
			contactDialog.dialog();
			contactDialog.on("onSelected", function () {
				self.model.set("contact_id", contactDialog.model.get("contact_no"));
				self.model.set("contact_name", contactDialog.model.get("contactname"));
				self.model.set("contact_phone", contactDialog.model.get("phone"));
				self.model.set("contact_email", contactDialog.model.get("email"));
			});
			//onselected
		},
		searchContact: function (phone) {
			var self = this;
			//query contact by phone
			var filter = { "phone": { "$eq": phone } }
			var url = self.getApp().serviceURL + "/api/v1/contact";
			loader.show();
			$.ajax({
				url: url,
				data: { "q": JSON.stringify({ "filters": filter, "single": true }) },
				dataType: "json",
				contentType: "application/json",
				success: function (data) {
					loader.hide();
					if (data.id) {
						self.model.set("contact_id", data.id);
						self.model.set("contact_name", data.contact_name);
						self.model.set("contact_phone", data.phone);
						self.model.set("contact_email", data.email);

						var address = "";
						if (!!data.address_street) {
							address = address + data.address_street + ", ";
						}
						if (!!data.address_city) {
							address = address + data.address_city + ", ";
						}

						if (!!data.address_country) {
							address = address + data.address_country + ", ";
						}

						self.model.set("contact_address", address);
					} else {
						self.getApp().notify({ message: "Không tìm thấy khách hàng có số điện thoại này" }, { type: "danger" });
					}
				},
				error: function (xhr, status, error) {
					loader.hide();
					self.getApp().notify({ message: "Không tìm thấy khách hàng có số điện thoại này" }, { type: "danger" });
				},
			});
		},

		getPromotion: function () {
			var self = this;
			var salesOrderTotal = 100;
			var salesOrderTime = moment().format('YYYY-MM-DD hh:mm:ss');
			var phone = self.model.get("contact_phone");
			if (!!phone && (phone !== '')) {
				var url = self.getApp().serviceURL + "/api/v1/promotion/get";
				$.ajax({
					url: url,
					data: { "phone": phone, "order_total": salesOrderTotal, "order_time": salesOrderTime },
					dataType: "json",
					contentType: "application/json",
					success: function (data) {
						self.renderPromotionGrid(data);
					},
					error: function (xhr, status, error) {

					},
				});
			}
		},
		renderPromotionGrid: function (data) {
			var self = this;
			self.$el.find("#promotion_grid").grid({
				dataSource: data,
				fields: [
					{ field: "promotionname", label: "Tên khuyến mại" },
					{
						field: "command",
						label: " ",
						width: "50px",
						command: [
							{
								"label": "Áp dụng",
								"action": function (params) {
									self.applyPromotion(params.rowData)
								},
								"class": "btn-primary btn-sm"
							}
						]
					}
				],
				refresh: true,

			});
		},
		setPromotionName: function (name) {
			var self = this;
			self.$el.find("#promotion_name").html(name);
		},
		applyPromotion: function (data) {
			var self = this;
			if (!!self.model.get("promotion_id")) {
				self.getApp().alert("Hoá đơn này đã được hưởng khuyến mại");
				return;
			}
			self.model.set("promotion_id", data.id);
			self.setPromotionName(data.promotionname);

			if (data.discount_percent > 0) {
				self.model.set("discount_percent", data.discount_percent);
			}
			if (data.discount_amount > 0) {
				self.model.set("discount_amount", data.discount_amount);
			}

			if (!!data.promotionbenefitproduct) {
				for (var i = 0; i < data.promotionbenefitproduct.length; i++) {
					var obj = {
						product_id: data.promotionbenefitproduct[i].product_id,
						product_name: data.promotionbenefitproduct[i].product_name,
						productsku: data.promotionbenefitproduct[i].productsku,
						quantity: data.promotionbenefitproduct[i].quantity,
						list_price: data.promotionbenefitproduct[i].list_price,
						discount_percent: data.promotionbenefitproduct[i].discount_percent,
					};
					var item = $.extend({}, Gonrin.getDefaultModel(productSchema), obj);
					(self.model.get("salesorderproducts")).push(item);
				}
				//console.log(JSON.stringify(self.model.get("salesorderproducts")));

				self.applyBinding("salesorderproducts");

				//console.log(JSON.stringify(self.model.get("salesorderproducts")));
			}

			if (!!data.promotionbenefitservice) {
				for (var i = 0; i < data.promotionbenefitservice.length; i++) {
					var obj = {
						service_id: data.promotionbenefitservice[i].service_id,
						servicename: data.promotionbenefitservice[i].servicename,
						service_no: data.promotionbenefitservice[i].service_no,
						quantity: data.promotionbenefitservice[i].quantity,
						list_price: data.promotionbenefitservice[i].list_price,
						discount_percent: data.promotionbenefitservice[i].discount_percent,
					};
					var item = $.extend({}, Gonrin.getDefaultModel(serviceSchema), obj);
					(self.model.get("salesorderservices")).push(item);
					//(self.model.get("salesorderservices")).push(obj);
				}

				self.applyBinding("salesorderservices");
			}

			if (!!data.promotionbenefitgift) {
				for (var i = 0; i < data.promotionbenefitgift.length; i++) {
					//hop nhat gift so luong
					var obj = {
						gift_id: data.promotionbenefitgift[i].gift_id,
						giftname: data.promotionbenefitgift[i].giftname,
						gift_no: data.promotionbenefitgift[i].gift_no,
						quantity: data.promotionbenefitgift[i].quantity,
						list_price: data.promotionbenefitgift[i].list_price,
						discount_percent: 100,
						net_amount: 0
						//productsku: 
					};

					//(self.model.get("salesordergifts")).push(obj);
					var item = $.extend({}, Gonrin.getDefaultModel(giftSchema), obj);
					(self.model.get("salesordergifts")).push(item);
				}
				self.applyBinding("salesordergifts");
			}

			self.calculateSubTotal();
		}
	});

});