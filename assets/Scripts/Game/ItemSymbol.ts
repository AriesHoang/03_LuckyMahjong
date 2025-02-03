import { E_SYMBOL, E_SYMBOL_Atlas, E_SYMBOL_TYPE, ItemConfig } from "./ItemConfig";
import Utils from "../Utils/Utils"
import SoundController from "../Manager/SoundController";
import { AudioPlayId } from "../Core/audio/AudioPlayId";
export enum E_ANIM_STATE {
    idle = 0,
    win,
    appear,
    collect
}

export type AnimConfig = {
    name: string,
    loop?: boolean
}

export type SymbolAnimConfig = {
    id: number,
    idle?: AnimConfig,
    appear?: AnimConfig,
    action?: AnimConfig[]
}

const SymbolList: SymbolAnimConfig[] = [
    /*L5:       */{ id: E_SYMBOL.L5, idle: null, appear: {name: "appear_L5", loop: true}, action: [{name:"win_L5", loop: false}]},
    /*L4:       */{ id: E_SYMBOL.L4, idle: null, appear: {name: "appear_L4", loop: true}, action: [{name:"win_L4", loop: false}]},
    /*L3:       */{ id: E_SYMBOL.L3, idle: null, appear: {name: "appear_L3", loop: true}, action: [{name:"win_L3", loop: false}]},
    /*L2:       */{ id: E_SYMBOL.L2, idle: null, appear: {name: "appear_L2", loop: true}, action: [{name:"win_L2", loop: false}]},
    /*L1:       */{ id: E_SYMBOL.L1, idle: null, appear: {name: "appear_L1", loop: true}, action: [{name:"win_L1", loop: false}]},
    /*H4:       */{ id: E_SYMBOL.H4, idle: null, appear: {name: "appear_H4", loop: true}, action: [{name:"win_H4", loop: false}]},
    /*H3:       */{ id: E_SYMBOL.H3, idle: null, appear: {name: "appear_H3", loop: true}, action: [{name:"win_H3", loop: false}]},
    /*H2:       */{ id: E_SYMBOL.H2, idle: null, appear: {name: "appear_H2", loop: true}, action: [{name:"win_H2", loop: false}]},
    /*H1:       */{ id: E_SYMBOL.H1, idle: null, appear: {name: "appear_H1", loop: false}, action: [{name: "win_H1", loop: false}]},
    /*SCATTER:       */{ id: E_SYMBOL.SCATTER, idle: {name: "idle_FS", loop: true}, appear: {name: "appear2_FS", loop: false}, action: [{name:"win_FS", loop: true}]},
    /*MULTIPLIER:*/{ id: E_SYMBOL.MULTIPLIER, idle: {name: "idle_multix2", loop: true}, appear: {name: "appear2_multix2", loop: false}, action: [{name:"win_multix2", loop: false}]}
]

const MultiAnimConfig: SymbolAnimConfig[] = [
    { id: E_SYMBOL.MULTIPLIER, idle: {name: "idle_multix2", loop: true}, appear: {name: "appear2_multix2", loop: false}, action: [{name:"win_multix2", loop: false}]},
    { id: E_SYMBOL.MULTIPLIER, idle: {name: "idle_multix3", loop: true}, appear: {name: "appear2_multix3", loop: false}, action: [{name:"win_multix3", loop: false}]},
    { id: E_SYMBOL.MULTIPLIER, idle: {name: "idle_multix4", loop: true}, appear: {name: "appear2_multix4", loop: false}, action: [{name:"win_multix4", loop: false}]},
    { id: E_SYMBOL.MULTIPLIER, idle: {name: "idle_multix5", loop: true}, appear: {name: "appear2_multix5", loop: false}, action: [{name:"win_multix5", loop: false}]},
    { id: E_SYMBOL.MULTIPLIER, idle: {name: "idle_multix6", loop: true}, appear: {name: "appear2_multix6", loop: false}, action: [{name:"win_multix6", loop: false}]},
    { id: E_SYMBOL.MULTIPLIER, idle: {name: "idle_multix7", loop: true}, appear: {name: "appear2_multix7", loop: false}, action: [{name:"win_multix7", loop: false}]},
    { id: E_SYMBOL.MULTIPLIER, idle: {name: "idle_multix8", loop: true}, appear: {name: "appear2_multix8", loop: false}, action: [{name:"win_multix8", loop: false}]},
    { id: E_SYMBOL.MULTIPLIER, idle: {name: "idle_multix9", loop: true}, appear: {name: "appear2_multix9", loop: false}, action: [{name:"win_multix9", loop: false}]},
    { id: E_SYMBOL.MULTIPLIER, idle: {name: "idle_multix10", loop: true}, appear: {name: "appear2_multix10", loop: false}, action: [{name:"win_multix10", loop: false}]},

]



