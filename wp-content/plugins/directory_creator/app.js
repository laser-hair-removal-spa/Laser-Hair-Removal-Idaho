(function() {
    tinymce.PluginManager.add('har_mce_button', function( editor, url ) {
        editor.addButton( 'har_mce_button', {
            text: '[DC-Shortcode]',
            type: 'menubutton',
            icon: false,
            menu: [ 
               {
                    text: '[state_name]',
                    value: '[state_name]',
                    onclick: function() {
                        editor.insertContent(this.value());
                    }
                },
               {
                    text: '[city_name]',
                    value: '[city_name]',
                    onclick: function() {
                        editor.insertContent(this.value());
                    }
                },
                {
                    text: '[keyword]',
                    value: '[keyword]',
                    onclick: function() {
                        editor.insertContent(this.value());
                    }
                },                
               {
                    text: '[state_link]',
                    value: '[state_link]',
                    onclick: function() {
                        editor.insertContent(this.value());
                    }
                },
           ]
        });
    });
})();