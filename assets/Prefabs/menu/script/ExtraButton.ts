// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../../../Scripts/Core/observer/clientEvent";
import { GameCertification } from "../../../Scripts/Manager/Config";
import { EventName } from "../../../Scripts/Manager/EventName";
import PopupController from "../../../Scripts/Manager/PopupController";
import { E_POPUP_STATE } from "../../../Scripts/Stageloading/BasePopup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExtraButton extends cc.Component {


    @property(cc.Node)
    BgNode: cc.Node = null;

    @property(cc.Node)
    quitNode: cc.Node = null;

    @property(cc.Node)
    soundNode: cc.Node = null;

    @property(cc.Node)
    historyNode: cc.Node = null;

    @property(cc.Node)
    settingNode: cc.Node = null;

    @property(cc.Node)
    autoNode: cc.Node = null;

    popupDisplayed: boolean = false;
    animationTriggered: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    checkNodeReset() {
        let totalDisplayed = 4;
        this.quitNode.active = GameCertification.show_quit_feature;
        if (!GameCertification.show_quit_feature)
            totalDisplayed--;

        this.soundNode.active = GameCertification.show_sound_feature;
        if (!GameCertification.show_sound_feature)
            totalDisplayed--;

        this.historyNode.active = GameCertification.show_history_feature;
        if (!GameCertification.show_history_feature)
            totalDisplayed--;

        this.autoNode.active = GameCertification.show_autoplay_feature;
        if (!GameCertification.show_autoplay_feature)
            totalDisplayed--;

        if (totalDisplayed <= 0) {
            this.node.active = false;
            this.settingNode.active = false;
            return;
        }

        let overlalWidth = 72 * totalDisplayed;
        this.BgNode.height = overlalWidth;
    }

    onHide() {
        this.popupDisplayed = false;
        this.animationTriggered = false;
    }
    onShow() {
        // clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.CLOSED);
        this.popupDisplayed = true;
        this.animationTriggered = false;
    }
    onAnimationTriggered() {
        // clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.OPENED);
        this.animationTriggered = true;
    }
}
