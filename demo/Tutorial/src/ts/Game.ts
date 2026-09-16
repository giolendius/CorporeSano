import { PlayDisc } from "./States/PlayDisc";

export class Game {
    public bga: Bga<tutorialgioelePlayer, tutorialgioeleGamedatas>;
    private gamedatas: tutorialgioeleGamedatas;

    private PlayDisc: PlayDisc;

    constructor(bga: Bga<tutorialgioelePlayer, tutorialgioeleGamedatas>) {
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
    
    setup(gamedatas: tutorialgioeleGamedatas) {
        console.log( "Starting game setup" );
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

        for( var i in gamedatas.board ) {
            const square = gamedatas.board[i];
            
            if( square.player !== null ) {
                this.addDiscOnBoard( square.x, square.y, square.player );
            }
        }
        // TODO: Set up your game interface here, according to "gamedatas"
        

        // Setup game notifications to handle (see "setupNotifications" method below)
        this.setupNotifications();

        console.log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Utility methods
    
    async addDiscOnBoard( x: number, y: number, playerId: number, animate: boolean = true) {
        const color = this.gamedatas.players[ playerId ].color;
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
    };

    
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:
        
        In this method, you associate each of your game notifications with your local method to handle it.
        
        Note: game notification names correspond to "bga->notify->all" calls in your Game.php file.
    
    */
    setupNotifications() {
        console.log( 'notifications subscriptions setup' );
        
        // automatically listen to the notifications, based on the `notif_xxx` function on this class. 
        // Uncomment the logger param to see debug information in the console about notifications.
        this.bga.notifications.setupPromiseNotifications({
            // logger: console.log
        });
    }
    
    // TODO: from this point and below, you can write your game notifications handling methods
    
    /*
    Example:
    async notif_cardPlayed( args ) {
        // Note: args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
        
        // TODO: play the card in the user interface.
    }
    */
}