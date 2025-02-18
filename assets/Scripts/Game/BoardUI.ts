import { clientEvent } from "../Core/observer/clientEvent";
import BoardData, { SpinResultInfo } from "../Data/GamePlay/BoardData";
import GamePlayData from "../Data/GamePlayData";
import PlayerData from "../Data/PlayerData";
import { Cfg, GameConfig } from "../Manager/Config";
import { EventName } from "../Manager/EventName";
import RootData from "../Manager/RootData";
import Utils from "../Utils/Utils";
import BoardNormalMode from "./BoardMode/BoardNormalMode";
import { BaseBoardMode, IBoardMode } from "./BoardMode/IBoardMode";
import GameController from "./GameController";
import { ItemConfig } from "./ItemConfig";
import ItemSymbol from "./ItemSymbol";
import SpinReel from "./SpinReel";
import SoundController from "../Manager/SoundController";
import { AudioPlayId } from "../Core/audio/AudioPlayId";

const { ccclass, property } = cc._decorator;

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
    SHOW_TOTAL_WIN_FREESPIN,
    TUMBLE_CASCADE,
    TUMBLE_WIN
};

export enum E_BOARD_MODE {
    NORMAL,
    FREESPIN,
    FullReelWild,
    MINIGAME
}

@ccclass('BoardModeObject')
export class BoardModeObject {

    @property({
        type: cc.Enum(E_BOARD_MODE)
    })
    name: E_BOARD_MODE = E_BOARD_MODE.NORMAL;

    @property({
        type: BaseBoardMode
    })
    modeComponent: IBoardMode = null;

}

@ccclass
export default class BoardUI extends cc.Component {

    boardData: BoardData;

    private reelSpinSoundID: number = -1;
    private reelSpinDelay: number[] = [];
    private gamePlayData: GamePlayData;
    private playerData: PlayerData;

    private _reelNum: number = Cfg.slotSize.x;  //number of reels in board
    private _rowNum: number = Cfg.slotSize.y;   //number of row in 1 reel

    private _isTurbo: boolean = false;
    public setTurbo(v: boolean) { this._isTurbo = v; }
    public getTurbo(): boolean { return this._isTurbo }
    private _boardState: E_BOARD_STATE = E_BOARD_STATE.IDLE;
    public get boardState(): E_BOARD_STATE { return this._boardState; }
    public set boardState(v: E_BOARD_STATE) {
        this._boardState = v;
        clientEvent.dispatchEvent(EventName.BoardChangeState, this.boardState);

        
        if (this._boardState == E_BOARD_STATE.SPINNING){
            //certification for inactivity
            clientEvent.dispatchEvent(EventName.DisableInactivityTracker);
        }
        else
        {
            //certification for inactivity
            clientEvent.dispatchEvent(EventName.EnableInactivityTracker);
        }
    }

    private _boardMode: E_BOARD_MODE = E_BOARD_MODE.NORMAL;
    private _boardModeCache: E_BOARD_MODE = E_BOARD_MODE.NORMAL;
    public get boardMode(): E_BOARD_MODE {
        return this._boardMode;
    }
    public set boardMode(v: E_BOARD_MODE) {
        cc.log("set Board Mode");
        this._boardMode = v;
        clientEvent.dispatchEvent(EventName.BoardModeChange, {
            mode: this._boardMode,
            reelNum: this._reelNum,
            rowNum: this._rowNum
        });
    }
    public ListCheckWin: ActionCheckWin[] = [];

    @property([BoardModeObject])
    private boardModeObjects: BoardModeObject[] = [];

    private mapModes: Map<E_BOARD_MODE, IBoardMode> = null;
    private currentMode: IBoardMode = null;
    private previousMode: IBoardMode = null;

    protected onEnable(): void {
        clientEvent.on(EventName.BoardInit, this.onBoardInit, this);
        clientEvent.on(EventName.ReelFinishSpin, this.onReelFinishSpin, this);
        clientEvent.on(EventName.OnSpinButtonPressedAgain, this.onSpinButtonPressedAgain, this);
        clientEvent.on(EventName.OnSpinButtonPressed, this.onSpinButtonPressed, this);
        clientEvent.on(EventName.OnTurboChanged, this.onTurboChanged, this);
        clientEvent.on(EventName.OnBoardSizeChanged, this.onBoardSizeChanged, this);

        clientEvent.on(EventName.ReelWaitfinishSpin, this.onReelWaitfinishSpin, this);

        GameController.OnStartSpin.add(this.StartSpinning.bind(this));
        GameController.OnInitialized.add(this.OnGameControllerInitialized.bind(this));
        GameController.OnFinishSpin.add(this.finishSpin.bind(this));

    }
    protected onDisable(): void {
        clientEvent.off(EventName.BoardInit, this.onBoardInit, this);
        clientEvent.off(EventName.ReelFinishSpin, this.onReelFinishSpin, this);
        clientEvent.off(EventName.OnSpinButtonPressedAgain, this.onSpinButtonPressedAgain, this);
        clientEvent.off(EventName.OnSpinButtonPressed, this.onSpinButtonPressed, this);
        this.boardData?.OnHaveSpinResultInfo.remove(this.onHaveSpinResultInfo.bind(this));
        this.boardData?.OnHaveBuyFeatureResultInfo.remove(this.onHaveBuyFeatureResultInfo.bind(this));
        clientEvent.off(EventName.OnTurboChanged, this.onTurboChanged, this);

        clientEvent.off(EventName.ReelWaitfinishSpin, this.onReelWaitfinishSpin, this);


        GameController.OnStartSpin.remove(this.StartSpinning.bind(this));
        GameController.OnInitialized.remove(this.OnGameControllerInitialized.bind(this));
        GameController.OnFinishSpin.remove(this.finishSpin.bind(this));
    }

