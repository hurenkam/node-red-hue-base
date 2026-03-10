var bridges = {};

const clip = require("@hurenkam/npm-hue-clip-v2");
const ClipApi = clip.ClipApi;
const BaseNode = require('./BaseNode');
const axios = require('axios');
const https = require('https');

const _info = require('debug')('info').extend('node-red-hue-base').extend('BridgeConfigNode');

class BridgeConfigNode extends BaseNode {
    #onClose;
    #onClipError;
    #clip;

    #error;
    #info;

    static bridges () { return bridges; }

    constructor(config) {
        super(config);
        BaseNode.nodeAPI.nodes.createNode(this, config);

        this.#info = require('debug')('info').extend('node-red-hue-base').extend('BaseNode').extend(config.id);
        this.#error = require('debug')('error').extend('node-red-hue-base').extend('BaseNode').extend(config.id);

        this.#info("constructor()");
        var instance = this;

        bridges[this.id] = { id: this.id, name: config.name, instance: this };
        this.#clip = this._constructClip(config.ip,config.key,config.name);

        this.#onClose = function() {
            try {
                instance.destructor();
            } catch (error) {
                instance.#error(error.message,error.stack);
            }
        }
        this.on('close', this.#onClose);
    }

    destructor() {
        this._destructClip();
        super.destructor();
    }

    _constructClip(ip,key,name) {
        var instance = this;
        this.#onClipError = function(event) {
            instance.#error("onClipError()",error);
        }

        var clip = new ClipApi(ip,key,name);
        clip.on('error',this.#onClipError);
        return clip;
    }

    _destructClip() {
        if (this.#clip) {
            this.#clip.destructor();
            this.#clip = null;
        }
    }

    clip() {
        return this.#clip;
    }

    requestStartup(resource) {
        this.#info("requestStartup(",resource,")");
        var instance = this;
        if (instance.clip()) {
            instance.clip().requestResourceStartup((id) => {
                resource.start(instance.clip().getResource(id));
            },resource.rid());
        }
    }

    requestResourceStartup(start,id) {
        this.#info("requestResourceStartup(",start,id,")");
        if (this.clip()) {
            this.clip().requestResourceStartup(start,id);
        }
    }

    /* istanbul ignore next */
    static async _axios(request) {
        return axios(request);
    }

    static async DiscoverBridges() {
        _info("DiscoverBridges()");
        var result = [];

        var response = await BridgeConfigNode._axios({
            "method": "GET",
            "url": "https://discovery.meethue.com",
            "headers": { "Content-Type": "application/json; charset=utf-8" },
            "httpsAgent": new https.Agent({ rejectUnauthorized: false })
        });

        const promises = response.data.map(async element => {
            const config = await BridgeConfigNode._axios({
                "method": "GET",
                "url": "https://" + element.internalipaddress + "/api/config",
                "headers": { "Content-Type": "application/json; charset=utf-8" },
                "httpsAgent": new https.Agent({ rejectUnauthorized: false })
            });
            config.data.internalipaddress = element.internalipaddress;
            return config
        });
        const configs = await Promise.all(promises);

        configs.forEach((config) => {
            result.push(config.data);
        });

        return result;
    }

    static async AcquireApplicationKey(ip) {
        _info("AcquireApplicationKey("+ip+")");
        return new Promise(function (resolve, reject) {
            var id = "BridgeConfig (" + Math.floor((Math.random() * 100) + 1) + ")";
            var request = {
                "method": "POST",
                "url": "https://" + ip + "/api",
                "headers": { "Content-Type": "application/json; charset=utf-8" },
                "data": { "devicetype": id },
                "httpsAgent": new https.Agent({ rejectUnauthorized: false })
            }

            BridgeConfigNode._axios(request)
            .then(function (response) {
                _trace("AcquireApplicationKey("+ip+")", response.data);
                if (Object.keys(response.data[0]).includes("success")) {
                    resolve(response.data[0].success.username);
                } else {
                    reject(response.data[0].error);
                }
            })
            .catch(function (error) {
                reject(error);
            });
        });
    }
}

module.exports = BridgeConfigNode;
