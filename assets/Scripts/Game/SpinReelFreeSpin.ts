// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import BoardData from "../Data/GamePlay/BoardData";
import { Cfg } from "../Manager/Config";
import RootData from "../Manager/RootData";
import Utils from "../Utils/Utils";
import { E_SYMBOL, ItemConfig } from "./ItemConfig";
import ItemSymbol from "./ItemSymbol";
import SpinReel from "./SpinReel";
import SpinReelNormal from "./SpinReelNormal";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpinReelFreeSpin extends SpinReelNormal {


    CreateRealItem() {
        // let b = [
        //     [{ symbol: 4, value: 0, type: 0 },
        //     { symbol: 4, value: 0, type: 0 },],
        //     [{ symbol: 9, value: 0, type: 0 }],
        //     [{ symbol: 9, value: 0, type: 0 },],
        //     [{ symbol: 9, value: 0, type: 0 }],]
        // let a = [
        //     { symbol: 4, value: 0, type: 0 },
        //     { symbol: 4, value: 0, type: 0 },
        //     { symbol: 9, value: 0, type: 0 },
        //     { symbol: 9, value: 0, type: 0 },
        //     { symbol: 9, value: 0, type: 0 },]


        let items = this.spinResult;
        this.actionReelSpin.slotNum = items.length;
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
                if(config.symbol == E_SYMBOL.MULTIPLIER){
                    let boardData = RootData.instance.FindComponent(BoardData);
                    if(boardData.indexMultiplier < boardData.multiplierValue.length){
                        config.value = boardData.multiplierValue[boardData.indexMultiplier];
                        boardData.indexMultiplier++;
                    }                        
                }
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



}
