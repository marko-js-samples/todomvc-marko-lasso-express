var inherit = require('raptor-util/inherit');

var Notification = require('./Notification');

function NotificationsApp(state) {
    this.asyncCount = 0;
}

NotificationsApp.prototype = {
    addNotification: function(notificationInfo) {
        var notification = new Notification(notificationInfo);

        if (notificationInfo.duration) {
            setTimeout(function() {
                notification.remove();
            }, notificationInfo.duration);
        }

        this.emit('notification', notification);
    },

    startAsyncAction: function(actionFunc) {
        var self = this;

        if (++this.asyncCount === 1) {
            this.emit('asyncBegin');
        }

        actionFunc(function(errorMessage) {
            if (--self.asyncCount === 0) {
                self.emit('asyncEnd');
            }

            if (errorMessage) {
                self.addNotification({
                    type: 'error',
                    message: 'errorMessage',
                    dismissable: true
                });
            }
        });
    },
};

inherit(NotificationsApp, require('events').EventEmitter);

module.exports = NotificationsApp;