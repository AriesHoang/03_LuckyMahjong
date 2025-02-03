import { clientEvent } from "../Core/observer/clientEvent";

enum E_LINE_STATE {
    IDLE = 0,
    SHOW_WINLINES,
    SHOW_SCATTER,
    SHOW_EXPANSION,
    MOVE_EXPANSION,
    SHOW_EXPANSION_WINLINES
}

import LineWinData, { HeartItemWin } from "../Data/GamePlay/LineWinData";
import { Cfg } from "../Manager/Config";
import RootData from "../Manager/RootData";
import Utils from "../Utils/Utils";
import BoardUI, { ActionCheckWin, E_BOARD_MODE } from "./BoardUI";
import GameController from "./GameController";
// import BoardController, { ActionCheckWin } from "./BoardController";
import ItemSymbol, { E_ANIM_STATE } from "./ItemSymbol";
import Line from "./Line";
import { BOARDSIZE, LINECONFIG } from "./LineConfig";
import { EventName } from "../Manager/EventName";
import StickyLayer from "./StickyLayer";
import ElectricHeartEffect from "./ElectricHeartEffect ";
import SoundController from "../Manager/SoundController";
import { AudioPlayId } from "../Core/audio/AudioPlayId";
import CurrencyConverter from "../Common/CurrencyConverter";
import CharacterAinmationState from "./CharacterAinmationState";
import {E_SYMBOL} from "./ItemConfig";
import BoardData from "../Data/GamePlay/BoardData";



const { ccclass, property } = cc._decorator;

@ccclass
export default class lineUI extends cc.Component {

    @property(cc.Node)
    payLines: cc.Node = null;

    @property(cc.Node)
    boardControllerNode: cc.Node = null;

    @property(cc.Node)
    itemLayer: cc.Node = null;

    @property([sp.Skeleton])
    lineSkeletonList: sp.Skeleton[] = [];

    @property(cc.Label)
    lineWinAmountLabel: cc.Label = null;

    @property(cc.Prefab)
    linePrefab: cc.Prefab = null;

    @property(BoardUI)
    boardUI: BoardUI = null;

    @property(StickyLayer)
    stickyLayer: StickyLayer = null;

    //hard code
    @property(cc.Node)
    payLines_FreeSpin: cc.Node = null;

    @property(cc.Node)
    itemLayer_FreeSpin: cc.Node = null;

    @property(cc.Label)
    lineWinAmountLabel_FreeSpin: cc.Label = null;

    @property(cc.Label)
    multiplierLbInLine: cc.Label = null;

    @property(CharacterAinmationState)
    bugAinmationState: CharacterAinmationState = null;

    Cur_payLines: cc.Node = null;
    Cur_itemLayer: cc.Node = null;
    Cur_lineWinAmountLabel: cc.Label = null;


    private curLineID: number = 0;
    private animCheckerList: boolean[] = [];
    private curState: E_LINE_STATE = 0;

    private isSkipAnim: boolean = false;
    private onActionListFinishedCB: Function = null;

    // private _divNum: number = 1;   //number of div inside each item
    // private _lineDivPos: number[][] = [];  //div position of line
    private conditionLoop: boolean = false;
    private lineWinData: LineWinData;
    private itemsCache: any[] = [];
    isStoped: boolean = false;

    protected onEnable(): void {
        this.Cur_payLines = this.payLines;
        this.Cur_itemLayer = this.itemLayer;
        this.Cur_lineWinAmountLabel = this.lineWinAmountLabel;

        GameController.OnInitialized.add(this.OnGameControllerInitialized.bind(this));
        GameController.OnStartSpin.add(this.onStartSpin.bind(this));

        clientEvent.on(EventName.BoardModeChange, this.onBoardModeChange, this);


    }
    onBoardModeChange(data) {
        this.isStoped = true;
        this.curState = E_LINE_STATE.IDLE;
        cc.Tween.stopAllByTarget(this.node);
        this.resetAllLines();
        this.Cur_lineWinAmountLabel.node.active = false;
        this.Cur_payLines.active = false;

        switch (data.mode) {
            case E_BOARD_MODE.NORMAL:
                this.Cur_payLines = this.payLines;
                this.Cur_itemLayer = this.itemLayer;
                this.Cur_lineWinAmountLabel = this.lineWinAmountLabel;
                break;
            case E_BOARD_MODE.FREESPIN:
                this.Cur_payLines = this.payLines_FreeSpin;
                this.Cur_itemLayer = this.itemLayer_FreeSpin;
                this.Cur_lineWinAmountLabel = this.lineWinAmountLabel_FreeSpin;
                break;
            default:
                break;
        }

    }

    protected onDisable(): void {
        GameController.OnInitialized.remove(this.OnGameControllerInitialized.bind(this));
    }

