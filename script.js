// Riferimenti agli elementi HTML
const createSaccoButton = document.getElementById('createSacco');
const exportButton = document.getElementById('exportButton');  // Pulsante Esporta Tabella
const workspace = document.getElementById('workspace');
const saccoWidthInput = document.getElementById('saccoWidth');
const saccoHeightInput = document.getElementById('saccoHeight');
const saccoRotationInput = document.getElementById('saccoRotation');
const saccoTableBody = document.querySelector('#saccoTable tbody');

// Contatore per il numero di sacchi
let saccoCounter = 0;

// Scala: 1 px = 2 mm
const scale = 2;

// Offset di 900 mm per la coordinata Y
const yOffset = -900 / scale;  // 900 mm convertito in px

// Funzione per creare un nuovo sacco
function createSacco() {
    saccoCounter++;

    const saccoWrapper = document.createElement('div');
    saccoWrapper.classList.add('sacco-wrapper');
    const sacco = document.createElement('div');
    sacco.classList.add('sacco');

    // Creiamo un elemento per il numero del sacco, che sarà all'interno del sacco
    const saccoNumber = document.createElement('div');
    saccoNumber.classList.add('sacco-number');
    saccoNumber.textContent = saccoCounter;
    sacco.appendChild(saccoNumber); // Aggiungiamo il numero dentro il sacco

    // Conversione mm -> px
    const width = parseInt(saccoWidthInput.value) / scale;
    const height = parseInt(saccoHeightInput.value) / scale;
    const rotation = parseInt(saccoRotationInput.value) || 0;

    sacco.style.width = `${width}px`;
    sacco.style.height = `${height}px`;

    saccoWrapper.style.width = `${width}px`;
    saccoWrapper.style.height = `${height}px`;
    saccoWrapper.style.transform = `rotate(${rotation}deg)`;

    saccoWrapper.appendChild(sacco);
    saccoWrapper.style.position = 'absolute';

    // Calcoliamo la posizione iniziale
    const centerX = workspace.clientWidth / 2;
    const centerY = workspace.clientHeight / 2;

    // Offset per il centro del sacco
    const offsetX = width / 2;
    const offsetY = height / 2;

    // Posizione iniziale del sacco (X e Y) deve partire dal centro del sacco
    const randomX = Math.random() * (workspace.clientWidth - width -400 );  // Posizione casuale per X
    const randomY = Math.random() * (workspace.clientHeight - height -400 ); // Posizione casuale per Y

    saccoWrapper.style.left = `${centerX - offsetX + randomX}px`; // Imposta la posizione X relativa al centro
    saccoWrapper.style.top = `${centerY - offsetY + randomY}px`; // Imposta la posizione Y senza offset

    saccoWrapper.addEventListener('mousedown', (event) => startDrag(event, saccoWrapper, width, height));
    workspace.appendChild(saccoWrapper);

    const tableRow = createTableRow(saccoCounter, saccoWrapper);
    saccoWrapper.dataset.tableRowId = tableRow.id;
}

// Funzione per creare una riga nella tabella
function createTableRow(saccoNumber, saccoWrapper) {
    const width = parseInt(saccoWrapper.style.width);
    const height = parseInt(saccoWrapper.style.height);
    const offsetX = width / 2;
    const offsetY = height / 2;

    const x = -((parseInt(saccoWrapper.style.left) + offsetX - (workspace.clientWidth / 2)) * scale);
    const y = (parseInt(saccoWrapper.style.top) + offsetY - yOffset) * scale; // Applichiamo l'offset alla Y per la visualizzazione
    const rotation = parseInt(saccoWrapper.style.transform.match(/rotate\(([-\d]+)deg\)/)?.[1]) || 0;

    const row = document.createElement('tr');
    row.id = `sacco-row-${saccoNumber}`;
    row.innerHTML = `
        <td>${saccoNumber}</td>
        <td class="sacco-coord-x">${x} mm</td>
        <td class="sacco-coord-y">${y} mm</td>
        <td>${rotation}°</td>
        <td><button class="futuristic-button delete-button" onclick="deleteSacco(${saccoNumber})">Elimina</button></td>
    `;
    saccoTableBody.appendChild(row);

    return row;
}

// Funzione per eliminare un sacco
function deleteSacco(saccoNumber) {
    const rowId = `sacco-row-${saccoNumber}`;
    const saccoRow = document.getElementById(rowId);
    if (saccoRow) saccoTableBody.removeChild(saccoRow);

    const saccoWrapper = Array.from(workspace.children).find(wrapper => wrapper.dataset.tableRowId === rowId);
    if (saccoWrapper) workspace.removeChild(saccoWrapper);
}

let offsetX, offsetY, currentSaccoWrapper, initialX, initialY;

// Funzione per iniziare il drag and drop
function startDrag(event, saccoWrapper, width, height) {
    currentSaccoWrapper = saccoWrapper;

    offsetX = event.clientX - saccoWrapper.offsetLeft;
    offsetY = event.clientY - saccoWrapper.offsetTop;

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
}

// Funzione per spostare il sacco
function onDrag(event) {
    if (!currentSaccoWrapper) return;
    
    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;

    currentSaccoWrapper.style.left = `${x}px`;
    currentSaccoWrapper.style.top = `${y}px`;

    updateTable(currentSaccoWrapper);
}

// Funzione per fermare il drag
function stopDrag() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
}

// Funzione per aggiornare la tabella dopo il drag
function updateTable(saccoWrapper) {
    const saccoNumber = parseInt(saccoWrapper.querySelector('.sacco-number').textContent);
    const tableRow = document.getElementById(`sacco-row-${saccoNumber}`);

    const width = parseInt(saccoWrapper.style.width);
    const height = parseInt(saccoWrapper.style.height);
    const offsetX = width / 2;
    const offsetY = height / 2;

    const x = -((parseInt(saccoWrapper.style.left) + offsetX - (workspace.clientWidth / 2)) * scale);
    const y = (parseInt(saccoWrapper.style.top) + offsetY - yOffset) * scale; // Applichiamo l'offset alla Y

    tableRow.querySelector('.sacco-coord-x').textContent = `${x} mm`;
    tableRow.querySelector('.sacco-coord-y').textContent = `${y} mm`;
}

// Funzione per esportare la tabella in Excel
function exportTableToExcel() {
    const table = document.getElementById('saccoTable');
  
    // Usa SheetJS per creare un file Excel a partire dalla tabella HTML
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sacchi" });

    // Salva il file Excel
    XLSX.writeFile(wb, 'sacco_pallet.xlsx');
}

// Aggiungi il listener per il pulsante "Esporta Tabella"
exportButton.addEventListener('click', exportTableToExcel);

// Inizializzazione
createSaccoButton.addEventListener('click', createSacco);
