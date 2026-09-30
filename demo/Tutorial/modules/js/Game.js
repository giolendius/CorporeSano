/**
 * We create one State class per declared state on the PHP side, to handle all state specific code here.
 * onEnteringState, onLeavingState and onPlayerActivationChange are predefined names that will be called by the framework.
 * When executing code in this state, you can access the args using this.args
 */
class PlayDisc {
    constructor(game, bga) {
        this.game = game;
        this.bga = bga;
        this.game = game;
        this.bga = bga;
    }
    /**
     * This method is called each time we are entering the game state. You can use this method to perform some user interface changes at this moment.
     */
    onEnteringState(args, isCurrentPlayerActive) {
        this.bga.statusBar.setTitle(isCurrentPlayerActive ?
            _('${you} must play a dddisc') :
            _('${actplayer} must play a dddisc'));
        console.log('mosse possibili', args.possibleMoves);
        if (isCurrentPlayerActive) {
            this.updatePossibleMoves(args.possibleMoves);
        }
    }
    /**
     * This method is called each time we are leaving the game state. You can use this method to perform some user interface changes at this moment.
     */
    onLeavingState(args, isCurrentPlayerActive) {
    }
    /**
     * This method is called each time the current player becomes active or inactive in a MULTIPLE_ACTIVE_PLAYER state. You can use this method to perform some user interface changes at this moment.
     * on MULTIPLE_ACTIVE_PLAYER states, you may want to call this function in onEnteringState using `this.onPlayerActivationChange(args, isCurrentPlayerActive)` at the end of onEnteringState.
     * If your state is not a MULTIPLE_ACTIVE_PLAYER one, you can delete this function.
     */
    onPlayerActivationChange(args, isCurrentPlayerActive) {
    }
    onCardClick(card_id) {
        console.log('onCardClick', card_id);
        this.bga.actions.performAction("actPlayCard", {
            card_id,
        }).then(() => {
            // What to do after the server call if it succeeded
            // (most of the time, nothing, as the game will react to notifs / change of state instead, so you can delete the `then`)
        });
    }
    updatePossibleMoves(possibleMoves) {
        // Remove current possible moves
        document.querySelectorAll('.selectable').forEach(div => div.classList.remove('selectable'));
        for (let x in possibleMoves) {
            for (let y in possibleMoves[x]) {
                // x,y is a possible move
                document.getElementById(`square_${x}_${y}`).classList.add('selectable');
            }
        }
        this.bga.gameui.addTooltipToClass('selectable', '', _('Place a disc here'));
    }
}

class Game {
    constructor(bga) {
        console.log('tutorialgioele constructor');
        this.bga = bga;
        // Declare the State classes
        this.PlayDisc = new PlayDisc(this, bga);
        this.bga.states.register('PlayDisc', this.PlayDisc);
        // Uncomment the next line to show debug informations about state changes in the console. Remove before going to production!
        // this.bga.states.logger = console.log;
        // Here, you can init the global variables of your user interface
        // Example:
        // this.myGlobalValue = 0;
    }
    /*
        setup:
        
        This method must set up the game user interface according to current game situation specified
        in parameters.
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
        
        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    setup(gamedatas) {
        console.log("Starting game setup");
        this.gamedatas = gamedatas;
        // Example to add a div on the game area
        this.bga.gameArea.getElement().insertAdjacentHTML('beforeend', `
            <div id="board"></div>
        `);
        const board = document.getElementById('board');
        const board_size = 8;
        for (let x = 1; x <= board_size; x++) {
            for (let y = 1; y <= board_size; y++) {
                board.insertAdjacentHTML(`beforeend`, `<div id="square_${x}_${y}" data-x="${x}" data-y="${y}" class="square board"></div>`);
                document.getElementById(`square_${x}_${y}`).addEventListener('click', e => this.onPlayDisc(x, y));
            }
        }
        // Setting up player boards
        Object.entries(gamedatas.players).forEach(([pId, player]) => {
            const playerId = Number(pId);
            // example of setting up players boards
            this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', `
                <span id="energy-player-counter-${playerId}"></span> Energy
            `);
            const counter = new ebg.counter();
            counter.create(`energy-player-counter-${playerId}`, {
                value: player.energy,
                playerCounter: 'energy',
                playerId: playerId,
            });
        });
        for (var i in gamedatas.board) {
            const square = gamedatas.board[i];
            if (square.player !== null) {
                this.addDiscOnBoard(square.x, square.y, square.player);
            }
        }
        // TODO: Set up your game interface here, according to "gamedatas"
        // Setup game notifications to handle (see "setupNotifications" method below)
        this.setupNotifications();
        console.log("Ending game setup");
    }
    ///////////////////////////////////////////////////
    //// Utility methods
    async addDiscOnBoard(x, y, playerId, animate = true) {
        const color = this.gamedatas.players[playerId].color;
        const discId = `disc_${x}_${y}`;
        document.getElementById(`square_${x}_${y}`).insertAdjacentHTML('beforeend', `
                <div class="disc" data-color="${color}" id="${discId}">
                    <div class="disc-faces">
                        <div class="disc-face" data-side="white"></div>
                        <div class="disc-face" data-side="black"></div>
                    </div>
                </div>
            `);
        if (animate) {
            const element = document.getElementById(discId);
            await this.animationManager.fadeIn(element, document.getElementById(`overall_player_board_${playerId}`));
        }
    }
    ;
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:
        
        In this method, you associate each of your game notifications with your local method to handle it.
        
        Note: game notification names correspond to "bga->notify->all" calls in your Game.php file.
    
    */
    setupNotifications() {
        console.log('notifications subscriptions setup');
        // automatically listen to the notifications, based on the `notif_xxx` function on this class. 
        // Uncomment the logger param to see debug information in the console about notifications.
        this.bga.notifications.setupPromiseNotifications({
        // logger: console.log
        });
    }
}

export { Game };
