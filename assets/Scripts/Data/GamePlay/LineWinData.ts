import {BOARDSIZE, LINE_WIDTH, LineConfig, LINECONFIG} from "../../Game/LineConfig";
import { ILifecycleData } from "../../Interface/ILifecycleData";
import Utils from "../../Utils/Utils";
import { clientEvent } from "../../Core/observer/clientEvent";
import { EventName } from "../../Manager/EventName";
import { Cfg } from "../../Manager/Config";
import {E_SYMBOL} from "../../Game/ItemConfig";
export class HeartItemWin {
    symbol: number;
    pos: number

}
export class ItemMutiWin {
    symbol: number;
    pos: number;
    mult: number;
}

export type DivStatus = {
    id: number,
    isOccupied: boolean,
    lineId?: number
}

export class SlotConfig {
    divNum: number = 0;
    divStatus: DivStatus[] = [];

    constructor(divNum: number) {
        this.divNum = divNum;
        this.divStatus = [];
        //initialize all div
        for (let i = 0; i < this.divNum; ++i) {
            this.divStatus[i] = { id: i, isOccupied: false };
        }
    }

    findClosestAvailableDiv(goalDiv: number): DivStatus {
        //sort div base on their distance to goal div
        this.divStatus.sort((lhs, rhs) => {
            if (goalDiv == 0) {
                return Math.abs(lhs.id - goalDiv) - Math.abs(rhs.id - goalDiv);
            }
            return Math.abs(lhs.id - goalDiv) - Math.abs(rhs.id - goalDiv) + (this.divNum + 1) * (Math.abs(lhs.id % 2 - goalDiv % 2) - Math.abs(rhs.id % 2 - goalDiv % 2));
        });
        //find first available/unoccupied div
        return this.divStatus.find(x => x.isOccupied == false);
    }

    occupyClosestAvailableDiv(goalDiv: number): DivStatus {
        let closest_div = this.findClosestAvailableDiv(goalDiv)
        if (!Utils.isEmpty(closest_div))
            closest_div.isOccupied = true;
        return closest_div;
    }

    reAllocateDiv(orgDiv: number, resultDiv: number): DivStatus {
        //occupy resultDiv and unccupy orgDiv
        if (this.divStatus[resultDiv].isOccupied) {
            return null;
        }
        this.divStatus[orgDiv].isOccupied = false;
        this.divStatus[resultDiv].isOccupied = true;
        return this.divStatus[resultDiv];
    }
}

