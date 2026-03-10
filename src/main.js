const BaseNode = require('./BaseNode');
const BridgeConfigNode = require('./BridgeConfigNode');
const ServiceNode = require('./ServiceNode');
const DeviceNode = require('./DeviceNode');

module.exports = function(RED) {
    "use strict";
    var info = require('debug')('info').extend('node-red-hue-base').extend('main.js');
    info("function(RED)");
    BaseNode.nodeAPI = RED;

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
