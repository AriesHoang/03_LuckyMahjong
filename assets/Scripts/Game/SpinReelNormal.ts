import BoardData from "../Data/GamePlay/BoardData";
import { Cfg } from "../Manager/Config";
import RootData from "../Manager/RootData";
import Utils from "../Utils/Utils";
import ItemBigSymbol from "./ItemBigSymbol";
import { E_SYMBOL, ItemConfig } from "./ItemConfig";
import ItemSymbol from "./ItemSymbol";
import SpinReel from "./SpinReel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpinReelNormal extends SpinReel {

    mapKeysItem: number[] = []

    protected start(): void {
        super.start();
        this.actionReelSpin.ActionFinishSpin.add(this.onSpinFinish.bind(this));
    }

    init(id: number, listItem: Array<ItemConfig>, itemSize: cc.Vec2 = null, slotSize: number = null) {
        this.clear();

        this.slotSize = Cfg.slotSize.y;
        if (slotSize) {
            this.slotSize = slotSize;
        }

        if (itemSize) {
            this.itemSize = itemSize;
        }

        // let classifiedItems = SpinReelNormal.GetClassifyItem(listItem, E_SYMBOL.WILD);

        let index = 0;

        for (let i = 0; i < listItem.length; i++) {
            let classifiedItem = listItem[i];
            let item: ItemSymbol;

            if (classifiedItem.size > 1) {
                item = this.createBigItem(classifiedItem.size);
                let posY = ((this.slotSize - 1) / 2 - index) * this.itemSize.y;
                posY = posY - ((classifiedItem.size - 1) * this.itemSize.y) / 2
                item.node.setPosition(0, posY);
                let newsize = this.itemSize.y * classifiedItem.size;
                item.node.setContentSize(this.itemSize.x, newsize)

            } else {
                item = this.createItem();
                item.node.setPosition(0, ((this.slotSize - 1) / 2 - index) * this.itemSize.y);
                item.node.setContentSize(this.itemSize.x, this.itemSize.y * 1)
            };
            item.node.parent = this.node;
            item.init(classifiedItem);

            for (let ci = 0; ci < classifiedItem.size; ci++) {
                this.mapKeysItem.push(i)
            }

            this.itemList.push(item);
            index += classifiedItem.size;
        }
        // this.getComponent(cc.Layout).updateLayout();
    }

   


    removeAllOffScreenItems() {
        // put items that fall outside of view to pool
        let bot_item;
        while (bot_item = this.getBotItem(), bot_item.node.y < -this._displayHeight * 0.5 - Cfg.itemSize.y * 0.5) {
            let bigItem = bot_item as ItemBigSymbol;

            if (bigItem) {
                for (let index = 0; index < bigItem.numItemConfigs; index++) {
                    this.mapKeysItem.pop();
                }
            } else {
                this.mapKeysItem.pop();
            }

            this.removeBotItem();
        }
    }

    getItem(pos: number) {
        // let id = this.mapKeysItem[pos]
        return this.itemList.length == 1 ? this.itemList[0] : this.itemList[pos];
    }

    onSpinFinish() {
        
    }

    



    CreateRealItem() {
        let items = this.spinResult;
        this.actionReelSpin.slotNum = items.length;
        //reverse to get correct result order
        items.slice().reverse().forEach((type, index) => {
            let item: ItemSymbol
            if (type.size > 1) {
                let config = type;
                item = this.createBigItem(type.size);
                item.node.setContentSize(this.itemSize.x, this.itemSize.y * type.size)
                item.init(config);

                for (let index = 0; index < this.mapKeysItem.length; index++) {
                    this.mapKeysItem[index] += 1;
                }
                for (let ci = 0; ci < type.size; ci++) {
                    this.mapKeysItem.unshift(0);
                }

            } else {
                let config = type;
                item = this.createItem();
                item.node.setContentSize(this.itemSize.x, this.itemSize.y * type.size)
                if(config.symbol == E_SYMBOL.MULTIPLIER){
                    let boardData = RootData.instance.FindComponent(BoardData);
                    if(boardData.indexMultiplier < boardData.multiplierValue.length){
                        config.value = boardData.multiplierValue[boardData.indexMultiplier];
                        boardData.indexMultiplier++;
                    }
                }
                item.init(config)
                // item.onAppearPromise();

                for (let index = 0; index < this.mapKeysItem.length; index++) {
                    this.mapKeysItem[index] += 1;
                }

                for (let ci = 0; ci < type.size; ci++) {
                    this.mapKeysItem.unshift(0);
                }
            };

            // let item = this.createItem(type);
            this.addItemAtTop(item);
        });
    }

    CreateFakeItem(num_fake_items) {
        for (let i = 0; i < num_fake_items; ++i) {
            const itemCfg: ItemConfig = {
                symbol: Utils.randomArr(Cfg.items),
                value: 0,
                type: 0,
                size: 1
            };
            let item = this.createItem();
            item.node.setContentSize(this.itemSize.x, this.itemSize.y * 1)
            item.init(itemCfg)

            this.addItemAtTop(item);

        }
    }


    addItemAtTop(item: ItemSymbol) {

        let top_item = this.getTopItem();
        item.node.parent = this.node;
        item.node.x = 0;
        item.node.y = this.getPositionNextY(item.node, top_item.node);

        this.itemList.unshift(item);
        this.updateItemZOrder();

        this.setItemSpinAnim(item);
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



}
