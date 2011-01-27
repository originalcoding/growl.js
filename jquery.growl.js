/**
 * jQuery plugin for growl.js.
 * @author Pavlo Kapyshin (i@93z.org)
 * @copyright Original Coding (http://originalcoding.com/)
 */


(function ($) {
    /**
      * Growl.
      * @param {Object} settings Settings for Growl
      * @return {jQuery} Object we called this method on
      */
    $.fn.growl = function (settings) {
        var settings = settings || {},
            element = $(this);

        settings.element = element;
        var growl = new Growl(settings);

        if (!$.g) {
            $.g = growl;
        }

        $.growl = growl;

        return element;
    };

})(jQuery);
