
import CurrencyConverter from "../../Scripts/Common/CurrencyConverter";
import { clientEvent } from "../../Scripts/Core/observer/clientEvent";
import { Cfg, GameCertification } from "../../Scripts/Manager/Config";
import { EventName } from "../../Scripts/Manager/EventName";
const { ccclass, property } = cc._decorator;

@ccclass
export default class CertificationBar extends cc.Component {
    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Node)
    sessionNode: cc.Node = null;

    @property(cc.Label)
    netBalanceLabel: cc.Label = null;

    @property(cc.Node)
    gainLossIndicator: cc.Node = null;

    @property(cc.Node)
    bottomLayout: cc.Node = null;

    private _userNetBalance: number = 0;
    private get userNetBalance(): number { return this._userNetBalance; }
    private set userNetBalance(v: number) {
        this._userNetBalance = v;
        this.netBalanceLabel.string = CurrencyConverter.getCreditString(v, true);

        let isGain = (v >= 0) ? true : false;
        this.gainLossIndicator.color = isGain ? cc.Color.GREEN : cc.Color.RED;
        this.gainLossIndicator.angle = isGain ? 0 : 180;
    }
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.nameLabel.node.active = false;
        this.timeLabel.node.active = false;
        this.sessionNode.active = false;
    }

    start() {
        cc.game.addPersistRootNode(this.node);
    }

    // LIFE-CYCLE CALLBACKS:
    protected onEnable(): void {
        clientEvent.on(EventName.EnableUserNetBalance, this.enableNetBalance, this);
        clientEvent.on(EventName.UpdateUserNetBalance, this.updateUserNetBalance, this);
        clientEvent.on(EventName.UpdateGameNameConfig, this.init, this);
    }

    protected onDisable(): void {
        clientEvent.off(EventName.EnableUserNetBalance, this.enableNetBalance, this);
        clientEvent.off(EventName.UpdateUserNetBalance, this.updateUserNetBalance, this);
        clientEvent.off(EventName.UpdateGameNameConfig, this.init, this);
    }

    updateUserNetBalance(gain: number, bet: number) {
        this.userNetBalance = this.userNetBalance + (gain - bet);
    }

    init() {
        //game name
        this.bottomLayout.active = true;  
        this.nameLabel.node.active = GameCertification.show_game_name;
        if (GameCertification.show_game_name) {
            this.nameLabel.string = Cfg.gameName;
        }

        //game time
        this.timeLabel.node.active = GameCertification.show_clock;
        if (GameCertification.show_clock) {
            this.setLocalTime();
            // Update the local time every second
            this.timeLabel.schedule(this.setLocalTime.bind(this), 1.0, cc.macro.REPEAT_FOREVER);
        }

        if(!GameCertification.show_game_name && !GameCertification.show_clock && !GameCertification.show_net_balance)
            this.bottomLayout.active = GameCertification.show_game_name;  
    }

    enableNetBalance(){
        //user net balance
        this.sessionNode.active = GameCertification.show_net_balance;

        if(!GameCertification.show_game_name && !GameCertification.show_clock && !GameCertification.show_net_balance)
            this.bottomLayout.active = GameCertification.show_game_name;  
    }

    setLocalTime() {
        // Get the current local time
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleTimeString();
        this.timeLabel.string = formattedTime;
    }
}
