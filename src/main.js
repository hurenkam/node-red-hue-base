module.exports = function(RED) {
    "use strict";
    var info = require('debug')('info').extend('node-red-hue-base').extend('index.js');
    info("function(RED)");

    const BaseNode = require('./BaseNode');
    BaseNode.nodeAPI = RED;

    const BridgeConfigNode = require('./BridgeConfigNode');
    const ServiceNode = require('./ServiceNode');
    const DeviceNode = require('./DeviceNode');

    var nodes = {
        "BridgeConfigNode": BridgeConfigNode,
        "ServiceNode": ServiceNode,
        "DeviceNode": DeviceNode
    }

    info("function(RED): nodes",nodes);

    Object.keys(nodes).forEach((id) => {
        var typeName = "@hurenkam/node-red-hue-base/"+id
        info("registerType:",typeName);
        RED.nodes.registerType(typeName,nodes[id]);
    });
}
