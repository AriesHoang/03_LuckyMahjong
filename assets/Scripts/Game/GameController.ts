// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import {clientEvent} from "../Core/observer/clientEvent";
import {Signal} from "../Core/observer/Signal";
import BoardData from "../Data/GamePlay/BoardData";
import LineWinData from "../Data/GamePlay/LineWinData";
import {Cfg, GameConfig} from "../Manager/Config";
import {EventName} from "../Manager/EventName";
import PopupController from "../Manager/PopupController";
import RootData from "../Manager/RootData";
import TextController from "../Manager/TextController";
import NetworkNoticePopup from "../Popup/Network/NetworkNoticePopup";
import FreespinGamble, {E_GAMBLE_ACTION} from "../Popup/FreespinGamble/FreespinGamble";
import Utils from "../Utils/Utils";
import {ActionCheckWin, E_BOARD_MODE, E_BOARD_STATE} from "./BoardUI";
import SoundController from "../Manager/SoundController";
import {AudioPlayId} from "../Core/audio/AudioPlayId";
import PlayerData from "../Data/PlayerData";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {
    boardData: BoardData;
    lineWinData: LineWinData;

    @property(cc.Node)
    bundleAdaptor: cc.Node = null;

    public static ListCheckWin: ActionCheckWin[] = [];
    public static OnStartSpin: Signal = new Signal();
    public static OnInitialized: Signal = new Signal();
    public static OnAutoSpinNumChange: Signal = new Signal();
    public static OnFinishSpin: Signal = new Signal();

    boardState = E_BOARD_STATE.IDLE;
    private _autoSpinNum: number = 0;
    private get autoSpinNum(): number { return this._autoSpinNum };
    private set autoSpinNum(value: number) {
        this._autoSpinNum = value;
        GameController.OnAutoSpinNumChange.dispatch(value);
    };

    public static curBuyFeatureOptions: number = null;

    private isAutoSpin: boolean = false;
    protected onEnable(): void {
        clientEvent.on(EventName.BoardInit, this.onBoardInit, this);
        clientEvent.on(EventName.OnSpinButtonPressed, this.onSpinButtonPressed, this);
        clientEvent.on(EventName.BoardChangeState, this.onBoardChangeState, this);
        clientEvent.on(EventName.StartAutoSpinPressed, this.onAutoSpinSelect, this);
        clientEvent.on(EventName.OnAutoSpinButtonPressed, this.onAutoSpinButtonPressed, this);
        clientEvent.on(EventName.OnBuyFeatureButtonPressed, this.OnBuyFeatureButtonPressed, this);
        clientEvent.on(EventName.StartAutoSpin, this.startAutoSpin, this);
    }
    protected onDisable(): void {
        clientEvent.off(EventName.BoardInit, this.onBoardInit, this);
        clientEvent.off(EventName.OnSpinButtonPressed, this.onSpinButtonPressed, this);
        clientEvent.off(EventName.BoardChangeState, this.onBoardChangeState, this);
        clientEvent.off(EventName.StartAutoSpinPressed, this.onAutoSpinSelect, this);
        clientEvent.off(EventName.OnAutoSpinButtonPressed, this.onAutoSpinButtonPressed, this);
        clientEvent.off(EventName.OnBuyFeatureButtonPressed, this.OnBuyFeatureButtonPressed, this);
        clientEvent.off(EventName.StartAutoSpin, this.startAutoSpin, this);
    }

    protected start(): void {

        this.initialize();


        const playerData = RootData.instance.FindComponent(PlayerData);

        if (playerData) {
            if (playerData.authorizeData.lastState) {
                const lastState = playerData.authorizeData.lastState;
            }
        }

        if (this.boardData.isReconnectMiniGame == true) {
            let data = {
                spin_data: this.boardData.spinData,
                isBuyFeature: true,
            }

            this.onDataReconnect(this.boardData.spinData);

        } else {
            setTimeout(() => {
                if (this.isAutoSpin) {
                    this.autoSpin();
                }
            }, 200);
        }
        if(this.boardData.freespinNum > 0 )
            SoundController.inst.MainAudio.playAudio(AudioPlayId.bgmMainFreespin, true) 
          else{
            SoundController.inst.MainAudio.playAudio(AudioPlayId.bgmMain, true);
          
          }  
          SoundController.inst.MainAudio.playSFXAmbience();
    }

    public initialize(): void {
        this.boardData = new BoardData();
        this.lineWinData = new LineWinData();

        RootData.instance.AddEntityData(this.boardData, false);
        RootData.instance.AddEntityData(this.lineWinData, false);
        GameController.OnInitialized.dispatch();

        this.isAutoSpin = this.isAutoSpin || this.boardData.isFreeSpin;

        clientEvent.dispatchEvent(EventName.ShowRuleInfo, this.boardData.isFreeSpin);
    }

    public onBoardInit(data: any) {
        GameController.curBuyFeatureOptions = data.curBuyFeatureOptions;
    }

    async showSpinResult() {
        for (const iterator of GameController.ListCheckWin) {
            await iterator.funcExecute(this.boardData.spinData);
        }
        this.finishSpin()
    }

    public static addActionCheckWin(actionCheckWin: ActionCheckWin) {
        this.ListCheckWin.push(actionCheckWin);
        this.ListCheckWin.sort((a, b) => a.indexOrder - b.indexOrder);
    }

    private async onSpinButtonPressed(isBuyFeature: boolean = false, buyFeatureID: number = null, claimAmount: number = null) {


        const has_enough_balance = await this.checkBalanceForSpin(isBuyFeature, buyFeatureID);
        if (has_enough_balance) {
            if(this.boardData.boardMode == E_BOARD_MODE.NORMAL){
                this.requestSpinning(isBuyFeature, buyFeatureID);
            }else{
                this.requestFreeGame();
            }

            GameController.OnStartSpin.dispatch();
            RootData.instance.gamePlayData.setProfitAmount(0);
        } else {
            PopupController.instance.show(NetworkNoticePopup, {
                err_msg: TextController.getRawText("wa.exception.playerNotEnoughBalance"),
                action: () => {
                    PopupController.instance.hide(NetworkNoticePopup);
                }
            });

            if (this.autoSpinNum > 0) {
                this.autoSpinNum = 0;
                clientEvent.dispatchEvent(EventName.CheckAgainSpinButton)
            }
            clientEvent.dispatchEvent(EventName.PlayerNotEnoughBalance)
        }
    }
    private async OnBuyFeatureButtonPressed() {
        let old_balance = RootData.instance.playerData.balance;
        let total_bet = RootData.instance.gamePlayData.getCurBetNormal() * GameConfig.rateBuyFeature;
        const has_enough_balance = (total_bet <= old_balance);
        if (has_enough_balance) {
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxStartBtn);
            this.requestSpinning(true);
            GameController.OnStartSpin.dispatch();
            RootData.instance.gamePlayData.setProfitAmount(0);
        } else {
            PopupController.instance.show(NetworkNoticePopup, {
                err_msg: TextController.getRawText("wa.exception.playerNotEnoughBalance"),
                action: () => {
                    PopupController.instance.hide(NetworkNoticePopup);
                }
            });
        }
    }

    requestFreeGame(){
        let pars: object = {};
        Utils.postHttp(Cfg.gameSpinURL, JSON.stringify(pars), (err, response) => {
            if (err || !response) {
                let err_msg = Utils.getErrorMessage(err, Cfg.language);
                clientEvent.dispatchEvent(EventName.Disconnect, { err_msg: err_msg });
                return;
            }

            let spinData = JSON.parse(response);
            cc.log("Spinning FreeSpin response: ", spinData);

            this.spin(spinData);
        });

        if (Cfg.isDebug) {
            RootData.instance.gamePlayData.resetCheatData();
        }
    }
    requestSpinning(isBuyFeature: boolean = false, buyFeatureID: number = null) {
        //type: 1 - Base, 2 - Ante, 3 - Buy
        let type = 1;
        if(isBuyFeature){
            type = 3;
        }else if(RootData.instance.gamePlayData.isAnteBet){
            type = 2;
        }

        let pars: object = {
            "baseAmount": RootData.instance.gamePlayData.getCurBetNormal(),
            'type': type
        }

        // let cheatData = RootData.instance.gamePlayData.cheatData;
        // cc.log("cheatData: ", cheatData);
        // if (cheatData != null && cheatData.triggerWinMode) {
        //     pars["reels"] = [14, 17, 14, 17, 14];
        // }else if (cheatData != null && cheatData.triggerJackpot) {
        //     pars["reels"] = [14, 17, 14, 17, 14];
        //     pars["jackpot"] = true;
        // }

        // if (isBuyFeature) {
        //     if (!Utils.isEmpty(buyFeatureID))
        //         pars["buyFreeSpinId"] = RootData.instance.gamePlayData.getBuyFeatureId(buyFeatureID);
        // } else {
        //     //no ante when buy feature and vice versa
        //     pars["isDouble"] = RootData.instance.gamePlayData.isAnteBet;
        // }

        // if (Cfg.isDebug) {
        //     this.generateCheatParams(pars);
        // }
        // if (isBuyFeature) {
        //     this.boardState = E_BOARD_STATE.SPINNING;
        //     clientEvent.dispatchEvent(EventName.BoardChangeState, this.boardState);
        // }

        Utils.postHttp(Cfg.gameBetURL, JSON.stringify(pars), (err, response) => {
            if (err || !response) {
                let err_msg = Utils.getErrorMessage(err, Cfg.language);
                clientEvent.dispatchEvent(EventName.Disconnect, { err_msg: err_msg });
                return;
            }

            let spinData = JSON.parse(response);
            cc.log("Spinning response: ", spinData);
           
            this.spin(spinData);
            // if (isBuyFeature) {
            //     // PopupController.instance.showPr(FreespinGamble, spinData).then(() => {
            //     this.onBuyFeature(spinData);
            //     // });

            // } else {
            //     this.spin(spinData);
            // }
        });

        if (Cfg.isDebug) {
            RootData.instance.gamePlayData.resetCheatData();
        }
    }

    spin(data) {
        //this is one tumble, might contain many cascades (until there is no win/match lines)
        // this.spinData = data;

        // data = {
        //     "bet": {
        //       "id": 230817102578,
        //       "currency": "USD",
        //       "chargedAmount": 1,
        //       "payoutAmount": 0.85,
        //       "data": {
        //         "type": 1,
        //         "base":{
        //             "baseMultiplier": 7,
        //             "reels": [
        //                 [
        //                     3,
        //                     3,
        //                     4,
        //                     4,
        //                     7
        //                 ],
        //                 [
        //                     8,
        //                     1,
        //                     1,
        //                     11,
        //                     2
        //                 ],
        //                 [
        //                     8,
        //                     3,
        //                     3,
        //                     1,
        //                     1
        //                 ],
        //                 [
        //                     9,
        //                     2,
        //                     2,
        //                     1,
        //                     1
        //                 ],
        //                 [
        //                     8,
        //                     8,
        //                     8,
        //                     3,
        //                     3
        //                 ],
        //                 [
        //                     1,
        //                     1,
        //                     3,
        //                     3,
        //                     5
        //                 ]
        //             ],
        //             "xMultipliers": [
        //                 4
        //             ],
        //             "winFreeGames": 0,
        //             "tumbles": [
        //                 {
        //                     "winRows": [
        //                         [
        //                             0,
        //                             1
        //                         ],
        //                         [
        //                             1,
        //                             2
        //                         ],
        //                         [
        //                             1,
        //                             2,
        //                             3,
        //                             4
        //                         ],
        //                         [
        //                             3,
        //                             4
        //                         ],
        //                         [
        //                             3,
        //                             4
        //                         ],
        //                         [
        //                             2,
        //                             3,
        //                             0,
        //                             1
        //                         ]
        //                     ],
        //                     "addedSymbols": [
        //                         [
        //                             8,
        //                             8
        //                         ],
        //                         [
        //                             8,
        //                             3
        //                         ],
        //                         [
        //                             8,
        //                             5,
        //                             5,
        //                             4
        //                         ],
        //                         [
        //                             9,
        //                             2
        //                         ],
        //                         [
        //                             2,
        //                             2
        //                         ],
        //                         [
        //                             8,
        //                             8,
        //                             1,
        //                             1
        //                         ]
        //                     ],
        //                     "winRate": 0.9
        //                 },
        //                 {
        //                     "winRows": [
        //                         [
        //                             0,
        //                             1
        //                         ],
        //                         [
        //                             1,
        //                             2
        //                         ],
        //                         [
        //                             3,
        //                             4
        //                         ],
        //                         [],
        //                         [
        //                             2,
        //                             3,
        //                             4
        //                         ],
        //                         [
        //                             2,
        //                             3
        //                         ]
        //                     ],
        //                     "addedSymbols": [
        //                         [
        //                             2,
        //                             2
        //                         ],
        //                         [
        //                             3,
        //                             5
        //                         ],
        //                         [
        //                             4,
        //                             6
        //                         ],
        //                         [],
        //                         [
        //                             7,
        //                             7,
        //                             4
        //                         ],
        //                         [
        //                             4,
        //                             4
        //                         ]
        //                     ],
        //                     "winRate": 6
        //                 },
        //                 {
        //                     "winRows": [
        //                         [
        //                             0,
        //                             1
        //                         ],
        //                         [
        //                             4
        //                         ],
        //                         [],
        //                         [
        //                             0,
        //                             3,
        //                             4
        //                         ],
        //                         [
        //                             3,
        //                             4
        //                         ],
        //                         []
        //                     ],
        //                     "addedSymbols": [
        //                         [
        //                             1,
        //                             1
        //                         ],
        //                         [
        //                             5
        //                         ],
        //                         [],
        //                         [
        //                             2,
        //                             5,
        //                             5
        //                         ],
        //                         [
        //                             4,
        //                             6
        //                         ],
        //                         []
        //                     ],
        //                     "winRate": 0.45
        //                 },
        //                 {
        //                     "winRows": [
        //                         [
        //                             2,
        //                             3
        //                         ],
        //                         [],
        //                         [
        //                             1,
        //                             2
        //                         ],
        //                         [],
        //                         [
        //                             1,
        //                             2
        //                         ],
        //                         [
        //                             0,
        //                             1
        //                         ]
        //                     ],
        //                     "addedSymbols": [
        //                         [
        //                             1,
        //                             6
        //                         ],
        //                         [],
        //                         [
        //                             6,
        //                             5
        //                         ],
        //                         [],
        //                         [
        //                             6,
        //                             4
        //                         ],
        //                         [
        //                             7,
        //                             7
        //                         ]
        //                     ],
        //                     "winRate": 0.6
        //                 },
        //                 {
        //                     "winRows": [
        //                         [],
        //                         [
        //                             0,
        //                             1
        //                         ],
        //                         [
        //                             0,
        //                             3,
        //                             4
        //                         ],
        //                         [
        //                             0,
        //                             1
        //                         ],
        //                         [],
        //                         [
        //                             4
        //                         ]
        //                     ],
        //                     "addedSymbols": [
        //                         [],
        //                         [
        //                             5,
        //                             2
        //                         ],
        //                         [
        //                             5,
        //                             2,
        //                             2
        //                         ],
        //                         [
        //                             8,
        //                             8
        //                         ],
        //                         [],
        //                         [
        //                             3
        //                         ]
        //                     ],
        //                     "winRate": 0.75
        //                 }
        //             ],
        //             "scatterWinRate": 0
        //         },
        //         "freeGame": null,
        //         "baseAmount": 1,
        //         "winRate": 0.4
        //       },
        //       "createdAt": "2024-12-28T17:41:47.5809233+00:00",
        //       "completedAt": "2024-12-28T17:41:47.5978928+00:00"
        //     },
        //     "balance": {
        //       "amount": 9994,
        //       "currency": {
        //         "symbol": "USD",
        //         "decimalDigits": 2,
        //         "betAmounts": [
        //           0.1,
        //           0.25,
        //           0.5,
        //           0.75,
        //           1,
        //           1.5,
        //           2,
        //           2.5,
        //           3,
        //           5,
        //           10,
        //           12.5,
        //           15,
        //           20,
        //           25,
        //           30,
        //           40,
        //           50,
        //           75,
        //           100
        //         ],
        //         "minAmount": 0.1,
        //         "maxAmount": 1000
        //       }
        //     },
        //     "error": null
        //   }


        this.boardData.onHaveDataSpin(data);
        this.lineWinData.onHaveDataSpin(data.bet.data);
    }
    spinFreeGame(data){

    }

    onBuyFeature(data: any) {
        this.boardData.onBuyFeature(data);
        this.lineWinData.onBuyFeature(data);
    }

    onDataReconnect(data: any) {
        this.boardData.onDataReconnect(data);

    }


    onBoardChangeState(state: E_BOARD_STATE) {
        this.boardState = state;
        if (state == E_BOARD_STATE.FINISH_SPINNING) {
            this.showSpinResult();
        }
    }

    async finishSpin() {
        cc.log("finishSpin: ", this.boardData);

        RootData.instance.playerData.setBalance(this.boardData.balanceData.amount);
        GameController.OnFinishSpin.dispatch();
        let isLastFreeSpins = this.boardData.spinData.freeGame?.remains == 0;
        clientEvent.dispatchEvent(EventName.ShowRuleInfo, (this.boardData.isFreeSpin && !isLastFreeSpins), null, true);

        this.autoSpin();
    }

    async autoSpin() {

        this.isAutoSpin = ((this.boardData.isFreeSpin && this.boardData.freespinNum > 0) || this.autoSpinNum > 0);

        if (this.isAutoSpin) {
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxSpinBtn);
            this.onSpinButtonPressed();

        }
        // this.updateSpinButtonLayout();
        //@ts-ignore
        let isdownautoSpinNum = false;
        if (this.isAutoSpin && !this.boardData.isFreeSpin) {
            //update auto spin settings for next spin
            --this.autoSpinNum;
            isdownautoSpinNum = true;
            // this.autoSpinNum = Math.max(0, this.autoSpinNum);
            if (this.autoSpinNum < 0) {
                this.isAutoSpin = false;
                this.autoSpinNum = 0;
            }
        }
        //------ PLAYER INBOX ----------//

        let data = this.boardData;

        // let playerReward = data.spinData?.playerReward;
        //
        // if (playerReward?.remainingCount > 0 && !this.isAutoSpin) {
        //     clientEvent.dispatchEvent(EventName.AutoSpinButtonChange, true);
        //     this.isAutoSpin = true;
        //     return;
        //     this.autoSpinNum--;
        // }
        // if (playerReward?.remainingCount > 0 && this.boardData.spinData?.isLastFreeSpins && this.isAutoSpin && !isdownautoSpinNum) {
        let isLastFreeSpins = this.boardData.spinData?.freeGame?.remains == 0;
        // if (isLastFreeSpins && this.isAutoSpin && !isdownautoSpinNum) {
        //     clientEvent.dispatchEvent(EventName.AutoSpinButtonChange, true);
        //     isdownautoSpinNum = true;
        //     this.autoSpinNum--;
        // }
        // if(!playerReward?.remainingCount && this.boardData.spinData?.isLastFreeSpins && this.isAutoSpin&& !isdownautoSpinNum ){
        if(isLastFreeSpins && this.isAutoSpin && !isdownautoSpinNum ){
            this.autoSpinNum--;
            // isdownautoSpinNum = true;
        }
        
        if (!this.isAutoSpin) {
            clientEvent.dispatchEvent(EventName.AutoSpinButtonChange, false);
        }
        //------ PLAYER INBOX ----------//
    }

    async checkBalanceForSpin(isBuyFeature: boolean = false, buyFeatureID: number = null, claimAmount: number = null): Promise<boolean> {


        if (Cfg.isDebug) {
            let cheatData = RootData.instance.gamePlayData.cheatData;
            if (cheatData != null && cheatData.freeSpin) {
                return true;
            }
        }

        //check & update balance
        if (!this.boardData.isFreeSpin) {
            let old_balance = RootData.instance.playerData.balance;
            
            let total_bet = isBuyFeature ? (RootData.instance.gamePlayData.getCurBetNormal() * GameConfig.rateBuyFeature) : 
        ((RootData.instance.gamePlayData.isAnteBet ? GameConfig.rateAnte : 1) * RootData.instance.gamePlayData.getCurBetNormal());

            if (old_balance < total_bet) {
                return false;
            }
            RootData.instance.playerData.setBalance(old_balance - total_bet);
        }
        return true;
    }

    generateCheatParams(pars: any) {
        // const cheat_payout_options = this.cheatMenuController.cheatPayoutValues;
        // if (cheat_payout_options != undefined && cheat_payout_options != null) {
        //     if (!pars["cheatPayout"]) pars["cheatPayout"] = {};
        //     pars["cheatPayout"] = cheat_payout_options;
        // }
        //CheatPayout
        let cheatData = RootData.instance.gamePlayData.cheatData;
        cc.log("cheatData: ", cheatData);
        if (cheatData != null && cheatData.cheatPosition) {
            pars["cheatPayout"] = {
                "reelSize": [5, 5, 5, 5, 5, 5],
                "cheatPosition": {
                    "symbols": [5, 5, 5, 5, 5, 5, 5],
                    "positions": [0, 4, 5, 8, 14, 15, 21]
                }
            }
        }
        if (cheatData != null && ((cheatData.winline) ||
            (cheatData.symbol) ||
            (cheatData.ofKind))) {
            pars["cheatPayout"] = {};

            if (!Utils.isEmpty(cheatData.winline)) {
                pars["cheatPayout"]["winlines"] = [cheatData.winline - 1];
            }
            if (cheatData.symbol) {
                pars["cheatPayout"]["symbols"] = [cheatData.symbol];
            }
            if (cheatData.ofKind) {
                pars["cheatPayout"]["ofKinds"] = [cheatData.ofKind];
            }

        }
        if (cheatData != null && cheatData.triggerWinMode) {
            if(this.boardData.isFreeSpin){
                pars["cheatPayout"] = {
                    "triggerWinMode": 4,
                }
            }else
            pars["cheatPayout"] = {
                "triggerWinMode": 4,
                numberOfFS:Utils.randomFromTo(7,12)
            }
        }
        if (cheatData != null && cheatData.freeSpinStickywilds) {
            //Cheat number of wilds //fgType 0 => sticky, 1 is wild columns
            pars["cheatPayout"] = {
                "scatters": 4,
                "fgType": 0 // 0->9
            }

            // //Cheat number of wilds
            // pars["cheatPayout"] = {
            //     "wilds": 5
            // }
        }
        if (cheatData != null && cheatData.freeSpinWildcolumns) {
            //Cheat number of wilds
            pars["cheatPayout"] = {
                "scatters": 3,
                "fgType": 1 // 0->9
            }
            // //cheat wild columns
            // pars["cheatPayout"] = {
            //     "wildColumns": [1,1,1,1,1], //index map with columns, if value of index = 1 => that columns will be wild stack
            // }
        }

        if (cheatData != null && cheatData.cheatPayoutUsed) {
            pars["cheatPayout"] = {};
            pars["cheatPayout"]["cheatPosition"] = cheatData.cheatSymbolPosition;
        }
    }

    onAutoSpinSelect(num: number) {
        this.autoSpinNum = num;
        this.autoSpin();
    }

    onAutoSpinButtonPressed() {
        Utils.consoleLog("End auto spin");
        this.isAutoSpin = false;
        this.autoSpinNum = 0;
    }

    //------ PLAYER INBOX ----------//
    startAutoSpin(num: number) {
        this.autoSpinNum = num;
        this.autoSpin();
    }
    //------ PLAYER INBOX ----------//
}
