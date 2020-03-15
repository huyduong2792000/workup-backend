define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/collection.html'),
        schema = require('json!schema/ContactSchema.json');
    var config = require('json!app/config.json');
    var Helpers = require('app/common/Helpers');
    var TemplateHelper = require('app/common/TemplateHelper');
    var CustomFilterView = require('app/common/CustomFilterView');
    var ContactFilterView = require('app/contact/ContactFilterView');

    return Gonrin.CollectionView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "contact",
        uiControl: {
            orderBy: [
                { field: "created_at", direction: "desc" },
                { field: "contact_no", direction: "desc" },
                { field: "used_times", direction: "asc" },
                { field: "score", direction: "asc" }
            ],
            fields: [{
                field: "score",
                label: "Điểm",
                cssClass: "text-center hide-on-mobile",
                width: "60px",
                template: function (rowObj) {
                    // var div = null;
                    // config.rankingList.forEach(function(item) {
                    // 	if (item.start_scores <= Math.floor(rowObj.score) && (!!item.end_scores && item.end_scores >= Math.floor(rowObj.score)) || !item.end_scores) {

                    // 		var roundStars = config.rankingStars - (item.ranking_order - 1);
                    // 		var oddStart = 0;
                    // 		if (item.end_scores != null) {
                    // 			var oddStart = (rowObj.score - item.start_scores) / (item.end_scores - item.start_scores);
                    // 		}

                    // 		div = TemplateHelper.rating(roundStars + oddStart, 1, config.rankingStars, rowObj.score, false);
                    // 	}
                    // });
                    return rowObj.score ? String(Math.round(rowObj.score * 100) / 100) : "0";
                    // return div;
                }
            },
            { field: "contact_no", label: "Mã" },
            {
                field: "contact_name",
                label: "Tên thành viên",
                template: function (rowObject) {
                    return `<div style="min-width: 170px;">${rowObject.contact_name}</div>`;
                }
            },
            {
                field: "birthday",
                label: "Ngày sinh",
                template: function (rowObject) {
                    if (rowObject.birthday) {
                        try {
                            return Helpers.setDatetime(rowObject.birthday, { format: 'DD/MM/YYYY' });
                        } catch (error) {
                            return '';
                        }
                    }
                    return '';
                }
            },
            {
                field: "phone",
                label: "Số điện thoại",
                template: function (rowObject) {
                    return `<div style="min-width: 133px;">${TemplateHelper.phoneFormat(rowObject.phone ? rowObject.phone : "")}</div>`;
                }
            },
            {
                field: "email",
                label: "Email"
            },
            { field: "used_times", label: "Lần", cssClass: "hide-on-mobile" },
            {
                field: "created_at",
                label: "Ngày tạo",
                cssClass: "hide-on-mobile",
                template: function (rowObj) {
                    return Helpers.utcToLocal(rowObj.created_at, "DD/MM/YYYY");
                }
            },
            {
                field: "deleted",
                label: " ",
                width: "60px",
                template: function (rowObject) {
                    return TemplateHelper.renderStatus(!rowObject.deleted);
                }
            },
            {
                field: "command",
                label: " ",
                width: "50px",
                command: [{
                    "label": '<i class="far fa-envelope" style="color: #ca0b0b"></i',
                    "action": function (params, args) {
                        if (this.$el.find('.message-box').hasClass('hide')) {
                            this.$el.find('.message-box').removeClass('hide');
                            this.sendMessage(params, args);
                            this.$el.find('#send-to-message').text(params.rowData.social_info[0].name);
                        } else {
                            this.$el.find('.message-box').addClass('hide')
                        }
                    },
                    "args": {},
                    // "class": "btn btn-danger btn-sm"
                }],
            },
            {
                field: "command",
                label: " ",
                width: "50px",
                command: [{
                    "label": '<i class="fas fa-bezier-curve"></i>',
                    "action": function (params, args) {
                        console.log("params", params);
                        if (params && params.rowData) {
                            let path = "point/redeem/contact?contact-id=" + params.rowData.id;
                            console.log("path", path)
                            console.log("path", path)
                            console.log("path", path)
                            console.log("path", path)

                            this.getApp().getRouter().navigate(path);
                        }
                    },
                    "args": {},
                    // "class": "btn btn-danger btn-sm"
                }],
            },
            ],
            onRowClick: function (event) {
                if (event.rowId) {
                    var path = this.collectionName + '/model?id=' + event.rowId;
                    this.getApp().getRouter().navigate(path);
                }
            },
            onRendered: function (event) {
                const self = this;
                loader.hide();
                self.$el.find("#btn_show_membercard").unbind("click").bind("click", () => {
                    // https://upstart.vn/crm/demo/api/v1/contact/profilecard
                    Clipboard.copy(self.getApp().serviceURL + '/api/v1/contact/profilecard');
                    self.getApp().notify({ message: "Copied" }, { type: "success" });
                });
            },
            onChangePage: function (event) {
                var self = this;
                if (event.page) {
                    var durationTime = setTimeout(function () {
                        $('[data-toggle="tooltip"]').tooltip();
                        clearTimeout(durationTime);
                    }, 300);
                }
            },
            // refresh: true
        },
        tools: null,
        initialize: function () {
            loader.show();
        },
        render: function () {
            var self = this;
            // this.uiControl.filters = { "deleted": { "$eq": false } };

            // console.log("xxx")

            var filter = new CustomFilterView({
                el: self.$el.find("#filter"),
                sessionKey: "contact_filter"
            });
            filter.render();

            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var textUpper = !!filter.model.get("text") ? filter.model.get("text").trim().toUpperCase() : "";
                var textLower = !!filter.model.get("text") ? filter.model.get("text").trim().toLowerCase() : "";
                var filters = {
                    "$or": [
                        { "phone": { "$like": text } },
                        { "contact_name": { "$like": text } },
                        { "contact_name": { "$like": textUpper } },
                        { "contact_name": { "$like": textLower } },
                        { "email": { "$like": text } },
                        { "email": { "$like": textUpper } },
                        { "email": { "$like": textLower } },
                        { "contact_no": { "$like": text } },
                        { "contact_no": { "$like": textUpper } }
                    ]
                };
                self.uiControl.filters = filters;
            }
            self.applyBindings();

            filter.on('filterChanged', function (evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters = {
                            "$or": [
                                { "phone": { "$like": text } },
                                { "contact_name": { "$like": text } },
                                { "email": { "$like": text } },
                                { "contact_no": { "$like": text } }
                            ]
                        };
                        $col.data('gonrin').filter(filters);
                    } else {
                        self.uiControl.filters = null;
                    }
                }
                self.applyBindings();
            });

            var durationTime = setTimeout(function () {
                $('[data-toggle="tooltip"]').tooltip();
                clearTimeout(durationTime);
            }, 800);

            this.$el.find("#close-message").unbind("click").bind("click", () => {
                this.$el.find(".message-box").addClass('hide');
            })

            this.$el.find("#btn_filter").unbind("click").bind("click", () => {
                var contactFilter = new ContactFilterView({
                    el: $("#free_space"),
                    viewData: {
                        options: {
                            css: {
                                "top": "52px",
                                "box-shadow": "0px 0px 20px -10px #000"
                            }
                        }
                    }
                });
                contactFilter.render();
                contactFilter.on('filter', (data) => {
                    var $col = self.getCollectionElement();
                    var filters = {
                        '$and': []
                    };
                    Object.keys(data).forEach((key) => {
                        if (key == 'score_from') {
                            filters['$and'].push({
                                'score': { '$gte': parseFloat(data[key]) }
                            })
                        } else if (key == 'score_to') {
                            filters['$and'].push({
                                'score': { '$lte': parseFloat(data[key]) }
                            })
                        } else if (key == 'month') {
                            filters['$and'].push({
                                'bmonth': { '$eq': parseInt(data[key]) }
                            })
                        } else if (key == 'date') {
                            filters['$and'].push({
                                'bdate': { '$eq': parseInt(data[key]) }
                            })
                        }
                    });

                    if ($col) {
                        $col.data('gonrin').filter(filters);
                        self.applyBindings();
                    }
                });
            });

            return this;
        },

        sendMessage: function (params, args) {
            const self = this;
            self.$el.find("#send-message").unbind("click").bind("click", (click) => {
                var message = this.$el.find("#message-content").val();

                var socialInfo = params.rowData.social_info;
                if (socialInfo) {
                    $.ajax({
                        url: "https://upstart.vn/chatbot/api/v1/message/send ",
                        type: "POST",
                        data: JSON.stringify({
                            "page_id": socialInfo[0].page_id,
                            "psid": socialInfo[0].id,
                            "content": {
                                "messaging_type": "text",
                                "block_id": null,
                                "text": message
                            }
                        }),
                        success: (response) => {
                            if (response) {
                                this.$el.find("#message-content").val("");
                                this.$el.find("#close-message").trigger("click");
                                self.getApp().notify({ "message": "Send message success" }, { "type": "success" });
                            }
                        },
                        error: (error) => {
                            console.log("error", error);
                        }
                    })
                }
            });
        }
    });
});