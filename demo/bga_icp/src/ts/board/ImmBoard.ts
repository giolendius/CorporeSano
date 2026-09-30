/**
 * SVG renderer for the Immunitario board: the 4 infection zones (A, B, C, D)
 * drawn as rectangles stacked vertically, so they sit as a narrow column beside
 * the heart on the shared table. Each zone shows its white blood cells on the
 * LEFT and its bacteria on the RIGHT — both the same size. When a group has more
 * than one item they are slightly staggered (overlapping) so all stay visible
 * without cluttering.
 *
 * Bacteria are individually clickable targets: a bacterium is a valid target
 * only if its zone has at least one white blood cell (that's what makes a battle
 * winnable). `selectTarget` is a pure state mutator; the caller drives rendering.
 */

const VIEW_W = 280;
const VIEW_H = 560;
const MARGIN  = 8;
const ZONE_X  = MARGIN;
const ZONE_W  = VIEW_W - 2 * MARGIN;
const ZONE_H  = 128;
const ZONE_GAP = 12;

const ITEM_R  = 18;          // common radius for globuli AND bacteria
const OFF_X   = 11;          // stagger offset when a group has >1 item
const OFF_Y   = 9;
const WB_CX   = ZONE_X + 62;  // globuli group center (left)
const BACT_CX = ZONE_X + 190; // bacteria group center (right)

export interface ImmTarget { zoneId: string; index: number; }
export type TargetClickHandler = (target: ImmTarget) => void;

export class ImmBoardRenderer {
    private svg: SVGSVGElement;
    private zones: ImmZone[] = [];
    private selected: ImmTarget | null = null;
    private onTargetClick: TargetClickHandler | null = null;

    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) throw new Error(`#${containerId} not found`);
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('viewBox', `0 0 ${VIEW_W} ${VIEW_H}`);
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.style.display = 'block';
        container.appendChild(this.svg);
    }

    render(zones: ImmZone[]) {
        this.zones = zones;
        this.svg.innerHTML = '';
        this.zones.forEach((z, i) => this._drawZone(z, i));
    }

    /** Store the click handler and re-render so listeners attach. */
    setInteractive(onTargetClick: TargetClickHandler) {
        this.onTargetClick = onTargetClick;
        this.render(this.zones);
    }

    clearInteractive() {
        this.onTargetClick = null;
        this.selected = null;
        // Persistent board: re-render to drop stale listeners + pointer cursor.
        this.render(this.zones);
    }

    /** Pure state update — no render. Caller must call render() after. */
    selectTarget(zoneId: string | null, index: number | null) {
        this.selected = (zoneId !== null && index !== null) ? { zoneId, index } : null;
    }

    private _zoneCanFight(z: ImmZone): boolean {
        return z.bacteria.length >= 1 && z.wb >= 1;
    }

    private _drawZone(z: ImmZone, i: number) {
        const y = MARGIN + i * (ZONE_H + ZONE_GAP);

        let cls = 'imm-zone';
        if (z.bacteria.length === 0) cls += ' imm-zone--empty';
        else if (this._zoneCanFight(z)) cls += ' imm-zone--target';

        this._rect(ZONE_X, y, ZONE_W, ZONE_H, cls);

        // Zone letter (top-left corner)
        this._text(ZONE_X + 16, y + 18, z.id.toUpperCase(), 'imm-label imm-label--zone', 'start');

        // Thin divider between the globuli (left) and bacteria (right) halves.
        const midX = ZONE_X + ZONE_W * 0.46;
        this._line(midX, y + 14, midX, y + ZONE_H - 10, 'imm-divider');

        const cy = y + ZONE_H / 2 + 6;
        this._drawGlobuli(WB_CX, cy, z.wb);
        this._drawBacteria(BACT_CX, cy, z);
    }

    private _drawGlobuli(cx: number, cy: number, wb: number) {
        if (wb <= 0) return;
        const [bx, by] = this._groupStart(cx, cy, wb);
        for (let k = 0; k < wb; k++) {
            this._circle(bx + k * OFF_X, by + k * OFF_Y, ITEM_R, 'imm-wb');
        }
    }

    private _drawBacteria(cx: number, cy: number, z: ImmZone) {
        if (z.bacteria.length === 0) {
            this._text(cx, cy, _('vuota'), 'imm-label imm-label--empty', 'middle');
            return;
        }
        const n = z.bacteria.length;
        const [bx, by] = this._groupStart(cx, cy, n);
        z.bacteria.forEach((type, index) => {
            const x = bx + index * OFF_X;
            const yy = by + index * OFF_Y;
            const isSel = this.selected?.zoneId === z.id && this.selected?.index === index;
            const el = this._drawBacterium(x, yy, type, isSel);
            if (this.onTargetClick && this._zoneCanFight(z)) {
                el.style.cursor = 'pointer';
                el.addEventListener('click', (e) => { e.stopPropagation(); this.onTargetClick?.({ zoneId: z.id, index }); });
            }
        });
    }

    /** Top-left anchor so the staggered group stays centered on (cx, cy). */
    private _groupStart(cx: number, cy: number, n: number): [number, number] {
        return [cx - (n - 1) * OFF_X / 2, cy - (n - 1) * OFF_Y / 2];
    }

    private _drawBacterium(cx: number, cy: number, type: VirusType, selected: boolean): SVGElement {
        const cls = `imm-virus imm-virus--${type}${selected ? ' imm-virus--selected' : ''}`;
        const r = ITEM_R;
        if (type === 'circolare') {
            return this._circle(cx, cy, r, cls);
        } else if (type === 'quadrato') {
            return this._rect(cx - r, cy - r, 2 * r, 2 * r, cls);
        }
        // triangolare
        const p = `${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}`;
        return this._polygon(p, cls);
    }

    // ── SVG helpers ───────────────────────────────────────────────────────────

    private _rect(x: number, y: number, w: number, h: number, cls: string): SVGRectElement {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        el.setAttribute('x', String(x)); el.setAttribute('y', String(y));
        el.setAttribute('width', String(w)); el.setAttribute('height', String(h));
        el.setAttribute('rx', '6');
        el.setAttribute('class', cls);
        this.svg.appendChild(el);
        return el;
    }

    private _circle(x: number, y: number, r: number, cls: string): SVGCircleElement {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        el.setAttribute('cx', String(x)); el.setAttribute('cy', String(y));
        el.setAttribute('r', String(r));
        el.setAttribute('class', cls);
        this.svg.appendChild(el);
        return el;
    }

    private _polygon(points: string, cls: string): SVGPolygonElement {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        el.setAttribute('points', points);
        el.setAttribute('class', cls);
        this.svg.appendChild(el);
        return el;
    }

    private _line(x1: number, y1: number, x2: number, y2: number, cls: string): SVGLineElement {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        el.setAttribute('x1', String(x1)); el.setAttribute('y1', String(y1));
        el.setAttribute('x2', String(x2)); el.setAttribute('y2', String(y2));
        el.setAttribute('class', cls);
        this.svg.appendChild(el);
        return el;
    }

    private _text(x: number, y: number, content: string, cls: string, anchor: string): SVGTextElement {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        el.setAttribute('x', String(x)); el.setAttribute('y', String(y));
        el.setAttribute('class', cls);
        el.setAttribute('text-anchor', anchor);
        el.setAttribute('dominant-baseline', 'middle');
        el.textContent = content;
        this.svg.appendChild(el);
        return el;
    }
}
