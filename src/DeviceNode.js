var devices = {};

BaseNode = require("./BaseNode");

class DeviceNode extends BaseNode {
    #onUpdate;
    #resource;
    #services;

    #warn;
    #info;
    #trace;

    static devices () { return devices; }

    constructor(config) {
        super(config);
        var instance = this;

        this.#warn = require('debug')('warn').extend('node-red-hue-base').extend('DeviceNode').extend(config.id);
        this.#info = require('debug')('info').extend('node-red-hue-base').extend('DeviceNode').extend(config.id);
        this.#trace = require('debug')('trace').extend('node-red-hue-base').extend('DeviceNode').extend(config.id);

        this.#info("constructor()");
        devices[config.id] = { id: config.id, name: config.name, instance: this };

        if (this.bridge()) {
            this.bridge().requestStartup(this);
        }
    }

    start(resource) {
        this.#info("start():", resource, resource.data());
        if (resource==null)
            return;

        this.#services=[];
        this.#resource = resource;
        this.resource().data().services.forEach((service) => {
            this.#info("start() found resource:",service);
            var resource = this.bridge().clip().getResource(service.rid);
            this.#services.push(resource);
        });

        var instance = this;
        this.#onUpdate = function(event) {
            instance.onUpdate(event);
        }

        if (this.startevent()==true) {
            instance.onStartup(resource.data());
        }

        this.resource().on('update',this.#onUpdate);
        this.#services.forEach((service) => {
            service.on('update',this.#onUpdate);
        });
        
        this.updateStatus();
    }

    destructor() {
        this.#info("destructor()");
        this.removeAllListeners();
        this.#resource = null;
        super.destructor();
    }

    resource() {
        return this.#resource;
    }

    rid() {
        return this.config.device;
    }

    startevent() {
        return this.config.startevent;
    }

    bridge() {
        return BaseNode.nodeAPI.nodes.getNode(this.config.bridge);
    }

    onStartup() {
        var instance = this;

        instance.#trace("onStartup()");
        instance.send({ payload: instance.#resource.data() });
        instance.#services.forEach((service) => {
            instance.send({ payload: service.data() });
        });
    }

    onButtonClicked() {
        var instance = this;

        instance.#trace("onButtonClicked()");
        instance.send({ payload: instance.#resource.data() });
        instance.#services.forEach((service) => {
            if (service) {
                instance.#trace("onButtonClicked() service: ",service);
                instance.send({ payload: service.data() });
            } else {
                instance.#warn("onButtonClicked() service not defined");
            }
        });
    }

    onUpdate(event) {
        this.#trace("onUpdate()");
        this.send({ payload: event });
    }

    onInput(msg) {
        super.onInput(msg);

        this.#services.forEach((resource) => {

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

        })
    }
}

module.exports = DeviceNode;
