import { Cfg, GameConfig } from "../Manager/Config";
import Utils from "../Utils/Utils";
import ActionSpinReel, { E_REEL_STATE } from "./ActionSpinReel";
import ItemBigSymbol from "./ItemBigSymbol";
import { ItemConfig } from "./ItemConfig";
import ItemSymbol from "./ItemSymbol";
import SpinReelNormal from "./SpinReelNormal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActionSpinReelNormal extends ActionSpinReel {



    // protected start() {
    //     this.spinReel = this.node.getComponent(SpinReelNormal);
    //     this._displayHeight = this.node.height;

    //     this.itemList = this.spinReel.itemList;
    //     this.itemPrefab = this.spinReel.itemPrefab;
    //     this.itemBigPrefab = this.spinReel.itemBigPrefab;
    //     this.slotNum = this.spinReel.slotSize;
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
    //             let num_fake_items = (this._displayHeight * 0.5 + this.spinReel.itemSize.y * 0.5 + deltaY - this.getTopItem().node.y) / this.spinReel.itemSize.y;
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

    //             let items = SpinReelNormal.GetClassifyItem(this.spinResult);
    //             //reverse to get correct result order
    //             items.slice().reverse().forEach((type, index) => {
    //                 let item
    //                 if (type.length > 1) {
    //                     let config = type[0];
    //                     item = this.createBigItem(config, type.length);
    //                 } else {
    //                     let config = type[0];
    //                     item = this.createItem(config);
    //                 };
    //                 // let item = this.createItem(type);
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

    // createBigItem(itemCfg: ItemConfig, nums): ItemBigSymbol {
    //     //TODO overriden by derived class
    //     let a = ItemBigSymbol.create(this.itemBigPrefab);
    //     a.setNumItemConfigs(nums)
    //     a.init(itemCfg);
    //     return a;

    // }


}
