/**
 * @preserve License: BSD, see http://github.com/Kapishin/growl.js/blob/master/LICENSE
 * @description Glue code to provide Growl-like notifications.
 * @author Pavlo Kapyshin (i@93z.org, admin@93z.org)
 * @copyright Original Coding (http://originalcoding.com/)
 * @version 0.1
 */


var hasOwnProperty = function(obj, prop) {
    if (Object.prototype.hasOwnProperty) {
        return obj.hasOwnProperty(prop);
    };
    
    return typeof obj[prop] != 'undefined' && 
        obj.constructor.prototype[prop] !== obj[prop];
};


var mergeObjects = function () {
    var mergedObject = {};
    
    for (var i = 0, length = arguments.length; i < length; i++) {
        var object = arguments[i];
        
        for (var prop in object) {
            if (hasOwnProperty(object, prop)) {
                mergedObject[prop] = object[prop];
            };
        };
    };
    
    return mergedObject;
};


/**
 * Gets setting by name with respect to settings inheritance.
 * @param {String} name Name of setting
 * @param {Growl} growl Growl object
 * @param {Object} notificationSettings Settings for notification
 */
var getSetting = function (name, growl, notificationSettings) {
    if (notificationSettings && typeof notificationSettings[name] !== 'undefined') {
        return notificationSettings[name];
    } else if (notificationSettings.type &&
               typeof growl.settings.types[notificationSettings.type] !== 'undefined' &&
               typeof growl.settings.types[notificationSettings.type][name] !== 'undefined') {
        return growl.settings.types[notificationSettings.type][name];
    } else if (typeof growl.settings[name] !== 'undefined') {
        return growl.settings[name];
    };
};


/**
 * Global Growl object.
 */
var Growl = window.Growl = {
    /**
     * Performs initialization (can be omitted)
     * @param {Object} settings Global growl settings
     * @this {Growl}
     * @return settings.selector (if provided)
     */
    init: function (settings) {
        /**
         * Settings (Object):
         *     selector Selector for Growl element.
         *     types {Object} Object that holds settings for notification types.
         *     bind {Boolean} Should Growl bind 'add' and 'remove' methods + methods for types?
         *     add {Function} Function responsible for adding message to the Growl element.
         *     remove {Function} Function responsible for removing message element from Growl element.
         *     timeout {Number} Timeout for notifications in milliseconds.
         *     closeable {Boolean} Should Growl allow user to close notification?
         *                         This setting is just passed to 'add' and 'remove' functions.
         *     sticky {Boolean} Are notifications sticky?
         */
        this.settings = settings || {};
        var types = this.settings.types = settings.types || {};
        
        // bind methods by default
        var bind = this.settings.bind = (typeof settings.bind === 'undefined' ||
                                         settings.bind === true);
        
        if (settings) {
            if (bind) {
                if (settings.add) {
                    this.add = settings.add;
                };
                
                if (settings.remove) {
                    this.remove = settings.remove
                };
                
                // bind methods for types
                if (types) {
                    for (var type in types) {
                        if (hasOwnProperty(types, type)) {
                            this.addType(type, types[type]);
                        };
                    };
                };
            };
            
            return settings.selector;
        }
    },
    
    /**
     * Adds notification (message).
     * @param {String} notificationText Text of notification
     * @param {Object} notificationSettings Settings for notification
     * @this {Growl}
     * @return Result of 'add' function
     */
    addNotification: function (notification, notificationSettings) {
        var notificationSettings = notificationSettings || {};
        var notificationType = notificationSettings.type;
        var typeSettings = this.settings.types[notificationType];
        
        var mergedSettings = (typeSettings) ?
            mergeObjects(notificationSettings, typeSettings) : notificationSettings;
        
        var timeout = getSetting('timeout', this, mergedSettings),
            add = getSetting('add', this, mergedSettings),
            selector = getSetting('selector', this, mergedSettings),
            sticky = getSetting('sticky', this, mergedSettings),
            closeable = getSetting('closeable', this, mergedSettings);
        
        var notificationSelector = add(selector, notification, notificationType, closeable, mergedSettings);
        
        if (sticky !== true) {
            var that = this;
            try {
                setTimeout(function () {
                    that._removeNotification(selector, notificationSelector, notificationType, closeable, mergedSettings);
                }, timeout);
            } catch (e) {
                throw new Error('Missing \'remove\' setting.');
            };
        };
        
        return notificationSelector;
    },
    
    /**
     * @ignore
     */
    _removeNotification: function (growlSelector, notificationSelector, type, closeable, notificationSettings) {
        var remove = getSetting('remove', this, notificationSettings);
        remove(growlSelector, notificationSelector, type, closeable, notificationSettings);
    },
    
    /**
     * Adds new message type or modifies its settings. If 'bind' setting is true,
     * binds return value to Growl object.
     * @param {String} type Type name
     * @param {Object} typeSettings Settings for type
     * @this {Growl}
     * @return {Function} Function that adds notifications for defined type.
     */
    addType: function (type, typeSettings) {
        // merge old type's settings and the new ones
        var types = this.settings.types;
        var typeSettings = typeSettings || {};
        var existingTypeSettings = types[type] || {};
        
        types[type] = mergeObjects(existingTypeSettings, typeSettings);
        
        
        var that = this;
        
        var typeMethod = function (notificationText, notificationSettings) {
            var mergedSettings = mergeObjects(notificationSettings, typeSettings);
            mergedSettings.type = type;
            return that.addNotification(notificationText, mergedSettings);
        };
        
        // bind type's method only if allowed
        if (this.settings.bind) {
            this[type] = typeMethod;
        };
        
        return typeMethod;
    },
    
    /**
     * Removes type by name.
     * @this {Growl}
     * @param {String} type Type's name
     */
    removeType: function (type) {
        delete this[type];
        delete this.settings.types[type];
    }
};
