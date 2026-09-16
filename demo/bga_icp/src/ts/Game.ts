import { PlayerTurn } from "./States/PlayerTurn";

export class Game {
    public bga: Bga<InCorporeSanoPlayer, InCorporeSanoGamedatas>;
    private gamedatas: InCorporeSanoGamedatas;

    private playerTurn: PlayerTurn;

    constructor(bga: Bga<InCorporeSanoPlayer, InCorporeSanoGamedatas>) {
        console.log('incorporesano !constructor');
        this.bga = bga;

        // Declare the State classes
        this.playerTurn = new PlayerTurn(this, bga);
        this.bga.states.register('PlayerTurn', this.playerTurn);

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
    
    setup(gamedatas: InCorporeSanoGamedatas) {
        console.log( "Starting game setup" );
        this.gamedatas = gamedatas;

        // Example to add a div on the game area
        this.bga.gameArea.getElement().insertAdjacentHTML('beforeend', `
            <div id="player-tables">viva le tabelleeeee</div>
            <div> meglio così </div>
        `);
        
        // Setting up player boards
        Object.entries(gamedatas.players).forEach(([pId, player]) => {
            const playerId = Number(pId);

            // Show the player's body system and its resources in the panel.
            this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', `
                <div class="system-label">${player.system}</div>
                <div id="resources-${playerId}" class="player-resources"></div>
            `);
            this.renderResources(playerId, player.resources ?? {});

            // A per-player zone in the game area.
            document.getElementById('player-tables').insertAdjacentHTML('beforeend', `
                <div id="player-table-${player.id}">
                    <strong>${player.name}</strong> — ${player.system}
                </div>
            `);
        });
        
        // TODO: Set up your game interface here, according to "gamedatas"
        

        // Setup game notifications to handle (see "setupNotifications" method below)
        this.setupNotifications();

        console.log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Utility methods

    private renderResources(playerId: number, resources: Record<string, number> | undefined) {
        const container = document.getElementById(`resources-${playerId}`);
        if (!container || !resources) return;
        container.innerHTML = Object.entries(resources)
            .map(([key, amount]) =>
                `<span class="resource">${key}: <span id="res-${playerId}-${key}">${amount}</span></span>`)
            .join(' ');
    }


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
    
    // Game notification handlers.

    async notif_azione(args: AzioneNotifArgs) {
        this.renderResources(args.player_id, args.resources);
    }
}