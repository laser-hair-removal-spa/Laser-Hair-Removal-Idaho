let siloLeave = null;
let siloMenus = [];
(function ($) {
    'use strict';

    $(document).ready(function () {

        actions.switchToSilo();
        actions.removeSilo();
        actions.saveSilo();
        actions.initSilo();
        actions.generateSilo();
        actions.siloAddPostPage();
        actions.trashPagePost();
        actions.trashTagCategory();
        actions.resetParentsCatsTags();
        actions.hideLinks();
        actions.hideAllLinks();
        actions.settingsMenu();
        actions.scrollCatsTags();
        actions.changeLineWidthGlobal();
        actions.changeCanvasSizeGlobal();
        actions.changeLineColors();
        actions.changeLineType();
        actions.changeBoxColors();
        actions.keySave();
        actions.newCategoryTag();
        actions.generateSiloLinks();
        actions.screenshotResync();

    });

    let actions = {

        generateSiloLinks: function () {
            $(document).on('click', '.generate-silo-links', function (e) {
                e.preventDefault();
                $.post(prs_data.wp_post, 'action=prs_generate_silo_links', function (d) {
                    $('.silo.links').flowchart('setData', d.data);
                });
            });
        },

        screenshotResync: function () {
            $(document).on('click', '.flowchart-operator-screenshot', function(e){
                e.preventDefault();
                let container = $(this).parents('.flowchart-operator');
                let title = $(this).parents('.flowchart-operator').find('.flowchart-operator-title-value').text();
                let content = container.innerHTML;
                container.innerHTML = content;

                UIkit.notify('Successfully re-scanned screenshot for ' + title, {
                    pos: 'bottom-right',
                    status: 'success'
                });
            });
        },

        keySave: function () {
            document.addEventListener("keydown", function (e) {
                if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode == 83) {
                    e.preventDefault();
                    $('.silo-save').trigger('click');
                }
            }, false);
        }, newCategoryTag: function () {
            $(document).on('click', '.add-category', function (e) {
                e.preventDefault();
                UIkit.modal.prompt("New Category Name:", '', function (name) {
                    $.post(prs_data.wp_post, 'action=prs_new_category&name=' + name, function (d) {
                        UIkit.notify('Successfully created new category: ' + name, {
                            pos: 'bottom-right',
                            status: 'success'
                        });
                        actions.loadTagsCategoriesSilo();
                    });
                });
            });
            $(document).on('click', '.add-tags', function (e) {
                e.preventDefault();
                UIkit.modal.prompt("New Tag Name:", '', function (name) {
                    $.post(prs_data.wp_post, 'action=prs_new_tag&name=' + name, function (d) {
                        UIkit.notify('Successfully created new tag: ' + name, {pos: 'bottom-right', status: 'success'});
                        actions.loadTagsCategoriesSilo();
                    });
                });
            });
        },

        changeLineType: function () {
            $(document).on('change', 'select[name="line_type"]', function (e) {
                let s = $(this).parents('.tab').find('.silo');
                let v = $(this).val();
                s.find('.flowchart-link').find('path').attr('stroke-dasharray', v);
            });
            $(document).on('change', 'select[name="line_category_type"]', function (e) {
                let s = $(this).parents('.tab').find('.silo');
                let v = $(this).val();
                s.find('.flowchart-link[data-to-type="category"]').find('path').attr('stroke-dasharray', v);
            });
            $(document).on('change', 'select[name="line_tag_type"]', function (e) {
                let s = $(this).parents('.tab').find('.silo');
                let v = $(this).val();
                s.find('.flowchart-link[data-to-type="tag"]').find('path').attr('stroke-dasharray', v);
            });
        },

        changeLineColors: function () {
            $(document).on('input change', 'input[name="line_color"]', function (e) {
                let s = $(this).parents('.tab').find('.silo');
                let v = $(this).val();
                s.find('.flowchart-link').find('path').attr('stroke', v).attr('color', v);
            });
            $(document).on('input change', 'input[name="line_category_color"]', function (e) {
                let s = $(this).parents('.tab').find('.silo');
                let v = $(this).val();
                s.find('.flowchart-link[data-to-type="category"]').find('path').attr('stroke', v).attr('color', v);
            });
            $(document).on('input change', 'input[name="line_tag_color"]', function (e) {
                let s = $(this).parents('.tab').find('.silo');
                let v = $(this).val();
                s.find('.flowchart-link[data-to-type="tag"]').find('path').attr('stroke', v).attr('color', v);
            });
        },

        changeBoxColors: function () {
            $(document).on('input change', 'input[name="box_tag_color"]', function (e) {
                let s = $(this).parents('.tab').find('.silo');
                let v = $(this).val();
                s.find('.operator-tag .flowchart-operator-title').css('background', v).attr('color', v);
                $('.silo-tags .draggable_operator, button.silo-categories-tags-button.hide-all-tags, .add-tags').css('background', v).attr('color', v);
            });
            $(document).on('input change', 'input[name="box_category_color"]', function (e) {
                let s = $(this).parents('.tab').find('.silo');
                let v = $(this).val();
                s.find('.operator-category .flowchart-operator-title').css('background', v).attr('color', v);
                $('.silo-categories .draggable_operator, button.silo-categories-tags-button.hide-all-categories, .add-category').css('background', v).attr('color', v);
            });
        },

        changeCanvasSizeGlobal: function () {
            $(document).on('input change', 'input[name="canvas_size"]', function (e) {
                e.preventDefault();

                let s = $(this).parents('.tab').find('.silo');
                let v = $(this).val();

                s.css('height', v + 'px');
                s.css('width', v + 'px');

                s.panzoom('resetDimensions');
                s.panzoom('reset', {
                    animate: false, contain: true
                });

            });
        },

        changeLineWidthGlobal: function () {
            $(document).on('input change', 'input[name="line_thickness"]', function (e) {
                let s = $('.silo:visible');
                let v = $(this).val();
                s.find('.flowchart-link').find('path').attr('stroke-width', v);
            });
            $(document).on('input change', 'input[name="line_category_thickness"]', function (e) {
                let s = $('.silo:visible');
                let v = $(this).val();
                s.find('.flowchart-link[data-to-type="category"]').find('path').attr('stroke-width', v);
            });
            $(document).on('input change', 'input[name="line_tag_thickness"]', function (e) {
                let s = $('.silo:visible');
                let v = $(this).val();
                s.find('.flowchart-link[data-to-type="tag"]').find('path').attr('stroke-width', v);
            });
        },

        scrollCatsTags: function () {
            $('.silo-tags, .silo-categories').on('mousewheel DOMMouseScroll', function (event) {

                var delta = Math.max(-1, Math.min(1, (event.originalEvent.wheelDelta || -event.originalEvent.detail)));

                $(this).scrollLeft($(this).scrollLeft() - (delta * 40));
                event.preventDefault();
                event.stopPropagation();

            });
        },

        settingsMenu: function () {
            $(document).on('settings-menu-created', function (e) {

                let $this = $(e.target);

                let o = $this.parents('.flowchart-operator');

                $this.find('.operator_title').val(o.find('.flowchart-operator-title-value').text().trim());


            });
            $(document).on('click', '.context-menu-save', function (e) {
                e.preventDefault();
                let $this = $(e.target);
                let o = $this.parents('.flowchart-operator');
                let id = o.attr('data-id');
                let type = o.attr('data-type');
                let title = o.find('.operator_title').val();

                $.post(prs_data.wp_post, 'action=prs_update_operator_data&id=' + id + '&title=' + encodeURIComponent(title) + '&type=' + type, function (d) {
                    UIkit.notify('Successfully changed title to ' + title, {pos: 'bottom-right', status: 'success'});
                    actions.loadSiloPagesPosts();
                    o.find('.flowchart-operator-title-value').text(title);
                });
            });

            $(document).on('mouseenter', '.silo-context-menu', function (e) {
                clearTimeout(siloLeave);
            });
            $(document).on('mouseleave', '.silo-context-menu', function (e) {
                e.preventDefault();

                siloLeave = setTimeout(function () {

                    for (let i = 0; i < siloMenus.length; i++) {
                        siloMenus[i].remove();
                    }

                    siloMenus = [];

                }, 600);
            });
            $(document).on('click', '.flowchart-operator-toggle-options', function (e) {
                e.preventDefault();

                let p = $(this).parents('.flowchart-operator-title');

                let div = $('<div class="silo-context-menu"></div>');

                div.append('<span class="silo-context-menu-label">Title:</span>');
                div.append('<input type="text" class="operator_title" placeholder="eg. Operator Name" value="' + '' + '"/>');

                let buttons = $('<div class="silo-context-menu-actions">' + '<button class="flat-button flat-button-success context-menu-save" type="button"><i class="fa fa-check"></i> Apply</button>' + '<button class="flat-button flat-button-danger context-menu-discard uk-float-right" type="button"><i class="fa fa-times"></i> Discard</button>' + '</div>');

                div.append(buttons);

                siloMenus.push(div);
                p.append(div);

                div.trigger("settings-menu-created");
            });
            $(document).on('click', '.context-menu-discard', function (e) {
                e.preventDefault();

                for (let i = 0; i < siloMenus.length; i++) {
                    siloMenus[i].remove();
                }

                siloMenus = [];
            });
        },

        hideLinks: function () {
            $(document).on('click', '.flowchart-operator-toggle-visibility', function (e) {
                e.preventDefault();

                let operator = null;
                if ($(this).parents('.flowchart-operator').length == 0) {
                    operator = $(this).parents('.draggable_operator');
                } else {
                    operator = $(this).parents('.flowchart-operator');
                }
                let type = operator.attr('data-type');
                let id = operator.attr('data-id');
                let links = null;

                if (type == 'page' || type == 'post') {
                    links = $('.flowchart-link[data-from-id="' + id + '"]');
                } else {
                    links = $('.flowchart-link[data-to-id="' + id + '"]');
                }

                if (links.hasClass('low-opacity')) {
                    links.removeClass('low-opacity');
                } else {
                    links.addClass('low-opacity');
                }

            });
        },

        hideAllLinks: function () {
            $(document).on('click', '.hide-all-categories', function (e) {
                e.preventDefault();

                let links = $('.flowchart-link[data-to-type="category"]');

                if (links.hasClass('low-opacity')) {
                    links.removeClass('low-opacity');
                } else {
                    links.addClass('low-opacity');
                }

                $('.operator-category').toggleClass('low-opacity');

            });
            $(document).on('click', '.hide-all-tags', function (e) {
                e.preventDefault();

                let links = $('.flowchart-link[data-to-type="tag"]');

                if (links.hasClass('low-opacity')) {
                    links.removeClass('low-opacity');
                } else {
                    links.addClass('low-opacity');
                }

                $('.operator-tag').toggleClass('low-opacity');
            });
        },


        switchToSilo: function () {
            $(document).on('click', '.switch-to-silo', function (e) {
                e.preventDefault();

                if ($('.project-silo').hasClass('uk-hidden')) {

                    $(this).html('<i class="fa fa-unlink"></i> Project Planner');
                    $('.project-dashboard').addClass('uk-hidden');
                    $('.projects-table').addClass('uk-hidden');
                    $('.project-silo').removeClass('uk-hidden');
                    actions.initSilo();

                } else {

                    $(this).html('<i class="fa fa-link"></i> Silo Builder');
                    $('.project-dashboard').removeClass('uk-hidden');
                    $('.projects-table').removeClass('uk-hidden');
                    $('.project-silo').addClass('uk-hidden');

                }

            });
        },

        resetParentsCatsTags: function () {

            $(document).on('click', '.uk-button-reset-all', function (e) {
                e.preventDefault();

                UIkit.modal.confirm('Are you sure? This will completely empty your SILO Builder! Proceed?', function () {
                    $.post(prs_data.wp_post, 'action=prs_reset_parents_cats_tags', function (d) {
                        UIkit.notify('Successfully reverted all pages and posts to default settings. SILO Builder has been cleared as well. Refreshing this page...', {
                            status: 'success',
                            pos: 'bottom-right'
                        })
                        setTimeout(function () {
                            document.location.reload();
                        }, 2000);
                    });
                });

            });
        },

        trashPagePost: function () {
            $(document).on('click', '.silo-trash', function (e) {
                e.preventDefault();
                let type = $(this).attr('data-type');
                let text = $(this).attr('data-text');
                let id = $(this).attr('data-id');
                UIkit.modal.confirm("Are you sure that you want to remove " + text + "?", function () {
                    $.post(prs_data.wp_post, 'action=prs_delete_page&id=' + id, function (d) {
                        actions.loadSiloPagesPosts();
                    });
                });
            });
        },

        trashTagCategory: function () {
            $(".silo-tags").hover(function () {
                $(this).addClass('hover');
            }, function () {
                $(this).removeClass('hover');
            });
            $(document).on('click', '.flowchart-operator-remove-tag', function (e) {
                e.preventDefault();
                let text = $(this).parents('.draggable_operator').attr('data-text');
                let id = $(this).parents('.draggable_operator').attr('data-id');
                UIkit.modal.confirm("Are you sure that you want to remove <b>" + text + "</b>?", function () {
                    $.post(prs_data.wp_post, 'action=prs_delete_tag&id=' + id, function (d) {
                        actions.loadTagsCategoriesSilo();
                    });
                });
            });

            $(document).on('click', '.flowchart-operator-remove-category', function (e) {
                e.preventDefault();
                let text = $(this).parents('.draggable_operator').attr('data-text');
                let id = $(this).parents('.draggable_operator').attr('data-id');
                UIkit.modal.confirm("Are you sure that you want to remove <b>" + text + "</b>?", function () {
                    $.post(prs_data.wp_post, 'action=prs_delete_category&id=' + id, function (d) {
                        actions.loadTagsCategoriesSilo();
                    });
                });
            });
        },

        // Function for adding posts/pages from silo builder
        siloAddPostPage: function () {
            $(document).on('click', '.silo-post-page-create', function (e) {
                e.preventDefault();
                let button = $(this);
                let title = $('.post-page-title').val();
                let url = $('.post-page-url').val();
                let content = $('.post-page-content').val();
                let type = $('.post-page-type').val();
                let status = $('.post-page-status').val();

                if (title == '') {
                    $('.post-page-title').val('New Post');
                }
                if (url == '') {
                    $('.post-page-url').val('');
                }
                if (content == '') {
                    $('.post-page-content').val('Content goes here...');
                }

                $.post(prs_data.wp_post, 'action=prs_add_new_page_post&title=' + title + '&url=' + url + '&content=' + content + '&type=' + type + '&status=' + status + '', function (d) {
                    UIkit.modal("#silo-add-page-post").hide();
                    actions.loadSiloPagesPosts();
                });
            });

            $(document).on('click', '.silo-add-page-post', function (e) {
                e.preventDefault();
                UIkit.modal('#silo-add-page-post').show();
            });
        },

        generateSilo: function () {
            $(document).on('click', '.uk-button-generate-silo', function (e) {
                e.preventDefault();

                UIkit.modal.confirm('Are you sure? This will empty your current SILO Builder changes! Proceed?', function () {
                    $.post(prs_data.wp_post, 'action=prs_generate_silo', function (d) {

                        UIkit.notify('Successfully generated SILO from available pages/posts & category/tags. Refreshing this page...', {
                            status: 'success',
                            pos: 'bottom-right'
                        })
                        setTimeout(function () {
                            document.location.reload();
                        }, 2000);

                    });

                });


            });
        },

        getOperatorData: function ($element) {

            let type = $element.data('type');

            let data = {
                properties: {
                    title: $element.data('text'),
                    subtitle: $element.data('subtitle'),
                    attached: $element.data('attached'),
                    permalink: $element.data('permalink'),
                    type: type,
                    icon: '',
                    inputs: {},
                    outputs: {}
                }
            };

            if (type == 'page') {
                data.properties.icon = 'fa-file-o';
                data.properties.inputs['input_1'] = {};
                data.properties.outputs['outs'] = {
                    multiple: true
                };
            } else if (type == 'post') {
                data.properties.icon = 'fa-file-text-o';
                data.properties.outputs['ins'] = {
                    multiple: true
                };
            } else if (type == 'tag') {
                data.properties.icon = 'fa-tag';
                data.properties.inputs['outs'] = {
                    multiple: true
                };
            } else if (type == 'category') {
                data.properties.icon = 'fa-align-justify';
                data.properties.inputs['outs'] = {
                    multiple: true
                };
            }

            let uniqueID = ' op-' + type + '-' + $element.data('id');
            data.properties.class = 'operator-' + type + uniqueID;
            data.properties.ID = uniqueID;
            data.properties.realID = $element.data('id');

            return data;
        },

        createSiloLinks: function () {

            let $flowchart = $('.silo.links');
            let $container = $flowchart.parent();

            // Panzoom initialization...
            let pan = $flowchart.panzoom();

            // Panzoom zoom handling...
            let possibleZooms = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.5, 2];
            let currentZoom = 9;

            $container.on('mousewheel.focal', function (e) {
                e.preventDefault();
                let delta = (e.delta || e.originalEvent.wheelDelta) || e.originalEvent.detail;
                let zoomOut = !(delta ? delta < 0 : e.originalEvent.deltaY > 0); // natural scroll direciton

                currentZoom = Math.max(0, Math.min(possibleZooms.length - 1, (currentZoom + (zoomOut * 2 - 1))));

                $flowchart.flowchart('setPositionRatio', possibleZooms[currentZoom]);
                $flowchart.panzoom('zoom', possibleZooms[currentZoom], {
                    animate: true, focal: e
                });

            });

            // Apply the plugin on a standard, empty div...
            $flowchart.flowchart({
                                     preventOptions: true,
                                     verticalConnection: true,
                                     defaultLinkColor: '#559acc',
                                     onOperatorCreate: function (operatorId, operatorData, fullElement) {

                                         let uniqueID = '.' + operatorData.properties.ID.trim();
                                         let flowchart = actions.siloGetFlowchart();
                                         if (flowchart.find(uniqueID).length > 0) {
                                             UIkit.notify("<i class='fa fa-warning'></i> Invalid operation, element is already added to this SILO.", {
                                                 pos: 'bottom-right', status: "warning"
                                             });
                                             return false;
                                         }

                                         return true;
                                     }
                                 });

        },

        createSilo: function (element) {

            let $flowchart = $(element);
            let $container = $flowchart.parent();

            // Panzoom initialization...
            let pan = $flowchart.panzoom();

            // Panzoom zoom handling...
            let possibleZooms = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.5, 2];
            let currentZoom = 9;

            $container.on('mousewheel.focal', function (e) {
                e.preventDefault();
                let delta = (e.delta || e.originalEvent.wheelDelta) || e.originalEvent.detail;
                let zoomOut = !(delta ? delta < 0 : e.originalEvent.deltaY > 0); // natural scroll direciton

                currentZoom = Math.max(0, Math.min(possibleZooms.length - 1, (currentZoom + (zoomOut * 2 - 1))));

                $flowchart.flowchart('setPositionRatio', possibleZooms[currentZoom]);
                $flowchart.panzoom('zoom', possibleZooms[currentZoom], {
                    animate: true, focal: e
                });

            });


            let interval;
            let called = false;

            $container.on('mousedown', '.navigation-arrow', function (e) {
                let type = $(this).attr('data-type');
                if (interval == null) {
                    called = false;
                    interval = setInterval(function () {
                        moveByMouse(type);
                        called = true;
                    }, 2);
                }

            }).on('mouseup', '.navigation-arrow', function (e) {
                let type = $(this).attr('data-type');
                clearInterval(interval);
                interval = null;
                if (!called) moveByMouse(type);
            });

            window.addEventListener("keydown", moveByMouse, false);

            function moveByMouse (type) {

                let matrix = $flowchart.panzoom('getMatrix');
                let x = matrix[4];
                let y = matrix[5];

                x = parseFloat(x);
                y = parseFloat(y);

                switch (type) {

                    // UP
                    case 'up':
                        y += 10;
                        break;

                    // DOWN
                    case 'down':
                        y -= 10;
                        break;

                    // LEFT
                    case 'left':
                        x += 10;
                        break;

                    // RIGHT
                    case 'right':
                        x -= 10;
                        break;
                }

                switch (type.keyCode) {
                    case 37:
                        // left key pressed
                        x += 20;
                        $('body').css('overflow', 'hidden');
                        break;
                    case 38:
                        // up key pressed
                        y += 20;
                        $('body').css('overflow', 'hidden');
                        break;
                    case 39:
                        // right key pressed
                        x -= 20;
                        $('body').css('overflow', 'hidden');
                        break;
                    case 40:
                        // down key pressed
                        y -= 20;
                        $('body').css('overflow', 'hidden');
                        break;
                }

                setTimeout(function () {
                    $('body').css('overflow', 'auto');
                }, 4000)

                x = parseFloat(x);
                y = parseFloat(y);

                $flowchart.panzoom('pan', x, y);
            }

            // Apply the plugin on a standard, empty div...
            $flowchart.flowchart({
                                     verticalConnection: true,
                                     defaultLinkColor: '#559acc',
                                     onOperatorCreate: function (operatorId, operatorData, fullElement) {

                                         let uniqueID = '.' + operatorData.properties.ID.trim();
                                         let flowchart = actions.siloGetFlowchart();
                                         if (flowchart.find(uniqueID).length > 0) {
                                             UIkit.notify("<i class='fa fa-warning'></i> Invalid operation, element is already added to this SILO.", {
                                                 pos: 'bottom-right', status: "warning"
                                             });
                                             return false;
                                         }

                                         return true;
                                     }
                                 });

        },

        redrawLinks: function () {
            $('.silo.pages').flowchart('redrawLinksLayer');
            $('.silo.posts').flowchart('redrawLinksLayer');
        },

        initSilo: function () {

            actions.loadSiloPagesPosts();
            actions.addToSilo();

            actions.loadTagsCategoriesSilo();

            actions.createSilo('.silo.pages');
            actions.createSilo('.silo.posts');
            actions.createSiloLinks();

            actions.loadSilo();

            $(document).on('click', '.uk-tab > li > a', function (e) {
                e.preventDefault();
                actions.redrawLinks();
            });
        },

        loadSilo: function (softLoad) {
            $.post(prs_data.wp_post, 'action=prs_load_silo', function (d) {

                let silo_pages = d.data.pages;
                let silo_posts = d.data.posts;

                $('.silo.pages').flowchart('setData', silo_pages);
                $('.silo.posts').flowchart('setData', silo_posts);

                if (typeof softLoad == 'undefined') {

                    if (typeof silo_pages.settings != 'undefined') {
                        $('#pages_line_width').val(silo_pages.settings.line_thickness).trigger('change');
                        $('#pages_line_type').val(silo_pages.settings.line_type).trigger('change');
                        $('#pages_line_color').val(silo_pages.settings.line_color).trigger('change');
                        $('#pages_canvas_size').val(silo_pages.settings.canvas_size).trigger('change');
                    }

                    if (typeof silo_posts.settings != 'undefined') {

                        $('#posts_line_width1').val(silo_posts.settings.line_category_thickness).trigger('change');
                        $('#posts_line_type1').val(silo_posts.settings.line_category_type).trigger('change');
                        $('#posts_line_color1').val(silo_posts.settings.line_category_color).trigger('change');

                        $('#posts_line_width2').val(silo_posts.settings.line_tag_thickness).trigger('change');
                        $('#posts_line_type2').val(silo_posts.settings.line_tag_type).trigger('change');
                        $('#posts_line_color2').val(silo_posts.settings.line_tag_color).trigger('change');

                        $('#posts_box_color1').val(silo_posts.settings.box_category_color).trigger('change');
                        $('#posts_box_color2').val(silo_posts.settings.box_tag_color).trigger('change');

                        $('#posts_canvas_size').val(silo_posts.settings.canvas_size).trigger('change');
                    }

                }
            });
        },

        loadTagsCategoriesSilo: function () {
            $.post(prs_data.wp_post, 'action=prs_get_tags_categories', function (d) {
                let cats = $('.silo-categories');
                let tags = $('.silo-tags');

                cats.empty();
                tags.empty();

                for (let i = 0; i < d.data.tags.length; i++) {
                    let tag = d.data.tags[i];
                    tags.append('<div data-uk-tooltip="{pos:\'bottom\', delay: 1000}" title="You can drag this tag directly into the SILO Builder." class="draggable_operator" data-subtitle="Tag" data-id="' + tag.term_id + '" data-type="tag" data-text="' + tag.name + '"><i class="fa fa-tag"></i> ' + tag.name + '<i class="flowchart-operator-toggle-visibility fa fa-eye-slash"></i><i class="flowchart-operator-remove-tag fa fa-times"></i></div>');
                }

                for (let i = 0; i < d.data.categories.length; i++) {
                    let cat = d.data.categories[i];
                    cats.append('<div data-uk-tooltip="{pos:\'top\', delay: 1000}" title="You can drag this category directly into the SILO Builder." class="draggable_operator" data-subtitle="Category" data-id="' + cat.term_id + '" data-type="category" data-text="' + cat.name + '"><i class="fa fa-align-justify"></i> ' + cat.name + '<i class="flowchart-operator-toggle-visibility fa fa-eye-slash"></i><i class="flowchart-operator-remove-category fa fa-times"></i></div>');
                }

                actions.initDrag($('.draggable_operator'));

            });
        },

        addToSilo: function () {
            $(document).on('click', '.silo-add', function (e) {
                e.preventDefault();

                let $element = $(this);

                let data = actions.getOperatorData($element);

                let type = $element.data('type');
                $('.silo.' + type + 's').flowchart('addOperator', data);
            });
        },

        siloGetFlowchart: function (elements) {
            if (typeof elements != 'undefined') {
                return elements.parents('.tab').find('.silo');
            } else {
                let pages = $('.silo.pages');
                let posts = $('.silo.posts');
                let links = $('.silo.links');
                if (pages.is(':visible')) {
                    return pages;
                } else if (posts.is(':visible')) {
                    return posts;
                } else {
                    return links;
                }
            }
        },

        removeSilo: function () {
            $(document).on('click', '.silo-remove', function (e) {
                e.preventDefault();

                let $flowchart = actions.siloGetFlowchart();
                $flowchart.flowchart('deleteSelected');

            });

            document.addEventListener('keydown', function (event) {
                const key = event.key; // const {key} = event; ES6+
                if (key === "Delete") {
                    let $flowchart = actions.siloGetFlowchart();
                    $flowchart.flowchart('deleteSelected');
                }
            });
        },

        initDrag: function (elements) {

            let $flowchart = actions.siloGetFlowchart(elements);
            let $container = $flowchart.parent();

            elements.draggable({

                                   cursor: "move", opacity: 0.7,

                                   appendTo: 'body', zIndex: 1000,

                                   helper: function (e) {
                                       let $this = $(this);
                                       let data = actions.getOperatorData($this);
                                       return $flowchart.flowchart('getOperatorElement', data);
                                   }, stop: function (e, ui) {
                    let $this = $(this);
                    let elOffset = ui.offset;
                    let containerOffset = $container.offset();
                    if (elOffset.left > containerOffset.left && elOffset.top > containerOffset.top && elOffset.left < containerOffset.left + $container.width() && elOffset.top < containerOffset.top + $container.height()) {

                        let flowchartOffset = $flowchart.offset();

                        let relativeLeft = elOffset.left - flowchartOffset.left;
                        let relativeTop = elOffset.top - flowchartOffset.top;

                        let positionRatio = $flowchart.flowchart('getPositionRatio');
                        relativeLeft /= positionRatio;
                        relativeTop /= positionRatio;

                        let data = actions.getOperatorData($this);
                        data.left = relativeLeft;
                        data.top = relativeTop;

                        $flowchart.flowchart('addOperator', data);
                    }
                }
                               });

        },

        loadSiloPagesPosts: function () {

            $('.siloPagesTable').dataTable({
                                               language: {
                                                   search: "_INPUT_",
                                                   searchPlaceholder: "Search pages...",
                                                   processing: "Loading Pages...",
                                                   emptyTable: "No pages found on this website.",
                                                   info: "_START_ to _END_ of _TOTAL_ pages",
                                                   infoEmpty: "0 to 0 of 0 pages",
                                                   infoFiltered: ""
                                               },
                                               "dom": '<fl>rt<ip>',
                                               "bDestroy": true,
                                               "searchDelay": 350,
                                               "bPaginate": true,
                                               "bAutoWidth": false,
                                               "bFilter": true,
                                               "bProcessing": true,
                                               "sServerMethod": "POST",
                                               "bServerSide": true,
                                               "sAjaxSource": prs_data.wp_post,
                                               "iDisplayLength": 5,
                                               "aLengthMenu": [[5, 10, 50, 100], [5, 10, 50, 100]],
                                               "aaSorting": [[1, 'desc']],
                                               "aoColumns": [{
                                                   "sClass": "text-left",
                                                   "bSortable": true,
                                                   "mData": 'post_title',
                                                   "mRender": function (data, type, row) {
                                                       if (data == '') data = '<i>– Unnamed –</i>';
                                                       return "<b class='post-title'>" + data + "</b>" + ((row.attached !== false && row.attached != 0) ? '<img title="There is a Project Planner group attached to this page/post." class="v3-image-table" src="' + prs_data.plugins_url + 'assets/img/logo_menu.png"/>' : '') + "<div class='row-actions'>"

                                                              + "<a href='" + row.guid + "' target='_blank' class='view'><i class='fa fa-search'></i></a>"

                                                              + " <span>|</span> "

                                                              + "<a href='" + prs_data.wp_admin + 'post.php?post=' + row.ID + '&action=edit' + "' target='_blank' class='edit'><i class='fa fa-edit'></i></a>"

                                                              + " <span>|</span> "

                                                              + "<a href='#' class='silo-trash' data-id='" + row.ID + "' data-text='" + data + "' data-type='page'><i class='fa fa-trash uk-text-danger'></i></a>"

                                                              + " <span>|</span> "

                                                              + "<a href='#' class='silo-add' data-permalink='" + row.permalink + "' data-subtitle='Page' data-attached='" + ((row.attached === false || row.attached == 0) ? 0 : row.attached) + "' data-id='" + row.ID + "' data-text='" + data + "' data-type='page'><i class='fa fa-arrows'></i> Add</a>"

                                                              + "</div>";
                                                   },
                                                   "asSorting": ["desc", "asc"]
                                               }, {
                                                   "bSortable": true,
                                                   "mData": 'post_date',
                                                   "mRender": function (data, type, row) {
                                                       return '<b>' + row.post_status.charAt(0).toUpperCase() + row.post_status.slice(1) + 'ed</b>' + '<br>' + '<abbr title="' + data + '">' + new Date(data).toUTCString().split(' ').splice(0, 4).join(' ') + '</abbr>';
                                                   },
                                                   "asSorting": ["desc", "asc"]
                                               }],
                                               "fnServerParams": function (aoData) {

                                                   aoData.push({
                                                                   name: 'action', value: 'prs_get_posts'
                                                               });

                                                   aoData.push({
                                                                   name: 'PostsType', value: 'page'
                                                               });
                                               },

                                               "fnDrawCallback": function (oSettings) {
                                                   actions.initDrag($(this).find('tr.draggable-row'));
                                               },

                                               "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                                                   $(nRow).addClass('draggable-row')
                                                          .attr('data-type', 'page')
                                                          .attr('data-text', aData.post_title)
                                                          .attr('data-attached', (aData.attached === false || aData.attached == 0) ? 0 : aData.attached)
                                                          .attr('data-subtitle', 'Page')
                                                          .attr('data-permalink', aData.permalink)
                                                          .attr('data-uk-tooltip', '{pos:\'right\', delay: 1000}')
                                                          .attr('title', 'You can drag this element directly into the SILO Builder.')
                                                          .attr('data-id', aData.ID);
                                               }


                                           });
            $('.siloPostsTable').dataTable({
                                               language: {
                                                   search: "_INPUT_",
                                                   searchPlaceholder: "Search posts...",
                                                   processing: "Loading Posts...",
                                                   emptyTable: "No posts found on this website.",
                                                   info: "_START_ to _END_ of _TOTAL_ posts",
                                                   infoEmpty: "0 to 0 of 0 posts",
                                                   infoFiltered: ""
                                               },
                                               "dom": '<fl>rt<ip>',
                                               "bDestroy": true,
                                               "searchDelay": 350,
                                               "bPaginate": true,
                                               "bAutoWidth": false,
                                               "bFilter": true,
                                               "bProcessing": true,
                                               "sServerMethod": "POST",
                                               "bServerSide": true,
                                               "sAjaxSource": prs_data.wp_post,
                                               "iDisplayLength": 5,
                                               "aLengthMenu": [[5, 10, 50, 100], [5, 10, 50, 100]],
                                               "aaSorting": [[1, 'desc']],
                                               "aoColumns": [{
                                                   "sClass": "text-left",
                                                   "bSortable": true,
                                                   "mData": 'post_title',
                                                   "mRender": function (data, type, row) {
                                                       if (data == '') data = '<i>– Unnamed –</i>';
                                                       return "<b class='post-title'>" + data + "</b>" + ((row.attached !== false && row.attached !== 0) ? '<img title="There is a Project Planner group attached to this page/post." class="v3-image-table" src="' + prs_data.plugins_url + 'assets/img/logo_menu.png"/>' : '') + "<div class='row-actions'>"

                                                              + "<a href='" + row.guid + "' target='_blank' class='view'><i class='fa fa-search'></i></a>"

                                                              + " <span>|</span> "

                                                              + "<a href='" + prs_data.wp_admin + 'post.php?post=' + row.ID + '&action=edit' + "' target='_blank' class='edit'><i class='fa fa-edit'></i></a>"

                                                              + " <span>|</span> "

                                                              + "<a href='#' class='silo-trash' data-id='" + row.ID + "' data-text='" + data + "' data-type='page'><i class='fa fa-trash uk-text-danger'></i></a>"

                                                              + " <span>|</span> "

                                                              + "<a href='#' class='silo-add' data-subtitle='Post' data-attached='" + ((row.attached === false || row.attached == 0) ? 0 : row.attached) + "' data-id='" + row.ID + "' data-text='" + data + "' data-type='post'><i class='fa fa-arrows'></i> Add</a>"

                                                              + "</div>";
                                                   },
                                                   "asSorting": ["desc", "asc"]
                                               }, {
                                                   "bSortable": true,
                                                   "mData": 'post_date',
                                                   "mRender": function (data, type, row) {
                                                       return '<b>' + row.post_status.charAt(0).toUpperCase() + row.post_status.slice(1) + 'ed</b>' + '<br>' + '<abbr title="' + data + '">' + new Date(data).toUTCString().split(' ').splice(0, 4).join(' ') + '</abbr>';
                                                   },
                                                   "asSorting": ["desc", "asc"]
                                               }],
                                               "fnServerParams": function (aoData) {

                                                   aoData.push({
                                                                   name: 'action', value: 'prs_get_posts'
                                                               });


                                                   aoData.push({
                                                                   name: 'PostsType', value: 'post'
                                                               });

                                               },

                                               "fnDrawCallback": function (oSettings) {
                                                   actions.initDrag($(this).find('tr.draggable-row'));
                                               },

                                               "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                                                   $(nRow).addClass('draggable-row')
                                                          .attr('data-type', 'post')
                                                          .attr('data-text', aData.post_title)
                                                          .attr('data-attached', (aData.attached === false || aData.attached == 0) ? 0 : aData.attached)
                                                          .attr('data-subtitle', 'Post')
                                                          .attr('data-permalink', aData.permalink)
                                                          .attr('data-uk-tooltip', '{pos:\'right\', delay: 1000}')
                                                          .attr('title', 'You can drag this element directly into the SILO Builder.')
                                                          .attr('data-id', aData.ID);
                                               }

                                           });

        },

        // Save Silo functionality
        saveSilo: function () {
            $(document).on('click', '.silo-save', function (e) {
                e.preventDefault();

                let silo_pages = $('.silo.pages').flowchart('getData');
                let silo_posts = $('.silo.posts').flowchart('getData');

                $.post(prs_data.wp_post, {
                    action: 'prs_save_silo',
                    pages: JSON.stringify(silo_pages),
                    posts: JSON.stringify(silo_posts)
                }, function (d) {
                    if (d.status == 'success') {
                        UIkit.notify("<i class='fa fa-info-circle'></i> SILO has been successfully saved.", {
                            pos: 'bottom-right', status: "primary"
                        });
                        actions.loadSilo(true);
                    }
                });


            });
        }

    };

})(jQuery);
