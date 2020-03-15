define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/model.html'),
        schema = require('json!schema/ContactSchema.json');
    var Helpers = require('app/common/Helpers');

    var NoteView = require('app/contact/NoteView');
    var ContactAttributeView = require('app/contact/ContactAttributeView');

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "contact",
        uiControl: {
            fields: [{
                field: "gender",
                uicontrol: "combobox",
                textField: "text",
                valueField: "value",
                dataSource: [
                    { "value": "male", "text": "Nam" },
                    { "value": "female", "text": "Nữ" },
                ],
                value: "male"
            }],
        },
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                    name: "back",
                    type: "button",
                    buttonClass: "btn-secondary btn-sm",
                    label: "<span class='fa fa-chevron-left'></span> Quay lại",
                    command: function() {
                        var self = this;
                        self.getApp().getRouter().navigate(self.collectionName + "/collection");
                    }
                },
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-coal btn-sm",
                    label: "<span class='fa fa-save'></span> Lưu",
                    command: function() {
                        var self = this;
                        if (!self.validate()) {
                            return;
                        }
                        self.model.set('deleted', false);
                        self.model.save(null, {
                            success: function(model, respose, options) {
                                self.getApp().notify({ message: "Thành công." }, { type: "success" });
                                self.getApp().getRouter().navigate(self.collectionName + "/collection");
                            },
                            error: function(modelData, xhr, options) {
                                if (xhr && xhr.responseJSON && xhr.responseJSON.error_message) {
                                    self.getApp().notify({ message: xhr.responseJSON.error_message }, { type: "danger" });
                                    return;
                                }
                                self.getApp().notify({ message: "Lỗi hệ thống, thử lại sau." }, { type: "danger" });
                            }
                        });
                    }
                },
                {
                    name: "delete",
                    type: "button",
                    buttonClass: "btn-danger btn-sm",
                    label: "<span class='fa fa-trash'></span> Xoá",
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
                },
            ]
        }, ],
        /**
         * 
         */
        render: function() {
            var self = this;
            var id = this.getApp().getRouter().getParam("id");

            if (id) {
                this.model.set('id', id);
                this.model.fetch({
                    success: function(data) {
                        self.applyBindings();
                        self.$el.find("#score").html(self.model.get("score") ? self.model.get("score") : 0);
                        self.$el.find("#used_times").html(self.model.get("used_times"));
                        self.loadDefaultData();
                        self.eventRegister();
                    },
                    error: function() {
                        self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
                    },
                });
            } else {
                self.applyBindings();
                self.loadDefaultData();
                self.eventRegister();
            }


        },

        loadDefaultData: function() {
            const self = this;
            this.renderExtraAttributes();
            this.renderTags();
        },

        eventRegister: function() {
            const self = this;
            var id = this.getApp().getRouter().getParam("id");
            var birthday = false;
            if (self.model.get("birthday") && self.model.get("birthday").indexOf("T")) {
                birthday = moment(self.model.get("birthday"), "YYYY-MM-DDTHH:mm:ss");
            } else if (self.model.get("birthday") && self.model.get("birthday").indexOf("-")) {
                birthday = moment(self.model.get("birthday"), "YYYY-MM-DD");
            } else if (self.model.get("birthday")) {
                birthday = moment(self.model.get("birthday"), "DD/MM/YYYY");
            }
            self.$el.find('#birthday').datetimepicker({
                defaultDate: birthday,
                format: "DD/MM/YYYY",
                icons: {
                    time: "fa fa-clock"
                }
            });

            self.$el.find('#birthday').on('change.datetimepicker', function(e) {
                if (e && e.date) {
                    self.model.set("birthday", e.date.format("YYYY-MM-DD"))
                } else {
                    self.model.set("birthday", null);
                }
            });

            self.$el.find("#copy_phone").unbind("click").bind("click", function(event) {
                var copyText = document.getElementById("contact_phone");
                copyText.select();
                document.execCommand("copy");
                self.getApp().notify({ message: "Copied" }, { type: "success" });
            });

            self.$el.find("#copy_contact_no").unbind("click").bind("click", function(event) {
                var copyText = document.getElementById("contact_no");
                copyText.select();
                document.execCommand("copy");
                self.getApp().notify({ message: "Copied" }, { type: "success" });
            });

            if (id) {
                var noteView = new NoteView({
                    viewData: {
                        contact_id: id
                    }
                });
                noteView.render();
                $(noteView.el).hide().appendTo(this.$el.find("#note_space")).fadeIn();
            }

            self.model.on("change:extra_attributes", () => {
                self.renderExtraAttributes();
            });

            self.$el.find("#btn_add_attribute").unbind('click').bind('click', ($event) => {
                var contactAttributeView = new ContactAttributeView({
                    viewData: {
                        'action': 'create'
                    }
                });
                contactAttributeView.render();

                $(contactAttributeView.el).hide().appendTo(self.$el.find("#add_attribute_space")).fadeIn();

                contactAttributeView.on('change', (data) => {
                    var attributeData = clone(data);
                    attributeData.id = gonrin.uuid();
                    var extra_attributes = self.model.get('extra_attributes');
                    if (extra_attributes && Array.isArray(extra_attributes)) {
                        extra_attributes.push(attributeData);
                    } else {
                        extra_attributes = [attributeData];
                    }
                    self.model.set('extra_attributes', extra_attributes);
                    self.model.trigger('change:extra_attributes');

                    contactAttributeView.destroy();
                });

                contactAttributeView.on('cancel', (data) => {
                    contactAttributeView.destroy();
                });
            });

            self.model.on('change:tags', () => {
                self.renderTags();
            });

            this.$el.find("#tags_space").unbind("click").bind("click", () => {
                var tagsEl = self.$el.find("#tags_space");
                if (!tagsEl.find("#typing").length) {
                    $(`<input id="typing" class="form-control float-left" placeholder="Nhập tags" style="width: 200px;"/>`).appendTo(tagsEl).fadeIn();
                    tagsEl.find("#typing").focus();
                    tagsEl.find("#typing").unbind("keypress").bind("keypress", (event) => {
                        if (event.keyCode == 13) {
                            var val = tagsEl.find("#typing").val();
                            var tags = self.model.get('tags');
                            if (!tags || !Array.isArray(tags)) {
                                tags = [];
                            }
                            var found = false;
                            tags.forEach((item, index) => {
                                if (item == val) {
                                    found = true;
                                }
                            });
                            if (!found && val && val.trim()) {
                                tags.push(val);

                                self.model.set('tags', tags);
                                self.model.trigger('change:tags');
                            }
                            tagsEl.find("#typing").remove();
                        }
                    });
                }

            });
        },

        renderTags: function() {
            const self = this;
            var tagsEl = this.$el.find("#tags_space");
            tagsEl.empty();
            var tags = this.model.get('tags');
            if (tags && Array.isArray(tags)) {
                tags.forEach((tag, index) => {
                    $(`<span class="bg-warning float-left m-1" style="padding: 3px 10px; border-radius: 3px;">${tag}</span>`).appendTo(tagsEl).fadeIn();
                });
            }
        },

        renderExtraAttributes: function() {
            const self = this;
            var extra_attributes = this.model.get('extra_attributes');
            var extraAttributesEl = self.$el.find("#extra_attributes");
            extraAttributesEl.empty();
            if (extra_attributes && Array.isArray(extra_attributes)) {
                extra_attributes.forEach((attr, index) => {
                    $(`<div class="col-lg-4 col-md-4 col-sm-12 col-12 float-left mb-3">
                        <label class="text-uppercase text-gray">${attr.label}</label>
                        <input class="form-control" type="text" value="${attr.value}" id="${attr.id}" readonly/>
                    </div>`).hide().appendTo(extraAttributesEl).fadeIn();

                    self.$el.find("#" + attr.id).unbind("click").bind("click", (event) => {
                        var contactAttributeView = new ContactAttributeView({
                            viewData: {
                                'action': 'update'
                            }
                        });
                        contactAttributeView.model.set(attr);
                        contactAttributeView.render();

                        $(contactAttributeView.el).hide().appendTo(self.$el.find("#add_attribute_space")).fadeIn();
                        contactAttributeView.on('change', (data) => {
                            var attributeData = clone(data);
                            var extra_attributes = self.model.get('extra_attributes');
                            if (extra_attributes && Array.isArray(extra_attributes)) {
                                extra_attributes.forEach((attr, index) => {
                                    if (attr.id == attributeData.id) {
                                        extra_attributes[index] = attributeData;
                                    }
                                });
                                self.model.set('extra_attributes', extra_attributes);
                                self.model.trigger('change:extra_attributes');
                            }
                            contactAttributeView.destroy();
                        });

                        contactAttributeView.on('cancel', (data) => {
                            contactAttributeView.destroy();
                        });
                    });
                });
            }
        },

        validate: function() {
            if (!this.model.get("phone") || !this.model.get("phone").trim()) {
                this.getApp().notify({ message: "Số điện thoại không thể để trống." }, { type: "danger" });
                return false;
            }

            if (!this.model.get("contact_name") || !this.model.get("contact_name").trim()) {
                this.getApp().notify({ message: "Tên khách hàng không thể để trống." }, { type: "danger" });
                return false;
            }
            return true;
        }
    });

});