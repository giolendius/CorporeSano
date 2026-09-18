import { Game } from "../Game";
import { CirBoardRenderer } from "../board/CirBoard";

export class PlayerTurn {
    private cirBoard: CirBoardRenderer | null = null;
    private currentGraph: CirPathCell[][] = [];

    // Client-side movement state (not persisted until actConfirmMovimento)
    private movementBoats: Boat[] = [];
    private passiRimanenti = 0;
    private movementTarget: 'one' | 'all' = 'one';
    private selectedBoat: number | null = null;

    constructor(private game: Game, private bga: Bga<InCorporeSanoPlayer, InCorporeSanoGamedatas>) {}

    onEnteringState(args: PlayerTurnArgs, isCurrentPlayerActive: boolean) {
        console.log('[PlayerTurn] onEnteringState', { args, isCurrentPlayerActive });

        this.bga.statusBar.setTitle(isCurrentPlayerActive ?
            _('${you} must choose an action') :
            _('${actplayer} must choose an action')
        );

        this.renderPlayerBoard(args, isCurrentPlayerActive);
        this.renderCirBoard(args);
    }

    onLeavingState(_args: PlayerTurnArgs, _isCurrentPlayerActive: boolean) {
        const board = document.getElementById('player-board');
        if (board) board.innerHTML = '';
        this.cirBoard = null;
        this.currentGraph = [];
        this.resetMovementState();
    }

    onPlayerActivationChange(_args: PlayerTurnArgs, _isCurrentPlayerActive: boolean) {}

    /** Called by Game.ts when server notifies Circolatorio must move boats. */
    onCirStartMovement(notif: CirStartMovementNotif, isMe: boolean) {
        this.movementBoats = notif.boats.map(b => ({ ...b }));
        this.passiRimanenti = notif.movements;
        this.movementTarget = notif.target;
        this.selectedBoat = null;

        this.updatePassiCounter();

        if (!isMe) return;

        // Pass movementBoats explicitly so renderer stays in sync
        this.cirBoard?.setInteractive(
            (boatId) => this.onBoatSelected(boatId),
            (path, cell) => this.onNodeClicked(path, cell),
            this.movementBoats,
        );

        // Add Confirm/Skip to BGA status bar
        this.bga.statusBar.removeActionButtons();
        this.bga.statusBar.addActionButton(_('Conferma'), () => this.confirmMovimento(), { id: 'btn-confirm-movement', color: 'primary' });
        this.bga.statusBar.addActionButton(_('Salta passi'), () => this.confirmMovimento(), { id: 'btn-skip-movement' });
    }

    /**
     * Called by Game.ts for everyone (active player included) once boats are
     * saved server-side. Keeps the board in sync for non-active viewers, who
     * never receive the client-side movement render calls.
     */
    onCirBoatsUpdated(boats: Boat[]) {
        this.movementBoats = boats.map(b => ({ ...b }));
        this.cirBoard?.render(this.currentGraph, this.movementBoats);
    }

    // ── Player board ──────────────────────────────────────────────────────────

