// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import BoardData from "../Data/GamePlay/BoardData";
import RootData from "../Manager/RootData";
import BoardUI, { ActionCheckWin } from "./BoardUI";
import GameController from "./GameController";
import { E_SYMBOL, ITEMGREEN, ITEMPURPLE, ITEMRED } from "./ItemConfig";
import ItemSymbol, { E_ANIM_STATE } from "./ItemSymbol";
import CharacterAinmationState from "./CharacterAinmationState";
import MultiplierInfo from "./MultiplierInfo";
import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import SoundController from "../Manager/SoundController";
import { AudioPlayId } from "../Core/audio/AudioPlayId";
import { Cfg } from "../Manager/Config";
import Utils from "../Utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CheckWinTumble extends cc.Component {

    @property(BoardUI)
    boardUI: BoardUI = null;
    _multiplierRed: number = 1;
    _multiplierGreen: number = 1;
    _multiplierPurple: number = 1;

    private curSpinProfit: number = 0;
    prom_arr:Promise<any>[] = [];
    // private bonus_win: number = 0;

    // @property(CharacterAinmationState)
    // characterAinmationState: CharacterAinmationState = null;
    @property(MultiplierInfo)
    multiplierInfo: MultiplierInfo = null;



    boardData: BoardData = null;
    reelsData: any = null;

    rowWinLine = [[],[],[],[],[]]

    protected onEnable(): void {
        GameController.OnInitialized.add(this.OnGameControllerInitialized.bind(this));

    }

    protected onDisable(): void {
        GameController.OnInitialized.remove(this.OnGameControllerInitialized.bind(this));
    }

    OnGameControllerInitialized() {
        this.boardData = RootData.instance.FindComponent(BoardData);
    }

    protected start(): void {

        this.initialize();

    }

    initialize() {
        let actionCheckStickSymbols = new ActionCheckWin(1, this.checkTumbleInLoopPromise.bind(this));
        GameController.addActionCheckWin(actionCheckStickSymbols);
    }


    async checkTumbleInLoopPromise(): Promise<any> {
        // if(this.boardData.isBuyFeature) return;
        let spinData = this.boardData.spinData;
        this.curSpinProfit = 0;
        // this.bonus_win = 0;

        let totalWinFreeSpin = spinData.totalWinFreeSpin;
        let tumbleData = spinData.base.tumbles;
        this.reelsData = spinData.base.reels;
        
        if(spinData.freeGame?.rounds.length > 0){
            tumbleData = spinData.freeGame.rounds[spinData.freeGame.rounds.length - 1].tumbles;
            totalWinFreeSpin = (spinData.winRate - spinData.base.scatterWinRate) * spinData.baseAmount;
            this.reelsData = spinData.freeGame.rounds[spinData.freeGame.rounds.length - 1].reels;
        }

        const tumble_num = tumbleData.length;
        
        let totalWin = spinData.winRate * spinData.baseAmount;
        let totalWinTumble = 0;
        for (let i = 0; i < tumble_num; ++i) {
            const tumble_data = tumbleData[i];
            // const cascade_data = tumbleData[i + 1];
            let isLastTumble = (i == tumble_num - 1);
            let win_tumble = tumble_data.winRate * spinData.baseAmount;
            totalWinTumble += win_tumble;            
            await this.checkTumbleWinPromise(tumble_data, i, win_tumble)
            await this.checkTumbleCascadePromise(tumble_data, i, isLastTumble, totalWinTumble, totalWinFreeSpin);
        }
    }

    checkTumbleWinPromise(data: any, tumbleID: number,total_win2): Promise<any> {
        // this.boardUi.boardState = E_BOARD_STATE.TUMBLE_WIN;
        // this.parseSpinResult(data.matrix);

        //fade in win layer
        let prom_arr: Promise<any>[] = [];
        this.prom_arr = [];
        //show symbol win anim
        // this.bonus_win += data.totalWin;

        let win_pos_set: Set<number> = new Set();
     
        data.winLines.forEach((lineData) => {
            lineData.ways.forEach((row, colIndex) => {
                row.forEach((rowIndex) => {
                    if (!Utils.isEmpty(rowIndex)) {                        
                        win_pos_set.add(rowIndex + colIndex * this.reelsData[colIndex].length);
                    }
                });
            });
        });
        cc.log("win_pos_set: ",win_pos_set);
        // if (win_pos_set.size > 0) {
            // prom_arr.push(this.showWinLayerPromise());
            clientEvent.dispatchEvent(EventName.ShowWinInfo, "info_bar_win_01", total_win2, true);
        // }
        

        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfx_TumbleEffect);
        this.rowWinLine = [[],[],[],[],[]];
        data.winLines.forEach((lineData) => {
            
            lineData.ways.forEach((row, colIndex) => {
                row.forEach((rowIndex) => {
                    if (!Utils.isEmpty(rowIndex)) {            
                        const symbol = this.boardUI.getItemAt(colIndex, rowIndex);    
                        if (symbol.itemCfg.symbol < 0 ){
                            this.boardData.itemTypeGrid[colIndex][rowIndex] = {
                                symbol: E_SYMBOL.WILD,
                                value: 0,
                                type: 0,
                                size: 1
                            };
                        }else{
                            this.boardData.itemTypeGrid[colIndex][rowIndex] = {
                                symbol: null,
                                value: null,
                                type: null,
                                size: null
                            };
                            this.rowWinLine[colIndex].push(rowIndex)
                        }
                        
                        const prom_chain: Promise<any> = Promise.resolve()
                            .then(() => {
                                
                            })
                            .then(symbol.playItemAnimPromise.bind(symbol, E_ANIM_STATE.win, {x: colIndex, y: rowIndex}));
                        prom_arr.push(prom_chain);
                    }
                });
            });
        });     

        return Promise.all(prom_arr)
            .then(() => {
                clientEvent.dispatchEvent(EventName.OnWinTumble);

                //remove win symbols from reel & board
                let clear_prom_arr: Promise<any>[] = [];
                let spinReels = this.boardUI.getBoardReels();

                for (let ci = 0; ci < spinReels.length; ++ci) {
                    //calculate nullified positions
                    let clear_pos_list: number[] = [];
                    this.boardData.itemTypeGrid[ci].forEach((value, index) => {
                        if (value.symbol == null) {
                            clear_pos_list.push(index);
                        }
                    })
                    let reel = spinReels[ci];
                    clear_prom_arr.push(reel.clearItemsPromise(clear_pos_list));
                }
               
                return Promise.all(clear_prom_arr);
            });
    }

    getIsIdColor(id: number, mul: number[]): number {
        if (ITEMRED[id] && mul[1]) return 1;
        if (ITEMPURPLE[id] && mul[0]) return 0;
        if (ITEMGREEN[id] && mul[2]) return 2;

        return -1;
    }


    checkTumbleCascadePromise(data, tumbleID: number, isLastTumble, totalWin, totalWinFreeSpin): Promise<any> {
        return new Promise((resolve:Function, reject) => {
            let dataTumble = {
                winRows: this.rowWinLine,
                addedSymbols: data.addedSymbols
            }
            cc.log("checkTumbleCascadePromise: ",dataTumble);
            this.boardData.nextTumpleProcess(dataTumble);

            let spinReels = this.boardUI.getBoardReels();
            for (let ci = 0; ci < spinReels.length; ++ci) {
                let reel = spinReels[ci];
                this.prom_arr.push(reel.cascadeItemsPromise(this.boardData.itemTypeGrid[ci]));
            }
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfx_Cascade);
            
            Promise.all(this.prom_arr).then( async ()=>{
                RootData.instance.gamePlayData.setProfitAmount((this.curSpinProfit));
                // await this.multiplierInfo.checkDefaut();
                if (isLastTumble && totalWin > 0) {
                    let animationCanBePlayed = this.boardData.spinData.winRate > 0;
                    clientEvent.dispatchEvent(EventName.ShowWinInfo, "info_bar_win_02", totalWin, animationCanBePlayed);                           
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                }else{
                    resolve();
                }
            });
        });
    
        
    }

    checkTumbleChange() {

    }

}
