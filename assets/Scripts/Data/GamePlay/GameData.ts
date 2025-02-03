// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { ILifecycleData } from "../../Interface/ILifecycleData";
import RootData from "../../Manager/RootData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameData implements ILifecycleData {
    constructor() {
    }

    Initialize(): void {

    }

    Activate(restore: boolean): void {

    }

    Deactivate(): void {

    }

}
