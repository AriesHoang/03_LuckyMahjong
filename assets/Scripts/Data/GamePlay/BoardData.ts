import PopupController from "../../Manager/PopupController";
const defaultSize = [3, 3, 3, 4, 3, 3];
export enum E_BOARD_STATE {
    IDLE = 0,
    IDLE_SHOW_SYMBOL_INFO,
    SPINNING,
    FINISH_SPINNING,
    SHOW_WINS,
    SHOW_COIN_COLLECT,
    SHOW_JACKPOT,
    // CHECK_EXPANSION,
    SHOW_SPECIAL_WIN,
    SHOW_WIN_FREESPIN,
    SHOW_TOTAL_WIN_FREESPIN
};


import { clientEvent } from "../../Core/observer/clientEvent";
import { Signal } from "../../Core/observer/Signal";
import { E_BOARD_MODE } from "../../Game/BoardUI";
import GameController from "../../Game/GameController";
import { E_SYMBOL, ItemConfig } from "../../Game/ItemConfig";
import { ILifecycleData } from "../../Interface/ILifecycleData";
import { Cfg } from "../../Manager/Config";
import { EventName } from "../../Manager/EventName";
import RootData from "../../Manager/RootData";
import PlayerData from "../PlayerData";
import GameData from "./GameData";
import SpinReelNormal from "../../Game/SpinReelNormal";
import Utils from "../../Utils/Utils";


export default class BoardData extends GameData {
    public itemTypeGrid: ItemConfig[][] = [];
    public reelsize: number[];
    _multiplierRed:number = 0;
    _multiplierGreen:number = 0;
    _multiplierPurple:number = 0;
    public set multiplierRed(value:number){
        this._multiplierRed = value;
        clientEvent.dispatchEvent(EventName.MultiplierRed,value,0);
    }
    public set multiplierGreen(value:number){
        this._multiplierGreen = value;
        clientEvent.dispatchEvent(EventName.MultiplierGreen,value,0);
    }
    public set multiplierPurple(value:number){
        this._multiplierPurple = value;
        clientEvent.dispatchEvent(EventName.MultiplierPurple,value,0);
    }
    public spinData;
    public balanceData;
    public isFreeSpin: boolean = false;
    isGetFreeSpin: boolean = false;
    public freespinNum: number = -1;
    public hasSpinData: boolean = false;
    isReconnectFreeSpin: boolean = false;
    isReconnectMiniGame: boolean = false;
    isLastFreeSpins: boolean = false;
    isBuyFeature: boolean = false;
    public multiplierValue: number[] = [];
    public indexMultiplier: number = 0;




    currentReelData: number[][] = [];

    public get reelNum() {
        return this._reelNum;
    }
    public get rowNum() {
        return this._rowNum;
    }
    private _reelNum: number = Cfg.slotSize.x;  //number of reels in board
    private _rowNum: number = Cfg.slotSize.y;   //number of row in 1 reel

    private _boardMode: E_BOARD_MODE = E_BOARD_MODE.NORMAL;
    public get boardMode(): E_BOARD_MODE {
        return this._boardMode;
    }
    public set boardMode(v: E_BOARD_MODE) {
        let need_dispatch_event: boolean = false;
        if (v != this._boardMode) {
            need_dispatch_event = true;
        }
        this._boardMode = v;
        if (need_dispatch_event) {
            this.OnBoardModeChanged.dispatch(
                {
                    mode: this._boardMode,
                    reelNum: this._reelNum,
                    rowNum: this._rowNum
                }
            );
        }
    }


    Deactivate(): void {
        GameController.OnStartSpin.remove(this.onStartSpin.bind(this));
        super.Deactivate();
    }

