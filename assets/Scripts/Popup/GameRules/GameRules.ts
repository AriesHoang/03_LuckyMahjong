import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import { clientEvent } from "../../Core/observer/clientEvent";
import { Cfg } from "../../Manager/Config";
import { EventName } from "../../Manager/EventName";
import SoundController from "../../Manager/SoundController";
import TextController from "../../Manager/TextController";
import BasePopup, { E_POPUP_STATE } from "../../Stageloading/BasePopup";
import PayTable from "../PayTable/PayTable";
import Rule from "./Rule";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameRules extends BasePopup {

    static inst: GameRules = null;

    @property(cc.Node)
    bg: cc.Node = null;

    @property(cc.Prefab)
    payTableMenuPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    ruleMenuPrefab: cc.Prefab = null;

    @property(cc.Sprite)
    paytableButtonSprite: cc.Sprite = null;

    @property(cc.Sprite)
    rulesButtonSprite: cc.Sprite = null;

    @property(cc.Label)
    titleLabel: cc.Label = null;

    @property(cc.Label)
    versionLabel: cc.Label = null;

    @property(cc.SpriteAtlas)
    buttonAtlas: cc.SpriteAtlas = null;

    private onHideCallback: Function = null;
    private payTableMenu: PayTable = null;
    private ruleMenu: Rule = null;
    private index: number = 0;
    private _isRunningAnim: boolean = false;
    private isShowing: boolean = false;
    private isReady: boolean = false;

    onLoad() {

        let payTableMenuNode = cc.instantiate(this.payTableMenuPrefab);
        payTableMenuNode.parent = this.node;
        this.payTableMenu = payTableMenuNode.getComponent(PayTable);

        let ruleMenuNode = cc.instantiate(this.ruleMenuPrefab);
        ruleMenuNode.parent = this.node;
        this.ruleMenu = ruleMenuNode.getComponent(Rule);
    }


    start() {
        GameRules.inst = this;
        this.bg.height = this.node.height;
        this.bg.y = - this.node.height;
        this.bg.active = false;
        this.init();
        this.isReady = true;

        if (this.isShowing) this.showDefault();
    }

    update(dt) {

    }

    init() {

        this.titleLabel.string = this.titleLabel.string.toUpperCase();
        this.versionLabel.string = TextController.getRawText('GAME_VERSION').split("{0}").join(Cfg.gameVersionStr);
    }

    onShowPaytable() {
        if (this._isRunningAnim || this.index == 0) return;
        
        this.index = 0;
        this._isRunningAnim = true;
        Promise.all([
            this.payTableMenu.showPromise(),
            this.ruleMenu.hidePromise()])
            .then(() => {
                this._isRunningAnim = false;
            });
        this.changeTabColor();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxOpen);
    }

    onShowRules() {
        if (this._isRunningAnim || this.index == 1) return;
        this.index = 1;
        this._isRunningAnim = true;
        Promise.all([
            this.ruleMenu.showPromise(),
            this.payTableMenu.hidePromise()])
            .then(() => {
                this._isRunningAnim = false;
            });
        this.changeTabColor();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxOpen);

    }

    changeTabColor() {

        if (this.index == 0) {

            this.paytableButtonSprite.spriteFrame = this.buttonAtlas?.getSpriteFrame("button_select");
            this.rulesButtonSprite.spriteFrame = this.buttonAtlas?.getSpriteFrame("button_unselect");
        }
        else if (this.index == 1) {

            this.paytableButtonSprite.spriteFrame = this.buttonAtlas?.getSpriteFrame("button_unselect");
            this.rulesButtonSprite.spriteFrame = this.buttonAtlas?.getSpriteFrame("button_select");
        }
    }
    public show(data?: any): void {
        this.isShowing = true;
        if (!this.isReady) return;

        if (data)
            this.showDefault(data.onShowCB, data.onHideCB);
        else this.showDefault();
    }



    showDefault(onShowCB: Function = null, onHideCB: Function = null) {
        if (this._isRunningAnim) return;
        clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.OPENED);
        this.bg.active = true;
        this._isRunningAnim = true;
        let menu_prom: Promise<any>;
        if (this.index == 0) {

            menu_prom = this.payTableMenu.showPromise();
            this.changeTabColor();
        }
        else if (this.index == 1) {

            menu_prom = this.ruleMenu.showPromise();
            this.changeTabColor();
        }

        const move_prom = new Promise((resolve: Function) => {
            cc.tween(this.bg)
                .to(.5, { y: 0 }, { easing: 'cubicIn' })
                .call(() => {
                    resolve();
                })
                .start();
        });
        Promise.all([menu_prom, move_prom]).then(() => {
            this._isRunningAnim = false;
            if (onShowCB)
                onShowCB();
        });
        this.onHideCallback = onHideCB;
    }

    hide() {
        if (this._isRunningAnim) return;
        this._isRunningAnim = true;
        const move_prom = new Promise((resolve: Function) => {
            cc.tween(this.bg)
                .to(.5, { y: - this.node.height }, { easing: 'cubicOut' })
                .call(() => {
                    this.bg.active = false;
                    resolve();
                })
                .start();
        });
        Promise.all([move_prom, this.payTableMenu.hidePromise(), this.ruleMenu.hidePromise()])
            .then(() => {
                this._isRunningAnim = false;
            });

        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxClose);
        if (this.onHideCallback) {
            this.onHideCallback();
            this.onHideCallback = null;
        }
        clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.CLOSED);
    }
}
