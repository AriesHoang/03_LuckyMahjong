import { clientEvent } from "../../Core/observer/clientEvent";
import BoardData, { SpinResultInfo } from "../../Data/GamePlay/BoardData";
import { Cfg, GameCertification, GameConfig } from "../../Manager/Config";
import { EventName } from "../../Manager/EventName";
import Utils from "../../Utils/Utils";
import BoardUI, { E_BOARD_STATE } from "../BoardUI";
import ItemSymbol, { E_ANIM_STATE } from "../ItemSymbol";
import SpinReel from "../SpinReel";
import SoundController from "../../Manager/SoundController";
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import { AudioPlay } from "../../Core/audio/AudioPlayer";
import { ITEMGREEN, ITEMPURPLE, ITEMRED, ItemConfig } from "../ItemConfig";

export interface IBoardMode {
    active(any?)
    deactive();
    loadData(boardData: BoardData, boardUi: BoardUI)
    initBoard(any?): void
    startSpinning(): void
    getItemAtPos(pos: number): ItemSymbol
    getItemAt(colID: number, rowID: number): ItemSymbol
    onReelFinishSpin(): void
    onSpinButtonPressedAgain(): void
    finishSpin(): void
    onHaveSpinResultInfo(spinResultInfo: SpinResultInfo)
    stopItemWinAnim(): void
    getPositionOfItemDiv(itemPos: number, divPos: number, divNum: number): cc.Vec2
    setCompletedSpin(callBack: Function)
    onHaveBuyFeatureResultInfo(spinResultInfo);
    getBoardSize(): cc.Vec2;
    getBoardReels():SpinReel[];

}
const { ccclass, property } = cc._decorator;
@ccclass
export class BaseBoardMode extends cc.Component {

    boardUi: BoardUI = null;

    protected reelSpinSoundID: AudioPlay = null;
    protected reelSpinDelay: number[] = [];

    protected _reelNum: number = Cfg.slotSize.x;
    protected _rowNum: number = Cfg.slotSize.y;
    spinReels: SpinReel[] = [];
    boardData: BoardData = null;
    callbackfinished: Function = null;

    get isTurbo() {
        return this.boardUi.getTurbo();
    }

    deactive() {
        this.node.active = false;
    }

    loadData(boardData: BoardData, boardUi: BoardUI) {
        this.boardData = boardData;
        this.boardUi = boardUi;
    }

    cloneItemReelForOtherMode(mode: BaseBoardMode): boolean {
        if (mode) {

            for (let ci = 0; ci < this._reelNum; ++ci) {
                let reel = this.spinReels[ci];
                let reelMode2 = mode.spinReels[ci];

                reel.clear();

                reel.itemList = [...reelMode2.itemList];


                for (const item of reelMode2.itemList) {
                    Utils.changeParent(item.node, reel.node)
                }

            }
            return true;
        }
        return false;
    }

