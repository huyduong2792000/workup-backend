define(function (require) {
	"use strict";

	var $ = require('jquery'),
		Gonrin = require('gonrin');
	var navdata = require('app/base/nav/nav');

	return Gonrin.Router.extend({
		routes: {
			"index": "index",
			// "login": "login",
			"logout": "logout",
			"error": "error_page",
			"*path": "defaultRoute"
		},

        /**
         * come here only one time when init router
         */
		index: function () {
		},

		logout: function () {
			var self = this;
			$.ajax({
				url: self.getApp().serviceURL + '/logout',
				dataType: "json",
				success: function (data) {
					self.getApp().getCurrentUser();
					return;
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					self.getApp().notify({ message: self.getApp().translate("LOGOUT_ERROR") }, { type: "danger" });
					return;
				}
			});
		},

		defaultRoute: function () {
			this.navigate("index", true);
		},

		error_page: function () {
			var app = this.getApp();
			if (app.$content) {
				app.$content.html("Error Page");
			}
			return;
		},

		registerAppRoute: function() {
            var self = this;
            $.each(navdata, function(idx, entry) {
                var entry_path = _.result(entry, 'route');
                self.route(entry_path, entry.collectionName, function() {
                    require([entry['$ref']], function(View) {
                        var view = new View({
                            el: self.getApp().$content,
                            viewData: entry.viewData
                        });
                        view.render();
                    });
                });
            });
            Backbone.history.start();
        }
	});

});