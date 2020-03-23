define('jquery', [], function () {
    return jQuery;
});

require.config({
    baseUrl: static_url + '/lib',
    paths: {
        app: '../app',
        schema: '../schema',
        vendors: '../vendors'
    },
    shim: {
        'gonrin': {
            deps: ['underscore', 'jquery', 'backbone'],
            exports: 'Gonrin'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        }
    },
    config: {
        text: {
            useXhr: function (url, protocol, hostname, port) {
                return true;
            }
        }
    }
});
class Loader {
    constructor() {
        this.timer = null;
        this.delay = true;
        this.hideFlag = false;
    }
    show(content = null) {
        const self = this;
        this.delay = true;
        this.hideFlag = false;
        if (content) {
            $('body .page-loader-wrapper #loader-content').html(content);
        } else {
            $('body .page-loader-wrapper #loader-content').html("Please wait");
        }
        $('body .page-loader-wrapper').fadeIn();
        this.timer = setTimeout(() => {
            self.delay = false;
            if (this.hideFlag === true) {
                self.hide();
            }
        }, 600);
    }
    hide() {
        this.hideFlag = true;
        if (this.delay === false) {
            $('body .page-loader-wrapper').fadeOut();
            $('body .page-loader-wrapper #loader-content').html("Please wait");
        }
    }
}

window.loader = new Loader();

window.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
}

