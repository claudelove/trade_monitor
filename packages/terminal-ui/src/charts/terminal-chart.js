// Renderer boundary. The SVG path is used by non-canvas environments/accessibility tests.
import {TerminalChart as SVGChart} from './svg-chart.js';
import {NativeChart} from './native-chart.js';
export class TerminalChart {
 constructor(root,options={}){return root.ownerDocument.defaultView.CanvasRenderingContext2D?new NativeChart(root,options):new SVGChart(root,options)}
}
