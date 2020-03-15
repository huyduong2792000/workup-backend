define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/ranking-rule-selection.html'),
        schema = require('json!schema/RankingRuleSchema.json');

    return Gonrin.CollectionDialogView.extend({
        parentModel: null,
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "rankingrule",
        textField: "rule_name",
        tools: [
            {
                name: "close",
                type: "button",
                buttonClass: "btn btn-danger btn-md margin-left-5",
                label: "Close",
                command: function () {
                    this.close();
                }
            },
            {
                name: "select",
                type: "button",
                buttonClass: "btn btn-primary btn-md margin-left-5",
                label: "TRANSLATE:SELECT",
                command: function () {
                    this.trigger("onSelected");
                    this.close();
                }
            }
        ],
        uiControl: {
            fields: [
                { field: "rule_name", label: "Tên nguyễn tắc" },
                { field: "rule_type", label: "Loại" },
            ],
            onRowClick: function (event) {
                this.uiControl.selectedItems = event.selectedItems;
                this.trigger("onSelected");
                this.close();
            },
        },
        render: function () {
            this.uiControl.filters = {
                "$and": [
                    { 'deleted': { '$eq': false } },
                    { 'status': { '$eq': 'active' } }
                ]
            };
            this.applyBindings();
        }
    });
});