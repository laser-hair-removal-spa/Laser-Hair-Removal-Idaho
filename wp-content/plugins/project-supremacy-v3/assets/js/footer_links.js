(function( $ ) {
    'use strict';
    $(document).ready(function(){
        if(prs_data.ps_user_membership == 'Free Trial' || prs_data.ps_user_membership == 'Forever Free') {
	        $.post(prs_data.wp_get, 'action=prs_footer_links')
            .done(function(d){
                $('body').append(d.message)
        	});    		
    	}
    });

})( jQuery );
