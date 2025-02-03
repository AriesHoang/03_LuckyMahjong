import { Cfg, supportedLanguage, supportedTextLanguage } from "../../Manager/Config";
import TextController from "../../Manager/TextController";
import CustomChangeMultilingual from "./CustomChangeMultilingual";
import CustomChangeToImage from "./CustomChangeToImage";
import StageLoadingFont from "./StageLoadingFont";
import RichTextTemplateConfig from "./richtext/RichTextTemplateConfig";
import TextAlignHandler from "./TextAlignHandler";



const { ccclass, property } = cc._decorator;

@ccclass("CustomFont2")
class CustomFont2 {
    @property({ type: cc.Enum(supportedTextLanguage) })
    languageId: supportedTextLanguage = supportedTextLanguage.default;

    public _splitStringCmd: string = "<>";
    @property({

    })
    public get splitStringCmd() {

        return this._splitStringCmd;
    }
    public set splitStringCmd(value) {
        this._splitStringCmd = value;
        let cmd = "/" + value[0] + "[^" + value[1] + "]" + "+" + value[0] + "/g"
        this.splitCmd = new RegExp(cmd)
    }

    public splitCmd: RegExp = /<[^>]+>/g;


    @property()
    public isRichTextNeeded: boolean = true;

    @property(cc.RichText)
    richTextComponent: cc.RichText = null;

    @property()
    public isUseFont: boolean = false;

    @property({
        type: cc.Font,
        visible() {
            return this.isUseFont
        },
    })
    font: cc.Font;

    @property()
    public isBoundaryNeeded: boolean = true;

    @property({ type: cc.macro.TextAlignment })
    horizontalAlign: cc.macro.TextAlignment = cc.macro.TextAlignment.LEFT;

    @property()
    fontSize: number = 40;

    @property()
    lineHeight: number = 50;

    @property()
    fontColor: cc.Color = cc.Color.WHITE;

    @property()
    public enableOutline: boolean = false;
    @property({
        type: cc.Color,
        visible() {
            return this.enableOutline
        },
    })
    public outlineColor: cc.Color = cc.Color.BLACK;
    @property({
        type: Number,
        visible() {
            return this.enableOutline
        },
    })
    public outlineWidth = 1;

    @property()
    public enableShadow: boolean = false;
    @property({
        type: cc.Color,
        visible() {
            return this.enableShadow
        },
    })
    public shadowColor: cc.Color = cc.Color.BLACK;
    @property({
        type: cc.Vec2,
        visible() {
            return this.enableShadow
        },
    })
    public shadowOffset: cc.Vec2 = new cc.Vec2(0, 0);

    @property({
        type: Number,
        visible() {
            return this.enableShadow
        },
    })
    public shadowBlur: number = 0;

    @property()
    public imageRequired: boolean = false;

    @property({
        type: [cc.Sprite],

        visible() {
            return this.imageRequired
        },
    }
    )
    public spriteNodes: cc.Sprite[] = [];

    @property()
    public isUpperCase: boolean = false;


}

@ccclass
export default class MultilingualImageCustomRichTextTranslator extends cc.Component {

    @property([CustomFont2])
    private arrayConfigDataFont: CustomFont2[] = [new CustomFont2()];

    private maps: Map<string, CustomFont2> = null;


    private maxHeight = 0;

    @property
    keyText: string = '';

    private config: CustomFont2 = null;
    isInit: boolean = false;

    private currentLabel = null;
    isHaveCustom:boolean = false;
    private customChange:CustomChangeMultilingual =null;

    onLoad() {

        this.maxHeight = this.node.height;

        if (!this.isInit)
            this.init();

        if(this.isHaveCustom) return;  

        this.updateConfigs();
    }

    protected init(): void {
        this.customChange = this.node.getComponent(CustomChangeMultilingual);
        if( this.customChange){
            this.isHaveCustom =  this.customChange.checkIsHaveConfig(supportedTextLanguage[Cfg.language],this.keyText)
        }
        this.initMaps();

        this.isInit = true;
    }

