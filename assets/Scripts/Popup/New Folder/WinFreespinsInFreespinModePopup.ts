export const AUTO_DISMISS_WIN_FREESPINS_IN_FREESPIN_MODE_POPUP = 3;

import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import SoundController from "../../Manager/SoundController";
import BasePopup from "../../Stageloading/BasePopup";




const { ccclass, property } = cc._decorator;

@ccclass
export default class WinFreespinsInFreespinModePopup extends BasePopup {

    @property(cc.Label)
    winFreespinsInFreespinModeLabel: cc.Label = null;
    private closeCallback: Function = null;
    // boardController: BoardController;

    public show(data?: any): void {
        if (!data) return;
        super.show();
        // this.boardController = data.boardController;

        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxWinFreeSpinsPopupStart);
        this.showWinFreespinsInFreespinMode(data.amount, data.closeCB);
    }

    showWinFreespinsInFreespinMode(amount: number, closeCB: Function = null) {
        this.closeCallback = closeCB;
        this.node.active = true;
        this.node.opacity = 0;
        let ske = this.node.getChildByName("skeleton").getComponent(sp.Skeleton);
        ske.node.active = false;
        this.winFreespinsInFreespinModeLabel.string = amount.toString();
        // this.winFreespinsInFreespinModeLabel.node.active = false;

        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(.4, { opacity: 255 })
            .call(() => {
                ske.node.active = true;
                ske.setAnimation(0, "start", false);
                ske.addAnimation(0, "loop", true);

                ske.setCompleteListener((trackEntry) => {
                    if (trackEntry['animation']['name'] == 'start') {
                        // this.winFreespinsInFreespinModeLabel.node.active = true;
                    }
                });

                this.node.on(cc.Node.EventType.TOUCH_END, function () {
                    this.onnodeClosed();
                }, this);

                cc.Tween.stopAllByTarget(this.node);
                this.node.stopAllActions();
                cc.tween(this.node)
                    .delay(AUTO_DISMISS_WIN_FREESPINS_IN_FREESPIN_MODE_POPUP)
                    .call(() => {
                        this.onnodeClosed();
                    })
                    .start();

                // this.boardController.updateLayout();
            })
            .start();


    }

    onnodeClosed() {
        let ske = this.node.getChildByName("skeleton").getComponent(sp.Skeleton);
        ske.setAnimation(0, "end", false);
        cc.Tween.stopAllByTarget(this.node);
        this.node.stopAllActions();
        if (this.closeCallback) this.closeCallback();
        cc.tween(this.node)
            .to(.4, { opacity: 0 })
            .call(() => {
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

            })
            .start();
    }

}
