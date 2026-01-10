BaseNode = require("./BaseNode");

class DeviceNode extends BaseNode {
    #onUpdate;
    #device;

    #info;
    #trace;

    constructor(config) {
        super(config);

        this.#info = require('debug')('info').extend('node-red-hue-base').extend('DeviceNode').extend(config.id);
        this.#trace = require('debug')('trace').extend('node-red-hue-base').extend('DeviceNode').extend(config.id);

        this.#info("constructor()");
        if (this.bridge()) {
            this.bridge().requestDeviceStartup(this);
        }
    }

    start(device) {
        if (resource==null)
            return;

        this.#info("start()");
        this.#device = device;
/*
        var instance = this;
        this.#onUpdate = function(event) {
            instance.onUpdate(event);
        }

        if (this.startevent()==true) {
            //instance.onStartup(resource.data())
        }

        this.resource().on('update',this.#onUpdate);
*/        
        this.updateStatus();
    }

    destructor() {
        this.#info("destructor()");
        this.removeAllListeners();
        this.#device = null;
        super.destructor();
    }

    device() {
        return this.#device;
    }

    rid() {
        return this.config.uuid;
    }

    startevent() {
        return this.config.startevent;
    }

    bridge() {
        return BaseNode.nodeAPI.nodes.getNode(this.config.bridge);
    }

    onStartup(event) {
        this.#trace("onStartup()");
        this.send({ payload: event });
    }

    onUpdate(event) {
        this.#trace("onUpdate()");
        this.send({ payload: event });
    }

    onInput(msg) {
        super.onInput(msg);
/*
        var resource = this.resource();
        if (!resource) {
            this.#trace("onInput(): Resource not found",this.rid());
            return;
        }

        if (msg.rtypes && msg.rtypes.includes(resource.rtype())) {
            resource.put(msg.payload).then(result => { 
                return; 
            }, info => {
                var error = info.error;
                var request = info.request; 
                this.error("ResourceNode::onInput() request: "+JSON.stringify(request)+" error: " + error);
                return; 
            });
        }

        if (msg.rids && msg.rids.includes(resource.rid())) {
            resource.put(msg.payload).then(result => { 
                return; 
            }, info => {
                var error = info.error;
                var request = info.request; 
                this.error("ResourceNode::onInput() request: "+JSON.stringify(request)+" error: " + error);
                return; 
            });
        }
*/
    }
}

module.exports = ResourceNode;
