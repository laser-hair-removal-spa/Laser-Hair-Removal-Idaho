let currentSiloGroups = [];
let siloInitialized = false;
let currentProjectID = 0;
let currentProjectName = 0;
let modal_block = '';
let autoGenerateGroup = false;
let moveToProject = false;
let activeChanges = false;
let keywordGroupID = false;
let postsTable;
let postsTable2;
let selectedPosts;
let pTypes;
Array.prototype.remove = function (data) {
    const dataIdx = this.indexOf(data)
    if (dataIdx >= 0) {
        this.splice(dataIdx, 1);
    }
    return this.length;
}

window.onbeforeunload = function (e) {
    let message = "Are you sure you want to leave without saving your changes?";
    e = window.event;
    // For IE and Firefox
    if (activeChanges) {
        if (e) {
            e.returnValue = message;
        }

        // For Safari
        return message;
    }
};

let cf_templates = {
    Default:   {
        name: "Default",
        data: {
            volume_red:   20,
            volume_green: 100,

            cpc_red:   0.59,
            cpc_green: 1.00,

            broad_red:   249999,
            broad_green: 100000,

            phrase_red:   100000,
            phrase_green: 10000,

            intitle_red:   1000,
            intitle_green: 250,

            inurl_red:   1000,
            inurl_green: 250,

            title_ratio_red:   1,
            title_ratio_green: 0.25,

            url_ratio_red:   1,
            url_ratio_green: 0.25,

            tr_goldbar_volume:  1000,
            tr_goldbar_intitle: 20,

            ur_goldbar_volume:  1000,
            ur_goldbar_intitle: 20
        }
    },
    Affiliate: {
        name: "Affiliate",
        data: {
            volume_red:   100,
            volume_green: 1000,

            cpc_red:   1.00,
            cpc_green: 2.00,

            broad_red:   1000000,
            broad_green: 100000,

            phrase_red:   100000,
            phrase_green: 10000,

            intitle_red:   10000,
            intitle_green: 1000,

            inurl_red:   10000,
            inurl_green: 1000,

            title_ratio_red:   1,
            title_ratio_green: 0.25,

            url_ratio_red:   1,
            url_ratio_green: 0.25,

            tr_goldbar_volume:  1000,
            tr_goldbar_intitle: 20,

            ur_goldbar_volume:  1000,
            ur_goldbar_intitle: 20
        }
    },
    Local:     {
        name: "Local",
        data: {
            volume_red:   10,
            volume_green: 100,

            cpc_red:   2.00,
            cpc_green: 5.00,

            broad_red:   100000,
            broad_green: 10000,

            phrase_red:   10000,
            phrase_green: 1000,

            intitle_red:   1000,
            intitle_green: 100,

            inurl_red:   1000,
            inurl_green: 100,

            title_ratio_red:   1,
            title_ratio_green: 0.25,

            url_ratio_red:   1,
            url_ratio_green: 0.25,

            tr_goldbar_volume:  1000,
            tr_goldbar_intitle: 20,

            ur_goldbar_volume:  1000,
            ur_goldbar_intitle: 20
        }
    }
};

let cf_default_template = 'Default';
let cf_template = cf_templates[cf_default_template].data;

