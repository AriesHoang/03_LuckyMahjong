import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import SoundController from "../../Manager/SoundController";
import BasePopup from "../../Stageloading/BasePopup";
import { Cfg, GameConfig } from "../../Manager/Config";
import PopupController, { AUTO_DISMISS_POPUP_DELAY } from "../../Manager/PopupController";
import { clientEvent } from "../../Core/observer/clientEvent";
import { EventName } from "../../Manager/EventName";

import { AudioPlay } from "../../Core/audio/AudioPlayer";
import RootData from "../../Manager/RootData";
import Utils from "../../Utils/Utils";
import CurrencyConverter from "../../Common/CurrencyConverter";
import GamePlayData, { E_JACKPOT_TYPE } from "../../Data/GamePlayData";
// import itemJackpotPopup from "./itemJackpotPopup";
import JackpotItem, {E_JACKPOT_SYMBOL_STATE} from "./JackpotItem";
import BoardData from "../../Data/GamePlay/BoardData";
import BigWin from "../BigWin/BigWin";
import FreespinOutro from "../FreespinOutro/FreespinOutro";
import JackpotInfo from "../../Game/JackpotInfo";

const { ccclass, property } = cc._decorator;
const COL_NUM: number = 4;
const ROW_NUM: number = 3;

export enum E_JACKPOT_ACTION {
    IDLE,
    SHOW,
    REQUESTING
}

@ccclass
export default class JackpotPopup extends BasePopup {
    private closeCallback: Function = null;

    // @property([itemJackpotPopup])
    // arrayItem: itemJackpotPopup[] = [];

    @property(cc.Prefab)
    jackpotItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    boardNode: cc.Node = null;

    @property(JackpotInfo)
    jackpotInfo: JackpotInfo = null;

    private _gambleResult: any = null;
    protected playClicked = false;
    private isFading = false;

    private _state: E_JACKPOT_ACTION = E_JACKPOT_ACTION.IDLE;

    public set state(v: E_JACKPOT_ACTION) {
        this._state = v;
    }

    private _symbolsState: E_JACKPOT_TYPE[] = [];
    private _resultArr: number[] = [];
    private _winJackpotID: number = null;
    private _numFlipped: number = 0;
    private _isPlayOutro: Boolean = false;
    private _numJackpotFlipped: number = 0;
    private _bPlayWonSFX: boolean = false;


    rewardJackpot:number = 0;
    idSounds: any[] = [];
    arrRandomJp: any[] = [];
    resolve;
    pickedArray:any[] = [];

    public showPr(data: any): Promise<any> {
        return new Promise((resolve: Function) => {
            this.resolve = resolve;
            cc.log("Jackpot Popup show requested", data);
            if (!data) {
                cc.log("Jackpot data can not be null");
                console.trace();

            };
            this.show(data);
        })

    }

    public show(data: any): void {
        if (!data) {
            cc.log("Jackpot data can not be null");
            console.trace();
        }

        this.isFading = true;

        this.node.opacity = 255;
        super.show();
        // this.tween(true);
        SoundController.inst.MainAudio.pauseMusic();
        this._state = E_JACKPOT_ACTION.SHOW;
        this.pickedArray = [];
        this.jackpotInfo.onBetAmountChanged();

        // this._winJackpotID = data.result.jackpotWinId;
        // this._resultArr = this.makeResultArray(this._winJackpotID);
        let idsound = SoundController.inst.MainAudio.playAudio(AudioPlayId.bgmGamble, true)
        this.idSounds.push(idsound);

        this._gambleResult = data.result;
        this.closeCallback = data.closeCallback;
        let bReconnect = false;

        if(data.result.pickArray && data.result.pickArray.length > 0){
            // this.onReconnectOpendItem(data.result.pickArray)
            // this._resultArr = data.result.pickArray[0];
            this.pickedArray = data.result.pickArray;
            bReconnect = true;
        }


        clientEvent.dispatchEvent(EventName.UpdateJackpot);
        this.initBoard(bReconnect);
    }

