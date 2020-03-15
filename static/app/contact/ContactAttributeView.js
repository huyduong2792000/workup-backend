define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/contact-attribute.html');
    var Helpers = require('app/common/Helpers');

    var schema = {
        'id': {
            'type': 'string',
            'primary': true
        },
        'attribute': {
            'type': 'string'
        },
        'label': {
            'type': 'string'
        },
        'value': {
            'type': 'string'
        },
        'created_at': {
            'type': 'number'
        },
        'updated_at': {
            'type': 'number'
        },
        'description': {
            'type': 'string'
        }
    };

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        bindings: 'attribute-bind',
        urlPrefix: "/api/v1/",
        collectionName: "contact",
        tools: null,
        /**
         * 
         */
        render: function () {
            this.applyBindings();
            this.loadDefaultData();
            this.eventRegister();
        },

        loadDefaultData: function () {
            const self = this;
        },

        eventRegister: function () {
            const self = this;

            this.model.on('change:attribute', () => {
                if (self.model.get('attribute')) {
                    var attr = Helpers.convertToAttribute(self.model.get('attribute'));
                    self.model.set('attribute', attr);
                } else {

                }
            });

            self.$el.find("#btn_save").unbind("click").bind("click", () => {
                if (!self.validate()) {
                    return;
                }
                var time = Helpers.now_timestamp();
                if (self.viewData && self.viewData.action == 'create') {
                    self.model.set('created_at', time);
                    self.model.set('updated_at', time);
                } else {
                    self.model.set('updated_at', time);
                }
                self.trigger('change', self.model.toJSON());
            });

            self.$el.find("#btn_cancel").unbind("click").bind("click", () => {
                self.trigger('cancel', self.model.toJSON());
            });
        },

        validate: function () {
            const self = this;
            if (!self.model.get('attribute')) {
                return false;
            } else {
                // var newValue = Helpers.replaceToAscii(self.model.get('attribute'));
                // newValue = newValue.replace(/[&\/\\#,+()$~%.'":*?<>{} ]/g, '_');
                var attr = Helpers.convertToAttribute(self.model.get('attribute'));
                if (!attr) {
                    return false;
                }
            }

            if (!self.model.get('label')) {
                return false;
            }
            if (!self.model.get('value')) {
                return false;
            }

            return true;
        }
    });

});