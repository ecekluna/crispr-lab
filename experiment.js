/**
 * ============================================================================
 * CRISPR-LAB | SEVİYE 1: HBB GENOM KESİM & İNTERAKTİF NÜKLEOTİT MOTORU
 * ============================================================================
 */

const firebaseConfig = {
    apiKey: "AIzaSyBu2hX7Q7VnSH4brq-_HWnFtgrPiR5A-cE",
    authDomain: "crispr-lab-ddb21.firebaseapp.com",
    projectId: "crispr-lab-ddb21",
    storageBucket: "crispr-lab-ddb21.firebasestorage.app",
    messagingSenderId: "1064623340355",
    appId: "1:1064623340355:web:f280ccae2b6527d6048df6",
    measurementId: "G-H2Q5Z532TQ"
};

let app = null;
let auth = null;
let db = null;

try {
    if (typeof firebase !== "undefined") {
        app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
        auth = firebase.auth();
        db = firebase.firestore();
    }
} catch (e) {
    console.warn("Firebase başlatma uyarısı:", e);
}

// Seviye 1 Veri Seti (HBB Hemoglobin Geni)
const LEVEL_1_DATA = {
    senseDna: "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAAC",
    correctTarget: "CCTGAGGAGAAGTCTGCCGT", // 20 baz
    correctPam: "TGG",                    // 3 baz
    correctGrna: "CCUGAGGAGAAGUCUGCCGU",
    badge: "🔍 PAM Avcısı"
};

let currentSelectionMode = "target"; // "target" veya "pam"
let selectedTargetIndices = [];
let selectedPamIndices = [];

const COMPLEMENT_MAP = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };

document.addEventListener("DOMContentLoaded", function() {
    renderInteractiveDna();
    initControls();
    updateLiveAnalytics();
});

function renderInteractiveDna() {
    const track = document.getElementById("interactiveDnaTrack");
    if (!track) return;

    const dna = LEVEL_1_DATA.senseDna;
    
    // 1. İleri (Sense) Zincir
    let html = '<div class="dna-strand sense-strand">';
    for (let i = 0; i < dna.length; i++) {
        const base = dna[i];
        html += `
            <button type="button" class="base-btn base-${base}" data-index="${i}" data-base="${base}" title="Pozisyon: ${i + 1} (${base})">
                <span class="base-char">${base}</span>
                <span class="base-pos">${i + 1}</span>
            </button>
        `;
    }
    html += '</div>';

    // 2. Komplemanter (Antisense) Zincir
    html += '<div class="dna-strand antisense-strand">';
    for (let i = 0; i < dna.length; i++) {
        const compBase = COMPLEMENT_MAP[dna[i]] || 'N';
        html += `<span class="base-btn-comp comp-${compBase}" title="Komplemanter: ${compBase}">${compBase}</span>`;
    }
    html += '</div>';

    track.innerHTML = html;

    // Tıklama Olayları
    track.querySelectorAll(".base-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            const index = parseInt(this.getAttribute("data-index"));
            handleBaseClick(index);
        });
    });
}

function handleBaseClick(index) {
    if (currentSelectionMode === "target") {
        // PAM ile çakışmayı önle
        selectedPamIndices = selectedPamIndices.filter(i => i !== index);

        if (selectedTargetIndices.includes(index)) {
            selectedTargetIndices = selectedTargetIndices.filter(i => i !== index);
        } else {
            if (selectedTargetIndices.length >= 20) {
                alert("Hedef protospacer uzunluğu tam olarak 20 baz olmalıdır. Farklı bir baz eklemek için önce seçili bir bazı kaldırın.");
                return;
            }
            selectedTargetIndices.push(index);
            selectedTargetIndices.sort((a, b) => a - b);
        }
    } else if (currentSelectionMode === "pam") {
        // Target ile çakışmayı önle
        selectedTargetIndices = selectedTargetIndices.filter(i => i !== index);

        if (selectedPamIndices.includes(index)) {
            selectedPamIndices = selectedPamIndices.filter(i => i !== index);
        } else {
            if (selectedPamIndices.length >= 3) {
                alert("PAM motifi tam olarak 3 baz uzunluğunda (5'-NGG-3') olmalıdır.");
                return;
            }
            selectedPamIndices.push(index);
            selectedPamIndices.sort((a, b) => a - b);
        }
    }

    updateTrackVisuals();
    updateLiveAnalytics();
}