    initBoard() {
        clientEvent.dispatchEvent(EventName.EnableUserNetBalance);
        clientEvent.dispatchEvent(EventName.UpdateUserNetBalance,0,0);


        const playerData = RootData.instance.FindComponent(PlayerData);
        cc.log("initBoard playerData: ", playerData)
        let board_mode: E_BOARD_MODE = E_BOARD_MODE.NORMAL;
        this.freespinNum = -1;
        let totalWinFreeGame = 0;
        let currentMultiplier = 1;
        if (playerData) {
            this.balanceData = playerData.authorizeData.balance;

            if (playerData.authorizeData.bet) {

                const lastState = playerData.authorizeData.bet.data;

                this.freespinNum = lastState.freeGame ? lastState.freeGame?.remains : 0;

                if (this.freespinNum > 0){
                    this.isReconnectFreeSpin = true;
                    this.isFreeSpin = true;
                }

                let reelMatrix = lastState.base.reels;
                if (lastState && lastState.jackpot && !lastState.jackpot?.reward) {
                    this.isReconnectMiniGame = true;
                    board_mode = E_BOARD_MODE.NORMAL;
                }else{
                    this.isLastFreeSpins = lastState.freeGame?.remains == 0;
                    if (this.freespinNum > 0) {
                        board_mode = E_BOARD_MODE.FREESPIN;
                        this.isFreeSpin = true;

                        

                        
                        if(lastState.freeGame.rounds.length > 0){
                            let lastRound = lastState.freeGame.rounds[lastState.freeGame.rounds.length - 1];
                            currentMultiplier = lastRound.baseMultiplier;
                            reelMatrix = lastRound.reels;
                            if(lastState.winRate > 0){
                                totalWinFreeGame = (lastState.winRate - lastState.base.scatterWinRate) * lastState.baseAmount;
                            }
                            if(lastRound.xMultipliers?.length > 0){
                                const winMulti = lastRound.xMultipliers.reduce((a, b) => a + b, 0);
                                currentMultiplier += winMulti;
                            }
                        }

                    }
                }

                if (reelMatrix) {
                    let dataResult = this.processSymbolResult(reelMatrix);
                    this.parseSpinResult(dataResult.reels, dataResult.reelSize);
                }
                else {
                    let dataDefaultMatrix = this.genDefaultMatrix();
                    this.parseSpinResult(dataDefaultMatrix.reels, dataDefaultMatrix.reelSize);
                }

                this.spinData = lastState;
                // }
            } else {
                // this.parseSpinResult(RootData.instance.gamePlayData.configData.config.defaultMatrix, RootData.instance.gamePlayData.configData.config.defaultReelSize);
                let dataDefaultMatrix = this.genDefaultMatrix();
                this.parseSpinResult(dataDefaultMatrix.reels, dataDefaultMatrix.reelSize);
            }
        } else {
            // this.parseSpinResult(RootData.instance.gamePlayData.configData.config.defaultMatrix, RootData.instance.gamePlayData.configData.config.defaultReelSize);
            let dataDefaultMatrix = this.genDefaultMatrix();
            this.parseSpinResult(dataDefaultMatrix.reels, dataDefaultMatrix.reelSize);
        }

        clientEvent.dispatchEvent(EventName.BoardInit, {
            boardMode: board_mode,
            curBuyFeatureOptions: null
        });
        this._boardMode = board_mode;
        clientEvent.dispatchEvent(EventName.ShowFreeSpinInfo, this.freespinNum);

        if (totalWinFreeGame > 0 || currentMultiplier > 0) {
            cc.tween(this)
                .delay(.1)
                .call(() => {
                    clientEvent.dispatchEvent(EventName.InitDefaultMulti, currentMultiplier);
                    clientEvent.dispatchEvent(EventName.UpdateBonusWin, totalWinFreeGame, false);
                })
                .start();
        }
    }

    public genDefaultMatrix(){
        let arrMatrix = [];
    
        for(let i = 0; i < Cfg.slotSize.x; i++){
            let arrInReel = [];
            for(let j = 0; j < Cfg.slotSize.y; j++){
                let itemId = Utils.randomArr(Cfg.items)
                if((i == 0 || i == Cfg.slotSize.x - 1) && j > 2){}
                // if((i == 0 || i == Cfg.slotSize.x - 1) && (j == 0 || j == Cfg.slotSize.y - 1)){
                //     itemId = E_SYMBOL.EMPTY;
                // }
                else
                arrInReel.push(itemId)
            }
            arrMatrix.push(arrInReel);
        }

        let dataResult = this.processSymbolResult(arrMatrix, false);
        cc.log("genDefaultMatrix: ", dataResult);
        return dataResult;
    }

