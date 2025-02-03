// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { AudioPlayId } from "../Core/audio/AudioPlayId";
import SoundController from "../Manager/SoundController";
import Utils from "../Utils/Utils";
import { AudioPlay } from "../Core/audio/AudioPlayer";
import CurrencyConverter from "./CurrencyConverter";
import {Cfg} from "../Manager/Config";



const { ccclass, property } = cc._decorator;

@ccclass
export default class NumberLabel extends cc.Label {

    private animDuration: number = 0;
    private numberPosInString: number = -1;
    private useInteger: boolean = true;
    private startNumber: number = 0;
    private endNumber: number = 0;
    private onFinishCallback: Function = null;

    private old_str: string = null;
    private duration: number = 0;
    private numberToUpdate: number = 0;
    private isPlayingAnim: boolean = false;
    private innerLabel: NumberLabel = null;

    private sfxID: AudioPlay = null;
    bonusString:string = "";
    // LIFE-CYCLE CALLBACKS:

    private  strPrefix = "";

    onLoad() {
        this.innerLabel = this.node.getChildByName("inner_label")?.getComponent(NumberLabel);
    }

    start() {

    }

    update(dt) {
        if (this.isPlayingAnim) {
            if (this.duration < this.animDuration) {
                this.duration += dt;
                this.numberToUpdate = this.startNumber + (this.endNumber - this.startNumber) * (this.duration / this.animDuration);
                if (this.useInteger)
                    this.numberToUpdate = Math.floor(this.numberToUpdate);
                this.numberToUpdate = Math.min(this.numberToUpdate, this.endNumber);
                let display_str = [this.old_str.slice(0, this.numberPosInString), CurrencyConverter.getCreditString(this.numberToUpdate, false, this.useInteger), this.old_str.slice(this.numberPosInString + 1)].join('');
                this.string = this.strPrefix + display_str;
                if (this.innerLabel)
                    this.innerLabel.string = this.strPrefix + display_str;
            }
            else {
                this.finishAnim();
            }
        }
    }

    onDisable() {
        super.onDisable();
        if (this.sfxID) {
            // SoundController.inst.stopSound(this.sfxID);
            this.sfxID = null;
        }
    }

    onDestroy() {
        super.onDestroy();
        if (this.sfxID) {
            // SoundController.inst.stopSound(this.sfxID);
            this.sfxID = null;
        }
    }

    playAnim(animDuration: number, numberPos: number, useInteger: boolean, startNumber: number, endNumber: number, sfxFn: Function = undefined, callback: Function = undefined , prefix: string = "") {
        this.animDuration = animDuration;
        this.numberPosInString = numberPos;
        this.useInteger = useInteger;
        this.startNumber = startNumber;
        this.endNumber = endNumber;
        this.strPrefix = prefix;
        if (callback)
            this.onFinishCallback = callback;

        this.old_str = this.string;
        this.duration = 0;
        this.numberToUpdate = this.startNumber;
        let display_str = [this.old_str.slice(0, this.numberPosInString), CurrencyConverter.getCreditString(this.numberToUpdate, false, this.useInteger), this.old_str.slice(this.numberPosInString + 1)].join('');

        this.string = this.strPrefix + display_str;
        if (this.innerLabel)
            this.innerLabel.string = this.strPrefix + display_str;
        this.isPlayingAnim = true;

        //sound
        cc.Tween.stopAllByTarget(this.node);
        if (this.sfxID) {
            SoundController.inst.MainAudio.stopAudioPlay(this.sfxID);
            this.sfxID = null;
        }
        this.sfxID = sfxFn ? sfxFn() : SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxPointIncrement, true);
        cc.tween(this.node)
            .delay(this.animDuration)
            .call(() => {
                if (this.sfxID) {
                    SoundController.inst.MainAudio.stopAudioPlay(this.sfxID);
                    this.sfxID = null;
                }
            })
            .start();
    }

    getIsPlayingAnim() { return this.isPlayingAnim; }

    finishAnim() {
        if (!this.isPlayingAnim)
            return;
        this.isPlayingAnim = false;
        let display_str = this.old_str;
        if(this.endNumber > 0){
            display_str = [this.old_str.slice(0, this.numberPosInString), CurrencyConverter.getCreditString(this.endNumber, false, this.useInteger), this.old_str.slice(this.numberPosInString + 1)].join('');
        }
        this.string = this.strPrefix + display_str;
        if (this.innerLabel)
            this.innerLabel.string = this.strPrefix + display_str;
        if (this.sfxID) {
            SoundController.inst.MainAudio.stopAudioPlay(this.sfxID);
            this.sfxID = null;
        }
        if (this.onFinishCallback) {
            this.onFinishCallback();
            this.onFinishCallback = null;
        }
    }
}
