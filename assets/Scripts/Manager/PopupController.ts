import { clientEvent } from "../Core/observer/clientEvent";
import NetworkNoticePopup from "../Popup/Network/NetworkNoticePopup";
import BasePopup from "../Stageloading/BasePopup";
import StageLoadingNode from "../Stageloading/StageLoadingNode";
import { EventName } from "./EventName";
import { Constructor } from "./RootData";
import CheatMenuController from "../Game/CheatMenuController";
import WinFreeSpinsPopup from "../Popup/WinFreeSpinPopup/WinFreeSpinsPopup";
import WalletBalance from "../Popup/WalletBalance/WalletBalance";
import BetOptions from "../Popup/BetOptions/BetOptions";
import AutoSpinOptions from "../Popup/AutoSpinOptions/AutoSpinOptions";
import PayTable from "../Popup/PayTable/PayTable";
import GameRules from "../Popup/GameRules/GameRules";
import BuyFeature from "../Popup/BuyFeature/BuyFeature";
import BigWin from "../Popup/BigWin/BigWin";
import FreespinOutro from "../Popup/FreespinOutro/FreespinOutro";
import QuitGamePopup from "../Popup/QuitGamePopup/QuitGamePopup";
import TrainsitionEffectDynamic from "../Popup/TrainsitionEffectDynamic";
import IntroMiniGame from "../Popup/IntroMiniGame/IntroMiniGame";
import WinFreespinsInFreespinModePopup from "../Popup/New Folder/WinFreespinsInFreespinModePopup";
import BetOptionsNew from "../Popup/BetOptions/BetOptionsNew";
import JackpotPopup from "../Popup/Jackpot/JackpotPopup";

export const AUTO_DISMISS_POPUP_DELAY: number = 10;

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupController extends cc.Component {
    public static instance: PopupController;

    @property(BasePopup)
    public Popups: BasePopup[] = [];
    @property(TrainsitionEffectDynamic)
    trainsition: TrainsitionEffectDynamic = null;

    dictionary: Map<Constructor, BasePopup> = new Map<Constructor, BasePopup>();
    stageLoadingNode: StageLoadingNode;
    keys: Map<Constructor, string> = new Map<Constructor, string>([
        [NetworkNoticePopup, "a"],
        [CheatMenuController, "CheatMenu"],
        [WinFreeSpinsPopup, "WinFreeSpinsPopup"],
        [WalletBalance, "WalletBalance"],
        [BetOptionsNew, "BetOptionsNew"],
        [History, "History"],
        [AutoSpinOptions, "AutoSpinOptions"],
        [GameRules, "GameRules"],
        [BuyFeature, "BuyFeature"],
        [BigWin, "BigWin"],
        [FreespinOutro, "FreespinOutro"],
        [QuitGamePopup, "QuitGamePopup"],
        [JackpotPopup, "JackpotPopup"],
        [WinFreespinsInFreespinModePopup, "WinFreespinsInFreespinModePopup"],
    ]);

    onEnable() {
        clientEvent.on(EventName.Disconnect, this.onDisconnect, this);
    }

    onDisable() {
        clientEvent.off(EventName.Disconnect, this.onDisconnect, this);
    }

    private onDisconnect(data): void {
        this.show(NetworkNoticePopup, data);
    }

    onLoad() {
        PopupController.instance = this;
        this.stageLoadingNode = this.getComponent(StageLoadingNode);
        cc.game.addPersistRootNode(this.node);

        this.initialize();
        this.stageLoadingNode.OnLoadPopupSuccessful.add(this.onLoadPopUpSuccessful.bind(this))
    }

    private initialize() {
        this.Popups.forEach(popup => {
            let className = cc.js.getClassName(popup);
            let Type = cc.js.getClassByName(className)
            this.dictionary.set(Type as Constructor, popup);
        });
    }
    public isActivePopup<T>(key: Constructor<T>): boolean {
        let popup = this.dictionary.get(key);
        if (popup)
            return popup.isActive();
        return null;
    }

    public show<T>(key: Constructor<T>, data: any = null) {
        let popup = this.dictionary.get(key)
        if (popup) {
            popup.show(data);
            return;
        }
        // clientEvent.dispatchEvent(EventName.EnableInactivityTracker);
        let name = this.keys.get(key);
        this.stageLoadingNode.show(name, data);
    }

    public showPr<T>(key: Constructor<T>, data: any = null): Promise<any> {
        let popup = this.dictionary.get(key)
        // clientEvent.dispatchEvent(EventName.EnableInactivityTracker);
        if (popup) {
            return popup.showPr(data);
        }
        let name = this.keys.get(key);
        return this.stageLoadingNode.showPr(name, data);
    }
    public hide<T>(key: Constructor<T>, data: any = null) {
        let popup = this.dictionary.get(key)
        if (popup) {
            popup.hide(data);
        }
    }

    public AddPrefab<T>(key: Constructor<T>, data: any = null) {
        let name = this.keys.get(key);
        this.stageLoadingNode.loadResource(name);
    }

    onLoadPopUpSuccessful(reference, popup) {
        this.dictionary.set(reference.component, popup)
    }

    showPrTrainsitionEffect(data: any = null): Promise<any> {
        return this.trainsition.showPr(data);
    }

    preloadAllAssetsStageLoading() {
        this.stageLoadingNode.preloadAllAssets();
    }

}
