// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import SoundController from "../Manager/SoundController";
import { AudioPlayId } from "../Core/audio/AudioPlayId";
import Utils from "../Utils/Utils";
import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import InfoBarController from "./InfoBarController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiplierDefault extends cc.Component {

    @property(cc.Label)
    multiplierLb: cc.Label = null;

   
    protected onEnable(): void {
        // this.multiplierLabel.string = "";        
    }

    reset(data){
        this.multiplierLb.string = data[0]; 
    }

    protected onDisable(): void {
        // this.multiplierLabel.string = "";
       
    }

  

}
