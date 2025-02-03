// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import StageLoadingFont from "../Common/Multilingual/StageLoadingFont";
import { clientEvent } from "../Core/observer/clientEvent";
import Utils from "../Utils/Utils";
import {Cfg, DEBUG_ENV_LIST, DEBUG_ENV_REGEX, envURL, supportedLanguage} from "./Config";
import { EventName } from "./EventName";
import RootData from "./RootData";
import TextController from "./TextController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AuthorizationController extends cc.Component {
    @property(TextController)
    textController: TextController = null;

    //font loading
    @property([cc.Node])
    deferredResNodes: cc.Node[] = [];


    protected onLoad(): void {
        RootData.instance.Initialize();

        
    }
    protected async start(){
        await this.fetchAuthConfig();
        this.checkConfig();
    }

    async fetchAuthConfig() {
        //override auth config with params return from url
        let urlVals = Utils.getUrlVars();
        if (urlVals["groupCode"]) {
            Cfg.groupCode = urlVals["groupCode"];
        }
        if (urlVals["brandCode"]) {
            Cfg.brandCode = urlVals["brandCode"];
        }
        if (urlVals["token"]) {
            Cfg.playerToken = urlVals["token"];
        }
        if (urlVals["gameCode"]) {
            Cfg.gameCode = urlVals["gameCode"];
        }
        if (urlVals["mode"]) {
            Cfg.playAsDemo = (urlVals["isFun"] === 'demo');
        }
        if (urlVals["isDafa"]) {
            Cfg.isDafa = urlVals["isDafa"] === 'true';
        }
        if (urlVals["currencyCode"]) {
            Cfg.currency = urlVals["currencyCode"];
        }
        if (urlVals["nativeId"]) {
            Cfg.nativeId = urlVals["nativeId"];
        }
        if (urlVals["language"]) {
            Cfg.language = urlVals["language"];
        }
        if (!supportedLanguage.includes(Cfg.language)) {
            Cfg.language = supportedLanguage[0];
        }
        if (urlVals["isDafa"]) {
            Cfg.isDafa = (urlVals["isDafa"] === 'true');
        }
        if (urlVals["redirectUrl"]) {
            Cfg.redirectURL = decodeURIComponent(urlVals["redirectUrl"]);
        } else {
            Cfg.redirectURL = null;
        }
        // this.textController.loadTextResources("en");

        //font loading
        this.deferLoadResources();
        const load_text_prom = this.textController.loadTextResources(Cfg.language);
        const load_font_prom = StageLoadingFont.loadFont(Cfg.language);
        return Promise.all([load_text_prom, load_font_prom]).then(() => {
            this.loadDeferredResources();
            clientEvent.dispatchEvent(EventName.loadedRes)
        });
    }

    //font loading
    deferLoadResources() {
        this.deferredResNodes.forEach((node) => {
            if (node) {
                node.active = false;
            }
        });
    }

    loadDeferredResources() {
        this.deferredResNodes.forEach((node) => {
            if (node) {
                if (Cfg.language === supportedLanguage[0] && node.name === "logo_text")
                    return;
                node.active = true;
            }
        });
    }

    private fetchData(url, callback): void {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onloadend = function () {
            if (this.readyState == 4 && this.status == 200) {
                callback(this.responseText);
            } else {
                callback(null);
            }
        };
        xmlhttp.onerror = (err) => {
            callback(null);
        };
        xmlhttp.ontimeout = (err) => {
            callback(null);
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }

    private checkConfig(): void {
        this.checkTokenAuthorize();
    }


    private checkTokenAuthorize(): void {
        if (DEBUG_ENV_LIST.includes(Cfg.baseEnvURL) || DEBUG_ENV_REGEX.test(Cfg.baseEnvURL)) {
            let urlVals = Utils.getUrlVars();
            if (urlVals["isDebug"]) {
                Cfg.isDebug = (urlVals["isDebug"] === 'true');
            }
        }
        this.doAuthorize();
        // if (Cfg.playAsDemo) {
        //     //change to use fun token
        //     let payload = {
        //         "gameId": Cfg.gameCode,
        //         "currency": Cfg.currency,
        //         "language":"",
        //         "returnUrl": "http://localhost:3000"
        //     };
        //     Utils.postHttp(
        //         Cfg.generateToken,
        //         payload,
        //         (err, response) => {
        //             if (err) {
        //                 const err_msg: string = Utils.getErrorMessage(err, Cfg.language);
        //                 clientEvent.dispatchEvent(EventName.Disconnect, { err_msg: err_msg });
        //                 return;
        //             }
        //
        //             cc.log("Cfg.generateToken: ", response);
        //             //change to use fun token
        //             if(response.length > 5)
        //                 Cfg.playerToken = response;
        //
        //             // const fun_data: any = JSON.parse(response);
        //             // if (fun_data["playerToken"]) {
        //             //     Cfg.playerToken = fun_data["playerToken"];
        //             // }
        //             // if (fun_data["groupCode"]) {
        //             //     Cfg.groupCode = fun_data["groupCode"];
        //             // }
        //             // if (fun_data["brandCode"]) {
        //             //     Cfg.brandCode = fun_data["brandCode"];
        //             // }
        //             // if (fun_data["gameCode"]) {
        //             //     Cfg.gameCode = fun_data["gameCode"];
        //             // }
        //             // if (fun_data["currencyCode"]) {
        //             //     Cfg.currency = fun_data["currencyCode"];
        //             // }
        //             // Utils.consoleLog("Change to use fun token " + Cfg.playerToken + " groupCode " + Cfg.groupCode + " brandCode " + Cfg.brandCode + " gameCode " + Cfg.gameCode + " currencyCode " + Cfg.currency);
        //             this.doAuthorize();
        //         }
        //     );
        // } else {
        //     this.doAuthorize();
        // }
    }
    private doAuthorize() {
        //authorize
        Utils.getHttp(
            Cfg.getCurrentBet,
            {},
            (err, response) => {
                if (err || Utils.isEmpty(response)) {
                    let err_msg: string = Utils.getErrorMessage(err, Cfg.language);
                    clientEvent.dispatchEvent(EventName.Disconnect, { err_msg: err_msg });
                    return;
                }

                cc.log("Cfg.getCurrentBet: ", response);
                const response_obj = JSON.parse(response);
                clientEvent.dispatchEvent(EventName.AuthorizationLoaded, response_obj);
                RootData.instance.playerData.LoadData(response_obj);
                RootData.instance.gamePlayData.LoadData(response_obj);

                clientEvent.dispatchEvent(EventName.ConfigLoaded, response_obj);
            },
            Cfg.playerToken
        )
    }
}
