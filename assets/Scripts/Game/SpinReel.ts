

import BoardData from "../Data/GamePlay/BoardData";
import { Cfg, GameConfig } from "../Manager/Config";
import RootData from "../Manager/RootData";
import CameraEffect from "../Utils/CameraEffect";
import Utils from "../Utils/Utils";
import ActionSpinReel, { E_REEL_STATE } from "./ActionSpinReel";
import ItemBigSymbol from "./ItemBigSymbol";
import { E_SYMBOL, ItemConfig } from "./ItemConfig";
import ItemSymbol from "./ItemSymbol";
const TOP_PADDING = 0;

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpinReel extends cc.Component {

    static pool: cc.NodePool = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;


    public itemList: Array<ItemSymbol> = [];
    protected _shiftDistArr: number[] = [];
    protected clearPosList: number[] = [];

    @property(ActionSpinReel)
    protected actionReelSpin: ActionSpinReel = null;

    @property(cc.Prefab)
    public itemBigPrefab: cc.Prefab = null;

    protected _itemSize: cc.Vec2 = Cfg.itemSize;
    public get itemSize(): cc.Vec2 {
        return this._itemSize;
    }
    public set itemSize(v: cc.Vec2) {
        this._itemSize = v;
    }
    protected _slotSize: number = Cfg.slotSize.y;
    public get slotSize(): number {

        return this._slotSize;
    }
    public set slotSize(v: number) {
        this._slotSize = v;
    }

    public spinResult: ItemConfig[] = [];

    protected _displayHeight: number = 0;

    protected onLoad(): void {
        this.node.children.forEach((child) => {
            this.itemList.push(child.getComponent(ItemSymbol));
        });
    }

    protected start(): void {

        // this.actionReelSpin = this.node.getComponent(ActionSpinReel);
        this.actionReelSpin.ActionCreateFakeItems.add(this.CreateFakeItem.bind(this));
        this.actionReelSpin.ActionRemoveAllOffScreenItems.add(this.removeAllOffScreenItems.bind(this));
        this.actionReelSpin.ActionCreateRealItems.add(this.CreateRealItem.bind(this));
    }

    static create(prefab: cc.Prefab) {
        if (!SpinReel.pool) {
            SpinReel.pool = new cc.NodePool('BoardController');
        }
        let reelNode = SpinReel.pool.get();
        if (!reelNode) {
            reelNode = cc.instantiate(prefab)
        }
        let spinReel = reelNode.getComponent(SpinReel);
        return spinReel;
    }

    init(id: number, listItem: Array<ItemConfig>, itemSize: cc.Vec2 = null, slotSize: number = null) {
        this.clear();

        if (slotSize) {
            this.slotSize = slotSize;
        }

        if (itemSize) {
            this.itemSize = itemSize;
        }

        for (let i = 0; i < listItem.length; i++) {
            let item = this.createItem();

            item.node.parent = this.node;
            item.node.setPosition(0, ((this.slotSize - 1) / 2 - i) * this.itemSize.y);

            item.init(listItem[i]);

            this.itemList.push(item);
        }
    }

    setSlotSizeAndItemSize(itemSize: cc.Vec2, slotSize: number) {
        this.itemSize = itemSize;
        this.slotSize = slotSize;



        this.actionReelSpin.slotNum = slotSize;
        for (let index = this.itemList.length - 1; index < slotSize; index++) {
            const itemCfg: ItemConfig = {
                symbol: Utils.randomArr(Cfg.items),
                value: 0,
                type: 0,
                size: 1,
            };
            let item = this.createItem();
            item.init(itemCfg);

            item.node.parent = this.node;
            this.itemList.push(item);
        }

    }

    setHasSpinData(v: boolean, spinResultArr: ItemConfig[] = [], needHighlight: boolean = false, callback: Function = null) {
        this.spinResult = spinResultArr;
        this.actionReelSpin.setHasSpinData(v, spinResultArr, needHighlight, callback);

    }

    hasSpinData(): boolean {
        return this.actionReelSpin.hasSpinData;
    }

    isHighlight(): boolean {
        return this.actionReelSpin.isHighlight;
    }

    isSkippingFakeSpin(): boolean {
        return this.actionReelSpin.skipFakeSpin;
    }

    skipToSpinningToResult() {
        this.actionReelSpin.skipToSpinningToResult();
    }

    startSpinning(isTurbo: boolean = false, spinDelay: number = 0) {

        this.actionReelSpin.itemList = this.itemList;
        this.actionReelSpin.itemSize = this.itemSize;

        this.actionReelSpin.spinSettings = (isTurbo ? GameConfig.spinTurbo : GameConfig.spinNormal);
        this.actionReelSpin.curSpinAcceleration = this.actionReelSpin.spinSettings.startAccelerate;
        this.actionReelSpin.curSpinSpeed = 0;
        this.actionReelSpin.spinDelay = spinDelay;

        this.actionReelSpin.startSpinning();

    }

    stopItemWinAnim(exceptionID: number = null) {
        this.itemList.forEach((item, index) => {
            if (item.node.parent != this.node) {
                if (exceptionID == null || index != exceptionID) {
                    Utils.changeParent(item.node, this.node);
                }
                (item as ItemSymbol).stopAnimWin();
            }
        });
    }

    setToIdle() {
        this.actionReelSpin.state = E_REEL_STATE.IDLE;
    }

    createItem(): ItemSymbol {
        return ItemSymbol.create(this.itemPrefab);
    }

    getItem(pos: number) {
        return this.itemList.length == 1 ? this.itemList[0] : this.itemList[pos];
    }

    clear() {
        while (this.itemList.length > 0) {
            this.itemList.shift().remove();
        }
    }

    getStateReel() {
        return this.actionReelSpin.state;
    }

    isSpinFinished(): boolean {
        return this.actionReelSpin.state == E_REEL_STATE.FINISH_SPIN;
    }

    isClearingMatchesFinished(): boolean {
        return this.actionReelSpin.state != E_REEL_STATE.CHECK_MATCHES;
    }

    isWaitingToFinish(): boolean {
        return this.actionReelSpin.state == E_REEL_STATE.WAIT_TO_FINISH;
    }

    isWaitingToShakeOldItems(): boolean {
        return this.actionReelSpin.state == E_REEL_STATE.WAIT_TO_SHAKE;
    }

    setReelSize(slotNum: number, displayHeight: number = null, doDisplayEdgeItems: boolean = false) {
        this._displayHeight = displayHeight;
        this.actionReelSpin.setReelSize(slotNum, displayHeight, doDisplayEdgeItems);
    }

    removeAllOffScreenItems() {
        //put items that fall outside of view to pool
        while (this.getBotItem().node.y < -this._displayHeight * 0.5 - Cfg.itemSize.y * 0.5) {
            this.removeBotItem();
        }
    }

    getTopItem(): ItemSymbol {
        return this.itemList.length > 0 ? this.itemList[0] : null;
    }

    getBotItem(): ItemSymbol {
        return this.itemList.length > 0 ? this.itemList[this.itemList.length - 1] : null;
    }

    removeBotItem() {
        let bot_item = this.itemList.pop();
        bot_item.remove();
    }

    CreateFakeItem(num_fake_items) {
        for (let i = 0; i < num_fake_items; ++i) {
            const itemCfg: ItemConfig = {
                symbol: Utils.randomArr(Cfg.items),
                value: 0,
                type: 0,
                size: 1,
            };
            let item = this.createItem();
            item.init(itemCfg)
            this.addItemAtTop(item);
        }
    }

    CreateRealItem() {
        this.spinResult.slice().reverse().forEach((type, index) => {
            let item = this.createItem();
            item.init(type)
            this.addItemAtTop(item);
        });

    }

    addItemAtTop(item: ItemSymbol) {
        let top_item = this.getTopItem();
        item.node.parent = this.node;
        item.node.x = top_item.node.x;
        item.node.y = top_item.node.y + top_item.getSizeItem().y;
        // item.setItemAnim();


        this.itemList.unshift(item);
        this.updateItemZOrder();

        this.setItemSpinAnim(item);
    }

    addNewItemToCascade(item: ItemSymbol, nums = 1) {
        let top_item = this.getTopItem();
        item.node.parent = this.node;
        const first_edge_item_positionY = (this._slotSize + 1) * this.itemSize.y * 0.5;
        if (top_item && top_item.node.y >= first_edge_item_positionY) {
            //current top item will also cascade
            item.node.x = top_item.node.x;
            item.node.y = this.getPositionNextY(item.node, top_item.node);
        } else {
            //add new item outside of display height
            item.node.x = 0; //TODO get x position of item, even when there are no items in reel

            item.node.y = first_edge_item_positionY + (item.getSizeItem().y / 2) - this.itemSize.y / 2;
        }
        item.playItemAnimPromise();

        this.itemList.unshift(item);
        this.updateItemZOrder();
    }


    getPositionNextY(item: cc.Node, top_item: cc.Node, sign: number = 1, anchorY: number = 0.5, _spacingY: number = 0) {
        const startPos = top_item.y + top_item.height / 2;
        let nextY = startPos;
        let childScaleY = item.scaleY;
        const childBoundingBoxHeight = item.height * childScaleY;
        // nextY = nextY + sign * anchorY * childBoundingBoxHeight + sign * _spacingY;
        nextY += sign * (anchorY * childBoundingBoxHeight + _spacingY);

        return nextY;
    }


    cascadeItemsPromise(resultArr: ItemConfig[]): Promise<any> {

        const num_cleared_items = this.clearPosList.length;
        let listItem1 =  this.itemList.map((x)=>x);
        let listItem2 = [];
        for (let i = num_cleared_items - 1; i >= 0; --i) {
            let itemCfg = resultArr[i];
            //add new items at top, reverse order
            let new_item
            if (itemCfg.size > 1) {
                new_item = this.createBigItem(itemCfg.size);
            }
            else new_item = this.createItem();

            

            new_item.node.setContentSize(this.itemSize.x, this.itemSize.y * itemCfg.size)
            if(itemCfg.symbol == E_SYMBOL.MULTIPLIER){
                let boardData = RootData.instance.FindComponent(BoardData);
                if(boardData.indexMultiplier < boardData.multiplierValue.length){
                    itemCfg.value = boardData.multiplierValue[boardData.indexMultiplier];
                    boardData.indexMultiplier++;
                }
            }
            new_item.init(itemCfg);
            this.addNewItemToCascade(new_item);
            listItem2.push(new_item);
        }
    

        //all items cascade
        let prom_arr: Promise<any>[] = [];
        let _id = num_cleared_items;
        listItem1.forEach((item, id) => {
            if (this._shiftDistArr[_id] != 0) {
                prom_arr.push(new Promise((resolve: Function) => {

                    let action = this.spirt(0, - TOP_PADDING - this._shiftDistArr[_id] * this.itemSize.y, true, null, () => {
                        item.onAppearPromise().then(resolve.bind(this));
                    })
                    item.node.runAction(action);
                    

                    // cc.tween(item.node)
                    //     .by(GameConfig.newItemCascadeDuration, { y: - TOP_PADDING - this._shiftDistArr[id] * this.itemSize.y }, { easing: "backOut" })
                    //     .call(() => {
                    //         item.onAppearPromise().then(resolve.bind(this));
                    //     })
                    //     .start();
                }));
            }
            _id++;
        });

        return Promise.all(prom_arr).then(() => {
            let prom_arr2: Promise<any>[] = [];
            listItem2.forEach((item, id) => {
                if (this._shiftDistArr[id] != 0) {
                    prom_arr2.push(new Promise((resolve: Function) => {
                        let action = this.spirt(0, - TOP_PADDING - this._shiftDistArr[id] * this.itemSize.y, true, ()=>{
                            CameraEffect.instance.shakeCameraOnce();
                        }, () => {
                            item.onAppearPromise().then(resolve.bind(this));
                        })
                        item.node.runAction(action);
                    }));
                }
            });

            this._shiftDistArr = [];
            return Promise.all(prom_arr2);
        });
    }

    clearItemsPromise(clearPosList: number[]): Promise<any> {
        let size = this.itemList.length
        this._shiftDistArr = Array.from({ length: size }, () => 0);
        this.clearPosList = clearPosList;
        return new Promise((resolve: Function) => {
            //remove in reverse direction, to avoid index errors
            const sortedClearPosList = clearPosList.sort((lhs, rhs) => rhs - lhs);

            //calculate shift distance arr
            let cur_item_id: number = size - 1, old_item_id: number = size - 1;
            while (cur_item_id >= 0) {
                if (sortedClearPosList.includes(old_item_id) && old_item_id >= 0) {
                    this._shiftDistArr[cur_item_id] += this.itemList[old_item_id].itemCfg.size;
                } else {
                    --cur_item_id;
                    if (cur_item_id >= 0) {
                        this._shiftDistArr[cur_item_id] = this._shiftDistArr[cur_item_id + 1];
                    }
                }
                if (old_item_id >= 0) {
                    --old_item_id;
                }
            }
            sortedClearPosList.forEach((pos) => {
                this.itemList[pos].remove();
                this.itemList.splice(pos, 1);

            });
            resolve();
        });
    }


    updateItemZOrder() {
        this.itemList.forEach((item, index) => {
            //wild first
            //then highpay
            //then items at bottom
            let zOrder = index;
            let id = item.itemCfg.symbol;
            if(id == E_SYMBOL.SCATTER) zOrder += 120;
            if (id <= 6 ) {
             
                zOrder += 100;
            }
            item.node.zIndex = zOrder;
        });
    }

    setItemSpinAnim(item: ItemSymbol) {
        if (this.actionReelSpin.isBlur)
            item.enableBlur();
        else
            item.disableBlur();
    }

    createBigItem(nums): ItemBigSymbol {
        let item = ItemBigSymbol.create(this.itemBigPrefab)
        item.setNumItemConfigs(nums)
        return item;
    }

    $v: number = 1000;
    i_: number = 30;
    n_: number = 0.15;
    e_: number = 0;
    t_: number = 0.25;
    c_: Boolean = true
    s_: number = 1.7
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    spirt(t, i, e, s, o) {
        var c = this,
            r = e ? 5 * this.$v : this.$v,
            h = Math.sqrt(2 * -i / r),
            a = this.i_ - i * this.e_,
            u = .5 * (this.n_ + h * this.e_);
        return cc.sequence(cc.delayTime(t), cc.moveBy(h*0.5, cc.v2(0, i)).easing(cc.easeIn(this.t_)), cc.callFunc(function () {
            if(s)s();
        }), cc.moveBy(u, cc.v2(0, a * 0.5)).easing(cc.easeOut(this.s_)), cc.moveBy(u, cc.v2(0, -a * 0.5)).easing(cc.easeIn(this.s_)), cc.callFunc(o))
    }
    v_ = function () {
        this.c_ = !0
    }

}
