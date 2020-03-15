define(function (require) {

	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin'),
        template = require('text!./tpl/secure-config.html');
    // var ConnectionAppCollectionView = require("app/connection-app/CollectionView");
        
	var secureConfigSchema = {
		// "contact_code_format": {
		// 	"type": "string"
		// },
		// "score_ratio": {
		// 	"type": "number"
        // },
        // "promotion_by_contact_code": {
        //     "type": "boolean"
        // }
	};

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: secureConfigSchema,
		urlPrefix: "/api/v1/",
        collectionName: "config",

		render: function () {
            var self = this;
            if (self.viewData) {
                self.model.set(self.viewData);
            }
            this.applyBindings();
            this.eventRegister()
            this.switchUIRegister();
            this.load3ndConnector();
			$('[data-toggle="tooltip"]').tooltip();
        },

        eventRegister: function() {
            const self = this;
        },

        switchUIRegister: function () {
			const self = this;
        },
        
        load3ndConnector: function () {
			const self = this;
			// var connectionApp = new ConnectionAppCollectionView({
			// 	el: self.$el.find("#3nd_conntector")
			// });
			// connectionApp.render();
			// connectionApp.on("change", function ($event) {
			// 	self.load3ndConnector();
			// });
		},
    });
});