require([
    'jquery',
    'gonrin',
    'app/router',
    'app/base/nav/NavbarGeneratorView',
    'app/base/ProfileAreaView',
    'text!app/base/tpl/layout.html',
    'i18n!app/nls/app',
    'json!app/config.json',
    'vendors/lodash/lodash'
], function ($, Gonrin, Router, Nav, ProfileAreaView, layout, lang, config, lodash) {

    $.ajaxSetup({
        headers: {
            'content-type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
    window.lodash = lodash;

    var app = new Gonrin.Application({
        serviceURL: host + tenant_id,
        // serviceURL: location.protocol+'//'+location.hostname+(location.port ? ':'+location.port : ''),
        staticURL: static_url,
        // ZaloAppID: null,
        // verifyApi: host + tenant_id + "/api/v1/verify-info",
        verifyApi: host + tenant_id,
        tenantConfig: null,
        userConfig: null,
        router: new Router(),
        lang: lang,
        initialize: function () {
            var self = this;
            loader.show();
            this.getRouter().registerAppRoute();
            this.getCurrentUser();
            
            // $.ajax({
            //     url: self.serviceURL + "/api/v1/ranking/count_people_per_rank",
            //     data: null,
            //     type: "GET",
            //     contentType: "application/json",
            //     success: function (response) {
            //         config.rankingList = response ? response : [];

            //         if (config.rankingList.length > 0 && response[response.length - 1].start_scores > 0) {
            //             config.rankingStars = response.length;
            //         } else {
            //             config.rankingStars = response && response.length > 0 ? response.length - 1 : 0;
            //         }
            //     },
            //     error: function (model, xhr, options) {

            //     }
            // });


        },

        getCurrentUser: function () {
            var self = this;
            console.log('process get current user')
            $.ajax({
                url: self.serviceURL  + '/current-user',
                type:'GET',
                success: function (data) {
                    loader.hide();
                    // self.verifyAppData();
                    self.postLogin(data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    loader.hide();
                    var currentURL = window.location.href;
                    var backRouter = currentURL.substring(0, currentURL.indexOf("#"));
                    $.notify({ message: XMLHttpRequest.responseJSON.error_message });
                    self.router.navigate("login");
                }
            });
        },
        postLogin: function (data) {
            var self = this;
            self.currentUser = new Gonrin.User(data);
            $('body').html(layout);
            $.each($('.release-version'), function () {
                $(this).html(release_version);
            });
            this.$header = $('body').find(".header-navbar");
            this.$content = $('body').find(".content-area");
            this.$navbar = $('body').find(".left-navbar-space");
            this.$toolbox = $('body').find(".tools-area");
            this.nav = new Nav({ el: this.$navbar });
            self.nav.render();

            this.$toolbox = $('body').find(".tools-area");
            // add logo
            if (config.logo_img) {
                this.$header.find("#logo-img").attr("src", "https://upstart.vn/static/images/UpCRM.png");
            }
            this.profileArea = new ProfileAreaView({ el: $('body').find('#profile-area') });
            this.profileArea.render();
            self.router.navigate("index");
            // this.renderTheme(self.currentUser.config_data);
        },

        reloadCurrentUser: function (callbackFunc) {
            var self = this;
            $.ajax({
                url: self.getApp().serviceURL  + '/current-user',
                dataType: "json",
                success: function (data) {
                    self.currentUser = new Gonrin.User(data);
                    if (callbackFunc) {
                        callbackFunc(self.currentUser.config_data);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {

                }
            });
        },

        verifyAppData: function () {
            const self = this;
            loader.show();
            // VERIFY APP NECCESSERY INFO
            $.ajax({
                url: self.verifyApi,
                type: "GET",
                success: function (response) {
                    loader.hide();
                },
                error: function (xhr, statusText, errorThrow) {
                    loader.hide();
                    if (xhr.status == 520 && xhr.responseJSON.error_code == "NOT_FOUND") {
                        var api = "https://upstart.vn/accounts/api/v1/app/getapp_by_type";
                        var data = {
                            tenant_id: tenant_id,
                            app_type: "crm"
                        };
                        loader.show();
                        $.ajax({
                            url: api,
                            data: JSON.stringify(data),
                            type: "POST",
                            success: function (response) {
                                loader.hide();
                                if (response) {
                                    var saveConfigApi = self.getApp().serviceURL  + "/api/v1/configuration/save";
                                    var appData = {
                                        app_key: response.appkey,
                                        app_secret: response.appsecret
                                    };
                                    loader.show();
                                    $.ajax({
                                        url: saveConfigApi,
                                        data: JSON.stringify(appData),
                                        type: "POST",
                                        success: function () {
                                            loader.hide();
                                        },
                                        error: function (xhr) {
                                            loader.hide();
                                        }
                                    })
                                }

                            },
                            error: function (xhr) {
                                console.log("[ERROR]VERIFY APP NECCESSERY INFO ", xhr);
                                loader.hide();
                            }
                        });
                    }
                }
            });

        },

        renderTheme: function (config_data, reload = false) {
            if (reload == true) {
                this.reloadCurrentUser(this.renderTheme);
                return;
            }
            var theme_color = config_data.theme_color;
            var isDark = true;
            if ((theme_color.startsWith('rgba') && parseInt(theme_color.substring(5, theme_color.indexOf(","))) > 130) ||
                theme_color.startsWith("#") && (!parseInt(theme_color.substring(1, 2)) || parseInt(theme_color.substring(1, 2)) > 8)) {
                isDark = true;
            } else {
                isDark = false;
            }
            if (true) {
                // text color light
                if ($("#sidebarCollapse").hasClass("text-dark")) {
                    $("#sidebarCollapse").removeClass("text-dark");
                }
                $("#sidebarCollapse").addClass("text-light");
                $.each($('nav'), function (el) {
                    $.each($(this).find("a"), () => {
                        if ($(this).hasClass("text-dark")) {
                            $(this).removeClass("text-dark");
                        }
                        if ($(this).hasClass("text-light")) {
                            return;
                        }
                        $(this).addClass("text-light");
                    })
                });
            } else {
                // text color dark
                if ($("#sidebarCollapse").hasClass("text-light")) {
                    $("#sidebarCollapse").removeClass("text-light");
                }
                $("#sidebarCollapse").addClass("text-dark");
                $.each($('nav'), function (el) {
                    $.each($(this).find("a"), () => {
                        if ($(this).hasClass("text-dark")) {
                            return;
                        }
                        if ($(this).hasClass("text-light")) {
                            $(this).removeClass("text-light");
                        }
                        $(this).addClass("text-dark");
                    });
                });
            }
            // $('body').find(".header-navbar").css("background-color", config_data.theme_color ? config_data.theme_color : "none");
            // $("#sidebar").css("background-color", config_data.theme_color ? config_data.theme_color : "none");
            // $("#right_sidebar").css("background-color", config_data.theme_color ? config_data.theme_color : "none");
        }
    });
    Backbone.history.start();

});