    setkey(value: string) {
        if (value == "" || !value) return;
        if(this.isHaveCustom) {
            this.customChange.loadKeyForConfig(value);
            return;
        };

        this.keyText = value;
        let text = TextController.getRawText(this.keyText);
        this.updateCustomRichText(text);
    }

    public updateConfigs() {
        let text = TextController.getRawText(this.keyText);
        this.updateCustomRichText(text);
    }

    initMaps() {
        this.maps = new Map<string, CustomFont2>();

        this.arrayConfigDataFont.forEach((obj, i) => {
            // cc.log('initMaps: ' + obj.name + ' ' + i);
            this.maps.set(supportedTextLanguage[obj.languageId].toString(), obj);
        });

        this.config = this.maps.get(Cfg.language);
        if (!this.config) {
            this.config = this.maps.get(supportedTextLanguage[supportedTextLanguage.default].toString());
        }

    }


    updateCustomRichText(text: string) {

        if (!this.isInit) this.init();

        let ConfigDataFont = this.config;

        if (ConfigDataFont.isUpperCase)
            text = text.toUpperCase();

        let nodeX;

        if (ConfigDataFont.isRichTextNeeded) {

            if (ConfigDataFont.imageRequired) {
                text = this.checkIfImagesArePresent(text, ConfigDataFont, ConfigDataFont.spriteNodes.length);
            }

            if (ConfigDataFont.richTextComponent == null) {

                nodeX = new cc.Node();
                let richtext = nodeX.addComponent(cc.RichText);
                nodeX.addComponent(RichTextTemplateConfig);
                ConfigDataFont.richTextComponent = richtext;

            }

            let spriteConfigs = ConfigDataFont.richTextComponent.getComponent(RichTextTemplateConfig);
            if (!spriteConfigs) spriteConfigs = ConfigDataFont.richTextComponent.addComponent(RichTextTemplateConfig)
            spriteConfigs.spriteNodes = ConfigDataFont.spriteNodes;

            ConfigDataFont.richTextComponent.node.active = true;

            let richTextComponent = ConfigDataFont.richTextComponent;

            richTextComponent.horizontalAlign = ConfigDataFont.horizontalAlign;

            richTextComponent.node.color = ConfigDataFont.fontColor;
            richTextComponent.fontSize = ConfigDataFont.fontSize;
            richTextComponent.lineHeight = ConfigDataFont.lineHeight;

            if (!ConfigDataFont.isUseFont) {
                richTextComponent.font = StageLoadingFont.getFont();
            } else {
                if (ConfigDataFont.font)
                    richTextComponent.font = ConfigDataFont.font;
            }

            richTextComponent.lineHeight = richTextComponent.fontSize;

            if (ConfigDataFont.isBoundaryNeeded)
                richTextComponent.maxWidth = this.node.width;
            else
                richTextComponent.maxWidth = -1;

            richTextComponent.string = text;
            if (ConfigDataFont.enableOutline) {
                richTextComponent.string = "<outline color=" + ConfigDataFont.outlineColor.toHEX() + " width=" + ConfigDataFont.outlineWidth + ">" + richTextComponent.string + "</outline>";
            }
            if (nodeX)
                nodeX.parent = this.node;

            this.UpdateFontSize(richTextComponent, this.maxHeight, richTextComponent.lineHeight);

            if (ConfigDataFont.enableShadow)
                this.createShadowLabel(richTextComponent, ConfigDataFont.shadowColor, ConfigDataFont.shadowOffset, ConfigDataFont.shadowBlur);
        }
        else {
            let labelText = this.currentLabel;
            if (this.currentLabel == null) {
                nodeX = new cc.Node();
                labelText = nodeX.addComponent(cc.Label);
                this.currentLabel = labelText;
            }

            if (nodeX)
                nodeX.parent = this.node;

            let labelComponent = labelText.getComponent(cc.Label);
            labelComponent.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            labelComponent.verticalAlign = cc.Label.VerticalAlign.CENTER;

            labelComponent.node.color = ConfigDataFont.fontColor;
            labelComponent.fontSize = ConfigDataFont.fontSize;

            if (!ConfigDataFont.isUseFont) {
                labelComponent.font = StageLoadingFont.getFont();
            } else {
                if (ConfigDataFont.font)
                    labelComponent.font = ConfigDataFont.font;
            }

            labelComponent.lineHeight = labelComponent.fontSize;


            if (ConfigDataFont.isBoundaryNeeded) {
                this.currentLabel.node.width = this.node.width;
                this.currentLabel.node.height = this.node.height;
                labelComponent.overflow = cc.Label.Overflow.SHRINK;
                labelComponent.enableWrapText = true;
            }

            if (ConfigDataFont.enableOutline) {
                let outlineComponent = this.currentLabel.node.addComponent(cc.LabelOutline);
                outlineComponent.color = ConfigDataFont.outlineColor;
                outlineComponent.width = ConfigDataFont.outlineWidth;
            }
            if (ConfigDataFont.enableShadow) {
                let shadowComponent = this.currentLabel.node.addComponent(cc.LabelShadow);
                shadowComponent.color = ConfigDataFont.shadowColor;
                shadowComponent.offset = ConfigDataFont.shadowOffset;
                shadowComponent.blur = ConfigDataFont.shadowBlur;
            }

            labelComponent.string = text;

            if(Cfg.language === "ja")
                return;
            
            if (ConfigDataFont.isBoundaryNeeded && !this.currentLabel.node.getComponent(TextAlignHandler)) {

                labelComponent['_forceUpdateRenderData'](true);
                labelComponent.fontSize = labelComponent.actualFontSize;
                labelComponent.lineHeight = labelComponent.actualFontSize;
                labelComponent['_forceUpdateRenderData'](true);
                
                this.currentLabel.node.width = this.node.width;
                this.currentLabel.node.height = this.node.height;
                let alignHandler = this.currentLabel.node.addComponent(TextAlignHandler);
                alignHandler.updateLabelString();
            }


        }

    }


