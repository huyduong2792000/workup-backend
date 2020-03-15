define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!./tpl/note.html'),
        schema = require('json!schema/ContactNoteSchema.json');
    var Helpers = require('app/common/Helpers');

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        bindings: "contactnote-bind",
        urlPrefix: "/api/v1/",
        collectionName: "contactnote",
        uiControl: {
            fields: [],
        },
        tools: null,
		/**
		 * 
		 */
        render: function () {
            var self = this;
            if (this.viewData && this.viewData.contact_id) {
                this.model.set('contact_id', this.viewData.contact_id);
                $.ajax({
                    url: self.getApp().serviceURL + "/api/v1/contactnote/get_by_contact_id",
                    data: "contact_id=" + self.viewData.contact_id,
                    type: "GET",
                    success: function(response) {
                        self.eventRegister();
                        if (response) {
                            var notesEl = self.$el.find("#notes");
                            notesEl.empty();
                            response.forEach((note, index) => {
                                var html = `<div class="card" style="border-radius: 6px;background: transparent; z-index: 0; box-shadow: none;">
                                <div class="card-body" style="padding-top: 46px;">
                                <div style="background: #ffc907; padding: 5px 8px;
                                            position: absolute; top: 10px; left: -10px;">${Helpers.utcToLocal(note.created_at, 'YYYY/MM/DD HH:mm')}</div>
                                <div style="background: #315294; padding: 5px 8px;
                                            position: absolute; top: 10px;
                                            left: 122px; color: #fff;">${note.created_by_name ? note.created_by_name : 'Unknown'}</div>
                                    <div class="form-group required">
                                        <label class="text-upper text-gray">Tiêu đề</label>
                                        <p>${note.title}</p>
                                    </div>
                                    <div class="form-group required">
                                        <label class="text-upper text-gray">Mô tả</label>`;

                                var splitedNotes = note.note.split("\n");
                                splitedNotes.forEach((line, ix) => {
                                    html += `<p class="mb-0">${line}</p>`;
                                });
                                
                                html += `<div id="files" style="display: inline-block; width: 100%; margin-top: 5px;">`;

                                if (note.attachments && Array.isArray(note.attachments)) {
                                    note.attachments.forEach((attachment, idx) => {
                                        html += `<div class="col-lg-4 col-4 float-left p-1" style="height: 96px;">
                                            <div style="width: 100%; height: 100%; background-image: url(${attachment}); background-size: cover; background-position: center;"></div>
                                        </div>`;
                                    });
                                }

                                html +=  `</div>
                                        </div>
                                        <div class="form-group required">
                                            <label class="text-upper text-gray">Feedback</label>
                                            <textarea class="form-control" rows="3" readonly=""></textarea>
                                        </div>
                                        <div class="form-inline required">
                                            <label class="text-upper text-gray">Rating: </label>
                                            5 sao
                                        </div>
                                    </div>
                                </div>`;

                                $(html).prependTo(notesEl).fadeIn();
                            })
                        }
                    },
                    error: function(xhr) {}
                });
            } else {
                self.applyBindings();
                self.eventRegister();
            }
        },

        eventRegister: function () {
            const self = this;

            this.$el.find("#btn_save").unbind("click").bind("click", () => {
                self.model.set('title', self.$el.find("#title").val());
                self.model.set('note', self.$el.find("#note").val());
                self.model.save(null, {
                    success: function (model, response, options) {
                        self.getApp().notify({ message: "Đã lưu." }, { type: "success" });
                        self.model.set(null);
                        self.$el.find("#title").val("");
                        self.$el.find("#note").val("");
                        self.$el.find("#files").empty();

                        var notesEl = self.$el.find("#notes");
                        var html = `<div class="card" style="border-radius: 6px;background: transparent; z-index: 0; box-shadow: none;">
                        <div class="card-body" style="padding-top: 46px;">
                        <div style="background: #ffc907; padding: 5px 8px;
                                    position: absolute; top: 10px; left: -10px;">${Helpers.utcToLocal(response.created_at, 'YYYY/MM/DD HH:mm')}</div>
                        <div style="background: #315294; padding: 5px 8px;
                                    position: absolute; top: 10px;
                                    left: 122px; color: #fff;">${response.created_by_name ? response.created_by_name : 'Unknown'}</div>
                            <div class="form-group required">
                                <label class="text-upper text-gray">Tiêu đề</label>
                                <p>${response.title}</p>
                            </div>
                            <div class="form-group required">
                                <label class="text-upper text-gray">Mô tả</label>`;

                        var splitedNotes = response.note.split("\n");
                        splitedNotes.forEach((line, ix) => {
                            html += `<p class="mb-0">${line}</p>`;
                        });

                        html += `<div id="files" style="display: inline-block; width: 100%; margin-top: 5px;">`;
                        if (response.attachments && Array.isArray(response.attachments)) {
                            response.attachments.forEach((attachment, idx) => {
                                html += `<div class="col-lg-4 col-4 float-left p-1" style="height: 96px;">
                                    <div style="width: 100%; height: 100%; background-image: url(${attachment}); background-size: cover; background-position: center;"></div>
                                </div>`;
                            });
                        }

                        html +=  `</div>
                                </div>
                                <div class="form-group required">
                                    <label class="text-upper text-gray">Feedback</label>
                                    <textarea class="form-control" rows="3" readonly=""></textarea>
                                </div>
                                <div class="form-inline required">
                                    <label class="text-upper text-gray">Rating: </label>
                                    5 sao
                                </div>
                            </div>
                        </div>`;

                        $(html).prependTo(notesEl).fadeIn();
                    },
                    error: function (modelData, xhr, options) {
                        if (xhr && xhr.responseJSON && xhr.responseJSON.error_message) {
                            self.getApp().notify({ message: xhr.responseJSON.error_message }, { type: "danger" });
                            return;
                        }
                        self.getApp().notify({ message: "Lỗi hệ thống, thử lại sau." }, { type: "danger" });
                    }
                });
            });

            // this.model.on("change:attachments", () => {
            //     var filesEl = self.$el.find("#files");
            //     filesEl.empty();
            //     var attachments = self.model.get("attachments") ? self.model.get("attachments") : [];
            //     attachments.forEach((file, index) => {
            //         filesEl.append(`<div class="col-lg-4 col-4 float-left p-1" style="height: 96px;">
            //             <div style="width: 100%; height: 100%; background-image: url(${file}); background-size: cover; background-position: center;"></div>
            //         </div>`);
            //     });
            // });

            var filesEl = self.$el.find("#files");
            filesEl.empty();
            this.$el.find("#attachment").on('change.gonrin', (event) => {
                var attachments = self.model.get("attachments") ? self.model.get("attachments") : [];
                attachments.push(event.value.link);
                self.model.set("attachments", attachments);
                filesEl.append(`<div class="col-lg-4 col-4 float-left p-1" style="height: 96px;">
                    <div style="width: 100%; height: 100%; background-image: url(${event.value.link}); background-size: cover; background-position: center;"></div>
                </div>`);
            });

            this.$el.find("#attachment").imagelink({
                service: {
                    url: "https://upstart.vn/services/api/image/upload?path=upstart"
                }
            })
        },

        validate: function () {
            return true;
        }
    });

});