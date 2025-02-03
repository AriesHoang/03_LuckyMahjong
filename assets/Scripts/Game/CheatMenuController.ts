// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { Cfg, envURL, supportedLanguage } from "../Manager/Config";
import { BOARDSIZE, LINECONFIG } from "./LineConfig";
import { E_SYMBOL } from "./ItemConfig";
// import { SoundController } from "./SoundController";
import BasePopup from "../Stageloading/BasePopup";
import RootData from "../Manager/RootData";
import Utils from "../Utils/Utils";
import GameController from "./GameController";
import PopupController from "../Manager/PopupController";
import BigWin from "../Popup/BigWin/BigWin";
import FreespinOutro from "../Popup/FreespinOutro/FreespinOutro";

import Parser = cc.AssetManager.Parser;
import SoundController from "../Manager/SoundController";
import WinFreeSpinsPopup from "../Popup/WinFreeSpinPopup/WinFreeSpinsPopup";
import WinFreespinsInFreespinModePopup from "../Popup/New Folder/WinFreespinsInFreespinModePopup";

const { ccclass, property } = cc._decorator;

class CheatPayoutInfo {
    winline: number;
    symbol: number;
    ofKind: number;
    constructor() {
        this.winline = null;
        this.symbol = null;
        this.ofKind = null;
    }
}

@ccclass
export default class CheatMenuController extends BasePopup {
    @property(cc.Node)
    cheatPayoutLayout: cc.Node = null;

    @property(cc.Label)
    lblSymbol: cc.Label = null;

    @property(cc.Label)
    lblNumOfKind: cc.Label = null;

    @property(cc.Label)
    lblUnit: cc.Label = null;

    @property(cc.Label)
    lblDozen: cc.Label = null;

    @property(cc.Label)
    lblHundred: cc.Label = null;

