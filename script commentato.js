// Riferimenti agli elementi HTML
const createSaccoButton = document.getElementById('createSacco');  // Ottieni il pulsante "Crea Sacco" dal DOM
const exportButton = document.getElementById('exportButton');  // Ottieni il pulsante "Esporta Tabella" dal DOM
const workspace = document.getElementById('workspace');  // Ottieni l'elemento di lavoro (dove vengono disegnati i sacchi)
const saccoWidthInput = document.getElementById('saccoWidth');  // Ottieni l'input per la larghezza del sacco
const saccoHeightInput = document.getElementById('saccoHeight');  // Ottieni l'input per l'altezza del sacco
const saccoRotationInput = document.getElementById('saccoRotation');  // Ottieni l'input per la rotazione del sacco
const saccoTableBody = document.querySelector('#saccoTable tbody');  // Ottieni il corpo della tabella che conterrà i dati dei sacchi

// Variabile per contare il numero di sacchi creati
let saccoCounter = 0;

// Scala: 1 px = 2 mm
const scale = 2;  // Definiamo una scala per la conversione delle misure da millimetri a pixel

// Offset di 900 mm per la coordinata Y (serve per allineare la posizione della Y)
const yOffset = -900 / scale;  // Convertiamo 900 mm in pixel usando la scala definita

// Funzione per creare un nuovo sacco
function createSacco() {
    saccoCounter++;  // Incrementa il contatore del numero di sacchi

    // Crea un nuovo elemento che rappresenta il sacco
    const saccoWrapper = document.createElement('div');
    saccoWrapper.classList.add('sacco-wrapper');  // Aggiunge una classe per stilizzare il sacco
    const sacco = document.createElement('div');
    sacco.classList.add('sacco');  // Aggiunge una classe per il sacco

    // Creiamo un elemento per visualizzare il numero del sacco
    const saccoNumber = document.createElement('div');
    saccoNumber.classList.add('sacco-number');
    saccoNumber.textContent = saccoCounter;  // Imposta il numero del sacco (1, 2, 3, etc.)
    sacco.appendChild(saccoNumber);  // Aggiunge il numero dentro il sacco

    // Calcoliamo le dimensioni del sacco in pixel (conversione da millimetri)
    const width = parseInt(saccoWidthInput.value) / scale;  // Larghezza del sacco in px
    const height = parseInt(saccoHeightInput.value) / scale;  // Altezza del sacco in px
    const rotation = parseInt(saccoRotationInput.value) || 0;  // Rotazione del sacco in gradi, se non inserita default a 0

    sacco.style.width = `${width}px`;  // Imposta la larghezza del sacco in pixel
    sacco.style.height = `${height}px`;  // Imposta l'altezza del sacco in pixel

    saccoWrapper.style.width = `${width}px`;  // Imposta la larghezza del wrapper del sacco in pixel
    saccoWrapper.style.height = `${height}px`;  // Imposta l'altezza del wrapper del sacco in pixel
    saccoWrapper.style.transform = `rotate(${rotation}deg)`;  // Applica la rotazione al sacco

    saccoWrapper.appendChild(sacco);  // Aggiungi il sacco al suo wrapper
    saccoWrapper.style.position = 'absolute';  // Imposta la posizione assoluta del sacco nel workspace

    // Calcoliamo la posizione iniziale del sacco nel workspace
    const centerX = workspace.clientWidth / 2;  // Trova il centro orizzontale del workspace
    const centerY = workspace.clientHeight / 2;  // Trova il centro verticale del workspace

    // Calcoliamo l'offset per centrare il sacco nel workspace
    const offsetX = width / 2;  // Offset orizzontale per centrare il sacco
    const offsetY = height / 2;  // Offset verticale per centrare il sacco

    // Generiamo posizioni casuali per X e Y all'interno del workspace
    const randomX = Math.random() * (workspace.clientWidth - width);  // Posizione casuale per X
    const randomY = Math.random() * (workspace.clientHeight - height);  // Posizione casuale per Y

    // Imposta la posizione finale del sacco, aggiungendo l'offset e la posizione casuale
    saccoWrapper.style.left = `${centerX - offsetX + randomX}px`;
    saccoWrapper.style.top = `${centerY - offsetY + randomY}px`;

    // Aggiunge l'evento per il drag and drop del sacco
    saccoWrapper.addEventListener('mousedown', (event) => startDrag(event, saccoWrapper, width, height));

    workspace.appendChild(saccoWrapper);  // Aggiungi il sacco al workspace

    // Crea una nuova riga nella tabella per il sacco
    const tableRow = createTableRow(saccoCounter, saccoWrapper);
    saccoWrapper.dataset.tableRowId = tableRow.id;  // Associa il sacco alla riga della tabella
}