(function ($) {
    'use strict';

    $(document).ready(function () {

        actions.loadCfTemplates();
        actions.changeCfTemplate();
        actions.saveCfTemplate();
        actions.applyCfTemplate();
        actions.deleteCfTemplate();
        actions.cfValidation();
        actions.newKeyword();
        actions.deleteKeywords();
        actions.createPagePost();
        actions.deleteGroup();
        actions.deleteGroups();
        actions.createPagePostMulti();
        actions.updateGroup();
        actions.newGroup();
        actions.newProject();
        actions.removeProject();
        actions.renameProject();
        actions.loadProjects();
        actions.loadProject();
        actions.backToProjects();
        actions.editGroupSettings();
        actions.selectAllKeywords();
        actions.retrieveVolumeAndCPC();
        actions.retrieveKeywordData();
        actions.refreshKeywordAllowance();
        actions.exportProject();
        actions.importProject();
        actions.trackRankings();
        actions.submitKeywordsForRanking();
        actions.submitKeywordsForGetVolAndCPC();
        actions.selectKeyword();
        actions.minimizeGroup();
        actions.loadRedirects();
        actions.addNewRedirect();
        actions.deleteRedirect();
        actions.onURLEdit();
        actions.goToPagePost();

        actions.attachToPagePost();
        actions.loadPostTypes();
        actions.changePostTypes();

        actions.onDragChangeCursor();
        actions.automaticallyGenerateGroups();
        actions.moveToProject();

        actions.addGroupFromExisting();

        actions.keywordInputKeypress();
        actions.selectAllPagePosts();
        actions.filterByPostType();
        actions.expandCollapseFunctions();
        actions.formatSEO();

        actions.wordCountCloud();
        actions.switchToSilo();
        actions.removeSilo();
        actions.saveSilo();

        $.tablesorter.addParser({
            id:     "fancyNumber",
            is:     function (s) {
                // return false so this parser is not auto detected
                return false;
            },
            format: function (s) {
                return $.tablesorter.formatFloat(s.replace(/,/g, ''));
            },
            type:   "numeric"
        });

        /*Get default settings*/
        $.post(prs_data.wp_post, 'action=prs_get_default_search_engine', function (d) {
            if (d.status == 'success') {
                for (let i = 0; i < d.data.length; i++) {
                    let id = d.data[i].id;
                    if ($('#search_engine').find("option[value='" + id + "']").length) {
                        $("#search_engine").find("option[value=" + id + "]").attr('selected', true);
                    }
                }
            }
        });
    });


    let actions = {
        wordCountCloud:                function () {

            $(document).on('click', '.wordCloud', function () {

                let cloudBoxTemplate = $('.cloud.template.hide').clone();
                cloudBoxTemplate.removeClass('hide').show().addClass('seen');

                let btn = $(this);

                if (btn.hasClass('open')) {
                    btn.removeClass('open');
                    btn.find('i').removeClass().addClass('fa fa-cloud');
                    btn.parents('.uk-panel-box').children('.updateKeywords').find('.keywordInput[data-target="keyword"]').unhighlight();
                    let thisCont = btn.parents('.uk-panel-box').children('.cloud.template.seen.jqcloud');
                    if (thisCont.length > 0) {
                        thisCont.jQCloud('destroy');
                        thisCont.slideUp("normal", function () {
                            $(this).remove();
                            actions.updateGrid();
                        });
                    }
                } else {
                    btn.addClass('open');
                    let group_id = btn.parents('.uk-panel-box').children('.updateGroup').find('input[name="group_id"]').val();
                    let project_id = btn.parents('.uk-panel-box').children('.updateGroup').find('input[name="project_id"]').val();

                    btn.disable();
                    $.post(prs_data.wp_post, 'action=prs_getGroup&project_id=' + project_id + '&group_id=' + group_id, function (d) {
                        btn.disable();
                        if (d.hasOwnProperty('keywords')) {
                            let keywords = d.keywords;
                            if (keywords.length > 0) {
                                let temp = [];
                                for (let i = 0; i < keywords.length; i++) {
                                    temp.push(keywords[i].keyword);
                                }

                                btn.find('i').removeClass().addClass('fa fa-arrow-up');
                                btn.parents('.uk-panel-box').children('.updateGroup').after(cloudBoxTemplate);
                                cloudBoxTemplate.jQCloud(actions.calculateAndTrim(temp), {
                                    colors:     [
                                        "#13bfff",
                                        "#26c5ff",
                                        "#3acaff",
                                        "#4ecfff",
                                        "#61d4ff",
                                        "#75daff",
                                        "#89dfff",
                                        "#9ce4ff",
                                        "#b0eaff",
                                        "#c3efff",
                                        "#d7f4ff",
                                        "#ebfaff",
                                        "#feffff"
                                    ],
                                    autoResize: true,
                                    height:     350,
                                    fontSize:   {
                                        from: 0.1,
                                        to:   0.03
                                    }
                                });

                                actions.updateGrid();
                            } else {
                                btn.removeClass('open');
                                UIkit.notify('No keywords for this group', {pos: 'bottom-right', status: 'warning'});
                            }
                        } else {
                            btn.removeClass('open');
                            UIkit.notify('No keywords for this group', {pos: 'bottom-right', status: 'warning'});
                        }

                    })
                }


            });
        },
        expandCollapseFunctions:       function () {
            $(document).on('click', '.collapseAllGroups', function (e) {
                e.preventDefault();
                actions.collapseKeywordGroups();
                actions.collapseSettingsBody();
                actions.updateGrid();
            });

            $(document).on('click', '.expandAllGroups', function (e) {
                e.preventDefault();
                actions.expandKeywordGroups();
                actions.expandSettingsBody();
                actions.updateGrid();
            });

            $(document).on('click', '.expandKeywordGroups', function (e) {
                e.preventDefault();
                actions.expandKeywordGroups();
                actions.updateGrid();
            });

            $(document).on('click', '.collapseKeywordGroups', function (e) {
                e.preventDefault();
                actions.collapseKeywordGroups();
                actions.updateGrid();
            });
        },
        expandKeywordGroups:           function () {
            $('.updateKeywords').each(function () {
                $(this).removeClass('hidden');
            });
        },
        collapseKeywordGroups:         function () {
            $('.updateKeywords').each(function () {
                $(this).removeClass('hidden').addClass('hidden');
            });
        },
        expandSettingsBody:            function () {
            $('.groupSettingsTbody').each(function () {
                $(this).css('display', 'table-row-group');
            });
        },
        collapseSettingsBody:          function () {
            $('.groupSettingsTbody').each(function () {
                $(this).css('display', 'none');
            });
        },
        keywordInputKeypress:          function () {
            $(document).on('keypress', '.keywordInput', function () {
                activeChanges = true;
            });
        },
        addGroupFromExisting:          function () {

            $(document).on('click', '.addGroupFromExisting', function (e) {
                e.preventDefault();

                selectedPosts = [];
                $('.selected-posts').find('.value').html(0);

                let addGroupModal = $('#addGroupFromExistingModal');
                UIkit.modal(addGroupModal).show();
            });

            $(document).on('change', '.select-post', function () {

                let checked = $(this).is(':checked');
                if (checked) {
                    selectedPosts.push($(this).val());
                } else {
                    selectedPosts.remove($(this).val());
                }

                $('.selected-posts').find('.value').html(selectedPosts.length);
            });

            $(document).on('change', '.select-posts-all', function () {

                let checked = $(this).is(':checked');

                $('.postsTable2').find('.select-post').each(function () {
                    $(this).prop('checked', checked);
                    $(this).trigger('change');
                });

            });

            $(document).on('click', '.add-group-from-existing', function (e) {
                e.preventDefault();

                let btn = $(this);
                btn.disable();

                if (selectedPosts.length < 1) {
                    UIkit.notify('You must first select some posts first!', {pos: 'bottom-right', status: 'error'});
                    return;
                }

                $.post(prs_data.wp_post, 'action=prs_make_groups&ids=' + selectedPosts.join(',') + '&project_id=' + currentProjectID, function (d) {

                    UIkit.modal('#addGroupFromExistingModal').hide();
                    btn.disable();
                    UIkit.notify(d.message, {pos: 'bottom-right', status: 'success'});
                    actions.loadProjectManually();

                });

            });

        },
        selectAllPagePosts:            function () {
            $(document).on('click', '.select-all-page-posts', function () {

                let btn = $(this);

                if (btn.hasClass('selected')) {
                    $("#posts_pages > option").removeAttr("selected").trigger("change");
                    btn.removeClass('uk-button-danger selected').addClass('uk-button-success');
                    btn.html('<i class="fa fa-plus"></i> Select All');
                } else {
                    $('#posts_pages > option').prop("selected", "selected").trigger("change");
                    btn.removeClass('uk-button-success').addClass('uk-button-danger selected');
                    btn.html('<i class="fa fa-minus"></i> Deselect All');
                }

            });
        },
        deleteRedirect:                function () {
            $(document).on('click', '.delete-redirect', function (e) {
                e.preventDefault();
                let button = $(this);
                let id = $(this).data('id');
                UIkit.modal.confirm("Are you sure that you want to delete this redirect?", function () {
                    button.disable();
                    $.post(prs_data.wp_post, 'action=prs_delete_redirect&id=' + id, function (d) {
                        button.disable();
                        actions.loadRedirects();

                    });
                });
            });
        },
        addNewRedirect:                function () {
            $(document).on('click', '.add-new-redirect', function (e) {
                e.preventDefault();

                let button = $(this);

                UIkit.modal.prompt("Old URL (use the /oldurl/ format):", '', function (oldURL) {

                    UIkit.modal.prompt("Redirect to URL (use the /newurl/ format) (DANGER: Creating invalid redirects may result in breaking of your website):", '', function (newURL) {

                        button.disable('Saving...');

                        $.post(prs_data.wp_post, 'action=prs_add_redirect&oldURL=' + oldURL + '&newURL=' + newURL, function (d) {

                            button.disable();

                            actions.loadRedirects();

                        });

                    });

                });

            });
        },
        loadRedirects:                 function () {
            let messages = {
                empty:   '<tr><td colspan="4">Can\'t find any active redirects.</td></tr>',
                loading: '<tr><td colspan="4"><i class="fa fa-refresh fa-spin"></i> Loading ...</td></tr>'
            };
            let table = $('.table-redirects');
            let tbody = table.find('tbody');

            tbody.empty().append(messages.loading);

            $.post(prs_data.wp_post, 'action=prs_get_redirects', function (d) {
                if (d.status == 'success') {

                    if (d.data.length == 0) {
                        tbody.empty().append(messages.empty);
                    } else {
                        tbody.empty();

                        for (let i = 0; i < d.data.length; i++) {
                            let data = d.data[i];
                            let html = '<tr>' +
                                '<td><a target="_blank" href="/' + data.old + '">/' + data.old + '</a></td>' +
                                '<td><a target="_blank" href="/' + data.new + '">/' + data.new + '</a></td>' +
                                '<td><button type="button" class="uk-button uk-button-mini uk-button-danger delete-redirect" data-id="' + data.id + '" title="Delete this redirect"><i class="fa fa-trash-o"></i></button></td>' +
                                '</tr>';
                            tbody.append(html);
                        }

                    }

                } else {
                    UIkit.notify('An unknown error has occurred.', {pos: 'bottom-right', status: 'danger'});
                }
            });

        },
        minimizeGroup:                 function () {
            $(document).on('click', '.minimizeGroup', function () {
                let i = $(this).find('i');
                let kw = $(this).parents('.group').find('.updateKeywords');
                i.toggleClass('fa-chevron-up fa-chevron-down');
                kw.toggleClass('hidden');
                actions.updateGrid();
            });
        },
        selectKeyword:                 function () {
            $(document).on('change', '.keyword-selection', function () {
                let tr = $(this).parents('tr');
                if (!tr.hasClass('selected')) {
                    tr.addClass('selected');
                }
            });
        },
        submitKeywordsForRanking:      function () {
            $(document).on('submit', '#rankTrackingForm', function (e) {
                e.preventDefault();

                let btn = $(this).find('.submitKeywords');
                btn.attr('disabled', true);


                let ranking_modal = $('#rankTrackingModal');

                let form_data = $(this).serialize();

                $.post(prs_data.wp_post, 'action=prs_track_keywords_add&' + form_data, function (d) {
                    btn.attr('disabled', false);
                    UIkit.modal(ranking_modal).hide();
                    actions.loadProjectManually();

                    if (d.status == 'error') {
                        UIkit.notify(d.message, {pos: 'bottom-right', status: 'danger'});
                    } else {
                        UIkit.notify(d.message, {pos: 'bottom-right', status: 'success'});
                    }


                });

            });
        },
        trackRankings:                 function () {
            $(document).on('click', '.track_rankings', function (e) {
                e.preventDefault();

                let group = $(this).parents('.group');
                let ids = [];
                let keywords = [];
                group.find('.keyword-selection').each(function () {
                    let tr = $(this).parents('tr');
                    if ($(this).is(':checked')) {
                        $(this).removeAttr('checked');
                        let kw = tr.find('.keywordInput[data-target="keyword"]').html().trim();
                        let id = tr.data('id');
                        if (kw != '') {
                            ids.push(id);
                            keywords.push(kw);
                        }
                    }
                });

                if (keywords.length < 1) {
                    UIkit.notify('Please select some keywords!', {pos: 'bottom-right', status: 'danger'});
                    return false;
                }

                let ranking_modal = $('#rankTrackingModal');

                UIkit.modal(ranking_modal).show();

                ranking_modal.find('input[name="keywords"]').tagsInput({
                    'interactive': false
                }).importTags(keywords.join(','));

                ranking_modal.find('#search_engine').select2({
                    minimumInputLength: 2,
                    placeholder:        "Select a Search Engine"
                });

            });

            $('#rankTrackingModal').on({
                'hide.uk.modal': function () {
                    let ranking_modal = $('#rankTrackingModal');
                    ranking_modal.find('.tagsinput').remove();
                }
            });

            $(document).on('change', '#search_engine', function () {
                let select = $(this);

                let data = select.select2('data');
                let se = [];
                let local = true;

                if (data.length >= 1) {
                    let searchEngine = [];
                    for (let i = 0; i < data.length; i++) {
                        let id = data[i].id;
                        let text = data[i].text;
                        let sd = {'id': id, 'text': text}
                        searchEngine.push(sd);
                    }
                    UIkit.modal.confirm("Do you want to make this as a default search engine?", function () {
                        $.post(prs_data.wp_post, 'action=prs_set_default_search_engine&data=' + JSON.stringify(searchEngine), function (d) {
                            UIkit.notify(d.message, {pos: 'bottom-right', status: d.status});
                        });
                    }, function () {

                    });
                }

                for (let i = 0; i < data.length; i++) {
                    let selected = data[i].text;
                    se.push(selected);
                }

                for (let k = 0; k < se.length; k++) {
                    if (se[k].indexOf('Google') == -1) {
                        local = false;
                    }
                }

                if (data.length < 1) {
                    local = false;
                }

                if (local) {
                    $('#local_track').attr('disabled', false);
                    $('#local_fieldset').attr('disabled', false);
                } else {
                    $('#local_track').attr('disabled', true).attr('checked', false);
                    $('#local_track').removeClass('on').addClass('off');
                    $('.local_fieldset').attr('disabled', true).fadeOut();
                }

            });

            $(document).on('click', '#local_track', function () {

                let checkbox = $(this);
                let local_fields = $('.local_fieldset');

                if (checkbox.attr('disabled') == 'disabled') {
                    return false;
                }

                if ($(this).hasClass('on')) {
                    $(this).removeClass('on').addClass('off');
                    local_fields.attr('disabled', true).fadeOut();
                } else {
                    $(this).removeClass('off').addClass('on');
                    local_fields.attr('disabled', false).fadeIn();
                }

            });
        },
        moveToProject:                 function () {
            $(document).on('click', '.moveToProject', function (e) {
                e.preventDefault();
                let input = $('#moveToProjectInput');
                let group_id = $(this).parents('.updateGroup').find('input[name="group_id"]').val();
                input.data('group-id', group_id);
                $.post(prs_data.wp_post, 'action=prs_get_projects', function (d) {

                    input.empty();

                    input.append('<option value="">--- Select a Project ---</option>');

                    for (let i = 0; i < d.aaData.length; i++) {
                        let o = d.aaData[i];
                        input.append('<option value="' + o.id + '">' + o.project_name + '</option>');
                    }

                    moveToProject = UIkit.modal($('#moveToProjectGroup'))
                    moveToProject.show();
                });

                //
            });
            $(document).on('submit', '#moveToProjectForm', function (e) {
                e.preventDefault();
                let form = $(this);
                let group_id = $('#moveToProjectInput').data('group-id');
                $.post(prs_data.wp_post, 'action=prs_moveToProject&' + form.serialize() + '&group_id=' + group_id, function (d) {

                    UIkit.notify(d.message, {pos: 'bottom-right', status: d.status});

                    if (d.status == 'success') {
                        moveToProject.hide();
                        actions.loadProjectManually();
                    }

                });


            });
        },
        automaticallyGenerateGroups:   function () {

            $(document).on('click', '.automaticallyGenerateGroups', function (e) {

                e.preventDefault();

                let autoGenerateGroups = $('#automaticallyGenerateGroupsModal');
                actions.refreshKeywordAllowance();
                UIkit.modal(autoGenerateGroups, {bgclose: false, keyboard: false}).show();

            });

            $(document).on('submit', '#autoGenerateGroupsForm', function (e) {
                e.preventDefault();

                let autoGenerateGroups = $('#automaticallyGenerateGroupsModal');
                let form = $(this);

                $.post(prs_data.wp_post, 'action=prs_autoGenerateGroups&' + form.serialize() + '&project_id=' + currentProjectID, function (d) {

                    actions.loadProjectManually();
                    actions.refreshKeywordAllowance();

                    UIkit.modal(autoGenerateGroups, {bgclose: false, keyboard: false}).hide();

                    if (d.status == 'error') {
                        UIkit.notify(d.message, {pos: 'bottom-right', status: 'danger'});
                    } else {
                        UIkit.modal.alert("You have successfully queued process for Auto-Generating Groups. You will receive an e-mail once the process is completed, or you can simply check back later for results. Do not add any new groups to this project since they will be overwritten with new auto-generated groups.");
                    }

                });

            })

        },
        refreshKeywordAllowance:       function () {
            $.post(prs_data.wp_post, 'action=prs_getKeywordAllowance', function (d) {
                if (d.status == 'error') {
                    UIkit.notify(d.message, {pos: 'bottom-right', status: 'danger'});
                } else {
                    $('.keyword-scraping-allowance').find('.value').html(d.data['keyword_scraping_allowance']);
                    $('.keyword-volume-scraping-allowance').find('.value').html(d.data['keyword_volume_scraping_allowance']);
                }
            });
        },
        retrieveVolumeAndCPC:          function () {
            $(document).on('click', '.getVolumeAndCPC', function (e) {
                e.preventDefault();
                let group = $(this).parents('.group');
                let ids = [];
                let keywords = [];
                let icon = '<i class="fa fa-refresh fa-spin" title="This value is currently under analysis. Please wait until results are gathered."></i>';
                group.find('.keyword-selection').each(function () {
                    let tr = $(this).parents('tr');
                    if ($(this).is(':checked')) {
                        $(this).removeAttr('checked');
                        let kw = tr.find('.keywordInput[data-target="keyword"]').html().trim();
                        let id = tr.data('id');
                        if (kw != '') {
                            ids.push(id);
                            keywords.push(kw);

                        }
                    }
                });

                if (keywords.length < 1) {
                    UIkit.notify('Please select some keywords!', {pos: 'bottom-right', status: 'danger'});
                    return false;
                }

                let vol_cpc_modal = $('#VolumeAndCPCModal');

                UIkit.modal(vol_cpc_modal).show();

                vol_cpc_modal.find('input[name="keywords"]').tagsInput({
                    'interactive': false
                }).importTags(keywords.join(','));

                vol_cpc_modal.find('input[name="ids"]').importTags(ids.join(','));

            });


            $('#VolumeAndCPCModal').on({
                'hide.uk.modal': function () {
                    let vol_cpc_modal = $('#VolumeAndCPCModal');
                    vol_cpc_modal.find('.tagsinput').remove();
                }
            });

        },
        submitKeywordsForGetVolAndCPC: function () {
            $(document).on('submit', '#VolumeAndCPCForm', function (e) {
                e.preventDefault();

                let btn = $(this).find('.submitKeywords');
                btn.attr('disabled', true);


                let vol_cpc_modal = $('#VolumeAndCPCModal');

                let dataArray = $(this).serializeArray();

                let len = dataArray.length;
                let dataObj = {};

                for (i = 0; i < len; i++) {
                    dataObj[dataArray[i].name] = dataArray[i].value;
                }

                if (dataObj['language'] == '0000') {
                    UIkit.notify('Please select a language!', {pos: 'bottom-right', status: 'danger'});
                    e.stopImmediatePropagation();
                    btn.attr('disabled', false);
                    return false;
                }
                if (dataObj['keywords'] == '') {
                    UIkit.notify('Please select some keywords!', {pos: 'bottom-right', status: 'danger'});
                    e.stopImmediatePropagation();
                    UIkit.modal(vol_cpc_modal).hide();
                    btn.attr('disabled', false);
                    return false;
                }
                if (dataObj['ids'] == '') {
                    UIkit.notify('Something went wrong please select keywords again!', {pos: 'bottom-right', status: 'danger'});
                    e.stopImmediatePropagation();
                    UIkit.modal(vol_cpc_modal).hide();
                    btn.attr('disabled', false);
                    return false;
                }

                let data = [
                    {
                        name:  'action',
                        value: 'prs_getVolumeAndCPC'
                    }, {
                        name:  'ids',
                        value: dataObj['ids']
                    }, {
                        name:  'keywords',
                        value: dataObj['keywords']
                    }, {
                        name:  'language',
                        value: dataObj['language']
                    }, {
                        name:  'disable_cache',
                        value: dataObj['disable_cache']
                    }
                ];

                // Send them for analysis
                $.postq('keywordApi', prs_data.wp_post, data, function (d) {

                    btn.attr('disabled', false);
                    UIkit.modal(vol_cpc_modal).hide();
                    actions.refreshKeywordAllowance();

                    if (d.status == 'queued') {

                        for (let i = 0; i < d.data.length; i++) {
                            let k = d.data[i];
                            let tr = $('tr[data-id="' + k.id + '"]');

                            tr.find('.keywordInput[data-target="volume"]').attr('title', 'This value is currently under analysis. Please check back later to see the results.').html('<i class="fa fa-refresh fa-spin"></i>');
                            tr.find('.keywordInput[data-target="cpc"]').attr('title', 'This value is currently under analysis. Please check back later to see the results.').html('<i class="fa fa-refresh fa-spin"></i>');
                        }

                        UIkit.modal.alert("You have successfully queued selected keywords for analysis. You will receive an e-mail when the analysis is completed, or you can simply just check back later for results.");

                    } else if (d.status == 'results') {

                        for (let i = 0; i < d.data.length; i++) {
                            let k = d.data[i];
                            let tr = $('tr[data-id="' + k.id + '"]');

                            let volume_color = '';

                            if (k.search_volume == 0) {
                                volume_color = 'tr_green';
                            } else if (parseFloat(cf_template.volume_red) >= parseInt(k.search_volume)) {
                                volume_color = 'tr_red';
                            } else if (parseFloat(cf_template.volume_red) < parseInt(k.search_volume) && parseInt(cf_template.volume_green) > parseInt(k.search_volume)) {
                                volume_color = 'tr_yellow';
                            } else if (parseFloat(cf_template.volume_green) <= parseInt(k.search_volume)) {
                                volume_color = 'tr_green';
                            }

                            let cpc_color = '';
                            if (k.cost_per_click == 0) {
                                cpc_color = 'tr_green';
                            } else if (parseFloat(cf_template.cpc_red) >= parseFloat(k.cost_per_click)) {
                                cpc_color = 'tr_red';
                            } else if (parseFloat(cf_template.cpc_red) < parseFloat(k.cost_per_click) && parseFloat(cf_template.cpc_green) > parseFloat(k.cost_per_click)) {
                                cpc_color = 'tr_yellow';
                            } else if (parseFloat(cf_template.cpc_green) <= parseFloat(k.cost_per_click)) {
                                cpc_color = 'tr_green';
                            }

                            tr.find('.keywordInput[data-target="volume"]').html(parseInt(k.search_volume).toLocaleString()).removeClass('uk-text-center').parents('td').addClass(volume_color);
                            tr.find('.keywordInput[data-target="cpc"]').html(k.cost_per_click).removeClass('uk-text-center').parents('td').addClass(cpc_color);
                        }

                        UIkit.notify(d.message, {pos: 'bottom-right', status: 'success'});

                    } else if (d.status == 'error') {

                        UIkit.notify(d.message, {pos: 'bottom-right', status: 'danger'});
                    }
                });
            });
        },
        retrieveKeywordData:           function () {
            $(document).on('click', '.getKeywordData', function (e) {
                e.preventDefault();
                let kwallow = $('.keyword-scraping-allowance').find('.value').html().trim();
                let group = $(this).parents('.group');
                let ids = [];
                let keywords = [];
                group.find('.keyword-selection').each(function () {
                    let tr = $(this).parents('tr');
                    if ($(this).is(':checked') && tr.data('queued') != 1) {
                        $(this).removeAttr('checked');
                        let kw = tr.find('.keywordInput[data-target="keyword"]').html().trim();
                        let id = tr.data('id');
                        if (kw != '') {
                            ids.push(id);
                            keywords.push(kw);
                        }
                    }
                });

                let data = [
                    {
                        name:  'action',
                        value: 'prs_getKeywordData'
                    }, {
                        name:  'ids',
                        value: ids
                    }, {
                        name:  'keywords',
                        value: keywords
                    }
                ];

                if (keywords.length == 0) {
                    UIkit.notify('You must select some keywords first.', {pos: 'bottom-right', status: 'danger'});
                    return;
                }

                if (keywords.length > kwallow) {
                    UIkit.notify('You do not have enough Keyword Scraping Allowance to analyse that many keywords today. Please try again tomorrow.', {
                        pos:    'bottom-right',
                        status: 'danger'
                    });
                    return;
                }

                // Send them for analysis
                $.post(prs_data.wp_post, data, function (d) {
                    UIkit.notify(d.message, {
                        pos:    'bottom-right',
                        status: (d.status == 'success') ? d.status : 'danger'
                    });
                    if (d.status == 'success') {
                        actions.refreshKeywordAllowance();
                        for (let i = 0; i < ids.length; i++) {
                            let id = ids[i];
                            let el = $('.keyword-selection[value="' + id + '"]');
                            let tr = el.parents('tr');
                            tr.attr('data-queued', 1);
                            let tm = '<i class="fa fa-refresh fa-spin" title="This value is currently under analysis. Please check back later to see the results."></i>';
                            let values = [
                                '.keywordInput[data-target="broad"]',
                                '.keywordInput[data-target="phrase"]',
                                '.keywordInput[data-target="intitle"]',
                                '.keywordInput[data-target="inurl"]'
                            ];
                            for (let z = 0; z < values.length; z++) {
                                let td = tr.find(values[z]).parent();
                                td.removeClass();
                                td.addClass('uk-text-center');
                                td.html(tm);
                            }
                        }
                    }
                });

            });
        },
        /*CF Templates*/
        loadCfTemplates:               function () {
            $.post(prs_data.wp_post, 'action=prs_getCfTemplates', function (d) {
                if (d.status == 'success') {
                    cf_templates = $.extend(cf_templates, d.data)
                }

                let template = cf_templates[d.default];

                // Set default template globally
                cf_template = template.data;
                cf_default_template = d.default;

                let template_names = '<option value="new">---</option>';
                for (let key in cf_templates) {
                    if (key == d.default) {
                        // Star if it's default template
                        template_names += '<option value="' + key + '">' + key + ' *</option>';
                    } else {
                        template_names += '<option value="' + key + '">' + key + '</option>';
                    }
                }
                $('#cf-templates').html(template_names);

                $('#cf-templates').val(template.name);
                for (let key in template.data) {
                    $('#' + key).val(template.data[key]);
                    $('.' + key).val(template.data[key]);
                }
            }, 'json');

        },
        changeCfTemplate:              function () {
            $("#cf-templates").change(function () {
                let templateName = $(this).val();
                if (templateName == 'new') {
                    $('#conditional-formatting-local-form').find("input").val("");
                    $('#applyCfTemplate').attr('disabled', true);
                    $('#deleteCfTemplate').attr('disabled', true);
                } else {
                    for (let key in cf_templates[templateName].data) {
                        $('#' + key).val(cf_templates[templateName].data[key]);
                        $('.' + key).val(cf_templates[templateName].data[key]);
                    }
                    $('#applyCfTemplate').attr('disabled', false);
                    $('#deleteCfTemplate').attr('disabled', false);
                }
            });
        },
        saveCfTemplate:                function () {
            $(document).on('click', '#saveCfTemplate', function (e) {
                // Disable button to prevent multiple sending
                let btn = $(this);
                btn.attr('disabled', true);
                e.preventDefault();

                let data = $('#conditional-formatting-local-form').serialize();

                let selected_template = $('#cf-templates').val();

                if (selected_template == 'new') {
                    UIkit.modal.prompt('<span style="font-size: 20px;"><i class="fa fa-save"></i> Please enter name for new template:</span>', '', function (newvalue) {

                        let new_name = newvalue;

                        if (new_name.length < 1) {
                            UIkit.notify('<i class="fa fa-exclamation-circle"></i> Please enter a name for new template!', {
                                pos:    'bottom-right',
                                status: 'danger'
                            });
                            btn.attr('disabled', false);
                            return false;
                        }

                        $.post(prs_data.wp_post, 'action=prs_createCfTemplate&' + data + '&name=' + new_name, function (d) {

                            btn.attr('disabled', false);
                            $('#applyCfTemplate').attr('disabled', false);
                            if (d.status == 'error') {
                                UIkit.notify(d.message, {pos: 'bottom-right', status: 'danger'});
                                return false;
                            } else {
                                UIkit.notify(d.message, {pos: 'bottom-right', status: d.status});
                            }
                            // Update CF Templates data
                            actions.loadCfTemplates();

                        }, 'json');
                    });

                    return false;
                }

                $.post(prs_data.wp_post, 'action=prs_saveCfTemplate&' + data + '&name=' + selected_template, function (d) {
                    UIkit.notify(d.message, {pos: 'bottom-right', status: d.status});
                    // Update CF Templates data
                    cf_templates = d.data;
                    cf_template = cf_templates[cf_default_template].data;
                    // When saving is done, enable button again
                    btn.attr('disabled', false);
                }, 'json');

            });
        },
        applyCfTemplate:               function () {
            $(document).on('click', '#applyCfTemplate', function (e) {

                e.preventDefault();
                let btn = $(this);
                btn.attr('disabled', true);

                $.post(prs_data.wp_post, 'action=prs_applyCfTemplate&templateName=' + $('#cf-templates').val(), function (d) {
                    UIkit.notify(d.message, {pos: 'bottom-right', status: d.status});
                    // When saving is done, enable button again
                    btn.attr('disabled', false);
                    actions.loadCfTemplates();
                    actions.loadProjectManually();
                }, 'json');
            })
        },
        deleteCfTemplate:              function () {
            $(document).on('click', '#deleteCfTemplate', function (e) {
                e.preventDefault();
                let btn = $(this);
                btn.attr('disabled', true);
                let template_name = $('#cf-templates').val();

                UIkit.modal.confirm("Are you sure that you want to delete selected template?", function () {
                    $.post(prs_data.wp_post, 'action=prs_deleteCfTemplate&templateName=' + template_name, function (d) {
                        UIkit.notify(d.message, {pos: 'bottom-right', status: d.status});
                        // When saving is done, enable button again
                        btn.attr('disabled', false);
                        actions.loadCfTemplates();
                    }, 'json');
                }, function () {
                    btn.attr('disabled', false);
                });
            })

        },
        cfValidation:                  function () {
            let inputs = ['volume', 'cpc'];
            let inputs2 = ['broad', 'phrase', 'intitle', 'inurl', 'title_ratio', 'url_ratio'];

            $.each(inputs, function (index, value) {
                let input_type = value;

                $('#' + input_type + '_red').change(function () {
                    let value1 = $(this).val();
                    let value2 = $('#' + input_type + '_green').val();
                    value1 = parseFloat(value1);
                    value2 = parseFloat(value2);
                    if (value1 >= value2) {
                        UIkit.notify('Please input correct condition!', {pos: 'bottom-right', status: 'warning'});
                        $(this).val('');
                        $(this).focus();
                        return false;
                    }

                    $('.' + input_type + '_yellow_1').val(value1);
                    $('.' + input_type + '_yellow_2').val(value2);
                });

                $('#' + input_type + '_green').change(function () {
                    let value1 = $(this).val();
                    let value2 = $('#' + input_type + '_red').val();
                    value1 = parseFloat(value1);
                    value2 = parseFloat(value2);
                    if (value1 <= value2) {
                        UIkit.notify('Please input correct condition!', {pos: 'bottom-right', status: 'warning'});
                        $(this).val('');
                        $(this).focus();
                        return false;
                    }

                    $('.' + input_type + '_yellow_1').val(value2);
                    $('.' + input_type + '_yellow_2').val(value1);
                });
            });

            $.each(inputs2, function (index, value) {
                let input_type = value;

                $('#' + input_type + '_red').change(function () {
                    let value1 = $(this).val();
                    let value2 = $('#' + input_type + '_green').val();
                    value1 = parseFloat(value1);
                    value2 = parseFloat(value2);
                    if (value1 <= value2) {
                        UIkit.notify('Please input correct condition!', {pos: 'bottom-right', status: 'warning'});
                        $(this).val('');
                        $(this).focus();
                        return false;
                    }

                    $('.' + input_type + '_yellow_1').val(value1);
                    $('.' + input_type + '_yellow_2').val(value2);
                });

                $('#' + input_type + '_green').change(function () {
                    let value1 = $(this).val();
                    let value2 = $('#' + input_type + '_red').val();
                    value1 = parseFloat(value1);
                    value2 = parseFloat(value2);
                    if (value1 >= value2) {
                        UIkit.notify('Please input correct condition!', {pos: 'bottom-right', status: 'warning'});
                        $(this).val('');
                        $(this).focus();
                        return false;
                    }

                    $('.' + input_type + '_yellow_1').val(value2);
                    $('.' + input_type + '_yellow_2').val(value1);
                });
            });
        },

        /*Munja Menu*/
        newKeyword:          function () {
            $(document).on('click', '.add-keywords', function (e) {
                e.preventDefault();

                let keywords = $('#keywords-input').val();

                if (keywords == '') {
                    UIkit.notify("<i class='uk-icon-close'></i> You must insert some keywords first.", {
                        pos:    'bottom-right',
                        status: "error"
                    });
                    return;
                }

                $.post(prs_data.wp_post, 'action=prs_addKeyword&group_id=' + keywordGroupID + '&keywords=' + keywords, function (d) {

                    UIkit.modal("#addKeywords").hide();

                    UIkit.notify("<i class='uk-icon-check'></i> Successfully added keywords.", {
                        pos:    'bottom-right',
                        status: "success"
                    });
                    actions.loadProjectManually();

                });
            });
            $(document).on('click', '.addKeyword', function (e) {
                e.preventDefault();
                let group = $(this).parents('.group');
                keywordGroupID = group.find('[name="group_id"]').val();
                let modal = UIkit.modal("#addKeywords");
                modal.show();
            });
        },
        deleteKeywords:      function () {
            $(document).on('click', '.deleteKeywords', function (e) {
                e.preventDefault();
                $('.drag-cursor').append('<i class="spn-ref fa fa-refresh fa-spin" aria-hidden="true"></i>');
                let keyword_ids = $(this).parents('.uk-panel-box').find('.updateKeywords').serialize();
                let keywords_length = $(this).parents('.uk-panel-box').find('.updateKeywords').serializeArray().length;

                if (keywords_length < 1) {
                    UIkit.notify("<i class='uk-icon-close'></i> Please select some keywords!", {
                        pos:    'bottom-right',
                        status: "danger"
                    });
                    return false;
                }


                let group = $(this).parents('.group');
                let ids = [];
                let keywords = [];
                group.find('.keyword-selection').each(function () {
                    let tr = $(this).parents('tr');
                    if ($(this).is(':checked')) {
                        $(this).removeAttr('checked');
                        let kw = tr.find('.keywordInput[data-target="keyword"]').html().trim().replace(/,/g, '');
                        let id = tr.data('id');
                        if (kw != '') {
                            ids.push(id);
                            keywords.push(kw);
                        }
                    }
                });

                $.post(prs_data.wp_post, 'action=prs_track_keywords_get&keywords=' + keywords, function (d) {
                    $('.spn-ref').remove();
                    if (d.status == "success") {
                        UIkit.modal.confirm("Are you sure that you want to remove <b>" + keywords_length + "</b> keywords permanently?", function () {
                            $.post(prs_data.wp_post, 'action=prs_deleteKeywords&' + keyword_ids, function (d) {
                                UIkit.notify("<i class='uk-icon-check'></i> Keywords successfully deleted.", {
                                    pos:    'bottom-right',
                                    status: "success"
                                });
                                actions.loadProjectManually();
                            })
                        });

                        UIkit.modal.confirm("Are you want to remove keyword from APP Dashboard Rank Tracker?", function () {
                            $.post(prs_data.wp_post, 'action=prs_track_keywords_delete&keywords=' + keywords, function (d) {
                                UIkit.notify("<i class='uk-icon-check'></i> Keywords successfully deleted from APP Rank Tracker.", {
                                    pos:    'bottom-right',
                                    status: "success"
                                });
                                actions.loadProjectManually();
                            })
                        });
                    }
                    if (d.status == "error") {
                        UIkit.modal.confirm("Are you sure that you want to remove <b>" + keywords_length + "</b> keywords permanently?", function () {
                            $.post(prs_data.wp_post, 'action=prs_deleteKeywords&' + keyword_ids, function (d) {
                                UIkit.notify("<i class='uk-icon-check'></i> Keywords successfully deleted.", {
                                    pos:    'bottom-right',
                                    status: "success"
                                });
                                actions.loadProjectManually();
                            })
                        });
                    }
                })
            })
        },
        createPagePost:      function () {
            /*Create New Page or Post*/
            $(document).on('click', '.createNewPagePost', function (e) {
                e.preventDefault();
                let btn = $(this);
                let btn_type = btn.attr('data-type');
                let form = btn.parents('form.updateGroup');
                let form_post = form.serialize().replace('action=prs_updateGroup&', '');

                let block_template = $('.creating_block').clone().removeClass('block_template');

                block_template.find('.creating').html('Creating ' + btn_type);
                let waiting = UIkit.modal.blockUI(block_template.html());

                $.post(prs_data.wp_post, 'action=prs_create_page_post&type=' + btn_type + '&' + form_post, function (d) {

                    waiting.hide();
                    if (d.status == 'error') {
                        UIkit.notify("<i class='uk-icon-close'></i> " + d.message, {
                            pos:    'bottom-right',
                            status: "danger"
                        });
                        return false;
                    }

                    let modal_template = $('#resultsPagePost');

                    if (d.status == 'warning') {
                        modal_template.find('.pagePostResultsMessage').html('<i class="fa fa-warning"></i> Page is already created, you can access it below!')
                    }

                    if (d.data.post_type == 'page' && d.status == 'success') {
                        $.post(prs_data.wp_post, 'action=prs_get_page_post_parent', function (pdata) {
                           let pageOption = [];
                            pageOption.push(
                                    "<option dataid='"+d.data.page_id+"' value='0'>( No Parent )</option>"
                                );
                            for (let i = 0; i < pdata.length; i++) {
                                let id = pdata[i].id;
                                let title = pdata[i].title;
                                pageOption.push(
                                    "<option dataid='"+d.data.page_id+"' value='"+id+"'>"+title+"</option>"
                                );
                            }
                            let pageOptions = pageOption.join('');

                            modal_template.find('.update_parent_page #parentPage').append(pageOptions);
                        })
                    } else {
                        modal_template.find('.update_parent_page').html('');
                    }

                    if (d.status == 'success') {
                        $.post(prs_data.wp_post, 'action=prs_get_page_post_status', function (sData) {
                            let statusOption = [];
                            for (let i = 0; i < sData.length; i++) {
                                let value = sData[i].value;
                                let title = sData[i].title;
                                statusOption.push(
                                    "<option dataid='"+d.data.page_id+"' value='"+value+"'>"+title+"</option>"
                                );
                            }
                            let statusOptions = statusOption.join('');

                            modal_template.find('.update_page_post_status #pagePostStatus').append(statusOption);
                        })
                    } else {
                            modal_template.find('.update_page_post_status').html('');   
                    }

                    modal_template.find('.edit_page_post_link').html('<a href="' + d.data.url + '" target="_blank">' + d.data.url + '</a>');

                    UIkit.modal(modal_template).show();

                })
            });

            $(document).on('change', '.update_page_post_status #pagePostStatus', function (e) {
                e.preventDefault();

                let value = this.value;
                let pageID = $('option:selected',this).attr('dataid');

                if (value != '' && pageID != '') {
                    $.post(prs_data.wp_post, 'action=prs_update_page_post_status&page_id=' + pageID + '&value=' + value, function (d) {
                        console.log(d);
                        UIkit.notify("<i class='uk-icon-check'></i> Status successfully updated.", {
                            pos:    'bottom-right',
                            status: "success"
                        });
                    })
                }                
            });

            $(document).on('change', '.update_parent_page #parentPage', function (e) {
                e.preventDefault();

                let value = this.value;
                let pageID = $('option:selected',this).attr('dataid');
                
                if (value != '' && pageID != '') {
                    $.post(prs_data.wp_post, 'action=prs_update_page_parent&page_id=' + pageID + '&value=' + value, function (d) {
                        console.log(d);
                        UIkit.notify("<i class='uk-icon-check'></i> Parent successfully updated.", {
                            pos:    'bottom-right',
                            status: "success"
                        });
                    })
                }
            });
        },
        deleteGroup:         function () {
            $(document).on('click', '.deleteGroup', function (e) {
                e.preventDefault();
                let group = $(this).parents('.group');
                let group_id = group.find('[name="group_id"]').val();

                UIkit.modal.confirm("Are you sure that you want to remove <b>" + group.find('.groupInput[name="group_name"]').val() + "</b> group permanently?", function () {
                    $.post(prs_data.wp_post, 'action=prs_deleteGroup&group_id=' + group_id, function (d) {
                        UIkit.notify("<i class='uk-icon-check'></i> Group successfully deleted.", {
                            pos:    'bottom-right',
                            status: "success"
                        });
                        actions.loadProjectManually();
                    })
                });
            })
        },
        deleteGroups:        function () {
            $(document).on('click', '.deleteGroups', function (e) {
                e.preventDefault();

                let group_names = [];
                let ids = [];
                $('.groupSelect:checked').each(function () {
                    let group = $(this).parents('.group');
                    group_names.push('<li>' + group.data('name') + '</li>');
                    ids.push(group.find('[name="group_id"]').val());
                });

                UIkit.modal.confirm("Are you sure that you want to remove following groups: <ul class='groupDelete'>" + group_names.join('') + "</ul>", function () {
                    $.post(prs_data.wp_post, 'action=prs_deleteGroups&group_ids=' + ids.join(','), function (d) {
                        UIkit.notify("<i class='uk-icon-check'></i> Groups successfully deleted.", {
                            pos:    'bottom-right',
                            status: "success"
                        });
                        actions.loadProjectManually();
                    })
                });
            })
        },
        selectAllKeywords:   function () {
            $(document).on('click', '.select-all', function () {
                let table = $(this).parents('table.keywords');
                table.find('.keyword-selection').each(function () {
                    $(this).prop("checked", !$(this).prop("checked"));
                });
            });
        },
        newGroup:            function () {
            $(document).on('click', '.addGroup', function (e) {
                e.preventDefault();

                UIkit.modal.prompt("New Group Name:", '', function (groupName) {
                    if (groupName == '') {
                        UIkit.modal.alert("Group Name cannot be empty!");
                    } else {
                        $.post(prs_data.wp_post, 'action=prs_newGroup&project_id=' + currentProjectID + '&group_name=' + groupName, function (d) {
                            UIkit.notify("<i class='uk-icon-check'></i> Group '" + groupName + "' has been created.", {
                                pos:    'bottom-right',
                                status: "success"
                            });
                            actions.loadProjectManually();
                        });
                    }
                });
            });
        },
        updateGroup:         function () {
            $(document).on('submit', '.updateGroup', function (e) {
                e.preventDefault();

                let button = $(this).find('.saveGroup');
                let group_id = $(this).find('[name="group_id"]').val();
                let project_id = $(this).find('[name="project_id"]').val();
                let data = $(this).serialize();
                let kw_data = $(this).parents('.group').find('.keywords-data');

                button.disable();

                // First update the group settings
                $.post(prs_data.wp_post, data, function (d) {

                    button.disable();

                    // Now update all keywords
                    let keywords = [];
                    let position = 1;
                    kw_data.find('tr').each(function () {
                        let keyword = {};
                        keyword['id'] = $(this).data('id');
                        keyword['position'] = position;
                        position++;
                        let allNull = true;
                        $(this).find('td div.keywordInput').each(function () {
                            let value = $(this).text();
                            if (value != '') {
                                keyword[$(this).data('target')] = value;
                                allNull = false;
                            }
                        });
                        if (!allNull) keywords.push(keyword);
                    });

                    let data = [
                        {
                            name:  'action',
                            value: 'prs_updateKeywords'
                        }, {
                            name:  'group_id',
                            value: group_id
                        }, {
                            name:  'keywords',
                            value: encodeURIComponent(JSON.stringify(keywords))
                        }
                    ];

                    $.post(prs_data.wp_post, data, function (d) {
                        activeChanges = false;
                        UIkit.notify("<i class='uk-icon-check'></i> Changes saved successfully.", {
                            pos:    'bottom-right',
                            status: "success"
                        });
                    });

                });
            });
        },
        editGroupSettings:   function () {
            $(document).on('click', '.editGroupSettings', function (e) {
                e.preventDefault();

                let groupSettings = $(this).parents('.groupSettings');
                let tbody = groupSettings.find('tbody.groupSettingsTbody');

                tbody.toggle();

                actions.updateGrid();
            });
        },
        renderSliders:       function () {
            // Enable sliders
            $('.prs-slider-frame .slider-button').toggle(function () {
                $(this).addClass('on');
            }, function () {
                $(this).removeClass('on');
            });
        },
        newProject:          function () {
            $(document).on('click', '.new-project', function (e) {
                e.preventDefault();

                UIkit.modal.prompt("New Project Name:", '', function (projectName) {
                    if (projectName == '') {
                        UIkit.modal.alert("Project Name cannot be empty!");
                    } else {
                        $.post(prs_data.wp_post, 'action=prs_new_project&project_name=' + projectName, function (d) {
                            UIkit.notify("<i class='uk-icon-check'></i> Project '" + projectName + "' has been created.", {
                                pos:    'bottom-right',
                                status: "success"
                            });
                            actions.loadProjects();
                        });
                    }
                });
            });
        },
        updateGrid:          function () {
            // Fix UIkit positions
            UIkit.$html.trigger('changed.uk.dom');
        },
        updateElements:      function () {
            // Table sorting
            $(".keywords").tablesorter(
                {
                    headers: {
                        0: {
                            sorter: false
                        },
                        2: {
                            sorter: 'fancyNumber'
                        },
                        3: {
                            sorter: 'fancyNumber'
                        },
                        4: {
                            sorter: 'fancyNumber'
                        },
                        5: {
                            sorter: 'fancyNumber'
                        },
                        6: {
                            sorter: 'fancyNumber'
                        },
                        7: {
                            sorter: 'fancyNumber'
                        },
                        8: {
                            sorter: 'fancyNumber'
                        }
                    }
                }
            );

            let kw_data = $('.keywords-data');

            kw_data.multisortable({
                items:         "tr",
                selectedClass: "selected"
            });

            // Drag and Drop
            kw_data.sortable({
                connectWith: ".uk-sortable",
                cancel:      "input,textarea,button,select,option,[contenteditable]"
            }).on("sortreceive", function (event, ui) {

                let target = $(this);
                let original_group = $(ui.sender).parents('.group').find('[name="group_id"]').val();
                let target_group = target.parents('.group').find('[name="group_id"]').val();

                setTimeout(function () {
                    let keyword_ids = [];
                    target.find('tr.selected').each(function () {
                        let id = $(this).data('id');
                        keyword_ids.push(id);
                    });

                    $.post(prs_data.wp_post, 'action=prs_keywordChangeGroup&keyword_ids=' + keyword_ids.join(',') + '&original_group_id=' + original_group + '&target_group_id=' + target_group, function (d) {
                        actions.updateGrid();

                        UIkit.notify("<i class='uk-icon-check'></i> Group change successful.", {
                            pos:    'bottom-right',
                            status: "success"
                        });
                    });
                }, 500);
            });
        },
        prepareURL:          function (url) {
            if (url == null || url == '') {
                return {
                    pre:  '/',
                    name: ''
                };
            }
            let hasSlash = 2;
            if (url.substr(-1) != '/') {
                hasSlash = 1;
            }

            url = url.split('/');
            let name = url[url.length - hasSlash];
            let cat = url.slice(0, -hasSlash).join('/') + '/';
            return {
                pre:  cat,
                name: name
            };
        },
        onDragChangeCursor:  function () {
            $(document).on('click', '.drag-cursor', function () {

            })
        },
        changePostTypes:     function () {
            $(document).on('change', '#PostsType', function (e) {

                postsTable.fnDraw();

            });
            $(document).on('change', '#PostsType2', function (e) {

                postsTable2.fnDraw();

            });
        },
        filterByPostType:    function () {
            $(document).on('change', '#filterPostTypes', function () {

                let value = $(this).val() != '' ? ' (<b>' + $(this).val().charAt(0).toUpperCase() + $(this).val().slice(1) + 's' + ')</b>' : '';

                $(this).prev().html('<i class="fa fa-folder-open-o"></i> Filter by Post Type' + value);

                actions.loadProjectManually();
            });
        },
        loadPostTypes:       function () {

            $.post(prs_data.wp_post, 'action=prs_get_post_types', function (d) {

                if (d.status == 'success') {

                    pTypes = d.data;

                    let postTypes = [];
                    for (let i = 0; i < pTypes.length; i++) {
                        let type = pTypes[i];
                        postTypes.push(
                            "<option value='" + type + "'>" + type.charAt(0).toUpperCase() + type.slice(1) + "s</option>"
                        );
                    }
                    pTypes = postTypes.join('');

                    // Insert into filters
                    $('#filterPostTypes').append(pTypes);

                    // Load the Datatable for posts
                    actions.loadPostsPages();
                }

            });
        },
        loadPostsPages:      function () {

            postsTable = $('.postsTable').dataTable({
                language:         {
                    search:            "_INPUT_",
                    searchPlaceholder: "Search posts...",
                    processing:        "Loading Posts...",
                    emptyTable:        "No posts found on this website.",
                    info:              "_START_ to _END_ of _TOTAL_ results",
                    infoEmpty:         "0 to 0 of 0 results",
                    infoFiltered:      "(from _MAX_ total results)"
                },
                "dom":            '<"posts-actions"<"uk-float-right"fl>>rt<"posts-actions-bottom"ip<"uk-clearfix">>',
                "bDestroy":       true,
                "searchDelay":    350,
                "bPaginate":      true,
                "bAutoWidth":     false,
                "bFilter":        true,
                "bProcessing":    true,
                "sServerMethod":  "POST",
                "bServerSide":    true,
                "sAjaxSource":    prs_data.wp_post,
                "iDisplayLength": 5,
                "aLengthMenu":    [[5, 10, 50, 100], [5, 10, 50, 100]],
                "aaSorting":      [[1, 'desc']],
                "aoColumns":      [
                    {
                        "sClass":    "text-left",
                        "bSortable": false,
                        "mData":     'ID',
                        "mRender":   function (data, type, row) {
                            return '<span class="post-id">' + data + '</span>';
                        }
                    },
                    {
                        "sClass":    "text-left",
                        "bSortable": true,
                        "mData":     'post_title',
                        "mRender":   function (data, type, row) {
                            return "<b class='post-title'>" + data + "</b>"
                                + "<div class='row-actions'>"
                                + "<a href='#' data-id='" + row.ID + "' class='attach-to-page-post uk-text-success'>Attach</a>"

                                + " <span>|</span> "

                                + "<a href='" + prs_data.wp_admin + 'post.php?post=' + row.ID + '&action=edit' + "' target='_blank' class='edit'>Edit</a>"

                                + " <span>|</span> "

                                + "<a href='" + row.guid + "' target='_blank' class='view'>View</a>"
                                + "</div>";
                        },
                        "asSorting": ["desc", "asc"]
                    },
                    {
                        "bSortable": true,
                        "mData":     'post_date',
                        "mRender":   function (data, type, row) {
                            return '<b>' + row.post_status.charAt(0).toUpperCase() + row.post_status.slice(1) + 'ed</b>'
                                + '<br>'
                                + '<abbr title="' + data + '">' + new Date(data).toUTCString().split(' ').splice(0, 4).join(' ') + '</abbr>';
                        },
                        "asSorting": ["desc", "asc"]
                    }
                ],
                "fnServerParams": function (aoData) {

                    aoData.push({
                        name:  'action',
                        value: 'prs_get_posts'
                    });

                    if ($('#PostsType').length > 0) {

                        aoData.push({
                            name:  'PostsType',
                            value: $('#PostsType').val()
                        });

                    }
                },
                "fnCreatedRow":   function (row, data, index) {
                    let modal = UIkit.modal("#attachToPagePost");
                    let value = modal.find('[name="post_id"]').val();

                    if (data.ID == value) {
                        $(row).addClass('attached');
                    }
                },

                fnInitComplete: function () {

                    $('.posts-actions').append(
                        '<div class="uk-float-left">'

                        + '<select class="form-control table-actions-input" id="PostsType">'
                        + '<option value="">– Filter Type –</option>'
                        + pTypes
                        + '</select>'

                        + '<select class="form-control table-actions-input" id="AttachType">'
                        + '<option value="" selected>Import data from ...</option>'
                        + '<option value="page">Page fields</option>'
                        + '<option value="group">Group fields</option>'
                        + '</select>'

                        + '</div>'

                        + '<div class="uk-clearfix"></div>'
                    );
                }

            });
            postsTable2 = $('.postsTable2').dataTable({
                language:         {
                    search:            "_INPUT_",
                    searchPlaceholder: "Search posts...",
                    processing:        "Loading Posts...",
                    emptyTable:        "No posts found on this website.",
                    info:              "_START_ to _END_ of _TOTAL_ results",
                    infoEmpty:         "0 to 0 of 0 results",
                    infoFiltered:      "(from _MAX_ total results)"
                },
                "dom":            '<"posts-actions2"<"uk-float-right"fl>>rt<"posts-actions-bottom2"ip<"uk-clearfix">>',
                "bDestroy":       true,
                "searchDelay":    350,
                "bPaginate":      true,
                "bAutoWidth":     false,
                "bFilter":        true,
                "bProcessing":    true,
                "sServerMethod":  "POST",
                "bServerSide":    true,
                "sAjaxSource":    prs_data.wp_post,
                "iDisplayLength": 5,
                "aLengthMenu":    [[5, 10, 50, 100], [5, 10, 50, 100]],
                "aaSorting":      [[1, 'desc']],
                "aoColumns":      [
                    {
                        "sClass":      "text-left",
                        "bSortable":   false,
                        "bSearchable": false,
                        "mRender":     function (data, type, row) {
                            let checked = '';

                            if ($.inArray(row.ID, selectedPosts) != -1) {
                                checked = 'checked';
                            }

                            return '<input ' + checked + ' class="select-post" type="checkbox" value="' + row.ID + '">';
                        }
                    },
                    {
                        "sClass":    "text-left",
                        "bSortable": false,
                        "mData":     'ID',
                        "mRender":   function (data, type, row) {
                            return '<span class="post-id">' + data + '</span>';
                        }
                    },
                    {
                        "sClass":    "text-left",
                        "bSortable": true,
                        "mData":     'post_title',
                        "mRender":   function (data, type, row) {
                            return "<b class='post-title'>" + data + "</b>"
                                + "<div class='row-actions'>"

                                + "<a href='" + prs_data.wp_admin + 'post.php?post=' + row.ID + '&action=edit' + "' target='_blank' class='edit'>Edit</a>"

                                + " <span>|</span> "

                                + "<a href='" + row.guid + "' target='_blank' class='view'>View</a>"
                                + "</div>";
                        },
                        "asSorting": ["desc", "asc"]
                    },
                    {
                        "bSortable": true,
                        "mData":     'post_date',
                        "mRender":   function (data, type, row) {
                            return '<b>' + row.post_status.charAt(0).toUpperCase() + row.post_status.slice(1) + 'ed</b>'
                                + '<br>'
                                + '<abbr title="' + data + '">' + new Date(data).toUTCString().split(' ').splice(0, 4).join(' ') + '</abbr>';
                        },
                        "asSorting": ["desc", "asc"]
                    }
                ],
                "fnServerParams": function (aoData) {

                    aoData.push({
                        name:  'action',
                        value: 'prs_get_posts'
                    });

                    if ($('#PostsType2').length > 0) {

                        aoData.push({
                            name:  'PostsType',
                            value: $('#PostsType2').val()
                        });

                    }
                },

                fnInitComplete: function () {

                    $('.posts-actions2').append(
                        '<div class="uk-float-left">'

                        + '<select class="form-control table-actions-input" id="PostsType2">'
                        + '<option value="">Post Type</option>'
                        + pTypes
                        + '</select>'

                        + '</div>'

                        + '<div class="uk-clearfix"></div>'
                    );
                }

            });

        },
        attachToPagePost:    function () {

            $(document).on('click', '.attach-to-page-post', function (e) {
                e.preventDefault();
                let button = $(this);
                let modal = UIkit.modal("#attachToPagePost");
                let post_id = button.data('id');
                let attach_t = $('#AttachType').val();
                let group_id = modal.find('[name="group_id"]').val();

                if (attach_t == "") {
                    UIkit.notify("<i class='fa fa-warning'></i> Please select first where to import the data from (Title / Description / H1)! You can select your Group's SEO Title and Description, or your Page/Post's SEO Title, Descriptions and H1.", {
                        pos:    'bottom-right',
                        status: "danger"
                    });
                    return;
                }

                button.disable('Attaching ...');
                $.post(prs_data.wp_post, 'action=prs_attach_to_page_post&group_id=' + group_id + '&post_id=' + post_id + '&attach_type=' + attach_t, function (d) {
                    button.disable();
                    if (d.status == 'success') {
                        UIkit.notify("<i class='fa fa-check'></i> " + d.message, {
                            pos:    'bottom-right',
                            status: d.status
                        });
                        actions.loadProjectManually();
                        modal.hide();
                    } else {
                        UIkit.notify("<i class='fa fa-warning'></i> " + d.message, {
                            pos:    'bottom-right',
                            status: "danger"
                        });
                    }
                });

            });

            $(document).on('click', '.attachToPagePost', function (e) {
                e.preventDefault();
                let group_id = $(this).parents('.updateGroup').find('input[name="group_id"]').val();
                let post_id = $(this).data('post-id');
                let modal = UIkit.modal("#attachToPagePost");

                modal.find('[name="group_id"]').val(group_id);
                modal.find('[name="post_id"]').val(post_id);

                postsTable.fnDraw();

                modal.show();
            });
        },
        goToPagePost:        function () {
            $(document).on('click', '.goToPagePost', function (e) {
                if ($(this).attr('href') == '#') {
                    e.preventDefault();
                    UIkit.notify("<i class='fa fa-warning'></i> You must first attach a page in order to use Go to Page/Post.", {
                        pos:    'bottom-right',
                        status: "warning"
                    });
                }
            });
        },
        onURLEdit:           function () {
            $(document).on('focus', '[contenteditable="true"]', function () {
                let $this = $(this);
                $this.data('before', $this.html());
                return $this;
            }).on('blur keyup paste input', '[contenteditable="true"]', function () {
                let $this = $(this);
                if ($this.data('before') != $this.html()) {
                    $this.data('before', $this.html());
                    $this.trigger('change');
                }
                return $this;
            });
            $(document).on('change', '.url-edit', function (e) {
                let cont = $(this).parents('.url-container');

                let pre = $(this).prev('.pre-url').html();
                let name = $(this).html().replace(/\//g, '');
                let post = $(this).next('.post-url').html();

                cont.find('[name="url"]').val(pre + name + post);
            });
            $(document).on('click', '.pre-url', function (e) {
                e.preventDefault();
                $(this).next().focus().select();
            });
            $(document).on('click', '.post-url', function (e) {
                e.preventDefault();
                $(this).prev().focus().select();
            });
        },
        parseNumber:         function (num) {
            if (num == null || num == "") {
                return '';
            } else {
                return parseInt(num).toLocaleString();
            }
        },
        loadProjectManually: function () {
            if (currentProjectID == 0) return;
            $.post(prs_data.wp_post, 'action=prs_getGroups&project_id=' + currentProjectID + '&post_type=' + $('#filterPostTypes').val(), function (d) {

                d.sort((a, b) => {
                    let aa = a.group_name.toLowerCase(),
                        bb = b.group_name.toLowerCase();

                    if (aa < bb) {
                        return -1;
                    }
                    if (aa > bb) {
                        return 1;
                    }
                    return 0;
                });

                let project_dashboard = $('.project-dashboard');
                let projects_table = $('.projects-table');
                let project_groups = $('.project-groups');
                let project_empty = $('.project-empty');

                project_dashboard.find('.project-name').html("<i class='fa fa-file-text-o'></i> #" + currentProjectID + ": " + currentProjectName);
                if (d.length > 0) {
                    project_empty.hide();
                    project_groups.show();

                    let data = project_groups.find('.data');

                    // Remove old loaded groups
                    data.empty();

                    currentSiloGroups = [];

                    // Render new groups
                    for (let i = 0; i < d.length; i++) {

                        let row = d[i];
                        let template = $('.group.template').clone();
                        template.removeClass('template');

                        // Set the Post Type
                        if (row.post_type != false) {
                            template.addClass('hasAttachedPost');
                            template.attr('data-post-type', row.post_type);
                        }

                        // Append the Group ID
                        template.find('[name="group_id"]').val(row.id);
                        template.find('[name="project_id"]').val(currentProjectID);

                        // Change the Group Name
                        template.find('[name="group_name"]').val(row.group_name);
                        template.attr('data-name', row.group_name);

                        // Prepare the URL
                        let pURL = actions.prepareURL(row.url);

                        template.find('.attachToPagePost').attr('data-post-id', row.id_page_post);

                        // Go to Page/Post
                        if (row.id_page_post != null && row.id_page_post != '') {
                            template.find('.goToPagePost').attr('href', prs_data.wp_admin + "post.php?post=" + row.id_page_post + "&action=edit");
                            template.find('.attachToPagePost').html('<i class="fa fa-bullseye"></i> Attach to Page/Post &nbsp;&nbsp; (<i title="Attached to an existing Page/Post already." class="uk-text-success fa fa-check"></i>)');
                            template.find('.attachToPagePost').attr('data-group-id', row.id);

                            currentSiloGroups.push({
                                id_page_post: row.id_page_post,
                                h1:           row.h1,
                                group_name:   row.group_name
                            });
                        }

                        // Change the rest of the Group Settings
                        template.find('[name="title"]').val(row.title != null ? row.title : '');
                        template.find('[name="description"]').val(row.description != null ? row.description : '');
                        template.find('[name="notes"]').val(row.notes != null ? row.notes : '');
                        template.find('[name="h1"]').val(row.h1 != null ? row.h1 : '');
                        template.find('[name="url"]').val(row.url != null ? row.url : '');
                        template.find('.pre-url').html(pURL.pre);
                        template.find('.url-edit').html(pURL.name);
                        template.find('.post-url').html('/');
                        template.find('[name="oriUrl"]').val(row.url != null ? row.url : '');

                        template.find('[data-target="title"]').text(row.title != null ? row.title : '');
                        template.find('[data-target="description"]').text(row.description != null ? row.description : '');

                        // Calculate Counting
                        template.find('.count-seo-title').text(row.title != null ? row.title.length : 0);
                        template.find('.count-seo-title-mobile').text(row.title != null ? row.title.length : 0);

                        template.find('.count-seo-description').text(row.description != null ? row.description.length : 0);
                        template.find('.count-seo-description-mobile').text(row.description != null ? row.description.length : 0);

                        // Go through keywords
                        if (row.keywords.length > 0) {

                            let kwData = template.find('.keywords-data');
                            kwData.empty();
                            for (let k = 0; k < row.keywords.length; k++) {
                                let keyword = row.keywords[k];

                                // remove null values
                                for (let key in keyword) {
                                    if (keyword.hasOwnProperty(key)) {
                                        if (keyword[key] == null) {
                                            keyword[key] = '';
                                        }
                                    }
                                }

                                /**
                                 *
                                 *     CONDITIONAL FORMATTING
                                 *
                                 */

                                let volume_color, cpc_color, broad_color, phrase_color, intitle_color, inurl_color, tr_color, ur_color;

                                let title_ratio = "";
                                if (keyword.volume != "" && keyword.intitle != "") {
                                    if (keyword.volume != 0) {
                                        title_ratio = keyword.intitle / keyword.volume;
                                    }
                                }

                                let url_ratio = "";
                                if (keyword.volume !== "" && keyword.inurl !== "") {
                                    if (keyword.volume != 0) {
                                        url_ratio = keyword.inurl / keyword.volume;
                                    }
                                }

                                if (keyword.volume == "") {
                                    volume_color = '';
                                } else if (parseFloat(cf_template.volume_red) >= parseFloat(keyword.volume)) {
                                    volume_color = 'tr_red';
                                } else if (parseFloat(cf_template.volume_red) < parseFloat(keyword.volume) && parseFloat(cf_template.volume_green) > parseFloat(keyword.volume)) {
                                    volume_color = 'tr_yellow';
                                } else if (parseFloat(cf_template.volume_green) <= parseFloat(keyword.volume)) {
                                    volume_color = 'tr_green';
                                }

                                if (keyword.cpc == "") {
                                    cpc_color = '';
                                } else if (parseFloat(cf_template.cpc_red) >= parseFloat(keyword.cpc)) {
                                    cpc_color = 'tr_red';
                                } else if (parseFloat(cf_template.cpc_red) < parseFloat(keyword.cpc) && parseFloat(cf_template.cpc_green) > parseFloat(keyword.cpc)) {
                                    cpc_color = 'tr_yellow';
                                } else if (parseFloat(cf_template.cpc_green) <= parseFloat(keyword.cpc)) {
                                    cpc_color = 'tr_green';
                                }

                                if (keyword.broad == "") {
                                    broad_color = '';
                                } else if (parseFloat(cf_template.broad_red) <= parseFloat(keyword.broad)) {
                                    broad_color = 'tr_red';
                                } else if (parseFloat(cf_template.broad_red) > parseFloat(keyword.broad) && parseFloat(cf_template.broad_green) < parseFloat(keyword.broad)) {
                                    broad_color = 'tr_yellow';
                                } else if (parseFloat(cf_template.broad_green) >= parseFloat(keyword.broad)) {
                                    broad_color = 'tr_green';
                                }

                                if (keyword.phrase == "") {
                                    phrase_color = '';
                                } else if (parseFloat(cf_template.phrase_red) <= parseFloat(keyword.phrase)) {
                                    phrase_color = 'tr_red';
                                } else if (parseFloat(cf_template.phrase_red) > parseFloat(keyword.phrase) && parseFloat(cf_template.phrase_green) < parseFloat(keyword.phrase)) {
                                    phrase_color = 'tr_yellow';
                                } else if (parseFloat(cf_template.phrase_green) >= parseFloat(keyword.phrase)) {
                                    phrase_color = 'tr_green';
                                }

                                if (keyword.intitle == "") {
                                    intitle_color = '';
                                } else if (parseFloat(cf_template.intitle_red) <= parseFloat(keyword.intitle)) {
                                    intitle_color = 'tr_red';
                                } else if (parseFloat(cf_template.intitle_red) > parseFloat(keyword.intitle) && parseFloat(cf_template.intitle_green) < parseFloat(keyword.intitle)) {
                                    intitle_color = 'tr_yellow';
                                } else if (parseFloat(cf_template.intitle_green) >= parseFloat(keyword.intitle)) {
                                    intitle_color = 'tr_green';
                                }

                                if (keyword.inurl == "") {
                                    inurl_color = '';
                                } else if (parseFloat(cf_template.inurl_red) <= parseFloat(keyword.inurl)) {
                                    inurl_color = 'tr_red';
                                } else if (parseFloat(cf_template.inurl_red) > parseFloat(keyword.inurl) && parseFloat(cf_template.inurl_green) < parseFloat(keyword.inurl)) {
                                    inurl_color = 'tr_yellow';
                                } else if (parseFloat(cf_template.inurl_green) >= parseFloat(keyword.inurl)) {
                                    inurl_color = 'tr_green';
                                }

                                if (title_ratio == "") {
                                    tr_color = '';
                                } else if (parseFloat(title_ratio) >= parseFloat(cf_template.title_ratio_red)) {
                                    tr_color = 'tr_red';
                                } else if (parseFloat(title_ratio) < parseFloat(cf_template.title_ratio_red) && parseFloat(title_ratio) > parseFloat(cf_template.title_ratio_green)) {
                                    tr_color = 'tr_yellow';
                                } else if (parseFloat(title_ratio) <= parseFloat(cf_template.title_ratio_green)) {
                                    tr_color = 'tr_green';
                                }

                                if (url_ratio == "") {
                                    ur_color = '';
                                } else if (parseFloat(url_ratio) >= parseFloat(cf_template.url_ratio_red)) {
                                    ur_color = 'tr_red';
                                } else if (parseFloat(url_ratio) < parseFloat(cf_template.url_ratio_red) && parseFloat(url_ratio) > parseFloat(cf_template.url_ratio_green)) {
                                    ur_color = 'tr_yellow';
                                } else if (parseFloat(url_ratio) <= parseFloat(cf_template.url_ratio_green)) {
                                    ur_color = 'tr_green';
                                }

                                /**
                                 *
                                 *     CONDITIONAL FORMATTING
                                 *
                                 */


                                let tr = $('<tr data-queued="' + keyword.queued + '" data-id="' + keyword.id + '"></tr>');
                                tr.append('<td><div class="drag-cursor"><i class="fa fa-ellipsis-v" aria-hidden="true" style="margin-right: 1px;"></i><i class="fa fa-ellipsis-v" aria-hidden="true"></i></div> <input type="checkbox" class="keyword-selection" value="' + keyword.id + '" name="keywords[]" /></td>');
                                tr.append('<td><div contenteditable="true" class="keywordInput" data-target="keyword">' + keyword.keyword + '</div></td>');

                                if (keyword.queued == 2) {
                                    tr.append('<td data-target="volume" class="uk-text-center" title="This value is currently under analysis. Please check back later to see the results."><i class="fa fa-refresh fa-spin"></i></td>');
                                    tr.append('<td data-target="cpc" class="uk-text-center" title="This value is currently under analysis. Please check back later to see the results."><i class="fa fa-refresh fa-spin"></i></td>');
                                } else {
                                    tr.append('<td class="' + volume_color + '"><div contenteditable="true" class="keywordInput" data-target="volume">' + actions.parseNumber(keyword.volume) + '</div></td>');
                                    tr.append('<td class="' + cpc_color + '"><div contenteditable="true" class="keywordInput" data-target="cpc">' + keyword.cpc + '</div></td>');
                                }

                                if (keyword.queued == 1) {
                                    tr.append('<td data-target="broad" class="uk-text-center" title="This value is currently under analysis. Please check back later to see the results."><i class="fa fa-refresh fa-spin"></i></td>');
                                    tr.append('<td data-target="phrase" class="uk-text-center" title="This value is currently under analysis. Please check back later to see the results."><i class="fa fa-refresh fa-spin"></i></td>');
                                    tr.append('<td data-target="intitle" class="uk-text-center" title="This value is currently under analysis. Please check back later to see the results."><i class="fa fa-refresh fa-spin"></i></td>');
                                    tr.append('<td data-target="inurl" class="uk-text-center" title="This value is currently under analysis. Please check back later to see the results."><i class="fa fa-refresh fa-spin"></i></td>');
                                } else {
                                    tr.append('<td data-target="broad" class="' + broad_color + '"><div contenteditable="true" class="keywordInput" data-target="broad">' + actions.parseNumber(keyword.broad) + '</div></td>');
                                    tr.append('<td data-target="phrase" class="' + phrase_color + '"><div contenteditable="true" class="keywordInput" data-target="phrase">' + actions.parseNumber(keyword.phrase) + '</div></td>');
                                    tr.append('<td data-target="intitle" class="' + intitle_color + '"><div contenteditable="true" class="keywordInput" data-target="intitle">' + actions.parseNumber(keyword.intitle) + '</div></td>');
                                    tr.append('<td data-target="inurl" class="' + inurl_color + '"><div contenteditable="true" class="keywordInput" data-target="inurl">' + actions.parseNumber(keyword.inurl) + '</div></td>');
                                }

                                if (title_ratio != "") {
                                    if (tr_color == "tr_green" && (parseFloat(cf_template.tr_goldbar_volume) >= parseFloat(keyword.volume) && parseFloat(cf_template.tr_goldbar_intitle) >= parseFloat(keyword.intitle))) {
                                        tr.append('<td class="uk-text-center ' + tr_color + '" data-target="tr"><div contenteditable="false" class="keywordInput" data-target="tr" data-uk-tooltip="{pos:\'left\'}" title="Value: ' + parseFloat(title_ratio).toFixed(3) + '"><img src="' + prs_data.plugins_url + '/assets/img/gold.png"></div></td>');
                                    } else {
                                        tr.append('<td class="uk-text-center ' + tr_color + '" data-target="tr"><div contenteditable="true" class="keywordInput" data-target="tr" data-uk-tooltip="{pos:\'left\'}" title="Value: ' + parseFloat(title_ratio).toFixed(3) + '">' + parseFloat(title_ratio).toFixed(3) + '</div></td>');
                                    }
                                } else {
                                    tr.append('<td class="uk-text-center ' + tr_color + '" data-target="tr"><div contenteditable="true" class="keywordInput" data-target="tr" data-uk-tooltip="{pos:\'left\'}" title="Search Volume and InTitle metrics must be retrieved first to see the Title Ratio."><i class="fa fa-minus"></i></div></td>');
                                }

                                if (url_ratio != "") {
                                    if (ur_color == "tr_green" && (parseFloat(cf_template.ur_goldbar_volume) >= parseFloat(keyword.volume) && parseFloat(cf_template.ur_goldbar_intitle) >= parseFloat(keyword.inurl))) {
                                        tr.append('<td class="uk-text-center ' + ur_color + '" data-target="ur"><div contenteditable="false" class="keywordInput" data-target="ur" data-uk-tooltip="{pos:\'left\'}" title="Value: ' + parseFloat(url_ratio).toFixed(3) + '"><img src="' + prs_data.plugins_url + '/assets/img/gold.png"></div></td>');
                                    } else {
                                        tr.append('<td class="uk-text-center ' + ur_color + '" data-target="ur"><div contenteditable="true" class="keywordInput" data-target="ur" data-uk-tooltip="{pos:\'left\'}" title="Value: ' + parseFloat(url_ratio).toFixed(3) + '">' + parseFloat(url_ratio).toFixed(3) + '</div></td>');
                                    }
                                } else {
                                    tr.append('<td class="uk-text-center ' + ur_color + '" data-target="ur"><div contenteditable="true" class="keywordInput" data-target="ur" data-uk-tooltip="{pos:\'left\'}" title="Search Volume and InURL metrics must be retrieved first to see the URL Ratio."><i class="fa fa-minus"></i></div></td>');
                                }

                                let rank = keyword.rank.isJSON();
                                let rank_cell = '';

                                if (rank == 0) {
                                    rank_cell = '<span data-uk-tooltip="{pos:\'left\'}" title="Not Added"><i class="fa fa-minus"></i><span style="display: none;">99999</span></span>';
                                } else if (rank == 501) {
                                    rank_cell = '<span data-uk-tooltip="{pos:\'left\'}" title="Analysing..."><i class="fa fa-refresh fa-spin"></i><span style="display: none;">99998</span></span>';
                                } else {

                                    let max = 501;
                                    let rank_title = '';

                                    for (let j = 0; j < rank.length; j++) {
                                        let obj = rank[j];

                                        if (obj.rank != 'NTH' || obj.rank == null) {
                                            if (max > obj.rank) {
                                                max = obj.rank;
                                            }
                                            rank_title += obj.engine + ' : ' + obj.rank + '<br>';
                                        } else {
                                            rank_title += obj.engine + ' : <i class=\'fa fa-ban\'></i><br>';
                                        }

                                    }

                                    if (max == 501) {
                                        rank_cell = '<a href="https://app.projectsupremacy.com/rank_tracker?domain=' + domain + '&keyword=' + encodeURIComponent(keyword.keyword) + '" target="_blank" data-uk-tooltip="{pos:\'left\'}" title="' + rank_title + '"><i class=\'fa fa-ban\'></i><span style="display: none;">99997</span></a>';
                                    } else {
                                        rank_cell = '<a href="https://app.projectsupremacy.com/rank_tracker?domain=' + domain + '&keyword=' + encodeURIComponent(keyword.keyword) + '" target="_blank" data-uk-tooltip="{pos:\'left\'}" title="' + rank_title + '">' + max + '</a>';
                                    }

                                }

                                tr.append('<td class="text-center">' + rank_cell + '</td>');

                                kwData.append(tr);
                            }
                        }

                        data.append(template);
                    }

                } else {
                    project_empty.show();
                    project_groups.hide();
                }

                projects_table.slideUp("fast", function () {
                    actions.updateElements();
                    actions.updateGrid();
                });
                project_dashboard.slideDown();

            });
        },
        loadProject:         function () {
            $(document).on('click', '.load_project', function (e) {
                e.preventDefault();
                currentProjectID = $(this).data('id');
                currentProjectName = $(this).data('name');

                actions.importKeywordPlanner();
                actions.loadProjectManually();
            });
        },
        backToProjects:      function () {
            $(document).on('click', '.closeProject', function (e) {
                let project_dashboard = $('.project-dashboard');
                let projects_table = $('.projects-table');

                projects_table.slideDown();
                project_dashboard.slideUp();
                currentProjectID = 0;
            });
        },
        renameProject:       function () {
            $(document).on('click', '.rename_project', function (e) {
                e.preventDefault();

                let project_id = $(this).data('id');
                let project_name = $(this).data('name');

                UIkit.modal.prompt("New Project Name:", project_name, function (projectName) {
                    if (projectName == '') {
                        UIkit.modal.alert("Project Name cannot be empty!");
                    } else {
                        $.post(prs_data.wp_post, 'action=prs_rename_project&project_id=' + project_id + '&project_name=' + projectName, function (d) {
                            UIkit.notify("<i class='uk-icon-check'></i> Project '" + project_name + "' has been renamed to '" + projectName + "'", {
                                pos:    'bottom-right',
                                status: "success"
                            });
                            actions.loadProjects();
                        });
                    }
                });
            });
        },
        removeProject:       function () {
            $(document).on('click', '.remove_project', function (e) {
                e.preventDefault();

                let id = $(this).data('id');

                UIkit.modal.confirm("Are you sure that you want to remove this project permanently?", function () {
                    $.post(prs_data.wp_post, 'action=prs_remove_project&project_id=' + id, function (d) {
                        UIkit.notify("<i class='uk-icon-check'></i> Project has been removed.", {
                            pos:    'bottom-right',
                            status: "success"
                        });
                        actions.loadProjects();
                    });
                });
            });
        },
        loadProjects:        function () {
            $('.pTable').dataTable({
                "dom":            '<"actions"><"top"lf>rt<"bottom"ip><"actions"><"clear">',
                "bDestroy":       true,
                "bPaginate":      true,
                "bAutoWidth":     false,
                "bFilter":        true,
                "sServerMethod":  "POST",
                "sAjaxSource":    prs_data.wp_post,
                "iDisplayLength": 10,
                "language":       {
                    "emptyTable": "<a href='#' class='uk-button uk-button-success new-project' style='margin: 15px;'><i class='fa fa-plus'></i> Create My First Project</a>" +
                                      "<a href='#importProject' data-uk-modal class='uk-button uk-button-success'><i class='fa fa-download'></i> Import Existing Project</a>"
                },
                "aLengthMenu":    [[5, 10, 50, 100, -1], [5, 10, 50, 100, "All"]],
                "aaSorting":      [[0, 'desc']],
                "aoColumns":      [
                    {
                        "sClass":    "text-left",
                        "bSortable": true,
                        "mData":     "id",
                        "mRender":   function (data, type, row) {
                            return data;
                        }
                    },
                    {
                        "sClass":    "text-left",
                        "bSortable": true,
                        "mData":     "project_name",
                        "mRender":   function (data, type, row) {
                            return "<i title='Rename Project' class='fa fa-edit rename_project' data-id='" + row.id + "' data-name='" + data + "'></i> <b>" + data + "</b>";
                        }
                    },
                    {
                        "sClass":    "text-left",
                        "bSortable": true,
                        "mData":     "date_created",
                        "mRender":   function (data, type, row) {
                            return new Date(data).toDateString();
                        }
                    },
                    {
                        "sClass":    "text-left",
                        "bSortable": false,
                        "mRender":   function (data, type, row) {
                            let buttons = '<button data-name="' + row.project_name + '" data-id="' + row.id + '" title="Load this project" type="button" class="uk-button uk-button-primary load_project"><i class="fa fa-upload"></i> Load</button> ';
                            buttons += '<button data-id="' + row.id + '" title="Export this project" type="button" class="uk-button uk-button-success export_project"><i class="fa fa-download"></i> Export</button> ';
                            buttons += '<button data-id="' + row.id + '" title="Remove this project permanently" type="button" class="uk-button uk-button-danger remove_project"><i class="fa fa-trash-o"></i> Remove</button> ';
                            return buttons;
                        }
                    }
                ],
                "fnServerParams": function (aoData) {
                    aoData.push({
                        name:  'action',
                        value: 'prs_get_projects'
                    });
                },

            });
        },

        /*Export Import Projects*/
        exportProject:        function () {
            $(document).on('click', '.export_project', function () {
                let project_id = $(this).attr('data-id');
                window.location = prs_data.wp_post + '?action=prs_export_project&project_id=' + project_id;
            })
        },
        importProject:        function () {
            $('#importProject').uploader(
                'action=prs_import_project',
                'csv',
                actions.loadProjects
            );
        },
        importKeywordPlanner: function () {
            $('#importKeywordPlanner').uploader(
                'action=prs_import_keyword_planner&project=' + currentProjectID,
                'csv',
                actions.loadProjectManually
            );
        },
        createPagePostMulti:  function () {
            $(document).on('click', '.createPagesPosts', function (e) {
                e.preventDefault();

                let table = $('.pagePostAllTableTemplate.uk-hidden').clone().removeClass('uk-hidden');
                let tr = table.find('.tr_template');
                let body = table.find('.body_template').html('');

                table.find('.body_template').html('');
                $('.project-groups .updateGroup').each(function () {

                    let group_name = $(this).find('input[name="group_name"]').val();
                    let group_id = $(this).find('input[name="group_id"]').val();
                    tr.find('.group_name').html(group_name).attr('data-id', group_id);
                    body.append('<tr>' + tr.html() + '</tr>');

                });

                let mod = $('#pagePostMulti');
                mod.find('.table_holder_all').html(table);
                UIkit.modal(mod, {bgclose: false, keyboard: false}).show();
            });

            $(document).on('click', '.pagePostMultiBtn', function (e) {
                e.preventDefault();

                let form = $(this).parents('#pagePostMulti');
                let table = form.find('.pagePostAllTableTemplate');
                let tr = table.find('.body_template tr');

                table.find('.createMultiResults').html('<i class="fa fa-gear fa-spin fa-2x"></i>');

                tr.each(function () {
                    let current_tr = $(this);

                    let group_id = current_tr.find('.group_name').attr('data-id');
                    let type = current_tr.find('button[aria-checked="true"]').attr('data-type');

                    let data = {
                        action:   'prs_create_page_post',
                        group_id: group_id,
                        type:     type
                    };

                    $.ajaxq("pagePostMulti", {
                        url:     prs_data.wp_post,
                        type:    'post',
                        data:    data,
                        cache:   false,
                        success: function (d) {

                            // let group_id = d.group_id;

                            let icon = '';
                            let info_class = '';
                            if (d.status == 'error') {
                                icon = '<i class="fa fa-warning uk-text-warning"></i>';
                                info_class = 'tr_danger';
                            }

                            let url = '';
                            if (d.status == 'success') {
                                icon = '<i class="fa fa-check uk-text-success"></i>';
                                url = '<br><a href="' + d.data + '" target="_blank">' + d.data + '</a>';
                                info_class = 'tr_check';
                            }
                            if (d.status == 'warning') {
                                icon = '<i class="fa fa-warning uk-text-warning"></i>';
                                url = '<br><a href="' + d.data + '" target="_blank">' + d.data + '</a>';
                                info_class = 'tr_danger';
                            }

                            $('td[data-id="' + group_id + '"]').parents('tr').addClass(info_class).find('.createMultiResults').html(icon + ' ' + d.message + url);
                        }
                    });
                });
            });

            $(document).on('click', 'div[data-uk-button-radio] button[aria-checked]', function (e) {
                e.preventDefault();
            });
        },
        calculateAndTrim:     function (t) {
            let words_split = [];
            for (let i = 0; i < t.length; i++) {
                words_split.push(t[i].split(' '));
            }
            words_split = [].concat.apply([], words_split);
            let words = [];

            for (let i = 0; i < words_split.length; i++) {
                let check = 0;
                let final = {
                    text:     '',
                    weight:   0,
                    html:     {
                        title:             0,
                        'data-uk-tooltip': ''
                    },
                    handlers: {
                        click: function (e) {
                            $(this).parents('.uk-panel-box').children('.updateKeywords').find('.keywordInput[data-target="keyword"]').unhighlight().highlight($(this).text());
                            $(this).parents('.cloud.template.seen.jqcloud').children('span').removeClass('highlightWordInCloud');
                            $(this).addClass('highlightWordInCloud');
                        }
                    }
                };
                for (let j = 0; j < words.length; j++) {
                    if (words_split[i] == words[j].text) {
                        check = 1;
                        ++words[j].weight;
                        ++words[j].html.title;
                    }
                }
                if (check == 0) {
                    final.text = words_split[i];
                    final.weight = 1;
                    final.html.title = 1;
                    words.push(final);
                }
                check = 0;
            }

            return words;
        },
        formatSEO:            function (t) {
            $(document).on('change', '.prs-title', function (e) {
                $(this).prev('input').val($(this).text());

                let wordCount = $(this).html().replace(/\&nbsp\;/g, ' ').replace(/\s+/g, ' ').trim().length;

                if (wordCount > 70) {
                    $(this).parents('td').find('.count-seo-title').html('<span style="color:red">' + wordCount + '</span>');
                } else {
                    $(this).parents('td').find('.count-seo-title').html(wordCount);
                }

                if (wordCount > 78) {
                    $(this).parents('td').find('.count-seo-title-mobile').html('<span style="color:red">' + wordCount + '</span>');
                } else {
                    $(this).parents('td').find('.count-seo-title-mobile').html(wordCount);
                }

            });

            $(document).on('change', '.prs-description', function (e) {
                $(this).prev('input').val($(this).text());

                let wordCount = $(this).html().replace(/\&nbsp\;/g, ' ').replace(/\s+/g, ' ').trim().length;

                if (wordCount > 300) {
                    $(this).parents('td').find('.count-seo-description').html('<span style="color:red">' + wordCount + '</span>');
                } else {
                    $(this).parents('td').find('.count-seo-description').html(wordCount);
                }

                if (wordCount > 120) {
                    $(this).parents('td').find('.count-seo-description-mobile').html('<span style="color:red">' + wordCount + '</span>');
                } else {
                    $(this).parents('td').find('.count-seo-description-mobile').html(wordCount);
                }
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

        getOperatorData: function ($element) {

            let data = {
                properties: {
                    title:   $element.data('text'),
                    inputs:  {},
                    outputs: {}
                }
            };

            let type = $element.data('type');

            if (type == 'page') {
                data.properties.inputs['ins'] = {
                    label:    'Child',
                    multiple: true
                };
                data.properties.outputs['output_1'] = {
                    label: 'Parent'
                };
            } else if (type == 'post') {
                data.properties.outputs['outs'] = {
                    label:    'Parent',
                    multiple: true
                };
            } else if (type == 'tag') {
                data.properties.inputs['ins'] = {
                    label:    'Post',
                    multiple: true
                };
            } else if (type == 'category') {
                data.properties.inputs['ins'] = {
                    label:    'Post',
                    multiple: true
                };
            }

            let uniqueID = ' op-' + type + '-' + $element.data('id');
            data.properties.class = 'operator-' + type + uniqueID;
            data.properties.ID = uniqueID;
            data.properties.realID = $element.data('id');

            return data;
        },

        createSilo: function (element) {

            let $flowchart = $(element);
            let $container = $flowchart.parent();

            // Panzoom initialization...
            $flowchart.panzoom();

            // Panzoom zoom handling...
            let possibleZooms = [0,0.5,1];
            let currentZoom = 1;

            $container.on('mousewheel.focal', function (e) {
                e.preventDefault();
                let delta = (e.delta || e.originalEvent.wheelDelta) || e.originalEvent.detail;
                let zoomOut = !(delta ? delta < 0 : e.originalEvent.deltaY > 0); // natural scroll direciton
                currentZoom = Math.max(0, Math.min(possibleZooms.length - 1, (currentZoom + (zoomOut * 2 - 1))));
                $flowchart.flowchart('setPositionRatio', possibleZooms[currentZoom]);
                $flowchart.panzoom('zoom', possibleZooms[currentZoom], {
                    animate: false,
                    focal:   e
                });

            });

            // Apply the plugin on a standard, empty div...
            $flowchart.flowchart({
                defaultLinkColor: '#559acc',
                onOperatorCreate: function(operatorId, operatorData, fullElement){

                    let uniqueID = '.' + operatorData.properties.ID.trim();
                    let flowchart = actions.siloGetFlowchart();
                    if (flowchart.find(uniqueID).length > 0) {
                        UIkit.notify("<i class='fa fa-warning'></i> Invalid operation, element is already added to the Silo.", {
                            pos:    'bottom-right',
                            status: "warning"
                        });
                        return false;
                    }

                    return true;
                }
            });

        },

        redrawLinks: function() {
            $('.silo.pages').flowchart('redrawLinksLayer');
            $('.silo.posts').flowchart('redrawLinksLayer');
        },

        initSilo: function () {
            if (siloInitialized) return;
            siloInitialized = true;

            actions.loadSiloPagesPosts();
            actions.addToSilo();

            actions.loadTagsCategoriesSilo();

            actions.createSilo('.silo.pages');
            actions.createSilo('.silo.posts')

            actions.loadSilo();

            $(document).on('click', '.uk-tab > li > a', function(e){
                e.preventDefault();
                actions.redrawLinks();
            });
        },

        loadSilo: function(){
            $.post(prs_data.wp_post, 'action=prs_load_silo', function(d) {
                $('.silo.pages').flowchart('setData', JSON.parse(d.data.pages));
                $('.silo.posts').flowchart('setData', JSON.parse(d.data.posts));
            });
        },

        loadTagsCategoriesSilo: function() {
            $.post(prs_data.wp_post, 'action=prs_get_tags_categories', function(d){
                let cats = $('.silo-category');
                let tags = $('.silo-tag');

                cats.empty();
                tags.empty();

                for (let i = 0; i < d.data.tags.length; i++) {
                    let tag = d.data.tags[i];
                    tags.append('<div class="draggable_operator" data-id="' + tag.name + '" data-type="tag" data-text="' + tag.name + '">' + tag.name + '</div>');
                }

                for (let i = 0; i < d.data.categories.length; i++) {
                    let cat = d.data.categories[i];
                    cats.append('<div class="draggable_operator" data-id="' + cat.term_id + '" data-type="category" data-text="' + cat.name + '">' + cat.name + '</div>');
                }

                actions.initDrag($('.draggable_operator'));

            });
        },

        addToSilo: function() {
            $(document).on('click', '.silo-add', function(e){
                e.preventDefault();

                let $element = $(this);

                let data = {
                    properties: {
                        title:   $element.data('text'),
                        inputs:  {},
                        outputs: {}
                    }
                };

                let type = $element.data('type');

                if (type == 'page') {
                    data.properties.inputs['ins'] = {
                        label:    'Child',
                        multiple: true
                    };
                    data.properties.outputs['output_1'] = {
                        label: 'Parent'
                    };
                } else if (type == 'post') {
                    data.properties.outputs['outs'] = {
                        label:    'Parent',
                        multiple: true
                    };
                }

                let uniqueID = ' op-' + type + '-' + $element.data('id');
                data.properties.class = 'operator-' + type + uniqueID;
                data.properties.ID = uniqueID;
                data.properties.realID = $element.data('id');


                $('.silo.' + type + 's').flowchart('addOperator', data);
            });
        },

        siloGetFlowchart: function(elements) {
            if (typeof elements != 'undefined') {
                return elements.parents('.tab').find('.silo');
            } else {
                let pages = $('.silo.pages');
                let posts = $('.silo.posts');
                if (pages.is(':visible')) {
                    return pages;
                } else {
                    return posts;
                }
            }
        },

        removeSilo: function () {
            $(document).on('click', '.silo-remove', function(e){
                e.preventDefault();

                let $flowchart = actions.siloGetFlowchart();
                $flowchart.flowchart('deleteSelected');

            });

            document.addEventListener('keydown', function(event) {
                const key = event.key; // const {key} = event; ES6+
                if (key === "Delete") {
                    let $flowchart = actions.siloGetFlowchart();
                    $flowchart.flowchart('deleteSelected');
                }
            });
        },

        initDrag: function(elements){

            let $flowchart = actions.siloGetFlowchart(elements);
            let $container = $flowchart.parent();

            elements.draggable({
                cursor:  "move",
                opacity: 0.7,

                appendTo: 'body',
                zIndex:   1000,

                helper: function (e) {
                    let $this = $(this);
                    let data = actions.getOperatorData($this);
                    return $flowchart.flowchart('getOperatorElement', data);
                },
                stop:   function (e, ui) {
                    let $this = $(this);
                    let elOffset = ui.offset;
                    let containerOffset = $container.offset();
                    if (elOffset.left > containerOffset.left &&
                        elOffset.top > containerOffset.top &&
                        elOffset.left < containerOffset.left + $container.width() &&
                        elOffset.top < containerOffset.top + $container.height()) {

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

        loadSiloPagesPosts:      function () {

            $('.siloPagesTable').dataTable({
                language:         {
                    search:            "_INPUT_",
                    searchPlaceholder: "Search pages...",
                    processing:        "Loading Pages...",
                    emptyTable:        "No pages found on this website.",
                    info:              "_START_ to _END_ of _TOTAL_ pages",
                    infoEmpty:         "0 to 0 of 0 pages",
                    infoFiltered:      "(from _MAX_ total pages)"
                },
                "dom":            '<fl>rt<ip>',
                "bDestroy":       true,
                "searchDelay":    350,
                "bPaginate":      true,
                "bAutoWidth":     false,
                "bFilter":        true,
                "bProcessing":    true,
                "sServerMethod":  "POST",
                "bServerSide":    true,
                "sAjaxSource":    prs_data.wp_post,
                "iDisplayLength": 5,
                "aLengthMenu":    [[5, 10, 50, 100], [5, 10, 50, 100]],
                "aaSorting":      [[1, 'desc']],
                "aoColumns":      [
                    {
                        "sClass":    "text-left",
                        "bSortable": true,
                        "mData":     'post_title',
                        "mRender":   function (data, type, row) {
                            return "<b class='post-title'>" + data + "</b>"
                                + "<div class='row-actions'>"

                                + "<a href='" + row.guid + "' target='_blank' class='view'><i class='fa fa-search'></i></a>"

                                + " <span>|</span> "

                                + "<a href='" + prs_data.wp_admin + 'post.php?post=' + row.ID + '&action=edit' + "' target='_blank' class='edit'><i class='fa fa-edit'></i></a>"

                                + " <span>|</span> "

                                + "<a href='#' class='silo-add' data-id='" + row.ID + "' data-text='" + data + "' data-type='page'><i class='fa fa-arrows'></i> Add</a>"

                                + "</div>";
                        },
                        "asSorting": ["desc", "asc"]
                    },
                    {
                        "bSortable": true,
                        "mData":     'post_date',
                        "mRender":   function (data, type, row) {
                            return '<b>' + row.post_status.charAt(0).toUpperCase() + row.post_status.slice(1) + 'ed</b>'
                                + '<br>'
                                + '<abbr title="' + data + '">' + new Date(data).toUTCString().split(' ').splice(0, 4).join(' ') + '</abbr>';
                        },
                        "asSorting": ["desc", "asc"]
                    }
                ],
                "fnServerParams": function (aoData) {

                    aoData.push({
                        name:  'action',
                        value: 'prs_get_posts'
                    });

                    aoData.push({
                        name:  'PostsType',
                        value: 'page'
                    });
                },

                "fnDrawCallback": function( oSettings ) {
                    actions.initDrag($(this).find('tr.draggable-row'));
                },

                "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                    $(nRow).addClass('draggable-row')
                        .attr('data-type', 'page')
                        .attr('data-text', aData.post_title)
                        .attr('data-id', aData.ID);
                }



            });
            $('.siloPostsTable').dataTable({
                language:         {
                    search:            "_INPUT_",
                    searchPlaceholder: "Search posts...",
                    processing:        "Loading Posts...",
                    emptyTable:        "No posts found on this website.",
                    info:              "_START_ to _END_ of _TOTAL_ posts",
                    infoEmpty:         "0 to 0 of 0 posts",
                    infoFiltered:      "(from _MAX_ total posts)"
                },
                "dom":            '<fl>rt<ip>',
                "bDestroy":       true,
                "searchDelay":    350,
                "bPaginate":      true,
                "bAutoWidth":     false,
                "bFilter":        true,
                "bProcessing":    true,
                "sServerMethod":  "POST",
                "bServerSide":    true,
                "sAjaxSource":    prs_data.wp_post,
                "iDisplayLength": 5,
                "aLengthMenu":    [[5, 10, 50, 100], [5, 10, 50, 100]],
                "aaSorting":      [[1, 'desc']],
                "aoColumns":      [
                    {
                        "sClass":    "text-left",
                        "bSortable": true,
                        "mData":     'post_title',
                        "mRender":   function (data, type, row) {
                            return "<b class='post-title'>" + data + "</b>"
                                + "<div class='row-actions'>"

                                + "<a href='" + row.guid + "' target='_blank' class='view'><i class='fa fa-search'></i></a>"

                                + " <span>|</span> "

                                + "<a href='" + prs_data.wp_admin + 'post.php?post=' + row.ID + '&action=edit' + "' target='_blank' class='edit'><i class='fa fa-edit'></i></a>"

                                + " <span>|</span> "

                                + "<a href='#' class='silo-add' data-id='" + row.ID + "' data-text='" + data + "' data-type='post'><i class='fa fa-arrows'></i> Add</a>"

                                + "</div>";
                        },
                        "asSorting": ["desc", "asc"]
                    },
                    {
                        "bSortable": true,
                        "mData":     'post_date',
                        "mRender":   function (data, type, row) {
                            return '<b>' + row.post_status.charAt(0).toUpperCase() + row.post_status.slice(1) + 'ed</b>'
                                + '<br>'
                                + '<abbr title="' + data + '">' + new Date(data).toUTCString().split(' ').splice(0, 4).join(' ') + '</abbr>';
                        },
                        "asSorting": ["desc", "asc"]
                    }
                ],
                "fnServerParams": function (aoData) {

                    aoData.push({
                        name:  'action',
                        value: 'prs_get_posts'
                    });


                    aoData.push({
                        name:  'PostsType',
                        value: 'post'
                    });

                },

                "fnDrawCallback": function( oSettings ) {
                    actions.initDrag($(this).find('tr.draggable-row'));
                },

                "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                    $(nRow).addClass('draggable-row')
                        .attr('data-type', 'post')
                        .attr('data-text', aData.post_title)
                        .attr('data-id', aData.ID);
                }

            });

        },

        // Save Silo functionality
        saveSilo:   function () {
            $(document).on('click', '.silo-save', function (e) {
                e.preventDefault();

                let silo_pages = $('.silo.pages').flowchart('getData');
                let silo_posts = $('.silo.posts').flowchart('getData');

                $.post(prs_data.wp_post, {action: 'prs_save_silo', pages: JSON.stringify(silo_pages), posts: JSON.stringify(silo_posts)}, function (d) {
                    if (d.status == 'success') {
                        UIkit.notify("<i class='fa fa-info-circle'></i> Silo Builder has been successfully saved.", {
                            pos:    'bottom-right',
                            status: "primary"
                        });
                    }
                });


            });
        }

    };

})(jQuery);