    private renderPlayerBoard(args: PlayerTurnArgs, isActive: boolean) {
        const board = document.getElementById('player-board');
        if (!board) { console.error('[PlayerTurn] #player-board not found'); return; }

        const mySystem = this.game.mySystem || args.system || '—';
        const actions = args.actions ?? [];

        const actionsHtml = actions.map(a => {
            const costLabel = a.cost > 0 ? `costo ${a.cost}` : 'gratuita';
            const movLabel  = a.movements !== undefined ? ` · ${a.movements} passi` : '';
            return `
                <div class="pb-action pb-action--locked" data-action-id="${a.id}">
                    <span class="pb-action-name">${a.label}</span>
                    <span class="pb-action-cost">${costLabel}${movLabel}</span>
                </div>
            `;
        }).join('') || `<div class="pb-action pb-action--locked">—</div>`;

        board.innerHTML = `
            <div class="pb-left">
                <div class="pb-system-name">${mySystem}</div>
            </div>
            <div class="pb-right">
                <div class="pb-upgrade-row">
                    <button class="bga-button bga-button--action pb-btn" id="btn-potenziamento"
                        ${isActive ? '' : 'disabled'}>Pot.</button>
                    <button class="bga-button pb-btn" id="btn-no-potenziamento"
                        ${isActive ? '' : 'disabled'}>Non pot.</button>
                </div>
                <div class="pb-actions-list" id="pb-actions">
                    ${actionsHtml}
                </div>
            </div>
        `;

        if (!isActive) return;

        const unlock = () => {
            document.querySelector('.pb-upgrade-row')?.remove();
            document.querySelectorAll<HTMLElement>('.pb-action').forEach(el => {
                const actionId = Number(el.dataset.actionId);
                const action = actions.find(a => a.id === actionId);
                if (!action) return;
                el.classList.remove('pb-action--locked');
                if (action.available) {
                    el.classList.add('pb-action--available');
                    el.addEventListener('click', () => this.onActionClick(actionId));
                } else {
                    el.classList.add('pb-action--unavailable');
                }
            });
        };

        document.getElementById('btn-potenziamento')?.addEventListener('click', unlock);
        document.getElementById('btn-no-potenziamento')?.addEventListener('click', unlock);
    }

    // ── Circolatorio SVG board ────────────────────────────────────────────────

    private renderCirBoard(args: PlayerTurnArgs) {
        const gameboard = document.getElementById('game-board');
        if (!gameboard) return;
        if (!args.graph || args.graph.length === 0) return;

        this.currentGraph = args.graph;

        gameboard.innerHTML = '<div id="cir-svg-container" style="width:100%;height:100%;position:relative;"></div>';
        gameboard.innerHTML += '<div id="cir-passi-counter" class="cir-passi-counter" style="display:none">Passi: 0</div>';

        try {
            this.cirBoard = new CirBoardRenderer('cir-svg-container');
            this.cirBoard.render(args.graph, args.boats ?? []);
        } catch (e) {
            console.error('[PlayerTurn] CirBoard render error', e);
        }
    }

    private updatePassiCounter() {
        const counter = document.getElementById('cir-passi-counter');
        if (!counter) return;
        counter.style.display = this.passiRimanenti > 0 ? 'block' : 'none';
        counter.textContent = `Passi: ${this.passiRimanenti}`;
    }

    // ── Movement handlers ─────────────────────────────────────────────────────

    private onBoatSelected(boatId: number) {
        this.selectedBoat = boatId;
        this.cirBoard?.selectBoat(boatId);   // state-only, no render

        const boat = this.movementBoats.find(b => b.id === boatId);
        if (boat) {
            // highlightReachable does the single render (with selection ring + green nodes)
            this.cirBoard?.highlightReachable(boat.path, boat.cell, this.passiRimanenti);
        }
    }

    private onNodeClicked(path: number, cell: number) {
        if (this.selectedBoat === null || this.passiRimanenti <= 0) return;

        const boat = this.movementBoats.find(b => b.id === this.selectedBoat);
        if (!boat) return;

        boat.path = path;
        boat.cell = cell;
        this.passiRimanenti--;
        this.selectedBoat = null;

        // Update renderer state without intermediate renders
        this.cirBoard?.selectBoat(null);
        this.cirBoard?.clearHighlights();
        // One clean render with updated boats
        this.cirBoard?.render(this.currentGraph, this.movementBoats);
        this.updatePassiCounter();

        if (this.passiRimanenti === 0) this.cirBoard?.clearInteractive();
    }

    private confirmMovimento() {
        this.bga.statusBar.removeActionButtons();
        this.cirBoard?.clearInteractive();
        this.bga.actions.performAction('actConfirmMovimento', { finalBoats: JSON.stringify(this.movementBoats) });
    }

    private resetMovementState() {
        this.movementBoats = [];
        this.passiRimanenti = 0;
        this.selectedBoat = null;
    }

    private onActionClick(actionId: number) {
        console.log('[PlayerTurn] action clicked:', actionId);
        this.bga.actions.performAction('actAzione', { actionId });
    }
}
