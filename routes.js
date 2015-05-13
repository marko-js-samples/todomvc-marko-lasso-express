exports.addRoutes = function(app) {
    // Page routes
    app.get('/', require('./src/pages/home'));
};