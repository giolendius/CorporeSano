interface InCorporeSanoPlayer extends Player {
    system: string;                       // BodySystem raw value (circulatory | digestive | immune | nervous)
    resources: Record<string, number>;    // resource_key => amount
}

interface InCorporeSanoGamedatas extends Gamedatas<InCorporeSanoPlayer> {
    // variables added in getAllDatas go here
}

interface GameAction {
    id: number;
    label: string;
    cost: number;           // amount taken from successor's resources
    available: boolean;     // true if successor has enough
    movements?: number;     // Circolatorio only: boat steps granted
    target?: 'one' | 'all'; // Circolatorio only: one boat or all boats
}

interface PlayerTurnArgs {
    system: string;
    successorSystem: string;
    successorResources: number;
    actions: GameAction[];
    boats: Boat[];
    graph: CirPathCell[][];
}

interface AzioneNotifArgs {
    player_id: number;
    player_name: string;
    action_label: string;
    resources: Record<string, number>;
    successor_player_id: number;
    successor_resources: Record<string, number>;
}

interface Boat {
    id: number;
    path: number;   // -1 = heart
    cell: number;   // -1 = heart
    o2: number;
    co2: number;
    wb: number;
}

interface CirPathCell {
    id: string;
    name?: string;
    side?: string[];
}

interface CirStartMovementNotif {
    player_id: number;
    movements: number;
    target: 'one' | 'all';
    boats: Boat[];
    graph: CirPathCell[][];
    successor_player_id: number;
    successor_resources: Record<string, number>;
}

interface CirBoatsUpdatedNotif {
    player_id: number;
    player_name: string;
    boats: Boat[];
}
