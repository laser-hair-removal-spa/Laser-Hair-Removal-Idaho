var currentSchema = null;
var schemas = null;
var savedSchemas = null;
var dbg = true;
var previousSchemas = [];

var timeout;

(function( $ ) {
    'use strict';

    $(document).ready(function(){
        // Load huge schema file into variable
        schemaEditor.loadSchemas(schemaEditor.init);
    });

    var schemaEditor = {
        init: function(){
            // Render the New Schemas
            schemaEditor.renderSchemas();

            // Search for Schemas
            schemaEditor.searchSchemas();

            // Pick a Schema
            schemaEditor.pickSchema();
        },
        dbg: function(d) {if (dbg) {console.info(d);}},
        loadSchemas: function(callBack){
            $.getJSON(prs_data.plugins_url + '/project-supremacy-v3/assets/js/schemas.json', function(d){
                if (d.hasOwnProperty('valid')) {
                    schemas = d;
                    callBack();
                } else {
                    return false;
                }
            });
        },
        searchSchemas: function() {
            $( ".schema-search").focusout(function(){
                $(this).val('');
                $(this).trigger('keydown');
            });
            $( ".schema-search" ).keydown(function() {
                clearTimeout(timeout);
                var u = $(this).next();
                var v = $(this).val();
                timeout = setTimeout(function(){
                    u.find('li').each(function(){
                        var t = $(this).data('type');
                        if (v == '') {
                            $(this).show();
                        } else {
                            if (t.toLowerCase().containsText(v.toLowerCase())) {
                                $(this).show();
                            } else {
                                $(this).hide();
                            }
                        }
                    });
                }, 300);
            });
        },
        renderSchemas: function() {
            $('.schema-editor-new-schemas').each(function(){
                var u = $(this).find('ul');
                var stringBuilder = [];
                schemaEditor.dbg('Rendering '+schemas.types.length+' [NEW] Schemas');
                for(var key in schemas.types) {
                    stringBuilder.push(
                        '<li class="schema-editor-pick" data-schema="new" data-type="'+key+'">' + key + '</li>'
                    );
                }
                u.html(stringBuilder.join("\n"));
            });
        },
        pickSchema: function(){
            $('.schema-editor-pick').click(function(){
                var type = $(this).data('type');
                var schema = $(this).data('schema');
                previousSchemas = [];
                if (schema == 'new') {
                    schemaEditor.renderNewSchema($(this), type);
                } else if (schema == 'saved') {
                    schemaEditor.renderNewSchema($(this), type, $(this).data('values'));
                }
            });
        },
        renderBreadCrumbs: function(){
            var breadcrumbs = $('.schema-location');
            breadcrumbs.empty();
            for(var i = 0; i < previousSchemas.length; i++) {
                if (i == previousSchemas.length -1) {
                    breadcrumbs.append(
                        '<li><span class="uk-active">'+previousSchemas[i]+'</span></li>'
                    );
                } else {
                    breadcrumbs.append(
                        '<li><a href="#">'+previousSchemas[i]+'</a></li>'
                    );
                }
            }
        },
        renderNewSchema: function(e,s) {
            // Render Breadcrumbs so we can get back
            previousSchemas.push(s);
            schemaEditor.renderBreadCrumbs();

            var schema = schemas.types[s];
            var schemaEditorMain, contentEditor, output, i;

            schemaEditorMain = e.parents('.schema-editor');
            contentEditor = schemaEditorMain.find('.schema-editor-content-editor');

            var schemaName = contentEditor.find('.schema-name');
            var schemaComment = contentEditor.find('.schema-comment');

            //Set an array where to store properties");
            var structure = [];

            //Change the Title / Comment");
            schemaName.html(schema.label);
            schemaComment.html(schema.comment);

            //Set the current Schema");
            currentSchema = schema;

            //Remove old properties");
            var properties = contentEditor.find('.schema-properties');
            properties.empty();

            // Get all properties
            var allProperties = [];

            // Get all ancestor Schema properties
            for(i = 0; i < currentSchema.ancestors.length; i++) {
                for(var pi = 0; pi < schemas.types[currentSchema.ancestors[i]].properties.length; pi++) {
                    allProperties.push(schemas.types[currentSchema.ancestors[i]].properties[pi]);
                }
            }

            // Get all selected Schema properties
            for(i = 0; i < currentSchema.properties.length; i++) {
                allProperties.push(currentSchema.properties[i]);
            }

            allProperties = $.unique(allProperties);

            // Create property structure
            for(i = 0; i < allProperties.length; i++) {
                output = schemaEditor.renderProperty(
                    allProperties[i]
                );
                structure.push(output);
            }

            // Append the structure
            for(var i = 0; i < structure.length; i++) {
                properties.append(structure[i]);
            }
        },
        renderSavedSchema: function(e,s,v) {

        },
        renderProperty: function(p) {
            var property = $('.property.template').clone();
            property.attr('data-property', p);

            //Find the actual property json for ["+p+"]");
            p = schemas.properties[p];

            //Remove the template class so it will be displayed");
            property.removeClass('template');

            //Set the name and comment ("+p.label+", "+p.comment_plain+")");
            property.find('.name').html(p.label);
            property.find('.comment').html(p.comment_plain);

            //Clear out the dropdown for datatypes");
            var dropDownDataTypes = property.find('.dropdown');
            dropDownDataTypes.empty();

            //Get the first data type for ["+ p.label+"]");
            var firstDataType = p.ranges[0];

            //Array for storing html DataTypes");
            var dataTypes = [];

            //Generate items for DropDown");
            for(var i = 0; i < p.ranges.length; i++) {
                dataTypes.push(
                    '<option value="'+p.ranges[i]+'">'+p.ranges[i]+'</option>'
                );
            }

            //Insert Data Types");
            dropDownDataTypes.html(dataTypes.join("\n"));

            //Remove Dropdown if there is only one range member");
            if (p.ranges.length == 1) {
                dropDownDataTypes.remove();
            }

            //Render first DataType");
            firstDataType = schemaEditor.renderDataType(firstDataType);

            //Insert the first DataType");
            property.find('.data-type').html(firstDataType);

            //Return the generated property");
            return property;
        },
        renderDataType: function(n) {
            var structure = [];
            switch (n) {
                case "Text":
                    structure.push(
                        '<input type="text" />'
                    );
                    break;
                case "URL":
                    structure.push(
                        '<input type="text" />'
                    );
                    break;
                case "Date":
                    structure.push(
                        '<input data-uk-datepicker="{format:\'DD.MM.YYYY\'}" type="text" />'
                    );
                    break;
                case "DateTime":
                    structure.push(
                        '<input data-uk-datepicker="{format:\'DD.MM.YYYY\'}" type="text" />'
                    );
                    break;
                case "Float":
                    structure.push(
                        '<input type="number" />'
                    );
                    break;
                case "Integer":
                    structure.push(
                        '<input type="number" />'
                    );
                    break;
                case "Number":
                    structure.push(
                        '<input type="number" />'
                    );
                    break;
                default:
                    // This is a class
                    if (schemas.types.hasOwnProperty(n)) {
                        structure.push(
                            '<div class="uk-badge">'+n+'</div> <button class="uk-button uk-button-mini uk-button-primary edit-inner-schema" type="button"><i class="fa fa-edit"></i></button>'
                        );
                    } else {
                        structure.push(
                            '<b>'+n+'</b>'
                        );
                    }
                    break;
            }
            return structure.join("\n");
        }
    };

})( jQuery );
