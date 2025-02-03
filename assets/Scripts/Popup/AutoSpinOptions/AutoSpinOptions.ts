import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import { clientEvent } from "../../Core/observer/clientEvent";
import { GameCertification } from "../../Manager/Config";
import { EventName } from "../../Manager/EventName";
import RootData from "../../Manager/RootData";
import SoundController from "../../Manager/SoundController";
import { E_POPUP_STATE } from "../../Stageloading/BasePopup";
import Utils from "../../Utils/Utils";


const { ccclass, property } = cc._decorator;

export enum E_AUTOSPIN_OPTIONS_STATE {
    Hide,
    Moving,
    Show
}

@ccclass
export default class AutoSpinOptions extends cc.Component {

    static inst: AutoSpinOptions = null;
    @property(cc.Node)
    dialogNode: cc.Node = null;

    @property(cc.Node)
    bgNode: cc.Node = null;

    @property(cc.Label)
    accountBalanceLabel: cc.Label = null;

    @property([cc.Label])
    numSpinLBs: cc.Label[] = [];

    @property(cc.Node)
    confirmNode: cc.Node = null;


    private _numOfSpin: number;
    public get numOfSpin(): number {
        return this._numOfSpin;
    }
    public set numOfSpin(v: number) {
        this._numOfSpin = v;
        let index = -1;
        this.numSpinList.forEach((element, idx) => {
            if (element == v) {
                index = idx;
            }
        });
        this.numSpinLBs.forEach((lb, idx) => {
            let colorHex = idx == index ? '#E2931D' : '#E6E6E6';
            lb.node.color = new cc.Color().fromHEX(colorHex)
        });
        this.confirmNode.color = new cc.Color().fromHEX(v == 0 ? '#504E4BC8' : '#E2931D');
        this.confirmNode.opacity = v == 0 ? 200 : 250;
    }

    numSpinList = [50, 200, 300, 400, Infinity];



    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        AutoSpinOptions.inst = this;
    }

    curState: E_AUTOSPIN_OPTIONS_STATE = E_AUTOSPIN_OPTIONS_STATE.Hide;
    start() {
        // this.bgNode.active = false;
        this.curState = E_AUTOSPIN_OPTIONS_STATE.Hide;
        this.dialogNode.y = -cc.winSize.height / 2 - this.dialogNode.height / 2;
    }



    show() {
        if (this.curState == E_AUTOSPIN_OPTIONS_STATE.Moving) return;
        clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.OPENED);    
        this.numOfSpin = 0;
        this.curState = E_AUTOSPIN_OPTIONS_STATE.Moving;
        this.bgNode.active = true;
        this.bgNode.opacity = 0;
        
        const isCertificationBarVisible: boolean = GameCertification.show_game_name || GameCertification.show_clock || GameCertification.show_net_balance;
        const padding: number = isCertificationBarVisible ? 20 : 0;

        cc.tween(this.bgNode)
            .to(.3, { opacity: 120 })
            .start();
        this.dialogNode.y = -this.node.height / 2 - this.dialogNode.height / 2 + padding;
        this.dialogNode.opacity = 255;
        cc.tween(this.dialogNode)
            .to(.3, { y: -this.node.height / 2 + this.dialogNode.height / 2 + padding }, { easing: 'cubicIn' })
            .call(() => {
                this.curState = E_AUTOSPIN_OPTIONS_STATE.Show;
            })
            .start();

        this.accountBalanceLabel.string = Utils.MixCurrecyStr(RootData.instance.playerData.balance);

    };

    hide() {
        if (this.curState == E_AUTOSPIN_OPTIONS_STATE.Moving) return;
        this.curState = E_AUTOSPIN_OPTIONS_STATE.Moving;
        cc.tween(this.bgNode)
            .to(.3, { opacity: 0 })
            .call(() => { this.bgNode.active = false; })
            .start();
        this.dialogNode.y = -this.node.height / 2 + this.dialogNode.height / 2;
        cc.tween(this.dialogNode)
            .to(.3, { y: -this.node.height / 2 - this.dialogNode.height / 2 }, { easing: 'cubicOut' })
            .call(() => {
                this.curState = E_AUTOSPIN_OPTIONS_STATE.Hide;
                clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.CLOSED);    
                this.dialogNode.opacity = 0;
            })
            .start();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    };


    confirmOnClick() {
        // this.numOfSpin -= 1;
        if (this.numOfSpin <= 0) return;
        // this.node.parent.getComponent(SettingsController).onAutoSpinOptionsMenuClosed(this.numOfSpin);
        clientEvent.dispatchEvent(EventName.StartAutoSpinPressed, this.numOfSpin);
        this.hide();
    }

    setNumSpin(event, par) {
        if(par ==-1)
          this.numOfSpin = Infinity;
        else  this.numOfSpin = parseInt(par);
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }
}
