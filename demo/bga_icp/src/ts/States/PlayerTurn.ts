import { Game } from "../Game";

export class PlayerTurn {
    constructor(private game: Game, private bga: Bga<InCorporeSanoPlayer, InCorporeSanoGamedatas>) {}

    onEnteringState(args: PlayerTurnArgs, isCurrentPlayerActive: boolean) {
        console.log('[PlayerTurn] onEnteringState', { args, isCurrentPlayerActive });

        this.bga.statusBar.setTitle(isCurrentPlayerActive ?
            _('${you} must choose an action') :
            _('${actplayer} must choose an action')
        );

        this.renderPlayerBoard(args, isCurrentPlayerActive);
    }

    onLeavingState(_args: PlayerTurnArgs, _isCurrentPlayerActive: boolean) {
        const board = document.getElementById('player-board');
        if (board) board.innerHTML = '';
    }

    onPlayerActivationChange(_args: PlayerTurnArgs, _isCurrentPlayerActive: boolean) {}

    // ------------------------------------------------------------------ //

    private renderPlayerBoard(args: PlayerTurnArgs, isActive: boolean) {
        const board = document.getElementById('player-board');
        if (!board) {
            console.error('[PlayerTurn] #player-board not found');
            return;
        }

        // Show the VIEWER's own system name, not the active player's.
        const mySystem = this.game.mySystem || args.system || '—';
        const actions = args.actions ?? [];
        console.log('[PlayerTurn] mySystem=', mySystem, 'actions=', actions.length, 'isActive=', isActive);

        const actionsHtml = actions.map(a => `
            <div class="pb-action pb-action--locked" data-action-id="${a.id}">
                <span class="pb-action-name">${a.label}</span>
                <span class="pb-action-cost">${a.cost > 0 ? `costo ${a.cost}` : 'gratuita'}</span>
            </div>
        `).join('') || `<div class="pb-action pb-action--locked pb-action--placeholder">—</div>`;

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
            const upgradeRow = document.querySelector('.pb-upgrade-row');
            if (upgradeRow) {
                (upgradeRow as HTMLElement).style.display = 'none';
            }

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

    private onActionClick(actionId: number) {
        console.log('[PlayerTurn] action clicked:', actionId);
        this.bga.actions.performAction('actAzione', { actionId });
    }
}
