from __future__ import annotations
from abc import ABC
from typing import ClassVar
import logging
import random

from scripts.azioni import (azioni_imm, azioni_cervello, azioni_dig, azioni_circol,
                            Azione, AzioneIm, AzioneCirc)


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
    COSTO_POTENZIAMENTO: ClassVar[int] = 3

    def __init__(self, apparato: Apparato | None = None):

        self.risorsa: int = 3
        self.logger = setup_logger(f"{self.nome}")
        self.livello_potenziamento: int = 0
        self.apparato_succ = apparato
        self.in_pericolo: bool = False

    @property
    def nome(self) -> str:
        return str(self.__class__.__name__)

    def aumenta_potenziamento(self):
        self.livello_potenziamento += 1

    def potenzia(self):
        if self.COSTO_POTENZIAMENTO <= self.risorsa:
            old = self.risorsa
            self.paga_x(self.COSTO_POTENZIAMENTO)
            self.aumenta_potenziamento()
            self.logger.info(f"r={old:<3}Potenziato! livello {self.livello_potenziamento}. New r={self.risorsa:<3}")
        else:
            self.logger.warning(f"r={self.risorsa:<3}No potenziamento")

    def scegli_azione(self) -> Azione:
        """
        Decide quale azione compiere tra quelle disponibili, lasciando abbastanza risorse.
        """

        disponibili = [a for a in self.AZIONI if a.costo <= self.apparato_succ.risorsa]

        if self.in_pericolo:
            return max(disponibili, key=lambda a: a.costo)

        azioni_cooperative = [
            a for a in disponibili
            if self.apparato_succ.risorsa - a.costo >= self.apparato_succ.COSTO_POTENZIAMENTO
        ]

        if azioni_cooperative:
            return max(azioni_cooperative, key=lambda a: a.costo)
        else:
            return random.choice(disponibili)

    def turno(self):

        azione = self.scegli_azione()
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
        if x <= self.risorsa:
            self.risorsa -= x
        else:
            raise ValueError(f"{self.nome} non ha abbastanza risorsa per pagare {x}.")

    def __repr__(self):
        return self.nome


class Cuore(Apparato):
    COSTO_POTENZIAMENTO: ClassVar[int] = 4  # coerente con potenzia() sotto
    AZIONI: ClassVar[list[Azione]] = azioni_circol
    goccia_sangue_corrente = 0
    step_sangue = [{'cur': 0, 'tot': 5, 'type': 'O2'},
                   {'cur': 0, 'tot': 3, 'type': 'not'}]

    def _on_azione(self, azione: AzioneCirc):
        movimenti = azione.movimenti
        while movimenti:
            step = self.step_sangue[self.goccia_sangue_corrente]
            step['cur'] += 1
            movimenti -= 1
            if (step['cur'] ==
                    step['tot']):
                step['cur'] = 0
                if step['type'] == 'O2':
                    self.risorsa += 5
                self.goccia_sangue_corrente = (self.goccia_sangue_corrente + 1) % len(self.step_sangue)


class Stomaco(Apparato):
    AZIONI: ClassVar[list[Azione]] = azioni_dig


class Immunitario(Apparato):
    AZIONI: ClassVar[list[Azione]] = azioni_imm

    def _on_azione(self, azione: AzioneIm):
        p = min(0.5 + self.livello_potenziamento * 0.05, 0.7)
        hits = sum(1 for _ in range(azione.n_dadi) if random.random() < p)
        self.risorsa += hits
        self.logger.info(f"  dado: {hits}/{azione.n_dadi} colpi (p={p:.0%})")


class Cervello(Apparato):
    AZIONI: ClassVar[list[Azione]] = azioni_cervello
