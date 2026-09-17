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
    cost: number;       // amount taken from successor's resources
    available: boolean; // true if successor has enough
}

interface PlayerTurnArgs {
    system: string;
    successorSystem: string;
    successorResources: number; // total successor resources (summed)
    actions: GameAction[];
}

interface AzioneNotifArgs {
    player_id: number;
    player_name: string;
    action_label: string;
    resources: Record<string, number>;
}
