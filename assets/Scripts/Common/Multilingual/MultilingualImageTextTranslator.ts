import { Cfg, supportedTextLanguage } from "../../Manager/Config";
import TextController from "../../Manager/TextController";
import CustomChangeMultilingual from "./CustomChangeMultilingual";
import StageLoadingFont, { FontCategory } from "./StageLoadingFont";



const { ccclass, property } = cc._decorator;


@ccclass('objectOrder')
export class ObjectOrder {

    @property({
        type: cc.Node
    })
    object: cc.Node = null;

    @property()
    order: number = 0;
}

@ccclass('IconImageConfig')
export class IconImageConfig {

    @property(cc.SpriteFrame)
    public imageIcon: cc.SpriteFrame = null;

    @property()
    scale: number = 1;

    @property(cc.Size)
    size: cc.Size = null;
}

@ccclass('ConfigDataLayout')
export class ConfigDataLayout {

    @property()
    public languageId: string = 'default';

    @property({ serializable: true })
    public _splitStringCmd: string = "<>";
    public get splitStringCmd() {
        return this._splitStringCmd;
    }
    @property()
    public set splitStringCmd(value) {
        this._splitStringCmd = value;
        let cmd = "(" + value[0] + "[^" + value[1] + "]+" + value[1] + "|[^" + value[0] + value[1] + "]+)";
        this.splitCmd = new RegExp(cmd, "g");

    }
    public splitCmd: RegExp = /(<[^>]+>|[^<>]+)/g;

    @property([ObjectOrder])
    public arrayObjectOrder: ObjectOrder[] = [];

    @property({
        type: IconImageConfig,
        visible() {
            return this.arrayObjectOrder.length == 0
        },
    })
    public configImageIcons: IconImageConfig[] = [];

    @property()
    public isUseAutoSort: boolean = true;

    @property()
    public isUseColor: boolean = false;

    @property({
        type: cc.Color,
        visible() {
            return this.isUseColor
        },
    })
    public color: cc.Color = new cc.Color(255, 255, 255, 255);

    @property()
    public isUseFont: boolean = false;

    @property({
        type: cc.Font,
        visible() {
            return this.isUseFont
        },
    })
    public font: cc.Font = null;

    @property({ type: cc.Enum(FontCategory) })
    fontCategory: FontCategory = FontCategory.Main;


    @property({
        visible() {
            return this.isUseFont
        },
    })
    public fontSize: number = 30;

    @property()
    public isUpperCase: boolean = true;

    @property()
    public useLableForImg: boolean = false;

    @property()
    public enableWarpText: boolean = false;
}

@ccclass
export default class MultilingualImageTextTranslator extends cc.Component {
    @property(cc.Layout)
    private layout: cc.Layout = null;

    @property([ConfigDataLayout])
    private arrayConfigDataLayout: ConfigDataLayout[] = [new ConfigDataLayout()];


    private maps: Map<string, ConfigDataLayout> = null;
    @property
    isSetContendSize: boolean = true;
    @property
    keyText: string = '';
    isInit: boolean = false;

    private config: ConfigDataLayout = null;

    isHaveCustom: boolean = false;
    private customChange: CustomChangeMultilingual = null;

    onLoad() {

        this.layout = this.node.getComponent(cc.Layout);

        if (!this.isInit)
            this.init();

        if (this.isHaveCustom) return;
        if (this.keyText.length > 0)
            this.updateConfigs();
    }

    setkey(value: string) {
        if (value == "" || !value) return;
        if (this.isHaveCustom) {
            if (!this.isInit) this.init();
            this.customChange.loadKeyForConfig(value);
            return;
        };

        this.keyText = value;
        let text = TextController.getRawText(this.keyText);
        this.updateLayout(text);
    }

    protected init(): void {
        this.customChange = this.node.getComponent(CustomChangeMultilingual);
        if (this.customChange) {
            this.isHaveCustom = this.customChange.checkIsHaveConfig(supportedTextLanguage[Cfg.language], this.keyText)
        }

        this.initMaps();

        this.isInit = true;
    }


    initMaps() {
        this.maps = new Map<string, ConfigDataLayout>();

        this.arrayConfigDataLayout.forEach((obj, i) => {
            // cc.log('initMaps: ' + obj.name + ' ' + i);
            this.maps.set(obj.languageId, obj);
        });

        this.config = this.maps.get(Cfg.language);
        if (!this.config) {
            this.config = this.maps.get("default");
        }
        this.config.splitStringCmd = this.config.splitStringCmd;
    }

    public updateConfigs() {
        let text = TextController.getRawText(this.keyText);
        this.updateLayout(text);
    }


    updateLayout(str: string) {
        if (!this.isInit) this.init();

        if (this.isHaveCustom) return;

        let config = this.config;
        if (config.isUpperCase)
            str = str.toUpperCase()

        let autoSortOrderLayoutMultilingual = config.isUseAutoSort;
        if (autoSortOrderLayoutMultilingual) {
            if (config.arrayObjectOrder.length == 0) {
                this.getAutoSortConfig(str, config, true);
            } else {
                if (config.isUseAutoSort) {
                    this.getAutoSortConfig(str, config, false);
                }
            }
        }
        if (this.layout) {
            for (let index = 0; index < config.arrayObjectOrder.length; index++) {
                let element = config.arrayObjectOrder[index];
                if (element) {
                    element.object.parent = this.layout.node;
                    element.object.active = true;
                    element.object.setSiblingIndex(element.order);
                }
            }
            this.layout.updateLayout();
        } else {
            for (let index = 0; index < config.arrayObjectOrder.length; index++) {
                let element = config.arrayObjectOrder[index];
                if (element) {
                    element.object.parent = this.node;
                    element.object.active = true;
                    element.object.setSiblingIndex(element.order+1);
                }

            }
        }


    }

