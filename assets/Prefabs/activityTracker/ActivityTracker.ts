import { clientEvent } from "../../Scripts/Core/observer/clientEvent";
import { GameCertification } from "../../Scripts/Manager/Config";
import { EventName } from "../../Scripts/Manager/EventName";
import TextController from "../../Scripts/Manager/TextController";



const { ccclass, property } = cc._decorator;

@ccclass
export default class ActivityTracker extends cc.Component {
    // onLoad () {}

    @property(cc.Node)
    noticePopup: cc.Node = null;

    @property(cc.Label)
    popupHeaderLabel: cc.Label = null;

    @property(cc.Label)
    popupSubLabel: cc.Label = null;

    @property(cc.Label)
    okLabel: cc.Label = null;

    private _inactivityEventSetupped: boolean = false;
    private _inactivityEventEnabled: boolean = true;
    private _inactivityDuration: number = null;

    start() {
        this.node.zIndex = 101;
        clientEvent.on(EventName.UpdateRemoteConfig, this.updateInactivityDuration, this);
        clientEvent.on(EventName.EnableInactivityTracker, (() => {
            if (!this._inactivityEventSetupped)
                this.setupEventListeners();
            this.resetInactivityTimer();
        }), this);
        clientEvent.on(EventName.DisableInactivityTracker, this.disableInacivityTimer, this);

        // this.setupEventListeners();
        // this.resetInactivityTimer();

        cc.game.addPersistRootNode(this.node);
    }

    protected onDestroy(): void {
        clientEvent.off(EventName.UpdateRemoteConfig, this.updateInactivityDuration, this);
        clientEvent.off(EventName.EnableInactivityTracker, this.resetInactivityTimer, this);
        clientEvent.off(EventName.DisableInactivityTracker, this.disableInacivityTimer, this);

        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onUserInteraction, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.DEVICEMOTION, this.onUserInteraction, this);
    }

    setupEventListeners() {
        if (!GameCertification.show_inactivity_pop_up)
            return;
        this._inactivityEventSetupped = true;
        // keyboard events
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onUserInteraction, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onUserInteraction, this);

        // touch & mouse events on the window (the big background part)
        window.addEventListener('touchstart', this.onUserInteraction.bind(this));
        window.addEventListener('mousedown', this.onUserInteraction.bind(this));
        window.addEventListener('mousemove', this.onUserInteraction.bind(this));
        window.addEventListener('mousewheel', this.onUserInteraction.bind(this));

        // touch & mouse events on window (the part inside game canvas, which is on top of the window)
        cc.game.canvas.addEventListener('touchstart', this.onUserInteraction.bind(this));
        cc.game.canvas.addEventListener('mousedown', this.onUserInteraction.bind(this));
        cc.game.canvas.addEventListener('mousemove', this.onUserInteraction.bind(this));
        cc.game.canvas.addEventListener('mousewheel', this.onUserInteraction.bind(this));

        // Add more event listeners for other interactions (e.g., volume button, silent button)
    }

    onUserInteraction(event: cc.Event.EventTouch | cc.Event.EventMouse = null) {
        // Reset the inactivity timer
        if (this._inactivityEventEnabled)
            this.resetInactivityTimer();
    }

    disableInacivityTimer() {
        this._inactivityEventEnabled = false;
        this.unschedule(this.handleInactivity);
    }

    resetInactivityTimer() {
        this.unschedule(this.handleInactivity);

        if (GameCertification.show_inactivity_pop_up && this._inactivityDuration && this._inactivityDuration > 0) {
            this._inactivityEventEnabled = true;
            this.scheduleOnce(this.handleInactivity, this._inactivityDuration);
        }
    }

    handleInactivity() {
        if (!GameCertification.show_inactivity_pop_up)
            return;

        this.popupHeaderLabel.string = TextController.getRawText(this.popupHeaderLabel.string);
        this.popupSubLabel.string = TextController.getRawText(this.popupSubLabel.string);
        this.okLabel.string = TextController.getRawText(this.okLabel.string);

        cc.Tween.stopAllByTarget(this.noticePopup);
        this.noticePopup.opacity = 0;
        this.noticePopup.active = true;
        cc.tween(this.noticePopup)
            .to(0.2, { opacity: 255 })
            .start();
    }

    onReloadClick() {
        window.location.reload();
    }

    updateInactivityDuration(configJson: cc.JsonAsset) {
        if (!configJson) return;
        const duration = configJson['INACTIVITY_DURATION'] as number;
        if (duration) {
            this._inactivityDuration = duration;
            // this.resetInactivityTimer();
        }
    }
}