    processSymbolResult(symbolArray: number[][], bAddEmptySymbol: boolean = true): any {
        // if(bAddEmptySymbol){
        //     symbolArray.forEach((reel, index)=>{
        //         if(index == 0 || index == symbolArray.length - 1){
        //             reel.unshift(E_SYMBOL.EMPTY);
        //             reel.push(E_SYMBOL.EMPTY);
        //         }
        //     })
        // }
        this.currentReelData = Utils.cloneObject(symbolArray);
        cc.log("processSymbolResult: ",symbolArray);
        
        let arrReelSize = [];
        let arrReels = [];
        symbolArray.forEach((reel, index)=>{
            arrReelSize.push(reel.length)
                reel.forEach((symbolId)=>{
                    const itemCfg: ItemConfig = {
                        symbol: symbolId,
                        value: 0,
                        type: 0,
                        size: 1,
                    }
                    arrReels.push(itemCfg);
                })
        })

        return {
            "reels" : arrReels,
            "reelSize": arrReelSize
        };
    }

    Initialize(): void {
        super.Initialize();
        GameController.OnStartSpin.add(this.onStartSpin.bind(this));
        this.initBoard();
    };

    nextTumpleProcess(next_tumble_data){
        // this.onHaveMutilier(next_tumble_data.pumpkinMul)

        this.currentReelData = this.processTumbleReels(this.currentReelData, 
            next_tumble_data.winRows, 
            next_tumble_data.addedSymbols
        )

        cc.log("nextTumpleProcess: ",this.currentReelData);
        let dataResult = this.processSymbolResult(this.currentReelData);
        this.parseSpinResult(dataResult.reels, dataResult.reelSize);
    }

    processTumbleReels(
        reels: number[][], 
        winRows: number[][], 
        addedSymbols: number[][]
      ): number[][] {
        return reels.map((reel, reelIndex) => {
          const indicesToRemove = winRows[reelIndex];
          const symbolsToAdd = addedSymbols[reelIndex]?.slice().reverse() || [];

          // Xóa các phần tử theo chỉ số
          const filteredReel = indicesToRemove && indicesToRemove.length > 0
            ? reel.filter((_, i) => !indicesToRemove.includes(i))
            : reel;
      
          // Thêm các phần tử vào đầu mảng
          return [...symbolsToAdd, ...filteredReel];
        });
      }


    onHaveMutilier(pumpkinMul){
        this.multiplierRed = pumpkinMul[1];
        this.multiplierPurple = pumpkinMul[0];
        this.multiplierGreen = pumpkinMul[2];
    }

    parseSpinResult(resultMatrix, reelsize: number[]) {  
        cc.log("parseSpinResult: ",resultMatrix, reelsize);      
        this.itemTypeGrid = [];
        this.reelsize = reelsize;
        let totalMergedrowNum = 0;
        for (let ci = 0; ci < this._reelNum; ++ci) {
            let _rowNum = reelsize[ci];
            this.itemTypeGrid[ci] = [];

            for (let ri = 0; ri < _rowNum; ++ri) {
                this.itemTypeGrid[ci].push(resultMatrix[totalMergedrowNum + ri]);
            }
            totalMergedrowNum += _rowNum;
        }
    }
    getIndexForPos(pos) {
        let col = 0;
        let row = 0;
        for (let index = 0; index < this.reelsize.length; index++) {
            const element = this.reelsize[index];
            if (pos >= element) {
                pos-=element;
            }else
            {
                col = index;
                row = pos ;
                return { col: col, row: row }
            }
         
        }
        return { col: col, row: row }
    }

