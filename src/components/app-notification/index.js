module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),
    getTemplateData: function(state, input) {
        var type = input.type || 'message';
        var dismissable = input.dismissable === true;
        var showSpinner = input.showSpinner === true;
        var visible = input.visible !== false;

        return {
            visible: visible,
            type: type,
            dismissable: dismissable,
            showSpinner: showSpinner
        };
    },

    getInitialBody: function(input) {
        return input.message || input.renderBody;
    },

    handleDismissClick: function(event, el) {
        this.hide(true);
        event.preventDefault();
    },
    hide: function(destroy) {
        var self = this;

        this.el.className = 'app-notification';

        if (destroy) {
            setTimeout(function() {
                self.destroy();
            }, 250);
        }
    },
    show: function(destroy) {
        this.el.className = 'app-notification visible';
    }
});