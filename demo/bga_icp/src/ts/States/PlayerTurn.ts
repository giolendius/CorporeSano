import { Game } from "../Game";
import { CirBoardRenderer } from "../board/CirBoard";
import { ImmBoardRenderer, ImmTarget } from "../board/ImmBoard";

export class PlayerTurn {
    private cirBoard: CirBoardRenderer | null = null;
    private currentGraph: CirPathCell[][] = [];

    // Client-side movement state (not persisted until actConfirmMovimento)
    private movementBoats: Boat[] = [];
    private passiRimanenti = 0;
    private movementTarget: 'one' | 'all' = 'one';
    private selectedBoat: number | null = null;
    private lungO2: { sx: number; dx: number } = { sx: 0, dx: 0 };
    private lungSxUsed = 0;
    private lungDxUsed = 0;
    private reserveO2Gained = 0;
    private static readonly BOAT_CAPACITY = 5;

    // Immunitario battle state (not persisted until actConfirmBattaglie)
    private immBoard: ImmBoardRenderer | null = null;
    private zones: ImmZone[] = [];
    private battaglieRimanenti = 0;
    private combat: ImmCombat | null = null;
    private selectedTarget: ImmTarget | null = null;
    private pendingRoll: { dice: number[]; threshold: number; success: boolean } | null = null;

    constructor(private game: Game, private bga: Bga<InCorporeSanoPlayer, InCorporeSanoGamedatas>) {}

    onEnteringState(args: PlayerTurnArgs, isCurrentPlayerActive: boolean) {
        console.log('[PlayerTurn] onEnteringState', { args, isCurrentPlayerActive });

        this.bga.statusBar.setTitle(isCurrentPlayerActive ?
            _('${you} must choose an action') :
            _('${actplayer} must choose an action')
        );

        this.renderPlayerBoard(args, isCurrentPlayerActive);

        // The table board is one shared, always-visible thing: render every
        // sub-board from args every turn, for every viewer. Interactivity is
        // layered on later by the phase notifications (movement / battle).
        this.cirBoard = this.game.boards.cir;
        this.immBoard = this.game.boards.imm;
        this.currentGraph = args.graph ?? [];
        this.zones = (args.zones ?? []).map(z => ({ ...z, bacteria: [...z.bacteria] }));

        this.cirBoard.setLungO2(args.lung_o2 ?? { sx: 0, dx: 0 });
        this.cirBoard.render(this.currentGraph, args.boats ?? []);
        this.immBoard.render(this.zones);
    }

    onLeavingState(_args: PlayerTurnArgs, _isCurrentPlayerActive: boolean) {
        const board = document.getElementById('player-board');
        if (board) board.innerHTML = '';
        const special = document.getElementById('player_special_area');
        if (special) special.innerHTML = '';
        // The table board stays drawn — only drop interactivity and phase state.
        this.cirBoard?.clearInteractive();
        this.immBoard?.clearInteractive();
        this.resetMovementState();
        this.resetBattleState();
        this.updatePassiCounter();
    }

    onPlayerActivationChange(_args: PlayerTurnArgs, _isCurrentPlayerActive: boolean) {}

