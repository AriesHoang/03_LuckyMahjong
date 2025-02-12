// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { AudioPlayId } from "../Core/audio/AudioPlayId";
import BoardData from "../Data/GamePlay/BoardData";
import { Cfg } from "../Manager/Config";
import PopupController from "../Manager/PopupController";
import RootData from "../Manager/RootData";
import SoundController from "../Manager/SoundController";
import BigWin from "../Popup/BigWin/BigWin";
import WinFreeSpinsPopup from "../Popup/WinFreeSpinPopup/WinFreeSpinsPopup";
import Utils from "../Utils/Utils";
import BoardUI, { ActionCheckWin, E_BOARD_MODE, E_BOARD_STATE } from "./BoardUI";
import GameController from "./GameController";
import lineUI from "./LineUI";
import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import { E_LAYOUT_MODE } from "./LayoutModeController";
import FreespinOutro from "../Popup/FreespinOutro/FreespinOutro";
import StickyLayer from "./StickyLayer";
import ElectricHeartEffect from "./ElectricHeartEffect ";
import LineWinData, { HeartItemWin } from "../Data/GamePlay/LineWinData";
import MultiplierInfo from "./MultiplierInfo";
import FreespinGamble, { E_WHEEL_ACTION, WEDGE_ANGLE } from "../Popup/FreespinGamble/FreespinGamble";