    OnGameControllerInitialized() {
        this.lineWinData = RootData.instance.FindComponent(LineWinData);
    }

    protected start(): void {
        this.initialize();
        this.lineWinAmountLabel.node.zIndex = 10;
        this.lineWinAmountLabel_FreeSpin.node.zIndex = 10;
    }

    public initialize(): void {
        // let actionchecl = new ActionCheckWin(1, this.checkWinLinesPromise.bind(this));

        // GameController.addActionCheckWin(actionchecl);
    }

    onStartSpin() {
        this.isStoped = true;
        this.curState = E_LINE_STATE.IDLE;
        cc.Tween.stopAllByTarget(this.node);
        this.resetAllLines();
        this.Cur_lineWinAmountLabel.node.active = false;
        this.Cur_payLines.active = false;
        this.stopAllItemsWinAnim();
    }


    checkWinLinesPromise(spinData: any,): Promise<any> {
        return new Promise((resolve: Function) => {

            this.isStoped = false;
            let profitAmount = spinData.base.winRate * spinData.baseAmount;
            if(spinData.freeGame?.remains >= 0 && spinData.freeGame.rounds.length > 0){
                cc.log("winRate: " + spinData.freeGame.rounds[spinData.freeGame.rounds.length - 1].winRate);
                profitAmount = spinData.freeGame.rounds[spinData.freeGame.rounds.length - 1].winRate * spinData.baseAmount;
            }
            RootData.instance.gamePlayData.addProfitAmount(profitAmount);

            // let is_skip_anim = (spinData.freeSpins > 0 || spinData.isLastFreeSpins);
            let is_skip_anim = (spinData.base.freeGame?.remains >= 0);
            if (profitAmount > 0 && !RootData.instance.FindComponent(BoardData).isReconnectMiniGame) {

                // this.bugAinmationState.OnHaveWinLine().then(() => {
                //     this.bugAinmationState.PlayAimIdle();
                // });

                if (spinData.freeGame?.winRate > 0){
                    let currentWin = spinData.freeGame?.winRate * spinData.baseAmount;
                    clientEvent.dispatchEvent(EventName.UpdateBonusWin, currentWin);
                }


                this.itemsCache = [];
                clientEvent.dispatchEvent(EventName.ShowWinInfo, "info_bar_win_01", profitAmount, true);
                // this.infoBarController.showWinInfo("info_bar_win_01", winlines_total, showIncrement);
                this.showWinLines(is_skip_anim, () => {
                    resolve();
                })
                // SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxWinLine);
            } else {
                clientEvent.dispatchEvent(EventName.HideWinInfo);
                resolve();
            }
        })
    }
    showWinLines(isSkipAnim: boolean = false, callback: Function = null) {

        this.Cur_payLines.active = true;
        if (callback)
            this.onActionListFinishedCB = callback;
        else
            this.onActionListFinishedCB = null;

        this.curLineID = this.lineWinData.lineList.length;  //show all lines first
        this.isSkipAnim = isSkipAnim;
        this.resetAllLines();
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .call(() => {
                this.showNextWinLine();
            })
            .start();
    }

    resetAllLines() {
        this.lineSkeletonList.forEach((ske, index) => {
            ske.node.active = false;
        });
        this.hideAllLines();
    }

    hideAllLines() {
        const num_line = LINECONFIG.posArr.length;
        let line_name;
        for (let i = 0; i < num_line; ++i) {
            line_name = 'line' + i.toString();
            if (this.Cur_payLines.getChildByName(line_name)) {
                this.Cur_payLines.getChildByName(line_name).getComponent(Line).hideLines();
            }
        }
    }

