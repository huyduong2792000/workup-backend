define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/time-filter-dialog.html');
    var Helper = require("app/common/Helpers");

    var schema = {
        "id": {
            "type": "string",
            "primary": true
        },
        "action": {
            "type": "string"
        },
        "from_time": {
            "type": "number"
        },
        "to_time": {
            "type": "number"
        }
    };

    return Gonrin.ModelDialogView.extend({
        template: template,
        modelSchema: schema,
        collectionName: "time_filter",
        uiControl: {
            fields: []
        },
        render: function () {
            const self = this;
            this.applyBindings();

            this.$el.find("#btn_filter").unbind("touchend click").bind("touchend click", () => {
                setTimeout(() => {
                    self.trigger("filter", self.model.toJSON());
                }, 200);
                self.close();
            });

            $('.modal-backdrop').unbind("touchend click").bind("touchend click", () => {
                self.close();
            });

            self.$el.find('#time_filter_from_time').on('change.datetimepicker', function (e) {
                if (e && e.date) {
                    self.model.set('from_time', e.date.local().unix() * 1000);
                } else {
                    self.model.set('from_time', null);
                }
            });

            self.$el.find('#time_filter_to_time').on('change.datetimepicker', function (e) {
                if (e && e.date) {
                    self.model.set('to_time', e.date.local().unix() * 1000);
                } else {
                    self.model.set('to_time', null);
                }
            });

            self.$el.find(".quick-filter").unbind("click").bind("click", function ($event) {
                self.$el.find(".quick-filter").each(function ($el) {
                    if ($(this).hasClass("btn-main-color") || $(this).hasClass("active")) {
                        $(this).removeClass("btn-main-color");
                        $(this).removeClass("active");
                    }
                });
                $(this).addClass("btn-warning");
                if ($(this).val() === "today") {
                    var TODAY = new Date();
                    var startUtcTimestamp = Helper.utcTimestampNow(Helper.getStartDayTime(TODAY));
                    var endUtcTimestamp = Helper.utcTimestampNow(Helper.getEndDayTime(TODAY));
                    self.model.set('from_time', startUtcTimestamp);
                    self.model.set('to_time', endUtcTimestamp);

                } else if ($(this).val() === "week") {
                    var TODAY = new Date();
                    var firstDay = Helper.getStartDayOfWeek(TODAY);
                    var lastDay = Helper.getLastDayOfWeek(TODAY);
                    var startUtcTimestamp = Helper.utcTimestampNow(Helper.getStartDayTime(firstDay));
                    var endUtcTimestamp = Helper.utcTimestampNow(Helper.getEndDayTime(lastDay));
                    self.model.set('from_time', startUtcTimestamp);
                    self.model.set('to_time', endUtcTimestamp);

                } else if ($(this).val() === "month") {
                    var TODAY = new Date();
                    var startDayOfPeriod = Helper.setDate(null, TODAY.getMonth() + 1, 1);
                    var endDayOfPeriod = Helper.setDate(null, TODAY.getMonth() + 2, 0);
                    var startUtcTimestamp = Helper.utcTimestampNow(Helper.getStartDayTime(startDayOfPeriod));
                    var endUtcTimestamp = Helper.utcTimestampNow(Helper.getEndDayTime(endDayOfPeriod));
                    self.model.set('from_time', startUtcTimestamp);
                    self.model.set('to_time', endUtcTimestamp);

                } else if ($(this).val() === "year") {
                    var TODAY = new Date();
                    var startDayOfPeriod = Helper.setDate(null, 1, 1);
                    var endDayOfPeriod = Helper.setDate(null, 13, 0);
                    var startUtcTimestamp = Helper.utcTimestampNow(Helper.getStartDayTime(startDayOfPeriod));
                    var endUtcTimestamp = Helper.utcTimestampNow(Helper.getEndDayTime(endDayOfPeriod));
                    self.model.set('from_time', startUtcTimestamp);
                    self.model.set('to_time', endUtcTimestamp);
                }
            });
        }
    });
});