function updateTrackVisuals() {
    const allBtns = document.querySelectorAll("#interactiveDnaTrack .base-btn");
    allBtns.forEach(btn => {
        const idx = parseInt(btn.getAttribute("data-index"));
        btn.classList.remove("selected-target", "selected-pam");

        if (selectedTargetIndices.includes(idx)) {
            btn.classList.add("selected-target");
        }
        if (selectedPamIndices.includes(idx)) {
            btn.classList.add("selected-pam");
        }
    });
}

function updateLiveAnalytics() {
    const dna = LEVEL_1_DATA.senseDna;
    
    // Seçilen DNA ve gRNA (T -> U)
    let selectedDnaSeq = selectedTargetIndices.map(i => dna[i]).join("");
    let grnaRna = selectedDnaSeq.replace(/T/g, "U");
    let pamSeq = selectedPamIndices.map(i => dna[i]).join("");

    const liveGrna = document.getElementById("liveGrnaSeq");
    const livePam = document.getElementById("livePamSeq");
    const liveGc = document.getElementById("liveGcContent");

    if (liveGrna) {
        if (grnaRna.length > 0) {
            liveGrna.innerHTML = `<strong>${grnaRna}</strong> <span class="metric-count">(${grnaRna.length}/20)</span>`;
        } else {
            liveGrna.textContent = "(Henüz seçilmedi)";
        }
    }

    if (livePam) {
        if (pamSeq.length > 0) {
            livePam.innerHTML = `<strong>${pamSeq}</strong> <span class="metric-count">(${pamSeq.length}/3)</span>`;
        } else {
            livePam.textContent = "---";
        }
    }

    if (liveGc) {
        if (selectedDnaSeq.length > 0) {
            let gcCount = 0;
            for (let b of selectedDnaSeq) {
                if (b === 'G' || b === 'C') gcCount++;
            }
            let gcPercent = Math.round((gcCount / selectedDnaSeq.length) * 100);
            liveGc.textContent = `%${gcPercent}`;
            
            // GC stabilite rengi
            if (gcPercent >= 40 && gcPercent <= 60) {
                liveGc.style.color = "var(--bio-green)";
            } else {
                liveGc.style.color = "var(--brand-coral)";
            }
        } else {
            liveGc.textContent = "%0";
            liveGc.style.color = "var(--bio-green)";
        }
    }
}

function initControls() {
    const targetModeBtn = document.getElementById("selectTargetModeBtn");
    const pamModeBtn = document.getElementById("selectPamModeBtn");
    const resetBtn = document.getElementById("resetSelectionBtn");
    const executeBtn = document.getElementById("executeCutBtn");

    targetModeBtn?.addEventListener("click", function() {
        currentSelectionMode = "target";
        targetModeBtn.className = "btn-primary";
        pamModeBtn.className = "btn-secondary";
    });

    pamModeBtn?.addEventListener("click", function() {
        currentSelectionMode = "pam";
        pamModeBtn.className = "btn-primary";
        targetModeBtn.className = "btn-secondary";
    });

    resetBtn?.addEventListener("click", function() {
        selectedTargetIndices = [];
        selectedPamIndices = [];
        updateTrackVisuals();
        updateLiveAnalytics();
        const resultBox = document.getElementById("expResultBox");
        if (resultBox) {
            resultBox.classList.add("hidden");
            resultBox.innerHTML = "";
        }
    });

    executeBtn?.addEventListener("click", validateAndExecuteCut);
}

