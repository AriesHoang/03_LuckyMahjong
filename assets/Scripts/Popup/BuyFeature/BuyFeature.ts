import { AudioPlay } from "../../Core/audio/AudioPlayer";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import { clientEvent } from "../../Core/observer/clientEvent";
import { GameConfig } from "../../Manager/Config";
import { EventName } from "../../Manager/EventName";
import RootData from "../../Manager/RootData";
import SoundController from "../../Manager/SoundController";
import BasePopup from "../../Stageloading/BasePopup";
import Utils from "../../Utils/Utils";


const { ccclass, property } = cc._decorator;
enum ANIM_NAME {
    HOVER = 'touch_button',
    CLICK = 'click_button'
}
enum E_STATE {
    IDLE,
    FADING
}

@ccclass
export default class BuyFeature extends BasePopup {
    @property([cc.Node])
    buttonList: cc.Node[] = [];

    @property(sp.Skeleton)
    main_ske: sp.Skeleton = null;

    @property(cc.Label)
    priceLabel: cc.Label = null;


    private currentMode = null;

    private _closeCB: Function = null;
    private _state: E_STATE = E_STATE.IDLE;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    }

    public showPr(data?: any): Promise<any> {
        if (typeof data != 'function') {
            this.currentMode = data;
        }
        return this.showPromise(data);
    }

    showPromise(onShow: Function = null): Promise<any> {
        return new Promise((resolve: any) => {
            if (this._state != E_STATE.IDLE) {
                if (onShow && typeof onShow === 'function') onShow();
                resolve();
                return;
            }
            this._closeCB = null;
            this.node.opacity = 0;
            this.node.active = true;
            this.setupLayout();
            this._state = E_STATE.FADING;
            cc.Tween.stopAllByTarget(this.node);
            this.buttonList.forEach((button, id) => {
                button.getComponent(cc.Button).interactable = true;
            });
            this.main_ske.node.active = false;
            this.main_ske.setAnimation(0, "start", false);

            cc.tween(this.node)
                .to(.3, { opacity: 255 })
                .call(() => {
                    if (onShow && typeof onShow === 'function') onShow();
                    this.main_ske.node.active = true;
                    this.main_ske.setAnimation(0, "start", false);
                    this.main_ske.addAnimation(0, "loop", true);
                    this._closeCB = resolve;
                    this._state = E_STATE.IDLE;
                })
                .start();
        });
    }

    setupLayout() {
        cc.log("Buy Feature setupLayout: ", RootData.instance.gamePlayData);
        if (this._state != E_STATE.IDLE) {
            return;
        }
        this.priceLabel.string = Utils.MixCurrecyStr(RootData.instance.gamePlayData.getCurBetNormal() * GameConfig.rateBuyFeature);
    }

    onChooseOptions(event, customEventData: string) {
        event.target
        if (this._state != E_STATE.IDLE || !this.node.active) {
            return;
        }

        this.buttonList.forEach((button, id) => {
            button.getComponent(cc.Button).interactable = false;
        });

        this._state = E_STATE.FADING;
        let chosen_id: number = parseInt(customEventData);
        const id_arr: number[] = Array.from({ length: this.buttonList.length }, (_, i) => i);
        if (!id_arr.includes(chosen_id)) chosen_id = null;

        let prom_chain: Promise<any> = Promise.resolve();
        if (chosen_id != null) {
            //play selected animation
            if (chosen_id == 1) {
                SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxConfirmBuyFeature);
                clientEvent.dispatchEvent(EventName.OnBuyFeatureButtonPressed);
            } else
                SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxClose);
        }
        this.main_ske.setAnimation(0, "end", true);
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .delay(chosen_id == 0 ? .8 : 0.1)
            .to(.3, { opacity: 0 })
            .call(() => {
                if (this._closeCB) this._closeCB(chosen_id);
                this.node.active = false;
                this._state = E_STATE.IDLE;
            })
            .start();
    }
}
