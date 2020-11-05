(function( $ ) {
    'use strict';

    var actions = {
        keywordNotification: function () {
            $(document).on('click', '.keyword_notification .notice-dismiss', function (e) {
                $.post(prs_data.wp_post, 'action=prs_resetKeywordNotification', function (d) {
                    $('.keyword-error-notification').attr("hidden",true);
                });
            });
        }
    };

    /**
     *  Global doc.ready function
     */
    $(document).ready(function(){
        actions.keywordNotification();
    });

})( jQuery );