async function validateAndExecuteCut() {
    const resultBox = document.getElementById("expResultBox");
    if (!resultBox) return;

    resultBox.classList.remove("hidden");

    const dna = LEVEL_1_DATA.senseDna;
    const selectedDnaSeq = selectedTargetIndices.map(i => dna[i]).join("");
    const selectedGrna = selectedDnaSeq.replace(/T/g, "U");
    const selectedPam = selectedPamIndices.map(i => dna[i]).join("");

    if (selectedTargetIndices.length !== 20) {
        resultBox.innerHTML = `
            <div class="result-card error">
                <div style="font-size: 1.6rem; margin-bottom: 4px;">⚠️</div>
                <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">gRNA Uzunluğu Hatalı (${selectedTargetIndices.length}/20 Baz)</h3>
                <p style="font-size: 0.86rem; line-height: 1.5;">Kılavuz RNA protospacer dizisi tam olarak 20 baz uzunluğunda olmalıdır.</p>
            </div>
        `;
        return;
    }

    if (selectedPam.length !== 3) {
        resultBox.innerHTML = `
            <div class="result-card error">
                <div style="font-size: 1.6rem; margin-bottom: 4px;">⚠️</div>
                <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">PAM Motifi Eksik (${selectedPam.length}/3 Baz)</h3>
                <p style="font-size: 0.86rem; line-height: 1.5;">SpCas9 için 3 bazlık PAM (5'-NGG-3') motifi seçmelisiniz.</p>
            </div>
        `;
        return;
    }

    const isPamValid = (selectedPam === LEVEL_1_DATA.correctPam || selectedPam.endsWith("GG"));
    const isGrnaValid = (selectedGrna === LEVEL_1_DATA.correctGrna);

    if (isPamValid && isGrnaValid) {
        let completed = [];
        try {
            const local = localStorage.getItem("crispr_completed_levels");
            completed = local ? JSON.parse(local) : [1];
        } catch { completed = [1]; }

        if (!completed.includes(2)) {
            completed.push(2);
            localStorage.setItem("crispr_completed_levels", JSON.stringify(completed));
        }

        if (auth && auth.currentUser && db) {
            await db.collection("users").doc(auth.currentUser.uid).set({
                completedLevels: completed
            }, { merge: true }).catch(err => console.warn(err));
        }

        resultBox.innerHTML = `
            <div class="result-card success" style="text-align: center; padding: 26px;">
                <div style="font-size: 2.5rem; margin-bottom: 6px;">🎉 ✂️ 🧬</div>
                <h2 style="color: #065f46; font-size: 1.4rem; font-weight: 800; margin-bottom: 6px;">Kusursuz Moleküler Kilitlenme ve Kesim!</h2>
                <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 600px; margin: 0 auto 16px;">
                    Cas9 nükleazı <strong>${selectedPam}</strong> PAM motifini tanıdı ve tasarladığınız 20 bazlık gRNA eşliğinde DNA çift sarmalında pürüzsüz bir çift iplik kırığı (DSB) oluşturdu.
                </p>
                <div class="pill-badge" style="background: #ffffff; border: 1px solid #a7f3d0; padding: 6px 16px; font-size: 0.9rem; margin-bottom: 16px;">
                    Kazanılan Rozet: <strong>${LEVEL_1_DATA.badge}</strong>
                </div>
                <div>
                    <button type="button" class="btn-primary" onclick="window.close()" style="padding: 10px 22px;">
                        Seviye Haritasına Dön & 2. Seviyeye Geç ➔
                    </button>
                </div>
            </div>
        `;
    } else {
        resultBox.innerHTML = `
            <div class="result-card error">
                <div style="font-size: 1.6rem; margin-bottom: 4px;">⚠️</div>
                <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">Hedefleme Başarısız Oldu</h3>
                <p style="font-size: 0.86rem; line-height: 1.5;">
                    Seçtiğiniz sekans veya PAM motifi doğru konumda değil.<br>
                    💡 <strong>İpucu:</strong> Dizilimdeki <code>TGG</code> motifini bulun ve hemen solundaki 20 bazı seçin.
                </p>
            </div>
        `;
    }
}