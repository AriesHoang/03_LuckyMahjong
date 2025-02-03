
import { E_SYMBOL, E_SYMBOL_Atlas, ItemConfig } from "./ItemConfig";
import ItemSymbol, { AnimConfig, E_ANIM_STATE } from "./ItemSymbol";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemBigSymbol extends ItemSymbol {
    protected static _itemPool: cc.NodePool = null;

    public numItemConfigs: number = 0

    setNumItemConfigs(nums) {
        this.numItemConfigs = nums;
    }

    static create(prefab: cc.Prefab): ItemBigSymbol {
        if (!this._itemPool) {
            this._itemPool = new cc.NodePool();
        }
        let itemNode = this._itemPool.get();
        if (!itemNode) {
            itemNode = cc.instantiate(prefab);
        }
        let item = itemNode.getComponent(ItemBigSymbol);
        return item;
    }
    public init(itemCfg?: ItemConfig): void {

        this.ske = this.node.getChildByName("skeleton").getComponent(sp.Skeleton);
        this.coinAmountLabel = this.node.getChildByName("coinAmountLabel").getComponent(cc.Label);
        this.static_image = this.node.getChildByName("static_image").getComponent(cc.Sprite);
        this.hightlight_ske = this.node.getChildByName("highlight_ske").getComponent(sp.Skeleton);

        if (itemCfg != null) {
            this.itemCfg = itemCfg;
        }

        if (this._itemAnimConfig) {
            let a = JSON.stringify(this._itemAnimConfig)
            this._itemAnimConfig = JSON.parse(a);
            let x = "1x" + this.numItemConfigs;
            this._itemAnimConfig.action[0].name = this._itemAnimConfig.action[0].name.replace("1x1", x);
        }
        this.static_image.node.x = 0;
        this.ske.node.x = 0;

        this.customConfigItem();

        // this.initSkeletonData();
        this.setItemStaticImage();
        this.setItemState();


    }
    customConfigItem() {
        super.customConfigItem();
        switch (this.itemCfg.symbol) {
            case E_SYMBOL.H1:
                this.static_image.node.y = 2;
                if (this.numItemConfigs == 3)
                    this.static_image.node.y = 3.5;
                break
            case E_SYMBOL.H2:
                if (this.numItemConfigs == 2)
                this.static_image.node.y = 1.2;
                if (this.numItemConfigs == 3)
                this.static_image.node.y = 2.6;
                // if(this.numItemConfigs == 2)
                // this.static_image.node.y = 2;
                // this.ske.node.y = 11.854;
                // if(this.numItemConfigs == 3)
                // this.static_image.node.y = 0;
                // this.ske.node.y = 0;
                break;
        }
    }


    setItemStaticImage(isBlur: boolean = false) {
        isBlur = false;
        let sf_name: string = this.itemCfg.symbol.toString();
        sf_name = E_SYMBOL_Atlas[sf_name];
        this.static_image.spriteFrame = (isBlur ? this.itemBlurAtlas : this.itemAtlas)?.getSpriteFrame(sf_name);
    }

    playItemAnimPromise(state: E_ANIM_STATE = E_ANIM_STATE.idle): Promise<any> {

        return new Promise((resolve: Function) => {
            let anim_cfg: AnimConfig;
            if (state == E_ANIM_STATE.idle) anim_cfg = this._itemAnimConfig.idle;
            else if (state == E_ANIM_STATE.win) {
                anim_cfg = this._itemAnimConfig?.action[0] ? this._itemAnimConfig.action[0] : null;
            }
            else if (state == E_ANIM_STATE.appear) {
                if (this.itemCfg.symbol == E_SYMBOL.SCATTER) {
                    anim_cfg = this._itemAnimConfig?.action[0] ? this._itemAnimConfig.action[0] : null;
                } else {
                    anim_cfg = this._itemAnimConfig?.action[0] ? this._itemAnimConfig.action[0] : null;
                }
            }
            else if (state == E_ANIM_STATE.collect) anim_cfg = this._itemAnimConfig?.action[0] ? this._itemAnimConfig.action[0] : null;
            let namehight = "win1x" + this.numItemConfigs;
            if (state == E_ANIM_STATE.win) {


                this.scheduleOnce(() => {
                    this.hightlight_ske.node.active = true;
                    this.hightlight_ske.setAnimation(0, namehight, false);
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
                    if (trackEntry['animation']['name'] == namehight) {
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



    remove() {
        //should be overriden
        cc.Tween.stopAllByTarget(this.node);
        ItemBigSymbol._itemPool.put(this.node);
    }
}
