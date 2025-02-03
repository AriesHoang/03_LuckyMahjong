import NumberLabel from "../../Common/NumberLabel";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import { AudioPlay } from "../../Core/audio/AudioPlayer";
import { clientEvent } from "../../Core/observer/clientEvent";
import { EventName } from "../../Manager/EventName";
import { AUTO_DISMISS_POPUP_DELAY } from "../../Manager/PopupController";
import SoundController from "../../Manager/SoundController";
import BasePopup, { E_POPUP_STATE } from "../../Stageloading/BasePopup";
import Utils from "../../Utils/Utils";

const tileDelay = .75;
const TimeSoundWin = 9.3;
const { ccclass, property } = cc._decorator;

@ccclass
export default class WinPopup extends BasePopup {

    private _amount: number;
    public set win_amount(v: number) {
        this._amount = v;
    }
    public get win_amount(): number {
        return this._amount;
    }


    @property(cc.Node)
    private clickNode: cc.Node = null;

    @property(cc.Label)
    private maxWin: cc.Label = null;

    @property(sp.Skeleton)
    private ske: sp.Skeleton = null;

    @property(NumberLabel)
    private winAmountLabel: NumberLabel = null;


    @property(sp.Skeleton)
    private fx_End: sp.Skeleton = null;

    private _currentSoundIDArr: AudioPlay[] = [];
    private closeCb: Function;
    private _isFadingOut = false;

    protected onLoad(): void {
        this.maxWin.node.active = false;
    }

    public showPr(data?: any): Promise<any> {
        if (!data) return;
        this.show(data);
    }

    private reset() {
        this.node.opacity = 0;
        this.ske.node.active = false;
        this._isFadingOut = false;
    }

    show(data) {
        super.show();
        this.reset();

        this.win_amount = data.result.totalWinJackpot;
        this.closeCb = data.callback;

        this._currentSoundIDArr.push(SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxAllSpecialWin));

        cc.tween(this.node)
            .to(tileDelay, { opacity: 255 })
            .call(() => {
                this.ske.node.active = true;
                this.ske.setAnimation(0, "start", false);
                this.ske.addAnimation(0, "loop", true);
                SoundController.inst.MainAudio.pauseMusic();
                // this.winAmountLabel.setText(Utils.getCurrencyStr());
                this.startNumberCount(TimeSoundWin, data.isMaxWin);
            })
            .start();
    }

    private startNumberCount(duration: number, isMaxWin: boolean) {
        this.winAmountLabel.string = Utils.getCurrencyStr();
        this.winAmountLabel.node.scale = 1;
        this.winAmountLabel.node.active = true;

        // this.winAmountLabelClone.playAnim(duration, Utils.getCurrencyStr().length, false, 0, this.win_amount)
        this.winAmountLabel.playAnim(duration, Utils.getCurrencyStr().length, false, 0, this.win_amount,
            () => {
                return SoundController.inst.MainAudio.playAudio(AudioPlayId.SFX_PrizeBannerCount, true);
            },
            () => {

                cc.Tween.stopAllByTarget(this.winAmountLabel.node);
                cc.tween(this.winAmountLabel.node)
                    .to(.1, { scale: 1.4 }, { easing: "bounceOut" })
                    .call(()=>{
                        this.fx_End.node.active = true;
                        this.fx_End.setAnimation(0,"total_win",false);
                    })
                    .to(.1, { scale: 1 }, { easing: "bounceIn" })
                    .start();
;

                if (this.maxWin) {
                    this.maxWin.node.active = isMaxWin;
                }

                //stop loop sfx, keep the coin rain
                let win_sfx_id = this._currentSoundIDArr.shift();
                SoundController.inst.MainAudio.stopAudioPlay(win_sfx_id);

                let end_sfx: AudioPlay = SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxAllSpecialWinEnd);
                if (!Utils.isEmpty(end_sfx)) this._currentSoundIDArr.push(end_sfx);

                //resume/play music when close (to check for game mode)
                this.scheduleOnce(() => {
                    SoundController.inst.MainAudio.fadeInMusic(.5);
                    SoundController.inst.MainAudio.resumeMusic();
                }, 1);

                cc.Tween.stopAllByTarget(this.node);
                this.node.stopAllActions();
                cc.tween(this.node)
                    .delay(AUTO_DISMISS_POPUP_DELAY)
                    .call(() => {
                        this.closeWin();
                    })
                    .start();

            },);

        cc.tween({})
            .delay(0.5)
            .call(() => {
                this.clickNode.on(cc.Node.EventType.TOUCH_END, () => {
                    this.closeWin();
                }, this);
            })
            .start();
    }

    private closeWin() {
        if (!this.node.active || this._isFadingOut) {
            cc.log("Jackpot Win Popup return");
            return;
        }

        cc.log("Close Jackpot Win");
        if (this.winAmountLabel.getIsPlayingAnim()) {
            //stop progressive animation and skip to result animation
            this.winAmountLabel.finishAnim();
            //auto dismiss
            cc.Tween.stopAllByTarget(this.node);
            this.node.stopAllActions();

            cc.tween(this.node)
                .delay(2)
                .call(() => {
                    this.closeWin();
                })
                .start();
            return;
        }

        this._isFadingOut = true;
        cc.log("Close Jackpot Win Finally");

        cc.Tween.stopAllByTarget(this.node);
        this.node.stopAllActions();

        cc.Tween.stopAllByTarget(this.clickNode);
        this.clickNode.off(cc.Node.EventType.TOUCH_END);
        this.clickNode.stopAllActions();

        this.ske.setAnimation(0, "end", false);
        this.ske.setCompleteListener((trackEntry) => {
            if (trackEntry['animation']['name'] == "end") {

                clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.CLOSED);
                this.stopAllCurrentSFXs();

                this.unscheduleAllCallbacks();
                if (!SoundController.inst.MainAudio.isMusicPlaying()) {
                    SoundController.inst.MainAudio.fadeInMusic(.5);
                }
                SoundController.inst.MainAudio.resumeMusic();
                this.hide();
            }
        });
    }

    private stopAllCurrentSFXs() {
        this._currentSoundIDArr.forEach(sfxID => {
            SoundController.inst.MainAudio.stopAudioPlay(sfxID);
        });
        this._currentSoundIDArr = [];
    }

    public hide(data?: any): void {
        cc.tween(this.node)
            .to(0.5, { opacity: 0 })
            .call(() => {
                super.hide();
                this.closeCb && this.closeCb();
            })
            .start();
    }
}