    /** Called by Game.ts when server notifies Circolatorio must move boats. */
    onCirStartMovement(notif: CirStartMovementNotif, isMe: boolean) {
        this.movementBoats = notif.boats.map(b => ({ ...b }));
        this.passiRimanenti = notif.movements;
        this.movementTarget = notif.target;
        this.selectedBoat = null;
        this.lungO2 = { ...notif.lung_o2 };
        this.lungSxUsed = 0;
        this.lungDxUsed = 0;
        this.reserveO2Gained = 0;

        this.updatePassiCounter();

        if (!isMe) return;

        this.cirBoard?.setLungO2(this.lungO2);
        this.cirBoard?.setInteractive(
            (boatId) => this.onBoatSelected(boatId),
            (path, cell) => this.onNodeClicked(path, cell),
            this.movementBoats,
        );

        this.refreshO2Controls();
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

    /** Called by Game.ts when server notifies the Immunitario battle phase starts. */
    onImmStartBattle(notif: ImmStartBattleNotif, isMe: boolean) {
        this.zones = notif.zones.map(z => ({ ...z, bacteria: [...z.bacteria] }));
        this.battaglieRimanenti = notif.battaglie;
        this.combat = notif.combat;
        this.selectedTarget = null;
        this.pendingRoll = null;
        this.immBoard?.render(this.zones);

        if (!isMe) return;

        this.immBoard?.setInteractive((target) => this.onTargetSelected(target));
        this.refreshBattleControls();
    }

    /** Called for everyone after the Immunitario confirms — keeps viewers in sync. */
    onImmBacteriaUpdated(zones: ImmZone[]) {
        this.zones = zones.map(z => ({ ...z, bacteria: [...z.bacteria] }));
        this.immBoard?.render(this.zones);
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
            const batLabel  = a.battaglie !== undefined ? ` · ${a.battaglie} battaglie` : '';
            return `
                <div class="pb-action pb-action--locked" data-action-id="${a.id}">
                    <span class="pb-action-name">${a.label}</span>
                    <span class="pb-action-cost">${costLabel}${movLabel}${batLabel}</span>
                </div>
            `;
        }).join('') || `<div class="pb-action pb-action--locked">—</div>`;

