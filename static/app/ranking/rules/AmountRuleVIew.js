define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    var template = require('text!./tpl/amount-rule.html');
    var schema = {
        "id": {
            "type": "string",
            "primary": true
        },
        "rule_type": {
            "type": "string",
            "default": "amount"
        },
        "amount": {
            "type": "number",
            "default": 0
        },
        "score": {
            "type": "number",
            "default": 0
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
    
    var numberFormat = {
		symbol: "",		// default currency symbol is '$'
		format: "%v %s",	// controls output: %s = symbol, %v = value (can be object, see docs)
		decimal: ",",		// decimal point separator
		thousand: ".",		// thousands separator
		precision: 0,		// decimal places
		grouping: 3		// digit grouping (not implemented yet)
	};

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        uiControl: {
            fields: [
                {
					field: "amount",
					uicontrol: "currency",
					currency: currencyFormat,
					cssClass: "text-right"
                },
                {
					field: "score",
					uicontrol: "currency",
					currency: numberFormat,
					cssClass: "text-right"
				}
            ]
        },
        tools: null,

        render: function () {
            this.applyBindings();
            this.registerEvents();
        },

        registerEvents: function() {
            const self = this;

            this.model.on("change", () => {
                self.trigger("change", self.model.toJSON());
            });
        }
    });

});