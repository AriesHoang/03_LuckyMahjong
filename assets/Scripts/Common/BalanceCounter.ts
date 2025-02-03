// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import RootData from "../Manager/RootData";
import Utils from "../Utils/Utils";
import NumberLabel from "./NumberLabel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class balanceLabel extends cc.Component {

    @property(cc.Label)
    balanceLabel: cc.Label = null;

    public StepCount = 10;
    public DelayTime = 0.01;

    private currentBalance: number;
    onEnable() {
        this.balanceLabel.string = Utils.MixCurrecyStr(RootData.instance.playerData.balance);
        this.currentBalance = RootData.instance.playerData.balance;

        clientEvent.on(EventName.BalanceChanged, this.onBalanceChanged, this);
    }

    protected onDisable(): void {
        clientEvent.off(EventName.BalanceChanged, this.onBalanceChanged, this);
    }


    onBalanceChanged(): void {

        if (RootData.instance.playerData.balance > this.currentBalance) {
            this.increaseCurrency();
        }
        else {
            this.decreaseCurrency();
        }
    }

    increaseCurrency() {
        // let currentNum:number = 0
        // cc.tween(currentNum).to()
        this.currentBalance = RootData.instance.playerData.balance
        this.balanceLabel.string = Utils.MixCurrecyStr(this.currentBalance);
    }

    decreaseCurrency() {
        this.currentBalance = RootData.instance.playerData.balance
        this.balanceLabel.string = Utils.MixCurrecyStr(this.currentBalance);
    }


}