        board.innerHTML = `
            <div class="pb-left">
                <div class="pb-system-name">${mySystem}</div>
            </div>
            <div class="pb-right">
                <div class="pb-upgrade-row">
                    <button class="action-button bgabutton bgabutton_blue pb-btn" id="btn-potenziamento"
                        ${isActive ? '' : 'disabled'}>Pot.</button>
                    <button class="action-button bgabutton bgabutton_gray pb-btn" id="btn-no-potenziamento"
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

    private updatePassiCounter() {
        const counter = document.getElementById('cir-passi-counter');
        if (!counter) return;
        counter.style.display = this.passiRimanenti > 0 ? 'block' : 'none';
        counter.textContent = `Passi: ${this.passiRimanenti}`;
    }

    // ── Immunitario battle handlers ────────────────────────────────────────────

    private hasValidTargets(): boolean {
        return this.zones.some(z => z.bacteria.length >= 1 && z.wb >= 1);
    }

    /** Rebuilds #player_special_area + status-bar buttons from the current battle state. */
    private refreshBattleControls() {
        const area = document.getElementById('player_special_area');
        this.bga.statusBar.removeActionButtons();

        // No battles left (or nothing killable) → offer Fine Turno.
        if (this.battaglieRimanenti <= 0 || !this.hasValidTargets()) {
            if (area) area.innerHTML = `<div class="imm-battaglie-counter">${_('Battaglie')}: ${Math.max(0, this.battaglieRimanenti)}</div>`;
            this.bga.statusBar.addActionButton(_('Fine Turno'), () => this.confirmBattaglie(), { id: 'btn-fine-turno', color: 'primary' });
            return;
        }

        // A roll is pending → show result + Avanti.
        if (this.pendingRoll) {
            const pr = this.pendingRoll;
            const diceStr = pr.dice.length ? pr.dice.join(' ') : '—';
            const okCls = pr.success ? 'imm-dice--ok' : 'imm-dice--ko';
            if (area) area.innerHTML = `
                <div class="imm-battaglie-counter">${_('Battaglie')}: ${this.battaglieRimanenti}</div>
                <div class="imm-dice-display ${okCls}">${diceStr} &gt; ${pr.threshold} ${pr.success ? '✓' : '✗'}</div>`;
            this.bga.statusBar.addActionButton(_('Avanti'), () => this.onAvanti(), { id: 'btn-avanti', color: 'primary' });
            return;
        }

        // Selecting a bacterium → offer INFIAMMAZIONE once one is picked.
        const canRoll = this.selectedTarget !== null;
        if (area) area.innerHTML = `
            <div class="imm-battaglie-counter">${_('Battaglie')}: ${this.battaglieRimanenti}</div>
            <div class="imm-hint">${canRoll ? _('Batterio selezionato') : _('Seleziona un batterio da infiammare')}</div>
            ${canRoll ? `<button class="bga-button bga-button--action pb-btn" id="btn-infiammazione">${_('INFIAMMAZIONE')}</button>` : ''}`;
        if (canRoll) {
            document.getElementById('btn-infiammazione')?.addEventListener('click', () => this.onInfiammazione());
        }
    }

    private onTargetSelected(target: ImmTarget) {
        if (this.pendingRoll) return; // locked until Avanti resolves
        this.selectedTarget = target;
        this.immBoard?.selectTarget(target.zoneId, target.index);
        this.immBoard?.render(this.zones);
        this.refreshBattleControls();
    }

    private selectedBacterium(): { zone: ImmZone; type: VirusType } | null {
        if (!this.selectedTarget) return null;
        const zone = this.zones.find(z => z.id === this.selectedTarget!.zoneId);
        const type = zone?.bacteria[this.selectedTarget.index];
        return zone && type ? { zone, type } : null;
    }

    private onInfiammazione() {
        const sel = this.selectedBacterium();
        if (!sel || !this.combat) return;

        const { faces, threshold } = this.combat[sel.type];
        const dice: number[] = [];
        for (let i = 0; i < sel.zone.wb; i++) dice.push(1 + Math.floor(Math.random() * faces));
        const best = dice.length ? Math.max(...dice) : 0;

        this.pendingRoll = { dice, threshold, success: best > threshold };
        this.refreshBattleControls();
    }

    private onAvanti() {
        if (!this.pendingRoll) return;

        const sel = this.selectedBacterium();
        if (sel && this.pendingRoll.success) {
            this.bumpResource('virus_' + sel.type);
            sel.zone.bacteria.splice(this.selectedTarget!.index, 1);
        }

        this.battaglieRimanenti--;
        this.selectedTarget = null;
        this.pendingRoll = null;
        this.immBoard?.selectTarget(null, null);
        this.immBoard?.render(this.zones);
        this.refreshBattleControls();
    }

    private confirmBattaglie() {
        this.bga.statusBar.removeActionButtons();
        this.immBoard?.clearInteractive();
        const area = document.getElementById('player_special_area');
        if (area) area.innerHTML = '';
        this.bga.actions.performAction('actConfirmBattaglie', { zones: JSON.stringify(this.zones) });
    }

    /** Optimistically bump a resource span for immediate feedback (server confirms later). */
    private bumpResource(key: string) {
        const myId = this.bga.players.getCurrentPlayerId();
        const span = document.getElementById(`res-${myId}-${key}`);
        if (span) span.textContent = String((parseInt(span.textContent || '0', 10) || 0) + 1);
    }

    private resetBattleState() {
        this.zones = [];
        this.battaglieRimanenti = 0;
        this.combat = null;
        this.selectedTarget = null;
        this.pendingRoll = null;
    }

    // ── Movement handlers ─────────────────────────────────────────────────────

    private onBoatSelected(boatId: number) {
        this.selectedBoat = boatId;
        this.cirBoard?.selectBoat(boatId);

        const boat = this.movementBoats.find(b => b.id === boatId);
        if (boat) {
            this.updateO2ActionsForSelectedBoat();
            // highlightReachable does the single render (selection ring + green nodes + O2 buttons)
            this.cirBoard?.highlightReachable(boat.path, boat.cell, this.passiRimanenti);
        }
    }

    private onNodeClicked(path: number, cell: number) {
        if (this.selectedBoat === null || this.passiRimanenti <= 0) return;

        const boat = this.movementBoats.find(b => b.id === this.selectedBoat);
        if (!boat) return;

        const cost = this.cirBoard?.getStepCost(path, cell) ?? 1;
        boat.path = path;
        boat.cell = cell;
        this.passiRimanenti -= cost;
        this.selectedBoat = null;

        this.cirBoard?.selectBoat(null);
        this.cirBoard?.clearHighlights();
        this.cirBoard?.clearO2Actions();
        this.cirBoard?.render(this.currentGraph, this.movementBoats);
        this.updatePassiCounter();
        this.refreshO2Controls();

        if (this.passiRimanenti === 0) this.cirBoard?.clearInteractive();
    }

    private confirmMovimento() {
        this.bga.statusBar.removeActionButtons();
        this.cirBoard?.clearO2Actions();
        this.cirBoard?.clearInteractive();
        this.bga.actions.performAction('actConfirmMovimento', {
            finalBoats: JSON.stringify(this.movementBoats),
            lungSxUsed: this.lungSxUsed,
            lungDxUsed: this.lungDxUsed,
            reserveO2Gained: this.reserveO2Gained,
        });
    }

    private resetMovementState() {
        this.movementBoats = [];
        this.passiRimanenti = 0;
        this.selectedBoat = null;
        this.lungO2 = { sx: 0, dx: 0 };
        this.lungSxUsed = 0;
        this.lungDxUsed = 0;
        this.reserveO2Gained = 0;
    }

    private getLungSide(boat: Boat): 'sx' | 'dx' | null {
        if (boat.path === 1 && boat.cell === 3) return 'sx';
        if (boat.path === 3 && boat.cell === 3) return 'dx';
        return null;
    }

    private refreshO2Controls(): void {
        this.bga.statusBar.removeActionButtons();
        this.bga.statusBar.addActionButton(_('Conferma'), () => this.confirmMovimento(), { id: 'btn-confirm-movement', color: 'primary' });
        this.bga.statusBar.addActionButton(_('Salta passi'), () => this.confirmMovimento(), { id: 'btn-skip-movement' });
        // Carica/Scarica O2 are shown as SVG overlay buttons via updateO2ActionsForSelectedBoat
    }

    /** Recomputes which O2 actions are available for the selected boat and tells the board renderer. */
    private updateO2ActionsForSelectedBoat(): void {
        if (this.selectedBoat === null || !this.cirBoard) {
            this.cirBoard?.clearO2Actions();
            return;
        }
        const boat = this.movementBoats.find(b => b.id === this.selectedBoat);
        if (!boat) { this.cirBoard.clearO2Actions(); return; }

        const side = this.getLungSide(boat);
        const isHeart = boat.path === -1;
        const lungHasO2 = side === 'sx' ? this.lungO2.sx > 0 : side === 'dx' ? this.lungO2.dx > 0 : false;
        const hasCapacity = (boat.o2 + boat.co2 + boat.wb) < PlayerTurn.BOAT_CAPACITY;

        const onCarica = (side && lungHasO2 && hasCapacity) ? () => this.onCaricaO2() : null;
        const onScarica = (isHeart && boat.o2 > 0) ? () => this.onScaricaO2() : null;

        this.cirBoard.setO2Actions(this.selectedBoat, onCarica, onScarica);
    }

    private onCaricaO2(): void {
        if (this.selectedBoat === null) return;
        const boat = this.movementBoats.find(b => b.id === this.selectedBoat);
        if (!boat) return;
        const side = this.getLungSide(boat);
        if (!side) return;
        const lungHasO2 = side === 'sx' ? this.lungO2.sx > 0 : this.lungO2.dx > 0;
        if (!lungHasO2 || (boat.o2 + boat.co2 + boat.wb) >= PlayerTurn.BOAT_CAPACITY) return;

        if (side === 'sx') { this.lungO2.sx--; this.lungSxUsed++; }
        else               { this.lungO2.dx--; this.lungDxUsed++; }
        boat.o2++;
        this.updateO2ActionsForSelectedBoat();
        this.cirBoard?.setLungO2(this.lungO2);
        this.cirBoard?.render(this.currentGraph, this.movementBoats);
        this.refreshO2Controls();
    }

    private onScaricaO2(): void {
        if (this.selectedBoat === null) return;
        const boat = this.movementBoats.find(b => b.id === this.selectedBoat);
        if (!boat || boat.path !== -1 || boat.o2 <= 0) return;
        boat.o2--;
        this.reserveO2Gained++;
        this.bumpResource('o2');
        this.updateO2ActionsForSelectedBoat();
        this.cirBoard?.render(this.currentGraph, this.movementBoats);
        this.refreshO2Controls();
    }

    private onActionClick(actionId: number) {
        console.log('[PlayerTurn] action clicked:', actionId);
        this.bga.actions.performAction('actAzione', { actionId });
    }
}
