(function () {

    tinymce.PluginManager.add('prs_keywords', function (editor, url) {

        var groups = [];
        var group = {};

        if (prs_tinymce_data.keywords.length < 1) {
            group = {
                text: 'No Keywords',
                value: 'There are no available keywords for this post/page!',
                onclick: function () {
                    editor.insertContent(this.value());
                }
            };
            groups.push(group);
        } else {
            jQuery.each(prs_tinymce_data.keywords, function (index, value) {

                group = {
                    text: (index !== '') ? index : '--- Unnamed ---',
                    menu: []
                };

                jQuery.each(value, function (i, v) {

                    var body = [
                        {
                            type: 'textbox',
                            name: 'url',
                            label: 'Anchor URL:',
                            value: (v.url === "") ? '' : document.location.protocol + '//' + document.location.host + '/' + v.url + '/',
                            placeholder: 'eg. http://mywebsite.com/url'
                        },
                        {
                            name: 'capitalize',
                            type: 'checkbox',
                            label: 'Capitalize first word:'
                        },
                        {
                            name: 'target',
                            type: 'checkbox',
                            label: 'Open in new window:'
                        }
                        ];

                    var keyword = {
                        text: v.keyword,
                        value: '[prs_project_keyword]',
                        onclick: function () {
                            editor.windowManager.open({
                                title: 'Keyword - ' + v.keyword,
                                width: 800,
                                height: 150,
                                body: body,
                                onsubmit: function (e) {
                                    editor.insertContent('[prs_project_keyword keyword="' + v.keyword + '" url="' + e.data.url + '" capitalize=' + e.data.capitalize + ' target='+e.data.target+']');
                                }
                            });
                        }
                    };

                    group.menu.push(keyword);
                });


                groups.push(group);
            });
        }

        editor.addButton('prs_keywords', {
            title: 'Project Keywords',
            type: 'menubutton',
            image: prs_data.plugins_url + 'assets/img/keywords.png',
            menu: groups
        });
    });
})();
