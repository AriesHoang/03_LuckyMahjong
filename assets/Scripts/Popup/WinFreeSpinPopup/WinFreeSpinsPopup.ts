// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import BasePopup from "../../Stageloading/BasePopup";
// import LayoutModeController from "./LayoutModeController";
import PopupController, { AUTO_DISMISS_POPUP_DELAY } from "../../Manager/PopupController";
import SoundController from "../../Manager/SoundController";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import TextController from "../../Manager/TextController";
import { E_BOARD_MODE } from "../../Game/BoardUI";
import MultilingualImageCustomRichTextTranslator from "../../Common/Multilingual/MultilingualImageCustomRichTextTranslator";
// import { SoundController } from "./SoundController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinFreeSpinsPopup extends BasePopup {
    private closeCallback: Function = null;

    // private layoutController: LayoutModeController = null;
    @property(cc.Node)
    startButton: cc.Node = null;
    @property(sp.Skeleton)
    skeIntro: sp.Skeleton = null;
    @property(cc.Label)
    win_amount: cc.Label = null;


    isClosing: boolean = false;

    onLoad() {
        // this.startButton.on(cc.Node.EventType.TOUCH_END, function () {
        //     this.onnodeClosed();
        //     SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxStartBtn);
        // }, this);
        // this.imgFree_spin_info.spriteFrame = TextController.getTextSpriteFrame("free_spin_info_04");
    }

    public show(data?: any): void {
        if (!data) return;
        super.show();
        this.startButton.getComponent(cc.Button).interactable = false;

        // this.layoutController = data.layoutController;
        this.node.opacity = 0;
        this.skeIntro.node.active = false;

        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxWinFreeSpinsPopupStart);
        this.scheduleOnce(() => {

            this.skeIntro.node.active = true;
            this.showWinFreeSpins(data.amount, data.onShow, data.closeCB);
        }, .5)

    }
    showWinFreeSpins(amount: number, onShow: Function = null, closeCB: Function = null) {
        this.closeCallback = closeCB;

        // let idTextFreeSpin = IdTextFreeSpins[amount];
        // if (idTextFreeSpin) {
        //     this.imgFreeSpinInfo.spriteFrame = TextController.getTextSpriteFrame(idTextFreeSpin);
        // }

        let textAmount = amount.toString();
        this.win_amount.string = (textAmount);

        this.node.active = true;
        this.node.opacity = 0;
        this.startButton.active = false;

        this.skeIntro.node.active = true;
        this.skeIntro.setAnimation(0, "animation", true);

        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(.5, { opacity: 255 })
            .call(() => {
                this.startButton.active = true;
                if (onShow) onShow();
                //show text anims
            })
            // .delay(.6)
            .call(() => {
                this.startButton.getComponent(cc.Button).interactable = true;
                // this.startButton.active = true;

                // this.skeIntro.node.active = true;
                // this.skeIntro.setAnimation(0, "start", false);
                // this.skeIntro.addAnimation(0, "loop", true);
                if (onShow) {
                    onShow();
                }
                cc.tween(this.win_amount.node)
                    .to(.8, { scale: 1 }, { easing: "bounceOut" })
                    .start();

                this.startButton.active = true;
                // cc.tween(this.startButton)
                //     .to(.8, { scale: 1 }, { easing: "bounceOut" })
                //     .start();                
            })
            .delay(.6)
            .call(() => {
                cc.Tween.stopAllByTarget(this.node);
                this.node.stopAllActions();
                cc.tween(this.node)
                    .delay(AUTO_DISMISS_POPUP_DELAY)
                    .call(() => {
                        this.onnodeClosed();
                        // SoundController.inst.playSFXStartBtn();
                    })
                    .start();
            })
            .start();
    }

    onnodeClosed() {
        if (this.isClosing) return;
        this.isClosing = true;

        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxStartBtn);
        this.startButton.active = false;
        cc.Tween.stopAllByTarget(this.node);
        this.node.stopAllActions();
        cc.tween(this.node)
            .delay(2)
            .call(() => {
                this.isClosing = false;
                let data = {
                    callFunc: () => {

                    }
                }
                setTimeout(() => {
                    this.node.active = false;
                    this.node.opacity = 255;
                    SoundController.inst.MainAudio.fadeOutMusic(0.3);
                    cc.tween(SoundController.inst.node)
                        .call(() => {
                            // SoundController.inst.playSFXWinFreeSpinsPopupStart();
                            SoundController.inst.MainAudio.playAudio(AudioPlayId.bgmMainFreespin, true)
                            SoundController.inst.MainAudio.fadeInMusic();
                        })
                        .start();

                    if (this.closeCallback) this.closeCallback();
                }, 1000)

                PopupController.instance.showPrTrainsitionEffect(data).then(() => {

                })

            })
            .start();

        cc.Tween.stopAllByTarget(SoundController.inst.node);
    }


}
