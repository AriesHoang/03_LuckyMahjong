// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import Utils from "../Utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BGMainGameAnimState extends cc.Component {

    @property(sp.Skeleton)
    skeAnim: sp.Skeleton = null;


    time: number = 2;
    isNormal: boolean = true;

    public OnChangeModeToFreeSpin() {
        this.isNormal = false;
        return new Promise((resolve: Function) => {
            this.skeAnim.setAnimation(0, "win_scatter", false);

            this.skeAnim.setCompleteListener((trackEntry) => {
                if (trackEntry['animation']['name'] == "win_scatter") {
                    resolve();

                }
            });
        })
    }

    public OnChangeModeToNormal() {
        this.playIdle();
        this.isNormal = true;
    }

    public onSpinButtonPressed(isBuyFeature: boolean = false, buyFeatureID: number = null, claimAmount: number = null) {
        if (!isBuyFeature) {
            this.skeAnim.setAnimation(0, "spin", false);
        }
    }


    update(dt) {
        if (!this.isNormal) return;
        this.time -= dt
        if (this.time < 0) {
            this.playIdle2();
            this.time = Utils.randomFromTo(10, 20);
        }
    }
    playIdle2() {
        return new Promise((resolve: Function) => {
            this.skeAnim.setAnimation(0, "idle2", false);

            this.skeAnim.setCompleteListener((trackEntry) => {
                if (trackEntry['animation']['name'] == "idle2") {
                    this.playIdle();
                    resolve();
                }
            });
        })
    }
    playIdle() {
        this.skeAnim.setAnimation(0, "idle", true);
    }
}
