define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');


    return [
        {
            "text": "Trang chủ",
            "type": "view",
            "collectionName": "index",
            "route": "index",
            "$ref": "app/base/IndexView",
            "icon": "<i class='fa fa-columns'></i>"
        },
        {
            "text": "Danh mục",
            "icon": "<i class='fa fa-list'></i>",
            "type": "category",
            "visible": true,
            "entries": [
                {
                    "text": "Công việc hôm nay",
                    "type": "view",
                    "collectionName": "tasks_employees",
                    "route": "tasks_employees/collection",
                    "$ref": "app/tasks_employees/CollectionView",
                    "icon": "<i class='fa fa-sitemap'></i>",
                    "visible": function () {
                        return true;
                    }
                },
                {
                    "text": "Quản lý công việc",
                    "type": "view",
                    "collectionName": "tasks",
                    "route": "tasks/collection",
                    "$ref": "app/tasks/CollectionView",
                    "icon": "<i class='fa fa-cog'></i>",
                    "visible": function () {
                        return true;
                    }
                },
                {
                    "type": "view",
                    "collectionName": "tasks",
                    "route": "tasks/model(/:id)",
                    "$ref": "app/tasks/ModelView",
                    "visible": false
                },
                {
                    "text": "Lên lịch công việc",
                    "type": "view",
                    "collectionName": "task_schedule",
                    "route": "task_schedule/collection",
                    "$ref": "app/task_schedule/CollectionView",
                    "icon": '<i class="far fa-calendar-plus"></i>',
                    "visible": function () {
                        return true;
                    }
                },
                {
                    "type": "view",
                    "collectionName": "task_schedule",
                    "route": "task_schedule/model(/:id)",
                    "$ref": "app/task_schedule/ModelView",
                    "visible": false
                },
                
            ]
        },
        
        {
            "text": "Quản trị",
            "icon": "<i class='fa fa-cogs'></i>",
            "type": "category",
            "visible": function () {                
                // return this.checkUserHasRole("admin");
                var user = gonrinApp().currentUser;
                roles = user.roles;
                
                return true;
            },
            "entries": [
                {
                    "text": "Nhân viên",
                    "type": "view",
                    "collectionName": "employee",
                    "route": "employee/collection",
                    "$ref": "app/employee/CollectionView",
                    "icon": "<i class='fa fa-user-tie'></i>",
                    "visible": function () {
                        return true;
                    }
                },
                {
                    "type": "view",
                    "collectionName": "employee",
                    "route": "employee/model(/:id)",
                    "$ref": "app/employee/ModelView",
                    "visible": false
                },
                {
                    "type": "view",
                    "collectionName": "user",
                    "route": "user/change-password",
                    "$ref": "app/user/ChangePasswordView",
                    "visible": false
                },
                {
                    "text": "TRANSLATE:ROLE_MANAGEMENT",
                    "type": "view",
                    "collectionName": "role",
                    "route": "role/collection",
                    "$ref": "app/role/CollectionView",
                    "icon": "<i class='fa fa-award'></i>",
                    "visible": function () {
                        return true;
                    }
                },
                {
                    "type": "view",
                    "collectionName": "role",
                    "route": "role/model(/:id)",
                    "$ref": "app/role/ModelView",
                    "visible": false
                },
                {
                    "text": "Phân quyền",
                    "type": "view",
                    "collectionName": "permission",
                    "route": "permission/collection",
                    "$ref": "app/permission/CollectionView",
                    "icon": "<i class='fa fa-user-shield'></i>",
                    "visible": function () {
                        return false;
                    }
                },
                {
                    "type": "view",
                    "collectionName": "permission",
                    "route": "permission/model(/:id)",
                    "$ref": "app/permission/ModelView",
                    "visible": false
                }
            ]
        },
        {
            "text": "Configuration",
            "icon": "<i class='fa fa-bar-cors'></i>",
            "type": "category",
            "visible": function () {
                return false;
            },
            "entries": [
                {
                    "type": "view",
                    "collectionName": "base",
                    "route": "base/config",
                    "$ref": "app/base/GeneralConfigView",
                    "visible": false
                },
                {
                    "type": "view",
                    "collectionName": "configuration",
                    "route": "config",
                    "$ref": "app/config/ConfigView",
                    "visible": false
                }
            ]
        },
        // EXTERNAL VIEW
        {
            "type": "view",
            "collectionName": "intergrate",
            "route": "intergrate/kiotviet/check",
            "$ref": "app/intergrate/kiotviet/ScanVoucherView",
            "visible": false
        }
    ];
});