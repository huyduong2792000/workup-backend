define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    var template = require('text!./tpl/select.html'),
        schema = require('json!schema/ContactSchema.json');
    var TemplateHelper = require('app/common/TemplateHelper');
    var ContactFilterView = require('app/contact/ContactFilterView');
    return Gonrin.CollectionDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "contact",
        textField: "contact_name",
        selectedItems: [],
        tools: null,
        uiControl: {
            fields: [
                { field: "score", label: "Tích điểm" },
                { field: "contact_no", label: "Mã" },
                { field: "contact_name", label: "Tên khách hàng" }
            ],
            onRowClick: function (event) {
                this.selectedItems = event.selectedItems;
            },
            selectionMode: "multiple",
            refresh: true
        },

        render: function () {
            const self = this;
            this.applyBindings();

            self.$el.find("#selected").unbind("click").bind("click", () => {
                self.trigger("onSelected", self.selectedItems);
                self.close();
            });

            var contactFilter = new ContactFilterView({
                el: self.$el.find("#filter_space")
            });
            contactFilter.render();
            contactFilter.on('filter', (data) => {
                $.ajax({
                    type: "POST",
                    url: self.getApp().serviceURL + "/api/v1/contact/custom_filter",
                    data: JSON.stringify({
                        "contact_no_from": data.contact_no_from,
                        "contact_no_to": data.contact_no_to,
                        "score_from": data.score_from,
                        "score_to": data.score_to,
                        "month": data.month,
                        "date": data.date,
                    }),
                    success: function (response) {
                        if (response) {

                            self.$el.find("#selected-all").unbind("click").bind("click", () => {
                                self.trigger("onSelected", response);
                                self.close();
                            });

                            self.$el.find("#grid").grid({
                                refresh: true,
                                primaryField: "id",
                                selectionMode: "multiple",
                                pagination: {
                                    page: 1,
                                    pageSize: 15
                                },
                                fields: [
                                    { field: "score", label: "Tích điểm" },
                                    { field: "contact_no", label: "Mã" },
                                    { field: "contact_name", label: "Tên khách hàng" }
                                ],
                                onRowClick: function (event) {
                                    self.selectedItems = event.selectedItems;
                                },
                                dataSource: response,
                            });
                        }
                    },
                    error: function (err) {
                    }
                });
            });
        }
    });
});