    showNextWinLine(): Promise<any> {
        return new Promise((resolve: Function) => {
            if (this.isStoped) {
                resolve();
                return;
            }
            // cc.log("this.lineWinData: ", this.lineWinData);
            if (this.curLineID <= this.lineWinData.lineList.length - 1 && !this.isSkipAnim) {
                let lineID = this.lineWinData.lineList[this.curLineID];
                let winPosList = this.lineWinData.winPosList[this.curLineID];
                let itemMultData = this.lineWinData.winMultList[this.curLineID];
                this.resetAllLines();
                // this.stopAllItemsWinAnim();
                Promise.all([
                    this.showWinItemsPromise(winPosList),   //item
                    this.showLine(lineID)                   //line
                ]).then(() => {
                    ++this.curLineID;
                    this.showNextWinLine();
                });
                this.lineSkeletonList.forEach((ske, index) => {
                    if (index == lineID) {
                        ske.node.active = false;
                    } else {
                        ske.node.active = false;
                    }
                });
                // if (itemMultData?.mult > 1) {
                //     this.multiplierLbInLine.node.active = true;
                //     this.multiplierLbInLine.string = "X" + itemMultData.mult;
                //
                //     let item = this.getWinItemAtPos(itemMultData.pos).node;
                //     let amountPos = item.parent.convertToWorldSpaceAR(item.getPosition());
                //     amountPos = this.multiplierLbInLine.node.parent.convertToNodeSpaceAR(amountPos);
                //
                //     this.multiplierLbInLine.node.setPosition(amountPos);
                //
                // } else
                    this.multiplierLbInLine.node.active = false;

                //win amount
                this.Cur_lineWinAmountLabel.node.active = true;
                this.Cur_lineWinAmountLabel.string = CurrencyConverter.getCreditString(this.lineWinData.winAmountList[this.curLineID]);
                let posLastItem = {x: 0, y: 0};
                for(let i = winPosList.length - 1; i > -1; i--){
                    if(winPosList[i] > -1){
                        posLastItem.x = i;
                        posLastItem.y = winPosList[i];
                        break;
                    }
                }
                let item = this.getWinItemAt(posLastItem.x , posLastItem.y).node;

                let amountPos = item.parent.convertToWorldSpaceAR(item.getPosition()).sub(cc.v2(0, Cfg.itemSize.y * 0.25));
                amountPos = this.Cur_lineWinAmountLabel.node.parent.convertToNodeSpaceAR(amountPos);
                this.Cur_lineWinAmountLabel.node.setPosition(amountPos);
            } else {
                //show all win lines at once
                this.animCheckerList = [];
                this.resetAllLines();

                // let posList: number[] = [];
                let posLists = [[],[],[],[],[]];
                this.lineWinData.winPosList.forEach((list) => {
                    list.forEach((pos, index)=>{
                        posLists[index].push(pos);
                    });

                    // posList.push.apply(posList, list);
                });
                posLists.forEach((list, index)=>{
                    posLists[index] = list.filter((item, pos, self) => {
                        return self.indexOf(item) == pos;
                    });
                })
                cc.log("posLists: ", posLists);


                // posList = posList.filter((item, pos, self) => {
                //     return self.indexOf(item) == pos;
                // });
                let promList: Promise<any>[] = [];
                promList.push(this.showAllWinItemsPromise(posLists));

                this.lineWinData.lineList.forEach((lineID, index) => {
                    this.animCheckerList[index] = false;
                    promList.push(this.showLine(lineID));
                });
                Promise.all(promList).then(() => {

                    this.lineWinData.lineList.forEach((lineID, index) => {
                        this.animCheckerList[index] = true;
                    });
                    this.checkState();

                    resolve();
                });

                //win amount
                this.multiplierLbInLine.node.active = false;
                this.Cur_lineWinAmountLabel.node.active = false;
            }
        })

    }

    hide() {
        this.curState = E_LINE_STATE.IDLE;
        cc.Tween.stopAllByTarget(this.node);
        this.resetAllLines();
        this.stopAllItemsWinAnim();
        this.Cur_lineWinAmountLabel.node.active = false;
        this.Cur_payLines.active = false;
        this.multiplierLbInLine.node.active = false;
    }

    showWinItemsPromise(posList: number[]): Promise<any> {
        // cc.log("showWinItemsPromise: ", posList);
        for (let index = 0; index < this.itemsCache.length; index++) {
            let parent = this.itemsCache[index].parent;
            const element = this.itemsCache[index].item;
            element.stopAnimWin();
            Utils.changeParent(element.node, parent);
        }
        this.itemsCache = [];

        return new Promise((resolve: Function) => {
            let promList: Promise<any>[] = [];
            posList.forEach((pos, index) => {
                if(pos > -1){
                    let item = this.getWinItemAt(index, pos);
                    this.itemsCache.push({ item: item, parent: item.node.parent });
                    Utils.changeParent(item.node, this.Cur_itemLayer);

                    promList.push(item.playItemAnimPromise(E_ANIM_STATE.win));
                }

            });
            Promise.all(promList).then(resolve.bind(this));
        });
    }
    showAllWinItemsPromise(posLists: number[][]): Promise<any> {
        cc.log("showAllWinItemsPromise: ", posLists);
        for (let index = 0; index < this.itemsCache.length; index++) {
            let parent = this.itemsCache[index].parent;
            const element = this.itemsCache[index].item;
            element.stopAnimWin();
            Utils.changeParent(element.node, parent);
        }
        this.itemsCache = [];

        return new Promise((resolve: Function) => {

            let promList: Promise<any>[] = [];
            posLists.forEach((posListColumn, index) => {
                let bPlayWildAnim = false;
                posListColumn.forEach((pos)=>{
                    if(pos > -1){
                        let item = this.getWinItemAt(index, pos);
                        if(!bPlayWildAnim || item.itemCfg.symbol != E_SYMBOL.WILD_L){
                            this.itemsCache.push({ item: item, parent: item.node.parent });
                            // const currentSymbolInfoPos =this.boardUI.currentSymbolInfoPos;
                            // if (currentSymbolInfoPos == null || (currentSymbolInfoPos[0] * Cfg.slotSize.y + currentSymbolInfoPos[1] != pos)) {
                            Utils.changeParent(item.node, this.Cur_itemLayer);
                            // }

                            promList.push(item.playItemAnimPromise(E_ANIM_STATE.win));
                        }

                        if(item.itemCfg.symbol == E_SYMBOL.WILD_L){
                            bPlayWildAnim = true;
                        }

                    }
                })

            });
            Promise.all(promList).then(resolve.bind(this));
        });
    }

