define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/ranking-rule-collection.html');
    var schema = require('json!schema/RankingRuleSchema.json');
    var TemplateHelper = require('app/common/TemplateHelper');

    var RANKINGTYPEMAP = {
		'ranking': 'Ranking',
		// ''
	}

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "rankingrule",
        uiControl: {
            orderBy: [
                { field: "created_at", direction: "desc" }
            ],
            fields: [
                { field: "rule_name", label: "Tên nguyên tắc" },
                {
                    field: "rule_type",
                    label: "Loại",
                    template: function(rowData) {
                        var html = '';
                        if (rowData && rowData.rule_type) {
                            html = RANKINGTYPEMAP[rowData.rule_type];
                        }
                        return html;
                    }
                },
                {
                    field: "status",
                    label: "Trạng thái",
                    width: "115px",
                    template: function (rowData) {
                        var html = "";
                        if (rowData && rowData.status) {
                            html = TemplateHelper.renderStatus(rowData.status == 'active');
                        }

                        return html;
                    }
                }
            ],
            onRowClick: function (event) {
                if (event.rowId) {
                    var path = 'ranking/rule/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
            },
            onChangePage: function (event) {
                var self = this;
                if (event.page) {

                }
            }
        },
        render: function () {
            this.applyBindings();
            return this;
        },

    });

});