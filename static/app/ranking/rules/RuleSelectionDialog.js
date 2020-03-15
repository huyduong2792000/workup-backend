define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/rule-selection.html');
    var dataSource = require('json!./RuleList.json');

    return Gonrin.DialogView.extend({
        dataSource: null,
        template: template,
        render: function () {
            var self = this;

            self.$el.find("#grid").grid({
                orderByMode: "client",
                fields: [
                    { field: "text", label: "Danh sách điều kiện", visible: true },
                ],
                dataSource: dataSource,
                primaryField: "name",
                selectionMode: "single",
                selectedItems: [],
                onRowClick: function (event) {
                    self.trigger("selected", clone(event.selectedItems[0]));
                    self.close();
                }
            });
            return this;
        }

    });

});