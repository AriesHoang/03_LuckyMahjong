// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../Core/observer/clientEvent";
import Utils from "../Utils/Utils";
import { EventName } from "./EventName";
import { GameConstant } from "./GameConstant";
import TextController from "./TextController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SocketClient extends cc.Component {

    private _hostURL: string = null;
    private _webSocket: WebSocket = null;
    private _webSocketForPlayerInbox: WebSocket = null;
    // LIFE-CYCLE CALLBACKS:
    protected onLoad(): void {
        cc.game.addPersistRootNode(this.node);
    }

    onEnable() {
        clientEvent.on(EventName.AuthorizationLoaded, this.OnAuthorizationLoaded, this);
    }

    onDisable() {
        clientEvent.off(EventName.AuthorizationLoaded, this.OnAuthorizationLoaded, this);
    }

    private OnAuthorizationLoaded(data): void {
        this.init(data.inAppToken.webPubSub.url)
        this.initPlayerInbox(data.dispatcherWss?.url)
    }

    init(hostURL: string) {
        this._hostURL = hostURL;
        this._webSocket = new WebSocket(this._hostURL);
        this._webSocket.onopen = function (event) {
            Utils.consoleLog("Opened WebSocket " + this.url);
        };
        this._webSocket.onmessage = (event) => {
            Utils.consoleLog("WebSocket message: " + event.data);
            const mess_id = JSON.parse(event.data).message as string;
            if (mess_id == "wa.notice.notifyGameDisabled") {
                const current_scene = cc.director.getScene();
                if (current_scene.name == GameConstant.SCENE.GAME_SCENE) {
                    //show disconnect popup
                    const message_str: string = TextController.getRawText(mess_id).split("{0}").join(TextController.getRawText("GAME_TITLE"));
                    clientEvent.dispatchEvent(EventName.Disconnect, { err_msg: message_str });
                }
            }
        };
        this._webSocket.onerror = function (event) {
            Utils.consoleLog("WebSocket error");
        };
        this._webSocket.onclose = function (event) {
            Utils.consoleLog("WebSocket closed");
        };
    }

    //------ PLAYER INBOX ----------//
    initPlayerInbox(hostURL: string) {
        if(!hostURL) return;
        this._webSocketForPlayerInbox = new WebSocket(hostURL);
        this._webSocketForPlayerInbox.onopen = function (event) {
            Utils.consoleLog("Opened WebSocket " + this.url);
        };
        this._webSocketForPlayerInbox.onmessage = (event) => {
            Utils.consoleLog("WebSocket message: " + event.data);
            clientEvent.dispatchEvent(EventName.OnGetPlayerInboxSocketData, JSON.parse(event.data));
           
        };
        this._webSocketForPlayerInbox.onerror = function (event) {
            Utils.consoleLog("WebSocket error");
        };
        this._webSocketForPlayerInbox.onclose = function (event) {
            Utils.consoleLog("WebSocket closed");
        };
    }
}
