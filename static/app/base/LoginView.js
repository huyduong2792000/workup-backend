define(function (require) {

	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin'),
		config = require('json!app/config.json'),
		tpl = require('text!./tpl/login.html'),
		template = _.template(tpl);

	return Gonrin.View.extend({
		render: function () {
			var self = this;
			self.getApp().currentUser = null;
			this.$el.html(template());
			this.$el.find("#logo_img").attr("src", config.logo_img);
			this.$el.find("#login-form").unbind("submit").bind("submit", function () {
				self.processLogin();
				return false;
			})
			return this;
		},
		processLogin: function () {
			console.log('process login')
			var username = this.$('[name=username]').val();
			var password = this.$('[name=password]').val();

			var data = JSON.stringify({
				username: username,
				password: password
			});
			var self = this;

			$.ajax({
				url: self.getApp().serviceURL + '/login',
				type: 'post',
				data: data,
				headers: {
					'content-type': 'application/json',
					// 'app-key': null // set null to avoid lossing
				},
				dataType: 'json',
				success: function (data) {
					self.getApp().postLogin(data);
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					self.getApp().notify({ message: "Login error" }, { type: "danger" });
				}
			});
		},

	});

});