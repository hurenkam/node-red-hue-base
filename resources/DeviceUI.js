import { BaseUI } from "./BaseUI.js";

export class DeviceUI extends BaseUI {
    constructor(label="Device",category="hue base") {
        super(label,category);
        console.log("DeviceUI.constructor(",label,category,")");

        this.config.defaults.name =       { value:"" };
        this.config.defaults.bridge =     { type: "@hurenkam/node-red-hue-base/BridgeConfigNode", required: true };
        this.config.defaults.device =     { value:"", required: true };
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
#### Device\n\
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

    selectDevice() {
        console.log("DeviceUI.selectDevice()");
        var bridge_id = $('#node-input-bridge').val();
        var bridge = (bridge_id)? RED.nodes.node(bridge_id): null;

        if ((!bridge_id) || (!bridge)) {
            console.log("DeviceUI.selectOwner(): invalid bridge:", bridge_id);
            return;
        }

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

        $('#input-select-device-search').click(function()
        {
            if($('#input-select-device').find(".red-ui-typedInput-container").length > 0) {
                instance.selectText("device");
            } else {
                instance.selectDevice();
            }
        });

        $('#node-input-device').change(function() {
            console.log("DeviceUI.onEditPrepare().on('change')");
            instance.selectText("device");
            instance.selectDevice();
        });
    }
}
