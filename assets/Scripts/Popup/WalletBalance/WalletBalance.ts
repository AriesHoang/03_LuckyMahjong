import RootData from "../../Manager/RootData";
import SoundController from "../../Manager/SoundController";
import BasePopup, { E_POPUP_STATE } from "../../Stageloading/BasePopup";
import Utils from "../../Utils/Utils";
import {AudioPlayId} from "../../Core/audio/AudioPlayId";
import CurrencyConverter from "../../Common/CurrencyConverter";
import { clientEvent } from "../../Core/observer/clientEvent";
import { EventName } from "../../Manager/EventName";




const { ccclass, property } = cc._decorator;

export enum E_MENU_STATE {
    HIDE,
    MOVING,
    SHOW
}

@ccclass
export default class WalletBalance extends BasePopup {

    @property(cc.Node)
    dialogNode: cc.Node = null;

    @property(cc.Node)
    bgNode: cc.Node = null;

    @property(cc.Label)
    balanceLabel: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initData();
    }

    private _curState: E_MENU_STATE = E_MENU_STATE.HIDE;

    start() {
        this.bgNode.active = false;
        this.dialogNode.opacity = 0;
        this._curState = E_MENU_STATE.HIDE;
    }

    update(dt) {

    }
    protected onEnable(): void {
        
    }

    show() {
        if (this._curState == E_MENU_STATE.MOVING) return;
        clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.OPENED);
        this.initData();    //need this for updating base bet & bet options according to ante bet
        this._curState = E_MENU_STATE.MOVING;
        this.bgNode.active = true;
        this.bgNode.opacity = 0;
        cc.tween(this.bgNode)
            .to(.5, { opacity: 120 })
            .start();
        this.dialogNode.y = -this.node.height / 2 - this.dialogNode.height / 2;
        this.dialogNode.opacity = 255;
        cc.tween(this.dialogNode)
            .to(.5, { y: -this.node.height / 2 + this.dialogNode.height / 2 }, { easing: 'cubicIn' })
            .call(() => {
                this._curState = E_MENU_STATE.SHOW;
            })
            .start();

        this.balanceLabel.string = Utils.MixCurrecyStr(RootData.instance.playerData.balance);

    };

    hide() {
        if (this._curState == E_MENU_STATE.MOVING) return;
        clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.CLOSED);
        this._curState = E_MENU_STATE.MOVING;
        cc.tween(this.bgNode)
            .to(.5, { opacity: 0 })
            .call(() => { this.bgNode.active = false; })
            .start();
        this.dialogNode.y = -this.node.height / 2 + this.dialogNode.height / 2;
        cc.tween(this.dialogNode)
            .to(.5, { y: -this.node.height / 2 - this.dialogNode.height / 2 }, { easing: 'cubicOut' })
            .call(() => {
                this._curState = E_MENU_STATE.HIDE;
                this.dialogNode.opacity = 0;
            })
            .start();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxClose);
    };

    initData() {
        const balance = RootData.instance.playerData.balance;
        this.balanceLabel.string = CurrencyConverter.getCreditString(balance);
    }
}
