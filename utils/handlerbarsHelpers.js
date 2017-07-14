"use strict";

const Handlebars = require('handlebars');

/**
 * Helper functions for Handlebars
 */


Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
    switch (operator) {
        case "==":
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case "===":
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case "!=":
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case "!==":
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case "<":
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case "<=":
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case ">":
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case ">=":
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case "&&":
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case "||":
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

Handlebars.registerHelper("metres2km" , ( value ) => {
    value /=1000;
    return +( Math.round(Number(value + "e+2") )  + "e-2");
})

Handlebars.registerHelper("nl2br" , (text, isXhtml) => {
    const breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
    return (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
});

Handlebars.registerHelper("encode" , (context, str) => {
    const uri = context || str;
    return new Handlebars.SafeString(encodeURIComponent(uri));
});

Handlebars.registerHelper("decimal-places" , ( value, precision) => {
    const multiplier = Math.pow(10, precision || 0);
    return new Handlebars.SafeString( (Math.round(value * multiplier) / multiplier).toFixed(precision) );
})

Handlebars.registerHelper("truncate", (str, len) => {
    if (str && str.length > len && str.length > 0) {
        let new_str = str + " ";
        new_str = str.substr(0, len);
        new_str = str.substr(0, new_str.lastIndexOf(" "));
        new_str = (new_str.length > 0) ? new_str : str.substr(0, len);

        return new Handlebars.SafeString(new_str + '...');
    }
    return str;
});

Handlebars.registerHelper('score-stars', (score) => {
    let out = "<div class='rating'>";

    for(let i=1; i<=5; i++) {
        if( score >=i) {
            out += "<span class='glyphicon glyphicon-star'></span>";
        } else {
            out += "<span class='glyphicon glyphicon-star-empty'></span>";
        }
    }

    return out + "</div>";
});

/**
 * Display a progress bar for the rating card
 */
Handlebars.registerHelper('score-bars', (ratings , totalRatings , numStars) => {
    let out = "<div class='progress'>";

    const rating = ratings.find( (element) => ( element.rating===numStars));
    const percentage = (totalRatings===0 || rating===undefined? 0 : (100/totalRatings) * rating.count);

    let barType = "info";

    switch( numStars) {
        case 5 :    barType = "success";
                    break;
        case 4 :    barType = "warning";
                    break;
        case 3 :    barType = "info";
                    break;
        case 2 :    barType = "info";
                    break;
        case 1 :    barType = "error";
                    break;
    }

    out += "<div class='progress-bar progress-bar-" + barType;
    out += "' role='progressbar' aria-valuenow='20'";
    out += "aria-valuemin='0' aria-valuemax='100' style='width: " + percentage + "%'>";

    out += "<span class='sr-only'>";
    out += percentage;
    out += "%</span>";


    return out + "</div></div>";
});

