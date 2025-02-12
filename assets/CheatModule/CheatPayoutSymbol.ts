// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { E_SYMBOL, E_SYMBOL_Atlas } from "../Scripts/Game/ItemConfig";


const { ccclass, property } = cc._decorator;

@ccclass
export default class CheatPayoutSymbol extends cc.Component {


    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    itemAtlas: cc.SpriteAtlas = null;

    private currentNumber: E_SYMBOL = E_SYMBOL.H1;


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.initialiseImg();

        this.node.on(cc.Node.EventType.TOUCH_START, this.onClicked, this);
    }

    initialiseImg() {
        this.currentNumber = E_SYMBOL.H1;
        this.icon.spriteFrame = this.itemAtlas.getSpriteFrame((E_SYMBOL_Atlas[this.currentNumber]).toString());
    }

    onClicked() {
        const len = Object.keys(E_SYMBOL).length;
        this.currentNumber++;
        if (this.currentNumber >= len - 1)
            this.currentNumber = E_SYMBOL.H1;

        this.icon.spriteFrame = this.itemAtlas.getSpriteFrame((E_SYMBOL_Atlas[this.currentNumber]).toString());
    }

    getCurrentNumber() {
        return this.currentNumber;
    }
}
