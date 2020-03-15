define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/select.html'),
        schema = require('json!schema/ContactSchema.json');
    var TemplateHelper = require('app/common/TemplateHelper');

    return Gonrin.CollectionDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "contactcategory",
        textField: "category_name",
        tools: [
            {
                name: "defaultgr",
                type: "group",
                groupClass: "toolbar-group",
                buttons: [
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
                    },
                ]
            },
        ],
        uiControl: {
            fields: [
                { field: "category_no", label: "Mã" },
                { field: "category_name", label: "Tên nhóm" },
            ],
            onRowClick: function (event) {
                var selectedItems = event.selectedItems.map((item, index) => {
                    return {
                        id: item.id,
                        category_no: item.category_no,
                        category_name: item.category_name
                    }
                });

				this.uiControl.selectedItems = selectedItems;
			}
        },
        render: function () {
            this.applyBindings();
        }

    });

});