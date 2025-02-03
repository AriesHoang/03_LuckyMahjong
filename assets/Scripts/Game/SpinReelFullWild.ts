import { Cfg } from "../Manager/Config";
import Utils from "../Utils/Utils";
import { E_SYMBOL, ItemConfig } from "./ItemConfig";
import ItemSymbol from "./ItemSymbol";
import SpinReelNormal from "./SpinReelNormal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpinReelFullWild extends SpinReelNormal {


    init(id: number, listItem: Array<ItemConfig>, itemSize: cc.Vec2 = null, slotSize: number = null) {
        this.clear();

        if (slotSize) {
            this.slotSize = slotSize;
        }

        if (itemSize) {
            this.itemSize = itemSize;
        }

        let classifiedItems = listItem;

        let index = 0;

        for (let i = 0; i < classifiedItems.length; i++) {
            let classifiedItem = classifiedItems[i];
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
                item.node.setContentSize(this.itemSize.x, this.itemSize.y * classifiedItem.size)
            };
            item.node.parent = this.node;
            item.init(classifiedItem[0]);

            for (let ci = 0; ci < classifiedItem.size; ci++) {
                this.mapKeysItem.push(i)
            }


            this.itemList.push(item);


            index += classifiedItem.size;


        }
        // this.getComponent(cc.Layout).updateLayout();
    }


    CreateRealItem() {

        let items = this.spinResult;
        //reverse to get correct result order
        items.slice().reverse().forEach((type, index) => {
            let item: ItemSymbol
            if (type.size > 1) {
                let config = type[0];
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
                let config = type[0];
                item = this.createItem();
                item.node.setContentSize(this.itemSize.x, this.itemSize.y * type.size)
                item.init(config)

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


    onSpinFinish() {

    }


}
