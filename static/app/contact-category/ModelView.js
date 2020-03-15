define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/model.html'),
        schema = require('json!schema/ContactCategorySchema.json');
    var Helpers = require('app/common/Helpers');

    var ContactSelect = require("app/contact/SelectView");

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "contactcategory",
        uiControl: {
            // fields: [{
            //     field: "contacts",
            //     uicontrol: "ref",
            //     textField: "contact_name",
            //     selectionMode: "multiple",
            //     dataSource: ContactSelect,
            //     size: "large"
            // }],
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
                        console.log("self.model ", self.model.toJSON());
                        self.model.save(null, {
                            success: function(model, response, options) {
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
                            success: function(model, response, options) {
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
                        self.eventRegister();
                    },
                    error: function() {
                        self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
                    },
                });
            } else {
                self.applyBindings();
                self.eventRegister();
            }


        },

        eventRegister: function() {
            const self = this;
            self.$el.find(".switch input[id='deleted']").unbind("click").bind("click", function($event) {
                if ($(this).is(":checked")) {
                    self.model.set("deleted", false);
                } else {
                    self.model.set("deleted", true);
                }
            })

            if (!self.model.get("deleted")) {
                self.$el.find(".switch input[id='deleted']").trigger("click");
            }

            self.getListCategory();
            self.addContacts();
        },

        addContacts: function() {
            const self = this;
            self.$el.find("#add_contacts").unbind("click").bind("click", () => {
                let contactSelect = new ContactSelect();
                contactSelect.dialog({
                    size: "large"
                });
                contactSelect.on("onSelected", (contacts) => {
                    let newContacts = self.model.get('contacts').concat(clone(contacts));
                    let mergeContact = lodash.uniqBy(newContacts, 'id');
                    self.model.set('contacts', mergeContact);
                    self.getListCategory(mergeContact);
                });
            });
        },

        getListCategory: function(data) {
            const self = this;
            let contacts = data ? data : self.model.get("contacts");
            let listContactEL = self.$el.find("#grid");

            listContactEL.grid({
                primaryField: "id",
                pagination: {
                    page: 1,
                    pageSize: 15
                },
                refresh: true,
                fields: [{
                        field: "contact_no",
                        label: "Mã KH",
                        template: (rowData) => {
                            if (rowData.contact_no) {
                                return "" + rowData.contact_no;
                            } else {
                                return "";
                            }
                        }
                    },
                    {
                        field: "contact_name",
                        label: "Tên KH",
                        template: (rowData) => {
                            if (rowData.contact_name) {
                                return "" + rowData.contact_name;
                            } else {
                                return "";
                            }
                        }
                    },
                    {
                        field: "score",
                        label: "Score",
                        template: (rowData) => {
                            if (rowData.score) {
                                return "" + rowData.score;
                            } else {
                                return "" + 0;
                            }
                        }
                    },
                    {
                        field: "phone",
                        label: "Phone",
                        template: (rowData) => {
                            if (rowData.phone) {
                                return "" + rowData.phone;
                            } else {
                                return "";
                            }
                        },
                    },
                    {
                        field: "command",
                        label: " ",
                        width: "50px",
                        command: [{
                            "label": "<span class='fa fa-times'></span></button>",
                            "action": function(params, args) {
                                self.$el.find("#tbl_grid_tr_" + params.rowData.id).hide(500, () => {
                                    contacts.forEach(element => {
                                        if (element.id === params.rowData.id) {
                                            contacts.splice($.inArray(element, contacts), 1);
                                        }
                                    });
                                    listContactEL.data('gonrin').deleteRow(params.el);
                                });
                            },
                            "args": {},
                            "class": "btn btn-danger btn-sm"
                        }],
                    },

                ],
                dataSource: contacts,
                onRendered: function(event) {}
            });
        },

        validate: function() {
            if (!this.model.get("category_name") || !this.model.get("category_name").trim()) {
                this.getApp().notify({ message: "Nhập tên nhóm khách hàng." }, { type: "danger" });
                return false;
            }
            return true;
        }
    });
});