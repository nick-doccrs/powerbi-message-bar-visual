import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
export declare class Visual implements IVisual {
    private rootElement;
    private alertRootElement;
    private headerElement;
    private iconElement;
    private messageElement;
    private toggleElement;
    private detailElement;
    private expanded;
    constructor(options: VisualConstructorOptions);
    private updateDetailExpandedState;
    private getTriggerSettings;
    private applySeverity;
    update(options: VisualUpdateOptions): void;
}
