var plugins,themes;
var timeout;

(function( $ ) {

    $(document).ready(function(){

        $(document).on('change', '#import_options', function (e) {
            e.preventDefault();
            clearTimeout(timeout);
            var form = $(this);

            var file_data = form.find("#import_options_file").prop("files")[0];
            var form_data = new FormData();
            form_data.append("import_options_file", file_data);

            $.ajax({
                url: prs_data.wp_post + '?action=prs_import_options',
                dataType: 'json',
                cache: false,
                contentType: false,
                processData: false,
                data: form_data,
                type: 'post',
                statusCode: {
                    200: function (data) {
                        UIkit.notify(data.message + ' Refreshing page in 3 sec...', {pos:'bottom-right', status:data.status});
                        timeout = setTimeout(function(){
                            location.reload();
                        }, 3000);
                    }
                }
            });

        });

        /**
         *  Action buttons
         */
        $(document).on('click', '.action-button', function(e){
            e.preventDefault();
            var button = $(this);
            var target = button.data('target');
            button.disable();
            $.post(prs_data.wp_post, 'action=' + target, function(d){
                button.disable();
                UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
            });
        });

        $(document).on('click', '.export_to_file', function(e){
            e.preventDefault();
            var button = $(this);
            var target = button.data('target');
            window.location = prs_data.wp_post + '?action='+target;
        });

        /**
         *  Check for updates
         */
        $(document).on('click', '.uk-button-check-updates', function(e){
            e.preventDefault();
            var button = $(this);
            button.disable('Checking ...');
            $.post(prs_data.wp_post, 'action=prs_check_updates', function(d){
                if (d.update === true) {
                    UIkit.modal.confirm("There is a new version of <b>Project Supremacy V3</b> – <b>"+d.remote_version+"</b>. Do you want to install this update now?", function(){
                        button.disable();
                        button.disable("Updating ...");

                        $.post(prs_data.wp_post, 'action=prs_run_updater', function(d){
                            button.disable();
                            UIkit.modal.alert(d.message);
                            setTimeout(function(){
                                document.location.reload();
                            }, 2000);
                        });

                    },function(){
                        button.disable();
                    });
                } else {
                    button.disable();
                    UIkit.modal.alert("Project Supremacy V3 is already on the latest version: <b>"+d.current_version+"</b>!");
                }
            });
        });

        /**
         *  Show changelog
         */
        $(document).on('click', '.uk-button-show-changelog', function(e){
            e.preventDefault();
            UIkit.modal("#changelog").show();
        });

        /**
         *  Migrate Yoast
         */
        $(document).on('click', '.migration-yoast', function(e){
            e.preventDefault();
            var btn = $(this);
            btn.disable('Working ...');
            $.post(prs_data.wp_post, 'action=prs_migrate_yoast', function(d){
                btn.disable();
                UIkit.notify("<i class='uk-icon-check'></i> Yoast data successfully migrated.", {pos:'bottom-right', status:"success"});
            });
        });

        /**
         *  Migrate AIO
         */
        $(document).on('click', '.migration-aio', function(e){
            e.preventDefault();
            var btn = $(this);
            btn.disable('Working ...');
            $.post(prs_data.wp_post, 'action=prs_migrate_aio', function(d){
                btn.disable();
                UIkit.notify("<i class='uk-icon-check'></i> AIO data successfully migrated.", {pos:'bottom-right', status:"success"});
            });
        });

        /**
         *  Activate block of elements on click
         */
        $('.uk-grid-buttons .uk-block-ps').click(function(){
            var target = $(this).attr('data-target');
            $('.uk-grid-buttons').fadeOut("slow", function() {
                $('#' + target).fadeIn("slow", function(){});
            });
        });
        /**
         *  Deactivate block of elements on back button click
         */
        $('.uk-button-back').click(function(){
            var target = $(this).parents('.uk-block-ps').attr('id');
            $('#' + target).fadeOut("slow", function() {
                $('.uk-grid-buttons').fadeIn("slow", function(){});
            });
        });
        /**
         *  Initiate TagsInput
         */
        themes  = $('#themes').tagsInput({
            'interactive':false
        });
        plugins = $('#plugins').tagsInput({
            'interactive':false
        });
        /**
         *  Perform Fresh Start
         */
        $('.fs').submit(function(e){
            e.preventDefault();
            var button = $(this).find('.btn-save-changes');
            button.disable('Loading ...');
            $.post(prs_data.wp_post, $(this).serialize(), function(d){
                button.disable();
                UIkit.notify("<i class='uk-icon-check'></i> Operation completed.", {pos:'bottom-right', status:"success"});
            });
        });
        /**
         *  Perform Troubleshooting
         */
        $('.ts').submit(function(e){
            e.preventDefault();
            var button = $(this).find('.btn-save-changes');
            button.disable('Loading ...');
            $.post(prs_data.wp_post, $(this).serialize(), function(d){
                button.disable();
                UIkit.notify("<i class='uk-icon-check'></i> Operation completed.", {pos:'bottom-right', status:"success"});
            });
        });
        /**
         *  Select result and put it into a tag
         */
        $(document).on('click', '.select-result', function(){
            var name = $(this).data('name');
            var type = $(this).data('type');
            if (!window[type].tagExist(name)) {
                window[type].addTag(name);
            }
        });
        /**
         *  Key press events for Plugins/Themes search
         */
        var ajax_timeout;
        $('#search_plugins,#search_themes').on('keypress',function(e){
            e.stopPropagation();
            var element = this;
            var type = $(element).data('type');
            var results = $('#result_' + type);
            clearTimeout(ajax_timeout);
            ajax_timeout = setTimeout(function(){
                $(element).attr('disabled', 'disabled');
                results.append(
                    '<div class="search-loading"><i class="fa fa-refresh fa-spin"></i></div>'
                );
                var data = [{
                    name: 'action',
                    value: 'prs_fs_search_plugins'
                },{
                    name: 'type',
                    value: type
                },{
                    name: 'search',
                    value: $(element).val()
                }];
                $.post(prs_data.wp_post, data, function(d){

                    results.empty();

                    $(element).removeAttr('disabled');
                    var data = d[type];
                    if (data.length < 1) {
                        results.append(
                            '<div class="search-no-results"><i class="fa fa-warning"></i> No results for search query <b>"'+$(element).val()+'"</b>.</div>'
                        );
                        return 0;
                    }

                    for(var i = 0; i < data.length; i++) {
                        var row = data[i];
                        results.append(
                            '<div class="search-result">' +
                            '<p class="search-result-title">'+row.name+' <small>by <b>'+row.author+'</b></small></p>' +
                            '<p class="search-result-description">'+(row.hasOwnProperty('short_description') ? row.short_description : row.description)+'</p>' +
                            '<div class="search-result-actions">' +
                            '<button type="button" class="uk-button uk-button-success uk-button-mini select-result" data-type="'+type+'" data-name="'+row.slug+'"><i class="fa fa-plus"></i> Add</button>' +
                            '' +
                            '' +
                            '</div>' +
                            '' +
                            '' +
                            '</div>'
                        );
                    }

                });
            },600);
        });
        /**
         *  Validate License
         */
        $('.validate-license').submit(function(e){
            e.preventDefault();
            var button = $(this).find('button');
            button.disable('Loading ...');
            $.post(prs_data.wp_post, $(this).serialize(), function(d){
                setTimeout(function(){
                    document.location.reload();
                },5000);
                if (d.status == 'success') {
                    UIkit.notify("<i class='uk-icon-check'></i> " + d.message, {pos:'bottom-right', status:"success"});
                } else {
                    UIkit.notify("<i class='uk-icon-close'></i> " + d.message, {pos:'bottom-right', status:"error"});
                }
            });
        });
        /**
         *  Create Categories
         */
        $(document).on('change', '#fs_create_categories', function(e){
            e.preventDefault();
            $('.fs_create_categories_list').toggleClass('uk-hidden');
        });
        $(document).on('click', '.uk-button-add-category', function(e){
            e.preventDefault();
            $('<input name="fs_create_categories_list[]" type="text" placeholder="eg. Category Name" class="uk-width-1-1"/>').insertBefore($('.uk-button-add-category'));
        });
        $(document).on('click', '.uk-button-remove-category', function(e){
            e.preventDefault();
            $('.fs_create_categories_list').find('input').last().remove();
        });

        /**
         *  Create Pages
         */
        $(document).on('change', '#fs_create_blank_pages', function(e){
            e.preventDefault();
            $('.fs_create_blank_pages_list').toggleClass('uk-hidden');
        });
        $(document).on('click', '.uk-button-add-pages', function(e){
            e.preventDefault();
            $('<input name="fs_create_blank_pages_list[]" type="text" placeholder="eg. Page Name" class="uk-width-1-1"/>').insertBefore($('.uk-button-add-pages'));
        });
        $(document).on('click', '.uk-button-remove-pages', function(e){
            e.preventDefault();
            $('.fs_create_blank_pages_list').find('input').last().remove();
        });

        /**
         *  Create Posts
         */
        $(document).on('change', '#fs_create_blank_posts', function(e){
            e.preventDefault();
            $('.fs_create_blank_posts_list').toggleClass('uk-hidden');
        });
        $(document).on('click', '.uk-button-add-post', function(e){
            e.preventDefault();
            $('<input name="fs_create_blank_posts_list[]" type="text" placeholder="eg. Post Name" class="uk-width-1-1"/>').insertBefore($('.uk-button-add-post'));
        });
        $(document).on('click', '.uk-button-remove-post', function(e){
            e.preventDefault();
            $('.fs_create_blank_posts_list').find('input').last().remove();
        });
        
        /**
         *  Change Max Upload Size
         */
        $(document).on('change', '#uploadSize', function(e){
            e.preventDefault();
            var data = $(this);
            var value = $(this).val();
            var target = data.data('target');
            data.disable();
            let datas = {
                action      : target,
                uploadSize  : value
            };
            $.post(prs_data.wp_post,datas, function(d){
                UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                if (d.status=='success') {
                    data.disable();
                }
            });
        });

        /**
         *  Change Max Upload Size
         */
        $(document).on('change', '#postSize', function(e){
            e.preventDefault();
            var data = $(this);
            var value = $(this).val();
            var target = data.data('target');
            data.disable();
            let datas = {
                action    : target,
                postSize  : value
            };
            $.post(prs_data.wp_post,datas, function(d){
                UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                if (d.status=='success') {
                    data.disable();
                }
            });
        });

        /**
         *  Change Max Execution Time
         */
        $(document).on('change', '#executionTime', function(e){
            e.preventDefault();
            var data = $(this);
            var value = $(this).val();
            var target = data.data('target');
            data.disable();
            let datas = {
                action    : target,
                executionTime  : value
            };
            $.post(prs_data.wp_post,datas, function(d){
                UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                if (d.status=='success') {
                    data.disable();
                }
            });
        });

        /**
         *  Change Max Input Vars
         */
        $(document).on('change', '#inputVars', function(e){
            e.preventDefault();
            var data = $(this);
            var value = $(this).val();
            var target = data.data('target');
            data.disable();
            let datas = {
                action    : target,
                inputVars  : value
            };
            $.post(prs_data.wp_post,datas, function(d){
                UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                if (d.status=='success') {
                    data.disable();
                }
            });
        });

        /**
         *  Change Max Memory Limit
         */
        $(document).on('change', '#memoryLimit', function(e){
            e.preventDefault();
            var data = $(this);
            var value = $(this).val();
            var target = data.data('target');
            data.disable();
            let datas = {
                action    : target,
                memoryLimit  : value
            };
            $.post(prs_data.wp_post,datas, function(d){
                UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                if (d.status=='success') {
                    data.disable();
                }
            });
        });

    });


})( jQuery );
