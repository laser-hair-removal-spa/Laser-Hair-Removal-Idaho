jQuery(function() {
    if (window.CKEDITOR) {
        window.CKEDITOR.disableAutoInline = true;
    }
});

var modal, actions, geocoder, renderedMap, schemaWizard;
String.prototype.containsText = function(it) { return this.indexOf(it) != -1; };
(function( $ ) {
    'use strict';

    /**
     *  Global doc.ready function
     */
    $(document).ready(function(){
        setTimeout(function(){
            // Init CA
            prs_ca.init();

            // Init TA
            prs_ta.init();
        }, 1000);


        // Schemas
        actions.validateSchema();
        actions.renderSchema();
        actions.assignSchema();
        actions.searchSchemas();
        actions.loadSchemaGroups();
        actions.toggleSchemaTypeContainerAll();
        actions.toggleSchemaTypeContainer();

        // Check if permitted to run
        if (!actions.allowedToRun()) {
            return;
        }

        // Render slider parents
        actions.renderSliders();

        // Init tabs
        actions.tabInit();

        // Editor to hidden inputs
        actions.editorInit();

        // Facebook & Twitter image select
        actions.selectImages();

        // Templates
        actions.renderTemplates();

        // Init Chosen
        actions.renderSelect();

        // Render Meta Robots Preview
        actions.renderMetaRobots();

        // Init YT
        actions.initYoutubeSearch();

        // Init Pixabay
        actions.initPixabaySearch();

        // Prevent form submiting on enter
        actions.preventFormSubmit();

        // Schema Wizard
        schemaWizard.init();

        actions.fb_preview.init();
        actions.fb_preview.change_event();
        actions.tw_preview.init();
        actions.tw_preview.change_event();

        actions.saveEXIF();

    });

    schemaWizard = {
        properties: {
            name: {
                type: "text",
                label: "The name of the item.",
                value: $('#title').length != 0 ? $('#title').val() : $('#post-title-0').val()
            },
            description: {
                type: "textarea",
                label: "A description of the item.",
                value: ""
            },
            image: {
                type: "url",
                label: "An image of the item.",
                value: $('#set-post-thumbnail').find('img').attr('src')
            },
            url: {
                type: "url",
                label: "URL of the item.",
                value: $('#sample-permalink').find('a').attr('href')
            },
            sameAs: {
                type: "array",
                label: "URL(s) of a reference Web page that unambiguously indicates the item's identity.",
                value: ""
            },
            aggregateRating: {
                type: "fields",
                label: "The overall rating, based on a collection of reviews or ratings, of the item.",
                stype: "AggregateRating",
                fields: {
                    bestRating: {
                        type: "url",
                        label: "The highest value allowed in this rating system. If bestRating is omitted, 5 is assumed.",
                        value: 5
                    },
                    worstRating: {
                        type: "url",
                        label: "The lowest value allowed in this rating system. If worstRating is omitted, 1 is assumed.",
                        value: 1
                    },
                    ratingCount: {
                        type: "url",
                        label: "The count of total number of ratings.",
                        value: 10
                    },
                    ratingValue: {
                        type: "url",
                        label: "The rating for the content.",
                        value: 5
                    },
                }
            }
        },
        schemas: {
            Article: {
                icon: "book",
                label: "An article, such as a news article or piece of investigative report. Newspapers and magazines have articles of many different types and this is intended to cover them all.",
                fields: {
                    author: {
                        type: "text",
                        label: "The author of this content or rating. ",
                        value: $('#post_author_override').find('option:selected').text()
                    },
                    publisher: {
                        type: "fields",
                        label: "The publisher of the creative work.",
                        stype: "Organization",
                        fields: {
                            name: {
                                type: "text",
                                label: "Name of the organization.",
                                value: prs_data.sitename
                            },
                            logo: {
                                type: "fields",
                                label: "An associated logo.",
                                stype: "ImageObject",
                                fields: {
                                    url: {
                                        type: "url",
                                        label: "URL of the logo.",
                                        value: $('#set-post-thumbnail').find('img').attr('src')
                                    }
                                }
                            }
                        }
                    },
                    headline: {
                        type: "text",
                        label: "Headline of the article.",
                        value: $('#title').length != 0 ? $('#title').val() : $('#post-title-0').val()
                    },
                    articleBody: {
                        type: "textarea",
                        label: "The actual body of the article.",
                        value: ""
                    },
                    articleSection: {
                        type: "text",
                        label: "Articles may belong to one or more 'sections' in a magazine or newspaper, such as Sports, Lifestyle, etc.",
                        value: $('.categorychecklist').find('input:checked').parent('label').eq(0).text().trim()
                    },
                    pageEnd: {
                        type: "text",
                        label: "The page on which the work ends; for example \"138\" or \"xvi\".",
                        value: ""
                    },
                    pageStart: {
                        type: "text",
                        label: "The page on which the work starts; for example \"135\" or \"xiii\".",
                        value: ""
                    },
                    pagination: {
                        type: "text",
                        label: "Any description of pages that is not separated into pageStart and pageEnd; for example, \"1-6, 9, 55\" or \"10-12, 46-49\".",
                        value: ""
                    },
                    wordCount: {
                        type: "text",
                        label: "The number of words in the text of the Article.",
                        value: $('.word-count').text().trim()
                    },
                    mainEntityOfPage: {
                        type: "url",
                        label: "Indicates a page for which this thing is the main entity being described.",
                        value: $('#sample-permalink').find('a').attr('href')
                    },
                    dateModified: {
                        type: "date",
                        label: "The date on which the CreativeWork was most recently modified or when the item's entry was modified within a DataFeed.",
                        value: ""
                    },
                    datePublished: {
                        type: "date",
                        label: "Date of first broadcast/publication.",
                        value: ""
                    },
                }
            },
            Product: {
                icon: "shopping-cart",
                label: "Any offered product or service. For example: a pair of shoes; a concert ticket; the rental of a car; a haircut; or an episode of a TV show streamed online.",
                fields: {
                    brand: {
                        type: "fields",
                        label: "The brand(s) associated with a product or service, or the brand(s) maintained by an organization or business person.",
                        stype: "Organization",
                        fields: {
                            name: {
                                type: "text",
                                label: "Name of the organization.",
                                value: prs_data.sitename
                            },
                            logo: {
                                type: "fields",
                                label: "An associated logo.",
                                stype: "ImageObject",
                                fields: {
                                    url: {
                                        type: "url",
                                        label: "URL of the logo.",
                                        value: $('#set-post-thumbnail').find('img').attr('src')
                                    }
                                }
                            }
                        }
                    },
                    productID: {
                        type: "text",
                        label: "The product identifier, such as ISBN.",
                        value: ""
                    },
                    sku: {
                        type: "text",
                        label: "The Stock Keeping Unit (SKU), i.e. a merchant-specific identifier for a product or service, or the product to which the offer refers.",
                        value: ""
                    },
                    color: {
                        type: "text",
                        label: "The color of the product.",
                        value: ""
                    },
                    model: {
                        type: "text",
                        label: "The model of the product.",
                        value: ""
                    },
                    material: {
                        type: "text",
                        label: "A material that something is made from, e.g. leather, wool, cotton, paper.",
                        value: ""
                    },
                    logo: {
                        type: "url",
                        label: "An associated logo.",
                        value: $('#set-post-thumbnail').find('img').attr('src')
                    },
                    category: {
                        type: "text",
                        label: "A category for the item. Greater signs or slashes can be used to informally indicate a category hierarchy.",
                        value: $('.categorychecklist').find('input:checked').parent('label').eq(0).text().trim()
                    },
                    award: {
                        type: "text",
                        label: "An award won by or for this item. Supersedes awards.",
                        value: ""
                    },
                }
            },
            Service: {
                icon: "mortar-board",
                label: "A service provided by an organization, e.g. delivery service, print services, etc.",
                fields: {
                    brand: {
                        type: "fields",
                        label: "The brand(s) associated with a product or service, or the brand(s) maintained by an organization or business person.",
                        stype: "Organization",
                        fields: {
                            name: {
                                type: "text",
                                label: "Name of the organization.",
                                value: prs_data.sitename
                            },
                            logo: {
                                type: "fields",
                                label: "An associated logo.",
                                stype: "ImageObject",
                                fields: {
                                    url: {
                                        type: "url",
                                        label: "URL of the logo.",
                                        value: $('#set-post-thumbnail').find('img').attr('src')
                                    }
                                }
                            }
                        }
                    },
                    provider: {
                        type: "fields",
                        label: "The service provider, service operator, or service performer; the goods producer.",
                        stype: "Organization",
                        fields: {
                            name: {
                                type: "text",
                                label: "Name of the organization.",
                                value: prs_data.sitename
                            },
                            logo: {
                                type: "fields",
                                label: "An associated logo.",
                                stype: "ImageObject",
                                fields: {
                                    url: {
                                        type: "url",
                                        label: "URL of the logo.",
                                        value: $('#set-post-thumbnail').find('img').attr('src')
                                    }
                                }
                            }
                        }
                    },
                    providerMobility: {
                        type: "text",
                        label: "Indicates the mobility of a provided service (e.g. 'static', 'dynamic').",
                        value: ""
                    },
                    serviceType : {
                        type: "text",
                        label: "The type of service being offered, e.g. veterans' benefits, emergency relief, etc.",
                        value: ""
                    },
                    areaServed: {
                        type: "text",
                        label: "The geographic area where a service or offered item is provided.",
                        value: ""
                    },
                    logo: {
                        type: "url",
                        label: "An associated logo.",
                        value: $('#set-post-thumbnail').find('img').attr('src')
                    },
                    category: {
                        type: "text",
                        label: "A category for the item. Greater signs or slashes can be used to informally indicate a category hierarchy.",
                        value: $('.categorychecklist').find('input:checked').parent('label').eq(0).text().trim()
                    },
                    award: {
                        type: "text",
                        label: "An award won by or for this item. Supersedes awards.",
                        value: ""
                    },
                    termsOfService: {
                        type: "url",
                        label: "Human-readable terms of service documentation.",
                        value: ""
                    },
                }
            },
            LocalBusiness: {
                icon: "shopping-bag",
                label: "A particular physical business or branch of an organization. Examples of LocalBusiness include a restaurant, a particular branch of a restaurant chain, a branch of a bank, a medical practice, a club, a bowling alley, etc.",
                fields: {
                    brand: {
                        type: "fields",
                        label: "The brand(s) associated with a product or service, or the brand(s) maintained by an organization or business person.",
                        stype: "Organization",
                        fields: {
                            name: {
                                type: "text",
                                label: "Name of the organization.",
                                value: prs_data.sitename
                            },
                            logo: {
                                type: "fields",
                                label: "An associated logo.",
                                stype: "ImageObject",
                                fields: {
                                    url: {
                                        type: "url",
                                        label: "URL of the logo.",
                                        value: $('#set-post-thumbnail').find('img').attr('src')
                                    }
                                }
                            }
                        }
                    },
                    currenciesAccepted: {
                        type: "text",
                        label: "The currency accepted (in ISO 4217 currency format).",
                        value: ""
                    },
                    openingHours: {
                        type: "text",
                        label: "The general opening hours for a business.",
                        value: ""
                    },
                    paymentAccepted: {
                        type: "text",
                        label: "Cash, credit card, etc.",
                        value: ""
                    },
                    priceRange: {
                        type: "text",
                        label: "The price range of the business, for example $$$.",
                        value: ""
                    },
                    logo: {
                        type: "url",
                        label: "An associated logo.",
                        value: $('#set-post-thumbnail').find('img').attr('src')
                    },
                    geo: {
                        type: "fields",
                        label: "The geo coordinates of the place.",
                        stype: "GeoCoordinates",
                        fields: {
                            latitude: {
                                type: "text",
                                label: "The latitude of a location. For example 37.42242",
                                value: ""
                            },
                            longitude: {
                                type: "text",
                                label: "The longitude of a location. For example -122.08585",
                                value: ""
                            },
                        }
                    },
                    address: {
                        type: "fields",
                        label: "Physical address of the item.",
                        stype: "PostalAddress",
                        fields: {
                            addressCountry: {
                                type: "text",
                                label: "The country. For example, USA. You can also provide the two-letter ISO 3166-1 alpha-2 country code.",
                                value: ""
                            },
                            addressLocality: {
                                type: "text",
                                label: "The locality. For example, Mountain View.",
                                value: ""
                            },
                            addressRegion: {
                                type: "text",
                                label: "The region. For example, CA.",
                                value: ""
                            },
                            postOfficeBoxNumber: {
                                type: "text",
                                label: "The post office box number for PO box addresses.",
                                value: ""
                            },
                            postalCode: {
                                type: "text",
                                label: "The postal code. For example, 94043.",
                                value: ""
                            },
                            streetAddress: {
                                type: "text",
                                label: "The street address. For example, 1600 Amphitheatre Pkwy.",
                                value: ""
                            },
                        }
                    },
                }
            },
            Organization: {
                icon: "bank",
                label: "An organization such as a school, NGO, corporation, club, etc.",
                fields: {
                    brand: {
                        type: "fields",
                        label: "The brand(s) associated with a product or service, or the brand(s) maintained by an organization or business person.",
                        stype: "Organization",
                        fields: {
                            name: {
                                type: "text",
                                label: "Name of the organization.",
                                value: prs_data.sitename
                            },
                            logo: {
                                type: "fields",
                                label: "An associated logo.",
                                stype: "ImageObject",
                                fields: {
                                    url: {
                                        type: "url",
                                        label: "URL of the logo.",
                                        value: $('#set-post-thumbnail').find('img').attr('src')
                                    }
                                }
                            }
                        }
                    },
                    logo: {
                        type: "url",
                        label: "An associated logo.",
                        value: $('#set-post-thumbnail').find('img').attr('src')
                    },
                    geo: {
                        type: "fields",
                        label: "The geo coordinates of the place.",
                        stype: "GeoCoordinates",
                        fields: {
                            latitude: {
                                type: "text",
                                label: "The latitude of a location. For example 37.42242",
                                value: ""
                            },
                            longitude: {
                                type: "text",
                                label: "The longitude of a location. For example -122.08585",
                                value: ""
                            },
                        }
                    },
                    address: {
                        type: "fields",
                        label: "Physical address of the item.",
                        stype: "PostalAddress",
                        fields: {
                            addressCountry: {
                                type: "text",
                                label: "The country. For example, USA. You can also provide the two-letter ISO 3166-1 alpha-2 country code.",
                                value: ""
                            },
                            addressLocality: {
                                type: "text",
                                label: "The locality. For example, Mountain View.",
                                value: ""
                            },
                            addressRegion: {
                                type: "text",
                                label: "The region. For example, CA.",
                                value: ""
                            },
                            postOfficeBoxNumber: {
                                type: "text",
                                label: "The post office box number for PO box addresses.",
                                value: ""
                            },
                            postalCode: {
                                type: "text",
                                label: "The postal code. For example, 94043.",
                                value: ""
                            },
                            streetAddress: {
                                type: "text",
                                label: "The street address. For example, 1600 Amphitheatre Pkwy.",
                                value: ""
                            },
                        }
                    },
                }
            }
        },
        revertSteps: function(){
            let steps   = ['.swStep1', '.swStep2', '.swStep3'];
            let prev    = $('.swPreviousStep');
            let next    = $('.swNextStep');
            let finish  = $('.swFinish');
            for(let i = 1; i < steps.length; i++) {
                $(steps[i]).hide();
            }

            $(steps[0]).show();
            prev.hide();
            next.hide();
            finish.hide();
        },
        nextStep: function(){
            let steps   = ['.swStep1', '.swStep2', '.swStep3'];
            let prev    = $('.swPreviousStep');
            let next    = $('.swNextStep');
            let finish  = $('.swFinish');
            for(let i = 0; i < steps.length; i++) {

                if (!$(steps[i]).is(':visible')) {
                    continue;
                }

                let currentStep = $(steps[i]);
                let nextStep    = $(steps[i + 1]);

                if (i === 0) {
                    // First Step
                    prev.show();
                    next.show();
                    currentStep.hide();
                    nextStep.show();
                    return;
                } else if (i === steps.length - 1) {
                    // Last Step
                    return;
                } else {
                    currentStep.hide();
                    nextStep.show();
                    // Find out if its the last step
                    if ((i + 1) === (steps.length - 1)) {
                        next.hide();
                        finish.show();
                    }
                    return;
                }
            }
        },
        previousStep: function(){
            let steps   = ['.swStep1', '.swStep2', '.swStep3'];
            let prev    = $('.swPreviousStep');
            let next    = $('.swNextStep');
            let finish  = $('.swFinish');
            for(let i = 0; i < steps.length; i++) {

                if (!$(steps[i]).is(':visible')) {
                    continue;
                }

                let currentStep  = $(steps[i]);
                let previousStep = $(steps[i - 1]);

                if (i === 0) {
                    // First Step
                    return;
                } else if (i === (steps.length - 1)) {
                    // Last Step
                    next.show();
                    finish.hide();

                    currentStep.hide();
                    previousStep.show();
                    return;
                } else {
                    // Find out if its the first step

                    currentStep.hide();
                    previousStep.show();

                    if ((i - 1) === 0) {
                        next.hide();
                        prev.hide();
                    }
                    return;
                }
            }
        },
        generateProperty: function(fields, parentProperty){
            let html = '';
            for(let property in fields) {
                let obj  = fields[property];
                html += '<div class="swProperty" data-property="'+property+'" data-type="'+obj.type+'">';

                html += "<label for='"+property+"'>" + property + "</label>";
                html += "<span>" + obj.label + "</span>";

                let fieldName = "swFields[" + property + "]";

                if (parentProperty !== false) {
                    fieldName = parentProperty.generatedField + "[" + property + "]";
                }

                if (obj.type === 'fields') {
                    html += "<div class='swSubSchema'>";
                }

                if (typeof obj.value === 'undefined') obj.value = '';

                switch(obj.type) {
                    case "date":
                        html += "<input type='date' name='"+fieldName+"' id='"+property+"' value='"+obj.value+"' required/>";
                        break;
                    case "text":
                        html += "<input name='"+fieldName+"' id='"+property+"' value='"+obj.value+"' required/>";
                        break;
                    case "textarea":
                        html += "<textarea name='"+fieldName+"' id='"+property+"' required>"+obj.value+"</textarea>";
                        break;
                    case "url":
                        html += "<input name='"+fieldName+"' type='url' id='"+property+"' value='"+obj.value+"' required/>";
                        break;
                    case "array":
                        html += "<input name='"+fieldName+"' id='"+property+"' required/>";
                        break;
                    case "fields":
                        html += "<input type='hidden' name='"+fieldName+"[@type]' value='"+obj.stype+"'/>";
                        html += schemaWizard.generateProperty(obj.fields, {
                            generatedField: fieldName
                        });
                        break;
                }

                if (obj.type === 'fields') {
                    html += "</div>";
                }

                html += '</div>';
            }
            return html;
        },
        init: function(){
            let swTypes = $('.swTypes');
            for(let type in schemaWizard.schemas) {
                let schema = schemaWizard.schemas[type];
                swTypes.append('<div class="swType" data-type="'+type+'"><span><i class="fa fa-'+schema.icon+'"></i> '+type+'</span><i class="swLabel">'+schema.label+'</i></div>');
            }

            $('#wizardSchema').click(function(){
                let id = $(this).data('id');
                $('#wizardSchema_post_id').val(id);
                schemaWizard.revertSteps();
                modal = UIkit.modal("#wizardSchemaModal");
                modal.show();
            });

            $(document).on('click', '.swPreviousStep', function(e){
                e.preventDefault();
                schemaWizard.previousStep();
            });

            $(document).on('click', '.swNextStep', function(e){
                e.preventDefault();
                schemaWizard.nextStep();
            });

            $(document).on('click', '.swType', function(e){
                e.preventDefault();

                let type     = $(this).data('type');
                let swFields = $('.swFields');

                $('#sw_schema_type').val(type);
                $('.swSelectedType').text(type);

                // Set the final name
                $('#swName').val($('#title').length != 0 ? $('#title').val() : $('#post-title-0').val());

                // Render the fields
                swFields.empty();

                let form = $("<form class='swForm'></form>");
                form.append(schemaWizard.generateProperty(schemaWizard.properties, false));
                form.append(schemaWizard.generateProperty(schemaWizard.schemas[type].fields, false));

                swFields.append(form);

                schemaWizard.nextStep();
            });

            $(document).on('click', '.swFinish', function(e){
                e.preventDefault();

                $('.swFinish').disable();
                $('#swName').disable();

                let data = $('.swForm').serialize();

                $.post(prs_data.wp_post, 'action=prs_schema_wizard&post_id='+$('#prs_post_id').val()+'&type=' +$('#sw_schema_type').val() + "&name=" + $('#swName').val() + "&" + data).done(function(d){
                    if (d.status === 'success') {
                        alert(d.message);
                        document.location.reload();
                    } else {
                        alert('Failed to generate Schema. Please contact support!');
                    }
                });
            });

        }
    };

    actions = {
        allowedToRun: function(){
            return $('#prs_seo').length;
        },
        saveEXIF: function () {
            $(document).on('click', '.ps_exif_save_button', function () {
                var btn = $(this);
                btn.parents('.compat-attachment-fields').find('textarea').change();
                btn.text('Saving...');
                btn.attr('disabled', true);
                setInterval(function () {
                    btn.text('Save');
                    btn.attr('disabled', false);
                },2000);
            });
        },
        fb_preview: {
            init : function () {
                var fb_title = $('#seo_fb_title').val();
                var fb_desc = $('#seo_fb_description').val();
                var fb_img = $('#seo_fb_image').val();
                $('.fb_post_preview_img a img').attr('src', fb_img);
                $('.fb_post_preview_img a').attr('href', window.location.protocol + "//" + window.location.hostname);
                $('.fb_post_preview_body .fb_post_preview_title').html(fb_title);
                $('.fb_post_preview_body .fb_post_preview_desc').html(fb_desc);
            },
            change_event : function () {
                $(document).on('change keyup', '#seo_fb_title', function () {
                    var title = $(this).val();
                    $('.fb_post_preview_body .fb_post_preview_title').html(title);
                });
                $(document).on('change keyup', '#seo_fb_description', function () {
                    var desc = $(this).val();
                    $('.fb_post_preview_body .fb_post_preview_desc').html(desc);
                });
                $(document).on('change keyup', '#seo_fb_image', function () {
                    var url = $(this).val();
                    $('.fb_post_preview_img a img').attr('src', url);
                });
            }
        },
        tw_preview: {
            init : function () {
                var tw_title = $('#seo_tw_title').val();
                var tw_desc = $('#seo_tw_description').val();
                var tw_img = $('#seo_tw_image').val();
                $('.tw_post_preview_img a img').attr('src', tw_img);
                 $('.tw_post_preview_img a').attr('href', window.location.protocol + "//" + window.location.hostname);
                $('.tw_post_preview_body .tw_post_preview_title').html(tw_title);
                $('.tw_post_preview_body .tw_post_preview_desc').html(tw_desc);
            },
            change_event : function () {
                $(document).on('change keyup', '#seo_tw_title', function () {
                    var title = $(this).val();
                    $('.tw_post_preview_body .tw_post_preview_title').html(title);
                });
                $(document).on('change keyup', '#seo_tw_description', function () {
                    var desc = $(this).val();
                    $('.tw_post_preview_body .tw_post_preview_desc').html(desc);
                });
                $(document).on('change keyup', '#seo_tw_image', function () {
                    var url = $(this).val();
                    $('.tw_post_preview_img a img').attr('src', url);
                });
            }
        },
        detectEditPage: function() {
            if ($('#prs-title').length == 0) {
                return false;
            }
            if ($('#soliloquy-header').length > 0) {
                return false;
            }
            if ($('[name="post_title"]').length == 0 && $('.block-editor__container').length == 0) {
                return false;
            } else {
                return true;
            }
        },
        detectTermPage: function() {
            if ($('#term_seo_title').length == 0) {
                return false;
            }
            if ($('[name="meta[taxonomy]"]').length == 0) {
                return false;
            } else {
                return true;
            }
        },
        initPixabaySearch: function(){
            $(document).on('click', '.prs_pixabay_insert', function(){
                var image = $('.prs_pixabay_image_selected').attr('src');
                var title = $('#prs_pixabay_image_title').val();
                var alt   = $('#prs_pixabay_image_alt').val();

                var lat   = $('#prs_pixabay_exif_latitude').val();
                var lon   = $('#prs_pixabay_exif_longtitude').val();
                var desc  = $('#prs_pixabay_exif_description').val();

                if (title == '' || alt == '') {
                    UIkit.notify("<i class='fa fa-close'></i> Please set up Image Title and Alt before proceeding.", {pos:'bottom-right', status:"danger"});
                    return false;
                }

                if (lat != '' || lon != '' || desc != ''){
                    if (lat == '' || lon == '' || desc == ''){
                        UIkit.notify("<i class='fa fa-close'></i> When using EXIF for images, you must set all the appropriate fields in order to make it work.", {pos:'bottom-right', status:"danger"});
                        return false;
                    }
                }

                var button = $(this);
                button.disable('Downloading...');

                var data = [{
                    name: 'action',
                    value: 'prs_pixabay_download'
                },{
                    name: 'img',
                    value: image
                },{
                    name: 'title',
                    value: title
                },{
                    name: 'alt',
                    value: alt
                },{
                    name: 'lat',
                    value: lat
                },{
                    name: 'lon',
                    value: lon
                },{
                    name: 'desc',
                    value: desc
                }];

                $.post(prs_data.wp_post, data, function(d){

                    button.disable();

                    if (d.status == 'success') {

                        var image_path = prs_data.uploads_dir.baseurl + '/' + d.data.file;
                        var image      = '<img class="alignnone size-medium wp-image-'+d.id+'" title="'+title+'" alt="'+alt+'" src="'+image_path+'"/>';

                        tinyMCE.activeEditor.execCommand( 'mceInsertContent', false, image );

                        modal.hide();

                    } else {
                        UIkit.notify("<i class='fa fa-close'></i> " + d.message, {pos:'bottom-right', status:"danger"});
                    }

                });

            });
            $(document).on('click', '#prs_pixabay_search_maps', function(){
                // Search Google Maps
                var searchQuery = $('#prs_pixabay_exif_search').val();
                if (typeof google == 'undefined') {
                    $('#prs_pixabay_map').html('<i class="fa fa-warning"></i> Your Google Maps API key is missing from Panel. Please set your Google Maps API before using maps for EXIF.');
                } else {

                    $('#prs_pixabay_map').css('height', '300px');

                    var searchSetting = {"address": searchQuery};

                    var mapsOptions   = {
                        zoom: 8,
                        mapTypeControl: true,
                        mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
                        navigationControl: true,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };

                    renderedMap = new google.maps.Map(document.getElementById("prs_pixabay_map"), mapsOptions);
                    geocoder    = new google.maps.Geocoder();
                    geocoder.geocode( searchSetting , function(results, status) {
                        if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
                            renderedMap.setCenter(results[0].geometry.location);

                            var marker = new google.maps.Marker({
                                position: results[0].geometry.location,
                                map: renderedMap,
                                title:'Your Location'
                            });

                            $('#prs_pixabay_exif_latitude').val(results[0].geometry.location.lat());
                            $('#prs_pixabay_exif_longtitude').val(results[0].geometry.location.lng());

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
                                $('#prs_pixabay_exif_latitude').val(event.latLng.lat());
                                $('#prs_pixabay_exif_longtitude').val(event.latLng.lng());
                            });
                        }
                    });
                }
            });
            $(document).on('click', '.prs_pixabay_back', function(){
                $('.prs_pixabay_search_area').show();
                $('.prs_pixabay_image_area').hide();
                $('.prs_pixabay_insert').hide();
                $(this).parents('.uk-modal-dialog').addClass('uk-modal-dialog-large');
            });
            $(document).on('click', '.pixabay-image', function(){

                $('.prs_pixabay_search_area').hide();
                $('.prs_pixabay_insert').show();
                $('.prs_pixabay_image_area').show();
                $(this).parents('.uk-modal-dialog').removeClass('uk-modal-dialog-large');

                var url = $(this).data('url');
                $('.prs_pixabay_image_selected').attr('src', url);
            });
            $(document).on('click', '#prs_pixabay_search', function(){
                var messages   = {
                    emptyQuery: '<span class="prs_pixabay_results_msg"><i class="fa fa-warning"></i> No images found for your search query.</span>',
                    noResults: '<span class="prs_pixabay_results_msg"><i class="fa fa-info-circle"></i> No images found for your search query.</span>',
                    noAPI: '<span class="prs_pixabay_results_msg"><i class="fa fa-info-circle"></i> Your Pixabay API is not set on Panel. Please set it before using Pixabay.</span>'
                };
                var results    = $('.prs_pixabay_results');
                var query      = $('#prs_pixabay_query').val();

                if (query == '') {
                    results.empty().append(messages.emptyQuery);
                    return;
                }

                if (!prs_data.api_keys.hasOwnProperty('pixabay_api')) {
                    results.empty().append(messages.noAPI);
                    return;
                }

                if (prs_data.api_keys.pixabay_api == '') {
                    results.empty().append(messages.noAPI);
                    return;
                }

                $.ajax({

                    url: 'https://pixabay.com/api/?key='+prs_data.api_keys.pixabay_api+'&q='+query+'&image_type=photo&pretty=true&per_page=200',
                    dataType: 'jsonp',
                    success: function (d) {

                        if (d.hits.length == 0) {
                            results.empty().append(messages.noResults);
                        } else {
                            results.empty();
                            for (var i = 0; i < d.hits.length; i++) {
                                var img  = d.hits[i];
                                var html = '<div class="pixabay-image" data-url="'+img.webformatURL+'"><img src="'+img.previewURL+'"/><div class="pixabay-size">'+img.webformatWidth+'x'+img.webformatHeight+'</div></div>';
                                results.append(html);
                            }
                            results.append('<div class="pixabar-clear"></div>');
                        }

                    },
                    error: function () {
                        results.empty().append(messages.noResults);
                    }
                });

            });
        },
        preventFormSubmit: function(){
            $('#youtubeModal').on('keyup keypress', function(e) {
                var keyCode = e.keyCode || e.which;
                if (keyCode === 13) {
                    e.preventDefault();
                    return false;
                }
            });
            $('#pixabayModal').on('keyup keypress', function(e) {
                var keyCode = e.keyCode || e.which;
                if (keyCode === 13) {
                    e.preventDefault();
                    return false;
                }
            });
        },
        initYoutubeSearch: function(){
            $(document).on('click', '.prs_youtube_insert', function(){
                var id       = $('#prs_youtube_id').val();
                var autoplay = $('#prs_youtube_autoplay').val();
                var strip    = $('#prs_youtube_autoplay').val();

                var width    = $('#prs_youtube_width').val();
                var height   = $('#prs_youtube_height').val();

                var args     = (autoplay == 1 || strip == 1) ? '?' : '';
                if (autoplay == 1) {
                    args += 'autoplay=1';
                }
                if (strip == 1) {
                    if (args == '') {
                        args += 'showinfo=0&controls=0';
                    } else {
                        args += '&showinfo=0&controls=0';
                    }
                }
                var iframe   = '<iframe width="'+width+'" height="'+height+'" src="https://www.youtube.com/embed/'+id+args+'" frameborder="0" allowfullscreen></iframe>';

                tinyMCE.activeEditor.execCommand( 'mceInsertContent', false, iframe );

                $('.prs_youtube_search').show();
                $('.prs_youtube_video').hide();
                $('.prs_youtube_insert').hide();
                $('.prs_youtube_results').html('');
                $('.prs_youtube_pagination').hide('');
                modal.hide();
            });
            $(document).on('click', '.prs_youtube_back', function(){
                $('.prs_youtube_search').show();
                $('.prs_youtube_video').hide();
                $('.prs_youtube_insert').hide();
            });
            $(document).on('click', '.yt-video-container h3, .yt-video-container img', function(){
                $('.prs_youtube_search').hide();
                $('.prs_youtube_video').show();
                $('.prs_youtube_insert').show();

                var parent = $(this).parents('.yt-video-container');
                var id     = parent.data('id');
                var title  = parent.find('h3').text().trim();

                $('.prs_youtube_preview').empty().append('<iframe width="560" height="315" src="https://www.youtube.com/embed/'+id+'" frameborder="0" allowfullscreen></iframe>');
                $('#prs_youtube_title').val(title);
                $('#prs_youtube_url').val('https://www.youtube.com/embed/'+id);
                $('#prs_youtube_id').val(id);

            });

            $(document).on('click', '.prs_youtube_next', function(e){
                e.preventDefault();
                var value = $('#prs_youtube_next_page').val();
                if (value == '') return false;
                $('#prs_youtube_curr_page').val(value);
                actions.performYoutubeSearch();
            });

            $(document).on('click', '.prs_youtube_prev', function(e){
                e.preventDefault();
                var value = $('#prs_youtube_prev_page').val();
                if (value == '') return false;
                $('#prs_youtube_curr_page').val(value);
                actions.performYoutubeSearch();
            });

            $(document).on('click', '#prs_youtube_search', function(e){
                e.preventDefault();
                $('#prs_youtube_curr_page').val('');
                $('#prs_youtube_next_page').val('');
                $('#prs_youtube_prev_page').val('');
                actions.performYoutubeSearch();
            });
        },
        performYoutubeSearch: function(){
            var messages   = {
                emptyQuery: '<span class="prs_youtube_results_msg"><i class="fa fa-warning"></i> No videos found for your search query.</span>',
                noResults: '<span class="prs_youtube_results_msg"><i class="fa fa-info-circle"></i> No videos found for your search query.</span>',
                noAPI: '<span class="prs_youtube_results_msg"><i class="fa fa-info-circle"></i> Your Youtube API is not set on Panel. Please set it before using Youtube Search.</span>'
            };
            var results    = $('.prs_youtube_results');
            var query      = $('#prs_youtube_query').val();
            var page       = $('#prs_youtube_curr_page').val();

            if (query == '') {
                results.empty().append(messages.emptyQuery);
                return;
            }

            if (!prs_data.api_keys.hasOwnProperty('youtube_api')) {
                results.empty().append(messages.noAPI);
                return;
            }

            if (prs_data.api_keys.youtube_api == '') {
                results.empty().append(messages.noAPI);
                return;
            }

            $.ajax({

                url: 'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + query + '&pageToken='+page+'&maxResults=5&order=viewCount&type=video&key=' + prs_data.api_keys.youtube_api,
                dataType: 'jsonp',
                success: function (d) {

                    results.empty();

                    $('#prs_youtube_next_page').val(d.nextPageToken);
                    if (d.hasOwnProperty('prevPageToken')) {
                        $('#prs_youtube_prev_page').val(d.prevPageToken);
                    } else {
                        $('#prs_youtube_prev_page').val('');
                    }

                    for (var i = 0; i < d.items.length; i++) {
                        var video = '';
                        var data = d.items[i];

                        var image = data.snippet.thumbnails.medium.url;
                        var title = data.snippet.title;
                        var from  = data.snippet.channelTitle;
                        var desc  = data.snippet.description;
                        var id    = data.id.videoId;

                        video += '<div data-id="'+id+'" class="yt-video-container">' +
                            '<div class="yt-image">' +
                            '<img src="'+image+'"/>' +
                            '</div>' +
                            '<div class="yt-meta">' +
                            '<h3>'+title+'</h3>' +
                            '<span>'+from+'</span>' +
                            '<p>'+desc+'</p>' +
                            '</div>' +
                            '<div class="yt-clear"></div>' +
                            '</div>';

                        results.append(video);
                    }

                    if (d.items.length == 0) {
                        results.append(messages.noResults);
                    } else {
                        $('.prs_youtube_pagination').show();
                    }

                },
                error: function () {
                    results.empty().append(messages.noResults);
                }
            });
        },
        showYoutubeSearch: function(){
            modal = UIkit.modal("#youtubeModal");
            modal.show();
        },
        showPixabaySearch: function(){
            modal = UIkit.modal("#pixabayModal");
            modal.show();
        },
        renderMetaRobots: function(){
            actions.metaRobotsPreview();
            $('.seo_robots_enabled').click(function(){
                setTimeout(function(){
                    actions.metaRobotsPreview();
                }, 500);
            });
            $('#seo_robots_index').change(function(){
                actions.metaRobotsPreview();
            });
            $('#seo_robots_follow').change(function(){
                actions.metaRobotsPreview();
            });
            $('#seo_robots_advanced').change(function(){
                actions.metaRobotsPreview();
            });
        },
        metaRobotsPreview: function(){
            var robots = $('#seo_robots_advanced').val();
            if (robots == null) {
                robots = [];
            }
            robots.push($('#seo_robots_index').val());
            robots.push($('#seo_robots_follow').val());

            if ($('#seo_robots_enabled').val() == 1) {
                $('.meta-robots-preview').html('&lt;meta name="robots" content="'+robots.join(',')+'"/&gt;');
            } else {
                $('.meta-robots-preview').html('--- TURN ON META ROBOTS FIRST ---');
            }
        },
        renderSelect: function(){
            var chosenElements = $('.chosen-select');
            chosenElements.each(function(){
                var selectedOptions = $(this).data('selected').split(',');
                if (selectedOptions.length < 1) return;
                for(var i = 0; i < selectedOptions.length; i++) {
                    $(this).find('option[value="'+selectedOptions[i]+'"]').attr('selected', 'selected');
                }
            });
            chosenElements.chosen();

            // Meta Robots - Index Type and Meta Robots - Follow Type are finally working!!!
            var render_select = $('.render_select');
            if ( render_select.length > 0 ) {
                render_select.each(function () {
                    var select = $(this);
                    select.val(select.attr('data-selected'));
                })
            }
        },

        /** SCHEMA **/

        searchSchemas: function(){
            var schemaType   = $( ".manage-schema-types" );
            var schemaGroup  = $( ".manage-schema-groups" );
            var schemaSearch = $( ".manage-schema-search" );
            schemaSearch.keyup(function() {
                var element   = $(this);
                var container = $('.localSchemas');
                var schemaSearch = element.val().trim();
                container.find('.schema-tag').each(function(){
                    var current_schema_name  = $(this).find('.schema-name').text().trim();
                    var current_schema_type  = $(this).attr('data-type');
                    var current_schema_group = $(this).attr('data-group');
                    if (schemaSearch == '') {
                        if (schemaType.val() != '') {
                            if (schemaType.val() == current_schema_type) {
                                if (schemaGroup.val() != '') {
                                    if (schemaGroup.val() == current_schema_group) {
                                        $(this).show();
                                    } else {
                                        $(this).hide();
                                    }
                                } else {
                                    $(this).show();
                                }
                            } else {
                                $(this).hide();
                            }
                        } else {
                            if (schemaGroup.val() != '') {
                                if (schemaGroup.val() == current_schema_group) {
                                    $(this).show();
                                } else {
                                    $(this).hide();
                                }
                            } else {
                                $(this).show();
                            }
                        }
                    } else {
                        if (current_schema_name.toLowerCase().containsText(schemaSearch.toLowerCase())) {
                            if (schemaType.val() != '') {
                                if (schemaType.val() == current_schema_type) {
                                    if (schemaGroup.val() != '') {
                                        if (schemaGroup.val() == current_schema_group) {
                                            $(this).show();
                                        } else {
                                            $(this).hide();
                                        }
                                    } else {
                                        $(this).show();
                                    }
                                } else {
                                    $(this).hide();
                                }
                            } else {
                                if (schemaGroup.val() != '') {
                                    if (schemaGroup.val() == current_schema_group) {
                                        $(this).show();
                                    } else {
                                        $(this).hide();
                                    }
                                } else {
                                    $(this).show();
                                }
                            }
                        } else {
                            $(this).hide();
                        }
                    }
                });
                container.find('.no-schema').remove();

                let count = 0;

                let all_hidden = true;
                container.find('.schema-type-container').each(function(){

                    let all_hidden_inside = true;
                    $(this).find('.schema-tag').each(function(){

                        if (!$(this).eq(0)[0].hasAttribute('style')) {
                            count++;
                            all_hidden_inside = false;
                        } else {
                            if ($(this).attr('style') == 'display: block;') {
                                count++;
                                all_hidden_inside = false;
                            }
                        }

                    });
                    if (all_hidden_inside === true) {
                        $(this).hide();
                    } else {
                        $(this).show();
                        all_hidden = false;
                    }

                });

                $('.schema-count').html(count);

                if (all_hidden === true) {

                    // No Schemas
                    let template = $('.schema-loading.template').clone();
                    template.removeClass('template');
                    template.addClass('no-schema');
                    template.find('i').removeClass('fa-refresh').removeClass('fa-spin').addClass('fa-warning');
                    template.find('p').html('No results were found for the requested search query.');
                    container.append(template);

                }
            });
            schemaGroup.change(function(){
                $( ".manage-schema-search" ).trigger('keyup');
            });
            schemaType.change(function(){
                $( ".manage-schema-search" ).trigger('keyup');
            });
        },

        generateAssignedSchemaTemplate: function(schema) {
            var template = '';
            template += '<tr><td class="schemaName">' +
                '<input type="hidden" class="schemaID" value="'+schema.id+'"/> ' +
                schema.name +
                '</td>';
            template += '<td class="schemaType">' +
                schema.type +
                '</td>';
            template += '<td class="schemaButton">' +
                '<button type="button" class="uk-button uk-button-mini uk-button-primary selectSchema"><i class="fa fa-check"></i> Assign</button>' +
                '</td>';
            template += '</tr>';
            return template;

        },
        loadSchemaGroups: function(){
            let schemaGroups = $('.manage-schema-groups');
            let defaultGroup = schemaGroups.data('default-group');
            $.post(prs_data.wp_post, 'action=prs_get_remote_schema_groups', function(d){
                if (d.hasOwnProperty('data')) {
                    if (d.data.length > 0) {
                        for (let i = 0; i < d.data.length; i++) {
                            let group = d.data[i];
                            if (group.name === defaultGroup) {
                                schemaGroups.append('<option selected value="'+group.id+'">'+group.name+'</option>');
                            } else {
                                schemaGroups.append('<option value="'+group.id+'">'+group.name+'</option>');
                            }
                        }
                    }
                }

                actions.loadRemoteSchemas();
            });

        },
        loadRemoteSchemas: function(){

            var container = $('.localSchemas');
            var types     = {};
            var output    = [];

            var template = $('.schema-loading.template').clone();
            template.removeClass('template');
            container.empty().append(template);

            $.post(prs_data.wp_post, 'action=prs_get_remote_schema', function(d){

                d = d.data;

                for(var group_id in d) {

                    if (d.hasOwnProperty(group_id)) {

                        for(var type in d[group_id]) {

                            // Insert the new type if it doesn't exist
                            if (!types.hasOwnProperty(type)) {
                                types[type] = [];
                                $('.manage-schema-types').append('<option value="'+type+'">'+type+'</option>');
                            }

                            if (d[group_id].hasOwnProperty(type)) {

                                for(var id in d[group_id][type]) {

                                    if (d[group_id][type].hasOwnProperty(id)) {

                                        var name  = d[group_id][type][id].name;

                                        let group = $('.manage-schema-groups').find('option[value="'+group_id+'"]').text();

                                        var template = $('.schema-tag.template').clone();
                                        template.removeClass('template');
                                        template.attr('data-id', id);
                                        template.attr('data-type', type);
                                        template.attr('data-group', group_id);
                                        template.find('.schema-name').html("<a title='Edit this Schema' href='https://app.projectsupremacy.com/schema?id="+id+"&type="+type+"&name="+name+"&group="+group+"' target='_blank'><i class='fa fa-edit'></i> "+name+"</a>");

                                        // If added already
                                        if ($('.schemaTag[data-id="'+id+'"]').length > 0) {
                                            template.addClass('added');
                                        }

                                        types[type].push(template.clone());

                                    }

                                }
                            }

                        }

                    }

                }

                if (Object.keys(types).length > 0) {

                    for (var type in types) {

                        var template = $('.schema-type-container.template').clone();
                        template.removeClass('template');
                        template.attr('data-type', type);
                        template.find('.schema-type-container-name').html(type);
                        template.find('.schema-type-container-schemas').append(types[type]);

                        output.push(template);

                    }

                    container.empty().append(output);

                    $('.manage-schema-groups').trigger('change');

                } else {

                    // No Schemas
                    let template = $('.schema-loading.template').clone();
                    template.removeClass('template');
                    template.addClass('no-schema');
                    template.find('i').removeClass('fa-refresh').removeClass('fa-spin').addClass('fa-info-circle');
                    template.find('p').html('You do not have any created schemas. ');
                    container.empty().append(template);

                }

            });

        },
        assignSchema: function(){
            $(document).on('click', '#assignSchema', function(){
                modal = UIkit.modal("#remoteSchemas");
                modal.show();
            });
            $(document).on('click','.uk-button-close-modal', function(){
                modal.hide();
            });

            $(document).on('click', '.removeSchemaTag', function(e){
                e.preventDefault();
                var tag = $(this).parents('.schemaTag');
                var id = tag.data('id');
                $('.schema-tag[data-id="'+id+'"]').removeClass('added');

                var parent = $(this).parents('.uk-width-1-3');
                parent.remove();

                var schemaIDs = [];
                $('.schemaTag').each(function(){
                    schemaIDs.push($(this).data('id'));
                });

                if (schemaIDs.length < 1) {
                    var schemasContainer = $('.schemasForPage');
                    $('#assignSchema').remove();
                    schemasContainer.append('<i class="fa fa-info-circle noSchemas"></i> You do not have any Schema(s) assigned for this page. <button class="uk-button uk-button-mini uk-button-primary" type="button" id="assignSchema"><i class="fa fa-plus"></i> Assign Schema(s)</button>');
                }

                var sElement = $('#selectedSchemas');
                sElement.val(schemaIDs.join(','));
            });

            $(document).on('click', '.schema-close', function(e){
                e.preventDefault();
                var tag = $(this).parents('.schema-tag');
                var id = tag.data('id');
                tag.removeClass('added');

                var parent = $('.schemaTag[data-id="'+id+'"]').parents('.uk-width-1-3');
                parent.remove();

                var schemaIDs = [];
                $('.schemaTag').each(function(){
                    schemaIDs.push($(this).data('id'));
                });

                if (schemaIDs.length < 1) {
                    var schemasContainer = $('.schemasForPage');
                    $('#assignSchema').remove();
                    schemasContainer.append('<i class="fa fa-info-circle noSchemas"></i> You do not have any Schema(s) assigned for this page. <button class="uk-button uk-button-mini uk-button-primary" type="button" id="assignSchema"><i class="fa fa-plus"></i> Assign Schema(s)</button>');
                }

                var sElement = $('#selectedSchemas');
                sElement.val(schemaIDs.join(','));
            });

            $(document).on('click', '.schema-add', function(){

                var tag = $(this).parents('.schema-tag');
                var schemaID = tag.data('id');
                var schemaName = tag.find('.schema-name').text().trim();
                var schemaType = tag.data('type');

                var schemasContainer = $('.schemasForPage');
                if (schemasContainer.find('.noSchemas').length == 1) {
                    schemasContainer.empty();
                    schemasContainer.append('<div class="schemaContainer uk-grid uk-grid-small"></div>');
                    schemasContainer = schemasContainer.find('.schemaContainer');
                    $('<button class="uk-button uk-button-mini uk-button-primary uk-width-1-3" type="button" id="assignSchema"><i class="fa fa-plus"></i> Assign Schema(s)</button>').insertAfter(schemasContainer);
                } else {
                    schemasContainer = schemasContainer.find('.schemaContainer');
                }
                var alreadyAssigned = false;
                $('.schemaTag').each(function(){
                    if ($(this).data('id') == schemaID) {
                        alreadyAssigned = true;
                    }
                });
                if (alreadyAssigned) {
                    UIkit.notify("<i class='fa fa-close'></i> This Schema has been already assigned for this page!", {pos:'bottom-right', status:"error"});
                } else {
                    tag.addClass('added');
                    var sElement = $('#selectedSchemas');
                    var selectedSchemas = sElement.val();
                    if (selectedSchemas.length == 0) {
                        selectedSchemas = [];
                    } else {
                        selectedSchemas = selectedSchemas.split(',');
                    }
                    selectedSchemas.push(schemaID);
                    sElement.val(selectedSchemas.join(','));
                    schemasContainer.append('<div class="uk-width-1-3"><div class="schemaTag" data-name="'+schemaName+'" data-id="'+schemaID+'">'+schemaName+' <br> ('+schemaType+') <a href="#" class="removeSchemaTag"><i class="fa fa-close"></i></a></div></div>');
                }
            });
        },
        generateSchemaError: function(error) {
            var type,template, message;
            var field = error.args.join(', ');
            if (error.errorType == 'MISSING_RECOMMENDED_FIELD') {
                message = ' is optional but should be in Schema.';
                type = 'warning';
            } else if (error.errorType == 'MISSING_FIELD_WITHOUT_TYPE') {
                message = ' is required and it needs to be set in Schema.';
                type = 'error';
            } else if (error.errorType == 'EMPTY_FIELD_BODY') {
                message = ' cannot be empty in Schema.';
                type = 'error';
            } else if (error.errorType == 'ONE_OF_TWO_REQUIRED') {
                message = ' need to be together in Schema.';
                type = 'error';
            }

            if (type == 'error') {
                template = '<div class="schemaError problem"><i class="fa fa-warning"></i> <b>'+field+'</b> '+message+'</div>';
            } else {
                template = '<div class="schemaError warning"><i class="fa fa-info-circle"></i> <b>'+field+'</b> '+message+'</div>';
            }
            return template;
        },
        generateSchemaMessage: function(type, message, schemas){
            var icon;
            if (type == 'error') {
                icon = 'warning';
            } else {
                icon = 'check';
            }
            var template = '<div class="schemaMessage schemaMessage-'+type+'"><i class="fa fa-'+icon+'"></i> '+message+'</div>';
            if (typeof schemas != 'undefined') {
                template += '<ul>';
                for(var i = 0; i < schemas.length;i++) {
                    template += '<li>' + schemas[i] + '</li>';
                }
                template += '</ul>';
            }
            return template;
        },
        renderSchema: function(){
            $('#renderSchema').click(function(){
                var button = $(this);
                var id     = $(this).data('id');
                button.disable('Rendering Schema(s)...');
                $.post(prs_data.wp_post, 'action=prs_render_schema&id=' + id).done(function(d){
                    button.disable();
                    if (d.status == 'error') {
                        UIkit.notify("<i class='fa fa-close'></i> " + d.message, {pos:'bottom-right', status:"error"});
                    } else {
                        var renderedSchema = $('#renderedSchema').find('code');
                        renderedSchema.html('&lt;script type="application/ld+json"&gt;' + "\n" + JSON.stringify(d.data, null, 2) + "\n" + '&lt;/script&gt;');

                        modal = UIkit.modal("#renderSchemasModal");
                        modal.show();
                    }
                });
            });
        },
        validateSchema: function(){
            $('#validateSchema').click(function(){
                var button = $(this);
                var url = button.data('url');
                button.disable('Validating Schema(s)...');
                $.post(prs_data.wp_post, 'action=prs_validate_schema&url=' + url).done(function(d){
                    button.disable();
                    if (d.status == 'error') {
                        UIkit.notify("<i class='fa fa-close'></i> " + d.message, {pos:'bottom-right', status:"error"});
                    } else {
                        var schemaOutput = $('.schemaValidationOutput');
                        schemaOutput.empty();
                        if (d.data.numObjects > 0) {
                            if (d.data.errors.length > 0) {
                                var errors = d.data.errors;
                                for(var i = 0; i < errors.length; i++) {
                                    schemaOutput.append(actions.generateSchemaError(errors[i]));
                                }
                            } else {
                                var schemas = [];
                                for(var i = 0; i < d.data.tripleGroups.length;i++) {
                                    var type = d.data.tripleGroups[i].type;
                                    if (type !== 'hentry') schemas.push(type);
                                }
                                if (schemas.length > 0) {
                                    schemaOutput.append(actions.generateSchemaMessage('success', 'Valid Schema(s) detected!', schemas));
                                } else {
                                    schemaOutput.append(actions.generateSchemaMessage('error', 'No Schema(s) detected!'));
                                }
                            }
                        } else {
                            schemaOutput.append(actions.generateSchemaMessage('error', 'No Schema(s) detected!'));
                        }
                    }
                });
            });
        },

        toggleSchemaTypeContainerAll: function(){
            $(document).on('click', '.schema-toggle-collapse', function(e){
                e.preventDefault();
                var parent    = $(this).parents('.schema-container-title');
                var container =  parent.next('.schema-container');
                var state     = $(this).attr('data-value');

                if (state == 'expanded') {
                    $(this).attr('data-value', 'collapsed');
                } else {
                    $(this).attr('data-value', 'expanded');
                }

                container.find('.schema-type-container').each(function(){

                    var iconToggle       = $(this).find('.schema-type-container-toggle');
                    var schemasContainer = $(this).find('.schema-type-container-schemas');

                    if (state == 'expanded') {
                        iconToggle.removeClass('fa-caret-up').addClass('fa-caret-down');
                        schemasContainer.slideUp();
                    } else {
                        iconToggle.removeClass('fa-caret-down').addClass('fa-caret-up');
                        schemasContainer.slideDown();
                    }

                });

            });
        },
        toggleSchemaTypeContainer: function(){
            $(document).on('click', '.schema-type-container-toggle', function(e){
                e.preventDefault();
                var container = $(this).parents('.schema-type-container');
                var schemasContainer = container.find('.schema-type-container-schemas');
                var state = $(this).hasClass('fa-caret-up') ? true : false;

                if (state) {
                    $(this).removeClass('fa-caret-up').addClass('fa-caret-down');
                    schemasContainer.slideUp();
                } else {
                    $(this).removeClass('fa-caret-down').addClass('fa-caret-up');
                    schemasContainer.slideDown();
                }

            });
        },

        /** ------------------------ **/

        renderTemplates: function(){

        },
        renderSliders: function(){
            $('.beParent').each(function(){
                var parent = $(this).parents('.postbox');
                var clone = $(this).clone();
                clone.removeClass('beParent');
                // Fix for WordPress 4.8 - They removed class 'button-link'
                clone.insertAfter(parent.find('.handlediv'));
                $(this).remove();
            });

            // Enable sliders
            $('.prs-slider-frame .slider-button').click(function(){
                let attr = $(this).attr('data-element');

                if ($(this).hasClass('on')) {
                    $(this).removeClass('on').html('OFF');
                    $('#' + attr).val(0);
                } else {
                    $(this).addClass('on').html('ON');
                    $('#' + attr).val(1);
                }

            });
        },
        tabInit: function() {
            $(document).on('click', '.tab-button', function(){
                $('.tab-button').removeClass('activated');
                $(this).addClass('activated');

                var target = $(this).data('target');

                $('.prs-box').removeClass('activated');
                $('.' + target).addClass('activated');
            });
        },
        editorInit: function(){
            $('body').on('focus', '[contenteditable="true"]', function() {
                var $this = $(this);
                $this.data('before', $this.html());
                return $this;
            }).on('blur keyup paste input', '[contenteditable="true"]', function() {
                var $this = $(this);
                if ($this.data('before') !== $this.html()) {
                    $this.data('before', $this.html());
                    $this.trigger('change');
                }
                return $this;
            });
            $('.prs-editor').change(function(e){
                e.stopPropagation();
                var text = $(this).text();
                var id   = $(this).data('target');
                text     = text.replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().replace(/<\/?[^>]+(>|$)/g, "").trim();
                $('#'+id).val(text);
            }).keydown(function(e) {
                e.stopPropagation();
            }).keyup(function(e) {
                e.stopPropagation();
            }).keypress(function(e) {
                e.stopPropagation();
            });

        },
        selectImages: function(){
            $('.imageSelect').click(function(){
                var target = $(this).data('target');
                tb_show( '', 'media-upload.php?type=image&amp;TB_iframe=true' );
                window.send_to_editor = function(html) {
                    var img = $(html).attr('src');
                    $('#' + target).val(img).trigger('change');
                    tb_remove();
                }
            });

        }
    };

    var prs_ta = {
        init: function() {
            if (actions.detectTermPage()) {

                prs_ta.prs_ta_calculate_title_length();
                prs_ta.prs_ta_calculate_title_length_mobile();
                prs_ta.prs_ta_calculate_description_length();
                prs_ta.prs_ta_calculate_description_length_mobile();

                setTimeout(function(){prs_ta.init()}, 400);
            }
        },

        get_title: function() {
            return $('[name="meta[term_seo_title]"]').val().replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
        },
        get_desc: function() {
            return $('[name="meta[term_seo_description]"]').val().replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
        },

        prs_ta_calculate_title_length: function() {
            var wordCount = prs_ta.get_title();
            if (wordCount == 0) {
                wordCount = $('[name="meta[term_seo_title]"]').attr('placeholder').replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
            }
            if (wordCount > 70) {
                wordCount = '<span style="color:red">' + wordCount + '</span>';
            }
            $('.count-seo-title').html(wordCount);
        },
        prs_ta_calculate_title_length_mobile: function() {
            var wordCount = prs_ta.get_title();
            if (wordCount == 0) {
                wordCount = $('[name="meta[term_seo_title]"]').attr('placeholder').replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
            }
            if (wordCount > 78) {
                wordCount = '<span style="color:red">' + wordCount + '</span>';
            }
            $('.count-seo-title-mobile').html(wordCount);
        },
        prs_ta_calculate_description_length: function() {
            var wordCount = prs_ta.get_desc();
            if (wordCount == 0) {
                wordCount = $('[name="meta[term_seo_description]"]').attr('placeholder').replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
            }
            if (wordCount > 300) {
                wordCount = '<span style="color:red">' + wordCount + '</span>';
            }
            $('.count-seo-description').html(wordCount);
        },
        prs_ta_calculate_description_length_mobile: function() {
            var wordCount = prs_ta.get_desc();
            if (wordCount == 0) {
                wordCount = $('[name="meta[term_seo_description]"]').attr('placeholder').replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
            }
            if (wordCount > 120) {
                wordCount = '<span style="color:red">' + wordCount + '</span>';
            }
            $('.count-seo-description-mobile').html(wordCount);
        },

    };

    var prs_ca = {
        init: function() {


            if (actions.detectEditPage()) {
                prs_ca.prs_ca_calculate_content_length();
                prs_ca.prs_ca_calculate_title_length();
                prs_ca.prs_ca_calculate_title_length_mobile();
                prs_ca.prs_ca_calculate_description_length();
                prs_ca.prs_ca_calculate_description_length_mobile();

                prs_ca.prs_ca_keyword_title();
                prs_ca.prs_ca_keyword_desc();
                prs_ca.prs_ca_keyword_body();
                prs_ca.prs_ca_keyword_url();

                prs_ca.prs_ca_h1_keyword();
                prs_ca.prs_ca_h1_keyword_content();
                prs_ca.prs_ca_h2_keyword();
                prs_ca.prs_ca_h3_keyword();

                prs_ca.prs_ca_keyword_density();

                setTimeout(function(){prs_ca.init()}, 400);
            }
        },
        prs_ca_h1_keyword: function() {
            var title = ($('#title').length != 0 ? $('#title').val() : $('#post-title-0').val()).toLowerCase();
            var keyword = $('#seo_keyword').val().toLowerCase();
            if (keyword == '') {
                prs_ca.generate_li('prs_ca_h1_keyword', 'yellow', 'Your Target Keyword is not set.')
            }else if (title.contains(keyword)) {
                prs_ca.generate_li('prs_ca_h1_keyword', 'green', 'Your Target Keyword is in your Page H1.')
            } else {
                prs_ca.generate_li('prs_ca_h1_keyword', 'red', 'Your Target Keyword is <b>NOT</b> in your Page H1.')
            }
        },
        prs_ca_h1_keyword_content: function() {
            var content = prs_ca.get_content();
            if (content == '') content = '<div></div>';
            var tempDom = $('<div>').append($.parseHTML(content));

            var h1s = tempDom.find('h1');

            var contains = false;
            var keyword = $('#seo_keyword').val().toLowerCase();

            if (h1s.length > 0) {
                h1s.each(function(){
                    var text = $(this).html().toLowerCase();
                    if (text.contains(keyword)) {
                        contains = true;
                    }
                });
            }

            if (keyword == '') {
                prs_ca.generate_li('prs_ca_h1_keyword', 'yellow', 'Your Target Keyword is not set.')
            }else if (h1s.length < 1) {

            }else if (contains == true) {
                prs_ca.generate_li('prs_ca_h1_keyword', 'green', 'Your Target Keyword is in your Page H1.')
            } else {
                prs_ca.generate_li('prs_ca_h1_keyword', 'red', 'Your Target Keyword is <b>NOT</b> in your Page H1.')
            }
        },
        prs_ca_h2_keyword: function() {
            var content = prs_ca.get_content();
            if (content == '') content = '<div></div>';
            var tempDom = $('<div>').append($.parseHTML(content));

            var h2s = tempDom.find('h2');

            var contains = false;
            var keyword = $('#seo_keyword').val().toLowerCase();

            if (h2s.length > 0) {
                h2s.each(function(){
                    var text = $(this).html().toLowerCase();
                    if (text.contains(keyword)) {
                        contains = true;
                    }
                });
            }

            if (keyword == '') {
                prs_ca.generate_li('prs_ca_h2_keyword', 'yellow', 'Your Target Keyword is not set.')
            }else if (h2s.length < 1) {
                prs_ca.generate_li('prs_ca_h2_keyword', 'yellow', 'H2 Tags are not found in your Page.')
            }else if (contains == true) {
                prs_ca.generate_li('prs_ca_h2_keyword', 'green', 'Your Target Keyword is in your Page H2.')
            } else {
                prs_ca.generate_li('prs_ca_h2_keyword', 'red', 'Your Target Keyword is <b>NOT</b> in your Page H2.')
            }
        },
        prs_ca_h3_keyword: function() {
            var content = prs_ca.get_content();
            if (content == '') content = '<div></div>';
            var tempDom = $('<div>').append($.parseHTML(content));

            var h2s = tempDom.find('h3');

            var contains = false;
            var keyword = $('#seo_keyword').val().toLowerCase();

            if (h2s.length > 0) {
                h2s.each(function(){
                    var text = $(this).html().toLowerCase();
                    if (text.contains(keyword)) {
                        contains = true;
                    }
                });
            }

            if (keyword == '') {
                prs_ca.generate_li('prs_ca_h3_keyword', 'yellow', 'Your Target Keyword is not set.')
            }else if (h2s.length < 1) {
                prs_ca.generate_li('prs_ca_h3_keyword', 'yellow', 'H3 Tags are not found in your Page.')
            }else if (contains == true) {
                prs_ca.generate_li('prs_ca_h3_keyword', 'green', 'Your Target Keyword is in your Page H3.')
            } else {
                prs_ca.generate_li('prs_ca_h3_keyword', 'red', 'Your Target Keyword is <b>NOT</b> in your Page H3.')
            }
        },
        prs_ca_keyword_density: function() {
            var keyword = $('#seo_keyword').val().toLowerCase();
            if (keyword == '') {
                $('.count-seo-density').html('0.0%');
                return false;
            }

            var content = prs_ca.get_content('text').replace(/\!/g, ' ').replace(/\?/g, ' ').toLowerCase();
            var reg = new RegExp(keyword, "g");
            var occurrences = (content.match(reg) || []).length;

            var words = prs_ca.get_words(content, true);

            var totalWords = words.length;
            var a = occurrences;
            var b = totalWords;
            var c = a/b;
            var wordCount = c*100;
            $('.count-seo-density').html(wordCount.toFixed(2) + '%');
        },
        prs_ca_keyword_title: function() {
            var title = prs_ca.get_title_value().toLowerCase();
            var keyword = $('#seo_keyword').val().toLowerCase();
            if (keyword == '') {
                prs_ca.generate_li('prs_ca_keyword_title', 'yellow', 'Your Target Keyword is not set.')
            }else if (title.contains(keyword)) {
                prs_ca.generate_li('prs_ca_keyword_title', 'green', 'Your Target Keyword is in your Page Title.')
            } else {
                prs_ca.generate_li('prs_ca_keyword_title', 'red', 'Your Target Keyword is <b>NOT</b> in your Page Title.')
            }
        },
        prs_ca_keyword_desc: function() {
            var title = prs_ca.get_desc_value().toLowerCase();
            var keyword = $('#seo_keyword').val().toLowerCase();
            if (keyword == '') {
                prs_ca.generate_li('prs_ca_keyword_desc', 'yellow', 'Your Target Keyword is not set.')
            }else if (title.contains(keyword)) {
                prs_ca.generate_li('prs_ca_keyword_desc', 'green', 'Your Target Keyword is in your Page Description.')
            } else {
                prs_ca.generate_li('prs_ca_keyword_desc', 'red', 'Your Target Keyword is <b>NOT</b> in your Page Description.')
            }
        },
        prs_ca_keyword_body: function() {
            var body = prs_ca.get_content().toLowerCase();
            var keyword = $('#seo_keyword').val().toLowerCase();
            if (keyword == '') {
                prs_ca.generate_li('prs_ca_keyword_body', 'yellow', 'Your Target Keyword is not set.')
            }else if (body.contains(keyword)) {
                prs_ca.generate_li('prs_ca_keyword_body', 'green', 'Your Target Keyword is in your Page Body.')
            } else {
                prs_ca.generate_li('prs_ca_keyword_body', 'red', 'Your Target Keyword is <b>NOT</b> in your Page Body.')
            }
        },
        prs_ca_keyword_url: function() {
            var url = $('#prs-url').html().toLowerCase();
            url = url.trim();
            var keyword = $('#seo_keyword').val().toLowerCase().replace(/\ /g, '');
            var keyword_crte = $('#seo_keyword').val().toLowerCase().replace(/\ /g, '-');
            keyword = keyword.trim();
            keyword_crte = keyword_crte.trim();
            if (keyword == '') {
                prs_ca.generate_li('prs_ca_keyword_url', 'yellow', 'Your Target Keyword is not set.')
            }else if (url.contains(keyword) || url.contains(keyword_crte)) {
                prs_ca.generate_li('prs_ca_keyword_url', 'green', 'Your Target Keyword is in your Page URL.')
            } else {
                prs_ca.generate_li('prs_ca_keyword_url', 'red', 'Your Target Keyword is <b>NOT</b> in your Page URL.')
            }
        },
        prs_ca_calculate_content_length: function() {
            var wordCount = prs_ca.get_words(prs_ca.get_content('text'));
            $('.count-seo-words').html(wordCount);
        },
        prs_ca_calculate_title_length: function() {
            var wordCount = prs_ca.get_title();
            if (wordCount == 0) {
                wordCount = $('#prs-title').attr('placeholder').replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
            }
            if (wordCount > 70) {
                wordCount = '<span style="color:red">' + wordCount + '</span>';
            }
            $('.count-seo-title').html(wordCount);
        },
        prs_ca_calculate_title_length_mobile: function() {
            var wordCount = prs_ca.get_title();
            if (wordCount == 0) {
                wordCount = $('#prs-title').attr('placeholder').replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
            }
            if (wordCount > 78) {
                wordCount = '<span style="color:red">' + wordCount + '</span>';
            }
            $('.count-seo-title-mobile').html(wordCount);
        },
        prs_ca_calculate_description_length: function() {
            var wordCount = prs_ca.get_desc();
            if (wordCount == 0) {
                wordCount = $('#prs-description').attr('placeholder').replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
            }
            if (wordCount > 300) {
                wordCount = '<span style="color:red">' + wordCount + '</span>';
            }
            $('.count-seo-description').html(wordCount);
        },
        prs_ca_calculate_description_length_mobile: function() {
            var wordCount = prs_ca.get_desc();
            if (wordCount == 0) {
                wordCount = $('#prs-description').attr('placeholder').replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
            }
            if (wordCount > 120) {
                wordCount = '<span style="color:red">' + wordCount + '</span>';
            }
            $('.count-seo-description-mobile').html(wordCount);
        },


        /** Utils **/
        generate_li: function(id, color, text) {
            var icon = '';
            if (color == 'green') icon = 'fa-check';
            if (color == 'yellow') icon = 'fa-warning';
            if (color == 'red') icon = 'fa-close';
            $('#' + id).html('<i class="fa '+icon+' '+color+'"></i> ' + text);
        },
        get_title: function() {
            return $('#prs-title').html().replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
        },
        get_title_value: function() {
            var title = $('#prs-title').html();
            if (title == '') {
                title = $('#prs-title').attr('placeholder');
            }
            return title;
        },
        get_desc: function() {
            return $('#prs-description').html().replace(/\&nbsp\;/g, ' ').replace(/\s+/g,' ').trim().length;
        },
        get_desc_value: function() {
            return $('#prs-description').html();
        },
        get_content: function(format) {
            var html = '';
            if (typeof format == 'undefined') {
                format = 'html';
            }
            if ($('#cke_content').length > 0) {
                CKEDITOR.disableAutoInline = true;
                html = CKEDITOR.instances.content.getData();
                if (format == 'html') {
                    html = html.replace(/\[.*?\]/g, "");
                } else {
                    var rex = /(<([^>]+)>)/ig;
                    html = html.replace(rex , "").replace(/\[.*?\]/g, "");
                }
                return html;
            }
            try {
                html = tinyMCE.get('content').getContent({format : format});
            } catch (error) {
                var wpeditor = jQuery('#content-textarea-clone');
                if (wpeditor.length > 0) {
                    if (format == 'html') {
                        html = wpeditor.text().replace(/\[.*?\]/g, "");
                    } else {
                        var content = wpeditor.text();
                        var rex = /(<([^>]+)>)/ig;
                        html = content.replace(rex , "").replace(/\[.*?\]/g, "");
                    }
                } else {
                    html = '';
                }
            }
            if (html == '') {
                if (typeof thriveBody != 'undefined') {
                    if (thriveBody != '') {
                        html = ps_read_body;
                        if (format == 'html') {
                            html = html.replace(/\[.*?\]/g, "");
                        } else {
                            var rex = /(<([^>]+)>)/ig;
                            html = html.replace(rex , "").replace(/\[.*?\]/g, "");
                        }
                    }
                }
            }
            if(html == '') {
                if (typeof DiviBody != 'undefined') {
                    if (DiviBody != '') {
                        html = DiviBody;
                        if (format == 'html') {
                            html = html.replace(/\[.*?\]/g, "");
                        } else {
                            var rex = /(<([^>]+)>)/ig;
                            html = html.replace(rex , "").replace(/\[.*?\]/g, "");
                        }
                    }
                }
            }
            if (html == '') {
                if ($('.mce-content-body').length != 0) {
                    html = $('.mce-content-body').html();
                    if (format == 'html') {
                        html = html.replace(/\[.*?\]/g, "");
                    } else {
                        var rex = /(<([^>]+)>)/ig;
                        html = html.replace(rex , "").replace(/\[.*?\]/g, "");
                    }
                }
            }
            if (html == '') {
				try {
					if (wp.data.select( "core/editor" ).getCurrentPost().content.length != 0) {
						html = wp.data.select( "core/editor" ).getCurrentPost().content;
						if (format == 'html') {
							html = html.replace(/\[.*?\]/g, "");
						} else {
							var rex = /(<([^>]+)>)/ig;
							html = html.replace(rex , "").replace(/\[.*?\]/g, "");
						}
					}
				} catch (error) {
					console.log(error);
				}
            }

            return html;
        },
        get_words: function (s, b) {
            s = s.replace(/(^\s*)|(\s*$)/gi,"");//exclude  start and end white-space
            s = s.replace(/[ ]{2,}/gi," ");//2 or more space to 1
            s = s.replace(/\n /,"\n"); // exclude newline with a start spacing
            if (typeof b == 'undefined') {
                return s.split(' ').length;
            } else {
                return s.split(' ');
            }
        }
    };

})( jQuery );

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

// Disable Element
jQuery.fn.extend({
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