    checkIfImagesArePresent(text: string, ConfigDataFont: CustomFont2, length) {
        let a = ConfigDataFont.splitStringCmd[0] + ConfigDataFont.splitStringCmd[1];
        const modifiedString = text.replace(ConfigDataFont.splitCmd, a)
        const splittedStrings = modifiedString.split(a);

        let newString = "";
        let currentIndex = 0;
        for (let i = 0; i < splittedStrings.length; i++) {
            newString += splittedStrings[i];

            if (i == splittedStrings.length - 1)
                break;
            newString += " <img src=\"" + "img" + "\"/> ";
            currentIndex++;
            if (i >= length - 1) {
                currentIndex = 0;
            }
        }
        return newString;
    }


    UpdateFontSize(_richNode: cc.RichText, maxHeight: number, _fontLineHeight: number) {

        // let currentFontSize = _richNode.fontSize;
        // let currentHeight = _richNode.node.height;
        while (_richNode.fontSize > 20 && _richNode.node.height > maxHeight) {
            _fontLineHeight -= 6;
            _richNode.fontSize -= 6;
            _richNode.lineHeight = _fontLineHeight;
        }
        // _richNode.fontSize = currentFontSize;
        // _richNode.lineHeight = currentFontSize;

        // if (_richNode.fontSize > 14 && _richNode.node.height > maxHeight) {
        //     _fontLineHeight -= 2;
        //     _richNode.fontSize -= 2;
        //     _richNode.lineHeight = _fontLineHeight;
        //     this.UpdateFontSize(_richNode, maxHeight, _fontLineHeight);
        // }
        // else
        //     return;
    }
    createShadowLabel(richTextComponent: cc.RichText, shadowColor, shadowOffset , shadowBlur) {
        // Get the array of label segments
        const labelSegments = richTextComponent['_labelSegments'];
        for (let i = 0; i < labelSegments.length; i++) {
            const element = labelSegments[i];

            if (labelSegments[i].getComponent(cc.Label)) {
                let shadowComponent = labelSegments[i].addComponent(cc.LabelShadow);
                shadowComponent.color = shadowColor;
                shadowComponent.offset = shadowOffset;
                shadowComponent.blur = shadowBlur;
            }
        }
    }

  
}