import BGMainGameAnimState from "./BGMainGameAnimState";
import IntroMiniGame from "../Popup/IntroMiniGame/IntroMiniGame";
import SpinButton from "../Common/SpinButton";
import CharacterAinmationState from "./CharacterAinmationState";
import WinFreespinsInFreespinModePopup from "../Popup/New Folder/WinFreespinsInFreespinModePopup";
import {E_JACKPOT_TYPE} from "../Data/GamePlayData";
import JackpotPopup from "../Popup/Jackpot/JackpotPopup";
import { E_SYMBOL } from "./ItemConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CheckWinFreeSpinUi extends cc.Component {
    boardData: BoardData = null;
    @property(BoardUI) boardUi: BoardUI = null;
    @property(cc.Node) itemLayer: cc.Node = null;
    @property(cc.Node) payLines: cc.Node = null;
    @property(lineUI) lineUi: lineUI = null;

    @property(MultiplierInfo)
    multiplierInfo: MultiplierInfo = null;

    // @property(CharacterAinmationState)
    // bugAinmationState: CharacterAinmationState = null;

    // @property(BGMainGameAnimState)
    // bGMainGameAnimState: BGMainGameAnimState = null;

    private lineWinData: LineWinData;



    protected onEnable(): void {
        GameController.OnInitialized.add(this.OnGameControllerInitialized.bind(this));
    }

    protected onDisable(): void {
        GameController.OnInitialized.remove(this.OnGameControllerInitialized.bind(this));
    }

    protected start(): void {

        this.initialize();

    }

    initialize() {


        let actionCheckMultiply = new ActionCheckWin(2, this.checkMultiplyPromise.bind(this));
        GameController.addActionCheckWin(actionCheckMultiply);

        // let actionWinMiniGame = new ActionCheckWin(3, this.checkWinMiniGamePromise.bind(this));
        // GameController.addActionCheckWin(actionWinMiniGame);



        let actionCheckSpecialWin = new ActionCheckWin(4, this.checkShowSpecialWinPromise.bind(this));
        GameController.addActionCheckWin(actionCheckSpecialWin);

        // let actionCheckJackpot = new ActionCheckWin(5, this.checkJackpotPromise.bind(this));
        // GameController.addActionCheckWin(actionCheckJackpot);

        let actionCheckFreeSpin = new ActionCheckWin(5, this.checkWinFreeSpinsPromise.bind(this));
        GameController.addActionCheckWin(actionCheckFreeSpin);

        let actionCheckFreespinOutro = new ActionCheckWin(6, this.checkShowFreespinOutroPromise.bind(this));
        GameController.addActionCheckWin(actionCheckFreespinOutro);
    }

    OnGameControllerInitialized() {
        this.boardData = RootData.instance.FindComponent(BoardData);
        this.lineWinData = RootData.instance.FindComponent(LineWinData);
    }

    

    async checkWinFreeSpinsPromise(): Promise<any> {
        return new Promise(async (resolve: Function) => {
            // this.boardState = E_BOARD_STATE.SHOW_WIN_FREESPIN;
            
            let isGetFreeSpin: boolean = this.boardData.isGetFreeSpin;
            const spin_data = this.boardData.spinData;
            if (isGetFreeSpin) {
                // this.lineUi.hide();
                if(this.boardUi.boardMode == E_BOARD_MODE.FREESPIN){
                    let dataCurrentRound = spin_data.freeGame.rounds[spin_data.freeGame.rounds.length - 1];

                    let data = {
                        amount: dataCurrentRound.winFreeGames,
                        closeCB:()=>{
                            clientEvent.dispatchEvent(EventName.ShowFreeSpinInfo, this.boardData.freespinNum);
                            Utils.delayTime(1).then(()=>{
                                resolve()
                            })
                        }
                    }
                  
                    this.boardUi.stopItemWinAnim();
                    let scatter_pos_arr = this.boardData.getPosScatter();
                    let prom_chain: Promise<any> = Promise.resolve();

                    // if (scatter_pos_arr?.length > 0 && !this.boardData.isBuyFeature) {
                    //     prom_chain = prom_chain.then(this.showWinScattersPromise.bind(this, scatter_pos_arr));
                    // }
                    prom_chain = prom_chain.then(() => {
                        // clientEvent.dispatchEvent(EventName.ShowFreeSpinInfo, this.boardData.freespinNum);
                        PopupController.instance.show(WinFreespinsInFreespinModePopup,data);
                    })
                   
                }else{
                    clientEvent.dispatchEvent(EventName.InitDefaultMulti, 1);
                    clientEvent.dispatchEvent(EventName.ShowFreeSpinInfo, this.boardData.freespinNum);
                    // this.lineUi.stopAllItemsWinAnim();
                    let data = {
                        spin_data: spin_data,
                        isBuyFeature: this.boardData.isBuyFeature,
                    }
                    this.boardUi.stopItemWinAnim();
                    let scatter_pos_arr = this.boardData.getPosScatter();
                    let prom_chain: Promise<any> = Promise.resolve();

                    
                   
                    if (scatter_pos_arr?.length > 0 && !this.boardData.isBuyFeature) {
                        let totalWinScatter = spin_data.base.scatterWinRate * spin_data.baseAmount;
                        clientEvent.dispatchEvent(EventName.ShowWinInfo, "info_bar_win_01", totalWinScatter, true);
                        prom_chain = prom_chain.then(this.showWinScattersPromise.bind(this, scatter_pos_arr));
                    }
                    prom_chain = prom_chain.then(() => {
                        // this.lineUi.stopAllItemsWinAnim();
                        this.showWinFreespinPopupPromise().then(() => {

                            //update FS num after closing win additional popup
                            // if (this.layoutController.layoutMode == E_LAYOUT_MODE.FREESPIN) {
                            //     this.updateFreespinNum();
                            // }
                            resolve();
                        });
                    })
                }
            } else {
                resolve();
            }
        });
    }

    // async checkJackpotPromise(): Promise<any> {
    //     return new Promise((resolve: Function) => {
    //         const spin_data = this.boardData.spinData;

    //         if(spin_data.jackpot && !spin_data.jackpot?.reward){
    //             // let typeJackpot = E_JACKPOT_TYPE.GRAND;
    //             // let count = {};
    //             // spin_data.coinOrder.forEach(element=>{
    //             //     count[element] = (count[element] || 0) + 1;
    //             // })
    //             // let result = Object.keys(count).filter(key => count[key] === 3).map(Number);
    //             // typeJackpot = result[0] as E_JACKPOT_TYPE;
    //             // cc.log("typeJackpot: " + typeJackpot);
    //             // this.lineUi.hide();
    //             let jackpotPos = this.boardData.getPosJackpotItem();
    //             let jackpotSymbol = this.boardUi.getItemAtPos(jackpotPos);
    //             // jackpotSymbol.changeToJackpotItemPromise().then(()=>{
    //             this.shootHelicopterPromise(jackpotSymbol.node.parent.convertToWorldSpaceAR(jackpotSymbol.node.position)).then(()=>{
    //                 let data = {
    //                     result: {
    //                         // coinOrder: spin_data.coinOrder,
    //                         // multiplierJackpot: spin_data.multiplierJackpot,
    //                         // totalWinJackpot: spin_data.totalWinJackpot,
    //                         // jackpotWinId: typeJackpot,
    //                         pickArray:spin_data.jackpot.picks
    //                     },
    //                     closeCallback: null
    //                 }
    //                 RootData.instance.playerData.setBalance(this.boardData.balanceData.amount);

    //                 PopupController.instance.showPrTrainsitionEffect().then(() => {
    //                     setTimeout(()=>{
    //                         this.showJackpotPopupPromise(data).then(() => {
    //                             resolve();
    //                         })
    //                     }, 100)
    //                 })
    //             })
    //         }else {
    //             resolve();
    //         }
    //     })
    // }

    private showJackpotPopupPromise(data): Promise<any> {
        return new Promise((resolve: Function) => {
            cc.log("inside jackpot promise: " + JSON.stringify(data));
            // cc.tween({}).delay(1).call(() => {
            PopupController.instance.showPr(JackpotPopup, data).then(() => {
                // const totalwin_data = {
                //     totalWinFreeSpin: data.result.totalWinJackpot,
                //     packID: 1,
                //     animationCanBePlayed: true,
                // };
                // PopupController.instance.showPr(FreespinOutro, totalwin_data).then(() => {
                //     // if(this.boardData.isReconnectFreeSpin){
                //     //     this.boardData.boardMode = E_BOARD_MODE.FREESPIN;
                //     //     clientEvent.dispatchEvent(EventName.ShowFreeSpinInfo, this.boardData.spinData.resultFreeSpin);
                //     //     clientEvent.dispatchEvent(EventName.GameModeChange);
                //     // }
                //     resolve();
                // });
                resolve();
            });
            // }).start();
        });
    }

    // async checkWinMiniGamePromise(): Promise<any> {
    //     return new Promise((resolve: Function) => {
    //         // this.boardState = E_BOARD_STATE.SHOW_WIN_FREESPIN;
    //         const spin_data = this.boardData.spinData;
    //         const collectedWheelBonus = spin_data.collectedWheelBonus;
    //         let data = {
    //             spin_data: spin_data,
    //             isBuyFeature: this.boardData.isBuyFeature,
    //         }
    //
    //         if (collectedWheelBonus != undefined) {
    //             if (this.boardData.isReconnectMiniGame) {
    //                 PopupController.instance.showPr(FreespinGamble, data).then(() => {
    //                     resolve();
    //                 });
    //             } else {
    //                 this.boardUi.stopItemWinAnim();
    //                 let scatter_pos_arr = this.boardData.getPosScatter();
    //                 let prom_chain: Promise<any> = Promise.resolve();
    //                 if (scatter_pos_arr?.length > 0 && !this.boardData.isBuyFeature) {
    //                     prom_chain = prom_chain.then(this.showWinScattersPromise.bind(this, scatter_pos_arr));
    //                 }
    //                 prom_chain = prom_chain.then(() => {
    //
    //                     let dataShow = {
    //                         spin_data: spin_data,
    //                         isBuyFeature: this.boardData.isBuyFeature,
    //                         closeCB: () => {
    //                             PopupController.instance.showPr(FreespinGamble, data).then(() => {
    //                                 resolve();
    //                             });
    //                         }
    //                     }
    //                     PopupController.instance.show(IntroMiniGame, dataShow)
    //
    //
    //                 });
    //             }
    //         } else {
    //             resolve();
    //         }
    //
    //
    //
    //
    //     });
    // }


    showWinFreespinPopupPromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            // if (this.layoutController.layoutMode == E_LAYOUT_MODE.FREESPIN) {
            //     //@ts-ignore show short win freespins popup when already in freespin mode

            // } else {
            let mode: E_BOARD_MODE = E_BOARD_MODE.FREESPIN;
            mode = this.boardData.boardMode;
            // let rate = WEDGE_ANGLE[this.boardData.freespinNum].value
            let dataShow = {
                amount: this.boardData.freespinNum,
                mode: mode,
                // multiplier:rate,
                onShow: () => {
                },
                closeCB: () => {                    
                    PopupController.instance.showPrTrainsitionEffect().then(() => {
                        this.boardUi.onAcceptChangeMode();
                        clientEvent.dispatchEvent(EventName.AutoSpinButtonChange, true);
                        clientEvent.dispatchEvent(EventName.AutoSpinButtonChange, false);        
                        resolve();
                    })
                }
            }
            PopupController.instance.show(WinFreeSpinsPopup, dataShow);
        });
    }

    showWinScattersPromise(posList: number[]): Promise<any> {
        return new Promise((resolve: Function) => {
            // this.curState = E_LINE_STATE.SHOW_SCATTER;
            // this.payLines.active = true;
            this.showWinItems(posList);
            cc.tween(this.node)
                .delay(2)
                .call(() => {
                    resolve();
                })
                .start();
        })
    }
    showWinItems(posList: number[]) {
        posList.forEach((pos) => {
            let indexPos = this.boardData.getIndexForPos(pos)
            let item = this.boardUi.getItemAt(indexPos.col,indexPos.row);
            // Utils.changeParent(item.node, this.itemLayer);
            item.showAnimWin();
        });
    }
    StopWinItems(posList: number[]) {
        posList.forEach((pos) => {
            let item = this.boardUi.getItemAtPos(pos);
            Utils.changeParent(item.node, this.itemLayer);
            item.stopAnimWin();
        });
    }

    checkShowSpecialWinPromise(): Promise<any> {
        return new Promise(async (resolve: Function) => {

            const total_bet = RootData.instance.gamePlayData.getCurBet() || 0;//GameController.instance.getCurBet();
            let animationCanBePlayed = this.boardData.spinData.winRate > 0;
            let totalWin = this.boardData.spinData.winRate * this.boardData.spinData.baseAmount;

            let currentWinRate = this.boardData.spinData.winRate;


            if(this.boardData.spinData.freeGame?.rounds.length > 0){
                let dataRound = this.boardData.spinData.freeGame?.rounds[this.boardData.spinData.freeGame?.rounds.length - 1];
                totalWin = dataRound.winRate*this.boardData.spinData.baseAmount;
                currentWinRate = dataRound.winRate;
                let totalWinFreeSpin = (this.boardData.spinData.winRate -  this.boardData.spinData.base.scatterWinRate) * this.boardData.spinData.baseAmount;
                clientEvent.dispatchEvent(EventName.UpdateBonusWin, totalWinFreeSpin);   
            }

            // if(this.boardData.isGetFreeSpin){
            //     this.boardUi.stopItemWinAnim();
            //     let scatter_pos_arr = this.boardData.getPosScatter();

            //     if (scatter_pos_arr?.length > 0 && !this.boardData.isBuyFeature) {
            //         clientEvent.dispatchEvent(EventName.ShowWinInfo, "info_bar_win_01", this.boardData.spinData.additionalSCPay, true);
            //        await this.showWinScattersPromise(scatter_pos_arr);
            //     }
            // }   

            let timeDelay = 1;
            if (!this.boardData.spinData.resultExpanding?.isExpanding) {
                RootData.instance.gamePlayData.setProfitAmount(totalWin)

                if (totalWin > 0 && !this.boardData.isReconnectMiniGame) {
                    // clientEvent.dispatchEvent(EventName.ShowWinInfo, "info_bar_win_02", totalWin, false);
                    // SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxInfobarTotalWin, false);
                    // }
                    timeDelay = 1000;
                } else {
                    // this.infoBarController.hideWinInfo();
                }
            }

            setTimeout(()=>{
                cc.log("currentWinRate: " + currentWinRate);
                let titleWin = Utils.getTitleWin(currentWinRate);
                if (titleWin.length > 0 && animationCanBePlayed) {
                    cc.tween({}).delay(0.5).call(() => {
                        this.showSpecialWinPromise(titleWin, totalWin).then(() => {
                            //delay to wait for bigwin to finish fading out
                            resolve();
                        });

                    }).start();

                } else {
                    resolve();
                }
            }, timeDelay)


        })
    }

    showSpecialWinPromise(winTitle: string, winAmount: number): Promise<any> {
        let dataShow = {
            winTitle: winTitle,
            winAmount: winAmount,
        }
        return PopupController.instance.showPr(BigWin, dataShow);
    }

    checkShowFreespinOutroPromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            const spin_data = this.boardData.spinData;
            //update auto spin settings for next spin
            let isLastFreeSpins = this.boardData.spinData.freeGame?.remains == 0;
            let canShowOutro = isLastFreeSpins && !this.boardData.isGetFreeSpin;
            let winAmount = 0

            if (isLastFreeSpins && !this.boardData.isGetFreeSpin) {
                winAmount = spin_data.winRate* spin_data.baseAmount;
            }
            this.boardUi.boardState = E_BOARD_STATE.SHOW_TOTAL_WIN_FREESPIN;
            if (canShowOutro) {
                // this.layoutController.endFreespin();
                // this.lineUi.stopAllItemsWinAnim();
                const total_bet = RootData.instance.gamePlayData.getCurBet() || 0;
                const animationCanBePlayed = winAmount > total_bet;

                this.showFreespinOutroProm(winAmount,animationCanBePlayed, GameController.curBuyFeatureOptions).then(() => {
                    // this.layoutController.startNormal();
                    GameController.curBuyFeatureOptions = null;
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }

    showFreespinOutroProm(winAmount: number, animationCanBePlayed: boolean, buyFeatureOption: number): Promise<any> {
        const totalwin_data = {
            totalWinFreeSpin: winAmount,
            packID: buyFeatureOption,
            animationCanBePlayed: animationCanBePlayed,
            onShow: () => {
                // this.bugAinmationState.OnChangeModeToNormal()
                // this.bGMainGameAnimState.OnChangeModeToNormal()
                this.boardUi.onAcceptChangeMode();
            }
        };
        return PopupController.instance.showPr(FreespinOutro, totalwin_data);
    }

    // showFreeSpinAnim(): Promise<any> {
    //     return new Promise((resolve: Function) => {
    //
    //         this.payLines.active = true;
    //
    //         let lineHaveHearts = this.lineWinData.ListlineHaveHearts;
    //         for (let index = 0; index < lineHaveHearts.length; index++) {
    //             const listHearts = lineHaveHearts[index] as HeartItemWin[];
    //             for (let index = 0; index < listHearts.length - 1; index++) {
    //                 let itemHeart = listHearts[index];
    //                 let itemHeart2 = listHearts[index + 1];
    //
    //                 let getItem1 = this.boardUi.getItemAtPos(itemHeart.pos);
    //                 let getItem2 = this.boardUi.getItemAtPos(itemHeart2.pos);
    //
    //                 Utils.changeParent(getItem1.node, this.itemLayer);
    //                 Utils.changeParent(getItem2.node, this.itemLayer);
    //
    //                 getItem1.showAnimWinFreeSpin();
    //                 getItem2.showAnimWinFreeSpin();
    //
    //                 this.electricHeartEffect.playAnim(getItem1, getItem2);
    //             }
    //         }
    //         this.scheduleOnce(() => {
    //             this.boardUi.stopItemWinAnim();
    //             this.electricHeartEffect.removeAllChild();
    //             resolve();
    //         }, 2)
    //     })
    // }

    checkMultiplyPromise(): Promise<any> {
        const resultData = this.boardData.spinData;
        let spin_data = resultData.base;

        const baseAmount = resultData.baseAmount;

        if(resultData.freeGame?.rounds.length > 0){
            spin_data = resultData.freeGame.rounds[resultData.freeGame.rounds.length - 1];
        }

        // const total_win = spin_data.winRate * spin_data.baseAmount;
        let total_win = 0;

        spin_data.tumbles.forEach((tumble) => {
            total_win += tumble.winRate * baseAmount;
        });




        let prom_chain: Promise<any> = Promise.resolve();

        return prom_chain;
        
        let multi_pos_list: cc.Vec3[] = [];
        let totalMultiplier = spin_data.baseMultiplier;
        if(spin_data.xMultipliers.length > 0){
            let spinReels = this.boardUi.getBoardReels();
            for (let ci = 0; ci < spinReels.length; ++ci) { 
                this.boardData.itemTypeGrid[ci].forEach((item, index) => {
                    // if (item.symbol == E_SYMBOL.MULTIPLIER) {
                    //     const symbol = this.boardUi.getItemAt(ci, index);
                    //     multi_pos_list.push(symbol.node.parent.convertToWorldSpaceAR(symbol.node.position));
                    // }
                })
            }
            if(multi_pos_list.length > 0){
                const winMulti = spin_data.xMultipliers.reduce((a, b) => a + b, 0);
                totalMultiplier += winMulti;
                prom_chain = prom_chain.then(() => new Promise((resolve: Function) => {                
                    this.multiplierInfo.showMultiplyWinPromise(multi_pos_list, totalMultiplier, total_win).then(() => {
                        // clientEvent.dispatchEvent(EventName.ShowWinInfo, "info_bar_win_02", total_win, false);
                        resolve();
                    });
                }));      
            }
        }

        if(total_win > 0 && totalMultiplier > 1){
            prom_chain = prom_chain.then(()=> new Promise((resolve: Function) => {
                this.multiplierInfo.checkShowMultiplyWinPromise(total_win*totalMultiplier).then(() => {                    
                    resolve();
                });
            }));
        }
    
        return prom_chain;
    }

}