    public startSpinning() {
        this.boardUi.boardState = E_BOARD_STATE.SPINNING;

        for (let ci = 0; ci < this._reelNum; ++ci) {
            let reelNode = this.spinReels[ci];
            let reel = reelNode.getComponent(SpinReel);
            let rowNum = this._rowNum;
            //========= Custom Reel size for this game
            if(ci == 0 || ci == this._reelNum - 1) rowNum = 3
            reel.setReelSize(rowNum, Cfg.columnHeight / Cfg.slotSize.y * rowNum, false);
            reel.setHasSpinData(false);
            if (ci == 0) {
                this.reelSpinDelay[ci] = 0;
            }
            else {
                this.reelSpinDelay[ci] = this.reelSpinDelay[ci - 1] + (this.isTurbo ? GameConfig.spinTurbo.timeDelayStartBetweenReels : GameConfig.spinNormal.timeDelayStartBetweenReels);
            }
            reel.startSpinning(this.isTurbo, this.reelSpinDelay[ci]);
        }
        if (this.reelSpinSoundID != null) {
            SoundController.inst.MainAudio.stopAudioPlay(this.reelSpinSoundID);
            this.reelSpinSoundID = null;
        }
        cc.log("=========Normal Start Reel Spin");
        this.reelSpinSoundID = SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxReelSpin, true);
    }

    public getItemAtPos(pos: number): ItemSymbol {
        let col_id = Math.floor(pos / this._rowNum);
        let row_id = pos % this._rowNum;
        // cc.log(pos + " - getItemAtPos: " + row_id + "-" + col_id)
        return this.getItemAt(col_id, row_id);
    }

    public getItemAt(colID: number, rowID: number): ItemSymbol {
        let reel = this.spinReels[colID];

        return reel.getItem(rowID) as ItemSymbol;
    }

    public getPositionOfItemDiv(itemPos: number, divPos: number, divNum: number): cc.Vec2 {

        const item = this.getItemAtPos(itemPos);
        // cc.log(itemPos + " - getPositionOfItemDiv: ",item);
        const total_height = item.node.getContentSize().height * 0.7;   //dont stretch too much to the top & bottom
        let worldPos: cc.Vec2 = item.node.parent.convertToWorldSpaceAR(item.node.getPosition());
        //div3
        //div1
        //div0
        //div2
        //div4
        worldPos.y += (divPos % 2 == 1 ? 1 : -1) * Math.ceil(divPos / 2) / divNum * total_height;
        return worldPos;
    }

    public onReelFinishSpin() {
        if (this.boardUi.boardState == E_BOARD_STATE.SPINNING) {
            //check if all reels finish spinning
            let is_all_reel_finish_spinning: boolean = true;
            let is_all_reel_waiting_or_finished_spinning: boolean = true;
            for (let ci = 0; ci < this._reelNum; ++ci) {
                let reelNode = this.spinReels[ci];
                let reel = reelNode.getComponent(SpinReel);
                is_all_reel_finish_spinning = is_all_reel_finish_spinning && reel.isSpinFinished();
                is_all_reel_waiting_or_finished_spinning = is_all_reel_waiting_or_finished_spinning && (reel.isWaitingToFinish() || reel.isSpinFinished());
            }
            if (is_all_reel_waiting_or_finished_spinning && this.reelSpinSoundID != null) {
                SoundController.inst.MainAudio.stopAudioPlay(this.reelSpinSoundID);
                this.reelSpinSoundID = null;
                cc.log("=========Normal Stop Reel Spin");
            }
            if (is_all_reel_finish_spinning) {
                this.boardUi.boardState = E_BOARD_STATE.FINISH_SPINNING;
            }
        }
    }

    public onSpinButtonPressedAgain() {
        if (this.boardUi.boardState == E_BOARD_STATE.SPINNING && this.boardData.hasSpinData) {

            let can_skip: boolean = true;
            for (let ci = 0; ci < this._reelNum; ++ci) {
                let reel = this.spinReels[ci];
                let reelNode = this.spinReels[ci].node;
                if (reel.hasSpinData() && !reel.isHighlight() && GameCertification.enable_slam_stop) {
                    cc.Tween.stopAllByTarget(reelNode);
                    reel.skipToSpinningToResult();
                } else {
                    can_skip = false;
                }
            }
            if (can_skip) {
                Utils.consoleLog("spin to result immediately");
                clientEvent.dispatchEvent(EventName.OnSkipButtonAnim);
            }
        }
    }

    checkTumbleInLoopPromise(): Promise<any> {
        let spinData = this.boardData.spinData;
        const tumble_num = this.boardData.spinData.result.length;
        let board_prom_chain: Promise<any> = Promise.resolve();
        let layout_prom_chain: Promise<any> = Promise.resolve();    //update layout in parallel with gameplay
        for (let i = 0; i < tumble_num - 1; ++i) {
            const tumble_data = spinData.result[i];
            const next_tumble_data = spinData.result[i + 1];
            board_prom_chain = board_prom_chain.then(this.checkTumbleWinPromise.bind(this, tumble_data, i));
            board_prom_chain = board_prom_chain.then(() => {
                // layout_prom_chain = layout_prom_chain.then(this.updateCollectionStageLayoutPromise.bind(this, tumble_data, i));
                // this.curSpinProfit += tumble_data.winAmount;
                return this.checkTumbleCascadePromise(next_tumble_data, i);
            });
            // board_prom_chain = board_prom_chain.then(this.checkChangeCollectionStagePromise.bind(this, tumble_data, next_tumble_data, i));
        }
        return Promise.all([board_prom_chain/* , layout_prom_chain */]);
    }

    checkTumbleWinPromise(data: any, tumbleID: number): Promise<any> {
        // this.boardUi.boardState = E_BOARD_STATE.TUMBLE_WIN;
        // this.parseSpinResult(data.matrix);

        //fade in win layer
        let prom_arr: Promise<any>[] = [];
        //show symbol win anim
        

        let win_pos_set: Set<number> = new Set();
        data.winlines.forEach((winline) => {
            winline.winPos.forEach((array) => {
                array.forEach((pos)=>{
                    win_pos_set.add(pos);
                })
                
            })
        });
        if (win_pos_set.size > 0) {
            // prom_arr.push(this.showWinLayerPromise());
            // this.infoBarController.showWinInfo("info_bar_win_01", data.winAmount, true);
            // SoundController.inst.playSFXWinline(this.isFreeSpin);
        }
      
        let items:ItemSymbol[] = [];
    

        win_pos_set.forEach((pos) => {
            let a = this.boardData.getIndexForPos(pos);
            let b =  this.boardData.itemTypeGrid[a.col][a.row];
            const symbol = this.getItemAt(a.col,a.row);
            if(this.getIsIdColor(b.symbol)!=1){
                items.push(symbol);
            }

            this.boardData.itemTypeGrid[a.col][a.row] = {
                symbol: null,
                value: null,
                type: null,
                size:null
            };
          
            const prom_chain: Promise<any> = Promise.resolve()
                .then(() => {
                    //move symbol to win layer
                    // Utils.changeParent(symbol.node, this.winLayer);
                })
                .then(symbol.playItemAnimPromise.bind(symbol, E_ANIM_STATE.win));
            prom_arr.push(prom_chain);
        });        
        return Promise.all(prom_arr)
            .then(() => {
                //remove win symbols from reel & board
                let clear_prom_arr: Promise<any>[] = [];
                for (let ci = 0; ci < this._reelNum; ++ci) {
                    //calculate nullified positions
                    let clear_pos_list: number[] = [];
                    this.boardData.itemTypeGrid[ci].forEach((value, index) => {
                        if (value.symbol == null) {
                            clear_pos_list.push(index);
                        }
                    })
                    let reel = this.spinReels[ci];
                    clear_prom_arr.push(reel.clearItemsPromise(clear_pos_list));
                }
                if (win_pos_set.size > 0) {
                    // clear_prom_arr.push(this.hideWinLayerPromise());
                }
                return Promise.all(clear_prom_arr);
            });
    }

    getIsIdColor(id:number):number{
        if(ITEMRED[id])return 0;
        if(ITEMPURPLE[id])return 1;
        if(ITEMGREEN[id])return 2;

        return -1;
    }

    
    checkTumbleCascadePromise(data, tumbleID: number): Promise<any> {
        // this.boardUi.boardState = E_BOARD_STATE.TUMBLE_CASCADE;
        this.boardData.nextTumpleProcess(data);
        let prom_arr: Promise<any>[] = [];
        for (let ci = 0; ci < this._reelNum; ++ci) {
            let reel = this.spinReels[ci];
            prom_arr.push(reel.cascadeItemsPromise(this.boardData.itemTypeGrid[ci]));
        }
        // SoundController.inst.playSFXTumble();
        return Promise.all(prom_arr).then(() => {
            // this.statsController.setProfitAmount(CurrencyConverter.getCreditString(this.curSpinProfit));
            // return this.checkRevealMysteryPromise(data, tumbleID);
        });
    }


    setCompletedSpin(callBack: Function) {
        this.callbackfinished = callBack;
        return this;
    }

    public finishSpin() {
        for (let ci = 0; ci < this._reelNum; ++ci) {
            let reel = this.spinReels[ci];
            reel.setToIdle();
        }

        this.boardUi.boardState = E_BOARD_STATE.IDLE;

    }

    public getBoardSize() {
        return cc.v2(this._reelNum, this._rowNum);
    }

    public getBoardReels():SpinReel[] {
        return this.spinReels;
    }
    

}
