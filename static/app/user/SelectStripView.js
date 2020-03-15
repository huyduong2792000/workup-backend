define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!./tpl/select.html'),
		schema = require('json!schema/UserSchema.json');

	return Gonrin.CollectionDialogView.extend({
		//selectedItems : [],  //[] may be array if multiple selection
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "user",
		//textField: "fullname",
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "close",
						type: "button",
						buttonClass: "btn btn-danger btn-md margin-left-5",
						label: "Close",
						command: function () {
							this.close();
						}
					},
					{
						name: "select",
						type: "button",
						buttonClass: "btn btn-primary btn-md margin-left-5",
						label: "TRANSLATE:SELECT",
						command: function () {
							var self = this;
							self.trigger("onSelected");
							self.close();
						}
					},
				]
			},
		],
		uiControl: {
			orderBy: [
				{ field: "id", direction: "asc" }
			],
			fields: [
				{
					field: "id", label: "ID", width: 50, readonly: true,
				},
				{ field: "name", label: "Tên đăng nhập" },
				{ field: "fullname", label: "Họ và tên" },
				{ field: "email", label: "Email", visible: false },
				{ field: "phone", label: "Phone" },
				{
					field: "roles",
					visible: false
				},
				{ field: "cuahangs", label: "Cửa hàng", textField: "ten", visible: false },
				{ field: "active", label: "Kích hoạt", visible: false },
				{ field: "password", visible: false },
				{ field: "confirmpassword", visible: false },
			],
			onRowClick: function (event) {
				var select = [];
				for (var i = 0; i < event.selectedItems.length; i++) {
					var obj = {
						id: event.selectedItems[i].id,
						fullname: event.selectedItems[i].fullname,
						//logo: event.selectedItems[i].logo,
						//address: event.selectedItems[i].address,
					}
					select.push(obj);
				}
				this.uiControl.selectedItems = select;
			},
		},
		render: function () {
			this.applyBindings();
		}
	});

});