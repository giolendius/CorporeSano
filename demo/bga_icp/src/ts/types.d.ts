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
    battaglie?: number;     // Immunitario only: battles granted
}

interface PlayerTurnArgs {
    system: string;
    successorSystem: string;
    successorResources: number;
    actions: GameAction[];
    boats: Boat[];
    graph: CirPathCell[][];
    lung_o2: { sx: number; dx: number };
    zones: ImmZone[];
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
    lung_o2: { sx: number; dx: number };
    successor_player_id: number;
    successor_resources: Record<string, number>;
}

interface CirBoatsUpdatedNotif {
    player_id: number;
    player_name: string;
    boats: Boat[];
}

// ── Immunitario ────────────────────────────────────────────────────────────
type VirusType = 'triangolare' | 'quadrato' | 'circolare';

interface ImmZone {
    id: 'a' | 'b' | 'c' | 'd';
    bacteria: VirusType[];            // bacteria present (can mix shapes)
    wb: number;                       // white blood cells in the zone
}

interface ImmCombatEntry { faces: number; threshold: number; }
type ImmCombat = Record<VirusType, ImmCombatEntry>;

interface ImmStartBattleNotif {
    player_id: number;
    battaglie: number;
    zones: ImmZone[];
    combat: ImmCombat;
    successor_player_id: number;
    successor_resources: Record<string, number>;
}

interface ImmBacteriaUpdatedNotif {
    player_id: number;
    player_name: string;
    zones: ImmZone[];
    resources: Record<string, number>;
}

interface ZonesSpawnedNotif {
    zones: ImmZone[];
}
