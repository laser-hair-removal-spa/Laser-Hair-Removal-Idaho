(function( $ ) {
    'use strict';

    /**
     *  Global doc.ready function
     */
    $(document).ready(function(){
        actions.searchGoogleMap();
        actions.convertToJpeg();
        actions.saveEXIF();
    });

    var actions = {
        saveEXIF: function () {
            $(document).on('click', '.ps_exif_save_button', function () {
                var btn = $(this);
                btn.parents('.media-upload-form').submit();
                btn.text('Saving...');
                btn.attr('disabled', true);
                setInterval(function () {
                    btn.text('Save');
                    btn.attr('disabled', false);
                },2000);
            });
        },
        convertToJpeg: function(){
            $(document).on('click', '.ps_convert_jpg', function(){
                $(this).attr('disabled', 'disabled');
                var remove = 'false';
                var id     = $(this).data('id');
                if (confirm('Do you want to remove the old image after the conversion to JPEG is completed?')) {
                    remove = 'true';
                }
                $.post(prs_data.wp_post, 'action=prs_convert_image&id=' + id + '&remove=' + remove).done(function(d){
                    $(this).removeAttr('disabled');
                    alert(d.message);
                    if (d.status == 'success') {
                        document.location.reload();
                    }
                });
            });
        },
        searchGoogleMap: function(){
            $(document).on('click', '.ps_search_maps', function(){

                var searchQuery   = $('.ps_search_input').val();
                var attachmentID  = $(this).parents('table').children('thead').attr('id').replace('media-head-', '');
                var latitude      = $('#attachments\\['+attachmentID+'\\]\\[prs_exif_latitude\\]');
                var longitude     = $('#attachments\\['+attachmentID+'\\]\\[prs_exif_longitude\\]');

                console.log(latitude);
                console.log(longitude);

                var searchSetting = {"address": searchQuery};
                if (searchQuery == '') {
                    alert('Please type in a query in "Search by Address" before searching.');
                    return false;
                }

                var geocoder      = new google.maps.Geocoder();
                var mapsOptions   = {
                    zoom: 8,
                    mapTypeControl: true,
                    mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
                    navigationControl: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var renderedMap = new google.maps.Map(document.getElementById("ps_map_canvas"), mapsOptions);
                geocoder.geocode( searchSetting , function(results, status) {

                    if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {

                        renderedMap.setCenter(results[0].geometry.location);

                        var marker = new google.maps.Marker({
                            position: results[0].geometry.location,
                            map: renderedMap,
                            title:'Your Location'
                        });

                        latitude.val(results[0].geometry.location.lat());
                        longitude.val(results[0].geometry.location.lng());

                        google.maps.event.addListener(renderedMap, "click", function(event) {

                            if (marker) {
                                marker.setMap(null);
                                marker = null;
                            }

                            var myLatLng = event.latLng ;

                            marker = new google.maps.Marker({
                                position: myLatLng,
                                map: renderedMap,
                                title:"Property Location"
                            });

                            // populate the form fields with lat & lng
                            latitude.val(event.latLng.lat());
                            longitude.val(event.latLng.lng());

                            latitude.change();
                        });
                    }
                });
            });
        }
    };


})( jQuery );
