var appNotification = require('src/components/app-notification');
var notificationsApp = require('src/app/notifications');

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),

    init: function() {
        var self = this;

        this.visible = false;
        this.notificationCount = 0;

        this.subscribeTo(notificationsApp)
            .on('notification', function(notification) {
                self.addNotification(notification);
            })
            .on('asyncBegin', function() {
                self.getWidget('asyncNotification').show();
                self.handleNotificationAdded();

            })
            .on('asyncEnd', function() {
                self.handleNotificationRemoved();
                self.getWidget('asyncNotification').hide();
            });
    },

    handleNotificationRemoved: function() {
        if (--this.notificationCount === 0) {
            this.hide();
        }
    },

    handleNotificationAdded: function() {
        this.notificationCount++;
        this.show();
    },

    show: function() {
        if (this.visible) {
            return;
        }

        this.visible = true;

        this.el.className = 'app-notifications-overlay visible';
    },

    hide: function() {
        if (!this.visible) {
            return;
        }

        this.visible = false;

        this.el.className = 'app-notifications-overlay';
    },

    addNotification: function(notification) {
        var self = this;

        var notificationWidget = appNotification.render(notification)
            .appendTo(this.getEl('container'))
            .getWidget();


        this.subscribeTo(notificationWidget)
            .on('destroy', function() {
                self.handleNotificationRemoved();
            });

        // The notification emits a "removed" event when the timeout duration is
        // reached. We need to update the view by fading the notification out and
        // then destroying the associated DOM nodes.
        this.subscribeTo(notification)
            .on('removed', function() {
                notificationWidget.hide(true /* destroy after hidden */);
            });

        this.handleNotificationAdded();
    }
});