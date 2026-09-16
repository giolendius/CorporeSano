interface InCorporeSanoPlayer extends Player {
    system: string; // body system key: circulatory | digestive | immune | nervous
    resources: Record<string, number>; // resource_key => amount
}

interface InCorporeSanoGamedatas extends Gamedatas<InCorporeSanoPlayer> {
    // Add here variables you set up in getAllDatas
}

/*
 * Describe here the types for your state args
 */
interface PlayerTurnArgs {
    system: string;
}

/*
 * Describe here the types for your notif args
 */
interface AzioneNotifArgs {
    player_id: number;
    player_name: string;
    resources: Record<string, number>;
}