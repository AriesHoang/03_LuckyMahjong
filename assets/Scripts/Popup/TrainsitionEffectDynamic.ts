// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import BasePopup from "../Stageloading/BasePopup";
import SoundController from "../Manager/SoundController";
import { AudioPlayId } from "../Core/audio/AudioPlayId";
const { ccclass, property } = cc._decorator;

@ccclass
export default class TrainsitionEffectDynamic extends BasePopup {

    @property(sp.Skeleton)
    ske: sp.Skeleton = null;

    protected onEnable(): void {
        
    }
    protected onDisable(): void {
        
    }

    public showPr(data?: any): Promise<any> {
        return new Promise((resolve: Function) => {
            super.show();
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxTransitionBlueSmoke);
            this.ske.setAnimation(0, "light", false)

            setTimeout(()=>{
                if(data?.callFunc)
                    data.callFunc();
                resolve();
            }, 1000)

            // this.ske.setEventListener((trackEntry, event) => {
            //     if (trackEntry['animation']['name'] == 'light') {
            //         if (event.data.name == "chuyen") {
                        
            //         }
            //     }
            // });
        })




    }


}
