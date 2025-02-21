
import Utils from "../../Utils/Utils";
import TextController from "../../Manager/TextController";
import NumberLabel from "../../Common/NumberLabel";
import SoundController from "../../Manager/SoundController";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import { AudioPlay } from "../../Core/audio/AudioPlayer";
import PopupController from "../../Manager/PopupController";

const { ccclass, property } = cc._decorator;

const NUMBER_INCREMENT_DURATION: number = 5.05;
export const AUTO_DISMISS_POPUP_DELAY: number = 6.43;

export type TotalWinData = {
    totalWinFreeSpin: number,
    packID?: number
}

@ccclass
export default class FreespinOutro extends cc.Component {

    private currentSoundIDArr: AudioPlay[] = [];
    private _isFadingOut: boolean = false;
    private _onShowCB: Function = null;
    private _onCloseCB: Function = null;
    private _winAmount: number = null;

    @property(NumberLabel)
    winAmountLabel: NumberLabel = null;

    @property(sp.Skeleton)
    skeOutro: sp.Skeleton = null;

    @property(cc.Node)
    btnCollect: cc.Node = null;
    private animationCanBePlayed = false;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // this.skeOutro.setCompleteListener((trackEntry) => {
        //     if (trackEntry['animation']['name'] == "end") {
        //         this.onHide();
        //     }
        //     if (trackEntry['animation']['name'] == "start") {
        //         this.onShow();
        //         this.setupAutoDismission();
        //     }
        // });

    }

    public showPr(data?: any): Promise<any> {
        if (this.node && data && data.name) {
            this.node.name = data.name;
        }
        this.node.active = false;
        this.animationCanBePlayed = data.animationCanBePlayed;
        return this.showPromise(data, data.onShow);
    }

    // update (dt) {}

    showPromise(totalWinData: TotalWinData, onShow: Function): Promise<any> {
        return new Promise((resolve: Function) => {
            this._onShowCB = onShow;
            this._onCloseCB = resolve;
            this._winAmount = totalWinData.totalWinFreeSpin;
            // this.btnCollect.active = false;
            // this.node.opacity = 0;

            cc.Tween.stopAllByTarget(this.node);
            this.winAmountLabel.string = Utils.getCurrencyStr();

            setTimeout(() => {
                SoundController.inst.MainAudio.pauseMusic();
                const intro_sfx = SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxTotalWinFreespinMain);
                this.currentSoundIDArr.push(intro_sfx);
            }, 300);

            this.onShow();
            this.node.active = true;
            this.node.opacity = 0;
            this.skeOutro.setAnimation(0, "animation", true);
            cc.Tween.stopAllByTarget(this.node);
            cc.tween(this.node)
                .to(0.4, { opacity: 255 })
                .call(() => {
                    if(!this.animationCanBePlayed){
                        this.winAmountLabel.playAnim(0, this.winAmountLabel.string.length, false, this._winAmount, this._winAmount);
                        this.winAmountLabel.finishAnim();
                        this.setupAutoDismission();
                    }else{
                        this.playWinAmountAnim();
                    }                    
                })
                .start();


            // if (!this.animationCanBePlayed) {
            //     this.onShow();
            //     this.node.active = true;
            //     this.node.opacity = 0;
            //     this.winAmountLabel.node.active = true;
            //     this.winAmountLabel.node.scale = 1;
            //     this.winAmountLabel.node.opacity = 255;
            //     this.winAmountLabel.playAnim(0, this.winAmountLabel.string.length, false, this._winAmount, this._winAmount);
            //     this.winAmountLabel.finishAnim();
            //     this.skeOutro.setAnimation(0, "animation", true);

            //     // setTimeout(() => {
            //     //     this.skeOutro.clearTracks();
            //     // }, 50);
            //     // this.onShow();
            //     cc.Tween.stopAllByTarget(this.node);
            //     cc.tween(this.node)
            //         .to(0.4, { opacity: 255 })
            //         .call(() => {
            //             // this.btnCollect.active = true;
            //             // this.btnCollect.getComponent(cc.Button).interactable = true;
            //             this.setupAutoDismission();
            //         })
            //         .start();
            //     return;
            // }
            // let tween_obj = {};
            // cc.Tween.stopAllByTarget(tween_obj);
            // cc.tween(tween_obj)
            //     .delay(0.4)
            //     .call(() => {
            //         this.node.active = true;
            //         // SoundController.inst.MainAudio.stopAudioPlay(intro_sfx);

            //         this.skeOutro.setAnimation(0, "animation", true);
            //         // this.skeOutro.addAnimation(0, "loop", true);
            //         this.playWinAmountAnim();
            //         // this.btnCollect.getComponent(cc.Button).interactable = true;

            //         // this.currentSoundIDArr.push(SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxTotalWinFreespinMain));
            //     })
            //     .start();

            // this.node.getComponent(cc.Animation).play("start");
        });
    }

    async onCloseTotalWinFreespin() {
        if (!this.node.active || this._isFadingOut)
            return;

        this._isFadingOut = true;
        cc.Tween.stopAllByTarget(this.node);
        this.node.stopAllActions();

        
        if (this.winAmountLabel.getIsPlayingAnim()) {
            this.winAmountLabel.finishAnim();
            // this.btnCollect.active = true;
            // return;
        }
        cc.tween(this.node)
            .delay(2)
            // .to(.2, { opacity: 0 })
            .call(() => {
                SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxCollectBtn);
                this.btnCollect.getComponent(cc.Button).interactable = false;

                let data = {
                    callFunc: () => {
                        if (this.animationCanBePlayed) {
                            // this.skeOutro.setAnimation(0, "end", false);
                            if (this._onCloseCB) this._onCloseCB();
                            this.onHide();
                        }
                        else {
                            if (this._onCloseCB) this._onCloseCB();
                            this.onHide();
                        }
                    }
                }

                PopupController.instance.showPrTrainsitionEffect(data).then(() => {
                    cc.log("onCloseTotalWinFreespin");
                    
                })
            })
            .start();


    }

    onShow() {
        if (this._onShowCB)
            this._onShowCB();
    }

    playWinAmountAnim() {
        let timeDuration = 0;
        if (this._winAmount != 0)
            timeDuration = NUMBER_INCREMENT_DURATION;

        this.winAmountLabel.string = Utils.getCurrencyStr();
        this.winAmountLabel.playAnim(timeDuration, this.winAmountLabel.string.length, false, 0, this._winAmount,
            null,
            () => {
                // this.node.getComponent(cc.Animation).play("winAmountEnd");

                // //sound
                // //stop win sfx
                this.currentSoundIDArr.forEach(sfxID => {
                    SoundController.inst.MainAudio.stopAudioPlay(sfxID);
                });
                this.currentSoundIDArr = [];
                SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxTotalWinFreespinEnd);
                this.btnCollect.active = true;
                const btn_appear_sfx_delay = 0;
                this.setupAutoDismission();
                cc.tween({})
                    .delay(btn_appear_sfx_delay)
                    .call(() => {
                        // SoundController.inst.playSFXBtnAppearInFreespinIntroOutro();
                    })
                    .start();
            });
        this.node.on(cc.Node.EventType.TOUCH_END, function () {
            if (!this.node.active || this._isFadingOut)
                return;
            if (this.winAmountLabel.getIsPlayingAnim()) {
                this.winAmountLabel.finishAnim();
                this.btnCollect.active = true;
                this.node.off(cc.Node.EventType.TOUCH_END);
                this.onCloseTotalWinFreespin();
                return;
            }
        }, this);
    }

    setupAutoDismission() {
        cc.Tween.stopAllByTarget(this.node);
        this.node.stopAllActions();
        cc.tween(this.node)
            .delay(AUTO_DISMISS_POPUP_DELAY)
            .call(() => {
                this.onCloseTotalWinFreespin();
            })
            .start();
    }

    onHide() {
        this.node.active = false;
        this.node.opacity = 255;
        this._isFadingOut = false;

        SoundController.inst.MainAudio.playAudio(AudioPlayId.bgmMain);
        SoundController.inst.MainAudio.resumeMusic();
        SoundController.inst.MainAudio.fadeInMusic();
    }
}
