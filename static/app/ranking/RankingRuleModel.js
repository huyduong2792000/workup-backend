define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    var template = require('text!./tpl/ranking-rule-model.html'),
        schema = require('json!schema/RankingRuleSchema.json');

    var RuleSelectionDialog = require('app/ranking/rules/RuleSelectionDialog');
    var AmountRuleVIew = require('app/ranking/rules/AmountRuleVIew');

    const RULEMAPP = {
        'amount': AmountRuleVIew
    };

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "rankingrule",
        uiControl: {
            fields: [
                {
                    field: 'rule_type',
                    uicontrol: 'combobox',
                    textField: 'text',
                    valueField: 'value',
                    dataSource: [
                        { text: 'Ranking', value: 'ranking' },
                        // { text: 'Minus', value: 'minus' },
                        // { text: 'Bonus', value: 'bonus' }
                    ]
                }
            ]
        },
        tools: [
            {
                name: "defaultgr",
                type: "group",
                groupClass: "toolbar-group",
                buttons: [
                    {
                        name: "back",
                        type: "button",
                        buttonClass: "btn-secondary btn-sm",
                        label: "<span class='fa fa-chevron-left'></span> Quay lại",
                        command: function () {
                            var self = this;
                            self.getApp().getRouter().navigate("ranking/rule");
                        }
                    },
                    {
                        name: "save",
                        type: "button",
                        buttonClass: "btn-primary btn-sm",
                        label: "<span class='fa fa-save'></span> Lưu",
                        command: function () {
                            var self = this;
                            self.model.save(null, {
                                success: function (model, respose, options) {
                                    self.getApp().notify({ message: "Đã lưu" }, { type: "success" });
                                    self.getApp().getRouter().navigate("ranking/rule");
                                },
                                error: function (model, xhr, options) {
                                    console.log(xhr);
                                    self.getApp().notify({ message: xhr.responseJSON.error_message }, { type: "danger" });
                                }
                            });
                        }
                    },
                    {
                        name: "delete",
                        type: "button",
                        buttonClass: "btn-danger btn-sm",
                        label: "<span class='fa fa-trash'></span> Xoá",
                        visible: function () {
                            return this.getApp().getRouter().getParam("id") !== null;
                        },

                        command: function () {
                            var self = this;

                            self.model.set('status', 'deactive');
                            self.model.save(null, {
                                success: function (model, respose, options) {
                                    self.getApp().notify({ message: "Đã xoá" }, { type: "success" });
                                    self.getApp().getRouter().navigate("ranking/rule");
                                },
                                error: function (model, xhr, options) {
                                    self.getApp().notify({ message: xhr.responseJSON.error_message }, { type: "danger" });
                                }
                            });
                        }
                    },
                ]
            }
        ],

        render: function () {
            var self = this;
            var id = this.getApp().getRouter().getParam("id");

            if (id) {
                self.model.set('id', id);
                self.model.fetch({
                    success: function (data) {
                        self.applyBindings();
                        self.loadInitData();
                        self.registerEvents();
                        self.switchUIControlRegister();
                    },
                    error: function () {
                        self.getApp().notify({ message: "Get data Eror" }, { type: "danger" });
                    },
                });
            } else {
                self.applyBindings();
                self.loadInitData();
                self.registerEvents();
                self.switchUIControlRegister();
            }
        },

        loadInitData: function () {
            const self = this;
            const ruleEls = this.$el.find("#rules_space");
            ruleEls.empty();

            const rules = this.model.get('rule_data');

            if (rules && Array.isArray(rules)) {
                rules.forEach((rule, index) => {
                    if (RULEMAPP[rule.rule_type]) {
                        var view = new RULEMAPP[rule.rule_type]();
                        view.model.set(rule);
                        view.render();
                        $(view.el).appendTo(ruleEls).fadeIn();

                        view.on('change', (modelData) => {
                            let rules = self.model.get('rule_data');
                            if (rules && Array.isArray(rules)) {
                                rules.forEach((rule, index) => {
                                    if (rule.id == modelData.id) {
                                        rules[index] = clone(modelData);
                                    }
                                });
                                self.model.set('rule_data', rules);
                                self.model.trigger('change:rule_data');
                            }
                        });
                    }
                });
            }

            // var amountRule = new AmountRuleVIew();
            // amountRule.render();

            // $(amountRule.el).appendTo(ruleEls).fadeIn();

        },

        registerEvents: function () {
            const self = this;
            this.$el.find("#rules_space").unbind("click").bind("click", () => {
                // var ruleSelectionDialog = new RuleSelectionDialog();
                // ruleSelectionDialog.dialog();

                // ruleSelectionDialog.on('selected', (data) => {
                //     console.log("DATA: ", data);
                // });
            });

            this.$el.find("#btn_add_rule").unbind("click").bind("click", () => {
                console.log("CLICKED");
                const ruleEls = this.$el.find("#rules_space");
                let ruleDialog = new RuleSelectionDialog();
                ruleDialog.dialog();

                ruleDialog.on("selected", (data) => {
                    let rules = self.model.get('rule_data');
                    if (RULEMAPP[data.name]) {
                        var view = new RULEMAPP[data.name]();
                        var id = gonrin.uuid();
                        view.model.set('id', id);
                        view.render();
                        $(view.el).appendTo(ruleEls).fadeIn();

                        if (rules && Array.isArray(rules)) {
                            rules.push(clone(view.model.toJSON()));
                            self.model.set('rule_data', rules);
                        } else {
                            rules = [clone(view.model.toJSON())];
                            self.model.set('rule_data', rules);
                        }

                        view.on('change', (modelData) => {
                            console.log("modelData ", modelData);
                            let rules = self.model.get('rule_data');
                            if (rules && Array.isArray(rules)) {
                                rules.forEach((rule, index) => {
                                    if (rule.id == modelData.id) {
                                        rules[index] = clone(modelData);
                                    }
                                });
                                console.log("rules ", rules);
                                self.model.set('rule_data', rules);
                                self.model.trigger('change:rule_data');
                            }
                        });
                    }
                });
            });
        },

        switchUIControlRegister: function () {
            var self = this;

            self.$el.find(".switch input[id='status_switch']").unbind("click").bind("click", function ($event) {
                if ($(this).is(":checked")) {
                    self.model.set("status", "active");
                } else {
                    self.model.set("status", "deactive");
                }
            })

            if (self.model.get("status") == "active") {
                self.$el.find(".switch input[id='status_switch']").trigger("click");
            }
        }
    });

});