    OnGameControllerInitialized() {
        this.boardData = RootData.instance.FindComponent(BoardData);

        if (this.boardData) {
            this.boardData.OnHaveSpinResultInfo.add(this.onHaveSpinResultInfo.bind(this));
            this.boardData.OnHaveBuyFeatureResultInfo.add(this.onHaveBuyFeatureResultInfo.bind(this));
            this.boardData.OnBoardModeChanged.add(this.onBoardModeChanged.bind(this));
        }
        this.initBoardMode();
        this.initBoard();

        this.boardState = E_BOARD_STATE.IDLE;

    }

    initBoardMode() {
        this.mapModes = new Map<E_BOARD_MODE, IBoardMode>();
        this.boardModeObjects.forEach((obj, i) => {
            obj.modeComponent.loadData(this.boardData, this);
            this.mapModes.set(obj.name, obj.modeComponent);
        });

        this.boardMode = this.boardData.boardMode;

        this.currentMode = this.mapModes.get(this.boardMode);
        this.currentMode.active();
    }

    onBoardModeChanged(data) {
        this._reelNum = data.reelNum;
        this._rowNum = data.rowNum;
        this._boardModeCache = data.mode;
    }

    onAcceptChangeMode() {
        cc.log("onAcceptChangeMode...", this._boardModeCache);
        this.boardMode = this._boardModeCache;

        this.previousMode = this.currentMode;
        this.previousMode.deactive();

        let mode
        if (this.previousMode != this.currentMode)
            mode = this.previousMode;

        this.currentMode = this.mapModes.get(this.boardMode);
        this.currentMode.active(mode);
    }

    initBoard() {
        this.currentMode.initBoard();        
    }

    onBoardInit(data: any) {
        // this.boardMode = data.boardMode as E_BOARD_MODE;
    }

    onBoardSizeChanged(size) {
        this._reelNum = size.reelNum;
        this._rowNum = size.rowNum;
    }

    private StartSpinning() {
        this.currentMode.startSpinning();
        if(this.boardMode != E_BOARD_MODE.FREESPIN)this.boardData.onHaveMutilier([1,1,1]);
        // SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxReelSpin, true);
    }

    onHaveSpinResultInfo(spinResultInfo: SpinResultInfo) {
        this.currentMode.onHaveSpinResultInfo(spinResultInfo);
    }

    onHaveBuyFeatureResultInfo(spinResultInfo: SpinResultInfo) {
        this.currentMode.onHaveBuyFeatureResultInfo(spinResultInfo);
    }

    getItemAtPos(pos: number): ItemSymbol {
        return this.currentMode.getItemAtPos(pos);
    }

    getItemAt(colID: number, rowID: number): ItemSymbol {
        return this.currentMode.getItemAt(colID, rowID);
    }

    getPositionOfItemDiv(itemPos: number, divPos: number, divNum: number): cc.Vec2 {
        return this.currentMode.getPositionOfItemDiv(itemPos, divPos, divNum);
    }

    stopItemWinAnim() {
        this.currentMode.stopItemWinAnim();
    }

    onReelFinishSpin() {
        this.currentMode.onReelFinishSpin();
    }

    onReelWaitfinishSpin(){
        SoundController.inst.MainAudio.playAudio(this._isTurbo ? AudioPlayId.sfxReelStopFast : AudioPlayId.sfxReelStopNormal, false, this._isTurbo ? 0.3 : 1);
    }

  


    finishSpin() {
        this.currentMode.finishSpin();
    }
    onSpinButtonPressed() {
        cc.log("this.getTurbo: " + this._isTurbo);
        SoundController.inst.MainAudio.playAudio(this._isTurbo ? AudioPlayId.sfxTurboSpinBtn : AudioPlayId.sfxSpinBtn);
    }

    onSpinButtonPressedAgain() {
        this.currentMode.onSpinButtonPressedAgain();
    }

    public getBoardSize(): cc.Vec2 {
        return this.currentMode.getBoardSize()
    }

    public getBoardReels(): SpinReel[] {
        return this.currentMode.getBoardReels();
    }


    onTurboChanged(isTurboOn) {
        this.setTurbo(isTurboOn);
    }
}


export class ActionCheckWin {
    constructor(_indexOrder, _funcExecute) {
        this.indexOrder = _indexOrder;
        this.funcExecute = _funcExecute;
    }
    indexOrder: number
    funcExecute: Function;
}