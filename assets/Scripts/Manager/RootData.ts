// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GamePlayData from "../Data/GamePlayData";
import PlayerData from "../Data/PlayerData";
import { ILifecycleData } from "../Interface/ILifecycleData";


export default class RootData implements ILifecycleData {
    private static _instance: RootData;

    public playerData: PlayerData = new PlayerData();
    public gamePlayData: GamePlayData = new GamePlayData();
    private lifecycleObjects: ILifecycleData[] = [];
    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new RootData();
        return this._instance;
    }

    public Initialize(): void {
        let lifecycleObjects: ILifecycleData[] = [this.playerData, this.gamePlayData];

        for (var lifecycleObject of lifecycleObjects) {
            lifecycleObject.Initialize();
        }
        this.lifecycleObjects = lifecycleObjects;
    }

    public Activate(restore = true) {
        for (var lifecycleObject of this.lifecycleObjects) {
            lifecycleObject.Activate(restore);
        }
    }

    public Deactivate() {
        for (var lifecycleObject of this.lifecycleObjects) {
            lifecycleObject.Deactivate();
        }
    }

    public FindComponent<T>(constructor: Constructor<T>): T | null {
        const comps = this.lifecycleObjects;

        for (let i = 0; i < comps.length; ++i) {
            const comp = comps[i];
            if (comp instanceof constructor) {
                return comp;
            }
        }
        return null;
    }
    AddEntityData(data: ILifecycleData, isInitialize: boolean = true) {
        if (!data) return;

        this.lifecycleObjects.push(data);
        if (!isInitialize)
            data.Initialize();
    }


}
export declare type Constructor<T = unknown> = new (...args: any[]) => T;