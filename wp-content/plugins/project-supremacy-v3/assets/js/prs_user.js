(function( $ ) {
    'use strict';

    var actions = {
        trackAffiliateClicks: function(){
            $(document).on('click', '.ps-tracking', function(){
                var id = $(this).data('id');
                $.post(prs_data.wp_post, 'action=prs_trackShortcode&id=' + id);
            });
        }
    };

    /**
     *  Global doc.ready function
     */
    $(document).ready(function(){
        actions.trackAffiliateClicks();
    });

})( jQuery );