(function( $ ) {
    'use strict';

    /**
     * All of the code for your admin-specific JavaScript source
     * should reside in this file.
     *
     * Note that this assume you're going to use jQuery, so it prepares
     * the $ function reference to be used within the scope of this
     * function.
     *
     * From here, you're able to define handlers for when the DOM is
     * ready:
     *
     * $(function() {
	 *
	 * });
     *
     * Or when the window is loaded:
     *
     * $( window ).load(function() {
	 *
	 * });
     *
     * ...and so on.
     *
     * Remember that ideally, we should not attach any more than a single DOM-ready or window-load handler
     * for any particular page. Though other scripts in WordPress core, other plugins, and other themes may
     * be doing this, we should try to minimize doing that in our own work.
     */


    /**
     *  Global doc.ready function
     */
    $(document).ready(function(){
        /**
         *  Initiate slider checkboxes
         */
        // Enable sliders

        $(document).on('click', '.prs-slider-frame .slider-button', function () {
            var slider = $(this);
            var attr = $(this).attr('data-element');

            if ( slider.hasClass('on') ) {
                slider.removeClass('on').html('No');
                $('#' + attr).val(0).trigger('change');
                if (attr === 'popup') {
                    $('span[data-element="popup_text"]').parents('.slider-container').hide();
                    $('span[data-element="exit_popup"]').parents('.slider-container').hide();
                }
            } else {
                slider.addClass('on').html('Yes');
                $('#' + attr).val(1).trigger('change');
                if (attr === 'popup') {
                    $('span[data-element="popup_text"]').parents('.slider-container').show();
                    $('span[data-element="exit_popup"]').parents('.slider-container').show();
                }
            }
        });

        $('.prs-settings-form').submit(function(e){
            e.preventDefault();

            $.post(prs_data.wp_post, $(this).serialize(), function(d){
                UIkit.notify("<i class='uk-icon-check'></i> Your settings have been saved.", {pos:'bottom-right', status:"success"});
            });
        });

        // Set the selected option of selects
        $('select').each(function(){
            var attr = $(this).attr('data-value');
            if (typeof attr !== typeof undefined && attr !== false && attr !== '') {
                $(this).val(attr);
            }
        });

        $(document).on('click', '.uk-button-show-tutorial', function () {
            let button = $(this);
            let page = button.attr('data-page');
            let tut_modal = $('#tutorials');
            tut_modal.find('.uk-modal-body').empty();
            button.disable('Loading...');

            let data = {
                action : 'prs_show_tutorial',
                page   : page
            };
            $.post(prs_data.wp_post, data, function(d){

                button.disable();

                if ( d.status == 'success' ) {
                    var data = d.data['videos'];

                    for ( var i = 0; i < data.length; i++ ) {
                        var obj = data[i];
                        let count = i + 1;

                        var tutorial_holder = $('.tut_holder.hide').clone();
                        tutorial_holder.find('h2').html('Video - ' + count);
                        tutorial_holder.find('iframe').attr('src', 'https://www.youtube.com/embed/' + obj);
                        tutorial_holder.removeClass('hide');

                        tut_modal.find('.uk-modal-body').append(tutorial_holder);
                    }

                    UIkit.modal(tut_modal).show();
                }


            });
        });
    });


})( jQuery );

function isBlank(value) {
    return typeof value === 'string' && !value.trim() || typeof value === 'undefined' || value === null || value === 0;
}

String.prototype.containsText = function(it) { return this.indexOf(it) != -1; };
String.prototype.isJSON = function() { var json; try { json = JSON.parse(this); } catch (e) { return this; } return json; };

