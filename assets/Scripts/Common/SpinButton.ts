import SoundController from "../Manager/SoundController";

enum E_BTNSPIN_STATE {
    Idle,
    Spin,
    Spin_wait,
    Stop,
    Stop2
};
import { clientEvent } from "../Core/observer/clientEvent";
import { E_BOARD_MODE, E_BOARD_STATE } from "../Game/BoardUI";
import GameController from "../Game/GameController";
import { EventName } from "../Manager/EventName";
import Utils from "../Utils/Utils";
import { E_POPUP_STATE } from "../Stageloading/BasePopup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpinButton extends cc.Component {
    @property(sp.Skeleton)
    btnSpinSke: sp.Skeleton = null;

    @property(cc.Node)
    nodeBounder: cc.Node = null;

    @property(sp.Skeleton)
    highlight_skeleton: sp.Skeleton = null;
    _boardState: E_BOARD_STATE;
    _boardMode: E_BOARD_MODE;
    popupState: E_POPUP_STATE = E_POPUP_STATE.CLOSED ;
    @property(cc.Label)
    auto_spin_num: cc.Label = null;

    @property(cc.Node)
    infinityNode: cc.Node = null;

    @property(cc.Node)
    btnAutoSpin: cc.Node = null

    private autoSpinDisabled = false;

    protected onEnable(): void {
        clientEvent.on(EventName.BoardChangeState, this.onBoardChangeState, this);
        clientEvent.on(EventName.StartAutoSpinPressed, this.OnStartAutoSpinPressed, this);
        clientEvent.on(EventName.CheckAgainSpinButton, this.OnStartAutoSpinPressed, this);
        clientEvent.on(EventName.OnSkipButtonAnim, this.onSkipButtonAnim, this);
        GameController.OnAutoSpinNumChange.add(this.onAutoSpinNumChange.bind(this));
        // clientEvent.on(EventName.ShowFreeSpinInfo, this.UpdateAutoSpinNumLb, this);
        clientEvent.on(EventName.BoardModeChange, this.onBoardModeChange, this);
        clientEvent.on(EventName.AutoSpinButtonChange, this.onAutoSpinButtonChange, this);
        clientEvent.on(EventName.StartAutoSpin, this.OnStartAutoSpinPressed, this);
        clientEvent.on(EventName.PopupOpenClose, this.onPopupStateChange, this);
    }
    protected onDisable(): void {
        clientEvent.off(EventName.BoardChangeState, this.onBoardChangeState, this);
        clientEvent.off(EventName.StartAutoSpinPressed, this.OnStartAutoSpinPressed, this);
        clientEvent.off(EventName.CheckAgainSpinButton, this.OnStartAutoSpinPressed, this);
        clientEvent.off(EventName.OnSkipButtonAnim, this.onSkipButtonAnim, this);
        GameController.OnAutoSpinNumChange.remove(this.onAutoSpinNumChange.bind(this));
        // clientEvent.off(EventName.ShowFreeSpinInfo, this.UpdateAutoSpinNumLb, this);
        clientEvent.off(EventName.BoardModeChange, this.onBoardModeChange, this);
        clientEvent.off(EventName.AutoSpinButtonChange, this.onAutoSpinButtonChange, this);
        clientEvent.off(EventName.StartAutoSpin, this.OnStartAutoSpinPressed, this);
    }

    protected onDestroy(): void {
        clientEvent.off(EventName.PopupOpenClose, this.onPopupStateChange, this);
    }
    protected start(): void {
        let highlight_skeleton = this.highlight_skeleton;
        this.nodeBounder.on(cc.Node.EventType.MOUSE_ENTER, () => {
            if (this._boardState == E_BOARD_STATE.IDLE || this._boardState == E_BOARD_STATE.IDLE_SHOW_SYMBOL_INFO) {
                //play highlight anim
                highlight_skeleton.node.active = true;
                highlight_skeleton.setAnimation(0, "idle_touch", true);
            }
        }, this);
        this.nodeBounder.on(cc.Node.EventType.MOUSE_LEAVE, () => {
            if (highlight_skeleton.node.active) {
                //stop highlighting
                highlight_skeleton.node.active = false;
                highlight_skeleton.setToSetupPose();
            }
        }, this);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, function (event) {
            switch (event.keyCode) {
                case cc.macro.KEY.space:
                    this.onSpinButtonPressed();
                    break;
                default:
                    break;
            }
        }, this);

    }

    onBoardChangeState(state: E_BOARD_STATE) {
        this._boardState = state;
        switch (state) {
            case E_BOARD_STATE.IDLE:
                this.btnSpinSke.setAnimation(0, Utils.enumToString(E_BTNSPIN_STATE, E_BTNSPIN_STATE.Idle), true);
                this.btnSpinSke.node.active = !this.btnAutoSpin.active;
                break;
            case E_BOARD_STATE.FINISH_SPINNING:
                if (this.btnSpinSke.node.active)
                    this.btnSpinSke.setAnimation(0, Utils.enumToString(E_BTNSPIN_STATE, E_BTNSPIN_STATE.Stop), false);
                break;
            case E_BOARD_STATE.SPINNING:
                this.btnSpinSke.setAnimation(0, Utils.enumToString(E_BTNSPIN_STATE, E_BTNSPIN_STATE.Spin), false);
                this.btnSpinSke.addAnimation(0, Utils.enumToString(E_BTNSPIN_STATE, E_BTNSPIN_STATE.Spin_wait), true);
                break;
            default:
                break;
        }
        // if (state == E_BOARD_STATE.IDLE) {
        //     this.btnSpinSke.addAnimation(0, Utils.enumToString(E_BTNSPIN_STATE, E_BTNSPIN_STATE.idle), true);
        // } else if (state == E_BOARD_STATE.FINISH_SPINNING) {
        //     if (this.btnSpinSke.node.active)
        //         this.btnSpinSke.addAnimation(0, Utils.enumToString(E_BTNSPIN_STATE, E_BTNSPIN_STATE.stop), false);
        // }

    }

    public onSpinButtonPressed() {
        cc.log("onSpinButtonPressed: " + E_BOARD_MODE[this._boardMode]);
        if (this._boardMode == E_BOARD_MODE.FREESPIN) return;
        if (this.popupState == E_POPUP_STATE.OPENED || this.node.active == false) return;

        if (this._boardState == E_BOARD_STATE.SPINNING) {
       
            clientEvent.dispatchEvent(EventName.OnSpinButtonPressedAgain);
        } else if (this._boardState == E_BOARD_STATE.IDLE || this._boardState == E_BOARD_STATE.IDLE_SHOW_SYMBOL_INFO) {
            clientEvent.dispatchEvent(EventName.OnSpinButtonPressed);
           
        }
    }

    public onAutoSpinButtonPressed() {
        if (this._boardMode == E_BOARD_MODE.FREESPIN || this.autoSpinDisabled) return;
        clientEvent.dispatchEvent(EventName.OnAutoSpinButtonPressed);
        this.btnAutoSpin.active = false;
        this.btnSpinSke.node.active = true;
    }
    OnStartAutoSpinPressed(numSpin) {
        this.updateStateAutoButton(numSpin)
        this.UpdateAutoSpinNumLb(numSpin);
    }
    updateStateAutoButton(numSpin){
        this.btnAutoSpin.active = numSpin > 0;
        this.btnSpinSke.node.active = !this.btnAutoSpin.active;
    }

    UpdateAutoSpinNumLb(numSpin) {
        let str1 = numSpin.toString();
        if (numSpin == Infinity){
            str1 = "∞";
            this.auto_spin_num.fontSize= 120;
            // this.auto_spin_num.node.y = 10;
        }else{
            this.auto_spin_num.fontSize= 100;
            // this.auto_spin_num.node.y = 0; 
        }
        this.auto_spin_num.string =  ( "" + str1);
        this.auto_spin_num.node.active = !(numSpin == Infinity);
        this.infinityNode.active = (numSpin == Infinity);
    }

    public onSkipButtonAnim() {
        this.btnSpinSke.setAnimation(0, Utils.enumToString(E_BTNSPIN_STATE, E_BTNSPIN_STATE.Stop2), false);
    }

    public onAutoSpinNumChange(num: number) {
        let str1 = num.toString();
        // if (num === Infinity){
        //     str1 = "∞";
        //     this.auto_spin_num.fontSize= 120;
        //     this.auto_spin_num.node.y = 10;
        // }else{
        //     this.auto_spin_num.fontSize= 100;
        //     this.auto_spin_num.node.y = 0; 
        // }
          
        this.auto_spin_num.string = (str1);
    }

    onBoardModeChange(data) {
        switch (data.mode) {
            case E_BOARD_MODE.FREESPIN:
                // this.btnAutoSpin.active = true;
                this._boardMode = data.mode;
                break;
            case E_BOARD_MODE.NORMAL:
                // if (this._boardMode == E_BOARD_MODE.FREESPIN)
                //     this.btnAutoSpin.active = false;
                this._boardMode = data.mode;
                break;
            default:
                break;
        }
    }
    
    onAutoSpinButtonChange(isEnabled) {
        this.autoSpinDisabled = isEnabled;
    }

    onPopupStateChange(state: E_POPUP_STATE) {
        this.popupState = state;
    }

  
}