    initBoard(isReconnect:boolean = false) {
        // this._numJackpotFlipped = isReconnect ? this._symbolsState.filter(e => e == this._winJackpotID).length : 0;
        // this._numFlipped = isReconnect ? this._symbolsState.filter(e => e > -1).length : 0;

        this.rewardJackpot = 0;

        this._bPlayWonSFX = false;
        let item: JackpotItem;
        for (let i = 0; i < COL_NUM * ROW_NUM; ++i) {
            item = JackpotItem.create(0, this.jackpotItemPrefab);
            item.node.name = i.toString();
            this.boardNode.addChild(item.node);

            let isPickedItem = false;
            if(isReconnect && this.pickedArray.length > 0){
                for(let j = 0; j < this.pickedArray.length; j++){
                    let pickedItem = this.pickedArray[j];
                    if(pickedItem.cell == i){
                        this._symbolsState[i] = pickedItem.type;
                        item.itemID = pickedItem.type;
                        item.playAnimPromise(E_JACKPOT_SYMBOL_STATE.flip, pickedItem.type);
                        isPickedItem = true;
                        break;
                    }
                }
            }

            if(!isPickedItem){
                item.setItemAnim(E_JACKPOT_SYMBOL_STATE.idle);
                this._symbolsState[i] = E_JACKPOT_TYPE.HIDDEN;
                if(item.getComponent(cc.Button).clickEvents.length == 0){
                    let clickEventHandler = new cc.Component.EventHandler();
                    clickEventHandler.target = this.node;
                    clickEventHandler.handler = "onItemJackpotClick";
                    clickEventHandler.component = "JackpotPopup";//This is the code file name
                    clickEventHandler.customEventData = i.toString();
                    item.getComponent(cc.Button).clickEvents.push(clickEventHandler);
                }else{
                    item.getComponent(cc.Button).clickEvents[0].customEventData = i.toString();
                }

            }

        }
        // this.unscheduleAllCallbacks();
        // this.schedule(this.randomIdleAnim, IDLE_ANIM_INTERVAL, cc.macro.REPEAT_FOREVER, IDLE_ANIM_INTERVAL);
        this._state = E_JACKPOT_ACTION.IDLE;
    }

    onItemJackpotClick(event, customEventData){
        cc.log("onItemJackpotClick: " + customEventData);
        let cell = customEventData;
        if (this._state != E_JACKPOT_ACTION.IDLE) {
            return;
        }

        let pars: object = {
            "cell": cell,
        }

        this._state = E_JACKPOT_ACTION.REQUESTING;
        Utils.postHttp(Cfg.gamePickURL, JSON.stringify(pars), (err, response) => {
            if (err || !response) {
                let err_msg = Utils.getErrorMessage(err, Cfg.language);
                clientEvent.dispatchEvent(EventName.Disconnect, { err_msg: err_msg });
            } else {
                cc.log("jackpotGameIdx ", response);
                this._state = E_JACKPOT_ACTION.IDLE;

                let responseData = JSON.parse(response);
                if(responseData.bet?.data.jackpot?.picks){
                    let cellPick = null;
                    if(responseData.bet?.data.jackpot?.reward){ // Last Open Jackpot -> Get Reward
                        cellPick = {
                            "type": responseData.bet?.data.jackpot?.reward.type,
                            "cell": cell
                        }
                        this._winJackpotID = responseData.bet?.data.jackpot?.reward.type;
                        this.rewardJackpot = responseData.bet?.data.jackpot?.reward.winRate * responseData.bet?.data.baseAmount;
                        this._state = E_JACKPOT_ACTION.SHOW;
                    }else{ // Open Jackpot
                        let pickData = responseData.bet?.data.jackpot?.picks;
                        cellPick = pickData[pickData.length - 1];
                    }

                    const pos = parseInt(cellPick.cell);
                    let item: JackpotItem;
                    if (this._symbolsState[pos] == E_JACKPOT_TYPE.HIDDEN) {
                        //flip symbol, get result
                        this._symbolsState[pos] = cellPick.type;
                        const jackpot_type: E_JACKPOT_TYPE = cellPick.type;
                        item = this.boardNode.getChildByName(pos.toString()).getComponent(JackpotItem);
                        item.itemID = cellPick.type;
                        item.playAnimPromise(E_JACKPOT_SYMBOL_STATE.flip, jackpot_type).then(() => {
                            //check for jackpot finish
                            if (this.rewardJackpot > 0) {
                                this.finishJackpot();
                                this._isPlayOutro = true;
                            }
                        });
                    }
                }
            }
        });
    }

    // makeResultArray(winJackpotId): number[]{
    //     let arrJackpot = [E_JACKPOT_TYPE.GRAND, E_JACKPOT_TYPE.MAJOR, E_JACKPOT_TYPE.MINOR, E_JACKPOT_TYPE.MINI];
    //     let arrResult = [];
    //     for(let jackpotId = 3; jackpotId >= RootData.instance.gamePlayData.gameModeResult; jackpotId--){
    //         let numValue = (jackpotId == winJackpotId) ? 3 : 2
    //         for(let i = 0; i < numValue; i++){
    //             arrResult.push(jackpotId)
    //         }
    //     }
    //     cc.log("makeResultArray: " + JSON.stringify(arrResult));
    //     return Utils.shuffleArr(arrResult);
    // }

