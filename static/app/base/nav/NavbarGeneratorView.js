define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = '<ul class="list-unstyled components" id="main_nav"></ul>';

    var navdata = require('app/base/nav/nav');

    return Gonrin.View.extend({
        //data: navdata,
        checkUserHasRole: function (rolename) {
            return gonrinApp().currentUser != null ? gonrinApp().currentUser.hasRole(rolename) : false;
        },
        loadEntries: function ($el, entries, is_root) {
            var self = this;
            if (entries && (entries.length > 0)) {
                _.each(entries, function (entry, index) {
                    var entry_type = _.result(entry, 'type');
                    var entry_collectionName = _.result(entry, 'collectionName');
                    var entry_ref = _.result(entry, '$ref');
                    var entry_text = _.result(entry, 'text');
                    var entry_icon = _.result(entry, 'icon');
                    var entry_href = _.result(entry, 'href');
                    var entry_entries = _.result(entry, 'entries');

                    if ((!!entry_text) && (entry_text.startsWith('TRANSLATE:'))) {
                        entry_text = gonrinApp().translate(entry_text);
                    }

                    var _html = '';
                    if (entry_type === "category") {
                        _html += `<a href="#_${index}" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle" title="${entry_text}">`;
                        if (entry_icon) {
                            _html += `${entry_icon} `;
                        }
                        _html += entry_text;
                        _html += '</a>';
                    }

                    if (entry_type === "link") {
                        _html += `<a class="nav-link" href="${entry_href}">`;
                        if (entry_icon) {
                            _html += `${entry_icon} `;
                        }
                        _html += entry_text;
                        _html += '</a>';
                    }

                    if (entry_type === "view") {
                        _html += `<a class="nav-link" href="javascript:;">`;
                        if (entry_icon) {
                            //_html = _html + '<img class="nav-menu-icon" src="' + entry_icon + '"/>'; //change icon
                            _html += `${entry_icon} `;
                        }
                        _html += entry_text;
                        _html += '</a>';
                    }
                    var $entry = $('<li class="nav-item">').html(_html);

                    if ($el) {
                        $el.append($entry);
                    }

                    if (entry_entries) {
                        var _nav_list = $('<ul>').addClass("collapse list-unstyled").prop('id', '_' + index).appendTo($entry);
                        self.loadEntries(_nav_list, entry_entries, false);
                    }
                    self.loadView(entry);
                    if (self.isEntryVisible(entry)) {
                        self.handleEntryClick($entry, entry);
                    } else {
                        $entry.hide();
                    }

                });// end _.each
            };
            return this;
        },
        isEntryVisible: function (entry) {
            var self = this;
            var visible = "visible";
            return !entry.hasOwnProperty(visible) || (entry.hasOwnProperty(visible) && (_.isFunction(entry[visible]) ? entry[visible].call(self) : (entry[visible] === true)));

        },
        render: function (entries) {
            this.$el.empty();
            entries = entries || navdata;
            var self = this;
            this.$el.html(template);
            var nav_list = this.$el.find('ul.components');
            this.loadEntries(nav_list, entries, true);
            this.handleToggler();
            return this;
        },
        handleEntryClick: function ($entry, entry) {
            var self = this;

            if (entry.type === "category") {
                var $a = $entry.children('a');
                if ($a === undefined) {
                    return this;
                }
                $a.unbind("click").bind("click", function (e) {
                    var hasSubMenu = $(this).next().hasClass('sub-menu');
                    if ($(this).next().hasClass('sub-menu always-open')) {
                        return;
                    }

                    var parent = $entry.parent().parent();

                    var menu = self.$el.find('.page-navbar-menu');
                    var sub = $(this).next();

                    var autoScroll = menu.data("auto-scroll");
                    var slideSpeed = parseInt(menu.data("slide-speed"));
                    var keepExpand = menu.data("keep-expanded");

                    if (keepExpand !== true) {
                        parent.children('li.open').children('a').children('.arrow').removeClass('open');
                        parent.children('li.open').removeClass('open');
                    }

                    if (sub.is(':visible')) {
                        $('.arrow', $(this)).removeClass("open");
                        $(this).parent().removeClass("open");

                    } else if (hasSubMenu) {
                        $('.arrow', $(this)).addClass("open");
                        $(this).parent().addClass("open");

                    };
                    //e.preventDefault();
                });
            };
            if (entry.type === "view") {
                var $a = $entry.children('a');
                if ($a === undefined) {
                    return this;
                }
                $a.unbind("click").bind("click", function (e) {
                    e.preventDefault();
                    var url = $entry.attr("href");
                    var menuContainer = self.$el.find('ul');

                    menuContainer.children('li.active').removeClass('active');
                    menuContainer.children('li.open').removeClass('open');
                    menuContainer.find('span.arrow').removeClass('open');
                    menuContainer.find('span.selected').remove();

                    $(this).parents('li').each(function () {
                        $(this).addClass('active open');
                        $(this).children('a').children('span.arrow').addClass("open");
                        $(this).children('a').append($('<span>').addClass("selected"));
                    });
                    $(this).parents('li').addClass('active');
                    if (entry.collectionName) {
                        var link = _.result(entry, 'href') || _.result(entry, 'route');
                        self.getApp().getRouter().navigate(link);
                    }
                });
            };
            return this;

        },
        // Hanles sidebar toggler
        handleToggler: function () {
            $("#sidebar").mCustomScrollbar({
                theme: "minimal"
            });
            $('#dismiss, .overlay').on('click', function () {
                $('#sidebar').removeClass('active');
                $('.overlay').fadeOut();
                $("body").css({"overflow": "auto"});
                // $(".page-container").removeClass('move-right');
            });

            $('#sidebarCollapse').on('click', function () {
                $('#right_sidebar').removeClass('active');
                $('#sidebar').addClass('active');
                $('.overlay').fadeIn();
                $('.collapse.in').toggleClass('in');
                $('a[aria-expanded=true]').attr('aria-expanded', 'false');
                $("body").css({"overflow": "hidden"});
                // $(".page-container").addClass('move-right');
            });
            return this;
        },

        //move from router
        loadView: function (entry) {
            var self = this;
            var router = this.getApp().getRouter();
            if (entry && entry.collectionName && (entry.type === "view") && (entry['$ref'])) {
                var entry_path = this.buildPath(entry);
                router.route(entry_path, entry.collectionName, function () {
                    require([entry['$ref']], function (View) {
                        var view = new View({ el: self.getApp().$content, viewData: entry.viewData });
                        view.render();
                    });
                });
                if (entry_path === "index") {
                    var current_params = router.currentRoute();
                    if (current_params["route"] === "index") {
                        router.refresh();
                    }
                }
            };
            return this;
        },
        buildPath: function (entry) {
            var entry_path;
            if (entry.type === "view") {
                entry_path = _.result(entry, 'route');
            }
            return entry_path;
        },

    });

});