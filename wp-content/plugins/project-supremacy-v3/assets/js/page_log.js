var logTable;
var plugins,themes;

(function( $ ) {
    'use strict';

    $(document).ready(function(){

        link.loadRedirects();
        link.addNewRedirect();
        link.editNewRedirect();
        link.deleteRedirect();
        link.selectAllRedirects();
        link.uploadCSV();

        link.loadLog404();
        link.toggleIp();
        link.toggleReference();
        link.toggleAgent();
        link.selectAllLog404();
        link.deleteLog404();
        link.addNew404Redirect();
        link.export404Log();
        link.LogSettings();

    });

    var link = {

        loadRedirects: function(){
            var messages = {
                empty: '<tr><td colspan="5">Can\'t find any active redirects.</td></tr>',
                loading: '<tr><td colspan="5"><i class="fa fa-refresh fa-spin"></i> Loading ...</td></tr>'
            };
            var table = $('.table-redirects');
            var tbody = table.find('tbody');

            tbody.empty().append(messages.loading);

            $.post(prs_data.wp_post, 'action=prs_get_redirects', function(d){
                if (d.status == 'success') {

                    if (d.data.length == 0) {
                        tbody.empty().append(messages.empty);
                    } else {
                        tbody.empty();

                        for (var i = 0; i < d.data.length; i++) {
                            var data = d.data[i];
                            if (!data.new.match("^http")) {
                                data.new = '/' + data.new;
                            }

                            var html = '<tr>' +
                                '<td><input type="checkbox" data-id="'+data.id+'" class="remove-selected-ids"></td>' +
                                '<td><a target="_blank" href="/'+data.old+'">/'+data.old+'</a></td>' +
                                '<td><a target="_blank" href="'+data.new+'">'+data.new+'</a></td>' +
                                '<td>'+data.date_created+'</td>' +
                                '<td>' +
                                '<button type="button" class="uk-button uk-button-mini uk-button-primary edit-redirect" data-id="'+data.id+'" data-old-url="'+data.old+'" data-new-url="'+data.new+'" title="Edit this redirect"><i class="fa fa-edit"></i> Edit</button>' +
                                '<button type="button" class="uk-button uk-button-mini uk-button-danger delete-redirect uk-margin-small-left" data-id="'+data.id+'" title="Trash this redirect"><i class="fa fa-trash-o"></i> Trash</button>' +
                                '</td>' +
                                '</tr>';
                            tbody.append(html);
                        }
                    }

                } else {
                    UIkit.notify('An unknown error has occurred.', {pos:'bottom-right', status: 'danger'});
                }
            });

        },
        selectAllRedirects: function(){
            $(document).on('click', '.select-all-redirects', function (e) {
                e.preventDefault();
                $(".remove-selected-ids").each(function (i) {
                    var checked = $(this).prop("checked");
                    if (checked == true){
                        $(this).prop("checked", false);
                    } else {
                        $(this).prop("checked", true);
                    }
                });
            })
        },
        deleteRedirect: function(){
            $(document).on('click', '.delete-redirect', function(e){
                e.preventDefault();
                var button = $(this);
                var id = $(this).data('id');
                UIkit.modal.confirm("Are you sure that you want to delete this redirect?", function(){
                    button.disable();
                    $.post(prs_data.wp_post, 'action=prs_delete_redirect&id='+id, function(d){
                        button.disable();
                        link.loadRedirects();

                    });
                });
            });

            $(document).on('click', '.remove-selected-redirects', function(e){
                e.preventDefault();
                var button = $(this);

                var ids = [];

                $('.remove-selected-ids').each(function () {
                    if ( this.checked ) {
                        ids.push($(this).data('id'));
                    }
                });

                UIkit.modal.confirm("Are you sure that you want to delete this redirect?", function(){
                    button.disable();
                    $.post(prs_data.wp_post, 'action=prs_delete_redirect&id='+ids, function(d){
                        button.disable();
                        link.loadRedirects();

                    });
                });
            });

            $(document).on('click', '.remove-all-redirects', function (e) {
                e.preventDefault();
                var button = $(this);
                UIkit.modal.confirm("Are you sure that you want to delete all redirects?", function(){
                    button.disable();
                    $.post(prs_data.wp_post, 'action=prs_delete_all_redirects', function(d){
                        button.disable();
                        link.loadRedirects();

                    });
                });
            })
        },
        addNewRedirect: function(){
            $(document).on('click', '.add-new-redirect', function(e){
                e.preventDefault();

                var button = $(this);

                UIkit.modal.prompt("Old URL (use the /oldurl/ format):", '', function(oldURL){

                    UIkit.modal.prompt("Redirect to URL (use the /newurl/ format) (DANGER: Creating invalid redirects may result in breaking of your website):", '', function(newURL){

                        button.disable('Saving...');

                        $.post(prs_data.wp_post, 'action=prs_add_redirect&oldURL='+oldURL+'&newURL='+newURL, function(d){

                            button.disable();

                            link.loadRedirects();

                        });

                    });

                });

            });
        },
        editNewRedirect: function(){
            $(document).on('click', '.edit-redirect', function(e){
                e.preventDefault();

                var button = $(this);

                var coldURL = button.data('old-url');
                var cnewURL = button.data('new-url');

                var redirect_id = button.data('id');

                var oldURL = null;
                var newURL = null;

                UIkit.modal.prompt("Editing Old URL: " + coldURL, coldURL, function(url){

                    if(url == ''){
                        oldURL = coldURL;
                    } else {
                        oldURL = url;
                    }

                    UIkit.modal.prompt("Editing New URL: " + cnewURL, cnewURL, function(url){

                        if(url == ''){
                            newURL = cnewURL;
                        } else {
                            newURL = url;
                        }

                        if(oldURL != null && newURL != null){

                            button.disable('Saving...');

                            $.post(prs_data.wp_post, 'action=prs_edit_redirect&id='+redirect_id+'&newURL='+newURL+'&oldURL='+oldURL, function(d){
                                button.disable();
                                link.loadRedirects();
                            });

                        }


                    });
                });



            });
        },
        uploadCSV: function () {
            $(document).on('click','#csv_file_modal',function() {
                 UIkit.modal('#csv_modal').show();
            });
            $(document).on('change', '#csv_file',function () {

                if (this.files && this.files[0]) {

                    var extension = this.files[0].name.split('.').pop().toLowerCase();
                    if (extension != 'csv') {
                        UIkit.notify('Please select a valid CSV file.', {pos:'bottom-right', status: 'error'});
                        return;
                    }

                    var myFile = this.files[0];
                    var reader = new FileReader();

                    reader.addEventListener('load', function (e) {


                        UIkit.modal.confirm("This will add all redirections from your CSV file. Continue?", function(){

                            let csvdata = e.target.result;
                            csvdata = csvdata.split("\n");
                            for (var i = 0; i < csvdata.length; i++) {
                                if (csvdata[i] != '') {
                                    var line = csvdata[i];
                                    line = line.split(",");
                                    var oldURL = line[0];
                                    var newURL = line[1];

                                    $.postq("rqueue",prs_data.wp_post, 'action=prs_add_redirect&oldURL='+oldURL+'&newURL='+newURL, function(d){

                                        UIkit.notify('Redirection added.', {pos:'bottom-right', status: 'success'});

                                    });
                                }
                            }
                            UIkit.modal('#csv_modal').hide();

                        });

                    });

                    reader.readAsBinaryString(myFile);
                }
            });
        },

        loadLog404: function(){
            var linkIp = "";
            var linkAgnt = "";
            logTable = $('.logTable');
            logTable.prev().hide();
            logTable.show();
            logTable.dataTable({
                language: {
                    search: "_INPUT_",
                    searchPlaceholder: "Search 404 log...",
                    processing: "Loading 404 log...",
                    emptyTable: "Can\'t find any active logs."
                },
                "dom": '<"logTable-actions"<"left"fl><"left filters"><"right"ip><"clear">>rt',
                "bDestroy": true,
                "bPaginate": true,
                "bAutoWidth": false,
                "bFilter": true,
                "bProcessing": true,
                "sServerMethod": "POST",
                "bServerSide": true,
                "sAjaxSource": prs_data.wp_post,
                "iDisplayLength": 10,
                "aLengthMenu": [[5, 10, 50, 100, -1], [5, 10, 50, 100, "All"]],
                "aaSorting": [[3, 'desc']],
                "aoColumns": [
                    {
                        "sClass": "text-left",
                        "mData": "id",
                        "bSortable": false,
                        "bSearchable": false,
                        "mRender": function (data, type, row) {
                            return '<input type="checkbox" data-id="'+data+'" class="remove-selected-log-ids">';
                        }
                    },
                    {
                        "sClass": "column-hits",
                        "bSortable": true,
                        "bSearchable": false,
                        "mData": "last_hit_counts",
                        "mRender": function (data, type, row) {
                            return data;
                        }
                    },
                    {
                        "sClass": "column-url",
                        "bSortable": true,
                        "bSearchable": true,
                        "mData": "url",
                        "mRender": function (data, type, row) {
                            return data;
                        }
                    },
                    {
                        "sClass": "column-last-hit",
                        "bSortable": true,
                        "mData": "date_updated",
                        "mRender": function (data, type, row) {
                            return data;
                        }
                    },
                    {
                        "sClass": "column-ip",
                        "bSortable": false,
                        "bSearchable": false,
                        "mData": "ip",
                        "mRender": function (data, type, row) {
                            var lengthIpCount = 0;
                            var ipAr = jQuery.parseJSON(data);
                            linkIp = " <span style='color:#d05;'>"+ ipAr.join("<br/>") +"</span>";
                            lengthIpCount = ipAr.length;
                            var html = lengthIpCount+' <i title="View list of IPs" class="fa fa-list toggleIp tgl-btn-csr" ip-list="'+linkIp+'" log404s-toggle-id-ip="log404s-'+row.id+'-ip"></i>';

                            return html;
                        }
                    },
                    {
                        "sClass": "column-referers",
                        "bSortable": true,
                        "bSearchable": false,
                        "mData": "reference",
                        "mRender": function (data, type, row) {
                            var linkRes = '';
                            var lengthResCount = 0;
                            var referenceAr = jQuery.parseJSON(data);
                            lengthResCount = referenceAr.length;

                            $.each(referenceAr, function( index, value ) {
                                linkRes += ' <a href="' + value + '" target="_blank" style="color:#d05;">'+ value + '</a><br/>';
                            });

                            var html = lengthResCount+" <i title='View list of referring URLs' class='fa fa-list toggleRefer tgl-btn-csr' res-list=\'"+linkRes+"\' log404s-toggle-id-ref='log404s-"+row.id+"-referers'></i>";

                            return html;
                        }
                    },
                    {
                        "sClass": "column-agent",
                        "bSortable": false,
                        "bSearchable": false,
                        "mData": "agent",
                        "mRender": function (data, type, row) {
                            var lengthAgntCount = 0;
                            var agentAr = jQuery.parseJSON(data);
                            linkAgnt = " <span style='color:#d05;'>"+ agentAr.join("<br/>") +"</span>";
                            lengthAgntCount = agentAr.length;
                            var html = lengthAgntCount+' <i title="View list of user agents" class="fa fa-list toggleAgnt tgl-btn-csr" agnt-list="'+linkAgnt+'" log404s-toggle-id-agnt="log404s-'+row.id+'-agnts"></i>';

                            return html;
                        }
                    },
                    {
                        "sClass": "column-action",
                        "bSortable": false,
                        "bSearchable": false,
                        "mData": "id",
                        "mRender": function (data, type, row) {
                            var html =
                            '<a class="uk-button uk-button-mini uk-button-success add-new-404-redirect" data-current-url="'+row.slug+'" title="Add 301 Redirect"><i class="fa fa-plus"></i></a>' +
                            '<a class="uk-button uk-button-mini uk-button-primary uk-margin-small-left" target="_blank" href="'+row.url+'" title="Open URL in new window"><i class="fa fa-external-link"></i></a>' +
                            '<button type="button" class="uk-button uk-button-mini uk-button-danger uk-margin-small-left delete-log404" data-id="'+row.id+'" title="Trash this log"><i class="fa fa-trash-o"></i></button>';

                            return html;
                        }
                    }
                ],
                "fnServerParams": function (aoData) {
                    aoData.push({
                        name: 'action',
                        value: 'prs_get_log404s'
                    });
                },
                "fnCreatedRow": function ( row, data, index ) {
                },
                fnInitComplete: function(){
                }
            });

        },
        toggleIp: function(){
            /*$(document).on('click', '.toggleIp', function (e) {
                e.preventDefault();
                var toggleId = $(this).attr('log404s-toggle-id-ip');
                $('#'+toggleId).toggle(500);
            });*/

            $(document).on('click', '.toggleIp', function (e) {
                var tr = $(this).closest('tr');
                var toggleId = $(this).attr('log404s-toggle-id-ip');
                var ipList = $(this).attr('ip-list');
                var chkClsIp = $('.logTable tbody tr').hasClass('add-'+toggleId+'-list');

                if(chkClsIp === false) {

                    var html =
                    '<tr id="'+toggleId+'" class="add-'+toggleId+'-list"><td colspan="8">' +
                        '<div>' +
                            '<div><strong>IPs</strong> — <a href="#" class="log404s-up-ip" log404s-up-id-ip="'+toggleId+'">Hide list</a></div>' +
                            '<ul><li>'+ipList+'</li></ul>' +
                        '</div>' +
                    '</td></tr>';

                    $(tr).after(html);

                } else {
                    $('#'+toggleId).toggle(500);
                }
            });

            $(document).on('click', '.log404s-up-ip', function (e) {
                e.preventDefault();
                var hideId = $(this).attr('log404s-up-id-ip');
                $('#'+hideId).hide(500);
            });
        },
        toggleReference: function(){
            /*$(document).on('click', '.toggleRefer', function (e) {
                e.preventDefault();
                var toggleId = $(this).attr('log404s-toggle-id-ref');
                $('#'+toggleId).toggle(500);
            });*/

            $(document).on('click', '.toggleRefer', function (e) {
                var tr = $(this).closest('tr');
                var toggleId = $(this).attr('log404s-toggle-id-ref');
                var resList = $(this).attr('res-list');
                var chkClsRef = $('.logTable tbody tr').hasClass('add-'+toggleId+'-list');

                if(chkClsRef === false) {

                    var html =
                    '<tr id="'+toggleId+'" class="add-'+toggleId+'-list"><td colspan="8">' +
                        '<div>' +
                            '<div><strong>Referring URLs</strong> — <a href="#" class="log404s-up-ref" log404s-up-id-ref="'+toggleId+'">Hide list</a></div>' +
                            '<ul><li>'+resList+'</li></ul>' +
                        '</div>' +
                    '</td></tr>';

                    $(tr).after(html);

                } else {
                    $('#'+toggleId).toggle(500);
                }
            });

            $(document).on('click', '.log404s-up-ref', function (e) {
                e.preventDefault();
                var hideId = $(this).attr('log404s-up-id-ref');
                $('#'+hideId).hide(500);
            });
        },
        toggleAgent: function(){
            /*$(document).on('click', '.toggleAgnt', function (e) {
                e.preventDefault();
                var toggleId = $(this).attr('log404s-toggle-id-agnt');
                $('#'+toggleId).toggle(500);
            });*/

            $(document).on('click', '.toggleAgnt', function (e) {
                var tr = $(this).closest('tr');
                var toggleId = $(this).attr('log404s-toggle-id-agnt');
                var agntList = $(this).attr('agnt-list');
                var chkClsAgnt = $('.logTable tbody tr').hasClass('add-'+toggleId+'-list');

                if(chkClsAgnt === false) {

                    var html =
                    '<tr id="'+toggleId+'" class="add-'+toggleId+'-list"><td colspan="8">' +
                        '<div>' +
                            '<div><strong>User Agents</strong> — <a href="#" class="log404s-up-agnt" log404s-up-id-agnt="'+toggleId+'">Hide list</a></div>' +
                            '<ul><li>'+agntList+'</li></ul>' +
                        '</div>' +
                    '</td></tr>';

                    $(tr).after(html);

                } else {
                    $('#'+toggleId).toggle(500);
                }
            });

            $(document).on('click', '.log404s-up-agnt', function (e) {
                e.preventDefault();
                var hideId = $(this).attr('log404s-up-id-agnt');
                $('#'+hideId).hide(500);
            });
        },
        selectAllLog404: function(){
            $(document).on('click', '.select-all-log404', function (e) {
                e.preventDefault();
                $(".remove-selected-log-ids").each(function (i) {
                    var checked = $(this).prop("checked");
                    if (checked == true) {
                        $(this).prop("checked", false);
                    } else {
                        $(this).prop("checked", true);
                    }
                });
            })
        },
        deleteLog404: function(){
            $(document).on('click', '.delete-log404', function(e){
                e.preventDefault();
                var button = $(this);
                var id = $(this).data('id');
                UIkit.modal.confirm("Are you sure that you want to delete this log?", function(){
                    button.disable();
                    $.post(prs_data.wp_post, 'action=prs_delete_log404&id='+id, function(d){
                        button.disable();
                        link.loadLog404();

                    });
                });
            });

            $(document).on('click', '.remove-selected-log404', function(e){
                e.preventDefault();
                var button = $(this);

                var ids = [];

                $('.remove-selected-log-ids').each(function () {
                    if ( this.checked ) {
                        ids.push($(this).data('id'));
                    }
                });

                UIkit.modal.confirm("Are you sure that you want to delete this log?", function(){
                    button.disable();
                    $.post(prs_data.wp_post, 'action=prs_delete_log404&id='+ids, function(d){
                        button.disable();
                        link.loadLog404();

                    });
                });
            });

            $(document).on('click', '.clear-log404', function (e) {
                e.preventDefault();
                var button = $(this);
                UIkit.modal.confirm("Are you sure that you want to clear logs?", function(){
                    button.disable();
                    $.post(prs_data.wp_post, 'action=prs_clear_log404', function(d){
                        button.disable();
                        link.loadLog404();

                    });
                });
            })
        },
        addNew404Redirect: function(){
            $(document).on('click', '.add-new-404-redirect', function(e){
                e.preventDefault();

                var button = $(this);
                var old404URL = button.attr('data-current-url');

                UIkit.modal.prompt("Redirect to URL (use the /newurl/ format) (DANGER: Creating invalid redirects may result in breaking of your website):", '', function(newURL){

                    button.disable();

                    $.post(prs_data.wp_post, 'action=prs_add_log404_redirect&old404URL='+old404URL+'&newURL='+newURL, function(d){

                        button.disable();
                        link.loadRedirects();
                        if (d.status == 'success') {
                            UIkit.notify('Redirect successfully added in 301 redirects list.', {pos:'bottom-right', status: 'success'});
                        } else {
                            UIkit.notify('404 URL not fetched! Please clear log or add this URL from 301 redirects.', {pos:'bottom-right', status: 'danger'});
                        }

                    });

                });

            });
        },
        export404Log: function () {
            $(document).on('click', '.export_404s_log', function () {
                window.location = prs_data.wp_post + '?action=prs_export_404s_log';
            })
        },
        LogSettings: function() {
            $('.frmLogSettings').submit(function(e) {
                e.preventDefault();
                let logLmt = $('#prs_max_log_limit').val();

                if ( !$.isNumeric( logLmt ) || logLmt <= 0 || logLmt > 100000 ) {
                    UIkit.notify("<i class='uk-icon-close'></i> Please select correct max log limit.", {pos:'bottom-right', status:"error"});
                    return;
                }

                var button = $(this).find('.btn-save-changes');
                button.disable('Loading ...');
                $.post(prs_data.wp_post, $(this).serialize(), function(d){
                    button.disable();

                    if (d.status === 'success') {
                        UIkit.notify("<i class='uk-icon-check'></i> Operation completed.", {pos:'bottom-right', status:"success"});
                    } else {
                        UIkit.notify("<i class='uk-icon-close'></i> "+d.message, {pos:'bottom-right', status:"danger"});
                    }

                });
            });
        }

    };

})( jQuery );
