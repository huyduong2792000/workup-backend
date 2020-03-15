// define(function(require) {
//     "use strict";
//     var $ = require('jquery'),
//         _ = require('underscore'),
//         Gonrin = require('gonrin');

//     var template = require('text!./tpl/pedeem-point.html'),
//         schema = require('json!schema/ContactSchema.json');
//     var Helpers = require('app/common/Helpers');
//     var PromotionSelectView = require('app/promotion/SelectView');
//     var WorkstationSelectView = require("app/workstation/SelectView");


//     var PromotionStatusList = [
//         { "text": "Đang hoạt động", "value": "active" },
//         { "text": "Đã gửi đi", "value": "notified" },
//         { "text": "Đã sử dụng", "value": "used" },
//         { "text": "Đã khoá", "value": "locked" },
//         { "text": "Scanning", "value": "waiting" },
//         { "text": "Log", "value": "log" },
//         { "text": "Đã huỷ", "value": "canceled" },
//     ];

//     // var conponType = [
//     //     { text: "Mã coupon", value: null || "" },
//     //     { text: "Mã voucher", value: 'value' }
//     // ];

//     return Gonrin.ModelView.extend({
//         template: template,
//         modelSchema: schema,
//         urlPrefix: "/api/v1/",
//         collectionName: "contact",

//         render: function() {
//             var self = this;
//             self.applyBindings();
//             self.uiControl();
//             self.switchUIControlRegister();
//             self.getContactInfo();
//         },

//         uiControl: function() {
//             let self = this;
//             self.$el.find("#status").combobox({
//                 textField: "text",
//                 valueField: "value",
//                 dataSource: PromotionStatusList,
//             });

//             $('#status').on('change.gonrin', function(e) {
//                 console.log($('#status').data('gonrin').getValue());
//             });

//             let $promotioneEl = self.$el.find("#promotion");
//             let $workstationEl = self.$el.find("#workstation");

//             $promotioneEl.ref({
//                 textField: "promotion_name",
//                 valueField: "id",
//                 selectionMode: "single",
//                 dataSource: PromotionSelectView
//             });

//             $promotioneEl.on("change.gonrin", function(evt) {
//                 // if (!!evt.value) {
//                 //     self.model.set("promotion_id", evt.value.id);
//                 //     self.model.set("promotion_name", evt.value.promotion_name);
//                 // } else {
//                 //     self.model.set("promotion_id", null);
//                 //     self.model.set("promotion_name", null);
//                 // }
//             });

//             $workstationEl.ref({
//                 textField: "workstation_name",
//                 valueField: "id",
//                 selectionMode: "single",
//                 dataSource: WorkstationSelectView
//             });

//             $workstationEl.on("change.gonrin", function(evt) {

//             });

//             self.$el.find('#expired_time_picker').datetimepicker({
//                 defaultDate: self.model.get("coupon_expire_at") ? self.model.get("coupon_expire_at") : null,
//                 format: "DD/MM/YYYY HH:mm",
//                 icons: {
//                     time: "fa fa-clock"
//                 }
//             });

//             self.$el.find('#expired_time_picker').on('change.datetimepicker', function(e) {
//                 if (e && e.date) {
//                     self.model.set("coupon_expire_at", e.date.local().unix() * 1000);
//                 } else {
//                     self.model.set("coupon_expire_at", null);
//                 }
//             });
//         },

//         switchUIControlRegister: function() {
//             var self = this;

//             self.$el.find(".switch input[id='without_condition_switch']").unbind("click").bind("click", function($event) {
//                 if ($(this).is(":checked")) {
//                     self.model.set("without_condition", true);
//                 } else {
//                     self.model.set("without_condition", false);
//                 }
//             })

//             if (self.model.get("without_condition") == true) {
//                 self.$el.find(".switch input[id='without_condition_switch']").trigger("click");
//             }

//             self.$el.find(".switch input[id='share_switch']").unbind("click").bind("click", function($event) {
//                 if ($(this).is(":checked")) {
//                     var timestampString = String(Helpers.now_timestamp());
//                     var timestamp = parseInt(timestampString.substring(0, 3) + "1" + timestampString.substring(3, 6) + "2" + timestampString.substring(6));
//                     self.model.set("timestamp", self.model.get("timestamp") ? self.model.get("timestamp") : timestamp);
//                     self.$el.find("#voucher_url").val("https://upstart.vn/crm/" + tenant_id + "/api/coupon/share?t=" + self.model.get("timestamp"));
//                 } else {
//                     self.model.set("timestamp", null);
//                     self.$el.find("#voucher_url").val("");
//                 }
//                 if (!self.onInit) {
//                     self.save({ navigate: false });
//                 }
//             });

