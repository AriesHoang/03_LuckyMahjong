import {E_JACKPOT_TYPE} from "../../Data/GamePlayData";
import SoundController from "../../Manager/SoundController";
import {AudioPlayId} from "../../Core/audio/AudioPlayId";

const { ccclass, property } = cc._decorator;

//0 MINI
//1 MAJOR
//2 MINOR
//3 GRAND

type AnimConfig = {
    name: string,
    loop?: boolean
}

type JackpotSymbolAnimConfig = {
    id: number,
    skin: string,
    anim?: AnimConfig[]
}


const SymbolList: JackpotSymbolAnimConfig[] = [
    /*HIDDEN    */{ id: E_JACKPOT_TYPE.HIDDEN, skin: "default", anim: [{name: "open"}, {name: "loop"}]},
    /*MINI:     */{ id: E_JACKPOT_TYPE.MINI, skin: "mini", anim: [{name: "open"}, {name: "loop"}]},
    /*MAJOR:    */{ id: E_JACKPOT_TYPE.MAJOR, skin: "major", anim: [{name: "open"}, {name: "loop"}]},
    /*MINOR:    */{ id: E_JACKPOT_TYPE.MINOR, skin: "minor", anim: [{name: "open"}, {name: "loop"}]},
    /*GRAND:    */{ id: E_JACKPOT_TYPE.GRAND, skin: "grand", anim: [{name: "open"}, {name: "loop"}]},
]

export enum E_JACKPOT_SYMBOL_STATE {
    idle = 0,
    hover_in,
    hover_out,
    click,
    flip,
    jackpot_highlight
}

@ccclass
export default class JackpotItem extends cc.Component {
    @property(sp.Skeleton)
    anim_ske: sp.Skeleton = null;

    @property(cc.Node)
    sprBox: cc.Node = null;

    @property([sp.SkeletonData])
    arrAnim_ske: sp.SkeletonData[] = [];

    @property(sp.Skeleton)
    win_ske: sp.Skeleton = null;

    protected static _itemPool: cc.NodePool = null;
    public static get itemPool(): cc.NodePool {
        return this._itemPool;
    }
    private _itemAnimConfig: JackpotSymbolAnimConfig = null;
    private _itemID: number = null;
    public get itemID(): number {
        return this._itemID;
    }
    public set itemID(id: number) {
        this._itemID = id;
        this._itemAnimConfig = SymbolList.find(x => (x.id == id));
        cc.log(this._itemID + " - itemID: ",this._itemAnimConfig);
    }
    private _state: E_JACKPOT_SYMBOL_STATE = E_JACKPOT_SYMBOL_STATE.idle;
    public get state(): E_JACKPOT_SYMBOL_STATE { return this._state; }
    
    start() {
        
    }

    static create(id: number, prefab: cc.Prefab): JackpotItem {
        if (!JackpotItem._itemPool) {
            JackpotItem._itemPool = new cc.NodePool();
        }
        let itemNode = JackpotItem._itemPool.get();
        if (!itemNode) {
            itemNode = cc.instantiate(prefab);
        }
        let item = itemNode.getComponent(JackpotItem);
        item.init(id);
        return item;
    }

    init(id: number = null) {
        if (id != null) {
            this.itemID = id;
        }
        this.initAnim();
    }

    initAnim() {
        this.anim_ske.node.active = false;
        this.sprBox.active = true;
        this.win_ske.node.active = false;
        this.node.getChildByName("winSke").active = false;
        this.anim_ske.setToSetupPose();
    }

    playAnimPromise(state: E_JACKPOT_SYMBOL_STATE, type: E_JACKPOT_TYPE = null): Promise<any> {
        return new Promise( (resolve: Function) => {
            cc.log("playAnimPromise: ", this._itemAnimConfig);
            this._state = state;
            this.anim_ske.setSkin(this._itemAnimConfig.skin);
            this.anim_ske.defaultSkin = this._itemAnimConfig.skin;
            this.anim_ske.setToSetupPose();


            if (state == E_JACKPOT_SYMBOL_STATE.flip) {
                this._itemAnimConfig = SymbolList.find(x => (x.id == type));
                setTimeout(()=>{
                    SoundController.inst.MainAudio.playAudio(AudioPlayId.sfx_PickJackpot);
                    if(type == E_JACKPOT_TYPE.GRAND){
                        // SoundController.inst.MainAudio.playAudio(AudioPlayId.SFX_JackpotPick_Grand);
                    }else if(type == E_JACKPOT_TYPE.MAJOR){
                        // SoundController.inst.MainAudio.playAudio(AudioPlayId.SFX_JackpotPick_Major);
                    }else if(type == E_JACKPOT_TYPE.MINOR){
                        // SoundController.inst.MainAudio.playAudio(AudioPlayId.SFX_JackpotPick_Minor);
                    }else if(type == E_JACKPOT_TYPE.MINI){
                        // SoundController.inst.MainAudio.playAudio(AudioPlayId.SFX_JackpotPick_Mini);
                    }
                }, 120)

                this.sprBox.active = false;
                this.anim_ske.node.active = true;
                
                this.anim_ske.setAnimation(0, this._itemAnimConfig.anim[0].name, false);
                this.anim_ske.addAnimation(0, this._itemAnimConfig.anim[1].name, true);
                this.anim_ske.setCompleteListener((trackEntry) => {
                    if (trackEntry['animation']['name'] == this._itemAnimConfig.anim[0].name) {
                        this.scheduleOnce(() => {
                            resolve();
                        }, .15);
                    }
                });
            }else if(state == E_JACKPOT_SYMBOL_STATE.jackpot_highlight){
                this.scheduleOnce(() => {
                    this.win_ske.node.active = true;
                    this.win_ske.setAnimation(0,"win1x1", true);
                    this.win_ske.setCompleteListener((trackEntry) => {
                            if (trackEntry['animation']['name'] == "win1x1") {
                                resolve();
                            }
                        });
                }, .1);

                // this.transition_ske.skeletonData = this.arrAnim_ske[1];
                // this.transition_ske.setAnimation(0, "animation", true);
                // this.transition_ske.setCompleteListener((trackEntry) => {
                //     if (trackEntry['animation']['name'] == "animation") {
                //         this.scheduleOnce(() => {
                //             resolve();
                //         }, 1);
                //     }
                // });
            }else{
                resolve();
            }
        });
    }

    setItemAnim(state: E_JACKPOT_SYMBOL_STATE = E_JACKPOT_SYMBOL_STATE.idle) {
        // cc.log("setItemAnim: " + state);
        if (state == E_JACKPOT_SYMBOL_STATE.idle) {
            this.anim_ske.node.active = false;
            this.sprBox.active = true;
            // this.transition_ske.node.active = true;
            // this.transition_ske.setToSetupPose();
            // this.transition_ske.skeletonData = this.arrAnim_ske[0];

        }
    }

    remove() {
        cc.Tween.stopAllByTarget(this.node); 
        this.node.off(cc.Node.EventType.MOUSE_ENTER);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE);
        JackpotItem._itemPool.put(this.node);
    }

    disableHoverHandler() {
        this.node.off(cc.Node.EventType.MOUSE_ENTER);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE);
    }
}
