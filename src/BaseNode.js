class BaseNode {
    static nodeAPI = null;
    #onInput;
    #onClose;

    #error;
    #warn;
    #info;
    #trace;

    constructor(config) {
        this.config = config;

        this.#info = require('debug')('info').extend('node-red-hue-base').extend('BaseNode').extend(config.id);
        this.#error = require('debug')('error').extend('node-red-hue-base').extend('BaseNode').extend(config.id);
        this.#warn = require('debug')('warn').extend('node-red-hue-base').extend('BaseNode').extend(config.id);
        this.#trace = require('debug')('trace').extend('node-red-hue-base').extend('BaseNode').extend(config.id);

        this.#info("constructor()");
        BaseNode.nodeAPI.nodes.createNode(this,config);
        var instance = this;

        this.#onInput = function (msg) {
            try {
                instance.onInput(msg);
            } catch (error) {
                this.#error(error.message,error.stack);
            }
        }
    
        this.#onClose = function () {
            try {
                instance.destructor();
            } catch (error) {
                this.#error(error.message,error.stack);
            }
        }
    
        this.on('input', this.#onInput);
        this.on('close', this.#onClose);
    }

    logid() {
        return (this.config)? ((this.config.name)? this.config.name: this.config.id) : "<?>";
    }

    getStatusFill() {
        this.#trace("getStatusFill()");
        return null;
    }

    getStatusText() {
        this.#trace("getStatusText()");
        return null;
    }

    getStatusShape() {
        this.#trace("getStatusShape()");
        return null;
    }

    updateStatus() {
        this.#trace("updateStatus()");
        try {
            var fill =  this.getStatusFill();
            var shape = this.getStatusShape();
            var text =  this.getStatusText();

            if ((shape) && (!fill)) fill = "grey";
            if ((fill) && (!shape)) shape = "dot";

            this.status({
                fill:  fill,
                shape: shape,
                text:  text
            });
        } catch (error) {
            this.#error(error.message,error.stack);
        }
    }

    onInput(msg) {
        this.#trace("onInput(",msg,")");
    }

    destructor() {
        this.#info("destructor()");
        this.off('input',this.#onInput);
        this.off('close',this.#onClose);
    }
}

module.exports = BaseNode;
