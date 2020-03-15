define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/collection.html'),
        schema = require('json!schema/MessageSchema.json');
    var Helpers = require('app/common/Helpers');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "message",
        uiControl: {
            orderBy: [{ field: "created_at", direction: "desc" }],
            fields: [{
                    field: "channel",
                    label: "Channel",
                    template: function(rowObject) {
                        return `<div style="min-width: 120px;">${rowObject.channel}</div>`;
                    }
                },
                { field: "send_from", label: "From" },
                { field: "send_to", label: "To" },
                {
                    field: "send_time",
                    label: "Sent Time",
                    template: function(rowObject) {
                        return Helpers.setDatetime(rowObj.send_time, { format: "DD/MM/YYYY HH:mm" });
                    }
                },
                { field: "status", label: " ", width: "60px" },

            ],
            onRowClick: function(event) {
                if (event.rowId) {
                    var path = this.collectionName + '/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
            }
        },

        render: function() {
            this.applyBindings();
            return this;
        },

    });

});