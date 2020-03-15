define(function (require) {

	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin'),
		config = require('json!app/config.json'),
		template = require('text!./tpl/profile-area.html');

	var SwitchWorkstationDialogView = require("app/workstation/SwicthWorkstationDialogView");

	return Gonrin.View.extend({
		template: template,
		render: function () {
			var self = this;
			self.applyBindings();
			self.$el.find("#profileimg").attr("src", self.getApp().currentUser.user_image ? self.getApp().currentUser.user_image : this.staticURL + "/images/icons/user.png");

			self.switchWorkstation();
			
			$("#right_sidebar").mCustomScrollbar({
				theme: "minimal"
			});

			self.$el.find("#profile_nav").unbind("click").bind("click", function(event) {
				$('#right_sidebar').addClass('active');
				$('.overlay').fadeIn();
				$('.collapse.in').toggleClass('in');
				$('a[aria-expanded=true]').attr('aria-expanded', 'false');
				$("body").css({"overflow": "hidden"});
				// $(".page-container").addClass('move-left');
			});

			$('#right_dismiss, .overlay').on('click', function () {
				$('#right_sidebar').removeClass('active');
				$('.overlay').fadeOut();
				$("body").css({"overflow": "auto"});
				// $(".page-container").removeClass('move-left');
			});
		},

		switchWorkstation: function () {
			var self = this;

			//header area
			var $user = $("span.username");
			$.each($user, function() {
				$(this).html(self.getApp().currentUser.display_name ? self.getApp().currentUser.display_name : self.getApp().currentUser.email);
			});

			self.$el.find("#swicth-workstation").unbind("click").bind("click", function ($event) {
				var dialogView = new SwitchWorkstationDialogView();
				dialogView.dialog();
			});
		}
	});

});