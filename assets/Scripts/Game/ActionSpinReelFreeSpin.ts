// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import ShakeAction from "../Core/ShakeAction";
import { Cfg, GameConfig } from "../Manager/Config";
import Utils from "../Utils/Utils";
import ActionSpinReel, { E_REEL_STATE } from "./ActionSpinReel";
import { ItemConfig } from "./ItemConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActionSpinReelFreeSpin extends ActionSpinReel {

    // getDistanceToResult() {
    //     const content_height = this.spinReel.itemSize.y * this._slotNum;
    //     const top_dest_pos = (content_height - this.spinReel.itemSize.y) * 0.5;
    //     const posTop = this.getTopItem().node.y
    //     return posTop - (content_height - this.spinReel.itemSize.y * 0.5);
    // }

    // update(dt) {
    //     if (this.state == E_REEL_STATE.START_SWING) {
    //         if (this.isActionListFinished(this.actionCheckerList)) {
    //             this.actionCheckerList = [];
    //             this.state = E_REEL_STATE.SPINNING;
    //         }
    //     }
    //     if (this.state == E_REEL_STATE.SPINNING) {
    //         const isKeepAccelerate: boolean = (!this.skipFakeSpin || this.isHighlight || !this.hasSpinData || !this.canSpintoResult);
    //         if (isKeepAccelerate) {
    //             //accelerate
    //             this.curSpinAcceleration -= this.spinSettings.stopAccelerate * dt / this.spinSettings.timeSpin;
    //             this.curSpinAcceleration = Math.max(this.curSpinAcceleration, -this.spinSettings.stopAccelerate);
    //             if (!this.hasSpinData || !this.canSpintoResult)
    //                 this.curSpinAcceleration = Math.max(this.curSpinAcceleration, 0);
    //             this.curSpinSpeed += this.curSpinAcceleration * dt;
    //             this.curSpinSpeed = Math.min(this.curSpinSpeed, this.spinSettings.maxSpinSpeed);
    //         }
    //         const isSpinSpeedAndAccelerateAtSpinToResult: boolean = this.curSpinAcceleration > 0 || (this.curSpinAcceleration <= 0 && this.curSpinSpeed > this.spinSettings.maxSpinToResultSpeed);
    //         const needWaitHighlight: boolean = (this.isHighlight && this.curSpinSpeed > GameConfig.reelHighlightSpinToResultSpeed);
    //         if (isSpinSpeedAndAccelerateAtSpinToResult || !this.hasSpinData || !this.canSpintoResult || needWaitHighlight) {
    //             let deltaY = this.curSpinSpeed * dt;
    //             //calculate fake item amount required
    //             let num_fake_items = (this._displayHeight + this.spinReel.itemSize.y * 0.5 + deltaY - this.getTopItem().node.y) / this.spinReel.itemSize.y;
    //             num_fake_items = (num_fake_items <= 0 ? 0 : Math.ceil(num_fake_items));

    //             //put items that fall outside of view to pool
    //             this.removeAllOffScreenItems();

    //             //add fake items to top
    //             for (let i = 0; i < num_fake_items; ++i) {
    //                 const itemCfg: ItemConfig = {
    //                     symbol: Utils.randomArr(Cfg.items),
    //                     value: 0,
    //                     type: 0
    //                 };
    //                 let item = this.createItem(itemCfg);
    //                 this.addItemAtTop(item);
    //             }
    //             this.spinItems(deltaY);
    //         }
    //         else {
    //             //add result items & spin to result
    //             this.state = E_REEL_STATE.SPIN_TO_RESULT;
    //             this.curSpinAcceleration -= this.spinSettings.stopAccelerate * dt / this.spinSettings.timeSpin;
    //             this.curSpinAcceleration = Math.max(this.curSpinAcceleration, -this.spinSettings.stopToResultAccelerate);
    //             this.curSpinSpeed += this.curSpinAcceleration * dt;
    //             if (!this.isHighlight) {
    //                 this.curSpinSpeed = Math.max(this.curSpinSpeed, this.spinSettings.minStopSpeed);
    //             } else {
    //                 this.curSpinSpeed = Math.max(this.curSpinSpeed, GameConfig.reelHighlightSpinToResultMinSpeed);
    //             }

    //             if (this._doDisplayEdgeItems) {
    //                 const itemCfg: ItemConfig = {
    //                     symbol: Utils.randomArr(Cfg.items),
    //                     value: 0,
    //                     type: 0
    //                 };
    //                 let item = this.createItem(itemCfg);
    //                 this.addItemAtTop(item);
    //             }

    //             //reverse to get correct result order
    //             this.spinResult.slice().reverse().forEach((type, index) => {
    //                 let item = this.createItem(type);
    //                 this.addItemAtTop(item);
    //             });

    //             if (this._doDisplayEdgeItems) {
    //                 const itemCfg: ItemConfig = {
    //                     symbol: Utils.randomArr(Cfg.items),
    //                     value: 0,
    //                     type: 0
    //                 };
    //                 let item = this.createItem(itemCfg);
    //                 this.addItemAtTop(item);
    //             }

    //             this.removeAllOffScreenItems();
    //             this.customizeSpinResult();
    //         }

    //         //check to enable post effect
    //         if (this.curSpinSpeed >= this.spinSettings.minSpeedForBlur) {
    //             this.enableBlur();
    //         }
    //     }
    //     else if (this.state == E_REEL_STATE.SPIN_TO_RESULT) {
    //         //spin to result
    //         this.curSpinAcceleration -= this.spinSettings.stopToResultAccelerate * dt / this.spinSettings.timeSpinToResult;
    //         this.curSpinAcceleration = Math.max(this.curSpinAcceleration, -this.spinSettings.stopToResultAccelerate);
    //         this.curSpinSpeed += this.curSpinAcceleration * dt;
    //         if (!this.isHighlight) {
    //             this.curSpinSpeed = Math.max(this.curSpinSpeed, this.spinSettings.minStopSpeed);
    //         } else {
    //             this.curSpinSpeed = Math.max(this.curSpinSpeed, GameConfig.reelHighlightSpinToResultMinSpeed);
    //         }
    //         let deltaY = this.curSpinSpeed * dt;
    //         let distance = this.getDistanceToResult();
    //         if (distance > deltaY) {
    //             this.spinItems(deltaY);
    //             //put items that fall outside of view to pool
    //             this.removeAllOffScreenItems();
    //         } else {
    //             // this.spinItems(distance);
    //             this.state = E_REEL_STATE.WAIT_TO_FINISH;
    //             this.waitfinishSpin();

    //             //check to disable post effect
    //             this.disableBlur();
    //         }

    //         //check to disable post effect
    //         if (this.curSpinSpeed < this.spinSettings.maxSpeedStopBlur) {
    //             this.disableBlur();
    //         }
    //     }
    //     else if (this.state == E_REEL_STATE.WAIT_TO_FINISH) {
    //         //check to call finish callback
    //         if (this.isActionListFinished(this.actionCheckerList) && this.isActionListFinished(this.animCheckerList)) {
    //             this.actionCheckerList = [];
    //             this.animCheckerList = [];
    //             this.state = E_REEL_STATE.FINISH_SPIN;

    //             //reset params
    //             if (this.skipFakeSpin)
    //                 this.skipFakeSpin = false;

    //             this.finishSpin();

    //         }
    //     }
    //     else if (this.state == E_REEL_STATE.FINISH_SPIN) {
    //         //do nothing, wait for all reels finish spinning signal

    //     }
    //     else if (this.state == E_REEL_STATE.FINISH_CHECKING_MATCHES) {

    //     } else if (this.state == E_REEL_STATE.EXPAND) {
    //         if (this.isActionListFinished(this.animCheckerList)) {
    //             this.animCheckerList = [];
    //             this.onExpandItemFinish();
    //         }
    //     } else if (this.state == E_REEL_STATE.MOVE_EXPAND) {
    //         if (this.isActionListFinished(this.actionCheckerList)) {
    //             this.actionCheckerList = [];
    //             // if (this.finishCallback) {
    //             //     this.finishCallback();
    //             //     // this.finishCallback = null; //can reset finishcb here, but not necessary, and might cause bugs when add new states after this state
    //             // }
    //             this.finishSpin();
    //         }
    //     }
    // }



}
