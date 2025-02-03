import { clientEvent } from "../Core/observer/clientEvent";
import { oneToMultiListener } from "../Core/observer/oneToMultiListener";
import { ILifecycleData } from "../Interface/ILifecycleData";
import { EventName } from "../Manager/EventName";
import AudioManager from "../Core/audio/AudioManager";
import Utils from "../Utils/Utils";
import RootData from "../Manager/RootData";
import { Cfg, GameConfig } from "../Manager/Config";
import {E_SYMBOL, ItemConfig} from "../Game/ItemConfig";

export default class GamePlayData implements ILifecycleData {
    public buyFeatureData = null;

    configData: any = null;

    public betSize: number = 0;
    public betLevel: number = 0;
    public baseBetLevel: number = 0;
    public betAmountList: number[] = [];
    public isAnteBet: boolean = false;
    public profitAmount: number = 0;

    public cheatData: any = null;

    private _enableCheatFreeSpin: boolean = false;
    public get enableCheatFreeSpin(): boolean {
        const savedValue = this._enableCheatFreeSpin;
        this._enableCheatFreeSpin = false;
        return savedValue;
    }
    public set enableCheatFreeSpin(isCheat) {
        this._enableCheatFreeSpin = isCheat;
    }

    _isSoundOn: boolean = true;
    public get isSoundOn(): boolean { return this._isSoundOn };
    public set isSoundOn(value: boolean) {
        this._isSoundOn = value;
        AudioManager.EffectEnable = value;
        AudioManager.MusicEnable = value;
    };

    private _enableCheatBigWin: boolean = false;
    public get enableCheatBigWin(): boolean {
        const savedValue = this._enableCheatBigWin;
        this._enableCheatBigWin = false;
        return savedValue;
    }
    public setEnableCheatBigWin(isCheat) {
        this._enableCheatFreeSpin = isCheat;
    }

    private _enableCheatMegaWin: boolean = false;
    public get enableCheatMegaWin(): boolean {
        const savedValue = this._enableCheatMegaWin;
        this._enableCheatMegaWin = false;
        return savedValue;
    }
    public setEnableCheatMegaWin(isCheat) {
        this._enableCheatFreeSpin = isCheat;
    }

    private _enableCheatSuperMegaWin: boolean = false;
    public get enableCheatSuperMegaWin(): boolean {
        const savedValue = this._enableCheatSuperMegaWin;
        this._enableCheatSuperMegaWin = false;
        return savedValue;
    }
    public setEnableCheatSuperMegaWin(isCheat) {
        this._enableCheatFreeSpin = isCheat;
    }

    private _enableCheatMoneyCollect: boolean = false;
    public get enableCheatMoneyCollect(): boolean {
        const savedValue = this._enableCheatMoneyCollect;
        this._enableCheatMoneyCollect = false;
        return savedValue;
    }
    public setEnableCheatMoneyCollect(isCheat) {
        this._enableCheatFreeSpin = isCheat;
    }

    private _enableCheatJackpot: boolean = false;
    public get enableCheatJackpot(): boolean {
        const savedValue = this._enableCheatJackpot;
        this._enableCheatJackpot = false;
        return savedValue;
    }

    public setEnableCheatJackpot(isCheat) {
        this._enableCheatFreeSpin = isCheat;
    }




    Initialize(): void {

    }

    Activate(restore: boolean): void {

    }

    Deactivate(): void {

    }

