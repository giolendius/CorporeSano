import { Game } from "../Game";

/**
 * We create one State class per declared state on the PHP side, to handle all state specific code here.
 * onEnteringState, onLeavingState and onPlayerActivationChange are predefined names that will be called by the framework.
 * When executing code in this state, you can access the args using this.args
 */
export class PlayerTurn {
    constructor(private game: Game, private bga: Bga<InCorporeSanoPlayer, InCorporeSanoGamedatas>) {
    }

    /**
     * This method is called each time we are entering the game state. You can use this method to perform some user interface changes at this moment.
     */
    onEnteringState(args: PlayerTurnArgs, isCurrentPlayerActive: boolean) {
        this.bga.statusBar.setTitle(isCurrentPlayerActive ?
            _('${you} must use your action') :
            _('${actplayer} must use their action')
        );

        if (isCurrentPlayerActive) {
            // Azione 0: unica azione disponibile ora (+1 alla propria risorsa)
            this.bga.statusBar.addActionButton(
                _('Azione 0 — ${system}').replace('${system}', args.system),
                () => this.onActionClick(),
                { id: 'btn-azione-0' }
            );

            // Azioni 1 e 2: placeholder disabilitate (da implementare in futuro)
            this.bga.statusBar.addActionButton(
                _('Azione 1'),
                () => {},
                { id: 'btn-azione-1', color: 'secondary', classes: 'disabled' }
            );
            this.bga.statusBar.addActionButton(
                _('Azione 2'),
                () => {},
                { id: 'btn-azione-2', color: 'secondary', classes: 'disabled' }
            );
        }
    }

    /**
     * This method is called each time we are leaving the game state. You can use this method to perform some user interface changes at this moment.
     */
    onLeavingState(args: PlayerTurnArgs, isCurrentPlayerActive: boolean) {
    }

    /**
     * This method is called each time the current player becomes active or inactive in a MULTIPLE_ACTIVE_PLAYER state. You can use this method to perform some user interface changes at this moment.
     * on MULTIPLE_ACTIVE_PLAYER states, you may want to call this function in onEnteringState using `this.onPlayerActivationChange(args, isCurrentPlayerActive)` at the end of onEnteringState.
     * If your state is not a MULTIPLE_ACTIVE_PLAYER one, you can delete this function.
     */
    onPlayerActivationChange(args: PlayerTurnArgs, isCurrentPlayerActive: boolean) {
    }

    
    onActionClick() {
        this.bga.actions.performAction("actAzione");
    }
}
