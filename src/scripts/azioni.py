from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Azione:
    nome: str
    costo: int
    guadagno: int = None


azioni_cervello = [
    Azione("Sonno", costo=0, guadagno=1),
    Azione("Talamo", costo=1, guadagno=2),
    Azione("IpoTalamo", costo=2, guadagno=4),
    Azione("Corteccia", costo=3, guadagno=6),
]


@dataclass
class AzioneIm(Azione):
    n_dadi: int = None


azioni_imm = [
    AzioneIm("feritina ", costo=0, n_dadi=1),
    AzioneIm("InfezLoc ", costo=1, n_dadi=1),
    AzioneIm("InfezGlob", costo=2, n_dadi=2),
    AzioneIm("Febbre   ", costo=3, n_dadi=6),
    ]


azioni_dig = [
        Azione("Assorb Min", costo=0, guadagno=1),
        Azione("Assorb Nor", costo=1, guadagno=3),
        Azione("Assorb Int", costo=2, guadagno=4),
    ]


@dataclass
class AzioneCirc(Azione):
    movimenti: int = None


azioni_circol = [
    AzioneCirc("Tachicardia", costo=0, movimenti=2),
    AzioneCirc("Battito    ", costo=1, movimenti=4),
    AzioneCirc("Batte forte", costo=2, movimenti=10),
]
