from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import ClassVar
import logging
import random


@dataclass
class Azione:
    nome: str
    costo: int
    guadagno: int = None
    n_dadi: int = 0


def setup_logger(
        name: str
) -> logging.Logger:
    """
    general logger configurator
    :param name: logger name, generally the script or class name
    :return: the logger, with debug level in development (change into info in production)
    """
    logger = logging.getLogger(name)
    logging.basicConfig(format="%(name)-12s -- %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
    logger.setLevel(logging.DEBUG)
    return logger



class Apparato(ABC):
    AZIONI: ClassVar[list[Azione]] = []

    def __init__(self, apparato: Apparato | None = None):

        self.risorsa: int = 3
        self.logger = setup_logger(f"{self.nome}")
        self.livello_potenziamento: int = 0
        self.apparato_succ = apparato

    @property
    def nome(self) -> str:
        return str(self.__class__.__name__)

    def aumenta_potenziamento(self):
        self.livello_potenziamento +=1

    def potenzia(self, costo: int = 3):
        if costo <= self.risorsa:
            old = self.risorsa
            self.paga_x(costo)
            self.aumenta_potenziamento()
            self.logger.info(f"r={old:<3}Potenziato! livello {self.livello_potenziamento}. New r={self.risorsa:<3}")
        else:
            self.logger.warning(f"r={self.risorsa:<3}No potenziamento")

    def turno(self):
        disponibili = [a for a in self.AZIONI if a.costo <= self.apparato_succ.risorsa]
        azione = random.choice(disponibili)
        self.apparato_succ.paga_x(azione.costo)

        old = self.risorsa
        self._on_azione(azione)

        self.logger.info(
            f"r={old:<3}{azione.nome}: →{self.risorsa}"
        )
        self.apparato_succ.logger.info(f"r={self.apparato_succ.risorsa:<3}")


    def _on_azione(self, azione: Azione):
        self.risorsa += azione.guadagno

    def paga_x(self, x: int):
        if x<=self.risorsa:
            self.risorsa -= x
        else:
            raise ValueError(f"{self.nome} non ha abbastanza risorsa per pagare {x}.")

    def __repr__(self):
        return self.nome


class Cuore(Apparato):
    AZIONI: ClassVar[list[Azione]] = [
        Azione("soprav",   costo=0, guadagno=1),
        Azione("Battenorma", costo=1, guadagno = 4),
        Azione("Batteforte",         costo=2, guadagno = 6),
    ]

    def potenzia(self, costo: int = 3):
        super().potenzia(4)


class Stomaco(Apparato):
    AZIONI: ClassVar[list[Azione]] = [
        Azione("Digestione intensa", costo=2, guadagno=4),
        Azione("Digestione lenta",   costo=1, guadagno=3),
        Azione("Riposo",             costo=0, guadagno=1),
    ]


class Immunitario(Apparato):
    AZIONI: ClassVar[list[Azione]] = [
        Azione("Febbre",           costo=3, n_dadi=6),
        Azione("Attacco2",         costo=2, n_dadi=2),
        Azione("Attacco1",         costo=1, n_dadi=1),
        Azione("Soprav",           costo=0, n_dadi=1),
    ]

    def _on_azione(self, azione: Azione):
        p = min(0.5 + self.livello_potenziamento * 0.05, 0.7)
        hits = sum(1 for _ in range(azione.n_dadi) if random.random() < p)
        self.risorsa += hits
        self.logger.info(f"  dado: {hits}/{azione.n_dadi} colpi (p={p:.0%})")

class Cervello(Apparato):
    AZIONI: ClassVar[list[Azione]] = [
        Azione("Corteccia", costo=3, guadagno = 6),
        Azione("Talamo",    costo=2, guadagno = 4),
        Azione("Talamo",    costo=1, guadagno = 2),
        Azione("Riposo",    costo=0, guadagno=1),
    ]
