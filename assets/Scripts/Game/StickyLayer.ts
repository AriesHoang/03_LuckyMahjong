import { clientEvent } from "../Core/observer/clientEvent";
import { Cfg } from "../Manager/Config";
import { EventName } from "../Manager/EventName";
import Utils from "../Utils/Utils";
import BoardUI, { E_BOARD_MODE } from "./BoardUI";
import GameController from "./GameController";
import ItemSymbol from "./ItemSymbol";
import SoundController from "../Manager/SoundController";
import { AudioPlayId } from "../Core/audio/AudioPlayId";
import { E_SYMBOL_TYPE } from "./ItemConfig";
import { E_SYMBOL, ItemConfig } from "./ItemConfig";

const { ccclass, property } = cc._decorator;

enum E_STICK_STATUS {
    ON_BOARD,
    STICK
}

@ccclass
export default class StickyLayer extends cc.Component {
    @property(BoardUI)
    boardUI: BoardUI = null;
    private _reelNum: number = Cfg.slotSize.x;  //number of reels in board
    private _rowNum: number = Cfg.slotSize.y;   //number of row in 1 reel
    private statusGrid: E_STICK_STATUS[] = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initialize();
    }

    start() {
        // this.initialize();
    }

    // update (dt) {}

    initialize() {
        this.resetStatus();
    }

    protected onEnable(): void {
        this.resetStatus();
        clientEvent.on(EventName.BoardModeChange, this.onBoardModeChange, this);
        clientEvent.on(EventName.OnBoardSizeChanged, this.onBoardSizeChange, this);
        clientEvent.on(EventName.StickSymbol, this.onStickSymbols, this);
    }
    protected onDisable(): void {
        clientEvent.off(EventName.StickSymbol, this.onStickSymbols, this);
        clientEvent.off(EventName.OnBoardSizeChanged, this.onBoardSizeChange, this);
        clientEvent.off(EventName.BoardModeChange, this.onBoardModeChange, this);
    }

    resetStatus() {
        this.node.children.forEach((child) => {
            if (!isNaN(Number(child.name))) {
                child.removeFromParent();
            }
        });
        this._reelNum = Cfg.slotSize.x;
        this._rowNum = Cfg.slotSize.y;
        const arr_size = this._reelNum * this._rowNum;
        this.statusGrid = [];
        this.statusGrid = Array<E_STICK_STATUS>(arr_size).fill(E_STICK_STATUS.ON_BOARD);
    }

    onStickSymbols(posList: number[]) {
        posList.forEach((pos) => {
            this.stickSymbol(pos);
        });
    }

    stickSymbol(pos: number) {
        const org_symbol = this.boardUI.getItemAtPos(pos);
        //remove sticked symbol if any
        this.unstickSymbol(pos);
        //clone a new one on top
        let sticky_symbol = ItemSymbol.clone(org_symbol);
        sticky_symbol.init(org_symbol.itemCfg);
        sticky_symbol.node.active = true;
        this.node.addChild(sticky_symbol.node);
        let poscs = org_symbol.node.getPosition()
        const org_world_pos = org_symbol.node.parent.convertToWorldSpaceAR(org_symbol.node.getPosition());
        sticky_symbol.node.setPosition(this.node.convertToNodeSpaceAR(org_world_pos));
        sticky_symbol.node.name = pos.toString();
        sticky_symbol.setItemState();
        this.statusGrid[pos] = E_STICK_STATUS.STICK;


        if(org_symbol.itemCfg.symbol == E_SYMBOL.WILD)
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfx_Wild);
    }

    unstickSymbol(pos: number) {
        //change symbol parent, from reel to sticky layer
        const symbol = this.getSymbolAt(pos);
        if (symbol) {
            symbol.removeFromParent();
        }
        this.statusGrid[pos] = E_STICK_STATUS.ON_BOARD;
    }

    unstickAllSymbols() {
        const arr_size = this.statusGrid.length;
        for (let i = 0; i < arr_size; ++i) {
            this.unstickSymbol(i);
        }
    }

    isSymbolSticky(pos: number): boolean {
        return this.statusGrid[pos] == E_STICK_STATUS.STICK;
    }

    getSymbolAt(pos: number): cc.Node {
        return this.node.getChildByName(pos.toString());
    }

    onBoardModeChange(mode: E_BOARD_MODE) {
        // if (mode != E_BOARD_MODE.FREESPIN) {
        //reset
        this.resetStatus();
        // }
    }

    onBoardSizeChange(data: any) {
        const new_reel_num: number = data.reelNum;
        const new_row_num: number = data.rowNum;
        //update status grid & sticky symbol position
        //compare old & new matrix size
        if (this._reelNum != new_reel_num) {
            return; //cannot handle
        }
        if (this._rowNum == new_row_num) {
            return; //no need to do anything
        }
        let new_status_grid: E_STICK_STATUS[] = Array<E_STICK_STATUS>(new_reel_num * new_row_num).fill(E_STICK_STATUS.ON_BOARD);
        if (new_row_num > this._rowNum) {
            const added_row_num = new_row_num - this._rowNum;
            //expand more reel, copy old grid into new grid
            for (let i = 0; i < this._reelNum; ++i) {
                for (let j = 0; j < this._rowNum; ++j) {
                    const old_pos = i * this._rowNum + j;
                    const new_pos = i * new_row_num + j + added_row_num;
                    if (this.statusGrid[old_pos] == E_STICK_STATUS.STICK) {
                        new_status_grid[new_pos] = E_STICK_STATUS.STICK;
                        this.getSymbolAt(old_pos).name = new_pos.toString();
                    }
                }
            }
        } else if (new_row_num < this._rowNum) {
            this.unstickAllSymbols();
        }
        this.statusGrid = new_status_grid;
        this._reelNum = new_reel_num;
        this._rowNum = new_row_num;
    }

    playSymbolAscendAnim(symbol: cc.Node, dstPos: cc.Vec2): Promise<any> {
        return new Promise((resolve: Function) => {
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxStickySymbolMove);
            cc.Tween.stopAllByTarget(symbol);
            cc.tween(symbol)
                .to(0.7, { x: dstPos.x, y: dstPos.y }/* , { easing: "bounceOut" } */)
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    returnSymbolsToStickyLayer() {
        //check status grid
        this.statusGrid.forEach((stat, id) => {
            if (stat == E_STICK_STATUS.STICK) {
                const symbol = this.boardUI.getItemAtPos(id);
                Utils.changeParent(symbol.node, this.node);
            }
        });
    }

    getNextAscendPosition(pos: number): number {
        const row_id = pos % this._rowNum;
        if (row_id == 0) {
            return null;
        }
        return pos - 1;
    }
}
