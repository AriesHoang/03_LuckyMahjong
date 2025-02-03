import Utils from "../Utils/Utils";

import { Cfg } from "../Manager/Config";
import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import { E_BOARD_MODE } from "../Game/BoardUI";

import FreeSpinInfo from "../Game/FreeSpinInfo";
import NumberLabel from "../Common/NumberLabel";
import CurrencyConverter from "../Common/CurrencyConverter";
import StageLoadingFont from "../Common/Multilingual/StageLoadingFont";

const { ccclass, property } = cc._decorator;

export enum E_LAYOUT_MODE {
    NORMAL = 0,
    FREESPIN,
    FullReelWild,
    MINIGAME,

}
const BACKGROUND_APPEAR_DURATION = 1;
const BACKGROUND_DISAPPEAR_DURATION = 1.5;

@ccclass
export default class LayoutModeController extends cc.Component {
    @property([cc.Node])
    normalNodeList: cc.Node[] = [];

    @property([cc.Node])
    freespinNodeList: cc.Node[] = [];

    // @property(cc.Node)
    // baseBoard: cc.Node = null;
    @property(cc.Node)
    infoBar: cc.Node = null;

    @property(cc.Node)
    cheatBtn: cc.Node = null;

    @property(cc.Node)
    playerStats: cc.Node = null;

    @property(NumberLabel)
    bonusWinLabel: NumberLabel = null;

    @property(FreeSpinInfo)
    freeSpinInfo: FreeSpinInfo = null;

    private bonusWinNumber: number = 0;

    private _layoutMode: E_LAYOUT_MODE = undefined;
    public get layoutMode() { return this._layoutMode; }
    public setLayoutMode(mode: E_LAYOUT_MODE) {
        if (this._layoutMode != mode) {
            this._layoutMode = mode;
            this.normalNodeList.forEach((node) => {
                if (!Utils.isEmpty(node))
                    node.active = (mode == E_LAYOUT_MODE.NORMAL);
            });
            this.freespinNodeList.forEach((node) => {
                if (!Utils.isEmpty(node))
                    node.active = (mode == E_LAYOUT_MODE.FREESPIN);
            });
           
            // this.baseBoard.active = (mode != E_LAYOUT_MODE.GAMBLE);
        }

        if (this._layoutMode == E_LAYOUT_MODE.FREESPIN) {
            this.resetBonusWin();

        }
    }

    private idleShuffledID: number = 0;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.cheatBtn.active = Cfg.isDebug;
    }

    protected onEnable() {
        clientEvent.on(EventName.BoardModeChange, this.onBoardModeChange, this);
        clientEvent.on(EventName.BoardInit, this.initLayout, this);
        clientEvent.on(EventName.ShowFreeSpinInfo, this.setFreespinNumLayout, this);
        clientEvent.on(EventName.UpdateBonusWin, this.updateBonusWin, this);
    }

    protected onDisable() {
        clientEvent.off(EventName.BoardModeChange, this.onBoardModeChange, this);
        clientEvent.off(EventName.BoardInit, this.initLayout, this);
        clientEvent.off(EventName.ShowFreeSpinInfo, this.setFreespinNumLayout, this);
        clientEvent.off(EventName.UpdateBonusWin, this.updateBonusWin, this);
    }

    onBoardModeChange(data) {
        cc.log("onBoardModeChange: ", data);
        this.setLayoutMode(data.mode);
    }
    initLayout(data) {
        let boardMode = data.boardMode;
        let buyFeatureOption = data.curBuyFeatureOptions;
        this.setLayoutMode(boardMode);
        // this.lbFake.font = StageLoadingFont.getFont();
    }


    setFreespinNumLayout(num: number) {
        this.freeSpinInfo.showFreeSpinInfo(num);
    }
    resetBonusWin() {
        this.bonusWinNumber = 0;
        this.bonusWinLabel.string = "0";
        this.bonusWinLabel.node.parent.active = false;
    }
    updateBonusWin(totalWin: number) {
        if (this._layoutMode == E_LAYOUT_MODE.FREESPIN) {
            if (totalWin > 0) {
                if (this.bonusWinLabel.string.length > 0) {
                    this.bonusWinLabel.node.parent.active = true;
                }
                if (totalWin > this.bonusWinNumber) {
                    let startNumber = this.bonusWinNumber ? this.bonusWinNumber : 0;
                    let strPrefix = Utils.getCurrencyStr();
                    this.bonusWinLabel.string = strPrefix;
                    this.bonusWinLabel.playAnim(.5, strPrefix.length, false, startNumber, totalWin,
                        () => {
                            // return SoundController.inst.playSFXPointIncrement();
                        },
                        () => {
                            this.bonusWinNumber = totalWin;
                        },
                        "BONUS WIN: ");
                }
            }
        }
    }
}
