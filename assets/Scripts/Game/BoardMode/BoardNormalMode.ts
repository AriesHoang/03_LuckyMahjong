
import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import AudioPlayer, { AudioPlay } from "../../Core/audio/AudioPlayer";
import { clientEvent } from "../../Core/observer/clientEvent";
import BoardData, { SpinResultInfo } from "../../Data/GamePlay/BoardData";
import { Cfg, GameConfig } from "../../Manager/Config";
import { EventName } from "../../Manager/EventName";
import SoundController from "../../Manager/SoundController";
import Utils from "../../Utils/Utils";
import BoardUI, { E_BOARD_STATE } from "../BoardUI";
import FlyWildMaker from "../FlyWildMaker";
import { E_SYMBOL } from "../ItemConfig";
import ItemSymbol from "../ItemSymbol";
import SpinReel from "../SpinReel";
import { BaseBoardMode, IBoardMode } from "./IBoardMode";
export type DataItemsFly = { item: ItemSymbol, pos: cc.Vec2 }

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardNormalMode extends BaseBoardMode implements IBoardMode {

    @property(SpinReel)
    spinReels: SpinReel[] = [];

    posItems: cc.Vec2[][] = [];

    @property(cc.Node)
    spinBoardContent: cc.Node = null;

    @property(cc.Node)
    reelHighlight: cc.Node = null;

    @property(cc.Node)
    reelHighlightMask: cc.Node = null;

    @property(cc.Prefab)
    reelPrefab: cc.Prefab = null;

    // @property(FlyWildMaker)
    // flyWildMaker: FlyWildMaker = null;

    isInitBoard: boolean = false;
    boardData: BoardData;
    defaultMutilier:number[]= [1,1,1];

    active(mode: BaseBoardMode) {
        this.node.active = true;

        this.initBoard(mode);
    }

    deactive() {
        super.deactive();
        // this.flyWildMaker.rest();
    }

    initBoard(mode: BaseBoardMode) {
        let itemTypeGrid = this.boardData.itemTypeGrid;


        if (this.isInitBoard) {
            this.cloneItemReelForOtherMode(mode);

            return;
        }
        this.isInitBoard = true;


        for (let ci = 0; ci < this._reelNum; ++ci) {
            let reel = SpinReel.create(this.reelPrefab);

            this.spinBoardContent.addChild(reel.node, 1, "reel" + ci);
            reel.init(ci, itemTypeGrid[ci]);
            this.spinReels[ci] = reel;
        }
        this.spinBoardContent.getComponent(cc.Layout).updateLayout();

        for (let ci = 0; ci < this._reelNum; ++ci) {
            this.posItems[ci] = [];
            for (let i = 0; i < itemTypeGrid[ci].length; i++) {
                let pos = this.spinReels[ci].node.getPosition();
                //  = pos.add(cc.v2(0, (itemTypeGrid[ci].length - 1) / 2 - i * Cfg.itemSize.y))
                this.posItems[ci][i] = pos.add(cc.v2(0, ((itemTypeGrid[ci].length - 1) / 2 - i) * Cfg.itemSize.y));

            }
        }
    }

    async onHaveSpinResultInfo(spinResultInfo: SpinResultInfo) {
        let itemTypeGrid = spinResultInfo.itemTypeGrid;


        // await this.flyWildMaker.onHaveSpinResultInfo(spinResultInfo, posWild);

        let first_column_wait_for_scatter_id = spinResultInfo.first_column_wait_for_scatter_id;


        if (first_column_wait_for_scatter_id == -1) {
            for (let ci = 0; ci < this._reelNum; ++ci) {
                // let reelNode = this.spinReels[ci];
                let reel = this.spinReels[ci];
                // reel.setExpandItemID(this.expandItemID);
                reel.setHasSpinData(this.boardData.hasSpinData, itemTypeGrid[ci]);
            }
        } else {
            let col_id: number = first_column_wait_for_scatter_id;
            let highlight_skeleton = this.reelHighlight.getChildByName("highlight_skeleton").getComponent(sp.Skeleton);
            let highlight_sfxId: AudioPlay = null;
            let setReelSpinFn = () => {

                let reel = this.spinReels[col_id];
                let reelNode = reel.node;
                // reel.setExpandItemID(this.expandItemID);
                this.reelHighlight.active = true;
                this.reelHighlight.setPosition(reelNode.getPosition());
                highlight_skeleton.setAnimation(0, "animation", true);
                this.reelHighlightMask.active = true;
                this.reelHighlightMask.setPosition(reelNode.getPosition());
                this.reelHighlightMask.getChildByName("highlight_bg").setPosition(-reelNode.getPosition().x, reelNode.getPosition().y);
                highlight_sfxId = SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxReelHighlight);
                reel.setHasSpinData(this.boardData.hasSpinData, itemTypeGrid[col_id], (col_id < this._reelNum - 1), () => {
                    if (col_id >= this._reelNum - 1) {
                        //return all scatters from highlight layer to reels
                        for (let ci = 0; ci < col_id; ++ci) {
                            let reel = this.spinReels[ci];
                            reel.stopItemWinAnim();
                        }

                        this.reelHighlight.active = false;
                        this.reelHighlightMask.active = false;

                        //hide wait scatter text at info bar
                        // this.infoBarController.hideWaitScatterText();
                        clientEvent.dispatchEvent(EventName.ShowRuleInfo, false, false);

                        //sound
                        if (highlight_sfxId != null) {
                            SoundController.inst.MainAudio.stopSound(highlight_sfxId.audioId);
                            highlight_sfxId = null;

                            // SoundController.inst.MainAudio.stopAllEffect();
                            if(spinResultInfo.freespinNum > 0){
                                SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxScatterWon);
                            }
                            
                        }
                        //do not highlight the last reel, as scatter does not appear on it
                        if (col_id == this._reelNum - 2) {
                            ++col_id;

                            //set spin data for last reel
                            this.spinReels[col_id].setHasSpinData(this.boardData.hasSpinData, itemTypeGrid[col_id]);
                        }
                    } else {
                        //highlight scatters in this reel
                        itemTypeGrid[col_id].forEach((value, index) => {
                            if (value.symbol == Cfg.scatterItemID) {
                                Utils.changeParent(this.getItemAt(col_id, index).node, this.reelHighlight.parent);
                            }
                        });

                        ++col_id;
                        setReelSpinFn();
                    }
                });

                //sound
                if (highlight_sfxId != null) {
                    SoundController.inst.MainAudio.stopSound(highlight_sfxId);
                }
                
            };

            let item: ItemSymbol;
            for (let ci = 0; ci < first_column_wait_for_scatter_id; ++ci) {

                let reel = this.spinReels[ci];
                if (ci < first_column_wait_for_scatter_id - 1) {
                    reel.setHasSpinData(this.boardData.hasSpinData, itemTypeGrid[ci]);
                } else {
                    reel.setHasSpinData(this.boardData.hasSpinData, itemTypeGrid[ci], false, () => {
                        if (ci == first_column_wait_for_scatter_id - 1) {
                            //highlight scatters in previous reel
                            for (let cii = 0; cii < first_column_wait_for_scatter_id; ++cii) {
                                itemTypeGrid[cii].forEach((value, index) => {
                                    if (value.symbol == Cfg.scatterItemID) {
                                        item = this.getItemAt(cii, index);
                                        Utils.changeParent(item.node, this.reelHighlight.parent);
                                        item.playWaitScatterAnimPromise();
                                    }
                                });
                            }

                            //show wait scatter text at info bar

                            clientEvent.dispatchEvent(EventName.ShowRuleInfo, false, true);
                        }

                        setReelSpinFn();
                    });
                }
            }
        }
    }

    onHaveBuyFeatureResultInfo(spinResultInfo: SpinResultInfo) {

        // this.onHaveSpinResultInfo(spinResultInfo);
        this.boardUi.boardState = E_BOARD_STATE.SPINNING;
        if (this.callbackfinished) {
            this.callbackfinished();
            this.callbackfinished = null;
        }
        this.boardUi.boardState = E_BOARD_STATE.FINISH_SPINNING;

    }

    stopItemWinAnim() {
        for (let ci = 0; ci < this._reelNum; ++ci) {
            let reelNode = this.spinReels[ci];
            let reel = reelNode.getComponent(SpinReel);

            reel.stopItemWinAnim();

        }
    }

    getPositonDefault(col_id, row_id) {
        // let col_id = Math.floor(pos / this._rowNum);
        // let row_id = pos % this._rowNum;
        return this.posItems[col_id][row_id]
    }

    public startSpinning(): void {
        super.startSpinning();

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


}
