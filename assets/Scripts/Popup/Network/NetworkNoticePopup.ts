// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../../Core/observer/clientEvent";
import { Cfg } from "../../Manager/Config";
import { EventName } from "../../Manager/EventName";
import BasePopup from "../../Stageloading/BasePopup";
import Utils from "../../Utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NetworkNoticePopup extends BasePopup {

    @property(cc.Label)
    lbContent: cc.Label = null;

    @property(cc.Node)
    nodeContent: cc.Node = null;

    @property(cc.Button)
    btnOke: cc.Button = null;
    // @property(cc.Button)
    // btnClose: cc.Button = null;

    callBackFunc: Function
    protected onLoad(): void {

    }
    public show(data): void {

        if (!data) return;
        super.show();

        this.lbContent.string = data.err_msg;
        if (!data.action) {
            this.btnOke.node.off(cc.Node.EventType.TOUCH_END, this.OnClickOke, this);
            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node; //This node is the node to which your event handler code component belongs
            clickEventHandler.component = "NetworkNoticePopup";//This is the code file name
            clickEventHandler.handler = "onConfirmNetworkDisconnected";
            // clickEventHandler.customEventData = "foobar";
            this.btnOke.clickEvents = [];
            this.btnOke.clickEvents.push(clickEventHandler);
        } else {
            this.callBackFunc = data.action;
            this.btnOke.clickEvents = [];
            this.btnOke.node.on(cc.Node.EventType.TOUCH_END, this.OnClickOke, this);
        }


    }
    OnClickOke() {
        this.callBackFunc();
    }

    onEnable() {
        clientEvent.on(EventName.Disconnect, this.onDisconnect, this);
    }

    onDisable() {
        clientEvent.off(EventName.Disconnect, this.onDisconnect, this);
    }

    private onDisconnect(): void {

    }

    onConfirmNetworkDisconnected() {
        Utils.exitApp();    //reload
        this.nodeContent.active = false;
    }

}
