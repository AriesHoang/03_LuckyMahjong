// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { AudioPlay } from "../Core/audio/AudioPlayer";
import { AudioPlayId } from "../Core/audio/AudioPlayId";
import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import SoundController from "../Manager/SoundController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CharacterAinmationState extends cc.Component {

    @property(sp.Skeleton)
    skeAnim: sp.Skeleton = null;
    oldPos: cc.Vec3

    protected onEnable(): void {
        clientEvent.on(EventName.OnWinTumble,this.OnHaveWinLine,this);
    }
    protected onDisable(): void {
        clientEvent.off(EventName.OnWinTumble,this.OnHaveWinLine,this);
    }

    public OnChangeModeToFreeSpin() {
        return new Promise((resolve: Function) => {
            this.skeAnim.setAnimation(0, "scatter_win", false);
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxTopBannerIntro);
            this.skeAnim.setCompleteListener((trackEntry) => {
                if (trackEntry['animation']['name'] == "scatter_win") {
                    resolve();
                }
            });
        })
    }
    public OnHaveWinLine() {
        return new Promise((resolve: Function) => {
            this.skeAnim.setAnimation(0, "win", false);

            this.skeAnim.setCompleteListener((trackEntry) => {
                if (trackEntry['animation']['name'] == "win") {
                    this.PlayAimIdle();
                    resolve();
                }
            });
        })
    }

    public OnChangeModeToNormal() {
        this.node.position = this.oldPos;
        this.PlayAimIdle();
    }
    PlayAimIdle() {
        this.skeAnim.setAnimation(0, "idle", true);
    }

    start() {
        this.oldPos = this.node.position;
    }


}
