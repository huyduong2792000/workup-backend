define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/collection.html'),
        schema = require('json!schema/ContactCategorySchema.json');
    var Helpers = require('app/common/Helpers');
    var TemplateHelper = require('app/common/TemplateHelper');
    var CustomFilterView = require('app/common/CustomFilterView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "contactcategory",
        uiControl: {
            orderBy: [
                { field: "created_at", direction: "desc" }
            ],
            fields: [
                {
                    field: "category_name",
                    label: "Tên nhóm"
                },
                {
                    field: "created_at",
                    label: "Ngày tạo",
                    cssClass: "hide-on-mobile",
                    template: function (rowData) {
                        return Helpers.utcToLocal(rowData.created_at, "DD/MM/YYYY");
                    }
                },
                {
                    field: "deleted",
                    label: " ",
                    width: "60px",
                    template: function (rowObject) {
                        return TemplateHelper.renderStatus(!rowObject.deleted);
                    }
                }
            ],
            onRowClick: function (event) {
                if (event.rowId) {
                    var path = this.collectionName + '/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
            },
            onRendered: function (event) {
                loader.hide();
            },
            onChangePage: function (event) {
                var self = this;
            },
            refresh: true
        },
        tools: null,
        initialize: function () {
            loader.show();
        },
        render: function () {
            var self = this;
            self.applyBindings();
        }
    });
});