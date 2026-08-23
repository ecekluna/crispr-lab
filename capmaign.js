/**
 * ============================================================================
 * CRISPR-LAB | HİKAYE MODU MOTORU & KARİYER İLERLEME YÖNETİMİ
 * ============================================================================
 */

const STORY_RANKS = {
    1: "🔬 Stajyer Araştırmacı",
    2: "🧬 Moleküler Biyolog",
    3: "🎯 Kıdemli Genetikçi",
    4: "✂️ Baş Araştırmacı",
    5: "🏆 Laboratuvar Direktörü"
};

function updateStoryUI() {
    let completed = [];
    try {
        const stored = localStorage.getItem("crispr_completed_levels");
        completed = stored ? JSON.parse(stored) : [1];
    } catch (e) {
        completed = [1];
    }

    const maxUnlocked = Math.max(...completed);
    const totalFinished = completed.length > 1 ? completed.length - 1 : 0;

    // Üst Panel & Kariyer Unvanı Güncelleme
    const progBar = document.getElementById("campaignProgressBar");
    const progText = document.getElementById("campaignProgressText");
    const badgeDisplay = document.getElementById("badgeCountDisplay");
    const userRankBadge = document.getElementById("storyUserRankBadge");

    if (progBar) {
        progBar.style.width = Math.min(100, Math.max(20, (maxUnlocked / 5) * 100)) + "%";
    }

    if (progText) {
        progText.textContent = `Seviye ${Math.min(5, maxUnlocked)} / 5 Açık`;
    }

    if (badgeDisplay) {
        badgeDisplay.textContent = `🏆 ${totalFinished} / 5 Rozet`;
    }

    if (userRankBadge) {
        userRankBadge.textContent = STORY_RANKS[Math.min(5, maxUnlocked)] || "🔬 Araştırmacı";
    }

    // 5 Seviyenin Kilitlerini Kontrol Et
    for (let lvl = 1; lvl <= 5; lvl++) {
        const card = document.getElementById(`cardLevel${lvl}`);
        const statusTag = document.getElementById(`statusTag${lvl}`);
        const badgeCheck = document.getElementById(`badgeCheck${lvl}`);
        const btn = document.getElementById(`btnLevel${lvl}`);

        const isDone = completed.includes(lvl + 1);
        const isUnlocked = lvl <= maxUnlocked;

        if (card) {
            card.classList.remove("locked", "unlocked", "completed-level");
            if (isDone) {
                card.classList.add("unlocked", "completed-level");
            } else if (isUnlocked) {
                card.classList.add("unlocked");
            } else {
                card.classList.add("locked");
            }
        }

        if (badgeCheck) {
            if (isDone) {
                badgeCheck.classList.remove("hidden");
            } else {
                badgeCheck.classList.add("hidden");
            }
        }

        if (statusTag) {
            if (isDone) {
                statusTag.textContent = "✓ TAMAMLANDI";
                statusTag.className = "difficulty-tag başlangıç";
            } else if (isUnlocked) {
                statusTag.textContent = "🔓 AÇIK";
                statusTag.className = "difficulty-tag orta";
            } else {
                statusTag.textContent = "🔒 KİLİTLİ";
                statusTag.className = "difficulty-tag ileri";
            }
        }

        if (btn) {
            if (isUnlocked) {
                btn.href = `experiment.html?level=${lvl}`;
                btn.target = "_blank";
                btn.className = "btn-primary full-width text-center";
                btn.textContent = isDone ? "Vakayı Tekrarla ↺" : "Laboratuvara Gir 🧪";
                btn.style.cursor = "pointer";
                btn.style.opacity = "1";
            } else {
                btn.href = "javascript:void(0)";
                btn.target = "";
                btn.className = "btn-secondary full-width text-center disabled-link";
                btn.textContent = "Önceki Seviyeyi Tamamlayın";
                btn.style.cursor = "not-allowed";
                btn.style.opacity = "0.55";
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", updateStoryUI);
window.addEventListener("focus", updateStoryUI);