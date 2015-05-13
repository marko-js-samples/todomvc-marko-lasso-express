var inherit = require('raptor-util/inherit');

function Notification(notificationInfo) {
    this.message = notificationInfo.message;
    this.type = notificationInfo.type || 'message';
    this.dismissable = notificationInfo.dismissable !== false;
    this.duration = notificationInfo.duration;
}

Notification.prototype = {
    remove: function() {
        this.emit('removed');
    }
};

inherit(Notification, require('events').EventEmitter);

module.exports = Notification;