    finishJackpot() {
        cc.log("finishJackpot");
        this.unscheduleAllCallbacks();
        //highligt all win jackpot
        let promiseArr: Promise<any>[] = [];
        let item: JackpotItem;
        const winID: E_JACKPOT_TYPE = this._winJackpotID;
        if(!this._bPlayWonSFX){
            // SoundController.inst.MainAudio.playAudio(AudioPlayId.SFX_JackpotPick_Won);
            this._bPlayWonSFX = true;
        }
        for (let i = 0; i < COL_NUM * ROW_NUM; ++i) {
            //disable hover anims
            item = this.boardNode.getChildByName(i.toString()).getComponent(JackpotItem);
            item.disableHoverHandler();
            if (this._symbolsState[i] == this._winJackpotID) {
                promiseArr.push(item.playAnimPromise(E_JACKPOT_SYMBOL_STATE.jackpot_highlight, winID));
            }
        }
        Promise.all(promiseArr).then( () => {
            cc.Tween.stopAllByTarget(this.node);
            cc.tween(this.node)
                .delay(2)
                .call( () => {
                    this.closeJackpot();
                })
                .to(1, { opacity: 0 })
                .call(() => {

                    let item:JackpotItem;
                    for (let i = 0; i < COL_NUM * ROW_NUM; ++i) {
                        item = this.boardNode.getChildByName(i.toString()).getComponent(JackpotItem);
                        item.remove();
                    }
                    this.node.active = false;
                })
                .start();
        });
    }

    private tween(toshow: boolean, callback?: Function) {
        let alpha = toshow ? 255 : 0;
        cc.tween(this.node)
            .to(0.5, { opacity: alpha })
            .call(() => {
                callback && callback();
                // SoundController.inst.MainAudio.playAudio(AudioPlayId.BGM_Jackpot);
                this.scheduleOnce(() => {
                    this.isFading = false;
                }, 0.1)
            })
            .start();
    }


    // highlightWinType() {
    //     let win = ['mini', 'major', 'mega', 'grand'];
    //
    //     this.node.on(cc.Node.EventType.TOUCH_END, () => {
    //         this.closeJackpot();
    //     }, this);
    //
    //
    //
    //     cc.Tween.stopAllByTarget(this.node);
    //     this.node.stopAllActions();
    //     cc.tween(this.node)
    //         .delay(8)
    //         .call(() => {
    //             this.closeJackpot();
    //
    //         })
    //         .start();
    // }

    private closeJackpot() {
        this.node.stopAllActions();
        this.unscheduleAllCallbacks();
        cc.Tween.stopAllByTarget(this.node);
        this.node.off(cc.Node.EventType.TOUCH_END);
        // SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxGambleBtnCollect);

        const totalwin_data = {
            totalWinFreeSpin: this.rewardJackpot,
            packID: 1,
            animationCanBePlayed: true,
        };
        PopupController.instance.showPr(FreespinOutro, totalwin_data).then(() => {
            // if(this.boardData.isReconnectFreeSpin){
            //     this.boardData.boardMode = E_BOARD_MODE.FREESPIN;
            //     clientEvent.dispatchEvent(EventName.ShowFreeSpinInfo, this.boardData.spinData.resultFreeSpin);
            //     clientEvent.dispatchEvent(EventName.GameModeChange);
            // }
            this.resolve();
            this.hide();
        });


        // this.requestJackpotEnd().then((gambleData: any) => {
        //
        //     this.resolve();
        //     this.hide();
        // });
    }



    public hide(data?: any): void {
        this.idSounds.forEach(element => {
            SoundController.inst.MainAudio.stopAudioPlay(element)
        });
        this.idSounds = [];
        this.tween(false, () => {
            super.hide();
            this.resetWheel();
            this.node.active = false;
            // SoundController.inst.MainAudio.stopSound(this.idSoundBg);
            this.closeCallback && this.closeCallback();
        });
    }

