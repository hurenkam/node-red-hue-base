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
            var resource = this.bridge().clip().getResource(service.rid);
            if (resource) {
                this.#info("start() found resource for service:",service.rid);
                this.#services.push(resource);
            } else {
                this.#warn("start() unable to find resource for service: ",service.rid);
            }
        });

        var instance = this;
        if (this.startevent()==true) {
            instance.onStartup();
        }

        this.resource().on('update',function(event) {
            instance.onUpdate(0,event);
        });
        this.#services.forEach((service,index) => {
            service.on('update',function(event) {
                instance.onUpdate(index+1,event);
            });
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

    send_msg(output,msg) {
        if (this.config.outputs>1) {
            var msgs = [];
            for (let i=0; i<output;i++) {
                msgs.push(null);
            }
            msgs.push(msg);
            this.send(msgs);
        } else {
            this.send(msg);
        }
    }

    onStartup() {
        var instance = this;

        instance.#trace("onStartup()");
        instance.send_msg(0,{ payload: instance.#resource.data() });
        instance.#services.forEach((service,index) => {
            instance.send_msg(index+1,{ payload: service.data() });
        });
    }

    onButtonClicked() {
        var instance = this;

        instance.#trace("onButtonClicked()");
        instance.send_msg(0,{ payload: instance.#resource.data() });
        instance.#services.forEach((service,index) => {
            if (service) {
                instance.#trace("onButtonClicked() service: ",service);
                instance.send_msg(index+1,{ payload: service.data() });
            } else {
                instance.#warn("onButtonClicked() service not defined");
            }
        });
    }

    onUpdate(output,event) {
        this.#trace("onUpdate()",output,event);
        this.send_msg(output,{ payload: event });
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