// Funzione per creare una riga nella tabella HTML
function createTableRow(saccoNumber, saccoWrapper) {
    // Otteniamo le dimensioni e la posizione del sacco
    const width = parseInt(saccoWrapper.style.width);
    const height = parseInt(saccoWrapper.style.height);
    const offsetX = width / 2;
    const offsetY = height / 2;

    // Calcoliamo le coordinate del sacco in millimetri
    const x = -((parseInt(saccoWrapper.style.left) + offsetX - (workspace.clientWidth / 2)) * scale);
    const y = (parseInt(saccoWrapper.style.top) + offsetY - yOffset) * scale;  // Applichiamo l'offset alla Y
    const rotation = parseInt(saccoWrapper.style.transform.match(/rotate\(([-\d]+)deg\)/)?.[1]) || 0;

    // Crea una nuova riga nella tabella per il sacco
    const row = document.createElement('tr');
    row.id = `sacco-row-${saccoNumber}`;  // Imposta un ID univoco per la riga della tabella
    row.innerHTML = `
        <td>${saccoNumber}</td>  <!-- Numero del sacco -->
        <td class="sacco-coord-x">${x} mm</td>  <!-- Coordinata X del sacco -->
        <td class="sacco-coord-y">${y} mm</td>  <!-- Coordinata Y del sacco -->
        <td>${rotation}°</td>  <!-- Rotazione del sacco -->
        <td><button class="futuristic-button delete-button" onclick="deleteSacco(${saccoNumber})">Elimina</button></td>  <!-- Pulsante per eliminare il sacco -->
    `;
    saccoTableBody.appendChild(row);  // Aggiungi la riga alla tabella

    return row;  // Restituisce la riga appena creata
}

// Funzione per eliminare un sacco dalla tabella e dal workspace
function deleteSacco(saccoNumber) {
    const rowId = `sacco-row-${saccoNumber}`;  // Ottieni l'ID della riga corrispondente al sacco
    const saccoRow = document.getElementById(rowId);  // Trova la riga della tabella
    if (saccoRow) saccoTableBody.removeChild(saccoRow);  // Rimuovi la riga dalla tabella

    const saccoWrapper = Array.from(workspace.children).find(wrapper => wrapper.dataset.tableRowId === rowId);  // Trova il sacco nel workspace
    if (saccoWrapper) workspace.removeChild(saccoWrapper);  // Rimuovi il sacco dal workspace
}

// Variabili per gestire il drag and drop dei sacchi
let offsetX, offsetY, currentSaccoWrapper, initialX, initialY;

// Funzione che inizia il drag and drop di un sacco
function startDrag(event, saccoWrapper, width, height) {
    currentSaccoWrapper = saccoWrapper;  // Imposta il sacco attualmente selezionato per il drag

    offsetX = event.clientX - saccoWrapper.offsetLeft;  // Calcola l'offset orizzontale per il movimento
    offsetY = event.clientY - saccoWrapper.offsetTop;  // Calcola l'offset verticale per il movimento

    document.addEventListener('mousemove', onDrag);  // Aggiungi l'evento di movimento del mouse
    document.addEventListener('mouseup', stopDrag);  // Aggiungi l'evento per fermare il drag
}

// Funzione per spostare il sacco durante il drag
function onDrag(event) {
    if (!currentSaccoWrapper) return;  // Se non c'è un sacco, non fare nulla
    
    const x = event.clientX - offsetX;  // Calcola la nuova posizione X
    const y = event.clientY - offsetY;  // Calcola la nuova posizione Y

    currentSaccoWrapper.style.left = `${x}px`;  // Imposta la nuova posizione X del sacco
    currentSaccoWrapper.style.top = `${y}px`;  // Imposta la nuova posizione Y del sacco

    updateTable(currentSaccoWrapper);  // Aggiorna la tabella con le nuove coordinate
}

// Funzione che ferma il drag
function stopDrag() {
    document.removeEventListener('mousemove', onDrag);  // Rimuovi l'evento di movimento del mouse
    document.removeEventListener('mouseup', stopDrag);  // Rimuovi l'evento di fermata del drag
}

// Funzione per aggiornare la tabella dopo che un sacco è stato spostato
function updateTable(saccoWrapper) {
    const saccoNumber = parseInt(saccoWrapper.querySelector('.sacco-number').textContent);  // Ottieni il numero del sacco
    const tableRow = document.getElementById(`sacco-row-${saccoNumber}`);  // Trova la riga della tabella corrispondente al sacco

    const width = parseInt(saccoWrapper.style.width);
    const height = parseInt(saccoWrapper.style.height);
    const offsetX = width / 2;
    const offsetY = height / 2;

    // Calcola le nuove coordinate del sacco
    const x = -((parseInt(saccoWrapper.style.left) + offsetX - (workspace.clientWidth / 2)) * scale);
    const y = (parseInt(saccoWrapper.style.top) + offsetY - yOffset) * scale;

    // Aggiorna i valori nella tabella
    tableRow.querySelector('.sacco-coord-x').textContent = `${x} mm`;
    tableRow.querySelector('.sacco-coord-y').textContent = `${y} mm`;
}

// Listener per il pulsante "Crea Sacco"
createSaccoButton.addEventListener('click', createSacco);

// Funzione per esportare la tabella in un file Excel
exportButton.addEventListener('click', () => {
    exportTableToExcel('sacco_pallet.xlsx');  // Chiama la funzione per esportare la tabella in un file Excel
});
