---
name: gamerules
description: Load and display the full rules of "In Corpore Sano".  Use when the user asks about game mechanics, rules, systems, or how to implement any game feature.
triggers:
  - /gamerules
  - game rules
  - regole del gioco
  - how does the game work
---

# Skill: gamerules

When this skill is invoked, load the following game rules as context for the current conversation. Answer any follow-up questions about the game using this content. If the user asks to implement a mechanic, refer to these rules as the source of truth.

---

# In Corpore Sano — Regole del Gioco

In Corpore Sano è un gioco cooperativo completamente asimmetrico in cui i giocatori interpretano quattro apparati di un corpo umano. Riuscirete a vivere una vita felice fino alla terza età, o uno degli apparati rimarrà indietro e causerà la morte di tutti voi? Ognuno ha un compito ma dipende strettamente dai propri vicini. Agirete con parsimonia per non pesare sugli altri, o spingerete al massimo il vostro sistema incuranti dei costi altrui?

---

## Concetti Generali

Ogni sistema deve raggiungere un livello di potenziamento per far crescere il corpo e puntare alla vittoria.

Ogni sistema inizia il turno avendo la possibilità di potenziarsi, pagando la propria risorsa:
- **S. Circolatorio** paga O2
- **A. Digerente** usa i nutrienti (cubetti) di determinati colori
- **S. Immunitario** utilizza i batteri sconfitti di determinate tipologie
- **S. Nervoso** usa i neurotrasmettitori

Successivamente il sistema sceglie un'azione da fare. Le azioni differiscono profondamente, ma hanno in comune il fatto di pagare una quantità variabile (da 0 a 4) della risorsa del sistema successivo:

- **S. Circolatorio** ruba nutrienti (colore indifferente)
- **A. Digerente** ruba i batteri sconfitti (tipologia indifferente)
- **S. Immunitario** ruba i neurotrasmettitori
- **S. Nervoso** ruba l'ossigeno

È ovviamente possibile discutere e accordarsi sulla quantità appropriata, ma in caso di disaccordo è il sistema attivo che può scegliere la quantità di risorsa da prendere: **"Il ladro può prendere quanto vuole"**.

---

## Sequenza del Turno

1. Se la temperatura si trova in zona febbre, fa un passo verso destra. Se esce e raggiunge la X, la partita è persa per febbre eccessiva prolungata.
2. La temperatura scende di 1.
3. Aggiungere 2 O2 in ogni polmone.
4. Pescare Carta Evento.
5. Partendo dal cuore e proseguendo in senso orario, gli apparati svolgono il loro turno.

---

## Preparazione

- Preparare carte evento.
- Posizionare segnalini potenziamento.
- Posizionare prima 1 latte e poi 1 omogeneizzato nei primi 2 spazi del canale digerente, posizionando i relativi cubetti nutrienti.
- Posizionare un totale di 2 virus triangolari, 1 quadrato e 1 circolare nelle 4 zone di infiammazione A, B, C, D (esattamente 1 virus per zona).
- Posizionare 1 globulo bianco nella zona A, 1 nella zona C e 3 nel cuore.

**Dare a ciascun sistema:**
- S. Circolatorio: 2 O2
- A. Digerente: 1 proteina, 1 grasso e 1 fibra
- S. Immunitario: 1 virus triangolare, 1 quadrato e 1 circolare
- S. Nervoso: 3 neurotrasmettitori

---

## Apparato Circolatorio

Come tutti i sistemi, inizia il turno con la possibilità di potenziarsi. Poi svolge un'azione.

### Azioni e Minigame

**[paga nutrienti e muove sangue]**

La logistica del movimento del sangue persegue i seguenti obiettivi e necessità:

