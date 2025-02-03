export enum E_POPUP_STATE {
    OPENED,
    CLOSED
}
import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BasePopup extends cc.Component {

    protected onEnable(): void {
        clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.OPENED);
    }

    protected onDisable(): void {
        clientEvent.dispatchEvent(EventName.PopupOpenClose, E_POPUP_STATE.CLOSED);    
    }

    public show(data = null): void {
        this.node.active = true;
    }

    public showPr(data = null): Promise<any> {
        return new Promise((resolve: Function) => {
            this.node.active = true;
            resolve();
        })
    }

    public hide(data = null): void {
        this.node.active = false;
    }

    public isActive(): boolean{
        return this.node.active;
    }
}
