// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../Core/observer/clientEvent";
import { EventName } from "../Manager/EventName";
import CharacterAinmationState from "./CharacterAinmationState";



const { ccclass, property } = cc._decorator;

@ccclass
export default class CharacterAinmationFreeState extends CharacterAinmationState {
    @property(sp.Skeleton)
    skeAnimFx: sp.Skeleton = null;

    protected onEnable(): void {
        clientEvent.on(EventName.OnWinTumble,this.OnHaveWinLine,this);
    }
    protected onDisable(): void {
        clientEvent.off(EventName.OnWinTumble,this.OnHaveWinLine,this);
    }
 
    public OnHaveWinLine() {
        return new Promise((resolve: Function) => {
            this.skeAnimFx.setAnimation(0, "fx_win", false);

            this.skeAnimFx.setCompleteListener((trackEntry) => {
                if (trackEntry['animation']['name'] == "fx_win") {
                    resolve();
                }
            });
        })
    }
    PlayAimIdle() {
        this.skeAnim.setAnimation(0, "idle", true);
    }

   

}
