module.exports = function (RED) {
    /**
     * Enable http route to static ui files
     */
     RED.httpAdmin.get('/src/*', function (req, res) {
        var options = {
            root: __dirname + '/',
            dotfiles: 'deny'
        };
        res.sendFile(req.params[0], options);
     });
}