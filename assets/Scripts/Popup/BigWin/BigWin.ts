import LoadMultilingualImageTextTranslator from "../../Common/Multilingual/LoadMultilingualImageTextTranslator";
import NumberLabel from "../../Common/NumberLabel";
import { AudioPlay } from "../../Core/audio/AudioPlayer";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import SoundController from "../../Manager/SoundController";
import TextController from "../../Manager/TextController";
import Utils from "../../Utils/Utils";


const { ccclass, property } = cc._decorator;

enum E_SPECIAL_WIN_TYPE {
    bigwin,
    megawin,
    supermegawin
}

enum E_SPECIAL_WIN_STATE {
    start,
    loop,
    end
}

type WinConfig = {
    text?: string,
    start?: string[],
    loop?: string[],
    end?: string[],
    env?: string
};
const SpecialWinConfig: WinConfig[] = [
    /* bigwin   */{ text: 'special_win_03', start: ['bigwin'], loop: ['loop_bigwin'], end: ['end_bigwin'] },
    /* megawin  */{ text: 'special_win_02', start: ['megawin'], loop: ['loop_megawin'], end: ['end_megawin'] },
    /* superwin */{ text: 'special_win_01', start: ['superwin'], loop: ['loop_supermegawin'], end: ['end_supermegawin'] }
];
const TimeSoundWin = {
    0: 5.8,
    1: 12.3,
    2: 18.5
}


const option_list: string[] = ["big-win", "mega-win", "super-mega-win"];
const KeyTitle: string[] = ["megaWin", "megaWin", "superMegaWin"];
const TEXT_EVENT_NAME: string = "text";

const LOOP_DURATION: number = 5;
const BIGWIN_MAIN_DURATION: number = 7;
const AUTO_DISMISS_DELAY: number = 5;


@ccclass
export default class BigWin extends cc.Component {

    @property(NumberLabel)
    winAmountLabel: NumberLabel = null;

    @property([cc.Node])
    arrWinTitles: cc.Node[] = [];

    private _currentSoundIDArr: AudioPlay[] = [];
    private _isFadingOut: boolean = false;
    private _onCloseCB: Function = null;
    private _isSkipAnim: boolean = false;
    private winTitle: string = null;

    private DELAY_INTRO: number = 0.6;
    private LOOP_DURATION: number[] = [];
    private BIGWIN_DURATION: number[] = [];
    private MEGAWIN_DURATION: number[] = [];
    private SUPERMEGAWIN_DURATION: number[] = [];

