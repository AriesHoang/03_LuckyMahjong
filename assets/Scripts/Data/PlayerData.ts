// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../Core/observer/clientEvent";
import { ILifecycleData } from "../Interface/ILifecycleData";
import { Cfg } from "../Manager/Config";
import { EventName } from "../Manager/EventName";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerData implements ILifecycleData {
    public authorizeData: any = null;
    public balance: number = 0;
    public brandCode: string = "";
    public currency: Currency = null;


    public Initialize(): void {

    }

    public Activate(restore: boolean): void {

    }

    public Deactivate(): void {

    }

    public LoadData(data: any): void {
        this.authorizeData = data;
        this.balance = data.balance.amount;
        if (data.balance.currency?.symbol)
            Cfg.currency = data.balance.currency.symbol;
        if (data.balance.currency?.decimalDigits)
            Cfg.decimalDigits = data.balance.currency.decimalDigits 
    }

    public setBalance(v: number) {
        this.balance = v;
        clientEvent.dispatchEvent(EventName.BalanceChanged, this.balance);
    }

    public addBalance(v: number) {
        this.balance += v;
        clientEvent.dispatchEvent(EventName.BalanceChanged, this.balance);
    }

    public getFreeSpinNumWhenAuthorize() {
        return this.authorizeData.freeSpins;
    }
}

export class Currency {
    buildIn: boolean = true;
    code: string = "";
    created: "2021-08-02T16:14:33.929Z";
    id: "727d3d98-6294-bf23-a4ad-963f5b06bf74";
    name: "Thai baht"
}
