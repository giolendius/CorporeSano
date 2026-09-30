/**
 * SVG renderer for the Circolatorio board.
 *
 * Layout: 4 circular arcs around a central heart. Each path's cells are
 * distributed uniformly on an arc of radius ARC_R, centered at distance
 * ARC_CENTER_DIST from the heart in the path's direction. All edges (straight
 * outgoing segments + curved return bezier) share the same style and carry
 * an arrowhead marker showing the flow direction around the loop.
 *
 * Movement: after setInteractive is called, clicking a boat highlights
 * reachable nodes (BFS); clicking a highlighted node fires onNodeClick.
 * selectBoat and clearHighlights are pure state mutators — they do NOT
 * auto-render; the caller always drives rendering explicitly.
 */

const CX = 300;
const CY = 250;
const PATH_ANGLES  = [270, 0, 90, 180]; // top, right, bottom, left
const ARC_CENTER_DIST = 95;
const ARC_R        = 80;
const GAP_DEG      = 50;
const SPAN_DEG     = 360 - 2 * GAP_DEG; // 260°
const NODE_R       = 14;
const HEART_R      = 22;
const SIDE_DIST    = 34;
const BOAT_R       = 9;

const DEG = Math.PI / 180;

export type BoatClickHandler = (boatId: number) => void;
export type NodeClickHandler = (path: number, cell: number) => void;

interface NodePos { path: number; cell: number; }

