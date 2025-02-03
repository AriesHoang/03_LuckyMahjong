// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html


import { Cfg } from "../Scripts/Manager/Config";
import RootData from "../Scripts/Manager/RootData";
import CheatPayoutSymbol from "./CheatPayoutSymbol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CheatController extends cc.Component {

    @property(cc.Node)
    popupNode: cc.Node = null;

    @property(cc.Node)
    popupButton: cc.Node = null;

    @property(cc.Prefab)
    cheatSymbolPrefab: cc.Prefab = null;

    public cheatList = []

    public popupShown = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        // this.popupButton.active = Cfg.isDebug;
        this.createCheatLayout();
        this.cheatList = this.popupNode.getChildByName("cheatLayout").children;
    }

    createCheatLayout() {
        let cheatLayout = this.popupNode.getChildByName("cheatLayout");
        let gridColumn = Cfg.slotSize.x;
        let gridRow = Cfg.slotSize.y;

        let symbolWidth = (500) / gridColumn;
        let symbolHeight = (380 - (10 * gridRow + 10)) / gridRow;

        for (let i = 0; i < gridRow * gridColumn; i++) {
            let symbol = cc.instantiate(this.cheatSymbolPrefab);
            symbol.setContentSize(symbolWidth, symbolHeight);
            cheatLayout.addChild(symbol);
        }
    }

    // update (dt) {}
    onPopupOpenClicked() {
        this.popupShown = !this.popupShown;
        this.popupButton.getComponent(cc.Button)
        if (this.popupShown) {
            this.popupButton.getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = "Close\nCheat";
            this.popupNode.active = true;
        }
        else {
            this.popupButton.getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = "Open\nCheat";
            this.popupNode.active = false;
        }

    }

    onSubmitButtonClicked() {

        let symbols = [];
        let positions = [];

        this.cheatList.forEach((element, index) => {
            symbols.push((element.getComponent(CheatPayoutSymbol) as CheatPayoutSymbol).getCurrentNumber());
            positions.push(index);
        });

        let cheat = {
            cheatPayoutUsed: true,
            cheatSymbolPosition: {
                "symbols": symbols,
                "positions": positions
            }
        }
        RootData.instance.gamePlayData.cheatData = cheat;


        this.onPopupOpenClicked();
    }
}
