define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/collection.html'),
        schema = require('json!schema/ContactCategorySchema.json');
    var Helpers = require('app/common/Helpers');
    var TemplateHelper = require('app/common/TemplateHelper');
    var CustomFilterView = require('app/common/CustomFilterView');

    var AVAILABLE_CATEGORIES = [
        {'id': '', 'category_no': 'UP_CATEGORY_001', 'category_name': 'Khách hàng sử dụng dịch vụ > 3 lần'},
        {'id': '', 'category_no': 'UP_CATEGORY_002', 'category_name': 'Khách hàng sử dụng dịch vụ 1-3 lần'},
        {'id': '', 'category_no': 'UP_CATEGORY_003', 'category_name': 'Khách hàng sử dụng dịch vụ 1 lần'},
        {'id': '', 'category_no': 'UP_CATEGORY_004', 'category_name': 'Khách hàng chưa phát sinh hoá đơn'},
        {'id': '', 'category_no': 'UP_CATEGORY_005', 'category_name': 'Khách hàng Quan tâm Khuyến mãi'},
        {'id': '', 'category_no': 'UP_CATEGORY_006', 'category_name': 'Khách hàng Quan tâm Tích điểm'},
        {'id': '', 'category_no': 'UP_CATEGORY_007', 'category_name': 'Khách hàng đã từng đặt bàn'}
    ];

    return Gonrin.View.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "contactcategory",

        render: function () {
            var self = this;
            
            this.loadData();

        },

        loadData: function() {
            const self = this;

            var containerEl = this.$el.find("#contact_category_container");
            AVAILABLE_CATEGORIES.forEach((category, index) => {
                $(`<div class="col-lg-2 col-md-3 col-sm-4 col-6 float-left" id="${category.category_no}" style="margin-bottom: 30px;">
                    <div style="background-image: url(${self.getApp().staticURL}/images/customer-segment.jpg);
                    width: 100%; height: 150px; background-size: cover; background-position: center; border-radius: 15px;"></div>
                    <p style="height: 48px;overflow: hidden;font-size: 15px;text-align: center;color: #333;font-weight: 450;">${category.category_name}</p>
                </div>`).hide().appendTo(containerEl).fadeIn();
            });
        }
    });
});