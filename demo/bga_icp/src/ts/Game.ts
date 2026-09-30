import { PlayerTurn } from "./States/PlayerTurn";
import { CirBoardRenderer } from "./board/CirBoard";
import { ImmBoardRenderer } from "./board/ImmBoard";

export class Game {
    public bga: Bga<InCorporeSanoPlayer, InCorporeSanoGamedatas>;
    public gamedatas: InCorporeSanoGamedatas;
    public mySystem: string = '';
    public playerTurn: PlayerTurn;
    // The shared table board: one persistent sub-renderer per system, always
    // visible to everyone. Built once in setup(); survives every state change
    // and F5 refresh. Future systems (Digerente, Nervoso) plug in here.
    public boards!: { cir: CirBoardRenderer; imm: ImmBoardRenderer };

    constructor(bga: Bga<InCorporeSanoPlayer, InCorporeSanoGamedatas>) {
        console.log('incorporesano !constructor');
        this.bga = bga;
        this.playerTurn = new PlayerTurn(this, bga);
        // One shared turn renderer, registered under each apparato's turn-state name
        // (the UI is identical for all systems; Circolatorio's movement is driven by
        // notifications, not by the state name).
        (['CircolatorioTurn', 'DigerenteTurn', 'ImmunitarioTurn', 'NervosoTurn'] as const)
            .forEach(name => this.bga.states.register(name, this.playerTurn));
    }

    setup(gamedatas: InCorporeSanoGamedatas) {
        console.log("Starting game setup");
        this.gamedatas = gamedatas;

        // Main layout: player board on the left, the shared table board on the
        // right. The table board holds one persistent sub-region per system, all
        // always visible; the last two are placeholders for the future systems.
        this.bga.gameArea.getElement().insertAdjacentHTML('beforeend', `
            <div id="ics-layout">
                <div>
                <div id="player-board"></div>
                <div id="player-tables"></div>
                <div id="player_special_area"></div>
                </div>
                <div id="game-board">
                    <div id="board-cir" class="sub-board sub-board--cir"></div>
                    <div id="board-imm" class="sub-board sub-board--imm"></div>
                    <div id="board-dig" class="sub-board sub-board--placeholder"></div>
                    <div id="board-nrv" class="sub-board sub-board--placeholder"></div>
                    <div id="cir-passi-counter" class="cir-passi-counter" style="display:none">Passi: 0</div>
                </div>
            </div>
        `);

        // Instantiate the persistent board renderers now that their containers exist.
        this.boards = {
            cir: new CirBoardRenderer('board-cir'),
            imm: new ImmBoardRenderer('board-imm'),
        };

        // Identify this viewer's own system from gamedatas.
        const myId = this.bga.players.getCurrentPlayerId();
        const me = gamedatas.players[myId];
        if (me) this.mySystem = me.system;
        console.log('[Game] mySystem=', this.mySystem);

        // Player panels: show system label + all resources.
        Object.entries(gamedatas.players).forEach(([pId, player]) => {
            const playerId = Number(pId);
            this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', `
                <div class="system-label">${player.system}</div>
                <div id="resources-${playerId}" class="player-resources"></div>
            `);
            this.renderResources(playerId, player.resources ?? {});

            document.getElementById('player-tables')!.insertAdjacentHTML('beforeend', `
                <div id="player-table-${player.id}" class="player-table">
                    <strong>${player.name}</strong> — ${player.system}
                </div>
            `);
        });

        this.setupNotifications();
        console.log("Ending game setup");
    }

    ///////////////////////////////////////////////////
    //// Utility methods

    renderResources(playerId: number, resources: Record<string, number> | undefined) {
        const container = document.getElementById(`resources-${playerId}`);
        if (!container || !resources) return;
        container.innerHTML = Object.entries(resources)
            .map(([key, amount]) =>
                `<span class="resource">${key}: <span id="res-${playerId}-${key}">${amount}</span></span>`)
            .join(' ');
    }

    ///////////////////////////////////////////////////
    //// Notifications

    setupNotifications() {
        this.bga.notifications.setupPromiseNotifications({});
    }

    async notif_azione(args: AzioneNotifArgs) {
        this.renderResources(args.player_id, args.resources);
        this.renderResources(args.successor_player_id, args.successor_resources);
    }

    async notif_cir_start_movement(args: CirStartMovementNotif) {
        this.renderResources(args.successor_player_id, args.successor_resources);
        const isMe = args.player_id === this.bga.players.getCurrentPlayerId();
        this.playerTurn.onCirStartMovement(args, isMe);
    }

    async notif_cir_boats_updated(args: CirBoatsUpdatedNotif) {
        this.playerTurn.onCirBoatsUpdated(args.boats);
    }

    async notif_imm_start_battle(args: ImmStartBattleNotif) {
        this.renderResources(args.successor_player_id, args.successor_resources);
        const isMe = args.player_id === this.bga.players.getCurrentPlayerId();
        this.playerTurn.onImmStartBattle(args, isMe);
    }

    async notif_imm_bacteria_updated(args: ImmBacteriaUpdatedNotif) {
        this.renderResources(args.player_id, args.resources);
        this.playerTurn.onImmBacteriaUpdated(args.zones);
    }

    async notif_zones_bacteria_spawned(args: ZonesSpawnedNotif) {
        this.playerTurn.onImmBacteriaUpdated(args.zones);
    }
}
