import { Game } from "../Game";

/**
 * We create one State class per declared state on the PHP side, to handle all state specific code here.
 * onEnteringState, onLeavingState and onPlayerActivationChange are predefined names that will be called by the framework.
 * When executing code in this state, you can access the args using this.args
 */
export class PlayDisc {
    constructor(private game: Game, private bga: Bga<EmptyGamePlayer, EmptyGameGamedatas>) {
        this.game = game;
        this.bga = bga;
    }

    /**
     * This method is called each time we are entering the game state. You can use this method to perform some user interface changes at this moment.
     */
    onEnteringState(args: PlayerTurnArgs, isCurrentPlayerActive: boolean) {
        this.bga.statusBar.setTitle(isCurrentPlayerActive ? 
            _('${you} must play a dddisc') :
            _('${actplayer} must play a dddisc')
        );
        console.log('mosse possibili', args.possibleMoves);
        if (isCurrentPlayerActive) {
            this.updatePossibleMoves(args.possibleMoves);        }
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

    
    onCardClick(card_id: number) {
        console.log( 'onCardClick', card_id );

        this.bga.actions.performAction("actPlayCard", { 
            card_id,
        }).then(() =>  {                
            // What to do after the server call if it succeeded
            // (most of the time, nothing, as the game will react to notifs / change of state instead, so you can delete the `then`)
        });        
    }

    updatePossibleMoves(possibleMoves: PossibleMoves) {
        // Remove current possible moves
        document.querySelectorAll('.selectable').forEach(div => div.classList.remove('selectable'));

        for( let x in possibleMoves ) {
            for( let y in possibleMoves[ x ] ) {
                // x,y is a possible move
                document.getElementById(`square_${x}_${y}`).classList.add('selectable');
            }            
        }
                    
        this.bga.gameui.addTooltipToClass( 'selectable', '', _('Place a disc here') );
    }
}
