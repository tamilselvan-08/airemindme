/* ================= SAVE CUSTOMER ================= */

function saveCustomer(e) {
    e.preventDefault();

    const id = document.getElementById("cId").value;
    const groupMap = { vip: 1, regular: 2, new: 3, inactive: 4 };

    const customer = {
        name: document.getElementById("cName").value,
        mobile: document.getElementById("cPhone").value,
        email: document.getElementById("cEmail").value,
        dob: document.getElementById("cBirthday").value || null,
        weddingDate: document.getElementById("cAnniversary").value || null,
        channel: selectedChannels.join(","),
        customerGroupId: groupMap[document.getElementById("cSegment").value]
    };

    const url = id ? "/api/customers/" + id : "/api/customers";
    const method = id ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
    })
        .then(async res => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }
            return res.json();
        })
        .then(() => {
            hideAddCustomerModal();
            location.reload();
        })
        .catch(err => {
            console.error(err);
            alert("Error: " + err.message);
        });
}



// import .js

/* ================= IMPORT STATE ================= */
let csvParsedRows = [];
let csvFile = null;

/* ================= IMPORT MODAL UI ================= */

function showImportModal() {
    document.getElementById('importModal').classList.remove('hidden');
    resetImport();
}

function hideImportModal() {
    document.getElementById('importModal').classList.add('hidden');
}

function resetImport() {
    csvParsedRows = [];
    csvFile = null;

    document.getElementById('csvFileInput').value = '';
    document.getElementById('fileSelected').classList.add('hidden');
    document.getElementById('parseBtn').disabled = true;

    document.getElementById('importStep1').classList.remove('hidden');
    document.getElementById('importStep2').classList.add('hidden');
    document.getElementById('importStep3').classList.add('hidden');
}

/* ================= FILE HANDLING ================= */

function handleFileSelect(input) {
    if (input.files && input.files[0]) setCSVFile(input.files[0]);
}

function handleFileDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) setCSVFile(file);
    else alert('Please upload CSV');
}

function setCSVFile(file) {
    csvFile = file;
    document.getElementById('fileSelected').classList.remove('hidden');
    document.getElementById('selectedFileName').textContent = file.name;
    document.getElementById('selectedFileSize').textContent = (file.size / 1024).toFixed(1) + ' KB';
    document.getElementById('parseBtn').disabled = false;
}

function clearFile() {
    csvFile = null;
    document.getElementById('fileSelected').classList.add('hidden');
    document.getElementById('parseBtn').disabled = true;
}

/* ================= DATA PARSING ================= */

function formatDate(dateStr) {
    if (!dateStr) return null;
    dateStr = dateStr.trim();
    if (dateStr === "") return null;

    if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts[0].length === 2) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    return dateStr;
}

function parseCSV() {
    if (!csvFile) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());

        if (lines.length < 2) {
            alert("CSV empty");
            return;
        }

        const dataLines = lines.slice(1);
        csvParsedRows = [];

        dataLines.forEach(line => {
            const cols = line.split(',').map(c => c.trim());
            if (cols.length < 2) return;

            csvParsedRows.push({
                name: cols[0] || '',
                phone: cols[1] || '',
                email: cols[2] || '',
                segment: (cols[3] || 'regular').toLowerCase(),
                channel: (cols[4] || 'whatsapp').toLowerCase(),
                birthday: formatDate(cols[5]),
                anniversary: formatDate(cols[6]),
                valid: (cols[0] && cols[1])
            });
        });

        showPreview();
    };
    reader.readAsText(csvFile);
}

/* ================= PREVIEW UI ================= */

function showPreview() {
    document.getElementById('importStep1').classList.add('hidden');
    document.getElementById('importStep2').classList.remove('hidden');

    const valid = csvParsedRows.filter(r => r.valid);
    document.getElementById('previewCount').textContent = valid.length + " rows";

    const tbody = document.getElementById('previewTable');
    tbody.innerHTML = "";

    valid.slice(0, 20).forEach(r => {
        tbody.innerHTML += `
<tr>
        <td class="px-3 py-2">${r.name}</td>
        <td class="px-3 py-2">${r.phone}</td>
        <td class="px-3 py-2">${r.email || '—'}</td>
        <td class="px-3 py-2">
    <span class="px-2 py-0.5 rounded ${segBadge[r.segment]}">${r.segment}</span>
        </td>
        <td class="px-3 py-2 text-green-600">✓ Valid</td>
</tr>
    `;
    });
}

/* ================= BULK IMPORT ================= */

function confirmImport() {
    const valid = csvParsedRows.filter(r => r.valid);
    const groupMap = { vip: 1, regular: 2, new: 3, inactive: 4 };

    const customers = valid.map(r => ({
        name: r.name,
        mobile: r.phone,
        email: r.email || null,
        dob: r.birthday || null,
        weddingDate: r.anniversary || null,
        channel: r.channel,
        customerGroupId: groupMap[r.segment] || 2
    }));

    fetch("/api/customers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customers)
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById('importStep2').classList.add('hidden');
            document.getElementById('importStep3').classList.remove('hidden');
            document.getElementById('importSuccessMsg').innerText =
                `${data.imported} imported, ${data.skipped} skipped, ${data.failed || 0} failed`;
        })
        .catch(err => {
            console.error(err);
            alert("Import failed");
        });
}

//search.js

/* ================= FILTER ================= */

function setFilter(filter) {
    const url = new URL(window.location.href);

    if (filter === 'all') url.searchParams.delete('segment');
    else url.searchParams.set('segment', filter);

    url.searchParams.set('page', '0');
    window.location.href = url.toString();
}

/* ================= SEARCH ================= */

const searchInput = document.getElementById("searchInput");

if (searchInput) {
    let timer;

    searchInput.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(() => {
            searchCustomers();
        }, 400);
    });

    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            searchCustomers();
        }
    });
}

function searchCustomers() {
    const search = document.getElementById("searchInput").value;
    const url = new URL(window.location.href);

    if (search && search.trim() !== "") {
        url.searchParams.set("search", search);
    } else {
        url.searchParams.delete("search");
    }

    url.searchParams.set("page", "0");
    window.location.href = url.toString();
}

function clearSearch() {
    const url = new URL(window.location.href);
    url.searchParams.delete("search");
    url.searchParams.set("page", "0");
    window.location.href = url.toString();
}
