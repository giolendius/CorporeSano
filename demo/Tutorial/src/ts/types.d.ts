interface tutorialgioelePlayer extends Player {
    energy: number; // any information you add on each result['players']
}

interface tutorialgioeleGamedatas extends Gamedatas<tutorialgioelePlayer> {
    // Add here variables you set up in getAllDatas
}
   
/*
 * Describe here the types for your state args
 */
interface PlayerTurnArgs {
    playableCardsIds: number[];
}
   
type PossibleMoves = {[x: number]: {[y: number]: boolean } };
interface PlayDiscArgs {
    possibleMoves: PossibleMoves;
}