type SubLineConfig = {
    subId: number,
    lineId: number,
    sublinePos: number,
    angle: number,
    continuousSubline: number[],
    allocatedDiv: number
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class LineWinData implements ILifecycleData {
    public _divNum: number = 1;   //number of div inside each item
    public _lineDivPos: number[][] = [];
    public winPosList: number[][] = [];
    public winAmountList: number[] = [];
    public winMultList: ItemMutiWin[] = [];
    public lineList: number[] = [];
    public ListlineHaveHearts: any[] = [];
    winlines_total: number = 0;
    isGetfreeSpins: number = 0;

    winLineData = null;

    Initialize(): void {
        this.validateLineConfig();
        //calculate once, not at runtime
        this.calculateDivPosition();
        // this.test();
        this._divNum = LINECONFIG.divNum;
        // this._divNum = 1;
        this._lineDivPos = LINECONFIG.lineDivPos;
        // this._lineDivPos = new Array(108).fill(new Array(5).fill(0));
    }
    Activate(restore: boolean): void {

    }
    Deactivate(): void {

    }
    onHaveDataSpin(spinData) {
        let winlines = spinData.base.lines;
        this.winLineData = spinData;
        this.winlines_total = spinData.base.winRate * spinData.baseAmount;
        let reelData = spinData.base.reels;

        if(spinData.freeGame && spinData.freeGame?.rounds.length > 0){
            let lastFreeGame = spinData.freeGame.rounds[spinData.freeGame.rounds.length - 1];
            winlines = lastFreeGame.lines;
            this.winlines_total = lastFreeGame.winRate * spinData.baseAmount;
            reelData = lastFreeGame.reels;
        }

        if (this.winlines_total > 0) {
            if (winlines.length > 0) {
                this.isGetfreeSpins = spinData.freeGame?.remains;
                this.getListWinData(winlines, reelData);
            }
        } else {

        }

    }
    onBuyFeature(data: any) {
        this.lineList = [];
        this.winPosList = [];
        this.winAmountList = [];
        this.winlines_total = 0
    }
    getWinPosList(reelData, winData){
        let winLine = winData.line;
        let winPos = [];
        winLine.forEach((pos, index)=>{
            let symbol = reelData[index][pos];
            if(winPos.length < winData.count && (symbol == winData.symbol || symbol == E_SYMBOL.WILD || symbol == E_SYMBOL.WILD_L)){
                winPos.push(pos);
            }else{
                winPos.push(-1);
            }
        });
        return winPos;
    }

    getListWinData(winLinesData: any, reelData: any) {
        this.lineList = [];
        this.winPosList = [];
        this.winAmountList = [];
        this.winMultList = [];
        this.ListlineHaveHearts = [];
        winLinesData.forEach((winLine, index) => {
            this.lineList.push(Utils.findIndexIn2dArray(LINECONFIG.winLinesConfig, winLine.line));
            this.winPosList[index] = this.getWinPosList(reelData, winLine);
            this.winAmountList[index] = winLine.winRate * this.winLineData.baseAmount;
            // let posMult = -1;
            // if (winLine.mult > 1) {
            //     posMult = this.getPosItemMutiWin(winLine, spinData)
            // }
            // this.winMultList[index] = { symbol: winLine.mult, pos: posMult, mult: winLine.mult };

        });
        // if (this.isGetfreeSpins) {
        //     winLinesData.forEach((winLine, index) => {
        //         let listHearts = this.getIsLineWinFreeSpins(winLine, spinData);
        //         if (listHearts.length > 0) {
        //             let isHave = this.ListlineHaveHearts.some((result, index) => {
        //                 if (result.length != listHearts.length) return false;
        //                 for (let index = 0; index < result.length; index++) {
        //                     const element = result[index] as HeartItemWin;
        //                     let item = listHearts[index];
        //                     if (element.pos != item.pos) {
        //                         return false;
        //                     }
        //                 }
        //                 return true;
        //             })
        //             if (!isHave) {
        //                 this.ListlineHaveHearts.push(listHearts);
        //             }
        //         }
        //     });
        // }
    }

    getIsLineWinFreeSpins(winPosList, spinData) {
        let ishavaBlue = false;
        let ishaveRed = false;
        let listHearts: HeartItemWin[] = [];
        for (let index = 0; index < winPosList.winPosition.length; index++) {
            let id = winPosList.winPosition[index];
            const element = spinData.reels[id];
            if (element.symbol == Cfg.redHeartItemId) {
                ishaveRed = true;
                let item: HeartItemWin = new HeartItemWin();
                item.symbol = element.symbol;
                item.pos = id;
                listHearts.push(item)
            }
            if (element.symbol == Cfg.blueHeartItemId) {
                let item: HeartItemWin = new HeartItemWin();
                item.symbol = element.symbol;
                item.pos = id;
                ishavaBlue = true;
                listHearts.push(item)
            }
        }

        return ishavaBlue && ishaveRed ? listHearts : [];
    }

    getPosItemMutiWin(winPosList, spinData) {
        let id;
        for (let index = 0; index < winPosList.winPosition.length; index++) {
            id = winPosList.winPosition[index];
            const element = spinData.reels[id];
            if (element.symbol == Cfg.redHeartItemId) {
                return id;
            }
        }
        return id;
    }

    validateLineConfig() {
        if (LINECONFIG.posArr[0].length != BOARDSIZE.x) {
            Utils.consoleLog('Invalid line length');
            return;
        }
        LINECONFIG.posArr.forEach((lineCfg, lineID) => {
            lineCfg.forEach((rowID, colID) => {
                if (rowID < 0 || rowID >= BOARDSIZE.y) {
                    // Utils.consoleLog('Invalid index at line ' + lineID + ' , pos ' + colID);
                    return;
                }
            });
        })
        const duplicates = LINECONFIG.posArr.filter((item, pos, self) => {
            return self.indexOf(item) != pos;
        });
        if (duplicates.length > 0) {
            Utils.consoleLog('There are duplicates line config');
            return;
        }
    }

    calculateDivPosition() {
        //calculate number of divs. Use number of lines that go through that item
        let div_count_grid: number[][] = [];
        for (let i = 0; i < BOARDSIZE.x; ++i) {
            div_count_grid[i] = new Array<number>(BOARDSIZE.y).fill(0);
        }
        LINECONFIG.posArr.forEach((lineCfg, lineID) => {
            lineCfg.forEach((rowID, colID) => {
                ++div_count_grid[colID][rowID];
            });
        });
        this._divNum = Math.max.apply(Math, div_count_grid.map((col) => {
            return Math.max.apply(Math, col);
        }));
        Utils.consoleLog('Number of div = ' + this._divNum);

        //initialize slot config matrix
        let grid_slot_config: SlotConfig[][] = [];
        for (let ci = 0; ci < BOARDSIZE.x; ++ci) {
            grid_slot_config[ci] = [];
            for (let ri = 0; ri < BOARDSIZE.y; ++ri) {
                grid_slot_config[ci][ri] = new SlotConfig(this._divNum);
            }
        }

        //calculate line angle
        let lineCfgArr: LineConfig[] = [];
        let sublineCfgArr: SubLineConfig[] = [];
        LINECONFIG.posArr.forEach((lineCfg, index) => {
            let tempAngleArr: number[] = [];
            lineCfg.forEach((pos, subID) => {
                if (subID > 0) {
                    tempAngleArr[subID] = pos - lineCfg[subID - 1];
                } else {
                    tempAngleArr[subID] = 0;
                }

                //calculate number of continuos angles
                let continuous_sublines: number[] = [];
                for (let i = subID - 1; i >= 0; --i) {
                    if (tempAngleArr[i] == tempAngleArr[subID]) {
                        continuous_sublines.unshift(i);
                    } else {
                        // if (tempAngleArr[subID] == 0) {
                            //add 2 more subs at start & end when angle == 0
                            continuous_sublines.unshift(i);
                        // }
                        break;
                    }
                }
                const sublineCfg: SubLineConfig = {
                    subId: subID,
                    lineId: index,
                    sublinePos: pos,
                    angle: tempAngleArr[subID],
                    continuousSubline: continuous_sublines,
                    allocatedDiv: null  //default is unallocated
                };
                sublineCfgArr.push(sublineCfg);
            });
            lineCfgArr[index] = {
                id: index,
                posArr: lineCfg,
                angleArr: tempAngleArr,
                divPosArr: []   //will calculate later
            }
        });

        for (let i = 0; i < LINECONFIG.posArr.length; ++i) {
            this._lineDivPos[i] = new Array<number>(BOARDSIZE.x).fill(0);
        }

        //calculate division position for each sub line, base on sub line's angle
        //walking through all sub line positions
        const subNum = lineCfgArr[0]?.angleArr.length;
        if (subNum) {
            //allocate longer consecutive sub lines first
            sublineCfgArr.sort((lhs, rhs) => {
                return rhs.continuousSubline.length - lhs.continuousSubline.length;
            });
            //allocate all sub lines where angle == 0
            sublineCfgArr.forEach((sublineCfg, index) => {
                if (sublineCfg.angle == 0 && Utils.isEmpty(sublineCfg.allocatedDiv)) {
                    //allocate all continuous sub lines, from the start/left
                    let prev_div: number = 0;
                    sublineCfg.continuousSubline.forEach((prevSublineId, i) => {
                        const prevSublineCfg = sublineCfgArr.find(x => (x.lineId == sublineCfg.lineId && x.subId == prevSublineId));
                        if (!Utils.isEmpty(prevSublineCfg.allocatedDiv)) {
                            //check for div angle, from previous of previous sub line
                            const prev_prev_length = prevSublineCfg.continuousSubline.length;
                            if (prev_prev_length > 0) {
                                const prev_prev_subline_id = prevSublineCfg.continuousSubline[prev_prev_length - 1];
                                const prev_prev_subline = sublineCfgArr.find(x => (x.lineId == sublineCfg.lineId && x.subId == prev_prev_subline_id));
                                if (!Utils.isEmpty(prev_prev_subline.allocatedDiv)) {
                                    prev_div = prevSublineCfg.allocatedDiv * 2 - prev_prev_subline.allocatedDiv;
                                } else {
                                    prev_div = prevSublineCfg.allocatedDiv;
                                }
                            } else {
                                prev_div = prevSublineCfg.allocatedDiv;
                            }
                        } else {
                            //not yet allocated, allocate anew
                            prev_div = grid_slot_config[prevSublineCfg.subId][prevSublineCfg.sublinePos].occupyClosestAvailableDiv(prev_div).id;
                            prevSublineCfg.allocatedDiv = prev_div;
                        }
                    });

                    //allocate this sub line
                    sublineCfg.allocatedDiv = grid_slot_config[sublineCfg.subId][sublineCfg.sublinePos].occupyClosestAvailableDiv(prev_div).id;
                }
            });

            //allocate sub lines where angle == prev angle
            sublineCfgArr.forEach((sublineCfg, index) => {
                if (sublineCfg.continuousSubline.length > 0 && Utils.isEmpty(sublineCfg.allocatedDiv)) {
                    //allocate all continuous sub lines, from the start/left
                    let prev_div: number = 0;
                    sublineCfg.continuousSubline.forEach((prevSublineId, i) => {
                        const prevSublineCfg = sublineCfgArr.find(x => (x.lineId == sublineCfg.lineId && x.subId == prevSublineId));
                        if (!Utils.isEmpty(prevSublineCfg.allocatedDiv)) {
                            //check for div angle, from previous of previous sub line
                            const prev_prev_length = prevSublineCfg.continuousSubline.length;
                            if (prev_prev_length > 0) {
                                const prev_prev_subline_id = prevSublineCfg.continuousSubline[prev_prev_length - 1];
                                const prev_prev_subline = sublineCfgArr.find(x => (x.lineId == sublineCfg.lineId && x.subId == prev_prev_subline_id));
                                if (!Utils.isEmpty(prev_prev_subline.allocatedDiv)) {
                                    prev_div = prevSublineCfg.allocatedDiv * 2 - prev_prev_subline.allocatedDiv;
                                } else {
                                    prev_div = prevSublineCfg.allocatedDiv;
                                }
                            } else {
                                prev_div = prevSublineCfg.allocatedDiv;
                            }
                        } else {
                            //not yet allocated, allocate anew
                            prev_div = grid_slot_config[prevSublineCfg.subId][prevSublineCfg.sublinePos].occupyClosestAvailableDiv(prev_div).id;
                            prevSublineCfg.allocatedDiv = prev_div;
                        }
                    });
                    //allocate this sub line
                    sublineCfg.allocatedDiv = grid_slot_config[sublineCfg.subId][sublineCfg.sublinePos].occupyClosestAvailableDiv(prev_div).id;
                }
            });

            //allocate the rest
            sublineCfgArr.forEach((sublineCfg, index) => {
                if (Utils.isEmpty(sublineCfg.allocatedDiv)) {
                    //allocate this sub line
                    sublineCfg.allocatedDiv = grid_slot_config[sublineCfg.subId][sublineCfg.sublinePos].occupyClosestAvailableDiv(0).id;
                }
            });

            sublineCfgArr.forEach((sublineCfg, index) => {
                this._lineDivPos[sublineCfg.lineId][sublineCfg.subId] = sublineCfg.allocatedDiv;
            });

            // for (let i = 0; i < subNum; ++i) {
            //     // lineCfgArr = savedLineCfgArr;
            //     //sort line according to their priorities/angles at this sub
            //     //1st priority: angle = 0
            //     //2nd priority: angle = prev angle
            //     lineCfgArr.sort((lhs, rhs) => {
            //         if (lhs.angleArr[i] == 0 || rhs.angleArr[i] == 0 || i < 1) {
            //             return Math.abs(lhs.angleArr[i]) - Math.abs(rhs.angleArr[i]);
            //         }
            //         const lhs_dev1 = lhs.angleArr[i] - lhs.angleArr[i - 1];
            //         const rhs_dev1 = rhs.angleArr[i] - rhs.angleArr[i - 1];
            //         return Math.abs(lhs_dev1) - Math.abs(rhs_dev1);
            //     });

            //     //locate div pos
            //     lineCfgArr.forEach((lineCfg) => {
            //         const row_id = lineCfg.posArr[i];
            //         const prev_div = (i == 0 ? 0 : lineCfg.divPosArr[i - 1]);//this._lineDivPos[lineCfg.id][i - 1];
            //         const closest_div = grid_slot_config[i][row_id].occupyClosestAvailableDiv(prev_div);
            //         if (closest_div.id != prev_div) {
            //             //try to relocate previous div following this div
            //             for (let j = i - 1; j >= 0; --j) {
            //                 const prev_row_id = lineCfg.posArr[j];
            //                 if (grid_slot_config[j][prev_row_id].reAllocateDiv(lineCfg.divPosArr[j], closest_div.id)) {
            //                     //relocate this arr as well
            //                     lineCfg.divPosArr[j] = closest_div.id;
            //                 }
            //             }
            //         }
            //         lineCfg.divPosArr[i] = closest_div.id;
            //     });
            // }
            // lineCfgArr.forEach((lineCfg) => {
            //     this._lineDivPos[lineCfg.id] = lineCfg.divPosArr;
            // });
        } else {
            //no strategy
            //reuse div_count_grid to store current div index
            div_count_grid.forEach((divCol) => {
                divCol.fill(0);
            });

            LINECONFIG.posArr.forEach((lineCfg, lineID) => {
                lineCfg.forEach((rowID, colID) => {
                    this._lineDivPos[lineID][colID] = div_count_grid[colID][rowID]++;
                });
            });
        }
        cc.log('lineDivPosArr: ' + JSON.stringify(this._lineDivPos));
    }
    test(){
        let posArry = [];


        for (let i = 0; i < LINECONFIG.winLinesConfig.length; i++) {
            const element = LINECONFIG.winLinesConfig[i];
            let index = 0;
            let index2 = 0;
            posArry[i] = [];
            for (let j = 0; j < element.length; j++) {
                const item = element[j];
                if(item==1){
                    posArry[i][index] = index2;
                    index++;
                }
                index2++;

                if(index2 == Cfg.slotSize.y){
                    index2 = 0;
                }

            }
        }
        cc.log('lineDivPosArr: ' + JSON.stringify(posArry));
    }

}