    private winId: number = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    }

    start() {

    }

    // update (dt) {}
    public showPr(data?: any): Promise<any> {
        if (!data) return;
        return this.showPromise(data.winTitle, data.winAmount);
    }

    showPromise(winTitle: string, winAmount: number): Promise<any> {
        return new Promise((resolve: Function) => {
            if (!option_list.includes(winTitle)) {
                Utils.consoleLog("Invalid win title");
                resolve();
                return;
            }
            this.winTitle = winTitle;
            this._isSkipAnim = false;
            this.winId = option_list.indexOf(winTitle);
            let timeSound = TimeSoundWin[this.winId];

            this.setTitleText(this.winId);
            this.winAmountLabel.string = Utils.getCurrencyStr();
            // this.winAmountLabelShadow.string = Utils.getCurrencyStr();
            this.winAmountLabel.node.active = false;
            // this.winAmountLabelShadow.node.active = false;
            this.winAmountLabel.node.scale = 1;
            // this.winAmountLabelShadow.node.scale = 1;
            this.node.active = true;
            this.node.opacity = 0;
            let main_ske = this.node.getChildByName("winscene").getComponent(sp.Skeleton);
            main_ske.setToSetupPose();
            main_ske.node.active = false;
            cc.Tween.stopAllByTarget(this.node);
            cc.tween(this.node)
                .to(this.DELAY_INTRO, { opacity: 255 })// intro duration 0.5
                .call(() => {
                    this._onCloseCB = resolve;
                    
                    this.winAmountLabel.node.active = true;
                    // this.winAmountLabelShadow.node.active = true;
                    // this.winAmountLabelShadow.playAnim(timeSound, Utils.getCurrencyStr().length,false,0,winAmount, ()=>{return;});
                    this.winAmountLabel.playAnim(BIGWIN_MAIN_DURATION, Utils.getCurrencyStr().length, false, 0, winAmount,
                        null,
                        () => {

                            //bounce scale label
                            // cc.Tween.stopAllByTarget(this.winAmountLabelShadow.node);
                            // cc.tween(this.winAmountLabelShadow.node)
                            //     .to(.1, { scale: 1.4 }, { easing: "bounceOut" })
                            //     .to(.1, { scale: 1 }, { easing: "bounceIn" })
                            //     .start();

                            if (this.winAmountLabel.getIsPlayingAnim()) {
                                this.winAmountLabel.finishAnim();
                                // this.winAmountLabelShadow.finishAnim();
                            }
                            cc.Tween.stopAllByTarget(this.node);
                            this.node.stopAllActions();
                            cc.tween(this.node)
                                .delay(AUTO_DISMISS_DELAY)
                                .call(() => {
                                    this.onCloseSpecialWin(winTitle);
                                })
                                .start();

                            //stop loop sfx, keep the coin rain
                            let win_sfx_id = this._currentSoundIDArr.shift();
                            SoundController.inst.MainAudio.stopAudioPlay(win_sfx_id);

                            let end_sfx: AudioPlay = SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxWinEnd);
                            if (!Utils.isEmpty(end_sfx)) this._currentSoundIDArr.push(end_sfx);

                            //resume/play music when close (to check for game mode)
                            this.scheduleOnce(() => {
                                SoundController.inst.MainAudio.fadeInMusic(.5);
                                SoundController.inst.MainAudio.resumeMusic();
                            }, 3);


                        });

                    main_ske.node.active = true;
                    main_ske.setAnimation(0, SpecialWinConfig[this.winId].start[0], true);

                    // let promises_chain: Promise<any> = Promise.resolve();
                    // // for (let i = 0; i <= this.winId; i++) {
                    // //     promises_chain = promises_chain.then(this.showWinAnimPromise.bind(this, i));
                    // // }
                    // promises_chain = promises_chain.then(() => {
                    //     if (this.winAmountLabel.getIsPlayingAnim()) {
                    //         this.winAmountLabel.finishAnim();
                    //         // this.winAmountLabelShadow.finishAnim();
                    //     }
                    //     cc.Tween.stopAllByTarget(this.node);
                    //     this.node.stopAllActions();
                    //     cc.tween(this.node)
                    //         .delay(AUTO_DISMISS_DELAY)
                    //         .call(() => {
                    //             this.onCloseSpecialWin(winTitle);
                    //         })
                    //         .start();
                    // })

                    this.node.on(cc.Node.EventType.TOUCH_END, function () {
                        this._isSkipAnim = true;
                        this.onCloseSpecialWin(winTitle);
                    }, this);

                    //sound
                    SoundController.inst.MainAudio.pauseMusic();
                })
                .start();

            //play sound
            let win_sfx = this.winId == 0 ? AudioPlayId.sfxBigWin : this.winId == 1 ? AudioPlayId.sfxMegaWin : AudioPlayId.sfxSuperWin;
            this._currentSoundIDArr.push(SoundController.inst.MainAudio.playAudio(win_sfx));
        });
    }

    // showWinAnimPromise(winTitle: number): Promise<any> {
    //     return new Promise((resolve: Function) => {
    //         if (!this.node.active || this._isFadingOut || this._isSkipAnim) {
    //             resolve();
    //             return;
    //         }
    //         if (winTitle > 0) {
    //             SoundController.inst.MainAudio.fadeOutSFX(this._currentSoundIDArr.shift());
    //             this._currentSoundIDArr.push(SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxAllSpecialWin));
    //         }

    //         let main_ske = this.node.getChildByName("winscene").getComponent(sp.Skeleton);
    //         const winCfg: WinConfig = SpecialWinConfig[winTitle];

    //         main_ske.node.active = true;
    //         main_ske.setAnimation(0, winCfg.start[0], true);
    //         main_ske.setEventListener((trackEntry, event) => {
    //             if (trackEntry['animation']['name'] == winCfg.start[0] && event.data.name == TEXT_EVENT_NAME) {
    //                 this.setTitleText(winTitle);
    //             }
    //         });
    //         main_ske.setCompleteListener((trackEntry) => {
    //             if (trackEntry['animation']['name'] == winCfg.start[0]) {
    //                 cc.Tween.stopAllByTarget(this.node);
    //                 cc.tween(this.node)
    //                     .delay(LOOP_DURATION)
    //                     .call(() => {
    //                         resolve();
    //                     })
    //                     .start();
    //             }
    //         });
    //     });
    // }

    onCloseSpecialWin(winTitle: string) {
        const winID = option_list.indexOf(winTitle);
        const winCfg: WinConfig = SpecialWinConfig[winID];
        let main_ske = this.node.getChildByName("winscene").getComponent(sp.Skeleton);
        if (!this.node.active || this._isFadingOut)
            return;
        if (this.winAmountLabel.getIsPlayingAnim()) {
            //stop progressive animation and skip to result animation
            this.winAmountLabel.finishAnim();
            // this.winAmountLabelShadow.finishAnim();
            main_ske.setAnimation(0, winCfg.start[0], true);
            this.setTitleText(winID);

            //auto dismiss
            cc.Tween.stopAllByTarget(this.node);
            this.node.stopAllActions();

            cc.tween(this.node)
                .delay(AUTO_DISMISS_DELAY)
                .call(() => {
                    this.onCloseSpecialWin(winTitle);
                })
                .start();
            return;
        }
        this._isFadingOut = true;
        this.node.off(cc.Node.EventType.TOUCH_END);
        cc.Tween.stopAllByTarget(this.node);
        this.node.stopAllActions();
        //bounce scale label
        // cc.Tween.stopAllByTarget(this.winAmountLabelShadow.node);
        // cc.tween(this.winAmountLabelShadow.node)
        //     // .to(.1, { scale: 1.4 }, { easing: "bounceOut" })
        //     .to(0.5, { scale: 0 })
        //     .start();


        cc.tween(this.node)
            .to(.4, { opacity: 0 })
            .call(() => {
                this.stopAllCurrentSFXs();
                this.node.active = false;
                this.node.opacity = 255;
                this._isFadingOut = false;

                if (this._onCloseCB) {
                    this._onCloseCB();
                }
            })
            .start();

        // //fade out coin rain SFX
        // SoundController.inst.fadeOutSFX(this._currentSoundIDArr.shift());
        this.stopAllCurrentSFXs();
        this.unscheduleAllCallbacks();
        if (!SoundController.inst.MainAudio.isMusicPlaying()) {
            SoundController.inst.MainAudio.fadeInMusic(.5);
        }
        SoundController.inst.MainAudio.resumeMusic();


        // main_ske.setAnimation(0, winCfg.end[0], false);        
        // main_ske.setCompleteListener((trackEntry) => {
        //     if (trackEntry['animation']['name'] == winCfg.end[0]) {
        //         cc.tween(this.node)
        //             .to(.4, { opacity: 0 })
        //             .call(() => {
        //                 this.stopAllCurrentSFXs();
        //                 this.node.active = false;
        //                 this.node.opacity = 255;
        //                 this._isFadingOut = false;

        //                 if (this._onCloseCB) {
        //                     this._onCloseCB();
        //                 }
        //             })
        //             .start();

        //         // //fade out coin rain SFX
        //         // SoundController.inst.fadeOutSFX(this._currentSoundIDArr.shift());
        //         this.stopAllCurrentSFXs();
        //         this.unscheduleAllCallbacks();
        //         if (!SoundController.inst.MainAudio.isMusicPlaying()) {
        //             SoundController.inst.MainAudio.fadeInMusic(.5);
        //         }
        //         SoundController.inst.MainAudio.resumeMusic();
        //     }
        // });
    }

    stopAllCurrentSFXs() {
        this._currentSoundIDArr.forEach(sfxID => {
            SoundController.inst.MainAudio.stopAudioPlay(sfxID);
        });
        this._currentSoundIDArr = [];
    }

    setTitleText(winID: number) {
        
        this.arrWinTitles.forEach((node, index) => {
            node.active = index == winID;
        });
        switch (winID) {
            case E_SPECIAL_WIN_TYPE.bigwin:
                this.winAmountLabel.node.parent.y = 250;
                break;
            case E_SPECIAL_WIN_TYPE.megawin:
                this.winAmountLabel.node.parent.y = 250;
                break;
            case E_SPECIAL_WIN_TYPE.supermegawin:
                this.winAmountLabel.node.parent.y = 275;
                break;
            default:
                break;
            }
    }
}
