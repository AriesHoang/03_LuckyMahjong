import { clientEvent } from "../Core/observer/clientEvent";
import { Signal } from "../Core/observer/Signal";
import { Cfg, GameConfig } from "../Manager/Config";
import { EventName } from "../Manager/EventName";
import Utils from "../Utils/Utils";
import { E_SYMBOL, ItemConfig } from "./ItemConfig";
import ItemSymbol from "./ItemSymbol";
// import SpinReel from "./SpinReel";

const { ccclass, property } = cc._decorator;

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
const ROW_NUM: number = 3;
const TOP_PADDING = 0;

@ccclass
export default class ActionSpinReel extends cc.Component {

    itemList: Array<ItemSymbol> = [];


    public spinResult: ItemConfig[] = [];

    protected _displayHeight: number = 0;
    public get displayHeight() { return this._displayHeight; }

    state: E_REEL_STATE = E_REEL_STATE.IDLE;
    actionCheckerList: boolean[] = [];
    animCheckerList: boolean[] = [];
    public curSpinAcceleration: number = 0;
    public curSpinSpeed: number = 0;
    public spinSettings;
    public hasSpinData: boolean = false;
    public canSpintoResult: boolean = false;
    public skipFakeSpin: boolean = false;
    public spinDelay: number = 0;
    public isBlur: boolean = false;
    public isHighlight: boolean = false;
    public itemSize: cc.Vec2 = Cfg.itemSize;

    protected expandItemID: number = -1;
    protected finishCallback: Function = null;

    protected _slotNum: number = Cfg.slotSize.y;
    public get slotNum(): number {
        return this._slotNum;
    }
    public set slotNum(v: number) {
        this._slotNum = this._slotNum = this._doDisplayEdgeItems ? v + 2 : v;
    }


    protected _isFrozen: boolean = false;
    public get isFrozen(): boolean {
        return this._isFrozen;
    }
    public set isFrozen(v: boolean) {
        this._isFrozen = v;
    }

    protected _doDisplayEdgeItems: boolean = false;
    protected _shiftDistArr: number[] = [];

    // protected spinReel: SpinReel;

    public ActionCreateFakeItems: Signal = new Signal();
    public ActionCreateRealItems: Signal = new Signal();
    public ActionRemoveAllOffScreenItems: Signal = new Signal();
    public ActionFinishSpin: Signal = new Signal();

    protected start() {
        this._displayHeight = this.node.height;
    }
    updateDisplayHeight(height){
        this._displayHeight = height;
    }

    getTopItem(): ItemSymbol {
        return this.itemList.length > 0 ? this.itemList[0] : null;
    }

    getBotItem(): ItemSymbol {
        return this.itemList.length > 0 ? this.itemList[this.itemList.length - 1] : null;
    }

    getItem(pos: number) {
        return this.itemList[this._doDisplayEdgeItems ? pos + 1 : pos];
    }
    startSpinning() {
        if (!this.isFrozen) {
            cc.tween(this.node)
                .delay(this.spinDelay)
                .call(() => {
                    this.startSwing();
                })
                .start();
        } else {
            this.state = E_REEL_STATE.FINISH_SPIN;
        }
    }

    startSwing() {
        this.state = E_REEL_STATE.START_SWING;
        this.actionCheckerList = [];
        this.itemList.forEach((item, index) => {
            cc.tween(item.node)
                .by(this.spinSettings.startSwingTime, { y: this.spinSettings.startSwingDistance })
                .call(() => {
                    this.actionCheckerList[index] = true;
                })
                .start();
        });
    }
    setHasSpinData(v: boolean, spinResultArr: ItemConfig[] = [], needHighlight: boolean = false, callback: Function = null) {
        if (this.isFrozen) {
            if (callback)
                callback();
            return;
        }
        this.hasSpinData = v;
        if (this.hasSpinData)
            this.spinResult = spinResultArr;

        this.finishCallback = callback;
        this.isHighlight = needHighlight;

        if (!v) {
            this.canSpintoResult = v;
        } else {
            if (needHighlight) {
                cc.tween(this.node)
                    .delay(GameConfig.reelHighlightDuration)
                    .call(() => {
                        this.canSpintoResult = v;
                    })
                    .start();
            } else {
                cc.tween(this.node)
                    .delay(this.spinDelay)
                    .call(() => {
                        this.canSpintoResult = v;
                    })
                    .start();
            }
        }
    }


    isActionListFinished(list: boolean[]) {
        return (list && list.length > 0 && list.find(element => element == false) == undefined);
    }

    spinItems(dy) {
        this.node.children.forEach((child, index) => {
            child.y -= dy;
        });
    }

    getDistanceToResult() {
        const top_item = this.getTopItem();
        const content_height = this.displayHeight;
        const top_dest_pos = (content_height - top_item.node.height) * 0.5 + TOP_PADDING;
        return top_item.node.y - top_dest_pos;
    }

