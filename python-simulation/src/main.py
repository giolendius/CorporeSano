import plotly.graph_objects as go
from scripts.apparati import Cervello, Cuore, Stomaco, Immunitario, setup_logger

ROUNDS = 20

COLORS = {
    "Cuore":       "#d94f4f",
    "Stomaco":     "#4caf72",
    "Immunitario": "#e0962a",
    "Cervello":    "#4a78d4",
}


def simulate(rounds: int):
    logger = setup_logger(" ")
    cervello    = Cervello()
    immunitario = Immunitario(apparato=cervello)
    stomaco     = Stomaco(apparato=immunitario)
    cuore       = Cuore(apparato=stomaco)
    cervello.apparato_succ = cuore

    organi = [cuore, stomaco, immunitario, cervello]

    history_risorsa = {o.nome: [] for o in organi}
    history_pot     = {o.nome: [] for o in organi}

    for organo in organi:
        history_risorsa[organo.nome].append(organo.risorsa)
        history_pot[organo.nome].append(organo.livello_potenziamento)

    for _ in range(rounds):
        for organo in organi:
            organo.potenzia()
            organo.turno()
            logger.info("")
        for organo in organi:
            history_risorsa[organo.nome].append(organo.risorsa)
            history_pot[organo.nome].append(organo.livello_potenziamento)

    return history_risorsa, history_pot


def plot(history_risorsa, history_pot, rounds):
    xs = list(range(0, rounds + 1))
    fig = go.Figure()

    for nome, color in COLORS.items():
        # risorsa — solid line
        fig.add_trace(go.Scatter(
            x=xs, y=history_risorsa[nome],
            name=nome,
            mode="lines+markers",
            line=dict(color=color, width=3),
            marker=dict(size=5),
            legendgroup=nome,
        ))
        # potenziamento — dashed step line, same scale, same legend group
        fig.add_trace(go.Scatter(
            x=xs, y=history_pot[nome],
            name=f"{nome} (pot.)",
            mode="lines",
            line=dict(color=color, width=2, dash="dash"),
            opacity=0.4,
            legendgroup=nome,
            line_shape="hv",
        ))

    fig.update_layout(
        title=f"Simulazione {rounds} round — risorsa (solido) · potenziamento (tratteggio)",
        xaxis=dict(
            title="Turno",
            tickmode="linear",
            dtick=1,
        ),
        yaxis=dict(title="Valore"),
        legend=dict(groupclick="togglegroup"),
        template="plotly_white",
        hovermode="x unified",
    )

    fig.show()


def main():
    history_risorsa, history_pot = simulate(ROUNDS)
    plot(history_risorsa, history_pot, ROUNDS)


if __name__ == '__main__':
    main()
