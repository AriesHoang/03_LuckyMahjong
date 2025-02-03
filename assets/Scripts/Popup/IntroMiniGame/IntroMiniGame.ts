import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import SoundController from "../../Manager/SoundController";
import BasePopup from "../../Stageloading/BasePopup";
import { WEDGE_ANGLE, WEDGE_ANGLEBUY } from "../FreespinGamble/FreespinGamble";
import ItemSpinWheel from "../FreespinGamble/ItemSpinWheel";
import { AUTO_DISMISS_POPUP_DELAY } from "../FreespinOutro/FreespinOutro";

const { ccclass, property } = cc._decorator;

@ccclass
export default class IntroMiniGame extends BasePopup {
    private closeCallback: Function = null;

    @property(cc.Button)
    collectButton: cc.Button = null;

    @property([cc.Node])
    arrayItemWheel: cc.Node[] = [];


    public show(data?: any): void {

        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxGambleEnterBg);

        super.show();
        this.node.opacity = 0;

        let onShow = data.onShow;
        this.closeCallback = data.closeCB;

        let _isBuyFeature = data.isBuyFeature

        let arr
        if (_isBuyFeature)
            if (WEDGE_ANGLEBUY[data.spin_data.resultWheelBonus.reward]) {

                arr = WEDGE_ANGLEBUY;
            } else {

                arr = WEDGE_ANGLE;
            }
        else {
            arr = WEDGE_ANGLE;
        }

        Object.keys(arr).forEach((element) => {
            let item = arr[element];
            let itemWheel = this.arrayItemWheel[item.index - 1];
            if (item.value != 0 && item.value != 1)
                itemWheel.getComponent(ItemSpinWheel).updateTextInfor(item.value + "X");

        })

        cc.tween(this.node)
            .to(.4, { opacity: 255 })
            .call(() => {
                if (onShow) onShow();
                //show text anims
            })
            .delay(.6)
            .call(() => {

                cc.Tween.stopAllByTarget(this.node);
                this.node.stopAllActions();
                cc.tween(this.node)
                    .delay(AUTO_DISMISS_POPUP_DELAY)
                    .call(() => {
                        this.onnodeClosed();
                    })
                    .start();
            })
            .start();
    }


    onnodeClosed() {
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxStartBtn);
        this.collectButton.getComponent(cc.Button).interactable = false;
        cc.Tween.stopAllByTarget(this.node);
        this.node.stopAllActions();
        cc.tween(this.node)
            .to(.4, { opacity: 0 })
            .call(() => {
                this.collectButton.getComponent(cc.Button).interactable = true;
                this.node.active = false;
                this.node.opacity = 255;

                if (this.closeCallback) this.closeCallback();

            })
            .start();

    }
}