    setItemZOrder(item: ItemSymbol, customZOrder: number = null) {
        // let id = item.itemCfg.symbol;
        // if (customZOrder == null) {
        //     let zOrder = 1;
        //     if (id == E_SYMBOL.WILD) {
        //         zOrder = 100;
        //     } else if (id >= E_SYMBOL.H1 && id <= E_SYMBOL.H4) {
        //         zOrder = 10;
        //     }
        //     item.node.zIndex = zOrder;
        // } else {
        //     item.node.zIndex = customZOrder;
        // }
    }

    disableBlur() {
        if (this.isBlur) {
            this.isBlur = false;
            this.itemList.forEach((item) => {
                item.disableBlur();
            });
        }
    }

    enableBlur() {
        if (!this.isBlur) {
            this.isBlur = true;
            this.itemList.forEach((item) => {
                item.enableBlur();
            });
        }
    }


    finishSpin() {

        this.ActionFinishSpin.dispatch();

        if (this.finishCallback) {
            this.finishCallback();
        }
        clientEvent.dispatchEvent(EventName.ReelFinishSpin);
    }

    waitfinishSpin() {
        let count = this.itemList.length;
        for (let i = count - 1; i >= 0; --i) {
            let child_node = this.itemList[i];
            //delete items in list that has index >= ROW_NUM => keep only item id: 0, 1, 2, ..., ROW_NUM - 1
            if (i >= this._slotNum) {
                //remove
                this.itemList.splice(i, 1);
                //put back to pool
                child_node.remove();
            }
        }

        let distance = this.getDistanceToResult();
        this.actionCheckerList = [];
        this.animCheckerList = [];
        let swing_distance = this.spinSettings.reelSwingDistance;
        let swing_speed = this.curSpinSpeed * 0.1;
        let swing_time = swing_distance / swing_speed;
        this.node.children.forEach((child, index) => {
            child.stopAllActions();
            let item: ItemSymbol = child.getComponent(ItemSymbol);

            this.actionCheckerList[index] = false;
            cc.tween(child)
                .by(distance / this.curSpinSpeed, { y: -distance })
                .call(() => {
                    clientEvent.dispatchEvent(EventName.ReelWaitfinishSpin);
                })
                .by(swing_time, { y: swing_distance })
                .by(swing_time, { y: -swing_distance })
                .call(() => {
                    this.actionCheckerList[index] = true;
                })
                .start();
            this.animCheckerList[index] = false;
            item.onAppearPromise().then(() => {
                this.animCheckerList[index] = true;
            });
        });
        
    }

    skipToSpinningToResult() {
        //do nothing if spin data is not available
        if (!this.hasSpinData || this.isFrozen)
            return;
        if (this.state == E_REEL_STATE.SPINNING) {
            this.skipFakeSpin = true;
            this.spinSettings = GameConfig.spinTurbo;
            this.curSpinAcceleration = 0;
            this.curSpinSpeed = this.spinSettings.maxSpinToResultSpeed;
            this.canSpintoResult = true;
        }
        else if (this.state == E_REEL_STATE.IDLE || this.state == E_REEL_STATE.START_SWING) {
            this.skipFakeSpin = true;
            //reel is delayed, not start spinning yet => stop that delay & start spinning to result
            // cc.Tween.stopAllByTarget(this.node);
            this.state = E_REEL_STATE.SPINNING;
            this.spinSettings = GameConfig.spinTurbo;
            this.curSpinAcceleration = 0;
            this.curSpinSpeed = this.spinSettings.maxSpinToResultSpeed;
            this.canSpintoResult = true;
        }
    }

