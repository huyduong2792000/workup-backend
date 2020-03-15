define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/model.html');
	var CONSTANT = require('app/common/Constants');
	var config = require('json!app/config.json');
	var schema = {
		"workstation_parent": {
			"type": "string"
		},
		"workstation": {
			"type": "string"
		}
	};

	return Gonrin.ModelView.extend({
		sync_status: 0,
		sync_position: "",
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "sync",
		uiControl: {
			fields: []
		},

		render: function () {
			var self = this;
			this.$el.html(this.template);
			// /images/sync-icon.ico
			this.$el.find("#sync-workstation-info").attr("src", gonrinApp().staticURL + "/images/sync-icon.ico");
			this.$el.find("#sync-products").attr("src", gonrinApp().staticURL + "/images/sync-icon.ico");

			var $parentEl = self.$el.find("#parent");

			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/configuration",
				type: "GET",
				success: function (response) {
					if (response && response.objects.length > 0 && response.objects[0].data.ipos && response.objects[0].data.ipos.workstation_parent) {
						var dataSource = [
							{ text: response.objects[0].data.ipos.workstation_parent, value: response.objects[0].data.ipos.workstation_parent }
						];
						$parentEl.combobox({
							textField: "text",
							valueField: "value",
							dataSource: dataSource
						});
					}
				},
				error: function () {

				}
			});

			$parentEl.on("change.gonrin", function (evt) {
				if (!!evt.value) {
					self.model.set("workstation_parent", evt.value);
				} else {
					self.model.set("workstation_parent", null);
				}
			});

			var $workstationEl = self.$el.find("#workstation_exid");
			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/workstation",
				data: "q=" + JSON.stringify({ filters: { "$and": [{ "active": { "$eq": true } }] } }),
				type: "GET",
				success: function (response) {
					if (response && response.objects.length > 0) {

						var dataSource = response.objects.filter(_ => _.workstation_exid);

						$workstationEl.combobox({
							textField: "workstation_name",
							valueField: "workstation_exid",
							dataSource: dataSource
						});
					}
				},
				error: function () {

				}
			})

			$workstationEl.on("change.gonrin", function (evt) {
				if (!!evt.value) {
					self.model.set("workstation", evt.value);
				} else {
					self.model.set("workstation", null);
				}
			})

			//	    		if (self.sync_status) {
			//	    			switch(self.sync_position) {
			//	    				case "product":
			//	    					$("#sync-product-status").html(CONSTANT.IMAGE_LOADER);
			//	    					break;
			//	    				case "customer":
			//	    					$("#sync-customer-status").html(CONSTANT.IMAGE_LOADER);
			//	    					break;
			//	    				case "bill":
			//	    					$("#sync-bill-status").html(CONSTANT.IMAGE_LOADER);
			//	    					break
			//	    				case "workstation":
			//	    					$("#sync-workstation-status").html(CONSTANT.IMAGE_LOADER);
			//	    					break;
			//	    			}
			//	    		}

			$("#sync-products").unbind("click").bind("click", function () {
				if (!self.validate()) {
					return;
				}
				$("#sync-product-status").html(CONSTANT.IMAGE_LOADER);
				var data = {
					pos_parent: self.model.get("workstation_parent"),
					pos_id: self.model.get("workstation")
				};

				var timer = setTimeout(function () {
					$.ajax({
						url: host + tenant_id + "/api/sync/products",
						data: JSON.stringify(data),
						type: "POST",
						dataType: "json",
						contentType: "application/json",
						success: function () {
							$.notify({ message: "Đồng bộ thành công." }, { type: "success" });
							$("#sync-product-status").html("");
						},
						error: function () {
							$.notify({ message: "Lỗi hệ thống, vui lòng thừ lại sau." }, { type: "danger" });
							$("#sync-product-status").html("<span style='color: red;'> Error</span>");
						}
					});
					clearTimeout(timer);
				}, 500);
			});

			return this;

		},

		validate: function () {
			if (!this.model.get("workstation_parent") || !this.model.get("workstation")) {
				this.getApp().notify({ message: "Vui lòng chọn chuỗi nhà hàng và địa điểm." }, { type: "danger" });
				return false;
			}
			return true;
		}

	});

});