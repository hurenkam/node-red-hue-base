// ===================
// Manage bridge calls
// ===================

const _error = require('debug')('error').extend('node-red-hue-base').extend('hue');
const _warn = require('debug')('warn').extend('node-red-hue-base').extend('hue');
const _info = require('debug')('info').extend('node-red-hue-base').extend('hue');
const _trace = require('debug')('trace').extend('node-red-hue-base').extend('hue');

module.exports = function (RED) {
    const BridgeConfigNode = require('./BridgeConfigNode');
    const DeviceNode = require('./DeviceNode');

    RED.httpAdmin.get('/BridgeConfigNode/DiscoverBridges', async function (req, res, next) {
        _info("/BridgeConfigNode/DiscoverBridges");
        _trace(req.query);
        var options = [];
    
        BridgeConfigNode.DiscoverBridges()
        .then(function(data) {
            if (data) {
                data.forEach((element) => {
                    options.push({ label: element.name, value: element.internalipaddress })
                });
            }
            res.end(JSON.stringify(Object(options)));
        })
        .catch(function(error) {
            _error("/DiscoverBridges  Error:",error.message,error.stack);
            res.end(JSON.stringify(Object(options)));
        });
    });
    
    RED.httpAdmin.get('/BridgeConfigNode/AcquireApplicationKey', async function (req, res, next) {
        _info("/BridgeConfigNode/AcquireApplicationKey");
        _trace(req.query);
    
        if (!req.query.ip) {
            return res.status(500).send("Missing bridge ip.");
        }
        else {
            BridgeConfigNode.AcquireApplicationKey(req.query.ip)
            .then(function(data) {
                _trace("/AcquireApplicationKey Key:",data);
                res.end(JSON.stringify(Object({ key: data })));
            })
            .catch(function(error) {
                _error("/AcquireApplicationKey Error:",error.message,error.stack);
                res.end(JSON.stringify(Object({ error: error })));
            });
        }
    });
    
    RED.httpAdmin.get('/BridgeConfigNode/GetBridgeOptions', async function (req, res, next) {
        _info("/BridgeConfigNode/GetBridgeOptions");
        _trace(req.query);
        var options = [];
    
        Object.keys(BridgeConfigNode.bridges()).forEach((key) => {
            options.push({ label: BridgeConfigNode.bridges()[key].name, value: BridgeConfigNode.bridges()[key].id });
        });
    
        res.end(JSON.stringify(Object(options)));
    });
    
    RED.httpAdmin.get('/BridgeConfigNode/GetSortedResourceOptions', async function (req, res, next) {
        _info("/BridgeConfigNode/GetSortedResourceOptions");
        _trace(req.query);
        var clip = BridgeConfigNode.bridges()[req.query.bridge_id].instance.clip();
        var options = clip.getSortedResourceOptions(req.query.type, req.query.models);
        res.end(JSON.stringify(Object(options)));
    });
    
    RED.httpAdmin.get('/BridgeConfigNode/GetSortedTypeOptions', async function (req, res, next) {
        _info("/BridgeConfigNode/GetSortedTypeOptions");
        _trace(req.query);
        var bridge = BridgeConfigNode.bridges()[req.query.bridge_id];
        var clip = bridge.instance.clip();
        var options = clip.getSortedTypeOptions();
        res.end(JSON.stringify(Object(options)));
    });
    
    RED.httpAdmin.get('/BridgeConfigNode/GetSortedOwnerOptions', async function (req, res, next) {
        _info("/BridgeConfigNode/GetSortedOwnerOptions");
        _trace(req.query);
        var clip = BridgeConfigNode.bridges()[req.query.bridge_id].instance.clip();
        var options = clip.getSortedOwnerOptions(req.query.rtype);
        res.end(JSON.stringify(Object(options)));
    });
    
    RED.httpAdmin.get('/BridgeConfigNode/GetSortedDeviceOptions', async function (req, res, next) {
        _info("/BridgeConfigNode/GetSortedDeviceOptions");
        _trace(req.query);
        var clip = BridgeConfigNode.bridges()[req.query.bridge_id].instance.clip();
        var options = clip.getSortedDeviceOptions();
        res.end(JSON.stringify(Object(options)));
    });

    RED.httpAdmin.get('/BridgeConfigNode/GetDeviceServices', async function (req, res, next) {
        _info("/BridgeConfigNode/GetDeviceServices");
        _trace(req.query);
        var result = [];
        if (req.query.bridge_id) {
            var clip = BridgeConfigNode.bridges()[req.query.bridge_id].instance.clip();
            if (clip && req.query.device_id) {
                result = clip.getDeviceServices(req.query.device_id);
            }
        }
        res.end(JSON.stringify(Object(result)));
    });

    RED.httpAdmin.get('/BridgeConfigNode/GetSortedServiceOptions', async function (req, res, next) {
        _info("/BridgeConfigNode/GetSortedServiceOptions");
        _trace(req.query);
        var clip = BridgeConfigNode.bridges()[req.query.bridge_id].instance.clip();
        var options = clip.getSortedServiceOptions(req.query.owner,req.query.rtype);
        res.end(JSON.stringify(Object(options)));
    });

    RED.httpAdmin.get('/DeviceNode/ButtonClicked', async function (req, res, next) {
        _info("/DeviceNode/ButtonClicked",req.query);
        _trace(req.query);
        var device = DeviceNode.devices()[req.query.device_id];
        if (device) {
            device.instance.onButtonClicked();
            res.end(JSON.stringify(Object({ success: true })));
        }
        else {
            res.end(JSON.stringify(Object({ success: false, error: "Device not found" })));
        }
    });

}
