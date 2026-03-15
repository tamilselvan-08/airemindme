/* ================= CUSTOMER MODAL ================= */

function showAddCustomerModal() {
    document.getElementById("cId").value = "";
    document.getElementById("cName").value = "";
    document.getElementById("cPhone").value = "";
    document.getElementById("cEmail").value = "";
    document.getElementById("cBirthday").value = "";
    document.getElementById("cAnniversary").value = "";

    selectSeg("regular");

    document.getElementById("modalTitle").innerText = "Add Customer";
    document.getElementById("saveCustomerBtn").innerText = "Add Customer";
    document.getElementById("addCustomerModal").classList.remove("hidden");
}

function hideAddCustomerModal() {
    document.getElementById("addCustomerModal").classList.add("hidden");
}

function openEditCustomer(id, name, phone, email, groupId, channel) {
    document.getElementById("cId").value = id;
    document.getElementById("cName").value = name;
    document.getElementById("cPhone").value = phone;
    document.getElementById("cEmail").value = email;

    const groupMap = { 1: "vip", 2: "regular", 3: "new", 4: "inactive" };
    selectSeg(groupMap[groupId] || "regular");

    // Reset and set channels
    selectedChannels = [];
    if (channel) {
        selectedChannels = channel.split(",").map(Number);
    }

    updateChannelButtons();

    document.getElementById("modalTitle").innerText = "Edit Customer";
    document.getElementById("saveCustomerBtn").innerText = "Update Customer";
    document.getElementById("addCustomerModal").classList.remove("hidden");
}

/* ================= CHANNEL BUTTONS ================= */

function updateChannelButtons() {
    const buttons = {
        1: document.getElementById("ch-wa"),
        2: document.getElementById("ch-sms"),
        3: document.getElementById("ch-email")
    };

    Object.keys(buttons).forEach(id => {
        const btn = buttons[id];
        if (selectedChannels.includes(parseInt(id))) {
            btn.classList.remove("bg-gray-100", "text-gray-600");
            btn.classList.add("text-white");

            if (id == 1) btn.classList.add("bg-green-500");
            if (id == 2) btn.classList.add("bg-blue-500");
            if (id == 3) btn.classList.add("bg-purple-500");
        } else {
            btn.classList.remove("bg-green-500", "bg-blue-500", "bg-purple-500", "text-white");
            btn.classList.add("bg-gray-100", "text-gray-600");
        }
    });

    document.getElementById("channelInput").value = selectedChannels.join(",");
}

function toggleCh(channelId) {
    const index = selectedChannels.indexOf(channelId);
    if (index > -1) {
        selectedChannels.splice(index, 1);
    } else {
        selectedChannels.push(channelId);
    }
    updateChannelButtons();
}

/* ================= SEGMENT ================= */

function selectSeg(s) {
    document.getElementById('cSegment').value = s;

    ['vip', 'regular', 'new', 'inactive'].forEach(x => {
        const b = document.getElementById('sb-' + x);
        if (x === s) {
            b.classList.add('border-indigo-500', 'bg-indigo-50');
            b.classList.remove('border-gray-200');
            b.querySelector('.sbl').className = 'text-sm font-semibold text-indigo-700 sbl';
        } else {
            b.classList.remove('border-indigo-500', 'bg-indigo-50');
            b.classList.add('border-gray-200');
            b.querySelector('.sbl').className = 'text-sm font-semibold text-gray-800 sbl';
        }
    });
}

/* ================= VIEW SWITCH ================= */

function setView(view) {
    const grid = document.getElementById("customerGrid");
    const list = document.getElementById("customerList");
    const cardBtn = document.getElementById("v-card");
    const listBtn = document.getElementById("v-list");

    if (view === "card") {
        grid.classList.remove("hidden");
        list.classList.add("hidden");
        cardBtn.classList.add("bg-indigo-50", "text-indigo-600");
        listBtn.classList.remove("bg-indigo-50", "text-indigo-600");
    } else {
        grid.classList.add("hidden");
        list.classList.remove("hidden");
        listBtn.classList.add("bg-indigo-50", "text-indigo-600");
        cardBtn.classList.remove("bg-indigo-50", "text-indigo-600");
    }
}

function viewCustomer(id) {
    window.location.href = "/customer-detail.html?id=" + id;
}

/* ================= PAGINATION INITIALIZATION ================= */

document.addEventListener("DOMContentLoaded", () => {
    const pagination = document.getElementById("pagination");

    if (pagination && totalPages > 1) {
        pagination.innerHTML = "";
        for (let i = 0; i < totalPages; i++) {
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set("page", i);

            const btn = document.createElement("a");
            btn.href = "customers.html?" + urlParams.toString();
            btn.innerText = i + 1;
            btn.className = "px-3 py-1 rounded border text-sm " +
                (i === currentPage ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50");

            pagination.appendChild(btn);
        }
    }

    // Set default view on load
    setView("card");
});