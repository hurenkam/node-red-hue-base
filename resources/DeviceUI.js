import { BaseUI } from "./BaseUI.js";

export class DeviceUI extends BaseUI {
    constructor(label="Device",category="hue base") {
        super(label,category);
        console.log("DeviceUI.constructor(",label,category,")");

        this.config.defaults.name =       { value:"" };
        this.config.defaults.bridge =     { type: "@hurenkam/node-red-hue-base/BridgeConfigNode", required: true };
        //this.config.defaults.rtype =      { value:rtype, required: true };
        //this.config.defaults.owner =      { value:"", required: true };
        this.config.defaults.uuid =       { value:"", required: true };
        this.config.defaults.startevent = { value: false };

        this.config.inputs = 1;
        this.config.color = "#EEEEEE";
        this.config.icon = "font-awesome/fa-gears";
    }

    buildHelp() {
        var help = super.buildHelp();
        help["Settings"] += "\
#### Bridge\n\
Select the hue bridge for your device or resource.\n\n\
#### UUID\n\
This field offers you a choice of either filling in the UUID of the device \
to be selected, or you can select one from the list which is offered. \
\n\n\
#### Send current state event at startup\n\
When this flag is enabled the node will send an event at startup with its initial state.\n\
";
        return help;
    }

    ui() {
        var text = super.ui();
        console.log("DeviceUI.ui()");

        text += this.uiTextInput("bridge","Bridge");
        text += this.uiSelectInput("device","Device");
        text += this.uiCheckboxInput("startevent","Send current state event at startup");
        return text;
    }
TemperatureUI
    selectText(id) {
        console.log("DeviceUI.selectText()");

        var current = $('#node-input-'+id).val();
        $('#input-select-'+id).empty();
        $('#input-select-'+id).append('<input type="text" id="node-input-'+id+'" style="width: 100%" value="'+current+'" />');

        var button = $("#input-select-"+id+"-search");
        var icon = button.find("i");
        icon.removeClass("fa-pencil");
        icon.addClass("fa-search");
    }