    update(dt) {
        if (this.state == E_REEL_STATE.START_SWING) {
            if (this.isActionListFinished(this.actionCheckerList)) {
                this.actionCheckerList = [];
                this.state = E_REEL_STATE.SPINNING;
            }
        }
        if (this.state == E_REEL_STATE.SPINNING) {
            const isKeepAccelerate: boolean = (!this.skipFakeSpin || this.isHighlight || !this.hasSpinData || !this.canSpintoResult);
            if (isKeepAccelerate) {
                //accelerate
                this.curSpinAcceleration -= this.spinSettings.stopAccelerate * dt / this.spinSettings.timeSpin;
                this.curSpinAcceleration = Math.max(this.curSpinAcceleration, -this.spinSettings.stopAccelerate);
                if (!this.hasSpinData || !this.canSpintoResult)
                    this.curSpinAcceleration = Math.max(this.curSpinAcceleration, 0);
                this.curSpinSpeed += this.curSpinAcceleration * dt;
                this.curSpinSpeed = Math.min(this.curSpinSpeed, this.spinSettings.maxSpinSpeed);
            }
            const isSpinSpeedAndAccelerateAtSpinToResult: boolean = this.curSpinAcceleration > 0 || (this.curSpinAcceleration <= 0 && this.curSpinSpeed > this.spinSettings.maxSpinToResultSpeed);
            const needWaitHighlight: boolean = (this.isHighlight && this.curSpinSpeed > GameConfig.reelHighlightSpinToResultSpeed);
            if (isSpinSpeedAndAccelerateAtSpinToResult || !this.hasSpinData || !this.canSpintoResult || needWaitHighlight) {
                let deltaY = this.curSpinSpeed * dt;
                //calculate fake item amount required
                let num_fake_items = (this._displayHeight * 0.5 + this.itemSize.y * 0.5 + deltaY - this.getTopItem().node.y) / this.itemSize.y;
                num_fake_items = (num_fake_items <= 0 ? 0 : Math.ceil(num_fake_items));

                //put items that fall outside of view to pool
                this.ActionRemoveAllOffScreenItems.dispatch();
                // this.removeAllOffScreenItems();

                //add fake items to top
                this.ActionCreateFakeItems.dispatch(num_fake_items);

                this.spinItems(deltaY);
            }
            else {
                //add result items & spin to result
                this.state = E_REEL_STATE.SPIN_TO_RESULT;
                this.curSpinAcceleration -= this.spinSettings.stopAccelerate * dt / this.spinSettings.timeSpin;
                this.curSpinAcceleration = Math.max(this.curSpinAcceleration, -this.spinSettings.stopToResultAccelerate);
                this.curSpinSpeed += this.curSpinAcceleration * dt;
                if (!this.isHighlight) {
                    this.curSpinSpeed = Math.max(this.curSpinSpeed, this.spinSettings.minStopSpeed);
                } else {
                    this.curSpinSpeed = Math.max(this.curSpinSpeed, GameConfig.reelHighlightSpinToResultMinSpeed);
                }

                if (this._doDisplayEdgeItems) {
                    this.ActionCreateFakeItems.dispatch();

                }

                //reverse to get correct result order
                this.ActionCreateRealItems.dispatch();

                if (this._doDisplayEdgeItems) {
                    this.ActionCreateFakeItems.dispatch(1);
                }
                this.ActionRemoveAllOffScreenItems.dispatch();

                // this.customizeSpinResult();
            }

            //check to enable post effect
            if (this.curSpinSpeed >= this.spinSettings.minSpeedForBlur) {
                this.enableBlur();
            }
        }
        else if (this.state == E_REEL_STATE.SPIN_TO_RESULT) {
            //spin to result
            this.curSpinAcceleration -= this.spinSettings.stopToResultAccelerate * dt / this.spinSettings.timeSpinToResult;
            this.curSpinAcceleration = Math.max(this.curSpinAcceleration, -this.spinSettings.stopToResultAccelerate);
            this.curSpinSpeed += this.curSpinAcceleration * dt;
            if (!this.isHighlight) {
                this.curSpinSpeed = Math.max(this.curSpinSpeed, this.spinSettings.minStopSpeed);
            } else {
                this.curSpinSpeed = Math.max(this.curSpinSpeed, GameConfig.reelHighlightSpinToResultMinSpeed);
            }
            let deltaY = this.curSpinSpeed * dt;
            let distance = this.getDistanceToResult();
            if (distance > deltaY) {
                this.spinItems(deltaY);
                //put items that fall outside of view to pool
                this.ActionRemoveAllOffScreenItems.dispatch();
            } else {
                // this.spinItems(distance);
                this.state = E_REEL_STATE.WAIT_TO_FINISH;

                //check to disable post effect
                this.disableBlur();

                this.waitfinishSpin();
            }

            //check to disable post effect
            if (this.curSpinSpeed < this.spinSettings.maxSpeedStopBlur) {
                this.disableBlur();
            }
        }
        else if (this.state == E_REEL_STATE.WAIT_TO_FINISH) {
            //check to call finish callback
            if (this.isActionListFinished(this.actionCheckerList) && this.isActionListFinished(this.animCheckerList)) {
                this.actionCheckerList = [];
                this.animCheckerList = [];
                this.state = E_REEL_STATE.FINISH_SPIN;

                //reset params
                if (this.skipFakeSpin)
                    this.skipFakeSpin = false;

                this.finishSpin();

            }
        }
        else if (this.state == E_REEL_STATE.FINISH_SPIN) {
            //do nothing, wait for all reels finish spinning signal

        }
        else if (this.state == E_REEL_STATE.FINISH_CHECKING_MATCHES) {

        } else if (this.state == E_REEL_STATE.EXPAND) {
            if (this.isActionListFinished(this.animCheckerList)) {
                this.animCheckerList = [];
            }
        } else if (this.state == E_REEL_STATE.MOVE_EXPAND) {
            if (this.isActionListFinished(this.actionCheckerList)) {
                this.actionCheckerList = [];
                // if (this.finishCallback) {
                //     this.finishCallback();
                //     // this.finishCallback = null; //can reset finishcb here, but not necessary, and might cause bugs when add new states after this state
                // }
                this.finishSpin();
            }
        }
    }

    setReelSize(slotNum: number, displayHeight: number = null, doDisplayEdgeItems: boolean = false) {
        this._doDisplayEdgeItems = doDisplayEdgeItems;
        this._slotNum = slotNum;

        this._displayHeight = displayHeight;

    }

}