jQuery.fn.selectText = function(){
    this.find('input').each(function() {
        if($(this).prev().length == 0 || !$(this).prev().hasClass('p_copy')) {
            $('<p class="p_copy" style="position: absolute; z-index: -1;"></p>').insertBefore($(this));
        }
        $(this).prev().html($(this).val());
    });
    var doc = document;
    var element = this[0];

    if (doc.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

jQuery.extend({
    highlight: function (node, re, nodeName, className) {
        if (node.nodeType === 3) {
            var match = node.data.match(re);
            if (match) {
                var highlight = document.createElement(nodeName || 'span');
                highlight.className = className || 'highlight';
                var wordNode = node.splitText(match.index);
                wordNode.splitText(match[0].length);
                var wordClone = wordNode.cloneNode(true);
                highlight.appendChild(wordClone);
                wordNode.parentNode.replaceChild(highlight, wordNode);
                return 1; //skip added node in parent
            }
        } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
            !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
            !(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
            for (var i = 0; i < node.childNodes.length; i++) {
                i += jQuery.highlight(node.childNodes[i], re, nodeName, className);
            }
        }
        return 0;
    }
});


jQuery.fn.unhighlight = function (options) {
    var settings = { className: 'highlightCloud', element: 'span' };
    jQuery.extend(settings, options);

    return this.find(settings.element + "." + settings.className).each(function () {
        var parent = this.parentNode;
        parent.replaceChild(this.firstChild, this);
        parent.normalize();
    }).end();
};

jQuery.fn.highlight = function (words, options) {
    var settings = { className: 'highlightCloud', element: 'span', caseSensitive: true, wordsOnly: true };
    jQuery.extend(settings, options);

    if (words.constructor === String) {
        words = [words];
    }
    words = jQuery.grep(words, function(word, i){
        return word != '';
    });
    words = jQuery.map(words, function(word, i) {
        return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    });
    if (words.length == 0) { return this; };

    var flag = settings.caseSensitive ? "" : "i";
    var pattern = "(" + words.join("|") + ")";
    if (settings.wordsOnly) {
        pattern = "\\b" + pattern + "\\b";
    }
    var re = new RegExp(pattern, flag);

    return this.each(function () {
        jQuery.highlight(this, re, settings.element, settings.className);
    });
};

// Disable Element
jQuery.fn.extend({
    uploader: function (data, allowedExtension, callback) {
        return this.each(function () {
            var modal = jQuery(this);
            var progressBar = modal.find(".uk-progress");
            var bar = progressBar.find('.uk-progress-bar');
            var settings = {

                action: prs_data.wp_post + '?' + data,
                allow: '*.(' + allowedExtension + ')',
                param: 'file-import',
                filelimit: 1,
                loadstart: function () {
                    bar.css("width", "0%").text("0%");
                    progressBar.removeClass("uk-hidden");
                },
                progress: function (percent) {
                    percent = Math.ceil(percent);
                    bar.css("width", percent + "%").text(percent + "%");
                    UIkit.modal(modal).hide();
                    if (percent == 100) {
                        modal_block = UIkit.modal.blockUI('<div class="uk-text-center"><i class="fa fa-refresh fa-spin"></i> Importing ' + allowedExtension.toUpperCase() + '...<br><div class="uk-progress uk-progress-striped uk-active"><div class="uk-progress-bar" style="width: 100%;"></div></div></div>');
                    }
                },
                allcomplete: function (response) {

                    if (modal_block != '') {
                        modal_block.hide();
                    }
                    bar.css("width", "100%").text("100%");

                    progressBar.addClass("uk-hidden");
                    UIkit.notify("<i class='uk-icon-check'></i> Successfully imported " + allowedExtension.toUpperCase() + ".", {
                        pos: 'bottom-right',
                        status: "success"
                    });

                    callback();

                }
            };
            UIkit.uploadSelect(modal.find(".file-import"), settings);
            UIkit.uploadDrop(modal.find(".upload-drop"), settings);
        });
    },
    disable: function (message) {
        return this.each(function () {
            var i = jQuery(this).find('i');
            if (typeof jQuery(this).attr('disabled') == 'undefined') {
                if (i.length > 0) {
                    i.attr('class-backup', i.attr('class'));
                    i.attr('class', 'fa fa-refresh fa-spin');
                }
                if (typeof message != 'undefined') {
                    jQuery(this).attr('text-backup', jQuery(this).text());
                    jQuery(this).text(' ' + message);
                    jQuery(this).prepend(i);
                }
                jQuery(this).attr('disabled', 'disabled');
            } else {
                jQuery(this).removeAttr('disabled');
                if (i.length > 0) i.attr('class', i.attr('class-backup'));
                if (typeof jQuery(this).attr('text-backup') != 'undefined') {
                    jQuery(this).text(' ' + jQuery(this).attr('text-backup'));
                    jQuery(this).prepend(i);
                }
            }
        });
    }
});