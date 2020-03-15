define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/filter.html'),
        schema = require('json!schema/ContactSchema.json');
    var filter_schema = {
        "id": {
            "type": "string",
            "primary": true
        },
        "filter_name": {
            "type": "string"
        },
        "contact_no_from": {
            "type": "number"
        },
        "contact_no_to": {
            "type": "number"
        },
        "score_from": {
            "type": "number"
        },
        "score_to": {
            "type": "number"
        },
        "month": {
            "type": "number"
        },
        "date": {
            "type": "number"
        }
    };
    var Helpers = require('app/common/Helpers');

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: filter_schema,
        bindings: "contactfilter-bind",
        collectionName: "contact_filter",
        uiControl: {
            fields: [{
                    field: "month",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: [
                        { text: "Tháng 1", value: 1 },
                        { text: "Tháng 2", value: 2 },
                        { text: "Tháng 3", value: 3 },
                        { text: "Tháng 4", value: 4 },
                        { text: "Tháng 5", value: 5 },
                        { text: "Tháng 6", value: 6 },
                        { text: "Tháng 7", value: 7 },
                        { text: "Tháng 8", value: 8 },
                        { text: "Tháng 9", value: 9 },
                        { text: "Tháng 10", value: 10 },
                        { text: "Tháng 11", value: 11 },
                        { text: "Tháng 12", value: 12 }
                    ]
                },
                {
                    field: "date",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: [
                        { text: "Ngày 1", value: 1 },
                        { text: "Ngày 2", value: 2 },
                        { text: "Ngày 3", value: 3 },
                        { text: "Ngày 4", value: 4 },
                        { text: "Ngày 5", value: 5 },
                        { text: "Ngày 6", value: 6 },
                        { text: "Ngày 7", value: 7 },
                        { text: "Ngày 8", value: 8 },
                        { text: "Ngày 9", value: 9 },
                        { text: "Ngày 10", value: 10 },
                        { text: "Ngày 11", value: 11 },
                        { text: "Ngày 12", value: 12 },
                        { text: "Ngày 13", value: 13 },
                        { text: "Ngày 14", value: 14 },
                        { text: "Ngày 15", value: 15 },
                        { text: "Ngày 16", value: 16 },
                        { text: "Ngày 17", value: 17 },
                        { text: "Ngày 18", value: 18 },
                        { text: "Ngày 19", value: 19 },
                        { text: "Ngày 20", value: 20 },
                        { text: "Ngày 21", value: 21 },
                        { text: "Ngày 22", value: 22 },
                        { text: "Ngày 23", value: 23 },
                        { text: "Ngày 24", value: 24 },
                        { text: "Ngày 25", value: 25 },
                        { text: "Ngày 26", value: 26 },
                        { text: "Ngày 27", value: 27 },
                        { text: "Ngày 28", value: 28 },
                        { text: "Ngày 29", value: 29 },
                        { text: "Ngày 30", value: 30 },
                        { text: "Ngày 31", value: 31 }
                    ]
                }
            ]
        },
        tools: null,
        /**
         * 
         */
        render: function() {
            var self = this;
            self.applyBindings();

            setTimeout(() => {
                if (this.viewData && this.viewData.options && this.viewData.options.css) {
                    self.$el.find(".container").css(this.viewData.options.css);
                }
                self.$el.find(".container").addClass("active");
            }, 100);

            this.$el.find("#btn_filter").unbind("click").bind("click", () => {
                var modelData = self.model.toJSON();
                var filterData = {};
                Object.keys(modelData).forEach((key, index) => {
                    if (modelData[key]) {
                        filterData[key] = modelData[key]
                    }
                });
                self.trigger('filter', filterData);
            });

            this.$el.find("#btn_cancel").unbind("click").bind("click", () => {
                this.$el.find(".container").removeClass("active");
                self.trigger('cancel');
            });
        },

        eventRegister: function() {
            const self = this;
        },

        validate: function() {
            return true;
        }
    });

});