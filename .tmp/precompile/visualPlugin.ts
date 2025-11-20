import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api";
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import DialogConstructorOptions = powerbiVisualsApi.extensibility.visual.DialogConstructorOptions;
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];
var pBIMessageBars7AD84BE9472948BCBC7B860DEEE51D16_DEBUG: IVisualPlugin = {
    name: 'pBIMessageBars7AD84BE9472948BCBC7B860DEEE51D16_DEBUG',
    displayName: 'PBIMessageBars',
    class: 'Visual',
    apiVersion: '5.3.0',
    create: (options?: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }
        throw 'Visual instance not found';
    },
    createModalDialog: (dialogId: string, options: DialogConstructorOptions, initialState: object) => {
        const dialogRegistry = (<any>globalThis).dialogRegistry;
        if (dialogId in dialogRegistry) {
            new dialogRegistry[dialogId](options, initialState);
        }
    },
    custom: true
};
if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["pBIMessageBars7AD84BE9472948BCBC7B860DEEE51D16_DEBUG"] = pBIMessageBars7AD84BE9472948BCBC7B860DEEE51D16_DEBUG;
}
export default pBIMessageBars7AD84BE9472948BCBC7B860DEEE51D16_DEBUG;