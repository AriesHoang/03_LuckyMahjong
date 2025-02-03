// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../Core/observer/clientEvent";
import { E_JACKPOT_TYPE } from "../Data/GamePlayData";
import { EventName } from "../Manager/EventName";
import RootData from "../Manager/RootData";
import DoubleText from "../Common/DoubleText";

const { ccclass, property } = cc._decorator;

const JACKPOT_VALUE = [25, 75, 250, 1000];

@ccclass
export default class JackpotInfo extends cc.Component {
    @property(cc.Label)
    grandLb: cc.Label = null;

    @property(cc.Label)
    majorLb: cc.Label = null;

    @property(cc.Label)
    minorLb: cc.Label = null;

    @property(cc.Label)
    miniLb: cc.Label = null;

    onEnable() {
        this.onBetAmountChanged();
        clientEvent.on(EventName.BetAmountChanged, this.onBetAmountChanged, this);
    }

    onDisable() {
        clientEvent.off(EventName.BetAmountChanged, this.onBetAmountChanged, this);
    }

    onBetAmountChanged(): void {
        let locale_opt =
        {
            minimumFractionDigits: 0,
            style: "decimal"
        };
        this.grandLb.string = (RootData.instance.gamePlayData.getCurJackpotValue(E_JACKPOT_TYPE.GRAND).toLocaleString(undefined, locale_opt));
        this.majorLb.string = (RootData.instance.gamePlayData.getCurJackpotValue(E_JACKPOT_TYPE.MAJOR).toLocaleString(undefined, locale_opt));
        this.minorLb.string = (RootData.instance.gamePlayData.getCurJackpotValue(E_JACKPOT_TYPE.MINOR).toLocaleString(undefined, locale_opt));
        this.miniLb.string = (RootData.instance.gamePlayData.getCurJackpotValue(E_JACKPOT_TYPE.MINI).toLocaleString(undefined, locale_opt));
    }

}
