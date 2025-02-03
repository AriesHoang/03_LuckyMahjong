// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../Core/observer/clientEvent";
import { E_BOARD_STATE } from "../Game/BoardUI";
import GameController from "../Game/GameController";
import { EventName } from "../Manager/EventName";
// import BuyFeature from "../Popup/BuyFeature/BuyFeature";
import MenuButtons from "./MenuButtons";
import SpinButton from "./SpinButton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StateFollowButtons extends cc.Component {
    @property([cc.Button])
    buttons: cc.Button[] = [];

    @property([cc.Button])
    buttonsNonOpacity: cc.Button[] = [];

    // @property(cc.Button)
    // btnBuyFeature: cc.Button = null

    // @property(cc.Button)
    // anteBetBtn: cc.Button = null;

    @property(SpinButton)
    autoSpinBtn: SpinButton = null;

    _boardState: E_BOARD_STATE;
    _numAutoSpin: number = 0;
    protected onEnable(): void {
        clientEvent.on(EventName.BoardChangeState, this.onBoardChangeState, this);
        clientEvent.on(EventName.OnSkipButtonAnim, this.onSkipButtonAnim, this);
        clientEvent.on(EventName.PlayerNotEnoughBalance, this.onPlayerNotEnoughBalance, this)

        GameController.OnAutoSpinNumChange.add(this.onAutoSpinNumChange.bind(this));
    }
    protected onDisable(): void {
        clientEvent.off(EventName.BoardChangeState, this.onBoardChangeState, this);
        clientEvent.off(EventName.OnSkipButtonAnim, this.onSkipButtonAnim, this);

        GameController.OnAutoSpinNumChange.remove(this.onAutoSpinNumChange.bind(this));
    }

    onBoardChangeState(state: E_BOARD_STATE) {
        this._boardState = state;
        switch (state) {
            case E_BOARD_STATE.IDLE:
                if (this._numAutoSpin <= 0){
                    this.autoSpinBtn.updateStateAutoButton(this._numAutoSpin);
                    this.enableAllButtons();
                }
                break;
            case E_BOARD_STATE.FINISH_SPINNING:

                break;
            case E_BOARD_STATE.SPINNING:
                this.disableAllButtons();
                break;
            default:
                break;
        }

    }
    onPlayerNotEnoughBalance() {
        if (this._boardState == E_BOARD_STATE.IDLE) {
            this.enableAllButtons();
        }
    }

    onAutoSpinNumChange(numSpin) {
        this._numAutoSpin = numSpin;
    }

    public onSkipButtonAnim() {

    }
    disableAllButtons() {
        for (const iterator of this.buttons) {
            iterator.interactable = false;
            iterator.node.opacity = 100;
        }
        for (const iterator of this.buttonsNonOpacity) {
            iterator.interactable = false;
        }
        // this.btnBuyFeature.interactable = false;
        // this.anteBetBtn.interactable = false;
        this.node.getComponent(MenuButtons).hideExtraButtons();

    }
    enableAllButtons() {
        for (const iterator of this.buttons) {
            iterator.interactable = true;
            iterator.node.opacity = 255;
        }
        for (const iterator of this.buttonsNonOpacity) {
            iterator.interactable = true;
        }
        // this.btnBuyFeature.interactable = true;
        // this.anteBetBtn.interactable = true;

        clientEvent.dispatchEvent(EventName.BetAmountChanged);

    }

}