    onHaveDataSpin(data) {
        this.isReconnectFreeSpin = false;
        this.isReconnectMiniGame = false;
        this.spinData = data.bet.data;
        this.balanceData = data.balance;
        this.hasSpinData = true;
        this.isBuyFeature = false;
        this.multiplierValue = [];
        this.indexMultiplier = 0;
        
      

        //this is one tumble, might contain many cascades (until there is no win/match lines)

        this.isGetFreeSpin = this.spinData.freeGame && this.spinData.freeGame.rounds.length == 0;
        

        this.isLastFreeSpins = this.spinData.freeGame?.remains == 0;


        this.isFreeSpin = (this.spinData.freeGame?.remains >= 0);
        this.freespinNum = this.spinData.freeGame?.remains;

        if (this.isFreeSpin && !this.isGetFreeSpin) {
            clientEvent.dispatchEvent(EventName.ShowFreeSpinInfo, this.freespinNum);
        }
        // }
        if (this.spinData.reelSize) {
            let size = this.getBoardSize(this.spinData.reelSize);
            this.onBoardSizeChange(size);
        }

        let isChangeNormal = false;


        if (this.isLastFreeSpins) {
            if (this.boardMode == E_BOARD_MODE.FREESPIN || this.boardMode == E_BOARD_MODE.FullReelWild) {
                this.boardMode = E_BOARD_MODE.NORMAL;
                isChangeNormal = true;
            }
        }


        let dataReel = null;
        

        if(this.isGetFreeSpin){
            this.boardMode = E_BOARD_MODE.FREESPIN;
        }

        if (this.isFreeSpin && this.spinData.freeGame.rounds.length > 0) {
            let dataCurrentRound = this.spinData.freeGame.rounds[this.spinData.freeGame.rounds.length - 1];
            this.multiplierValue = dataCurrentRound.xMultipliers;
            dataReel = this.processSymbolResult(dataCurrentRound.reels);
            if(!this.isGetFreeSpin)
                this.isGetFreeSpin = dataCurrentRound.winFreeGames;
        }else{
            if(this.spinData.base.xMultipliers){
                this.multiplierValue = this.spinData.base.xMultipliers;
            }
            dataReel = this.processSymbolResult(this.spinData.base.reels)
        }

        

        cc.log("dataReel: ",dataReel);
        this.parseSpinResult(dataReel.reels, dataReel.reelSize);

        let size = this.getBoardSize(dataReel.reelSize);
        this.onBoardSizeChange(size);

        // manually calculate first reel that wait for scatter
        let num_scatter_in_first_matrix: number = 0;
        let first_column_wait_for_scatter_id: number = -1;
        this.itemTypeGrid.some((result, index) => {
            let num_scatter_in_column = result.reduce((count, val) => {
                return count + ((val.symbol == E_SYMBOL.SCATTER) ? 1 : 0);
            }, 0);
            num_scatter_in_first_matrix += num_scatter_in_column;
            if (num_scatter_in_first_matrix >= 2 && index < this.itemTypeGrid.length - 1) {
                first_column_wait_for_scatter_id = index + 1;
                return true;
            }
        });


        let spinResultInfo = new SpinResultInfo();
        spinResultInfo.itemTypeGrid = this.itemTypeGrid;
        spinResultInfo.first_column_wait_for_scatter_id = first_column_wait_for_scatter_id;
        spinResultInfo.num_scatter_in_first_matrix = num_scatter_in_first_matrix;
        spinResultInfo.freespinNum = this.freespinNum;


        this.OnHaveSpinResultInfo.dispatch(spinResultInfo);


        if (this.isLastFreeSpins) {
            if (isChangeNormal) {
                this._reelNum = Cfg.slotSize.x;
                this._rowNum = Cfg.slotSize.y;
            }
        }
    }

    onBuyFeature(data: any) {
        this.isBuyFeature = true;
        this.spinData = data;
        this.hasSpinData = true;
        //
        // //this is one tumble, might contain many cascades (until there is no win/match lines)
        this.isFreeSpin = (this.spinData.freeSpins > 0 || this.spinData.isLastFreeSpins);
        this.isGetFreeSpin = this.spinData.resultFreeSpin;
        // // if (this.isFreeSpin && !this.isGetFreeSpin) {
        this.freespinNum = this.spinData.freeSpins;
        if (this.isFreeSpin) {
            clientEvent.dispatchEvent(EventName.ShowFreeSpinInfo, this.freespinNum);
        }
        // // }
        if (this.isGetFreeSpin) {
            this.boardMode = E_BOARD_MODE.FREESPIN;
        }
        // // let reels = data.result[0].reels;
        // // let reelSize = data.result[0].reelSize;
        // // if (reels)
        // //     this.parseSpinResult(reels, reelSize);
        //
        let spinResultInfo = new SpinResultInfo();
        spinResultInfo.itemTypeGrid = this.itemTypeGrid;
        spinResultInfo.freespinNum = this.freespinNum;
        //
        this.OnHaveBuyFeatureResultInfo.dispatch(spinResultInfo);


    }