    showLine(lineID: number): Promise<any> {
        return new Promise((resolve: Function) => {
            if (!Cfg.isDisplayWinLine || lineID < 0 || lineID >= this.lineWinData._lineDivPos.length) {
                resolve();
                return;
            }
            // cc.log("======showLine: " + lineID + " - ",this.lineWinData._lineDivPos[lineID]);

            const line_name = 'line' + lineID.toString();
            let itemPos: number;
            let divPosArr: cc.Vec2[] = [];
            let tempDivPos: cc.Vec2;
            //2 extra lines at leftmost & rightmost
            this.lineWinData._lineDivPos[lineID].forEach((value, index) => {
                let boardSize = this.boardUI.getBoardSize();
                //revert the index order in each column, we will count from top to bottom
                itemPos = index * boardSize.y + LINECONFIG.posArr[lineID][index];
                tempDivPos = this.boardUI.getPositionOfItemDiv(itemPos, value, this.lineWinData._divNum);
                if (index == 0) {
                    divPosArr.push(cc.v2(tempDivPos.x - Cfg.itemSize.x * 0.5, tempDivPos.y));
                }
                divPosArr.push(tempDivPos);
                if (index == this.lineWinData._lineDivPos[lineID].length - 1) {
                    divPosArr.push(cc.v2(tempDivPos.x + Cfg.itemSize.x * 0.5, tempDivPos.y));
                }
            });
            let line: Line;
            if (this.Cur_payLines.getChildByName(line_name)) {
                //already exist, just show
                line = this.Cur_payLines.getChildByName(line_name).getComponent(Line);
            } else {
                //add new line
                line = Line.instantiate(this.linePrefab);
                line.node.parent = this.Cur_payLines;
                line.node.name = line_name;
            }
            line.drawLines(divPosArr).then(resolve.bind(this));
        });
    }


    protected checkState(): void {
        // if (this.curState == E_LINE_STATE.IDLE) {

        // } else if (this.curState == E_LINE_STATE.SHOW_WINLINES) {
        if (this.Cur_payLines.active && this.isActionListFinished()) {
            //finish showing all win lines
            this.animCheckerList = [];
            this.curLineID = 0; //reset
            cc.tween(this.node)
                .call(() => {
                    //return item to reels
                    this.showNextWinLine();
                })
                .call(() => {
                    if (this.onActionListFinishedCB) {
                        this.onActionListFinishedCB();
                        this.onActionListFinishedCB = null;
                    }


                })
                .start();
        }
        // }
        // } else if (this.curState == E_LINE_STATE.SHOW_SCATTER) {

        // } else if (this.curState == E_LINE_STATE.SHOW_EXPANSION) {

        // } else if (this.curState == E_LINE_STATE.MOVE_EXPANSION) {
        //     if (this.payLines.active && this.isActionListFinished()) {
        //         // this.showAllWinLines();
        //     }
        // } else if (this.curState == E_LINE_STATE.SHOW_EXPANSION_WINLINES) {
        //     if (this.payLines.active && this.isActionListFinished()) {
        //         this.animCheckerList = [];
        //         if (this.onActionListFinishedCB)
        //             this.onActionListFinishedCB();
        //         this.onActionListFinishedCB = null;
        //     }
        // }
    }

    isActionListFinished() {
        return (this.animCheckerList && this.animCheckerList.length == this.lineWinData.lineList.length && this.animCheckerList.find(element => element == false) == undefined);
    }

    getWinItemAtPos(pos: number): ItemSymbol {
        //don't use sticky symbols to display in win lines,
        //as the real symbols under them are the same and more convenient to use
        return this.boardUI.getItemAtPos(pos);
    }
    getWinItemAt(colID: number, rowID: number){
        return this.boardUI.getItemAt(colID, rowID);
    }

    stopAllItemsWinAnim() {
        //return item to reels
        this.boardUI.stopItemWinAnim();
        //return sticky symbols to sticky layer
        this.Cur_itemLayer.children.forEach((child) => {
            if (child.name != "item" && !isNaN(Number(child.name))) {
                Utils.changeParent(child, this.stickyLayer.node);
            }
        });
    }


}