    public LoadData(data: any): void {
        this.configData = data;

        // this.configData.betSizes.forEach(betSize => {
        //     this.configData.betLevels.forEach(betLevel => {
        //         //dont use base bet double for bet amount list
        //         let bet_amount = betLevel.value * betSize.value * this.configData.config.baseBet;
        //         bet_amount = parseFloat(bet_amount.toFixed(2));
        //         this.betAmountList.push(bet_amount);
        //     });
        // });
        this.betAmountList = this.configData.balance.currency.betAmounts;

        this.betAmountList = this.betAmountList.filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        });
        this.betAmountList.sort((lhs, rhs) => {
            return lhs - rhs;
        });

        //Default betLevel
        this.betLevel = 0;

        // //default bet settings
        // this.betSize = this.configData.betSizes.findIndex((item) => {
        //     return item.default == true || item.default == "true";
        // });
        // if (this.betSize < 0) this.betSize = 0;
        // this.betLevel = this.configData.betLevels.findIndex((item) => {
        //     return item.default == true || item.default == "true";
        // });
        // if (this.betLevel < 0) this.betLevel = 0;
        // this.baseBetLevel = 0;
        // // this.parseRTPConfig();
    }


    public updateLastBetData(lastBet: any) {
        if (!lastBet) return;
        //default bet settings
        const last_bet_size_id = this.configData.betSizes.findIndex((item) => {
            return item.value == lastBet.betSize;
        });
        if (last_bet_size_id >= 0) this.betSize = last_bet_size_id;
        const last_bet_level_id = this.configData.betLevels.findIndex((item) => {
            return item.value == lastBet.betLevel;
        });
        if (last_bet_level_id >= 0) this.betLevel = last_bet_level_id;
        // const last_base_bet_id = this.configData.config.baseBet.findIndex( (item) => {
        //     return item == lastBet.baseBet;
        // });
        // if (last_base_bet_id >= 0) this.baseBetLevel = last_base_bet_id;
        this.isAnteBet = (lastBet.baseBet == this.configData.config?.baseBetDouble);
        this.baseBetLevel = 0;
    }

    public updateBuyFeatureData(data) {
        this.buyFeatureData = data;
    }

    public getCurBetNormal(): number {
        // const bet_size = this.configData.betSizes[this.betSize].value;
        // const bet_level = this.configData.betLevels[this.betLevel].value;
        // const bet_amount = bet_size * bet_level;
        // const base_bet = this.configData.config.baseBet;
        return this.betAmountList[this.betLevel];
    }

    getCurBaseBet(): number {
        return this.getBaseBetOptions()/* [this.baseBetLevel] */;
    }

    public getBaseBetOptions(): number {
        // return (this.isAnteBet ? this.configData.config.baseBetDouble : this.configData.config.baseBet) as number[];
        return this.isAnteBet ? this.configData.config.baseBetDouble : this.configData.config.baseBet as number;
    }

    public getCurBet(): number {
        // let bet_size = this.configData.betSizes[this.betSize].value;
        // let bet_level = this.configData.betLevels[this.betLevel].value;
        // let bet_amount = bet_size * bet_level;
        // let base_bet = this.getCurBaseBet();

        let bet_amount = this.betAmountList[this.betLevel] * (RootData.instance.gamePlayData.isAnteBet ? GameConfig.rateAnte : 1);
        return parseFloat(bet_amount.toFixed(Cfg.decimalDigits));
    }

    getBuyFeaturePrice(buyFeatureID: number): number {
        if (buyFeatureID == 0) {
            const price = this.getCurBetNormal() * this.buyFeatureData[buyFeatureID].multiplePrice;
            return parseFloat(price.toFixed(Cfg.decimalDigits));
        } else {
            const price = this.getCurBetNormal() * this.configData.config.gamblePrice;
            return parseFloat(price.toFixed(Cfg.decimalDigits));
        }
    }

    getBuyGamblePrice(): number {
        return parseFloat((this.configData.config.gamblePrice * this.getCurBetNormal()).toFixed(Cfg.decimalDigits));
    }

    public setProfitAmount(value: number): void {
        this.profitAmount = value;
        clientEvent.dispatchEvent(EventName.ProfitAmountChanged, this.profitAmount);
    }
    public addProfitAmount(value: number): void {
        this.profitAmount += value;
        clientEvent.dispatchEvent(EventName.ProfitAmountChanged, value);
    }

    public getCurJackpotValue(type: E_JACKPOT_TYPE): number {
        const multiplier = Cfg.jackpotValues[type.toString()];
        return parseFloat((this.getCurBetNormal() * multiplier).toFixed(Cfg.decimalDigits));
    }

    public getBetSizeValue(): string {
        return this.configData.betSizes[this.betSize].value;
    }

    public getBetLevelValue(): string {
        return this.configData.betLevels[this.betLevel].value;
    }

    public getbaseBetLevel(): string {
        return this.configData.betLevels[this.baseBetLevel].value;
    }

    getCurBaseBetLevel(): number {
        return this.baseBetLevel;
    }

    getBuyFeatureId(buyFeatureID: number): string {
        return this.buyFeatureData[buyFeatureID].id;
    }

    updateBetSize(v: number) {
        if (v == this.betSize) return;

        this.betSize = v;
        clientEvent.dispatchEvent(EventName.BetAmountChanged, this.betSize);
    }

    updateBetLevel(v: number) {
        if (v == this.betLevel) return;

        this.betLevel = v;
        clientEvent.dispatchEvent(EventName.BetAmountChanged, this.betLevel);
    }

    isMaxBetAmount(): boolean {
        return this.getCurBetNormal() == this.betAmountList[this.betAmountList.length - 1];
    }

    isMinBetAmount(): boolean {
        return this.getCurBetNormal() == this.betAmountList[0];
    }

    updateBaseBetLevel(v: number) {
        this.baseBetLevel = v;
    }

    changeBetAmount(v: number) {
        //dont use base bet double to match with bet amount list

        const betLevel = this.betLevel;
        this.updateBetLevel(betLevel + v);

        // const cur_bet_amount = this.getCurBetNormal();
        // const cur_id = this.betAmountList.indexOf(cur_bet_amount);
        // const new_id = Math.max(Math.min(cur_id + v, this.betAmountList.length - 1), 0);
        // const new_bet_amount = this.betAmountList[new_id];
        // //update new bet size/level
        // this.configData.betSizes.forEach((betSize, indexBetSize) => {
        //     this.configData.betLevels.forEach((betLevel, indexBetLv) => {
        //         //dont use base bet double to match bet amount list
        //         let bet_amount = betSize.value * betLevel.value * this.configData.config.baseBet;
        //         bet_amount = parseFloat(bet_amount.toFixed(Cfg.decimalDigits));
        //         if (bet_amount == new_bet_amount) {
        //             this.updateBetSize(indexBetSize);
        //             this.updateBetLevel(indexBetLv);
        //             this.baseBetLevel = 0;
        //         }
        //     });
        // });
    }
    public resetCheatData() {
        this.setEnableCheatMoneyCollect(false);
        this.setEnableCheatSuperMegaWin(false);
        this.setEnableCheatJackpot(false);
        this.setEnableCheatBigWin(false);
        this.setEnableCheatMegaWin(false);
        this.cheatData = null;
    }

    getGambleRewards(level: number): number[] {
        return this.configData.config.gambleReward[level];
    }

    getBetHistoryQueryRange() {
        return this.configData.betQuerySupportDays;
    }

    async parseRTPConfig() {
        const val: number = Number(this.configData?.config?.rtp?.toString());
        if (!isNaN(val) && val != undefined && val != null && val >= 0 && val <= 100) {
            Cfg.rtpValue = val;
        }
    }

}



export enum E_JACKPOT_TYPE {
    HIDDEN = -1,
    MINI = 1,
    MINOR = 2,
    MAJOR = 3,
    GRAND = 4
}