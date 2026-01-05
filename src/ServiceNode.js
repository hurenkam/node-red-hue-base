ResourceNode = require("./ResourceNode");

class ServiceNode extends ResourceNode {
    #info;

    constructor(config) {
        super(config);
        this.#info = require('debug')('info').extend('node-red-hue-base').extend('ServiceNode').extend(config.id);
        this.#info("constructor()");
    }
}

module.exports = ServiceNode;