    getAutoSortConfig(str: string, configDataLayout: ConfigDataLayout, isAutoCreateLable: boolean = false) {
        // const str = "One more <hello>!";


        const parts = str.match(configDataLayout.splitCmd);

        if(this.isSetContendSize){
            this.node.width = 0;
            this.node.height = 0;
        }
    
        if (isAutoCreateLable) {
            let indexImageItem = 0;
            for (let index = 0; index < parts.length; index++) {
                const element = parts[index];
                let a = configDataLayout._splitStringCmd;
                if (element.indexOf(a[0]) >= 0 && element.indexOf(a[1]) >= 0) {

                    let itemImage = configDataLayout.configImageIcons[indexImageItem];
                    if (itemImage) {
                        let nodeX = new cc.Node();

                        nodeX.setContentSize(itemImage.size);
                        nodeX.setScale(itemImage.scale);

                        let sp = nodeX.addComponent(cc.Sprite);
                        sp.spriteFrame = itemImage.imageIcon;

                        let _objOrder = new ObjectOrder();
                        _objOrder.object = nodeX;
                        _objOrder.order = index;

                        configDataLayout.arrayObjectOrder[index] = _objOrder;
                    }
                    indexImageItem++;
                } else {
                    let nodeX = new cc.Node();
                    let lb = nodeX.addComponent(cc.Label);

                    lb.string = element;
                    let _objOrder = new ObjectOrder();
                    _objOrder.object = nodeX;
                    _objOrder.order = index;

                    if (configDataLayout.isUseColor) {
                        lb.node.color = configDataLayout.color;
                    }


                    if (configDataLayout.isUseFont) {
                        if (configDataLayout.font)
                            lb.font = configDataLayout.font;
                        lb.fontSize = configDataLayout.fontSize;
                    } else {
                        lb.font = StageLoadingFont.getFont(configDataLayout.fontCategory);
                    }

                    lb.enableWrapText = configDataLayout.enableWarpText;
                    configDataLayout.arrayObjectOrder[index] = _objOrder;
                }
            }
        }
        else {
            let indexImageItem = 0;
            let indexLbItem = 0;
            let LabelItems: cc.Label[] = [];
            let imageItems: cc.Node[] = [];


            for (const iterator of configDataLayout.arrayObjectOrder) {
                let lb = iterator.object.getComponent(cc.Label)
                if (lb) {
                    LabelItems.push(lb)
                } else {
                    imageItems.push(iterator.object)
                }
            }

            for (let index = 0; index < parts.length; index++) {
                const element = parts[index];
                let a = configDataLayout._splitStringCmd;
                if (element.indexOf(a[0]) >= 0 && element.indexOf(a[1]) >= 0) {
                    let itemImage = imageItems[indexImageItem];
                    if (itemImage) {
                        let _objOrder = new ObjectOrder();
                        _objOrder.object = itemImage;
                        _objOrder.order = index;

                        configDataLayout.arrayObjectOrder[index] = _objOrder;
                    }
                    else {
                        if (configDataLayout.useLableForImg) {
                            let lb = LabelItems[indexLbItem];
                            if (!lb.font) {
                                lb.font = StageLoadingFont.getFont(configDataLayout.fontCategory);
                            }
                            let text = element.replace(a[0], "");
                            for (let index = 1; index < a.length; index++) {
                                text = text.replace(a[index], "");
                            }
                            lb.enableWrapText = configDataLayout.enableWarpText;
                            lb.string = text;
                            indexLbItem++;
                        }
                    }
                    indexImageItem++;
                } else {
                    let lb = LabelItems[indexLbItem];

                    lb.string = element;
                    let _objOrder = new ObjectOrder();
                    _objOrder.object = lb.node;
                    _objOrder.order = index;

                    if (configDataLayout.isUseColor) {
                        lb.node.color = configDataLayout.color;
                    }

                    if (configDataLayout.isUseFont) {
                        if (configDataLayout.font)
                            lb.font = configDataLayout.font;
                        lb.fontSize = configDataLayout.fontSize;
                    } else {
                        lb.font = StageLoadingFont.getFont(configDataLayout.fontCategory);
                    }
                    lb.enableWrapText = configDataLayout.enableWarpText;
                    configDataLayout.arrayObjectOrder[index] = _objOrder;
                    indexLbItem++;

                    if(this.isSetContendSize)this.node.setContentSize(lb.node.getContentSize());
                }
            }
            for (; indexImageItem < imageItems.length; indexImageItem++) {
                let element = LabelItems[indexImageItem];
                element.node.active = false;

            }
            for (; indexLbItem < LabelItems.length; indexLbItem++) {
                let element = LabelItems[indexLbItem];
                element.node.active = false;
            }
        }
    }

}



