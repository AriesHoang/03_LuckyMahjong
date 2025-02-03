// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import CheatMenuController from "../Game/CheatMenuController";
import SoundController from "../Manager/SoundController";
import { AudioPlayId } from "../Core/audio/AudioPlayId";
import AutoSpinOptions from "../Popup/AutoSpinOptions/AutoSpinOptions";
import RootData from "../Manager/RootData";
import GameRules from "../Popup/GameRules/GameRules";
// import BuyFeature from "../Popup/BuyFeature/BuyFeature";
import QuitGamePopup from "../Popup/QuitGamePopup/QuitGamePopup";
import WalletBalance from "../Popup/WalletBalance/WalletBalance";
import BetOptionsNew from "../Popup/BetOptions/BetOptionsNew";
import PopupController from "../Manager/PopupController";
import ExtraButton from "../../Prefabs/menu/script/ExtraButton";
import { GameCertification, GameConfig } from "../Manager/Config";
import GamePlayData from "../Data/GamePlayData";
import BuyFeature from "../Popup/BuyFeature/BuyFeature";
import Utils from "../Utils/Utils";

const { ccclass, property } = cc._decorator;

const ANTE_DISABLE_COLOR = new cc.Color(179, 126, 109, 255);
const ANTE_ENABLE_COLOR = new cc.Color(255, 255, 28, 255);

@ccclass
export default class MenuButtons extends cc.Component {
    @property(cc.Node)
    defaultBtns: cc.Node = null;

    @property(cc.Node)
    extraButtons: cc.Node = null;

    @property(cc.Node)
    spinBtn: cc.Node = null;

    @property(cc.Node)
    soundOnNode: cc.Node = null;

    @property(cc.Node)
    soundOffNode: cc.Node = null;

    @property(cc.Button)
    settingsBtn: cc.Button = null;

    @property(cc.Button)
    plusBtn: cc.Button = null;

    @property(cc.Button)
    minusBtn: cc.Button = null;

    @property(cc.Node)
    turboBtn: cc.Node = null;

    @property(cc.Node)
    blackOverlay: cc.Node = null;

    @property(cc.Node)
    anteBetBtn: cc.Node = null;

    @property(cc.Button)
    buyFeatureBtn: cc.Button = null;

    @property(cc.Label)
    lblAnteValue: cc.Label = null;

    @property(cc.Label)
    lblBuyFeatureValue: cc.Label = null;


    private _isButtonsHidden: boolean = false;


    public set isButtonHidden(v: boolean) {
        this._isButtonsHidden = v;
        this.updateButtonsLayout();
    }

    private _isDefaultLayout: boolean = true;

    public get isDefaultLayout(): boolean {
        return this._isDefaultLayout;
    }
    public set isDefaultLayout(v: boolean) {
        this._isDefaultLayout = v;
        this.updateButtonsLayout();
    }
    private activePosY: number;
    private isTurboOn = false;

    protected onEnable(): void {
        clientEvent.on(EventName.BoardModeChange, this.onBoardModeChange, this);
        clientEvent.on(EventName.BetAmountChanged, this.updateBetPlusAndMinusButton, this);
        //------ PLAYER INBOX ----------//
        clientEvent.on(EventName.SwitchToDefaultSettingsButton, this.switchToDefaultLayout, this);
        clientEvent.on(EventName.OnSpinButtonPressed, this.hideExtraButtons, this);
        // clientEvent.on(EventName.hideExtraButton, this.hideExtraButtons, this);
        cc.game.on("hideExtraButton", this.hideExtraButtons, this);


    }
    protected onDisable(): void {
        clientEvent.off(EventName.BoardModeChange, this.onBoardModeChange, this);
        clientEvent.off(EventName.BetAmountChanged, this.updateBetPlusAndMinusButton, this);
        //------ PLAYER INBOX ----------//
        clientEvent.off(EventName.SwitchToDefaultSettingsButton, this.switchToDefaultLayout, this);
        clientEvent.on(EventName.OnSpinButtonPressed, this.hideExtraButtons, this);
        // clientEvent.off(EventName.hideExtraButton, this.hideExtraButtons, this);
        cc.game.off("hideExtraButton", this.hideExtraButtons, this);

    }

