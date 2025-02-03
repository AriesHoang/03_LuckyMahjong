// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import PopupController from "../Manager/PopupController";
import RootData from "../Manager/RootData";
import BetOptions from "../Popup/BetOptions/BetOptions";
import WalletBalance from "../Popup/WalletBalance/WalletBalance";
import Utils from "../Utils/Utils";
import SoundController from "../Manager/SoundController";
import {AudioPlayId} from "../Core/audio/AudioPlayId";
import BetOptionsNew from "../Popup/BetOptions/BetOptionsNew";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GameStatsInfo extends cc.Component {

    @property(cc.Label)
    balanceLabel: cc.Label = null;

    @property(cc.Label)
    betLabel: cc.Label = null;

    @property(cc.Label)
    profitLabel: cc.Label = null;

    onEnable() {
        this.onBalanceChanged();
        this.onBetAmountChanged();
        this.onProfitAmountChanged();
        clientEvent.on(EventName.BalanceChanged, this.onBalanceChanged, this);
        clientEvent.on(EventName.BetAmountChanged, this.onBetAmountChanged, this);
        clientEvent.on(EventName.ProfitAmountChanged, this.onProfitAmountChanged, this);
        // clientEvent.on(EventName.UpdateBet, this.onBetAmountChanged, this);
    }

    onDisable() {
        clientEvent.off(EventName.BalanceChanged, this.onBalanceChanged, this);
        clientEvent.off(EventName.BetAmountChanged, this.onBetAmountChanged, this);
        clientEvent.off(EventName.ProfitAmountChanged, this.onProfitAmountChanged, this);
        // clientEvent.off(EventName.UpdateBet, this.onBetAmountChanged, this);
    }

    onBalanceChanged(): void {
        this.balanceLabel.string = Utils.MixCurrecyStr(RootData.instance.playerData.balance);
    }

    onBetAmountChanged(): void {
        this.betLabel.string = Utils.MixCurrecyStr(RootData.instance.gamePlayData.getCurBet());
    }

    onProfitAmountChanged(): void {
        cc.log("MISSING onProfitAmountChanged");
        // return;
        let a = Utils.MixCurrecyStr(RootData.instance.gamePlayData.profitAmount)
        // let a = RootData.instance.gamePlayData.profitAmount;
        this.profitLabel.string = "" + a;
    }

    onClickShowWalletBalace() {
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
        PopupController.instance.show(WalletBalance);
    }
    onClickShowBetOptions() {
        // SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
        PopupController.instance.show(BetOptionsNew);
    }
    onClickShowHistory() {
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
        PopupController.instance.show(History);
    }
}