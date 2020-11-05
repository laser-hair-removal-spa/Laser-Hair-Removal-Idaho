(function () {
    tinymce.PluginManager.add('prs_pixabay', function (editor, url) {
        editor.addButton('prs_pixabay', {
            title: 'Pixabay Image Search',
            image: prs_data.plugins_url + 'assets/img/image.png',
            onclick: function () {
                actions.showPixabaySearch();
            }
        });
    });
})();