- Nel momento in cui una barchetta sangue è nella casella relativa a uno dei polmoni, può caricare tutto l'ossigeno lì presente, senza eccedere la **capacità massima** (condivisa tra O2, CO2 e globuli bianchi). Capacità iniziale: **5**.
- Quando una barchetta sangue con O2 raggiunge la casella centrale del cuore, il giocatore può prendere da 0 a tutti gli ossigeni presenti e posizionarli sulla riserva O2 — solo ora l'O2 è disponibile come risorsa per sé stesso o per il S. Nervoso.
- Una barchetta sangue nel cuore può caricare eventuali globuli bianchi presenti. Una barchetta con globuli bianchi posizionata su una casella relativa a una zona di infiammazione può scaricare uno o più globuli bianchi e di conseguenza effettuare un ulteriore movimento.
- Una barchetta sangue nelle caselle relative al cervello o all'intestino può caricare qualsiasi quantità di CO2 lì presente.
- Una barchetta sangue con CO2 nelle caselle relative ai polmoni può scaricare tutte le CO2 (espulse tramite i polmoni). **Attenzione:** se nei vasi sanguigni o sulle barchette sangue sono presenti 5 CO2, la partita è **immediatamente persa per asfissia**.
- Una barchetta sangue con almeno un O2 nelle caselle relative al sistema nervoso centrale può, dopo aver eventualmente caricato la CO2, scaricare esattamente **un O2** sul neurone ad esso collegato — grandi benefici per il S. Nervoso. La barchetta DEVE poi effettuare un movimento.

---

## Apparato Digerente

Come tutti i sistemi, inizia il turno con la possibilità di potenziarsi. Poi svolge un'azione.

---

## Sistema Immunitario

Come tutti i sistemi, inizia il turno con la possibilità di potenziarsi. Poi svolge un'azione.

---

## Sistema Nervoso

Come tutti i sistemi, inizia il turno con la possibilità di potenziarsi. Poi svolge un'azione.

### Azioni e Minigame

**Mangiare**
Il sistema nervoso sceglie una carta pasto. Confronta il livello alimentare e in base al valore (2, 4 o 6) guarda il dorso delle prime 2, 4 o 6 carte pasto, scegliendo in base al guadagno o costo in neurotrasmettitori. Poi posiziona la carta nel primo spazio dell'intestino con il fronte visibile e vengono aggiunti i nutrienti dei colori corrispondenti dalla banca sulla carta.

**Azione cerebrale**
Il sistema nervoso sceglie una tra le varie azioni pagando il costo in O2 dalla riserva dell'apparato circolatorio. Se l'O2 non è sufficiente, l'azione non può essere scelta. Ogni azione ha associato un numero di ⇝ (segnali elettrici): il giocatore DEVE effettuare quel numero di movimenti con i segnalini sulla rete neurale.

### La Rete Neurale

La rete neurale del cervello è un grafo formato da due tipi di caselle:

- **Neuroni** — caselle tonde, senza effetti, occupabili con perline ossigeno. Collegati tra loro tramite percorsi grigi.
- **Sinapsi** — caselle quadrate con bonus scritti sopra, non occupabili dalle perline, connesse ai neuroni tramite segmenti rossi.

Tramite le azioni del S. Nervoso, le perline vengono mosse lungo i percorsi grigi (movimenti obbligatori). Al termine, il giocatore identifica tutte le sinapsi i cui neuroni adiacenti sono **tutti** occupati da perline ossigeno: per ciascuna il giocatore PUÒ attivarne l'effetto ottenendo il beneficio e pagandone l'eventuale costo.

**Sinapsi — -2 O2: +2 NT / POT ≠**
Pagando 2 O2 (presi dall'apparato circolatorio), il giocatore ottiene 2 neurotrasmettitori per ciascuno dei **diversi** simboli che appaiono sulle sue carte potenziamento già acquistate.
*Esempio: 3 carte "Albero", 2 carte "Palla da basket", 1 carta "Omino", 1 carta "Pizza" → 4 simboli diversi → 8 NT totali.*

### Potenziamenti

**[paga 3 NT, può ottenere rimborso. Produce 1 CO2 nella casella adiacente al cervello. Fa avanzare il segnalino potenziamento.]**

Il livello potenziamento del S. Nervoso è pari al **maggior numero di simboli uguali** tra le carte possedute.

*Esempio: 3 carte "Albero", 2 carte "Palla da basket", 1 carta "Omino", 1 carta "Pizza" → livello 3 (carte Albero) → età adulta.*