    private _isMuteBGM: boolean = false;
    public _enableCheatPayout: boolean = false;
    public _cheatPayoutInfo: CheatPayoutInfo = null;
    public get cheatPayoutInfo(): CheatPayoutInfo {
        if (!this._enableCheatPayout) return null;
        this._enableCheatPayout = false;
        const savedValue = this._cheatPayoutInfo;
        this.resetCheatPayout();
        return savedValue;
    }
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.active = false;
    }

    start() {
    }

    protected onEnable() {
        // this.cheatPayoutLayout.active = false;
        GameController.OnStartSpin.add(this.StartSpinning.bind(this));
    }

    protected onDisable() {
        GameController.OnStartSpin.remove(this.StartSpinning.bind(this));
    }


    // update (dt) {}

    toggleCheatMenu() {
        this.node.active = !this.node.active;
    }

    toggleMuteBGM() {
        SoundController.inst.MainAudio.setMusicVolume(Number(this._isMuteBGM));
        this._isMuteBGM = !this._isMuteBGM;
    }

    enableCheatPayout() {
        this._enableCheatPayout = Cfg.isDebug;
    }

    resetCheatPayout() {
        this._cheatPayoutInfo = null;
        this.onResetWinLineClick();
        this.lblSymbol.string = "0";
        this.lblNumOfKind.string = "3";
    }

    isCheatPayoutValid(): boolean {
        return (this._cheatPayoutInfo
            && this._cheatPayoutInfo.winline >= 0 && this._cheatPayoutInfo.winline <= LINECONFIG.posArr.length
            && this._cheatPayoutInfo.symbol >= 0 && this._cheatPayoutInfo.symbol < E_SYMBOL.SYMBOL_NUM
            && this._cheatPayoutInfo.ofKind >= 3 && this._cheatPayoutInfo.ofKind <= 5);
    }

    cheatFreeSpin() {
        // if (Cfg.isDebug) {
        //     this._cheatPayoutInfo.winline[0] = Utils.randomFromTo(1, 3);

        //     this._cheatPayoutInfo.symbol[0] = E_SYMBOL.BLUE_HEART;

        //     this._cheatPayoutInfo.ofKind[0] = 3;

        // } else {
        //     this._cheatPayoutInfo = null;
        // }
        let cheat = {
            triggerWinMode: 14
        }

        RootData.instance.gamePlayData.cheatData = cheat;
    }

    cheatJackpot(){
        let cheat = {
            triggerJackpot: true
        }

        RootData.instance.gamePlayData.cheatData = cheat;
    }

    cheatFreeSpinStickywilds() {
        // if (Cfg.isDebug) {
        //     this._cheatPayoutInfo.winline[0] = Utils.randomFromTo(1, 3);

        //     this._cheatPayoutInfo.symbol[0] = E_SYMBOL.BLUE_HEART;

        //     this._cheatPayoutInfo.ofKind[0] = 3;

        // } else {
        //     this._cheatPayoutInfo = null;
        // }
        let cheat = {
            reelSize: [5, 5, 5, 5, 5, 5],
            cheatPosition: {
                symbols: [1, 1, 1, 1, 1, 1, 1],
                positions: [0, 4, 5, 8, 14, 15, 21]
            }
        }

        RootData.instance.gamePlayData.cheatData = cheat;
    }

    cheatFreeSpinwildcolumns() {
        // if (Cfg.isDebug) {
        //     this._cheatPayoutInfo.winline[0] = Utils.randomFromTo(1, 3);

        //     this._cheatPayoutInfo.symbol[0] = E_SYMBOL.BLUE_HEART;

        //     this._cheatPayoutInfo.ofKind[0] = 3;

        // } else {
        //     this._cheatPayoutInfo = null;
        // }
        let cheat = {
            freeSpinWildcolumns: true
        }

        RootData.instance.gamePlayData.cheatData = cheat;
    }
    onSetWinLineClick(event, customEventData) {
        if (customEventData == "hundred") {
            let hundredNum = parseInt(this.lblHundred.string);
            hundredNum++;
            if (hundredNum > 1)
                hundredNum = 0;
            this.lblHundred.string = hundredNum.toString();
        } else if (customEventData == "dozen") {
            let dozenNum = parseInt(this.lblDozen.string);
            dozenNum++;
            if (dozenNum > 9)
                dozenNum = 0;
            this.lblDozen.string = dozenNum.toString();
        } else if (customEventData == "unit") {
            let unitNum = parseInt(this.lblUnit.string);
            unitNum++;
            if (unitNum > 9)
                unitNum = 1;
            this.lblUnit.string = unitNum.toString();
        }

        let line_id = parseInt(this.lblHundred.string + this.lblDozen.string + this.lblUnit.string);
        if (line_id >= 0 && line_id <= LINECONFIG.posArr.length) {
            if (!this._cheatPayoutInfo) this._cheatPayoutInfo = new CheatPayoutInfo();
            this._cheatPayoutInfo.winline = line_id;
            RootData.instance.gamePlayData.cheatData = this._cheatPayoutInfo;
        }
    }
    onResetWinLineClick() {
        this.lblUnit.string = "0";
        this.lblDozen.string = "0";
        this.lblHundred.string = "0";
    }
    onSetSymbolClick() {
        let numOfSymbol = parseInt(this.lblSymbol.string);

        numOfSymbol++;
        if (numOfSymbol > E_SYMBOL.SYMBOL_NUM) {
            numOfSymbol = 0;
        }
        this.lblSymbol.string = numOfSymbol.toString();

        if (!this._cheatPayoutInfo) this._cheatPayoutInfo = new CheatPayoutInfo();
        this._cheatPayoutInfo.symbol = numOfSymbol;

        RootData.instance.gamePlayData.cheatData = this._cheatPayoutInfo;
    }
    onSetNumberOfKindClick() {
        let numOfKind = parseInt(this.lblNumOfKind.string);

        numOfKind++;
        if (numOfKind > 5) {
            numOfKind = 3;
        }
        this.lblNumOfKind.string = numOfKind.toString();


        if (!Cfg.isDebug) {
            this._cheatPayoutInfo = null;
            return;
        }
        if (!this._cheatPayoutInfo) this._cheatPayoutInfo = new CheatPayoutInfo();
        this._cheatPayoutInfo.ofKind = numOfKind;
        RootData.instance.gamePlayData.cheatData = this._cheatPayoutInfo;
    }

    cheatPayoutClick() {
        this.cheatPayoutLayout.active = !this.cheatPayoutLayout.active;
        if (this.cheatPayoutLayout.active) {
            if (!this._cheatPayoutInfo) this._cheatPayoutInfo = new CheatPayoutInfo();
            this._cheatPayoutInfo.winline = parseInt(this.lblHundred.string + this.lblDozen.string + this.lblUnit.string);
            this._cheatPayoutInfo.symbol = parseInt(this.lblSymbol.string);
            this._cheatPayoutInfo.ofKind = parseInt(this.lblNumOfKind.string);
            RootData.instance.gamePlayData.cheatData = this._cheatPayoutInfo;
        }
    }
    StartSpinning() {
        this._cheatPayoutInfo = null;
        this.cheatPayoutLayout.active = false;
    }
    //"big-win", "mega-win", "super-mega-win"
    showBigWin(event, customEventData) {
        let dataShow = {
            winTitle: customEventData,
            winAmount: 20000,
        }
        PopupController.instance.showPr(BigWin, dataShow);
    }

    showTotalWin() {
        const totalwin_data = {
            totalWinFreeSpin: 10000,
            packID: 1,
            animationCanBePlayed: true
        };
        PopupController.instance.showPr(FreespinOutro, totalwin_data);
    }

    showIntro() {
        let dataShow = {
            amount: 12,
            mode: 2,
            multiplier:null,
            onShow: () => {
            
            },
            closeCB: () => {

            }
        }
        PopupController.instance.show(WinFreeSpinsPopup, dataShow);
    }

    showIntroInFreeSpin() {
        let dataShow = {
            amount: 12,
            mode: 2,
            multiplier:null,
            onShow: () => {
            
            },
            closeCB: () => {

            }
        }
        PopupController.instance.show(WinFreespinsInFreespinModePopup, dataShow);
    }
}
