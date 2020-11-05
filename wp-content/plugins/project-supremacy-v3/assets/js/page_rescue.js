(function( $ ) {
    'use strict';

    $(document).ready(function(){

        coreRescue.closeRescue();
        coreRescue.beginRescue();
        coreRescue.downloadCoreFiles();
        coreRescue.previewCoreFiles();
        coreRescue.startCoreRescue();
        coreRescue.removeOldFiles();

        pluginsThemesRescue.scanForPluginsThemes();
        pluginsThemesRescue.uninstallPluginTheme();
        pluginsThemesRescue.normalRescuePluginTheme();
        pluginsThemesRescue.uploadRescuePluginTheme();

        uploadsRescue.scanUploads();
        uploadsRescue.removeSingle();
        uploadsRescue.removeSelected();

        clone.clone();
    });

    let clone = {

        prefix       : null,
        backup_path  : null,
        backup_name  : null,
        api_key      : null,
        admin_post   : null,
        current_step : 0,
        steps: [
            // Obtain API key
            function() {
                let status = $('.api-key');

                clone.change_status(status, 'running', false);

                $.post(prs_data.wp_post, 'action=prs_obtain_api_key&url=' + clone.admin_post, function(d){

                    if (d.status == 'error') {

                        clone.change_status(status, 'failed', false);
                        UIkit.modal.alert(d.message);

                    } else {

                        clone.api_key = d.data;
                        clone.change_status(status, 'success', false);
                        clone.current_step++;
                        clone.steps[clone.current_step]();

                    }

                });

            },
            // Create copy of Remote Website
            function() {
                let status = $('.creating-copy');

                clone.change_status(status, 'running', false);

                $.post(prs_data.wp_post, 'action=prs_create_clone_backup&url=' + clone.admin_post + '&key=' + clone.api_key, function(d){

                    if (d.status == 'error') {

                        clone.change_status(status, 'failed', false);
                        UIkit.modal.alert(d.message);

                    } else {

                        clone.backup_name = d.data;
                        clone.change_status(status, 'success', false);
                        clone.current_step++;
                        clone.steps[clone.current_step]();

                    }

                });

            },
            // Download copy of Remote Website
            function() {
                let status = $('.downloading-copy');

                clone.change_status(status, 'running', false);

                $.post(prs_data.wp_post, 'action=prs_download_clone_backup&backup=' + clone.backup_name, function(d){

                    if (d.status == 'error') {

                        clone.change_status(status, 'failed', false);
                        UIkit.modal.alert(d.message);

                    } else {

                        $.post(prs_data.wp_post, 'action=prs_remove_clone_backup&url=' + clone.admin_post + '&key=' + clone.api_key + '&backup=' + clone.backup_name, function(d){});

                        clone.backup_path = d.data.extDir;
                        clone.prefix      = d.data.prefix;
                        clone.change_status(status, 'success', false);
                        clone.current_step++;
                        clone.steps[clone.current_step]();

                    }

                });

            },
            // Extract Files & Merge Database
            function() {

                let status = $('.extracting-files-merging-databases');

                clone.change_status(status, 'running', false);

                $.post(prs_data.wp_post, 'action=prs_extract_merge_clone&backup_path=' + clone.backup_path + '&url=' + clone.admin_post + '&prefix=' + clone.prefix, function(d){

                    if (d.status == 'error') {

                        clone.change_status(status, 'failed', false);
                        UIkit.modal.alert(d.message);

                    } else {

                        clone.change_status(status, 'success', false);
                        clone.current_step++;
                        clone.steps[clone.current_step]();

                    }

                });

            },
            // Finish Cloning
            function() {
                let status = $('.finishing-cloning');

                clone.change_status(status, 'running', false);

                setTimeout(function(){

                    clone.change_status(status, 'success', false);
                    UIkit.modal.alert('Cloning is completed. Refreshing the page so you can log in back to your website again.');

                    setTimeout(function(){
                        document.location.reload();
                    }, 2000);

                }, 3000);

            }
        ],

        change_status: function (element, type) {

            let icon = element.find('i');
            element.removeClass('failed').removeClass('success').removeClass('running');

            if (type !== 'original') {

                if (!icon[0].hasAttribute('original-icon')) {
                    icon.attr('original-icon', icon.attr('class'));
                }

                element.addClass(type);
                if (type == 'running') {
                    icon.attr('class', 'fa fa-refresh fa-spin');
                } else if (type == 'failed') {
                    icon.attr('class', 'fa fa-close');
                } else if (type == 'success') {
                    icon.attr('class', 'fa fa-check');
                }

            } else {

                icon.attr('class', icon.attr('original-icon'));

            }

        },

        clone: function(){

            $(document).on('click', '.clone-button', function(e){
                e.preventDefault();

                let cbtn = $('.clone-button');
                let btn  = $('.verify-button');
                cbtn.disable('Clonning...');
                btn.attr('disabled', 'disabled');

                clone.steps[clone.current_step]();

            });

            $(document).on('submit', '.verify', function(e){
                e.preventDefault();

                let btn  = $('.verify-button');
                let cbtn = $('.clone-button');
                let url  = $('.clone-url');

                cbtn.attr('disabled', 'disabled');
                url.removeClass('uk-form-success').removeClass('uk-form-danger');

                if (clone.admin_post != null) {
                    url.removeAttr('disabled');
                    btn.removeClass('uk-button-danger').addClass('uk-button-success');
                    btn.html('<i class="fa fa-plug"></i> Verify Connection');
                    clone.admin_post = null;
                    return;
                }

                btn.disable('Verifying...');

                $.post(prs_data.wp_post, $(this).serialize(), function(d){

                    btn.disable();

                    if (d.status == 'success') {

                        cbtn.removeAttr('disabled');
                        url.addClass('uk-form-success');
                        clone.admin_post = d.data;
                        btn.removeClass('uk-button-success').addClass('uk-button-danger');
                        btn.html('<i class="fa fa-close"></i> Cancel');
                        url.attr('disabled', 'disabled');

                    } else {
                        url.addClass('uk-form-danger');
                        UIkit.modal.alert(d.message);
                    }

                });

            });

        },

    };

    let uploadsRescue = {
        removeSelected: function(){
            $(document).on('click', '.rescue-uploads-remove-selected', function(e){
                e.preventDefault();

                UIkit.modal.confirm("Are you sure that you want to remove <b>all selected files</b>?", function() {

                    let files = [];
                    let lis   = [];
                    $('.rescue-uploads-select:checked').each(function(){

                        let li   = $(this).parents('li');
                        let path = li.data('path');

                        files.push(path);
                        lis.push(li);
                    });

                    if (files.length < 1) {
                        UIkit.modal.alert("You must select some files first!");
                        return;
                    }

                    let data = {
                        action: 'prs_remove_uploads',
                        files: files
                    };

                    $.post(prs_data.wp_post, data, function(d){

                        UIkit.modal.alert("Files successfully removed.");

                        for (let i = 0; i < lis.length; i++) {
                            let li = lis[i];
                            li.remove();
                        }

                        uploadsRescue.checkIfRemainingUploads();

                    });

                });

            });
        },
        removeSingle: function(){
            $(document).on('click', '.rescue-uploads-remove', function(e){
                e.preventDefault();

                let li   = $(this).parents('li');
                let path = li.data('path');

                UIkit.modal.confirm("Are you sure that you want to remove file <br> <b>" + path + "</b> ?", function(){

                    let data = {
                        action: 'prs_remove_uploads',
                        files: [path]
                    };

                    $.post(prs_data.wp_post, data, function(d){

                        UIkit.modal.alert("File successfully removed.");
                        li.remove();

                        uploadsRescue.checkIfRemainingUploads();

                    });

                });

            });
        },
        checkIfRemainingUploads: function(){

            let count = $('.rescue-uploads-files > li').length;

            console.log(count);

            if (count < 1) {

                actions.hide('.rescue-uploads-files');
                actions.hide('.rescue-uploads-remove-selected');

                let alert = $('.rescue-uploads-alert');

                alert.find('h2').html("You've removed all suspicious files!");
                alert.find('p').html("Good job! No more suspicious files remaining. Your uploads directory is now safe.");
                alert.removeClass('uk-alert-danger').addClass('uk-alert-success');

            }

        },
        scanUploads: function(){
            $(document).on('click', '.rescue-scan-uploads', function(e){
                e.preventDefault();

                let btn = $(this);
                btn.disable();

                let data = {
                    action: 'prs_scan_uploads'
                };

                $.post(prs_data.wp_post, data, function(d){
                    btn.disable();

                    btn.addClass('uk-hidden');

                    let alert = $('.rescue-uploads-alert');
                    alert.removeClass('uk-hidden');

                    if (Object.keys(d.data).length < 1) {

                        alert.addClass('uk-alert-success');
                        alert.find('h2').html('Good news!');
                        alert.find('p').html('We didn\'t find any suspicious files or folders inside of your Uploads directory. To manage your existing uploads, head over to Media Library.');

                    } else {

                        actions.show('.rescue-uploads-remove-selected');

                        alert.addClass('uk-alert-danger');
                        alert.find('h2').html('We found some suspicious files!');
                        alert.find('p').html('Check the list of files below this notification. These files are potentially suspicious and should be further examined / removed.');

                        let container = $('.rescue-uploads-files');
                        container.empty();

                        container.removeClass('uk-hidden');

                        let very_dangerous = [];
                        let dangerous = [];
                        let suspicious = [];

                        for(let file in d.data) {
                            let data = d.data[file];
                            let path = data.path;
                            let ext  = file.split('.')[1];
                            let id   = actions.generateID();

                            let severityClass = 'suspicious';
                            let severity      = 'Suspicious';

                            if (ext === 'php' || ext === 'vba' || ext === 'vbs') {
                                severityClass = 'very-dangerous';
                                severity      = 'VERY DANGEROUS';

                                very_dangerous.push(`<li class="${severityClass}" data-path="${path}"> <input type="checkbox" class="rescue-uploads-select" id="${id}"/> <label for="${id}">${file}</label> <div class="rescue-uploads-row-actions"> <label class="rescue-uploads-severity">${severity}</label> <button class="uk-button uk-button-small uk-button-danger rescue-uploads-remove"><i class="fa fa-trash-o"></i> Remove</button> </div> </li>`);

                            } else if (ext === 'exe' || ext === 'dmg' || ext === 'js') {
                                severityClass = 'dangerous';
                                severity      = 'Dangerous';

                                dangerous.push(`<li class="${severityClass}" data-path="${path}"> <input type="checkbox" class="rescue-uploads-select" id="${id}"/> <label for="${id}">${file}</label> <div class="rescue-uploads-row-actions"> <label class="rescue-uploads-severity">${severity}</label> <button class="uk-button uk-button-small uk-button-danger rescue-uploads-remove"><i class="fa fa-trash-o"></i> Remove</button> </div> </li>`);

                            } else {

                                suspicious.push(`<li class="${severityClass}" data-path="${path}"> <input type="checkbox" class="rescue-uploads-select" id="${id}"/> <label for="${id}">${file}</label> <div class="rescue-uploads-row-actions"> <label class="rescue-uploads-severity">${severity}</label> <button class="uk-button uk-button-small uk-button-danger rescue-uploads-remove"><i class="fa fa-trash-o"></i> Remove</button> </div> </li>`);

                            }
                        }

                        container.append(very_dangerous);
                        container.append(dangerous);
                        container.append(suspicious);

                    }

                });

            });
        }
    };

    let pluginsThemesRescue = {
        uploadRescuePluginTheme: function(){
            $(document).on('change', '.plugin-theme-upload', function(e){

                let c = $(this).parents('.rescue-plugin-theme-template');
                let name     = c.find('.rescue-name').text();
                let type     = c.data('type');
                let slug     = c.data('slug');
                let $this    = this;

                UIkit.modal.confirm("Are you sure that you want to rescue "+type+" "+name+"?", function(){

                    let file = $this.files[0];
                    let upload = new Upload(file);

                    let fileType = upload.getType();

                    if (fileType !== 'application/zip') {
                        UIkit.modal.alert("Invalid file type supplied! You are allowed to upload only ZIP files.");
                        return;
                    }

                    // execute upload
                    upload.doUpload(type, slug, c);

                });

            });
        },
        normalRescuePluginTheme: function(){
            $(document).on('click', '.begin-plugin-theme-rescue', function(e){
                e.preventDefault();

                let c = $(this).parents('.rescue-plugin-theme-template');
                let name     = c.find('.rescue-name').text();
                let type     = c.data('type');
                let slug     = c.data('slug');
                let download = c.data('download');

                UIkit.modal.confirm("Are you sure that you want to rescue "+type+" "+name+"?", function(){

                    c.find('.rescue-plugin-theme-buttons').addClass('uk-hidden');
                    c.find('.rescue-plugin-theme-progress').removeClass('uk-hidden');

                    let data = {
                        action: 'prs_normal_rescue_plugin_theme',
                        type: type,
                        slug: slug,
                        download: download
                    };

                    $.post(prs_data.wp_post, data, function(d){

                        c.find('.rescue-plugin-theme-progress').addClass('uk-hidden');
                        c.find('.rescue-plugin-theme-alert').removeClass('uk-hidden');

                        let alert = c.find('.rescue-plugin-theme-alert');

                        alert.html(d.message);

                        if (d.status === 'success') {
                            alert.addClass('uk-alert-success');
                        } else {
                            alert.addClass('uk-alert-danger');
                        }

                    });

                });

            });
        },
        scanForPluginsThemes: function(){
            $(document).on('click', '.rescue-scan-plugins-themes', function(e){
                e.preventDefault();

                let btn = $(this);
                btn.disable('Scanning for installed Plugins & Themes...');

                $.post(prs_data.wp_post, 'action=prs_scan_plugins_themes', function(d){

                    btn.disable();

                    if (d.status !== 'success') {
                        UIkit.notify('Failed to retrieve plugins and themes. Please try again later.', {pos:'bottom-right', status: 'error'});
                    } else {

                        actions.hide('.rescue-scan-plugins-themes');
                        actions.show('.rescue-plugins-themes-list');

                        let rowTemplate     = $('.rescue-plugin-theme-template.uk-hidden');
                        let emptyTemplate   = '<p class="rescue-plugin-theme-no-results">Nothing has been found here.</p>';

                        let foundPlugins = d.data.plugins.found;
                        let foundPluginsContainer = $('.rescue-found-plugins');

                        let foundThemes  = d.data.themes.found;
                        let foundThemesContainer = $('.rescue-found-themes');

                        let missingPlugins = d.data.plugins.missing;
                        let missingPluginsContainer = $('.rescue-missing-plugins');

                        let missingThemes  = d.data.themes.missing;
                        let missingThemesContainer = $('.rescue-missing-themes');

                        foundPluginsContainer.empty();
                        if (Object.keys(foundPlugins).length > 0) {
                            for (let slug in foundPlugins) {
                                let plugin    = foundPlugins[slug];
                                let template  = rowTemplate.clone();

                                template.removeClass('uk-hidden');

                                template.find('.rescue-name').html(plugin.Title);
                                template.find('.rescue-version').html('v' + plugin.Version);

                                template.attr('data-type', 'plugin');
                                template.attr('data-slug', slug);
                                template.attr('data-download', plugin.DownloadUrl);

                                template.find('.begin-plugin-theme-rescue').removeClass('uk-hidden');

                                template.find('.plugin-theme-upload').remove();

                                foundPluginsContainer.append(template);
                            }
                        } else {
                            foundPluginsContainer.append(emptyTemplate);
                        }

                        foundThemesContainer.empty();
                        if (Object.keys(foundThemes).length > 0) {
                            for (let slug in foundThemes) {
                                let theme    = foundThemes[slug];
                                let template  = rowTemplate.clone();

                                template.removeClass('uk-hidden');

                                template.find('.rescue-name').html(theme.Name);
                                template.find('.rescue-version').html('v' + theme.Version);

                                template.attr('data-type', 'theme');
                                template.attr('data-slug', slug);
                                template.attr('data-download', theme.DownloadUrl);

                                template.find('.begin-plugin-theme-rescue').removeClass('uk-hidden');

                                template.find('.plugin-theme-upload').remove();

                                foundThemesContainer.append(template);
                            }
                        } else {
                            foundThemesContainer.append(emptyTemplate);
                        }

                        missingPluginsContainer.empty();
                        if (Object.keys(missingPlugins).length > 0) {
                            for (let slug in missingPlugins) {
                                let plugin    = missingPlugins[slug];
                                let template  = rowTemplate.clone();

                                template.removeClass('uk-hidden');

                                template.find('.rescue-name').html(plugin.Title);
                                template.find('.rescue-version').html('v' + plugin.Version);

                                template.attr('data-type', 'plugin');
                                template.attr('data-slug', slug);

                                let randomID = actions.generateID();

                                template.find('.upload-plugin-theme-rescue').removeClass('uk-hidden');
                                template.find('.upload-plugin-theme-rescue').attr('for', randomID);
                                template.find('.plugin-theme-upload').attr('id', randomID);

                                missingPluginsContainer.append(template);
                            }
                        } else {
                            missingPluginsContainer.append(emptyTemplate);
                        }

                        missingThemesContainer.empty();
                        if (Object.keys(missingThemes).length > 0) {
                            for (let slug in missingThemes) {
                                let theme    = missingThemes[slug];
                                let template  = rowTemplate.clone();

                                template.removeClass('uk-hidden');

                                template.find('.rescue-name').html(theme.Name);
                                template.find('.rescue-version').html('v' + theme.Version);

                                template.attr('data-type', 'theme');
                                template.attr('data-slug', slug);

                                let randomID = actions.generateID();

                                template.find('.upload-plugin-theme-rescue').removeClass('uk-hidden');
                                template.find('.upload-plugin-theme-rescue').attr('for', randomID);
                                template.find('.plugin-theme-upload').attr('id', randomID);

                                missingThemesContainer.append(template);
                            }
                        } else {
                            missingThemesContainer.append(emptyTemplate);
                        }

                    }

                });

            });
        },
        uninstallPluginTheme: function(){
            $(document).on('click', '.remove-plugin-theme-rescue', function(e){
                e.preventDefault();

                let c = $(this).parents('.rescue-plugin-theme-template');
                let name = c.find('.rescue-name').text();
                let type = c.data('type');
                let slug = c.data('slug');

                UIkit.modal.confirm("Are you sure that you want to uninstall "+name+"?", function(){

                    let data = {
                        action: 'prs_uninstall_plugin_theme',
                        type: type,
                        slug: slug
                    };

                    $.post(prs_data.wp_post, data, function(d){

                        UIkit.notify(name + ' successfully uninstalled.', {pos:'bottom-right', status: 'info'});
                        c.fadeOut();

                    });

                });

            });
        },
    };

    let coreRescue = {
        removeOldFiles: function(){
            $(document).on('click', '.remove-old-core-files', function(e){
                e.preventDefault();

                    $.post(prs_data.wp_post, 'action=prs_remove_old_core', function(d){

                        UIkit.notify('Old WordPress core files successfully removed.', {pos:'bottom-right', status: 'error'});
                        $('.old-core-files-message').fadeOut();

                    });

            });
        },
        startCoreRescue: function(){

            $(document).on('click', '.start-core-rescue', function(e){
                e.preventDefault();

                let rescueType       = $('.rescue-core-type').text();
                let coreList         = $('#rescue-core-files-list');
                let filesData         = { filesToAdd : [], filesToDelete : [], filesToOverwrite: [] };

                if (rescueType === 'easy') {

                    coreList.find('[aria-selected="true"]').each(function(){

                        let item = $(this);
                        if (item.data('action') === 'delete') {
                            filesData.filesToDelete.push(item.data('path'));
                        } else if (item.data('action') === 'add') {
                            filesData.filesToAdd.push([item.data('newpath'), item.data('path')]);
                        } else {
                            filesData.filesToOverwrite.push([item.data('newpath'), item.data('path')]);
                        }

                    });

                } else if (rescueType === 'advanced') {

                    let items = coreList.jstree("get_selected", true);

                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];

                        if (item.data.action === 'delete') {
                            filesData.filesToDelete.push(item.data.path);
                        } else if (item.data.action === 'add') {
                            filesData.filesToAdd.push([item.data.newpath, item.data.path]);
                        } else {
                            filesData.filesToOverwrite.push([item.data.newpath, item.data.path]);
                        }

                    }

                }

                if (
                    filesData.filesToDelete.length === 0 &&
                    filesData.filesToOverwrite.length === 0 &&
                    filesData.filesToAdd.length === 0
                ) {
                    UIkit.notify('You must at least have one file selected to begin rescuing process.', {pos:'bottom-right', status: 'error'});
                    return;
                }

                actions.hide('.rescue-core-files');
                actions.show('.rescue-core-operation');
                actions.show('.rescue-core-progress');

                let ajaxData = {
                    action: 'prs_start_core_rescue',
                    files: JSON.stringify(filesData)
                };

                $.post(prs_data.wp_post, ajaxData, function(d){

                    actions.hide('.rescue-core-progress');

                    let message = actions.show('.rescue-core-message');

                    message.find('h2').html(d.status);
                    message.find('p').html(d.message);

                });

            });

        },
        previewCoreFiles: function(){
            $(document).on('click', '.preview-core-files', function(e){
                e.preventDefault();

                let btn = $(this);
                btn.disable('Loading...');

                let rescue_type = $('.rescue-core-type').text();

                $.post(prs_data.wp_post, 'action=prs_files_core&type=' + rescue_type, function(d){

                    btn.disable();

                    let files = $('#rescue-core-files-list');
                    files.jstree('destroy');
                    files.removeClass();
                    files.empty();
                    files.append('<ul></ul>');
                    let coreList = files.find('ul');

                    actions.hide('.rescue-core-download');
                    actions.show('.rescue-core-files');

                    if (d.status === 'success') {

                        if (rescue_type === 'advanced') {

                            let jsTree   = actions.buildJsTree(d.data);
                            coreList.append(jsTree);

                            files.jstree({
                                "checkbox" : {
                                    "keep_selected_style" : false
                                },
                                "types": {
                                    "folder": {
                                        "icon": "fa fa-folder"
                                    },
                                    "file": {
                                        "icon": "fa fa-file-code-o"
                                    },
                                    "image": {
                                        "icon": "fa fa-file-image-o"
                                    },
                                    "archive": {
                                        "icon": "fa fa-file-zip-o"
                                    },
                                    "executable": {
                                        "icon": "fa fa-warning"
                                    }
                                },
                                "plugins" : [ "checkbox", "types" ]
                            });

                        } else if (rescue_type === 'easy') {

                            let tree = actions.buildTree(d.data);
                            if (tree.length !== 0) {
                                files.addClass('easy-mode');
                                coreList.append(tree);
                            } else {
                                coreList.append('<li>There are no local WordPress core files that are different from the remote ones.</li>');
                            }

                        }


                    }


                });

            });
        },
        downloadCoreFiles: function(){
            $(document).on('click', '.select-core-version', function(e){
                e.preventDefault();

                let version = $('#rescue-core-version-value').val();

                actions.hide('.rescue-core-version');
                actions.show('.rescue-core-download');

                $.post(prs_data.wp_post, 'action=prs_download_core&version=' + version, function(d) {

                    actions.hide('.download-core-progress');
                    let message = actions.show('.download-core-message');

                    message.find('h2').html('Success!');
                    message.find('p').html(d.message);

                    if (d.status === 'success') {
                        actions.show('.preview-core-files');
                        message.removeClass('uk-alert-danger');
                    } else {
                        actions.show('.download-core-close');
                        message.addClass('uk-alert-danger');
                    }

                });

            });
        },
        closeRescue: function(){
            $(document).on('click', '.rescue-core-close', function(e){
                e.preventDefault();

                // Revert to default
                actions.hide('.rescue-container');
                actions.hide('.rescue-core-download');
                actions.hide('.download-core-close');
                actions.hide('.preview-core-files');
                actions.hide('.download-core-message');
                actions.hide('.rescue-core-files');
                actions.hide('.rescue-core-operation');
                actions.hide('.rescue-core-message');


                actions.show('.rescue-select-mode');
                actions.show('.download-core-progress');
                actions.show('.rescue-core-version');

            });
        },
        beginRescue: function(){
            $(document).on('click', '.begin-core-rescue', function(e){
                e.preventDefault();

                // Insert the current rescue type
                $('.rescue-core-type').html($(this).data('type'));

                // Change the view
                actions.hide('.rescue-select-mode');
                actions.show('.rescue-container');

                actions.show('.rescue-core-version');

            });
        }

    };

    let actions = {

        hide: function(what){
            what = $(what);
            what.addClass('uk-hidden');
            return what;
        },
        show: function(what){
            what = $(what);
            what.removeClass('uk-hidden');
            return what;
        },

        buildTree: function(children){

            let files   = [];

            for(let file in children) {
                let child = children[file];
                let new_path = '';
                if (child.action !== 'delete') {
                    new_path = "data-newpath='"+child.new_path+"'"
                }
                files.push( '<li data-action=\'' + child.action + '\' aria-selected="true" ' + new_path + ' data-path=\'' + child.path + '\'>' + file + '</li>' );

            }

            files.sort();

            return files;
        },

        buildJsTree: function(children){

            let folders = [];
            let files   = [];

            for(let file in children) {

                let child = children[file];
                if (child.hasOwnProperty("action")) {

                    let type = 'file';
                    let extension = file.split('.')[1];

                    if ($.inArray(extension, ['png', 'jpeg', 'jpg', 'gif']) !== -1) {
                        type = 'image';
                    }

                    if ($.inArray(extension, ['zip', 'rar', 'tar', 'tar.gz']) !== -1) {
                        type = 'archive';
                    }

                    if ($.inArray(extension, ['exe', 'sh', 'com', 'vba']) !== -1) {
                        type = 'executable';
                    }

                    let selected = '';
                    if (child.action !== 'overwrite') {
                        selected = ', "selected" : true';
                    }

                    let new_path = '';
                    if (child.action !== 'delete') {
                        new_path = "data-newpath='"+child.new_path+"'"
                    }

                    files.push( '<li data-action=\'' + child.action + '\' ' + new_path + ' data-path=\'' + child.path + '\' data-jstree=\'{ "type" : "' + type + '" ' + selected + ' }\'>' + file + '</li>' );

                } else {
                    folders.push( '<li data-jstree=\'{ "type" : "folder" }\'><span class="rescue-folder">' + file + '</span> <ul>' + actions.buildJsTree(child) + '</ul></li>' );
                }

            }

            folders.sort();
            files.sort();

            return folders + files;
        } ,

        generateID: function(){
            let text = "";
            let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (let i = 0; i < 5; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

    };

    let Upload = function (file) {
        this.file = file;
    };

    Upload.prototype.getType = function() {
        return this.file.type;
    };
    Upload.prototype.getName = function() {
        return this.file.name;
    };
    Upload.prototype.doUpload = function (type, slug, parent) {
        let formData = new FormData();

        formData.append("action", "prs_upload_rescue_plugin_theme");
        formData.append("file", this.file, this.getName());
        formData.append("type", type);
        formData.append("slug", slug);

        let buttons  = parent.find('.rescue-plugin-theme-buttons');
        let progress = parent.find('.rescue-plugin-theme-progress');
        let alert    = parent.find('.rescue-plugin-theme-alert');
        buttons.addClass('uk-hidden');
        progress.removeClass('uk-hidden');


        $.ajax({
            type: "POST",
            url: prs_data.wp_post,
            xhr: function () {
                let myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', function (event) {

                        let percent = 0;
                        let position = event.loaded || event.position;
                        let total = event.total;
                        if (event.lengthComputable) {
                            percent = Math.ceil(position / total * 100);
                        }

                        progress.find(".uk-progress-bar").css("width", + percent + "%");

                    }, false);
                }
                return myXhr;
            },
            success: function (data) {
                progress.addClass('uk-hidden');
                alert.removeClass('uk-hidden');
                alert.addClass('uk-alert-success');
                alert.html("Rescue operation completed successfully.");
            },
            error: function (error) {
                progress.addClass('uk-hidden');
                alert.removeClass('uk-hidden');
                alert.addClass('uk-alert-danger');
                alert.html("Failed to perform rescue operation, please try again later.");
            },
            async: true,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000
        });
    };

})( jQuery );


