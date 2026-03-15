// ============================================================
//  settings.js  –  Reminder Me | Settings Page
// ============================================================

// ─── Toast Notification ──────────────────────────────────────
function showToast(message, type = "success") {
    const existing = document.getElementById("rm-toast");
    if (existing) existing.remove();

    const colors = {
        success: "bg-emerald-600",
        error: "bg-red-500",
        info: "bg-indigo-600",
    };

    const icons = {
        success: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>`,
        error: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>`,
        info: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"/>`,
    };

    const toast = document.createElement("div");
    toast.id = "rm-toast";
    toast.className = `fixed bottom-24 md:bottom-6 right-4 z-[999] flex items-center gap-3 px-4 py-3 rounded-2xl text-white text-sm font-semibold shadow-xl ${colors[type]} transition-all duration-300 translate-y-4 opacity-0`;
    toast.innerHTML = `
    <div class="w-6 h-6 flex-shrink-0">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-6 h-6">
        ${icons[type]}
      </svg>
    </div>
    <span>${message}</span>
  `;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove("translate-y-4", "opacity-0");
        });
    });

    // Auto dismiss after 3s
    setTimeout(() => {
        toast.classList.add("translate-y-4", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ─── Button Loading State ─────────────────────────────────────
function setButtonLoading(btn, loading, defaultText) {
    if (loading) {
        btn.disabled = true;
        btn.innerHTML = `
      <svg class="animate-spin w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>Saving...`;
        btn.classList.add("opacity-75", "cursor-not-allowed");
    } else {
        btn.disabled = false;
        btn.innerHTML = defaultText;
        btn.classList.remove("opacity-75", "cursor-not-allowed");
    }
}

// ─── Save Profile ─────────────────────────────────────────────
async function saveProfile() {
    const fullName = document.getElementById("fullName")?.value?.trim();
    const email = document.getElementById("email")?.value?.trim();
    const phone = document.getElementById("phone")?.value?.trim();
    const businessName = document.getElementById("businessName")?.value?.trim();

    // Basic validation
    if (!fullName || !email) {
        showToast("Full name and email are required.", "error");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast("Please enter a valid email address.", "error");
        return;
    }

    const btn = document.querySelector('[onclick="saveProfile()"]');
    if (btn) setButtonLoading(btn, true, "Save Changes");

    try {
        const res = await fetch("/api/settings/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: fullName,
                email: email,
                mobile: phone,
                businessName: businessName,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(err || `Server error: ${res.status}`);
        }

        showToast("Profile updated successfully!", "success");

        // Reflect name change in sidebar avatar text if present
        const avatarSpans = document.querySelectorAll(".w-9.h-9.rounded-full span, .w-8.h-8.rounded-full span");
        avatarSpans.forEach((s) => {
            if (s.classList.contains("font-bold") && fullName.length > 0) {
                s.textContent = fullName.charAt(0).toUpperCase();
            }
        });

    } catch (err) {
        console.error("saveProfile error:", err);
        showToast(err.message || "Failed to update profile. Try again.", "error");
    } finally {
        if (btn) setButtonLoading(btn, false, "Save Changes");
    }
}

// ─── Update Password ──────────────────────────────────────────
//
// ⚠️  SECURITY NOTE (for your SettingsController):
//     Your current /api/settings/password endpoint accepts a
//     userId in the request body — this lets any logged-in user
//     change another user's password by spoofing the userId.
//
//     Fix: In SettingsController.updatePassword(), replace
//       userService.findByUserId(dto.getUserId())
//     with
//       User user = SecurityUtil.getCurrentUser();   // same as updateProfile
//     and remove userId from PasswordResetDto entirely.
//
async function updatePassword() {
    const currentPassword = document.getElementById("currentPassword")?.value;
    const newPassword = document.getElementById("newPassword")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast("Please fill in all password fields.", "error");
        return;
    }

    if (newPassword.length < 3) {
        showToast("New password must be at least 8 characters.", "error");
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast("New passwords do not match.", "error");
        // Highlight mismatch fields
        document.getElementById("newPassword").classList.add("border-red-400", "ring-1", "ring-red-400");
        document.getElementById("confirmPassword").classList.add("border-red-400", "ring-1", "ring-red-400");
        setTimeout(() => {
            document.getElementById("newPassword")?.classList.remove("border-red-400", "ring-1", "ring-red-400");
            document.getElementById("confirmPassword")?.classList.remove("border-red-400", "ring-1", "ring-red-400");
        }, 3000);
        return;
    }

    const btn = document.querySelector('[onclick="updatePassword()"]');
    if (btn) setButtonLoading(btn, true, "Update Password");

    try {
        const res = await fetch("/api/settings/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword,
                // userId is intentionally NOT sent here — see security note above.
                // Once your backend is fixed to use SecurityUtil, remove userId from PasswordResetDto.
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            // Common case: wrong current password
            if (res.status === 401 || res.status === 403) {
                throw new Error("Current password is incorrect.");
            }
            throw new Error(err || `Server error: ${res.status}`);
        }

        showToast("Password updated successfully!", "success");

        // Clear password fields
        ["currentPassword", "newPassword", "confirmPassword"].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });

    } catch (err) {
        console.error("updatePassword error:", err);
        showToast(err.message || "Failed to update password. Try again.", "error");
    } finally {
        if (btn) setButtonLoading(btn, false, "Update Password");
    }
}