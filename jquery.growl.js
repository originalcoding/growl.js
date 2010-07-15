/**
 * jQuery plugin for growl.js.
 * @author Pavlo Kapyshin (i@93z.org, admin@93z.org)
 * @copyright Original Coding (http://originalcoding.com/)
 */


(function ($) {
    /**
      * Makes setup for global Growl object.
      * @param {Object} settings Settings for Growl
      * @return {jQuery} Object we called this method on
      */
    $.fn.growl = function (settings) {
        var growlSettings = Growl.settings || {};
        var settings = (settings) ?
            mergeObjects(growlSettings, settings) : settings || {};
        
        // selector will be object we called this method on
        var selector = $(this);
        
        settings.selector = selector;
        
        // reinitialize Growl
        Growl.init(settings);
    
        return selector;
    };
    
    // shortcut
    if (!$.g) {
        $.g = Growl;
    };
    
    // regular name
    $.growl = Growl;
    
})(jQuery);