    switchToDefaultLayout() {
        if (!this.isDefaultLayout) {
            this.isDefaultLayout = !this.isDefaultLayout;
            this.switchLayout();
        }
    }

    onBoardModeChange() {
        if (this.isDefaultLayout) return;
        this.isDefaultLayout = true;
        // this.switchLayout();
        if (this.isDefaultLayout)
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxClose);
        else
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxOpen);

        
    }

    start() {
        PopupController.instance.AddPrefab(WalletBalance);
        PopupController.instance.AddPrefab(BetOptionsNew);
        PopupController.instance.preloadAllAssetsStageLoading();

        this.updateButtonsLayout();
        this.activePosY = this.defaultBtns.getPosition().y;
        // PopupController.instance.AddPrefab(AutoSpinOptions);

        this.UpdateStateForButtons();
        this.updateTurboButtonLayout();

        this.hideExtraButtons();
        this.extraButtons.active = false;
        this.blackOverlay.active = false;

        this.extraButtons.getComponent(ExtraButton).checkNodeReset();
    }
    UpdateStateForButtons() {
        this.soundOnNode.active = SoundController.inst.isSoundOn;
        this.soundOffNode.active = !SoundController.inst.isSoundOn;

        this.settingsBtn.node.getChildByName("mute_icon").active = !SoundController.inst.isSoundOn;
        this.updateBetPlusAndMinusButton();
    }

    updateBetPlusAndMinusButton() {
        if (RootData.instance.gamePlayData.isMaxBetAmount()) {
            this.plusBtn.interactable = false;
            this.minusBtn.interactable = true;
            this.plusBtn.node.opacity = 100;
            this.minusBtn.node.opacity = 255;
        }
        else if (RootData.instance.gamePlayData.isMinBetAmount()) {
            this.plusBtn.interactable = true;
            this.minusBtn.interactable = false;
            this.plusBtn.node.opacity = 255;
            this.minusBtn.node.opacity = 100;
        }
        else {
            this.minusBtn.interactable = true;
            this.plusBtn.interactable = true;
            this.plusBtn.node.opacity = 255;
            this.minusBtn.node.opacity = 255;
        }
        this.updateBuyFeatureValue();
    }

    onSettingsBtnClicked() {
        // if (PopupController.instance.popupState == E_POPUP_STATE.OPENED) return;
        this.isDefaultLayout = !this.isDefaultLayout;
        this.switchLayout();
        if (this.isDefaultLayout)
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxClose);
        else
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxOpen);
    }

    onAnimComplete() {

    }

    hideExtraButtons() {
        // PopupController.instance.isMenuOpen = false;
        let popupShowing = this.extraButtons.getComponent(ExtraButton).popupDisplayed;

        if (popupShowing && !this.extraButtons.getComponent(ExtraButton).animationTriggered) {
            this.extraButtons.getComponent(cc.Animation).play('disappear');
            // clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.CLOSED);
            this.blackOverlay.active = false;
            this.isDefaultLayout = true;
        }
        // this.extraButtons.scaleY = 0;
    }

    switchLayout() {
        this.defaultBtns.stopAllActions();
        this.extraButtons.stopAllActions();

        this.extraButtons.getComponent(ExtraButton).checkNodeReset();

        let appearAnimation = this.extraButtons.getComponent(cc.Animation);
        let popupShowing = this.extraButtons.getComponent(ExtraButton).popupDisplayed;


        if (!this.extraButtons.getComponent(ExtraButton).animationTriggered) {
            // PopupController.instance.isMenuOpen = !popupShowing;
            this.blackOverlay.active = !popupShowing;

            if (popupShowing) {
                appearAnimation.play("disappear");

                // clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.CLOSED);
            }
            else
                appearAnimation.play("appear");
        }
    }

    updateButtonsLayout() {
        if (this._isButtonsHidden) {
            this.defaultBtns.active = false;
            this.extraButtons.active = true;
            this.hideExtraButtons();
        } else {
            this.defaultBtns.active = true
            this.extraButtons.active = true;
            // this.extraButtons.scaleY = 0;
        }

        this.settingsBtn.node.getChildByName("mute_icon").active = !SoundController.inst.isSoundOn;

    }

    increaseBetAmount() {
        this.changeBetAmount(1);
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    decreaseBetAmount() {
        this.changeBetAmount(-1);
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    changeBetAmount(v: number) {
        RootData.instance.gamePlayData.changeBetAmount(v);
        // this.updateBetPlusAndMinusButton();

    }



    private onSpinButtonPressed() {
        clientEvent.dispatchEvent(EventName.OnSpinButtonPressed);
    }



    private onCheatMenuClick() {
        // PopupController.instance.show(CheatMenuController);
        if (PopupController.instance.isActivePopup(CheatMenuController) == null) {
            PopupController.instance.show(CheatMenuController);
            return;
        }
        if (PopupController.instance.isActivePopup(CheatMenuController))
            PopupController.instance.hide(CheatMenuController);
        else
            PopupController.instance.show(CheatMenuController);
    }

    onClickShowHistory() {
        PopupController.instance.show(History);
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    showAutoSpinOptions() {
        PopupController.instance.show(AutoSpinOptions);
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    onClickShowGameRules() {
        PopupController.instance.show(GameRules);
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    toggleSound() {
        SoundController.inst.toggleSoundSettings();
        let is_sound_on = SoundController.inst.isSoundOn;
        if (is_sound_on && !SoundController.inst.MainAudio.isMusicPlaying()) {
            //restart bgm
            SoundController.inst.MainAudio.resumeMusic();
            SoundController.inst.MainAudio.resumeSFXAmbience();
        }
        this.soundOnNode.active = is_sound_on;
        this.soundOffNode.active = !is_sound_on;
        this.settingsBtn.node.getChildByName("mute_icon").active = !is_sound_on;
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

    onClickShowBuyFeature(event, dataCustomEvent) {
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxBuyFeatureSelectBtn);
        PopupController.instance.showPr(BuyFeature, dataCustomEvent);
    }

    onToggleAnteBet() {
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfx_SwitchAnte);
       
        RootData.instance.gamePlayData.isAnteBet = !RootData.instance.gamePlayData.isAnteBet;

        let isEnable = RootData.instance.gamePlayData.isAnteBet;
        
        let animAnteBet = this.anteBetBtn.getChildByName("button_bet").getComponent(sp.Skeleton);
        if(isEnable){
            animAnteBet.setAnimation(0, "turn_on", false);
            animAnteBet.addAnimation(0, "idle_turn_on", true);
        }else {
            animAnteBet.setAnimation(0, "turn_off", false);
            animAnteBet.addAnimation(0, "idle_turn_off", true);
        }
        this.anteBetBtn.getChildByName("off_image").active = !isEnable;
        this.anteBetBtn.getChildByName("on_image").active = isEnable;

        this.updateBuyFeatureValue();
        

        clientEvent.dispatchEvent(EventName.BetAmountChanged);
        clientEvent.dispatchEvent(EventName.OnAnteBetButtonPressed);
    }
    updateBuyFeatureValue() {
        this.buyFeatureBtn.interactable = !RootData.instance.gamePlayData.isAnteBet;
        this.buyFeatureBtn.node.opacity = (RootData.instance.gamePlayData.isAnteBet ? 150 : 255);

        this.lblAnteValue.string = Utils.MixCurrecyStr(RootData.instance.gamePlayData.getCurBet());
        this.lblBuyFeatureValue.string = Utils.MixCurrecyStr(RootData.instance.gamePlayData.getCurBetNormal() * GameConfig.rateBuyFeature)
    }


    onTurboButtonPressed() {
        this.isTurboOn = !this.isTurboOn;
        this.updateTurboButtonLayout();
        clientEvent.dispatchEvent(EventName.OnTurboChanged, this.isTurboOn)
        if (this.isTurboOn)
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
        else
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxClose);
    }

    updateTurboButtonLayout() {
        this.turboBtn.getChildByName('on').active = this.isTurboOn;
        this.turboBtn.getChildByName('off').active = !this.isTurboOn;

        this.turboBtn.active = GameCertification.show_turbo_feature;
    }

    onShowQuitGamePopupPressed() {
        PopupController.instance.show(QuitGamePopup);
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
    }

}