define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/find-coupon-dialog.html');
	var DialogCollectionView = require("app/contact/DialogCollectionView");

	var schema = {
		"message": {
			"type": "string"
		},
		"channel": {
			"type": "string",
			"default": "messenger"
		}
	};

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

	var channelList = [
		{ text: "SMS", value: "sms", "note": "You must pay 830 VNĐ for each message." },
		{ text: "Messenger", value: "messenger", "note": "Send by Messenger." }
	];

	return Gonrin.ModelDialogView.extend({
		template: template,
		modelSchema: schema,
		viewData: null,
		data: null,
		urlPrefix: "/api/v1/",
		collectionName: "couponstorage",
		uiControl: {
			fields: [
				{
					field: "channel",
					uicontrol: "combobox",
					textField: "text",
					valueField: "value",
					dataSource: channelList
				}
			]
		},
		tools: null,

		render: function () {
			var self = this;
			this.eventRegister();
			this.applyBindings();
			var filters = {};
			if (self.viewData) {
				if (self.viewData.name == "birthday") {
					filters = { "$and": [{ "bmonth": { "$eq": self.viewData.month } }, { "deleted": { "$eq": false } }] };
				}
			}

			var dialogContactCollection = new DialogCollectionView({
				el: self.$el.find('#grid')
			});
			dialogContactCollection.uiControl.filters = filters;
			dialogContactCollection.render();

			// listen data loaded
			dialogContactCollection.on("loaded", function (data) {
				self.data = data;
				self.showAnalysisNotify(data);
			});

			return this;
		},

		eventRegister: function () {
			var self = this;
			self.model.on("change:channel", function (event) {
				self.showAnalysisNotify(self.data);
			});
		},

		showAnalysisNotify: function (data) {
			var self = this;
			console.log("Loaded ", data.numRows);
			// render notify figures
			if (self.model.get("channel") == "sms") {
				self.$el.find("#analysis-report").html("Ước tính: " + accounting.formatMoney(data.numRows * 830,
					currencyFormat.symbol, currencyFormat.precision,
					currencyFormat.thousand, currencyFormat.decimal, currencyFormat.format) + " / " + data.numRows + " khách hàng.");
			} else if (self.model.get("channel") == "messenger") {
				self.$el.find("#analysis-report").html("Tỉ lệ: 100% / " + data.numRows + " khách hàng");
			} else {
				self.$el.find("#analysis-report").html("Tổng số: " + data.numRows + " khách hàng");
			}

			// render notify message
			var msg = "<span class='glyphicon glyphicon-info-sign'></span> ";
			channelList.forEach(function (item, idx) {
				if (self.model.get("channel") == item.value) {
					msg += item.note;
				}
			});
			self.$el.find("#notify-msg").html(msg);
		}


	});
});