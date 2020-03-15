define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/model.html'),
        schema = require('json!schema/MessageSchema.json');
    var Helpers = require("app/common/Helpers");
    var TemplateHelper = require("app/common/TemplateHelper");
    var MessageFilterView = require("app/message/MessageFilterView");

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "message",
        filters: {},
        uiControl: {
            fields: []
        },
        render: function() {
            var self = this;
            var id = this.getApp().getRouter().getParam("id");
            if (id) {
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        self.applyBindings();
                        self.loadDefaultData();
                        self.registerEvents();
                    },
                    error: function() {
                        self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
                    },
                });
            } else {
                self.loadDefaultData();
                self.applyBindings();
                self.registerEvents();
                self.setDefaultModel();
            }

            var messageFilterView = new MessageFilterView({
                el: self.$el.find("#message_filter")
            });
            messageFilterView.render();
            messageFilterView.on("filter", (data) => {
                self.filters = data;
                if (!self.validate(self.filters)) {
                    return;
                }
                self.loadData();
            });
        },

        loadDefaultData: function() {
            const self = this;
            console.log("model", self.model.toJSON())
            self.$el.find("#contact_list").grid({
                primaryField: "id",
                pagination: {
                    page: 1,
                    pageSize: 10
                },
                tools: null,
                fields: [
                    { field: "contact_no", label: "Code" },
                    { field: "contact_name", label: "Name" },
                    { field: "phone", label: "Phone" },
                    {
                        field: "birthday",
                        label: "Bithday",
                        template: function(rowObject) {
                            if (rowObject.birthday) {
                                return Helpers.setDatetime(rowObject.birthday, {
                                    format: "DD/MM/YYYY"
                                });
                            }
                            return '';
                        }
                    },
                    {
                        field: "social_info",
                        label: "Reachable",
                        width: "105px",
                        template: function(rowObject) {
                            if (rowObject.social_info) {
                                return TemplateHelper.renderStatus(true);
                            }
                            return TemplateHelper.renderStatus(false);
                        }
                    }
                ],
                onRowClick: function(event) {
                    if (event.rowData._id) {

                    }
                },
                onRendered: function() {
                    loader.hide();
                },
                refresh: true,
                dataSource: []
            });
        },

        loadData: function() {
            loader.show();
            const self = this;
            var contactApi = self.getApp().serviceURL + "/api/v1/contact";
            var filters = {
                "filters": {
                    "$and": []
                }
            };
            if (self.filters && self.filters.contact_phone) {
                filters['filters']['$and'].push({
                    "$or": [
                        { phone: { "$eq": self.filters.contact_phone } }
                    ]
                })
            }

            if (self.filters && self.filters.birthday_from) {
                var fromObject = Helpers.datetimeToObject(self.filters.birthday_from, true);
                var fromMonth = fromObject.months + 1;
                var fromDate = fromObject.date;
                filters['filters']['$and'].push({
                    "$or": [
                        { "bmonth": { "$gt": fromMonth } },
                        {
                            "$and": [
                                { "bmonth": { "$eq": fromMonth } },
                                { "bdate": { "$gte": fromDate } }
                            ]
                        }
                    ]
                });
            }

            if (self.filters && self.filters.birthday_to) {
                var toObject = Helpers.datetimeToObject(self.filters.birthday_to, true);
                var toMonth = toObject.months + 1;
                var toDate = toObject.date;
                filters['filters']['$and'].push({
                    "$or": [
                        { "bmonth": { "$lt": toMonth } },
                        {
                            "$and": [
                                { "bmonth": { "$eq": toMonth } },
                                { "bdate": { "$lte": toDate } }
                            ]
                        }
                    ]
                });
            }

            if (self.filters && self.filters.score_from) {
                filters['filters']['$and'].push({
                    "score": { "$gte": parseFloat(self.filters.score_from) }
                });
            }

            if (self.filters && self.filters.score_to) {
                filters['filters']['$and'].push({
                    "score": { "$lte": parseFloat(self.filters.score_to) }
                });
            }

            $.ajax({
                url: contactApi,
                data: "q=" + JSON.stringify(filters),
                type: "GET",
                success: function(response) {
                    self.sendMultipleMessage(response.objects);

                    self.$el.find("#contact_list").grid({
                        primaryField: "id",
                        pagination: {
                            page: 1,
                            pageSize: 10
                        },
                        tools: null,
                        fields: [
                            { field: "score", label: "Điểm" },
                            { field: "contact_no", label: "Code" },
                            { field: "contact_name", label: "Name" },
                            { field: "phone", label: "Phone" },
                            {
                                field: "birthday",
                                label: "Bithday",
                                template: function(rowObject) {
                                    if (rowObject.birthday) {
                                        return Helpers.setDatetime(rowObject.birthday, {
                                            format: "DD/MM/YYYY"
                                        });
                                    }
                                    return '';
                                }
                            },
                            {
                                field: "social_info",
                                label: "Reachable",
                                width: "105px",
                                template: function(rowObject) {
                                    if (rowObject.social_info && Array.isArray(rowObject.social_info) && rowObject.social_info.length > 0) {
                                        return TemplateHelper.renderStatus(true);
                                    }
                                    return TemplateHelper.renderStatus(false);
                                }
                            }
                        ],
                        onRowClick: function(event) {
                            console.log("event", event);
                            // if (event.rowData._id) {

                            // }
                        },
                        onRendered: function() {
                            loader.hide();
                        },
                        refresh: true,
                        dataSource: response.objects
                    });
                },
                error: function(xhr, errorThrow) {
                    console.log("xhr: ", xhr);
                }
            })
        },

        registerEvents: function() {
            const self = this;
            this.$el.find("#add-attributes").unbind("click").bind("click", function(event) {
                let value = (self.$el.find("#message").val() ? self.$el.find("#message").val() : "") + "{{}}";
                self.$el.find("#message").val(value);
            });
        },

        setDefaultModel: function() {
            const self = this;
            self.model.set("id", gonrin.uuid());
            self.model.set("created_at", Helpers.now_timestamp());
            self.model.set("channel", "Message");
        },

        sendMultipleMessage: function(contacts) {
            const self = this;
            self.$el.find("#send-message").unbind("click").bind("click", (click) => {
                let message = self.$el.find("#message").val();
                if (!message) {
                    self.getApp().notify({message: "Vui lòng nhập nội dung tin nhắn"}, { type: "danger"});
                    return;
                }
                $.ajax({
                    url: self.getApp().serviceURL + "/api/v1/message/send_multiple",
                    type: "POST",
                    data: JSON.stringify({
                        "contacts": contacts,
                        "content": {
                            "messaging_type": "text",
                            "block_id": null,
                            "text": message
                        }
                    }),
                    success: (response) => {},
                    error: (error) => {}
                });
                var minTime = Math.round(contacts.length * 1.5);
                var maxTime = contacts.length * 2;
                if (minTime < 60) {
                    minTime = minTime + "s";
                } else {
                    minTime = Math.round(minTime / 60) + "p";
                }

                if (maxTime < 60) {
                    maxTime = maxTime + "s";
                } else {
                    maxTime = Math.round(maxTime / 60) + "p";
                }
                self.getApp().notify({message: "Dự kiến gửi trong " + minTime + " - " + maxTime}, { type: "success"});
            });
        },

        validate: function(data) {
            const self = this;
            var fromObject = null;
            var toObject = null;
            if (data && data.birthday_from) {
                fromObject = Helpers.datetimeToObject(data.birthday_from, true);
            }
            if (data && data.birthday_from) {
                toObject = Helpers.datetimeToObject(data.birthday_to, true);
            }

            if (fromObject && toObject && (fromObject.months + 1 > toObject.months + 1 || (fromObject.months == toObject.months && fromObject.date > toObject.date))) {
                self.getApp().notify({ message: "Vui lòng chọn ngày bắt đầu nhỏ hơn ngày kết thúc." }, { type: "danger" });
                return false;
            }
            return true;
        }
    });
});