const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemSymbol extends cc.Component {

    @property(sp.SkeletonData)
    specialAnim: sp.SkeletonData = null;

    @property(sp.SkeletonData)
    symbolAnim: sp.SkeletonData = null;
    
    // @property(sp.SkeletonData)
    // scatterAnim: sp.SkeletonData = null;
    //
    // @property(sp.SkeletonData)
    // lowpayAnim: sp.SkeletonData = null;

    @property(cc.SpriteAtlas)
    itemAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    itemBlurAtlas: cc.SpriteAtlas = null;

    @property(cc.Node)
    mainSkeleton: cc.Node = null;

    @property(sp.Skeleton)
    transitionSymbol: sp.Skeleton = null;


    protected _itemCfg: ItemConfig = null;

    ske: sp.Skeleton = null;
    hightlight_ske: sp.Skeleton = null;
    coinAmountLabel: cc.Label = null;
    static_image: cc.Sprite = null;
    isJackpotSymbol: boolean = false;

    protected _itemAnimConfig: SymbolAnimConfig = null;
    public get itemCfg(): ItemConfig {
        return this._itemCfg;
    }
    public set itemCfg(itemCfg: ItemConfig) {
        this._itemCfg = itemCfg;
        this._itemAnimConfig = (itemCfg.symbol - 1 >= 0 && itemCfg.symbol - 1 < SymbolList.length ? SymbolList[itemCfg.symbol - 1] : null);
    }
    protected static _itemPool: cc.NodePool = null;

    start() {

    }

    static create(prefab: cc.Prefab): ItemSymbol {
        if (!this._itemPool) {
            this._itemPool = new cc.NodePool();
        }
        let itemNode = this._itemPool.get();
        if (!itemNode) {
            itemNode = cc.instantiate(prefab);
        }
        let item = itemNode.getComponent(ItemSymbol);
        return item;
    }

    static clone(orgSymbol: ItemSymbol): ItemSymbol {
        if (!this._itemPool) {
            this._itemPool = new cc.NodePool();
        }
        let itemNode = this._itemPool.get();
        let item = itemNode?.getComponent(ItemSymbol);
        if (!item) {
            item = cc.instantiate(orgSymbol.node).getComponent(ItemSymbol);
        }
        return item;
    }

    remove() {
        //should be overriden
        cc.Tween.stopAllByTarget(this.node);
        ItemSymbol._itemPool.put(this.node);
    }


    public init(itemCfg: ItemConfig = null): void {
        // cc.log("initSymbol: ", itemCfg);
        this.ske = this.mainSkeleton.getComponent(sp.Skeleton);
        this.coinAmountLabel = this.node.getChildByName("coinAmountLabel").getComponent(cc.Label);
        this.static_image = this.node.getChildByName("static_image").getComponent(cc.Sprite);
        this.hightlight_ske = this.node.getChildByName("highlight_ske").getComponent(sp.Skeleton);
        this.transitionSymbol.node.active = false;
        this.isJackpotSymbol = false;

        if (itemCfg != null) {
            this.itemCfg = itemCfg;
        }
        this.initSkeletonData();
        this.setItemStaticImage();
        this.setItemState();

        this.customConfigItem();

    }

    customConfigItem() {
        this.static_image.node.y = 0;
        this.ske.node.y = 0;
        this.static_image.node.scale = 1;
        this.mainSkeleton.scale = 1;

        // switch (this.itemCfg.symbol) {
        //     case E_SYMBOL.SCATTER:
        //         this.static_image.node.scale = 0.9;
        //         this.mainSkeleton.scale = 0.9;
        //         break
        //     case E_SYMBOL.H3:
        //         break;
        // }
    }

    initSkeletonData() {
        this.coinAmountLabel.node.active = (this.itemCfg.type == E_SYMBOL_TYPE.MONEY_CREDIT_BLOCK);

        let ske_data: sp.SkeletonData;
        let skin_name: string = null;
        let cache_mode = sp.Skeleton.AnimationCacheMode.REALTIME;

        switch (this.itemCfg.symbol) {
            case E_SYMBOL.H1:
            case E_SYMBOL.H2:
            case E_SYMBOL.H3:
            case E_SYMBOL.H4:
            case E_SYMBOL.L1:
            case E_SYMBOL.L2:
            case E_SYMBOL.L3:
            case E_SYMBOL.L4:
            case E_SYMBOL.L5:
                ske_data = this.symbolAnim;
                break;
            case E_SYMBOL.SCATTER:
                ske_data = this.specialAnim;
                break;
            case E_SYMBOL.MULTIPLIER:
                ske_data = this.specialAnim;
                break;
            default:
                break;
        }
        if (!ske_data) return;
        this.ske.setAnimationCacheMode(cache_mode);
        if (this.ske.skeletonData != ske_data) {
            this.ske.skeletonData = ske_data;
        }
        if (skin_name) {
            this.ske.setSkin(skin_name);
        } else {
            this.ske.defaultSkin = null;
        }
        this.ske.setToSetupPose();
    }

    setItemState(state: E_ANIM_STATE = E_ANIM_STATE.idle) {
        let anim_cfg: AnimConfig;
        if (state == E_ANIM_STATE.idle) anim_cfg = this._itemAnimConfig.idle;
        else if (state == E_ANIM_STATE.win) anim_cfg = this._itemAnimConfig.action[0] ? this._itemAnimConfig.action[0] : null;

        if (state == E_ANIM_STATE.win) {
            this.hightlight_ske.node.active = true;
            this.hightlight_ske.setAnimation(0, "animation", false);
        } else {
            this.hightlight_ske.node.active = false;
        }

        if (anim_cfg && anim_cfg.name != undefined && anim_cfg.name != null) {
            this.ske.node.active = true;
            this.static_image.node.active = false;
            this.ske.setAnimation(0, anim_cfg.name, (anim_cfg.loop != undefined && anim_cfg.loop != null) ? anim_cfg.loop : false);
            this.ske.setCompleteListener((trackEntry) => {
                if (trackEntry['animation']['name'] == anim_cfg.name && state == E_ANIM_STATE.win) {
                    this.hightlight_ske.node.active = false;
                }
            });

        } else {
            //no need to use animation, use static image here
            this.ske.node.active = false;
            this.static_image.node.active = true;
            // this.setItemStaticImage();
        }
    }

    setItemStaticImage(isBlur: boolean = false) {

        let sf_name: string = this.itemCfg.symbol.toString();
        sf_name = E_SYMBOL_Atlas[sf_name];
        // if (isBlur) sf_name += "_blur"        

        if (this.itemCfg.symbol == E_SYMBOL.SCATTER) {
            // cc.log('Set Scatter static image');
        }else if(this._itemCfg.symbol == E_SYMBOL.MULTIPLIER){
            cc.log("setItemStaticImage: ", this._itemCfg)
            let valueMulti = this._itemCfg.value > 0 ? this._itemCfg.value : 2;
            sf_name += "_" + valueMulti;
            this._itemAnimConfig = MultiAnimConfig[valueMulti - 2];
        }

        this.static_image.spriteFrame = (isBlur ? this.itemBlurAtlas : this.itemAtlas)?.getSpriteFrame(sf_name);
    }

    playWaitScatterAnimPromise(): Promise<any> {
        return new Promise((resolve: Function) => {
            resolve();
            return;
        });
    }
    playItemAnimPromise(state: E_ANIM_STATE = E_ANIM_STATE.idle): Promise<any> {
        return new Promise((resolve: Function) => {
            let anim_cfg: AnimConfig;
            if (state == E_ANIM_STATE.idle) anim_cfg = this._itemAnimConfig.idle;
            else if (state == E_ANIM_STATE.win) {
                anim_cfg = this._itemAnimConfig?.action[0] ? this._itemAnimConfig.action[0] : null;
            }
            else if (state == E_ANIM_STATE.appear) {
                // if (this.itemCfg.symbol == E_SYMBOL.SCATTER) {
                //     anim_cfg = this._itemAnimConfig?.action[1] ? this._itemAnimConfig.action[1] : null;
                // } else {
                    anim_cfg = this._itemAnimConfig?.action[0] ? this._itemAnimConfig.action[0] : null;
                // }
            }
            else if (state == E_ANIM_STATE.collect) anim_cfg = this._itemAnimConfig?.action[0] ? this._itemAnimConfig.action[0] : null;

            if (state == E_ANIM_STATE.win) {
                this.scheduleOnce(() => {
                    this.hightlight_ske.node.active = true;
                    this.hightlight_ske.setAnimation(0, "animation", false);
                }, 0.2)


            } else {
                this.hightlight_ske.node.active = false;
            }
            if (anim_cfg && anim_cfg.name != undefined && anim_cfg.name != null) {
                this.ske.node.active = true;
                this.static_image.node.active = false;
                this.ske.setAnimation(0, anim_cfg.name, (anim_cfg.loop != undefined && anim_cfg.loop != null) ? anim_cfg.loop : false);
                this.ske.setCompleteListener((trackEntry) => {
                    if (trackEntry['animation']['name'] == anim_cfg.name) {
                        // if (state == E_ANIM_STATE.win) {
                        //     this.hightlight_ske.node.active = false;
                        // };
                        // resolve();
                    }
                });
                this.hightlight_ske.setCompleteListener((trackEntry) => {
                    if (trackEntry['animation']['name'] == "animation") {
                        // if (state == E_ANIM_STATE.win) {
                        //     this.hightlight_ske.node.active = false;
                        // };
                        resolve();
                    }
                });
            }
            else {
                //no need to use animation, use static image here
                this.ske.node.active = false;
                this.static_image.node.active = true;
                this.setItemStaticImage();

                resolve();
            }


        });
    }

    onAppearPromise(playWinAnim = false): Promise<any> {
        let prom_chain: Promise<any> = Promise.resolve();
        if(!playWinAnim) return prom_chain;

        if (this.itemCfg.symbol == E_SYMBOL.SCATTER) {
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxScatterAppear);
        } else if (this.itemCfg.symbol == E_SYMBOL.MULTIPLIER) {
            SoundController.inst.MainAudio.playAudio(AudioPlayId.sfx_WildExpand);
        } 
    
        if (this.itemCfg.symbol == E_SYMBOL.SCATTER || this.itemCfg.symbol == E_SYMBOL.MULTIPLIER) {
            prom_chain = prom_chain.then(() => {
                //dont wait for appear anim to resolve
                this.playItemAnimPromise(E_ANIM_STATE.appear).then(() => {
                    this.playItemAnimPromise(E_ANIM_STATE.idle);
                });
            });
        }
        return prom_chain;              
    }

    stopAnimWin() {
        this.setItemState(E_ANIM_STATE.idle);
    }

    disableBlur() {
        this.setBlur(false);
    }

    enableBlur() {
        this.setBlur(true);
    }

    setBlur(isBlur: boolean = true) {
        if ((this._itemCfg.symbol < 0 || this._itemCfg.symbol >= E_SYMBOL.SYMBOL_NUM) && this._itemCfg.symbol != -1) {
            return;
        }

        // cc.log("setBlur: ", this._itemCfg);
        this.stopAnimWin();
        let static_image = this.node.getChildByName("static_image");
        static_image.active = true;
        if (this._itemCfg.symbol != -1) {
            this.setItemStaticImage(isBlur);
        }
        this.mainSkeleton.active = false;
    }

    showAnimWin() {
        this.setItemState(E_ANIM_STATE.win);
    }

    // showAnimWinFreeSpin() {
    //     if (this._itemAnimConfig.id != E_SYMBOL.WILD) {
    //         this.showAnimWin();
    //         return;
    //     };

    //     this.ske.node.active = true;

    //     let anim_cfg1 = this._itemAnimConfig.action[1];
    //     let anim_cfg2 = this._itemAnimConfig.action[2];

    //     this.ske.setAnimation(0, anim_cfg1.name, anim_cfg1.loop);
    //     this.ske.setCompleteListener((trackEntry) => {
    //         if (trackEntry['animation']['name'] == anim_cfg1.name) {
    //             this.ske.setAnimation(0, anim_cfg2.name, anim_cfg2.loop);
    //         }
    //     })
    // }

    public getSizeItem(): cc.Vec2 {
        return cc.v2(this.node.width, this.node.height)
    }

    public GetPosition() {
        return this.node.position;
    }

    // changeToJackpotItemPromise(animationChange: boolean = false): Promise<any> {
    //     return new Promise((resolve: Function) => {
    //         // SoundController.inst.MainAudio.playAudio(AudioPlayId.SFX_JackpotSymbolChange)
    //         this.transitionSymbol.node.active = true;
    //         this.transitionSymbol.setAnimation(0, "animation", false);
    //         this.transitionSymbol.setEventListener((trackEntry, event) => {
    //             if (trackEntry['animation']['name'] == 'animation') {
    //                 if (event.data.name == "transition") {
    //                     this.isJackpotSymbol = true;
    //                     this.setItemStaticImage();
    //                 }
    //             }
    //         });
    //         this.transitionSymbol.setCompleteListener((trackEntry) => {
    //             if (trackEntry['animation']['name'] == "animation") {
    //                 this.transitionSymbol.node.active = false;
    //                 // this.ske.skeletonData = this.scatterAnim;
    //                 this.static_image.node.active = false;
    //                 this.ske.node.active = true;
    //                 // this.ske.setAnimation(0, "jackpot", false);
    //                 this.ske.setAnimation(0, "jackpot_win", false);
    //                 this.ske.setCompleteListener((trackEntry2) => {
    //                     if (trackEntry2['animation']['name'] == "jackpot_win") {
    //                         resolve();
    //                     }
    //                 });
    //             }
    //         });
    //     });
    // }
}
