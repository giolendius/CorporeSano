from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Azione:
    nome: str
    costo: int
    guadagno: int = None
    n_dadi: int = 0


azioni_cervello = [
    Azione("Sonno", costo=0, guadagno=1),
    Azione("Talamo", costo=1, guadagno=2),
    Azione("IpoTalamo", costo=2, guadagno=4),
    Azione("Corteccia", costo=3, guadagno=6),
]

azz_imm = [
    Azione("feritina ", costo=0, n_dadi=1),
    Azione("InfezLoc ", costo=1, n_dadi=1),
    Azione("InfezGlob", costo=2, n_dadi=2),
    Azione("Febbre   ", costo=3, n_dadi=6),
    ]

azioni_dig = [
        Azione("Assorb Min", costo=0, guadagno=1),
        Azione("Assorb Nor", costo=1, guadagno=3),
        Azione("Assorb Int", costo=2, guadagno=4),
    ]

azioni_circol = [
    Azione("Tachicardia", costo=0, guadagno=1),
    Azione("Battito    ", costo=1, guadagno=4),
    Azione("Batte forte", costo=2, guadagno=6),
]