    onDataReconnect(data: any) {
        // this.isBuyFeature = true;
        this.hasSpinData = true;

        //this is one tumble, might contain many cascades (until there is no win/match lines)
        // this.isFreeSpin = data.freeGame;
        // this.isGetFreeSpin = this.spinData.resultFreeSpin;
        //
        // this.freespinNum = this.spinData.resultFreeSpin;
        if (this.isFreeSpin) {
            clientEvent.dispatchEvent(EventName.ShowFreeSpinInfo, this.freespinNum);
            this.boardMode = E_BOARD_MODE.FREESPIN;
        }

        // if (this.isGetFreeSpin) {
        //     if (this.spinData.resultWheelBonus.reward == 0)
        //         this.boardMode = E_BOARD_MODE.FREESPIN;
        //     else if (this.spinData.resultWheelBonus.reward == 1) {
        //         this.boardMode = E_BOARD_MODE.FullReelWild;
        //     }
        // }
        // let reels = data.result[0].reels;
        // let reelSize = data.result[0].reelSize;
        if (data.base.reels){
            this.multiplierValue = data.base.xMultipliers;
            let dataResult = this.processSymbolResult(data.base.reels);
            this.parseSpinResult(dataResult.reels, dataResult.reelSize);
        }


        let spinResultInfo = new SpinResultInfo();
        spinResultInfo.itemTypeGrid = this.itemTypeGrid;
        spinResultInfo.freespinNum = this.freespinNum;

        this.OnHaveBuyFeatureResultInfo.dispatch(spinResultInfo);


    }

    onBoardSizeChange(data: any) {
        if (this._reelNum == data.reelNum && this._rowNum == data.rowNum) return;
        this._reelNum = data.reelNum;
        this._rowNum = data.rowNum;
        //change data at next onHaveDataSpin
        clientEvent.dispatchEvent(EventName.OnBoardSizeChanged, data);
    }

    getPosScatter() {
        let scatter_pos_arr: number[] = [];
        let totalMergedrowNum = 0;
        for (let ci = 0; ci < this._reelNum; ++ci) {
            let ClassifyItems = this.itemTypeGrid[ci];
            let index = 0;
            for (let ri = 0; ri < ClassifyItems.length; ++ri) {

                if (ClassifyItems[ri].symbol == Cfg.scatterItemID) {
                    scatter_pos_arr.push(totalMergedrowNum + ri);
                }
               
            }
            totalMergedrowNum += ClassifyItems.length;
        }
        return scatter_pos_arr;
    }

    getPosJackpotItem(){
        for (let ci = 1; ci < this._reelNum; ++ci) {
            for (let ri = 0; ri < this.itemTypeGrid[ci].length - 1; ++ri) {
                if (this.itemTypeGrid[ci][ri].symbol == Cfg.wildItemID) {
                    return (ci * this._rowNum + ri);
                }
            }
        }
    }

    onStartSpin() {
        this.hasSpinData = false;

        //spin num
        if (this.isFreeSpin && this.freespinNum > 0) {
            --this.freespinNum;
        }
    }

    getBoardSize(reelSize) {
        let _reelNum = reelSize.length;
        let _rowNum = reelSize[0];
        // for (let index = 0; index < reelSize.length; index++) {
        //     const element = reelSize[index];
        //     _reelNum = element;
        //     _reelNum++;
        // }
        return { reelNum: _reelNum, rowNum: _rowNum }
    }


    public OnHaveSpinResultInfo: Signal = new Signal();
    public OnHaveBuyFeatureResultInfo: Signal = new Signal();
    public OnBoardModeChanged: Signal = new Signal();
}
export class SpinResultInfo {
    itemTypeGrid: ItemConfig[][] = [];
    first_column_wait_for_scatter_id: number = -1;
    num_scatter_in_first_matrix: number = 0;
    freespinNum: number = 0;
}
