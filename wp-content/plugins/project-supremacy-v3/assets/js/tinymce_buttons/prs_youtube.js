(function () {
    tinymce.PluginManager.add('prs_youtube', function (editor, url) {
        editor.addButton('prs_youtube', {
            title: 'YouTube Search',
            image: prs_data.plugins_url + 'assets/img/youtube.png',
            onclick: function () {
                actions.showYoutubeSearch();
            }
        });
    });
})();