    selectOption(id,url,data) {
        console.log("DeviceUI.selectOption()");
        var current = $('#node-input-'+id).val();
        var notification = RED.notify("Searching for options...", {
            type: "compact", modal: true, fixed: true
        });

        $.get(url, data)
        .done( function(data) {
            var options = JSON.parse(data);

            if(options.length <= 0)
            {
                notification.close();
                RED.notify("No options found.", { type: "error" });
                return false;
            }

            $("#node-input-"+id).typedInput({
                types: [
                    {
                        value: current,
                        options: options
                    }
                ]
            });

            var button = $("#input-select-"+id+"-search");
            var icon = button.find("i");
            icon.removeClass("fa-search");
            icon.addClass("fa-pencil");

            // Remove the notification
            notification.close();
        })
        .fail(function()
        {
            console.log("DeviceUI.selectOption(): failed");

            // Remove the notification
            notification.close();
            RED.notify("unknown error", "error");
        });
    }
/*
    selectType() {
        console.log("DeviceUI.selectType()");
        var bridge_id = $('#node-input-bridge').val();
        var bridge = (bridge_id)? RED.nodes.node(bridge_id): null;

        if ((!bridge_id) || (!bridge)) {
            console.log("ResourceUI.selectResource(): invalid bridge:", bridge_id);
            return;
        }

        this.selectOption(
            "rtype",
            "BridgeConfigNode/GetSortedTypeOptions",
            {
                bridge_id: bridge.id,
            }
        );
    }

    selectOwner() {
        console.log("DeviceUI.selectOwner()");
        var bridge_id = $('#node-input-bridge').val();
        var bridge = (bridge_id)? RED.nodes.node(bridge_id): null;

        if ((!bridge_id) || (!bridge)) {
            console.log("DeviceUI.selectOwner(): invalid bridge:", bridge_id);
            return;
        }

        var rtype = $('#node-input-rtype').val();
        if (!rtype) {
            console.log("DeviceUI.selectOwner(): invalid rtype:", rtype);
            return;
        }

        console.log("DeviceUI.selectOwner()",bridge.id,rtype);
        this.selectOption(
            "owner",
            "BridgeConfigNode/GetSortedOwnerOptions",
            {
                bridge_id: bridge.id,
                rtype: rtype
            }
        );
    }

    selectService() {
        console.log("DeviceUI.selectService()");

        console.log("DeviceUI.selectService()");
        var bridge_id = $('#node-input-bridge').val();
        var bridge = (bridge_id)? RED.nodes.node(bridge_id): null;

        if ((!bridge_id) || (!bridge)) {
            console.log("DeviceUI.selectService(): invalid bridge:", bridge_id);
            return;
        }

        var rtype = $('#node-input-rtype').val();
        if (!rtype) {
            console.log("DeviceUI.selectService(): invalid rtype:", rtype);
            return;
        }

        var owner = $('#node-input-owner').val();
        if (!owner) {
            console.log("DeviceUI.selectService(): invalid owner:", owner);
            return;
        }

        this.selectOption(
            "uuid",
            "BridgeConfigNode/GetSortedServiceOptions",
            {
                bridge_id: bridge.id,
                rtype: rtype,
                owner: owner
            }
        );
    }

    showServiceSelectionIfThereIsChoice() {
        console.log("DeviceUI.showServiceSelectionIfThereIsChoice()");

        var bridge = $('#node-input-bridge').val();
        var owner = $('#node-input-owner').val();
        var rtype = $('#node-input-rtype').val();
        
        if ((!bridge) || (!owner) || (owner=="") || (!rtype) || (rtype=="")) return;

        $.get("BridgeConfigNode/GetSortedServiceOptions", {
            bridge_id: bridge,
            rtype: rtype,
            owner: owner
        })
        .done(function(data) {
            var options = JSON.parse(data);
            console.log("Options:",options);
            if (options.length == 1) {
                $('#node-input-uuid').val(options[0].value);
                $('#node-container-uuid').hide();
            } else if (options.length > 1) {
                $('#node-container-uuid').show();
            }
        })
    };
*/
    selectDevice() {
        console.log("DeviceUI.selectDevice()");
        var bridge_id = $('#node-input-bridge').val();
        var bridge = (bridge_id)? RED.nodes.node(bridge_id): null;

        if ((!bridge_id) || (!bridge)) {
            console.log("DeviceUI.selectOwner(): invalid bridge:", bridge_id);
            return;
        }

        //var rtype = $('#node-input-rtype').val();
        //if (!rtype) {
        //    console.log("DeviceUI.selectOwner(): invalid rtype:", rtype);
        //    return;
        //}

        console.log("DeviceUI.selectDevice()",bridge.id);
        this.selectOption(
            "device",
            "BridgeConfigNode/GetSortedDeviceOptions",
            {
                bridge_id: bridge.id,
            }
        );
    }

    onEditPrepare(config) {
        super.onEditPrepare(config);
        console.log("DeviceUI.onEditPrepare()",config);
        var instance = this;

        //$('#input-select-rtype-search').click(function()
        //{
        //    if($('#input-select-rtype').find(".red-ui-typedInput-container").length > 0) {
        //        instance.selectText("rtype");
        //    } else {
        //        instance.selectType();
        //    }
        //});

        $('#input-select-device-search').click(function()
        {
            if($('#input-select-device').find(".red-ui-typedInput-container").length > 0) {
                instance.selectText("device");
            } else {
                instance.selectDevice();
            }
        });

        //$('#input-select-uuid-search').click(function()
        //{
        //    if($('#input-select-uuid').find(".red-ui-typedInput-container").length > 0) {
        //        instance.selectText("uuid");
        //    } else {
        //        instance.selectService();
        //    }
        //});

        $('#node-input-device').change(function() {
            console.log("DeviceUI.onEditPrepare().on('change')");
            //instance.showServiceSelectionIfThereIsChoice();
            instance.selectText("device");
            instance.selectDevice();
        });

        //$('#node-container-uuid').hide();

        //this.showServiceSelectionIfThereIsChoice();
    }
}