export class CirBoardRenderer {
    private svg: SVGSVGElement;
    private graph: CirPathCell[][] = [];
    private boats: Boat[] = [];
    private selectedBoat: number | null = null;
    private highlighted: Set<string> = new Set();
    private _distMap: Map<string, number> = new Map();
    private _lungO2: { sx: number; dx: number } = { sx: 0, dx: 0 };
    private _o2BoatId: number | null = null;
    private _onCaricaO2: (() => void) | null = null;
    private _onScaricaO2: (() => void) | null = null;
    private onBoatClick: BoatClickHandler | null = null;
    private onNodeClick: NodeClickHandler | null = null;

    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) throw new Error(`#${containerId} not found`);
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('viewBox', '0 0 600 500');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.style.display = 'block';
        container.appendChild(this.svg);
    }

    /** Full render. Attaches click handlers if setInteractive has been called. */
    render(graph: CirPathCell[][], boats: Boat[]) {
        this.graph = graph;
        this.boats = boats;
        this.svg.innerHTML = '';
        this._drawDefs();
        this._drawEdges();
        this._drawNodes();
        this._drawBoats();
        this._drawO2ActionButtons();
    }

    /**
     * Store callbacks and immediately re-render so click listeners are wired.
     * Pass boats explicitly to keep the renderer in sync with PlayerTurn's copy.
     */
    setInteractive(onBoatClick: BoatClickHandler, onNodeClick: NodeClickHandler, boats?: Boat[]) {
        this.onBoatClick = onBoatClick;
        this.onNodeClick = onNodeClick;
        if (boats) this.boats = boats;
        this.render(this.graph, this.boats);
    }

    clearInteractive() {
        this.onBoatClick = null;
        this.onNodeClick = null;
        this.highlighted.clear();
        this._distMap.clear();
        // The board is persistent: re-render so stale click listeners (and the
        // pointer cursor) are dropped from the now non-interactive elements.
        this.render(this.graph, this.boats);
    }

    /** Compute reachable nodes via BFS and re-render with highlights. */
    highlightReachable(path: number, cell: number, steps: number) {
        this._distMap = this._bfsDistances(path, cell, steps);
        this.highlighted = new Set(
            [...this._distMap.entries()].filter(([, d]) => d > 0).map(([k]) => k)
        );
        this.render(this.graph, this.boats);
    }

    /** Returns the BFS step cost to reach (path, cell) from the last highlight origin. */
    getStepCost(path: number, cell: number): number {
        return this._distMap.get(this._nodeKey(path, cell)) ?? 1;
    }

    /** Update the lung O2 counts used by the next render call. */
    setLungO2(lungO2: { sx: number; dx: number }) {
        this._lungO2 = { ...lungO2 };
    }

    /**
     * Register O2 action buttons to overlay the SVG on the next render.
     * Pass null for a callback to suppress that button.
     */
    setO2Actions(boatId: number, onCarica: (() => void) | null, onScarica: (() => void) | null) {
        this._o2BoatId = boatId;
        this._onCaricaO2 = onCarica;
        this._onScaricaO2 = onScarica;
    }

    /** Remove O2 action buttons from the next render. */
    clearO2Actions() {
        this._o2BoatId = null;
        this._onCaricaO2 = null;
        this._onScaricaO2 = null;
    }

    /** Pure state update — no render. Caller must call render() after. */
    selectBoat(boatId: number | null) {
        this.selectedBoat = boatId;
    }

    /** Pure state update — no render. Caller must call render() after. */
    clearHighlights() {
        this.highlighted.clear();
        this._distMap.clear();
    }

    // ── Geometry ──────────────────────────────────────────────────────────────

    private _arcCenter(pi: number): [number, number] {
        const rad = PATH_ANGLES[pi] * DEG;
        return [CX + ARC_CENTER_DIST * Math.cos(rad), CY + ARC_CENTER_DIST * Math.sin(rad)];
    }

    private _cellXY(pi: number, ci: number): [number, number] {
        const [acx, acy] = this._arcCenter(pi);
        const heartDir = PATH_ANGLES[pi] + 180;
        const startAngle = (heartDir + GAP_DEG) * DEG;
        const n = this.graph[pi]?.length ?? 1;
        const step = SPAN_DEG * DEG / (n + 1);
        const angle = startAngle + (ci + 1) * step;
        return [acx + ARC_R * Math.cos(angle), acy + ARC_R * Math.sin(angle)];
    }

    // ── O2 action button overlay ──────────────────────────────────────────────

    private _drawO2ActionButtons() {
        if (this._o2BoatId === null) return;
        const boat = this.boats.find(b => b.id === this._o2BoatId);
        if (!boat) return;

        if (this._onCaricaO2) {
            const [bx, by] = this._cellXY(boat.path, boat.cell);
            this._drawSvgButton(bx, by - NODE_R - 16, 'Carica O2', this._onCaricaO2);
        }
        if (this._onScaricaO2) {
            this._drawSvgButton(CX, CY - HEART_R - 16, 'Scarica O2', this._onScaricaO2);
        }
    }

    private _drawSvgButton(cx: number, cy: number, label: string, onClick: () => void) {
        const W = 74, H = 22;
        const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        fo.setAttribute('x', String(cx - W / 2));
        fo.setAttribute('y', String(cy - H / 2));
        fo.setAttribute('width', String(W));
        fo.setAttribute('height', String(H));

        const btn = document.createElement('button');
        btn.className = 'action-button bgabutton bgabutton_blue';
        btn.style.cssText = 'width:100%;height:100%;font-size:8px;padding:1px 3px;white-space:nowrap;cursor:pointer;box-sizing:border-box;line-height:1;';
        btn.textContent = label;
        btn.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });

        fo.appendChild(btn);
        this.svg.appendChild(fo);
    }

    // ── BFS ───────────────────────────────────────────────────────────────────

    private _nodeKey(p: number, c: number): string { return `${p},${c}`; }

    private _adjacents(p: number, c: number): NodePos[] {
        const adj: NodePos[] = [];
        if (p === -1) {
            this.graph.forEach((_, pi) => adj.push({ path: pi, cell: 0 }));
        } else {
            const len = this.graph[p]?.length ?? 0;
            if (c === 0)       adj.push({ path: -1, cell: -1 });
            else               adj.push({ path: p,  cell: c - 1 });
            if (c === len - 1) adj.push({ path: -1, cell: -1 });
            else               adj.push({ path: p,  cell: c + 1 });
        }
        const seen = new Set<string>();
        return adj.filter(n => { const k = this._nodeKey(n.path, n.cell); return seen.has(k) ? false : (seen.add(k), true); });
    }

    private _bfsDistances(startP: number, startC: number, steps: number): Map<string, number> {
        const dist = new Map<string, number>();
        const queue: [number, number, number][] = [[startP, startC, 0]];
        dist.set(this._nodeKey(startP, startC), 0);
        while (queue.length) {
            const [p, c, d] = queue.shift()!;
            if (d >= steps) continue;
            for (const n of this._adjacents(p, c)) {
                const k = this._nodeKey(n.path, n.cell);
                if (!dist.has(k)) {
                    dist.set(k, d + 1);
                    queue.push([n.path, n.cell, d + 1]);
                }
            }
        }
        return dist;
    }

    // ── Drawing ───────────────────────────────────────────────────────────────

    private _drawDefs() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <marker id="cir-arrow" viewBox="0 0 10 10" refX="8" refY="5"
                    markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" class="cir-arrow-head" />
            </marker>`;
        this.svg.appendChild(defs);
    }

    private _drawEdges() {
        this.graph.forEach((cells, pi) => {
            const [acx, acy] = this._arcCenter(pi);

            // Outgoing: heart → cell[0] → ... → cell[N-1], all same style + arrowhead
            let [px, py] = [CX, CY];
            cells.forEach((_, ci) => {
                const [nx, ny] = this._cellXY(pi, ci);
                this._line(px, py, nx, ny, 'cir-edge');
                [px, py] = [nx, ny];
            });

            // Return: cell[N-1] → heart, same style, curved through the arc center
            const [lx, ly] = this._cellXY(pi, cells.length - 1);
            this._bezier(lx, ly, acx, acy, CX, CY, 'cir-edge');
        });
    }

    private _drawNodes() {
        const heartKey = this._nodeKey(-1, -1);
        const heartReachable = this.highlighted.has(heartKey);
        const heartCls = `cir-node cir-node--heart${heartReachable ? ' cir-node--reachable' : ''}`;
        this._circle(CX, CY, HEART_R, heartCls, 'heart', -1, -1);
        this._text(CX, CY, '♥', 'cir-label');

        this.graph.forEach((cells, pi) => {
            const [acx, acy] = this._arcCenter(pi);
            const perpRad = ((PATH_ANGLES[pi] + 90) * DEG);

            cells.forEach((cell, ci) => {
                const [x, y] = this._cellXY(pi, ci);
                const isReachable = this.highlighted.has(this._nodeKey(pi, ci));
                let cls = cell.name ? 'cir-node cir-node--named' : 'cir-node';
                if (isReachable) cls += ' cir-node--reachable';
                this._circle(x, y, NODE_R, cls, cell.id, pi, ci);
                const label = cell.name ?? cell.id;
                this._text(x, y + NODE_R + 10, label, 'cir-label--small');

                (cell.side ?? []).forEach((sideName, si) => {
                    const offset = (si % 2 === 0 ? 1 : -1) * SIDE_DIST;
                    const sx = x + Math.cos(perpRad) * offset;
                    const sy = y + Math.sin(perpRad) * offset;
                    this._line(x, y, sx, sy, 'cir-edge--side');
                    this._circle(sx, sy, 10, 'cir-node cir-node--side', `side-${sideName}`, -2, -2);
                    this._text(sx, sy + 14, sideName, 'cir-label--side');
                });

                if (cell.name === 'polmone_sx') this._drawLungZone(x, y, pi, ci, this._lungO2.sx);
                if (cell.name === 'polmone_dx') this._drawLungZone(x, y, pi, ci, this._lungO2.dx);

                // Suppress unused variable warning for acx/acy (used only for arc centers in edges)
                void acx; void acy;
            });
        });
    }

    private _drawBoats() {
        const groups = new Map<string, Boat[]>();
        this.boats.forEach(b => {
            const k = this._nodeKey(b.path, b.cell);
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k)!.push(b);
        });

        groups.forEach((boatsHere, key) => {
            const [p, c] = key.split(',').map(Number);
            const [bx, by] = p === -1 ? [CX, CY] : this._cellXY(p, c);

            boatsHere.forEach((boat, offset) => {
                const ox = (offset - (boatsHere.length - 1) / 2) * (BOAT_R * 2.4);
                const sel = this.selectedBoat === boat.id;
                const el = this._circle(
                    bx + ox, by, BOAT_R,
                    `cir-boat${sel ? ' cir-boat--selected' : ''}`,
                    `boat-${boat.id}`, -3, -3
                );
                this._drawBoatIndicators(bx + ox, by, boat);

                if (this.onBoatClick) {
                    el.style.cursor = 'pointer';
                    el.addEventListener('click', (e) => { e.stopPropagation(); this.onBoatClick?.(boat.id); });
                }
            });
        });
    }

    private _drawBoatIndicators(cx: number, cy: number, boat: Boat) {
        // O2: light-blue circle INSIDE the boat circle
        if (boat.o2 > 0) {
            const o2c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            o2c.setAttribute('cx', String(cx)); o2c.setAttribute('cy', String(cy));
            o2c.setAttribute('r', '5');
            o2c.setAttribute('fill', '#4fc3f7');
            o2c.style.pointerEvents = 'none';
            this.svg.appendChild(o2c);

            const o2t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            o2t.setAttribute('x', String(cx)); o2t.setAttribute('y', String(cy));
            o2t.setAttribute('text-anchor', 'middle'); o2t.setAttribute('dominant-baseline', 'middle');
            o2t.setAttribute('font-size', '4'); o2t.setAttribute('font-weight', 'bold');
            o2t.setAttribute('fill', '#001a2a');
            o2t.style.pointerEvents = 'none';
            o2t.textContent = `${boat.o2}O2`;
            this.svg.appendChild(o2t);
        }

        // CO2 and GB: small dots below the boat
        const slots = [
            { val: boat.co2, fill: '#888888', textFill: '#fff' },
            { val: boat.wb,  fill: '#eeeeee', textFill: '#222' },
        ].filter(s => s.val > 0);

        if (slots.length === 0) return;
        const DOT_R = 3.5;
        const SPACING = 9;
        const startX = cx - ((slots.length - 1) * SPACING) / 2;
        const dotY = cy + BOAT_R + DOT_R + 2;

        slots.forEach((slot, i) => {
            const dx = startX + i * SPACING;
            const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dot.setAttribute('cx', String(dx)); dot.setAttribute('cy', String(dotY));
            dot.setAttribute('r', String(DOT_R));
            dot.setAttribute('fill', slot.fill); dot.setAttribute('stroke', '#333');
            dot.setAttribute('stroke-width', '0.5');
            dot.style.pointerEvents = 'none';
            this.svg.appendChild(dot);

            const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            txt.setAttribute('x', String(dx)); txt.setAttribute('y', String(dotY));
            txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('dominant-baseline', 'middle');
            txt.setAttribute('font-size', '4'); txt.setAttribute('fill', slot.textFill);
            txt.style.pointerEvents = 'none';
            txt.textContent = String(slot.val);
            this.svg.appendChild(txt);
        });
    }

    private _drawLungZone(cellX: number, cellY: number, pi: number, ci: number, o2: number) {
        void ci;
        const [acx, acy] = this._arcCenter(pi);
        const dx = cellX - acx;
        const dy = cellY - acy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const LUNG_DIST = 48;
        const lx = cellX + (dx / len) * LUNG_DIST;
        const ly = cellY + (dy / len) * LUNG_DIST;

        // Dashed connector
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(cellX)); line.setAttribute('y1', String(cellY));
        line.setAttribute('x2', String(lx));    line.setAttribute('y2', String(ly));
        line.setAttribute('stroke', '#4fc3f7'); line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', '4 3');
        line.style.pointerEvents = 'none';
        this.svg.appendChild(line);

        // Lung ellipse background
        const ell = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        ell.setAttribute('cx', String(lx)); ell.setAttribute('cy', String(ly));
        ell.setAttribute('rx', '24'); ell.setAttribute('ry', '17');
        ell.setAttribute('fill', '#0d2b3a'); ell.setAttribute('stroke', '#4fc3f7');
        ell.setAttribute('stroke-width', '1.5');
        ell.style.pointerEvents = 'none';
        this.svg.appendChild(ell);

        // O2 circle inside lung
        const o2c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        o2c.setAttribute('cx', String(lx)); o2c.setAttribute('cy', String(ly));
        o2c.setAttribute('r', '11');
        o2c.setAttribute('fill', '#4fc3f7'); o2c.setAttribute('stroke', '#fff');
        o2c.setAttribute('stroke-width', '0.5');
        o2c.style.pointerEvents = 'none';
        this.svg.appendChild(o2c);

        // "x O2" text
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', String(lx)); txt.setAttribute('y', String(ly));
        txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('dominant-baseline', 'middle');
        txt.setAttribute('font-size', '6.5'); txt.setAttribute('font-weight', 'bold');
        txt.setAttribute('fill', '#001a2a');
        txt.style.pointerEvents = 'none';
        txt.textContent = `${o2} O2`;
        this.svg.appendChild(txt);
    }

    // ── SVG helpers ───────────────────────────────────────────────────────────

    private _line(x1: number, y1: number, x2: number, y2: number, cls: string): SVGLineElement {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        el.setAttribute('x1', String(x1)); el.setAttribute('y1', String(y1));
        el.setAttribute('x2', String(x2)); el.setAttribute('y2', String(y2));
        el.setAttribute('class', cls);
        el.setAttribute('marker-end', 'url(#cir-arrow)');
        this.svg.appendChild(el);
        return el;
    }

    private _bezier(x1: number, y1: number, cpx: number, cpy: number, x2: number, y2: number, cls: string): SVGPathElement {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        el.setAttribute('d', `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`);
        el.setAttribute('class', cls);
        el.setAttribute('fill', 'none');
        el.setAttribute('marker-end', 'url(#cir-arrow)');
        this.svg.appendChild(el);
        return el;
    }

    private _circle(x: number, y: number, r: number, cls: string, id: string, path: number, cell: number): SVGCircleElement {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        el.setAttribute('cx', String(x)); el.setAttribute('cy', String(y));
        el.setAttribute('r', String(r));
        el.setAttribute('class', cls);
        el.dataset.nodeId = id;

        // Attach node click only to valid board nodes (not side nodes, not boats)
        // and only when the node is reachable (or no highlights are active)
        if (this.onNodeClick && path >= -1 && path !== -2 && path !== -3) {
            const reachable = this.highlighted.size === 0 || this.highlighted.has(this._nodeKey(path, cell));
            if (reachable) {
                el.style.cursor = 'pointer';
                el.addEventListener('click', () => this.onNodeClick?.(path, cell));
            }
        }

        this.svg.appendChild(el);
        return el;
    }

    private _text(x: number, y: number, content: string, cls: string): SVGTextElement {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        el.setAttribute('x', String(x)); el.setAttribute('y', String(y));
        el.setAttribute('class', cls);
        el.setAttribute('text-anchor', 'middle');
        el.setAttribute('dominant-baseline', 'middle');
        el.textContent = content;
        this.svg.appendChild(el);
        return el;
    }
}
