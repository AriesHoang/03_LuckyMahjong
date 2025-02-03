import { GameConfig } from "../Manager/Config";
import ItemSymbol from "./ItemSymbol";

export enum E_REEL_STATE {
    IDLE = 0,
    START_SWING,
    SPINNING,
    SPIN_TO_RESULT,
    WAIT_TO_FINISH,
    FINISH_SPIN,
    CHECK_MATCHES,
    WAIT_TO_SHAKE,
    SHAKING,
    WAIT_FOR_NEW_ITEM_CASCADE,
    CASCADE_NEW_ITEM_AFTER_CLEARING_MATCHES,
    FINISH_CHECKING_MATCHES,
    EXPAND,
    MOVE_EXPAND
}
const { ccclass, property } = cc._decorator;

@ccclass
export default class ActionSpinReelBase extends cc.Component {
    public spinSettings;

    actionCheckerList: boolean[] = [];

    itemList: Array<ItemSymbol> = [];

    public spinDelay: number = 0;

    public curSpinSpeed: number = 0;
    public curSpinAcceleration: number = 0;

    _state: E_REEL_STATE = E_REEL_STATE.IDLE;
    public get state(): E_REEL_STATE { return this._state }
    public set state(value) {
        this._state = value;
    }

    protected start(): void {
        let isTurbo = false
        this.spinSettings = (isTurbo ? GameConfig.spinTurbo : GameConfig.spinNormal);
        this.curSpinAcceleration = this.spinSettings.startAccelerate;
        this.curSpinSpeed = 0;
        this.spinDelay = 0;

        this.startSpinning();

        setInterval(() => {
            this.node.children.forEach((child, index) => {
                child.y = index * 108;
            });
        }, 500)
    }

    startSpinning() {
        cc.tween(this.node)
            .delay(this.spinDelay)
            .call(() => {
                this.startSwing();
            })
            .start();
    }

    startSwing() {
        this.itemList.forEach((item, index) => {
            cc.tween(item.node)
                .by(this.spinSettings.startSwingTime, { y: this.spinSettings.startSwingDistance })
                .call(() => {
                    this.actionCheckerList[index] = true;
                })
                .start();
        });
    }

    update(dt) {
        // if (this.state == E_REEL_STATE.SPINNING) {
        //     let deltaY = this.curSpinSpeed * dt;
        // }
        this.curSpinSpeed = Math.max(this.curSpinSpeed, GameConfig.reelHighlightSpinToResultMinSpeed);

        this.curSpinSpeed += this.curSpinAcceleration * dt;

        this.curSpinSpeed = Math.min(this.curSpinSpeed, this.spinSettings.maxSpinSpeed);

        let deltaY = this.curSpinSpeed * dt;

        this.spinItems(deltaY);
    }



    spinItems(dy) {
        this.node.children.forEach((child, index) => {
            child.y -= dy;
        });
    }

}
