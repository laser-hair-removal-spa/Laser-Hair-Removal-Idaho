(function( $ ) {
    'use strict';

    $(document).ready(function(){
        actions.getMarketHealth();
        actions.searchAmazon();
        actions.searchClickbank();
        actions.filtersClickbank();
        actions.pagination();
        actions.loadShortcodes();
        actions.createShortcode();
        actions.saveShortcode();
        actions.selectImages();
        actions.shortcodePreview();
        actions.shortcodeTracking();
        actions.shortcodeUrlTracking();
        actions.shortcodeDuplicate();
        actions.shortcodeEdit();
        actions.shortcodeDelete();
        actions.shortcodeTruncateTracking();
        actions.shortcodeUrlTruncateTracking();
        actions.showHideFilters();
        actions.applyFilters();
        actions.copyShortcode();
        actions.saveShortcodeSetup();
        actions.maskedModal();

        google.charts.load('current', {'packages':['corechart']});
    });

    var actions = {
        maskedModal: function(){
            $(document).on('click', '.copy-masked-tag', function() {

                var modal = $('#maskedModal');
                $('#maskedURL').val($(this).data('content'));
                UIkit.modal(modal).show();

            });
            $(document).on('click', '.copy-masked-url', function() {

                var modal = $('#maskedModal');
                UIkit.modal(modal).hide();

                actions.copyTextToClipboard($('#maskedURL').val());

                UIkit.notify('Successfully copied masked url to clipboard!', {pos:'bottom-right', status:'success'});

            });
        },
        saveShortcodeSetup: function () {
            $(document).on('change keyup paste', '#redirect_mask', function () {
                $('.redirect_mask_preview').html($(this).val());
            });

            $(document).on('submit', '#shortcode_setup', function (e) {
                e.preventDefault();
                var btn = $(this).find('button[type="submit"]');
                btn.disable();

                $.post(prs_data.wp_post, $(this).serialize()).done(function(d){
                    btn.disable();
                    UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                });
            });
        },
        copyTextToClipboard: function(text) {
            var textArea = document.createElement("textarea");

            // Place in top-left corner of screen regardless of scroll position.
            textArea.style.position = 'fixed';
            textArea.style.top = 0;
            textArea.style.left = 0;

            // Ensure it has a small width and height. Setting to 1px / 1em
            // doesn't work as this gives a negative w/h on some browsers.
            textArea.style.width = '2em';
            textArea.style.height = '2em';

            // We don't need padding, reducing the size if it does flash render.
            textArea.style.padding = 0;

            // Clean up any borders.
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';

            // Avoid flash of white box if rendered for any reason.
            textArea.style.background = 'transparent';


            textArea.value = text;

            document.body.appendChild(textArea);

            textArea.select();

            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
            } catch (err) {
                console.log('Oops, unable to copy');
            }

            document.body.removeChild(textArea);
        },

        copyShortcode: function(){
            $(document).on('click', '.copy-shortcode-tag', function() {

                var modal = $('#shortModal');
                $('#shortURL').val($(this).data('content'));
                UIkit.modal(modal).show();

            });
            $(document).on('click', '.copy-short-url', function() {

                var modal = $('#shortModal');
                UIkit.modal(modal).hide();

                actions.copyTextToClipboard($('#shortURL').val());

                UIkit.notify('Successfully copied short code to clipboard!', {pos:'bottom-right', status:'success'});

            });
        },
        applyFilters: function(){
            $('.filters').submit(function(e){
                e.preventDefault();
                $('#page').val(0);
                actions.loadShortcodes();
            });
        },
        showHideFilters: function(){
            $(document).on('click', '.filters-button', function(){
                var filters = $('.shortcode-filters');
                filters.toggleClass('uk-hidden');
            });
        },

        shortcodeTruncateTracking: function(){
            $(document).on('click', '.uk-button-truncate-tracking', function(e){
                var id = $('#trackingModal').find('.ID').val();
                $.post(prs_data.wp_post, 'action=prs_truncateTrackingData&id=' + id);
            });
        },
        shortcodeUrlTruncateTracking: function(){
            $(document).on('click', '.uk-button-url-truncate-tracking', function(e){
                var id = $('#urlTrackingModal').find('.ID').val();
                $.post(prs_data.wp_post, 'action=prs_urlTruncateTrackingData&id=' + id);
            });
        },
        shortcodeTracking: function(){
            $(document).on('click', '.shortcode-tracking', function(){
                var shortcode = $(this).parents('.shortcode');
                var id        = shortcode.data('id');
                var modal     = $('#trackingModal');
                var name      = shortcode.find('.name').text().split(']')[0].replace('[', '');
                var btn       = $(this);
                modal.find('.shortcode').html(name);
                modal.find('.ID').val(id);
                UIkit.modal(modal).show();
                btn.disable();
                $.post(prs_data.wp_post, 'action=prs_getTrackingCharts&id=' + id)
                    .done(function(d){
                        btn.disable();
                        if (d.status == 'success') {

                            $('#tracking_charts').empty();

                            if (d.data.length > 1) {
                                var formatted_data = [];
                                var raw_data = d.data;
                                for (var i = 0; i < raw_data.length; i++) {
                                    var obj = raw_data[i];
                                    if (i !== 0) {
                                        obj[0] = new Date(obj[0]);
                                    }
                                    formatted_data.push(obj);
                                }

                                var data = google.visualization.arrayToDataTable(formatted_data);

                                var options = {
                                    title: 'Shortcode Tracking Details',
                                    hAxis: {title: 'Date',  titleTextStyle: {color: '#333'}},
                                    vAxis: {minValue: 0}
                                };

                                var chart = new google.visualization.AreaChart(document.getElementById('tracking_charts'));
                                chart.draw(data, options);
                            } else {
                                $('#tracking_charts').append('<p><i class="fa fa-warning"></i> There is not enough tracking data. Please use your shortcode in some of your posts/pages in order to start tracking impressions/unique clicks.</p>');
                            }

                        } else {
                            UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                        }
                    });
            });
        },
        shortcodeUrlTracking: function(){
            $(document).on('click', '.shortcode-url-tracking', function(){
                var shortcode = $(this).parents('.shortcode');
                var id        = shortcode.data('id');
                var modal     = $('#urlTrackingModal');
                var name      = shortcode.find('.name').text().split(']')[0].replace('[', '');
                var btn       = $(this);
                modal.find('.shortcode').html(name);
                modal.find('.ID').val(id);
                UIkit.modal(modal).show();
                btn.disable();
                $.post(prs_data.wp_post, 'action=prs_getTrackingUrlCharts&id=' + id)
                    .done(function(d){
                        btn.disable();
                        if (d.status == 'success') {

                            $('#url_tracking_charts').empty();

                            if (d.data.length > 1) {
                                var formatted_data = [];
                                var raw_data = d.data;
                                for (var i = 0; i < raw_data.length; i++) {
                                    var obj = raw_data[i];
                                    if (i !== 0) {
                                        obj[0] = new Date(obj[0]);
                                    }
                                    formatted_data.push(obj);
                                }

                                var data = google.visualization.arrayToDataTable(formatted_data);

                                var options = {
                                    title: 'Shortcode Masked URL Tracking Details',
                                    hAxis: {title: 'Date',  titleTextStyle: {color: '#333'}},
                                    vAxis: {minValue: 0}
                                };

                                var chart = new google.visualization.AreaChart(document.getElementById('url_tracking_charts'));
                                chart.draw(data, options);
                            } else {
                                $('#url_tracking_charts').append('<p><i class="fa fa-warning"></i> There is not enough tracking data. Please use your shortcode in some of your posts/pages in order to start tracking impressions/unique clicks.</p>');
                            }

                        } else {
                            UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                        }
                    });
            });
        },
        shortcodeDuplicate: function(){
            $(document).on('click', '.shortcode-duplicate', function(){
                var shortcode = $(this).parents('.shortcode');
                var id        = shortcode.data('id');
                var btn       = $(this);
                btn.disable();
                $.post(prs_data.wp_post, 'action=prs_duplicateShortcode&id=' + id)
                    .done(function(d){
                        btn.disable();
                        UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                        if (d.status == 'success') {
                            actions.loadShortcodes();
                        }
                    });
            });
        },
        shortcodeEdit: function(){
            $(document).on('click', '.shortcode-edit', function(){
                var shortcode = $(this).parents('.shortcode');
                var id        = shortcode.data('id');

                var modal = UIkit.modal('#shortcodeModal');
                var btn   = $(this);

                modal.find('h2').html('<i class="fa fa-edit"></i> Edit Shortcode');

                btn.disable();
                $.post(prs_data.wp_post, 'action=prs_getShortcode&id=' + id)
                    .done(function(d){
                        btn.disable();
                        if (d.status == 'success') {

                            var data = d.data;

                            modal.find('.id').val(data.id);
                            modal.find('#shortcode').val(data.shortcode);
                            modal.find('#name').val(data.name);
                            modal.find('#title').val(data.title);
                            modal.find('#url').val(data.url);
                            modal.find('#image').val(data.image);

                            if (data.nofollow == 1) {
                                modal.find('#nofollow').val(data.nofollow);
                                modal.find('#nofollow').next().find('.slider-button').removeClass('on').addClass('on').html('Yes');
                            } else {
                                modal.find('#nofollow').val(0);
                                modal.find('#nofollow').next().find('.slider-button').removeClass('on').html('No');
                            }
                            if (data.target_blank == 1) {
                                modal.find('#target_blank').val(data.target_blank);
                                modal.find('#target_blank').next().find('.slider-button').removeClass('on').addClass('on').html('Yes');
                            } else {
                                modal.find('#target_blank').val(0);
                                modal.find('#target_blank').next().find('.slider-button').removeClass('on').html('No');
                            }

                            if (data.mask == 1) {
                                modal.find('#mask').val(data.mask);
                                modal.find('#mask').next().find('.slider-button').removeClass('on').addClass('on').html('Yes');
                            } else {
                                modal.find('#mask').val(0);
                                modal.find('#mask').next().find('.slider-button').removeClass('on').html('No');
                            }

                            modal.find('#image').trigger('change');

                            modal.show();
                        } else {
                            UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                        }
                    });
            });
        },
        shortcodeDelete: function(){
            $(document).on('click', '.shortcode-delete', function(){
                var shortcode = $(this).parents('.shortcode');
                var id        = shortcode.data('id');
                var btn       = $(this);
                btn.disable();
                $.post(prs_data.wp_post, 'action=prs_deleteShortcode&id=' + id)
                    .done(function(d){
                        btn.disable();
                        UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                        if (d.status == 'success') {
                            actions.loadShortcodes();
                        }
                    });
            });
        },
        loadShortcodes: function(){
            var body = $('.shortcode-body');
            body.empty().append('<h4><i class="fa fa-refresh fa-spin"></i> Loading ...</h4>');

            var page = $('#page').val();
            var data = $('.filters').serializeArray();
            data.push({
                name: 'action',
                value: 'prs_loadShortcodes'
            });

            $.post(prs_data.wp_post, data, function(d){
                if (d.status == 'success') {
                    var rows  = d.data.rows;
                    var pages = d.data.pages;

                    $('.uk-pagination-shortcodes').remove();
                    $('<ul class="uk-pagination uk-pagination-shortcodes uk-pagination-left"></ul>').insertBefore('.shortcode-footer .uk-clearfix');
                    UIkit.pagination('.uk-pagination-shortcodes', {
                        currentPage: page,
                        pages: pages,
                        displayedPages: 2
                    });

                    body.empty();
                    if (rows.length < 1) {
                        body.append('<h4><i class="fa fa-info-circle"></i> You don\'t have any created shortcodes.</h4>');
                    } else if (rows == false) {
                        body.append('<h4><i class="fa fa-info-circle"></i> Can\'t find any shortcodes.</h4>');
                    } else {

                        if (!jQuery.isArray(rows)) {
                            rows = [rows];
                        }
                        for(var i = 0; i < rows.length; i++) {
                            var data     = rows[i];
                            var template = $('.shortcode.uk-hidden').clone();
                            template.removeClass('uk-hidden');

                            var firstLetterOfGroup = data.group.substring(0,1);

                            let domain = prs_data.wp_admin;

                            let mask = data.id;

                            if (data.name != '' && data.name != null) {
                                mask = data.name;
                            }
                            domain = domain.replace('wp-admin/', '');

                            template.attr('data-id', data.id);
                            template.find('.name').html('<span class="shortcode-select">[' + data.shortcode + ']</span> <span class="groupName" data-uk-tooltip title="'+data.group+'" data-group="'+data.group+'">'+firstLetterOfGroup+'</span>');

                            template.find('.copy-shortcode-tag').data('content', '[' +data.shortcode + ']');
                            template.find('.copy-masked-tag').data('content', domain + '?'+redirect_mask+'=' + mask);

                            template.find('.url').html(data.url).attr('href', data.url);
                            template.find('.title').html(data.title);
                            template.find('.group').html(data.group);

                            template.find('.ctr').html(parseInt(data.ctr) + '%<br><span>CVR</span>');
                            template.find('.unique_clicks').html(data.unique_clicks + '<br><span>CLK</span>');
                            template.find('.impressions').html(data.impressions + '<br><span>IMP</span>');

                            template.find('.url_ctr').html(parseInt(data.url_ctr) + '%<br><span>CVR</span>');
                            template.find('.url_unique_clicks').html(data.url_unique_clicks + '<br><span>CLK</span>');
                            template.find('.url_impressions').html(data.url_impressions + '<br><span>IMP</span>');

                            var imageContainer = template.find('.image');
                            if (data.image != '') {
                                imageContainer.html('<img src="'+data.image+'"/>');
                            }

                            body.append(template)
                        }
                    }
                }
            });
        },
        shortcodePreview: function(){
            $(document).on('click', '.generatedShortcode', function(e){e.preventDefault()});
            var modal    = $('#shortcodeModal');
            var preview  = modal.find('.shortcode-preview');
            var elements = [
                '#shortcode',
                '#title',
                '#target_blank',
                '#nofollow',
                '#url',
                '#image'
            ];
            for(var i = 0; i < elements.length; i++) {
                var e = elements[i];
                modal.find(e).change(function(){
                    var def             = '<span class="empty">Fill in the fields to preview</span>';
                    var title           = modal.find(elements[1]).val();
                    var target_blank    = modal.find(elements[2]).val();
                    var nofollow        = modal.find(elements[3]).val();
                    var url             = modal.find(elements[4]).val();
                    var image           = modal.find(elements[5]).val();
                    var hasImage        = image != '';

                    if (title == '' && image == '') {
                        preview.empty().append(def);
                        return null;
                    }

                    var link = '<a class="generatedShortcode '+ ((hasImage) ? 'hasImage' : '') +'" href="' + url + '" ';
                    if (nofollow == 1) {
                        link += 'rel="nofollow" ';
                    }
                    if (target_blank == 1) {
                        link += 'target="_blank" ';
                    }
                    link += ">";
                    if (image != '') {
                        link += '<img class="responsive" src="'+image+'" title="'+title+'"/>';
                    } else {
                        link += title;
                    }
                    link += "</a>";

                    preview.empty().append(link);
                });
            }
        },
        selectImages: function(){
            $('.imageSelect').click(function(){
                var target = $(this).data('target');
                tb_show( '', 'media-upload.php?type=image&amp;TB_iframe=true' );
                window.send_to_editor = function(html) {
                    var img = $(html).attr('src');
                    $('#' + target).val(img).trigger('change');
                    tb_remove();
                }
            });
        },
        saveShortcode: function(){
            $(document).on('submit', '.shortcodeForm', function(e){
                e.preventDefault();
                var modal = UIkit.modal('#shortcodeModal');
                $.post(prs_data.wp_post, $(this).serialize(), function(d){
                    UIkit.notify(d.message, {pos:'bottom-right', status:d.status});
                    if (d.status == 'success') {
                        modal.find('.shortcodeForm')[0].reset();
                        modal.hide();
                        actions.loadShortcodes();
                    }
                });
            });
        },
        createShortcode: function(){
            $(document).on('click', '.create-shortcode', function(e){

                var modal = UIkit.modal('#shortcodeModal');
                var url   = $(this).data('url');
                var group = $(this).data('group');

                modal.find('h2').html('<i class="fa fa-plus"></i> Create Shortcode');
                modal.find('.id').val(0);
                modal.find('.group').val(group);
                modal.find('input#url').val(url).trigger('change');

                modal.show();
            });
        },
        filtersClickbank: function(){
            $('.clickbank_filters').submit(function(e){
                e.preventDefault();
                actions.searchClickbank();
            });
        },
        searchClickbank: function(){
            var table = $('.table-clickbank').DataTable({
                "responsive": true,
                "bProcessing": true,
                "bDestroy": true,
                "bPaginate": true,
                "bAutoWidth": true,
                "bFilter": false,
                "bServerSide": true,
                "sServerMethod": "POST",
                "sAjaxSource": prs_data.wp_post,
                "iDisplayLength": 20,
                "aLengthMenu": [[10, 20, 50, 100], [10, 20, 50, 100]],
                "aaSorting": [[0, 'desc']],
                "aoColumns": [
                    {
                        "bSearchable": true,
                        "sClass": "text-center",
                        "bSortable": true,
                        "mData": 'Title',
                        "mRender": function(data, type, row){
                            return '<span class="product-name">' + data + '</span><p class="product-description">' + row.Description + '</p>' +
                            '<a href="https://accounts.clickbank.com/info/jmap.htm?vendor='+row.Tag+'" data-url="" data-group="Clickbank" target="_blank" class="uk-button uk-button-primary uk-button-mini create-shortcode">' +
                            '<i class="fa fa-plus"></i> Create Affiliate Link' +
                            '</a>';
                        },
                        "asSorting": ["desc", "asc"]
                    },
                    {
                        "bSearchable": true,
                        "sClass": "text-center",
                        "bSortable": true,
                        "mData": 'Commission',
                        "mRender": function(data, type, row){
                            return data + '%';
                        },
                        "asSorting": ["desc", "asc"]
                    },
                    {
                        "bSearchable": true,
                        "sClass": "text-center",
                        "bSortable": true,
                        "mData": 'Gravity',
                        "mRender": function(data, type, row){
                            return data;
                        },
                        "asSorting": ["desc", "asc"]
                    },
                    {
                        "bSearchable": true,
                        "sClass": "text-center",
                        "bSortable": true,
                        "mData": 'PercentPerSale',
                        "mRender": function(data, type, row){
                            return parseInt(data) + " %";
                        },
                        "asSorting": ["desc", "asc"]
                    },
                    {
                        "bSearchable": true,
                        "sClass": "text-center",
                        "bSortable": true,
                        "mData": 'PercentPerRebill',
                        "mRender": function(data, type, row){
                            return parseInt(data) + " %";
                        },
                        "asSorting": ["desc", "asc"]
                    },
                    {
                        "bSearchable": true,
                        "sClass": "text-center",
                        "bSortable": true,
                        "mData": 'AverageEarningsPerSale',
                        "mRender": function(data, type, row){
                            return "$ " + parseInt(data);
                        },
                        "asSorting": ["desc", "asc"]
                    },
                    {
                        "bSearchable": true,
                        "sClass": "text-center",
                        "bSortable": true,
                        "mData": 'Referred',
                        "mRender": function(data, type, row){
                            return parseInt(data);
                        },
                        "asSorting": ["desc", "asc"]
                    },
                    {
                        "bSearchable": true,
                        "sClass": "text-center",
                        "bSortable": true,
                        "mData": 'ActivateDate',
                        "mRender": function(data, type, row){
                            return new Date(data).toDateString();
                        },
                        "asSorting": ["desc", "asc"]
                    }

                ],
                "fnServerParams": function (aoData) {
                    var filters = $('.clickbank_filters').serializeArray();
                    for(var i = 0; i < filters.length; i++) {
                        var filter = filters[i];
                        aoData.push(filter);
                    }
                    var f = {
                        name: "action",
                        value: "prs_searchClickbank"
                    };
                    aoData.push(f);
                }
            });
        },
        getMarketHealth: function(){
            $.post(prs_data.wp_post, 'action=prs_getMarketHealth', function(d){
                var loading = $('.markethealth').find('.loading');
                var table   = $('.markethealth').find('.table-markethealth');
                if (d.status == 'error') {
                    loading.html(
                        '<i class="fa fa-warning"></i> ' + d.message
                    ).css('color', 'red');
                } else {
                    var data    = d.data.data.offers;
                    loading.addClass('uk-hidden');
                    table.removeClass('uk-hidden');
                    table = table.DataTable({
                        "bPaginate": true,
                        "bAutoWidth": false,
                        "bFilter": true,
                        "iDisplayLength": 10,
                        "aLengthMenu": [[5, 10, 50, 100, -1], [5, 10, 50, 100, "All"]],
                        "aaSorting": [[0, 'desc']]
                    });
                    for(var i = 0; i < data.length; i++) {
                        var item = data[i];
                        table.row.add( [
                            '<span class="product-name">' + item.name + '</span><p class="product-description">' + item.description + '</p>' +
                            '<button class="uk-button uk-button-primary uk-button-mini create-shortcode" data-group="Markethealth" data-url="'+item.tracking_url+'">' +
                            '<i class="fa fa-plus"></i> Create Shortcode' +
                            '</button>',
                            '<a href="'+item.preview_url+'" target="_blank">'+item.preview_url+'</a>',
                            (item.payout_type == 'cpa_percentage') ? item.payout + '%' : '$' + item.payout,
                            new Date(item.expiration_date).toDateString()
                        ] ).draw( false );
                    }
                }
            });
        },
        searchAmazon: function(){
            $('.searchAmazon').submit(function(e){
                e.preventDefault();
                var data   = $(this).serialize();
                var button = $(this).find('button');
                button.disable();
                $.post(prs_data.wp_post, data, function(d){
                    button.disable();

                    if (d.status == 'error') {
                        UIkit.notify("<i class='uk-icon-close'></i> " + d.message, {pos:'bottom-right', status:"error"});
                    } else {
                        var container = $('.resultsAmazon');
                        var data      = d.data;
                        var items     = data.ItemSearchResponse.Items.Item;

                        container.empty();

                        for(var i = 0; i < items.length; i++) {
                            var template = $('.product.uk-hidden').clone();
                            var item     = items[i];
                            template.removeClass('uk-hidden');

                            if (!item.hasOwnProperty('ItemAttributes')) {
                                continue;
                            }
                            if (!item.hasOwnProperty('MediumImage')) {
                                continue;
                            }

                            template.find('.image').find('img').attr('src', item.MediumImage.URL);
                            template.find('.name').html((item.ItemAttributes.Title != '') ? item.ItemAttributes.Title : 'n/a');
                            template.find('.name').attr('href', item.DetailPageURL);
                            template.find('.price').html((item.ItemAttributes.hasOwnProperty('ListPrice')) ? item.ItemAttributes.ListPrice.FormattedPrice : '...');

                            // Populate URLs
                            template.find('.create-shortcode.asin').attr('data-url', 'http://asin.info/a/' + item.ASIN);
                            template.find('.create-shortcode.regular').attr('data-url', item.DetailPageURL);
                            template.find('.create-shortcode.regular').attr('data-group', 'Amazon');

                            container.append(template);
                        }
                    }

                });
            });
        },
        pagination: function(){
            $(document).on('select.uk.pagination', '.uk-pagination-shortcodes', function(e, pageIndex){
                $('#page').val(pageIndex);
                actions.loadShortcodes();
            });

            var paginationAmazon = UIkit.pagination('.uk-pagination-amazon', {
                currentPage: $('#pageID').val() - 1,
                pages: 10
            });
            paginationAmazon.on('select.uk.pagination', function(e, pageIndex){
                $('#pageID').val(pageIndex + 1);
                $('.searchAmazon').trigger('submit');
            });
        }
    };

})( jQuery );