//             if (self.model.get("timestamp") != null) {
//                 self.$el.find(".switch input[id='share_switch']").trigger("click");
//             }
//             self.onInit = false;
//         },

//         getContactInfo: function() {
//             let self = this;
//             let getParam = self.getApp().getRouter().getParam();
//             $.ajax({
//                 type: "GET",
//                 url: self.getApp().serviceURL + "/api/v1/contact/" + getParam.id,
//                 success: function(contactInfo) {
//                     if (contactInfo) {
//                         console.log("contactInfo", contactInfo.score);
//                         self.$el.find("#score").text(contactInfo.score);
//                         self.$el.find("#contact_phone").val(contactInfo.phone);
//                         self.$el.find("#contact_name").val(contactInfo.contact_name)
//                     }
//                 }
//             });
//         }
//     });
// });


define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/model.html'),
        schema = require('json!schema/CouponStorageSchema.json');
    var TemplateHelper = require('app/common/TemplateHelper');
    var Helpers = require('app/common/Helpers');
    var PromotionSelectView = require('app/promotion/SelectView');
    var WorkstationSelectView = require("app/workstation/SelectView");


    var PromotionStatusList = [
        { "text": "Đang hoạt động", "value": "active" },
        { "text": "Đã gửi đi", "value": "notified" },
        { "text": "Đã sử dụng", "value": "used" },
        { "text": "Đã khoá", "value": "locked" },
        { "text": "Scanning", "value": "waiting" },
        { "text": "Log", "value": "log" },
        { "text": "Đã huỷ", "value": "canceled" },
    ];

    var conponType = [
        { text: "Mã coupon", value: null || "" },
        { text: "Mã voucher", value: 'value' }
    ];

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        onInit: true,
        collectionName: "couponstorage",
        uiControl: {
            fields: [{
                    field: "coupon_type",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: conponType
                },
                {
                    field: "status",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: PromotionStatusList,
                },
                {
                    field: "workstation_id",
                    uicontrol: "ref",
                    textField: "name",
                    valueField: "id",
                    selectionMode: "single",
                    dataSource: WorkstationSelectView
                }
            ]
        },

        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                    name: "back",
                    type: "button",
                    buttonClass: "btn-secondary btn-sm",
                    label: "TRANSLATE:BACK",
                    command: function() {
                        var self = this;
                        self.getApp().getRouter().navigate(self.collectionName + "/collection");
                    }
                },
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-primary btn-sm",
                    label: "TRANSLATE:SAVE",
                    command: function() {
                        var self = this;
                        self.save({ navigate: true });
                    }
                },
                {
                    name: "delete",
                    type: "button",
                    buttonClass: "btn-danger btn-sm",
                    label: "TRANSLATE:DELETE",
                    visible: function() {
                        return this.getApp().getRouter().getParam("id") !== null;
                    },
                    command: function() {
                        var self = this;
                        self.model.set("deleted", true);
                        self.model.save(null, {
                            success: function(model, respose, options) {
                                self.getApp().notify({ message: "Đã xoá." }, { type: "success" });
                                self.getApp().getRouter().navigate(self.collectionName + "/collection");
                            },
                            error: function(model, xhr, options) {
                                self.getApp().notify('Save error');
                            }
                        });
                    }
                }
            ]
        }, ],

        /**
         * 
         */
        render: function() {
            var self = this;
            var id = this.getApp().getRouter().getParam("id");
            // find contact info and bind value to self object properties
            self.model.on("change:contact_phone", function($event) {
                $.ajax({
                    url: self.getApp().serviceURL + "/api/v1/contact/get",
                    data: "phone=" + self.model.get("contact_phone"),
                    type: "GET",
                    success: function(response) {
                        if (response) {
                            self.model.set("contact_id", response.id);
                            self.model.set("contact_name", response.contact_name);
                            self.model.set("contact_no", response.contact_no);
                        }
                    },
                    error: function(error) {
                        self.getApp().notify({ message: JSON.parse(error.responseText).error_message }, { type: "danger" });
                    }
                });
            });

            self.model.on("change:coupon_type", function(event) {
                if (self.model.get("coupon_type") == "value") {
                    self.$el.find("#coupon_value").prop("disabled", false);
                } else {
                    self.$el.find("#coupon_value").prop("disabled", true);
                }
            });

            self.$el.find("#copy-voucher").unbind("click").bind("click", function(event) {
                Clipboard.copy(self.model.get("coupon_code"));
                self.getApp().notify({ message: "Copied" }, { type: "success" });
            });

            self.$el.find("#copy-voucher-url").unbind("click").bind("click", function(event) {
                var copyText = document.getElementById("voucher_url");
                Clipboard.copy(copyText.value);
                self.getApp().notify({ message: "Copied" }, { type: "success" });
            });


            if (id) {
                //progresbar quay quay
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        self.applyBindings();
                        self.renderPromotion();
                        self.switchUIControlRegister();
                    },
                    error: function() {
                        self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
                    },
                });
            } else {
                self.model.set("status", PromotionStatusList[0].value);
                self.applyBindings();
                self.renderPromotion();
                self.switchUIControlRegister();
            }
        },

        /**
         * Ref uiControl used as manual
         */
        renderPromotion() {
            var self = this;
            var promotion_id = self.model.get("promotion_id");
            var promotion_name = self.model.get("promotion_name");
            var obj = !!promotion_id ? { "promotion_id": promotion_id, "promotion_name": promotion_name } : null;

            if (!!obj) {
                self.$el.find("#promotion").val(JSON.stringify(obj));
            }

            var $promotion_el = self.$el.find("#promotion");

            $promotion_el.ref({
                textField: "promotion_name",
                //valueField: "id",
                selectionMode: "single",
                dataSource: PromotionSelectView
            });

            $promotion_el.on("change.gonrin", function(evt) {
                if (!!evt.value) {
                    self.model.set("promotion_id", evt.value.id);
                    self.model.set("promotion_name", evt.value.promotion_name);
                } else {
                    self.model.set("promotion_id", null);
                    self.model.set("promotion_name", null);
                }
            });

            self.$el.find('#expired_time_picker').datetimepicker({
                defaultDate: self.model.get("coupon_expire_at") ? self.model.get("coupon_expire_at") : null,
                format: "DD/MM/YYYY HH:mm",
                icons: {
                    time: "fa fa-clock"
                }
            });

            self.$el.find('#expired_time_picker').on('change.datetimepicker', function(e) {
                if (e && e.date) {
                    self.model.set("coupon_expire_at", e.date.local().unix() * 1000);
                } else {
                    self.model.set("coupon_expire_at", null);
                }
            });
        },

        validate: function() {
            var self = this;
            if (this.model.get("status") == "scanning" || this.model.get("status") == "log") {
                self.getApp().notify({ message: "Bản ghi này lịch sử, không thể lưu." }, { type: "danger" });
                return false;
            }

            return true;
        },

        switchUIControlRegister: function() {
            var self = this;

            self.$el.find(".switch input[id='without_condition_switch']").unbind("click").bind("click", function($event) {
                if ($(this).is(":checked")) {
                    self.model.set("without_condition", true);
                } else {
                    self.model.set("without_condition", false);
                }
            })

            if (self.model.get("without_condition") == true) {
                self.$el.find(".switch input[id='without_condition_switch']").trigger("click");
            }

            self.$el.find(".switch input[id='share_switch']").unbind("click").bind("click", function($event) {
                if ($(this).is(":checked")) {
                    var timestampString = String(Helpers.now_timestamp());
                    var timestamp = parseInt(timestampString.substring(0, 3) + "1" + timestampString.substring(3, 6) + "2" + timestampString.substring(6));
                    self.model.set("timestamp", self.model.get("timestamp") ? self.model.get("timestamp") : timestamp);
                    self.$el.find("#voucher_url").val("https://upstart.vn/crm/" + tenant_id + "/api/coupon/share?t=" + self.model.get("timestamp"));
                } else {
                    self.model.set("timestamp", null);
                    self.$el.find("#voucher_url").val("");
                }
                if (!self.onInit) {
                    self.save({ navigate: false });
                }
            });

            if (self.model.get("timestamp") != null) {
                self.$el.find(".switch input[id='share_switch']").trigger("click");
            }
            self.onInit = false;
        },

        save: function(options = {}) {
            const self = this;

            if (!self.validate()) {
                return;
            }
            loader.show();
            self.model.save(null, {
                success: function(model, respose, options) {
                    self.getApp().notify({ message: "Lưu thành công" }, { type: "success" });
                    if (options && options.navigate) {
                        self.getApp().getRouter().navigate(self.collectionName + "/collection");
                    }
                    loader.hide();
                },
                error: function(model, xhr, options) {
                    loader.hide();
                    self.getApp().notify('Save error');
                }
            });
        }
    });
});