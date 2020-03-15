define(function (require) {
	"use strict";

	var currencyFormat = {
		symbol: "VNĐ",		// default currency symbol is '$'
		format: "%v %s",	// controls output: %s = symbol, %v = value (can be object, see docs)
		decimal: ",",		// decimal point separator
		thousand: ".",		// thousands separator
		precision: 0,		// decimal places
		grouping: 3		// digit grouping (not implemented yet)
	};

	var numberFormat = {
		symbol: "",		// default currency symbol is '$'
		format: "%v %s",	// controls output: %s = symbol, %v = value (can be object, see docs)
		decimal: ",",		// decimal point separator
		thousand: ".",		// thousands separator
		precision: 0,		// decimal places
		grouping: 3		// digit grouping (not implemented yet)
	};

	return class TemplateHelper {
		constructor() {
			return "Hello TemplateHelper";
		};
		/**
		 * Render template of active status 
		 */
		static renderStatus(status, options = {}) {
			var color = "";
			if (options && options.color) {
				color = options.color;
			}
			if (!status) {
				color = color ? color : "#dc3545";
				return `<div class='text-center' style="color: ${color}"><span class='fa fa-times'></span></div>`;
			}
			color = color ? color : "#007bfe";
			return `<div class='text-center' style='color: ${color};'><span class='fa fa-check'></span></div>`;
		};

		static lockStatus(locked) {
			if (locked === true) {
				return "<div class='text-center'><span class='fa fa-lock'></span></div>";
			}
			return "<div class='text-center''><span class='fa fa-unlock'></span></div>";
		}


		static insertString(str = "", index, sub) {
			if (index > 0) {
				return String(str).substring(0, index) + sub + String(str).substring(index, str.length);
			} else {
				return sub + str;
			}
		}

		static phoneFormat(phone) {
			if (phone) {
				phone = String(phone);
				var result = this.insertString(this.insertString(phone, 3, " "), 7, " ")
				return `<span id="${phone}">${result}</span>`;
			}
			return '';
		}

		/**
		 * Format datetime
		 */
		static datetimeFormat(datetime, formatString, align = null) {
			var format = (formatString != null) ? formatString : "DD-MM-YYYY HH:mm:ss";
			if (align == null) {
				return moment(datetime).isValid() ? moment(datetime).format(format) : "";
			}
			return moment(datetime).isValid() ? `<div style="text-align: ${align}">${moment(datetime).format(format)}</div>` : "";
		};

		/**
		 * Format currency number
		 */
		static currencyFormat(amount, alignRight = false, symbol = "VNĐ") {
			if (typeof amount !== "number") {
				return "Argument 1 must be a number";
			}

			var result = accounting.formatMoney(amount,
				symbol,
				currencyFormat.precision,
				currencyFormat.thousand,
				currencyFormat.decimal,
				currencyFormat.format);

			if (alignRight === true) {
				return `<div class='text-right'>${result}</div>`;
			}
			return result;
		};


		/**
		 * Format currency number
		 */
		static numberFormat(amount, alignRight = false) {
			if (typeof amount !== "number") {
				return "Argument 1 must be a number";
			}

			var result = accounting.formatMoney(amount,
				numberFormat.symbol,
				numberFormat.precision,
				numberFormat.thousand,
				numberFormat.decimal,
				numberFormat.format);

			if (alignRight === true) {
				return `<div class='text-right'>${result}</div>`;
			}
			return result;
		};


		/**
		 * Render Rating stars
		 */
		static rating(scores, ratio = 1, range = 5, title = "HAHAHA", readonly = true) {
			if (scores == null) {
				$.notify({ message: "score args is required" }, { type: "danger" });
				return;
			}
			var $outputEl = $("<div>");
			var span = $('<span>').attr({
				"data-toggle": "tooltip",
				"title": title
			}).css({ "margin-bottom": "0px" });

			$outputEl.append(span);
			var input = $("<input>").attr({
				"type": "hidden",
				"data-filled": "symbol symbol-filled",
				"data-empty": "symbol symbol-empty",
				value: scores / ratio
			});

			if (readonly) {
				input.attr({
					"readonly": true
				});
			}
			span.append(input);

			input.rating({
				start: 0,
				stop: range,
				filled: 'glyphicon glyphicon-star',
				empty: 'glyphicon glyphicon-star-empty'
			});
			// not work
			//			span.tooltip();
			return $outputEl.html();
		}
	};
});
