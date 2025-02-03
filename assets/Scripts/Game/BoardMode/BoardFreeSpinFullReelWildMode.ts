import BoardData, { SpinResultInfo } from "../../Data/GamePlay/BoardData";
import { Cfg } from "../../Manager/Config";
import SpinReel from "../SpinReel";

import { BaseBoardMode } from "./IBoardMode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardFreeSpinFullReelWildMode extends BaseBoardMode {
    @property(SpinReel)
    spinReels: SpinReel[] = [];


    @property(cc.Node)
    spinBoardContent: cc.Node = null;

    @property(cc.Prefab)
    reelPrefab: cc.Prefab = null;


    isInitBoard: boolean = false;
    boardData: BoardData;

    active(mode: BaseBoardMode) {
        this.node.active = true;
        this.initBoard(mode);
    }

    deactive() {
        super.deactive();
    }

    async onHaveSpinResultInfo(spinResultInfo: SpinResultInfo) {

        // this.spinResultInfo = spinResultInfo;
        let itemTypeGrid = spinResultInfo.itemTypeGrid;
        for (let ci = 0; ci < this._reelNum; ++ci) {
            let reel = this.spinReels[ci];
            reel.setHasSpinData(this.boardData.hasSpinData, itemTypeGrid[ci]);
        }
    }



    initBoard(mode: BaseBoardMode) {


        if (this.isInitBoard) {
            this.cloneItemReelForOtherMode(mode);
            return;
        }


        this.isInitBoard = true;

        let itemTypeGrid = this.boardData.itemTypeGrid;
        for (let ci = 0; ci < this._reelNum; ++ci) {
            let reel = SpinReel.create(this.reelPrefab);

            this.spinBoardContent.addChild(reel.node, 1, "reel" + ci);
            reel.init(ci, itemTypeGrid[ci]);
            this.spinReels[ci] = reel;
        }
        this.spinBoardContent.getComponent(cc.Layout).updateLayout();

    }

    public startSpinning(): void {
        super.startSpinning();

    }
    stopItemWinAnim() {
        for (let ci = 0; ci < this._reelNum; ++ci) {
            let reelNode = this.spinReels[ci];
            let reel = reelNode.getComponent(SpinReel);
            reel.stopItemWinAnim();
        }

    }
    // update (dt) {}
}