    // private requestJackpotEnd(): Promise<any> {
    //     return new Promise((resolve: Function) => {
    //         let pickArray = [[]];
    //         pickArray[0]= this._resultArr;//
    //         pickArray[1] = this._symbolsState;
    //         let pars: object = {
    //             "gameCode": Cfg.gameCode,
    //             "groupCode": Cfg.groupCode,
    //             "brandCode": Cfg.brandCode,
    //             "playerToken": Cfg.playerToken,
    //             "betSize": RootData.instance.gamePlayData.getBetSizeValue(),
    //             "betLevel": RootData.instance.gamePlayData.getBetLevelValue(),
    //             "baseBet": RootData.instance.gamePlayData.getbaseBetLevel(),
    //             "gameMode": RootData.instance.gamePlayData.gameModeLevel,
    //             "pickArray": pickArray,
    //             "isCollect": true
    //         }
    //
    //         // cc.log('jackpotGameIdx sent after jackpot')
    //         // cc.log(pars);
    //
    //         Utils.postHttp(Cfg.gameSpinURL, JSON.stringify(pars), (err, response) => {
    //             if (err || !response) {
    //                 let err_msg = Utils.getErrorMessage(err, Cfg.language);
    //                 clientEvent.dispatchEvent(EventName.Disconnect, { err_msg: err_msg });
    //                 // if (err_msg == "wa.exception.playerNotEnoughBalance") {
    //                 //     resolve();
    //                 // }
    //
    //             } else {
    //                 cc.log("requestJackpotEnd ", response);
    //                 // let spinData = JSON.parse(response);
    //                 // // let jackpotPrize = spinData.jackpotPrizeBeforeReset ? spinData.jackpotPrizeBeforeReset : spinData.jackpotPrize;
    //                 // let boardData = RootData.instance.FindComponent(BoardData);
    //                 // boardData.updateSpinHistories(spinData.jackpotPrize);
    //                 // clientEvent.dispatchEvent(EventName.GameModeChange);
    //                 // RootData.instance.FindComponent(BoardData).spinData.updatedBalance = spinData.updatedBalance;
    //                 //
    //                 // if (spinData.winTitle && spinData.winTitle.length > 0) {
    //                 //     this.showSpecialWinPromise(spinData.winTitle, spinData.totalWin).then(() => {
    //                 //         //delay to wait for bigwin to finish fading out
    //                 //         cc.tween({}).delay(0.4).call(() => {
    //                 //             resolve();
    //                 //         }).start();
    //                 //     });
    //                 // } else {
    //                 //     resolve();
    //                 // }
    //                 resolve();
    //             }
    //         });
    //     });
    // }

    // showSpecialWinPromise(winTitle: string, winAmount: number): Promise<any> {
    //     let dataShow = {
    //         winTitle: winTitle,
    //         winAmount: winAmount,
    //     }
    //     return PopupController.instance.showPr(BigWin, dataShow);
    // }

    // private requestJackpotPick(): Promise<any> {
    //     return new Promise((resolve: Function) => {
    //         let pickArray = [[]];
    //         pickArray[0]= this._resultArr;//
    //         pickArray[1] = this._symbolsState;
    //         let pars: object = {
    //             "gameCode": Cfg.gameCode,
    //             "groupCode": Cfg.groupCode,
    //             "brandCode": Cfg.brandCode,
    //             "playerToken": Cfg.playerToken,
    //             "betSize": RootData.instance.gamePlayData.getBetSizeValue(),
    //             "betLevel": RootData.instance.gamePlayData.getBetLevelValue(),
    //             "baseBet": RootData.instance.gamePlayData.getbaseBetLevel(),
    //             "gameMode": RootData.instance.gamePlayData.gameModeLevel,
    //             "pickArray": pickArray,
    //             "isCollect": false
    //         }
    //
    //         // cc.log('jackpotGameIdx sent after jackpot')
    //         // cc.log(pars);
    //
    //         Utils.postHttp(Cfg.gameSpinURL, JSON.stringify(pars), (err, response) => {
    //             if (err || !response) {
    //                 let err_msg = Utils.getErrorMessage(err, Cfg.language);
    //                 clientEvent.dispatchEvent(EventName.Disconnect, { err_msg: err_msg });
    //                 // if (err_msg == "wa.exception.playerNotEnoughBalance") {
    //                 //     resolve();
    //                 // }
    //
    //             } else {
    //                 // cc.log("jackpotGameIdx ", response);
    //                 resolve();
    //             }
    //         });
    //     });
    // }

    checkBalance() {
        let old_balance = RootData.instance.playerData.balance;
        let total_bet = RootData.instance.gamePlayData.getCurBet();
        if (old_balance < total_bet) {
            return false;
        }
        return true;
    }

    resetWheel() {
        this.playClicked = false;
        let item:JackpotItem;
        for (let i = 0; i < COL_NUM * ROW_NUM; ++i) {
            item = this.boardNode.getChildByName(i.toString()).getComponent(JackpotItem);
            item.remove();
        }
    }
}