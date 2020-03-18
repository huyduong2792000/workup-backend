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
        
        // {
        //     "text": "Khách hàng",
        //     "icon": "<i class='fa fa-user-tag'></i>",
        //     "type": "category",
        //     "visible": true,
        //     "entries": [
        //         {
        //             "text": "Công ty",
        //             "type": "view",
        //             "collectionName": "account",
        //             "route": "account/collection",
        //             "$ref": "app/account/CollectionView",
        //             "icon": "<i class='fa fa-city'></i>",
        //             "visible": function () {
        //                 return true;
        //             }
        //         },
        //         {
        //             "type": "view",
        //             "collectionName": "account",
        //             "route": "account/model(/:id)",
        //             "$ref": "app/account/ModelView",
        //             "visible": false
        //         },
        //         {
        //             "text": "Khách hàng",
        //             "type": "view",
        //             "collectionName": "contact",
        //             "route": "contact/collection",
        //             "$ref": "app/contact/CollectionView",
        //             "icon": "<i class='fa fa-users'></i>",
        //             "visible": function () {
        //                 return true;
        //             }
        //         },
        //         {
        //             "type": "view",
        //             "collectionName": "contact",
        //             "route": "contact/model(/:id)",
        //             "$ref": "app/contact/ModelView",
        //             "visible": false
        //         },
                
        //     ]
        // },
        // {
        //     "text": "Marketing",
        //     "icon": "<i class='fa fa-chart-area'></i>",
        //     "type": "category",
        //     "visible": true,
        //     "entries": [
        //         {
        //             "text": "Quản lý Voucher",
        //             "type": "view",
        //             "collectionName": "couponstorage",
        //             "route": "couponstorage/collection",
        //             "$ref": "app/coupon-storage/CollectionView",
        //             "icon": "<i class='fa fa-qrcode'></i>"
        //         },
        //         {
        //             "type": "view",
        //             "collectionName": "couponstorage",
        //             "route": "couponstorage/model(/:id)",
        //             "$ref": "app/coupon-storage/ModelView",
        //             "visible": false
        //         },
        //         {
        //             "text": "Chương trình khuyến mãi",
        //             "type": "view",
        //             "collectionName": "promotion",
        //             "route": "promotion/collection",
        //             "$ref": "app/promotion/CollectionView",
        //             "icon": "<i class='fa fa-gift'></i>"
        //         },
        //         {
        //             "type": "view",
        //             "collectionName": "promotion",
        //             "route": "promotion/model(/:id)",
        //             "$ref": "app/promotion/ModelView",
        //             "visible": false
        //         },
        //         {
        //             "text": "Nhắn tin chăm sóc",
        //             "type": "view",
        //             "collectionName": "message",
        //             "route": "message/send-messager",
        //             "$ref": "app/message/ModelView",
        //             "icon": "<i class='fa fa-comments'></i>"
        //         },
        //         {
        //             "type": "view",
        //             "collectionName": "message",
        //             "route": "message/model(/:id)",
        //             "$ref": "app/message/ModelView",
        //             "visible": false
        //         }
        //     ]
        // },
        // {
        //     "text": "Thống kê",
        //     "icon": "<i class='fa fa-signal'></i>",
        //     "type": "category",
        //     "visible": function () {
        //         //return this.checkUserHasRole("admin");
        //         return true;
        //     },
        //     "entries": [
        //         {
        //             "text": "TK Khách Hàng",
        //             "type": "view",
        //             "collectionName": "customer",
        //             "route": "report/customer",
        //             "$ref": "app/report/CustomerReport",
        //             "icon": "<i class='fa fa-chart-pie'></i>",
        //             "visible": function () {
        //                 return true;
        //             }
        //         },
        //         {
        //             "text": "TK CT Khuyến Mãi",
        //             "type": "view",
        //             "collectionName": "promotion",
        //             "route": "report/promotion",
        //             "$ref": "app/report/PromotionReport",
        //             "icon": "<i class='fa fa-chart-line'></i>",
        //             "visible": function () {
        //                 return true;
        //             }
        //         },
        //         {
        //             "text": "TK Theo Sản Phẩm",
        //             "type": "view",
        //             "collectionName": "product",
        //             "route": "report/product",
        //             "$ref": "app/report/ProductReport",
        //             "icon": "<i class='fa fa-chart-bar'></i>",
        //             "visible": function () {
        //                 return false;
        //             }
        //         },
        //         {
        //             "text": "TK Doanh Thu",
        //             "type": "view",
        //             "collectionName": "revenue",
        //             "route": "report/revenue",
        //             "$ref": "app/report/RevenueReport",
        //             "visible": function () {
        //                 return false;
        //             }
        //         }
        //     ]
        // },
        {
            "text": "Quản trị",
            "icon": "<i class='fa fa-cogs'></i>",
            "type": "category",
            "visible": function () {
                //return this.checkUserHasRole("admin");
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