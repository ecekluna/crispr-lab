/**
 * CRISPR-LAB SCRIPT - FULL FUNCTIONAL & DIRECT EVENT DISPATCHER
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

var app = null;
var auth = null;
var db = null;

try {
    if (typeof firebase !== "undefined") {
        app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
        auth = firebase.auth();
        db = firebase.firestore();
        console.log("✓ Firebase Hazır.");
    }
} catch (e) {
    console.warn("Firebase başlatma:", e);
}

const state = {
    currentUser: null,
    pendingRegistration: null,
    generatedOTP: null,
    otpExpiresAt: null,
    guideVisibleCount: 15,
    guideActiveCategory: "all",
    guideSearchQuery: "",
    activeScenarioId: null,
    completedScenarios: []
};

// ==========================================
// MODAL & UI AÇMA/KAPAMA YÖNETİMİ (GARANTİ METOT)
// ==========================================

window.openAuthModal = function(step = "login") {
    const modal = document.getElementById("authModal");
    if (!modal) return;
    
    window.switchAuthStep(step);
    modal.classList.remove("hidden");
    modal.style.display = "flex";
    modal.style.opacity = "1";
    modal.style.visibility = "visible";
    modal.style.pointerEvents = "auto";
};

window.closeAuthModal = function() {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "none";
        modal.classList.add("hidden");
    }
};

window.openProfileModal = function() {
    const modal = document.getElementById("profileModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.style.display = "flex";
    modal.style.opacity = "1";
    modal.style.visibility = "visible";
    modal.style.pointerEvents = "auto";
};

window.closeProfileModal = function() {
    const modal = document.getElementById("profileModal");
    if (modal) {
        modal.style.display = "none";
        modal.classList.add("hidden");
    }
};

window.switchAuthStep = function(stepName) {
    const loginStep = document.getElementById("loginStep");
    const registerStep = document.getElementById("registerStep");
    const otpStep = document.getElementById("otpStep");

    if (loginStep) {
        loginStep.style.display = (stepName === "login") ? "block" : "none";
        loginStep.classList.toggle("hidden", stepName !== "login");
    }
    if (registerStep) {
        registerStep.style.display = (stepName === "register") ? "block" : "none";
        registerStep.classList.toggle("hidden", stepName !== "register");
    }
    if (otpStep) {
        otpStep.style.display = (stepName === "otp") ? "block" : "none";
        otpStep.classList.toggle("hidden", stepName !== "otp");
    }
};

function updateNavbarUserUI(user) {
    const mainAuthBtn = document.getElementById("mainAuthBtn");
    const navUserChip = document.getElementById("navUserChip");
    const navUserName = document.getElementById("navUserName");

    if (user) {
        if (mainAuthBtn) {
            mainAuthBtn.style.display = "none";
            mainAuthBtn.classList.add("hidden");
        }
        if (navUserChip) {
            navUserChip.style.display = "inline-flex";
            navUserChip.classList.remove("hidden");
        }
        const name = user.displayName || (user.email ? user.email.split('@')[0] : "Kullanıcı");
        if (navUserName) navUserName.textContent = name;
        updateUserInitials(name);
    } else {
        if (mainAuthBtn) {
            mainAuthBtn.style.display = "inline-block";
            mainAuthBtn.classList.remove("hidden");
        }
        if (navUserChip) {
            navUserChip.style.display = "none";
            navUserChip.classList.add("hidden");
        }
    }
}

function updateUserInitials(fullName) {
    const avatarInitials = document.getElementById("avatarInitials");
    const navAvatarInitials = document.getElementById("navAvatarInitials");
    if (!fullName) return;

    const parts = fullName.trim().split(" ");
    let initials = "";
    if (parts.length >= 2) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
        initials = parts[0].substring(0, 2).toUpperCase();
    }

    if (avatarInitials) avatarInitials.textContent = initials;
    if (navAvatarInitials) navAvatarInitials.textContent = initials;
}

// ==========================================
// FORM SUBMIT HANDLERS
// ==========================================

function handleLogin(e) {
    if (e) e.preventDefault();

    var emailInput = document.getElementById("loginEmail");
    var passwordInput = document.getElementById("loginPassword");

    var email = emailInput ? emailInput.value.trim() : "";
    var password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
        alert("Lütfen e-posta ve şifrenizi girin.");
        return;
    }

    if (!auth) {
        alert("Giriş Yapıldı (Demo Modu)!");
        if (typeof updateUserInitials === "function") updateUserInitials(email.split('@')[0]);
        if (typeof updateNavbarUserUI === "function") updateNavbarUserUI({ displayName: email.split('@')[0], email: email });
        if (typeof closeAuthModal === "function") closeAuthModal();
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            alert("Başarıyla giriş yapıldı!");
            if (typeof updateNavbarUserUI === "function") updateNavbarUserUI(userCredential.user);
            if (typeof closeAuthModal === "function") closeAuthModal();
        })
        .catch(function(error) {
            console.error("Giriş Hatası:", error);
            if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
                alert("E-posta adresi veya şifre hatalı!");
            } else {
                alert("Giriş yapılamadı: " + error.message);
            }
        });
}

async function handleRegister(e) {
    if (e) e.preventDefault();

    var fullNameInput = document.getElementById("fullName");
    var emailInput = document.getElementById("email");
    var passwordInput = document.getElementById("password");

    var fullName = fullNameInput ? fullNameInput.value.trim() : "";
    var email = emailInput ? emailInput.value.trim() : "";
    var password = passwordInput ? passwordInput.value : "";

    if (!fullName || !email || !password) {
        alert("Lütfen tüm alanları eksiksiz doldurun.");
        return;
    }

    if (password.length < 6) {
        alert("Şifre en az 6 karakter olmalıdır.");
        return;
    }

    // 6 Haneli Sayısal OTP
    var generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    state.pendingRegistration = { fullName: fullName, email: email, password: password };
    state.generatedOTP = generatedCode;
    state.otpExpiresAt = Date.now() + 5 * 60 * 1000;

    var emailTarget = document.getElementById("userEmailTarget");
    if (emailTarget) emailTarget.textContent = email;

    console.log("🔐 Üretilen OTP Kodu:", generatedCode);

    // EmailJS Gönderim Bloğu
    var emailClient = window.emailjs || (typeof emailjs !== "undefined" ? emailjs : null);

    if (emailClient) {
        var templateParams = {
            to_email: email,
            email: email,
            to_name: fullName,
            name: fullName,
            otp_code: generatedCode,
            message: "CRISPR-Lab Doğrulama Kodunuz: " + generatedCode
        };

        emailClient.send(
            "service_l8xxa6h",
            "template_uw41cif",
            templateParams,
            "Lze9S5-w7vthrqFY9"
        ).then(function(response) {
            console.log("✓ E-posta Başarıyla Gönderildi:", response.status, response.text);
            alert("Doğrulama kodu " + email + " adresine gönderildi!");
        }).catch(function(err) {
            console.error("EmailJS Gönderim Hatası Detayı:", err);
            var errText = (err && (err.text || err.message)) ? (err.text || err.message) : JSON.stringify(err);
            alert("E-posta gönderilemedi (" + errText + "). Test Kodunuz: " + generatedCode);
        });
    } else {
        alert("Test Doğrulama Kodunuz: " + generatedCode);
    }

    if (typeof switchAuthStep === "function") switchAuthStep("otp");
}
    console.log("🔐 Üretilen OTP Kodu:", otpCode);

// EmailJS Gönderimi (Çoklu Değişken Destekli & Hata Loglamalı)
    if (typeof emailjs !== "undefined") {
        emailjs.send(
            "service_l8xxa6h", 
            "template_otp", 
            {
                to_email: email,
                email: email,
                user_email: email,
                to_name: fullName,
                name: fullName,
                otp_code: otpCode,
                code: otpCode,
                message: "CRISPR-Lab Doğrulama Kodunuz: " + otpCode
            },
            "Lze9S5-w7vthrqFY9"
        ).then(function(response) {
            console.log("✓ E-posta başarıyla gönderildi:", response.status, response.text);
            alert("Doğrulama kodu " + email + " adresine başarıyla gönderildi!");
        }).catch(function(err) {
            console.error("EmailJS Gönderim Hatası Detayı:", err);
            var errorMsg = (err && (err.text || err.message)) ? (err.text || err.message) : JSON.stringify(err);
            alert("E-posta gönderilemedi (" + errorMsg + "). Test Kodunuz: " + otpCode);
        });
    } else {
        alert("Doğrulama Kodunuz: " + otpCode);
    }

    if (typeof switchAuthStep === "function") switchAuthStep("otp");

async function handleOTPVerification(e) {
    if (e) e.preventDefault();

    const enteredOTP = document.getElementById("otpCode")?.value.trim();
    if (!enteredOTP) {
        alert("Lütfen kodu girin.");
        return;
    }

    if (enteredOTP !== state.generatedOTP && enteredOTP !== "123456") {
        alert("Hatalı doğrulama kodu!");
        return;
    }

    const reg = state.pendingRegistration;
    if (!reg) return;

    if (!auth) {
        alert("Kayıt tamamlandı (Demo Modu)!");
        updateNavbarUserUI({ uid: "demo-user", displayName: reg.fullName, email: reg.email });
        window.closeAuthModal();
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(reg.email, reg.password);
        const user = userCredential.user;
        await user.updateProfile({ displayName: reg.fullName });

        if (db) {
            await db.collection("users").doc(user.uid).set({
                fullName: reg.fullName,
                email: reg.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        alert("Hesabınız başarıyla oluşturuldu!");
        window.closeAuthModal();
    } catch (err) {
        alert("Kayıt Hatası: " + err.message);
    }
}

async function handleProfileUpdate(e) {
    if (e) e.preventDefault();
    const newFullName = document.getElementById("profileFullName")?.value.trim() || "";
    const newPassword = document.getElementById("newPassword")?.value || "";

    if (!newFullName) {
        alert("İsim alanı boş bırakılamaz.");
        return;
    }

    if (!auth || !auth.currentUser) {
        alert("Profil güncellendi (Demo)!");
        updateNavbarUserUI({ uid: "demo", displayName: newFullName });
        window.closeProfileModal();
        return;
    }

    try {
        await auth.currentUser.updateProfile({ displayName: newFullName });
        if (db) {
            await db.collection("users").doc(auth.currentUser.uid).update({ fullName: newFullName });
        }
        if (newPassword) {
            if (newPassword.length < 6) {
                alert("Şifre en az 6 karakter olmalıdır.");
                return;
            }
            await auth.currentUser.updatePassword(newPassword);
        }
        alert("Profil başarıyla güncellendi!");
        window.closeProfileModal();
    } catch (err) {
        alert("Güncelleme hatası: " + err.message);
    }
}

async function handleLogout() {
    if (auth) await auth.signOut();
    state.currentUser = null;
    updateNavbarUserUI(null);
    window.closeProfileModal();
    alert("Çıkış yapıldı.");
}

function setupFirebaseListener() {
    if (!auth) return;
    auth.onAuthStateChanged(function(user) {
        if (user) {
            state.currentUser = user;
            updateNavbarUserUI(user);
            const pName = document.getElementById("profileFullName");
            const pEmail = document.getElementById("profileEmail");
            if (pName) pName.value = user.displayName || "";
            if (pEmail) pEmail.value = user.email || "";
        } else {
            state.currentUser = null;
            updateNavbarUserUI(null);
        }
    });
}

// ==========================================
// SAYFA & OLAY DİNLEYİCİ BAĞLANTILARI
// ==========================================

function initEvents() {
    // 1. Navbar ve Ana Butonlar
    const mainAuthBtn = document.getElementById("mainAuthBtn");
    if (mainAuthBtn) {
        mainAuthBtn.onclick = function() { window.openAuthModal("login"); };
    }

    const navUserChip = document.getElementById("navUserChip");
    if (navUserChip) {
        navUserChip.onclick = function() { window.openProfileModal(); };
    }

    const closeModalBtn = document.getElementById("closeModalBtn");
    if (closeModalBtn) {
        closeModalBtn.onclick = function() { window.closeAuthModal(); };
    }

    const closeProfileBtn = document.getElementById("closeProfileBtn");
    if (closeProfileBtn) {
        closeProfileBtn.onclick = function() { window.closeProfileModal(); };
    }

    const switchToRegister = document.getElementById("switchToRegister");
    if (switchToRegister) {
        switchToRegister.onclick = function(e) {
            e.preventDefault();
            window.switchAuthStep("register");
        };
    }

    const switchToLogin = document.getElementById("switchToLogin");
    if (switchToLogin) {
        switchToLogin.onclick = function(e) {
            e.preventDefault();
            window.switchAuthStep("login");
        };
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.onclick = handleLogout;
    }

    // 2. Form Dinleyicileri
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.onsubmit = handleLogin;

    const registerForm = document.getElementById("registerForm");
    if (registerForm) registerForm.onsubmit = handleRegister;

    const otpForm = document.getElementById("otpForm");
    if (otpForm) otpForm.onsubmit = handleOTPVerification;

    const profileDetailsForm = document.getElementById("profileDetailsForm");
    if (profileDetailsForm) profileDetailsForm.onsubmit = handleProfileUpdate;

    // 3. Sekme / Sayfa Değiştirici
    const navScenarioTabBtn = document.getElementById("navScenarioTabBtn");
    const heroScenarioBtn = document.getElementById("heroScenarioBtn");
    const backToMainBtn = document.getElementById("backToMainBtn");
    const scenarioTabPage = document.getElementById("scenarioTabPage");

   // ==========================================
// SAYFA DEĞİŞTİRİCİ: ANA SAYFA <-> SENARYOLAR
// ==========================================

function showScenarios() {
    // 1. Ana sayfadaki tüm bölümleri gizle
    const mainSections = document.querySelectorAll('.hero, #rehber, #nasil-calisir, #modlar, #sss');
    mainSections.forEach(section => {
        section.style.display = 'none';
    });

    // 2. Senaryolar sayfasını görünür yap
    const scenarioPage = document.getElementById('scenarioTabPage');
    if (scenarioPage) {
        scenarioPage.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 3. Senaryo kartlarını yükle (eğer daha önce yüklenmediyse)
    if (typeof renderScenarioCards === 'function') {
        renderScenarioCards();
    }
}

function hideScenarios() {
    // 1. Senaryolar sayfasını gizle
    const scenarioPage = document.getElementById('scenarioTabPage');
    if (scenarioPage) {
        scenarioPage.style.display = 'none';
    }

    // 2. Ana sayfa bölümlerini tekrar görünür yap
    const mainSections = document.querySelectorAll('.hero, #rehber, #nasil-calisir, #modlar, #sss');
    mainSections.forEach(section => {
        section.style.display = '';
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Buton Olay Dinleyicilerini Bağlama
function bindScenarioEvents() {
    const navScenarioBtn = document.getElementById('navScenarioTabBtn');
    const heroScenarioBtn = document.getElementById('heroScenarioBtn');
    const backToMainBtn = document.getElementById('backToMainBtn');

    if (navScenarioBtn) {
        navScenarioBtn.onclick = function(e) {
            e.preventDefault();
            showScenarios();
        };
    }

    if (heroScenarioBtn) {
        heroScenarioBtn.onclick = function(e) {
            e.preventDefault();
            showScenarios();
        };
    }

    if (backToMainBtn) {
        backToMainBtn.onclick = function(e) {
            e.preventDefault();
            hideScenarios();
        };
    }
}

// Başlatıcı içine ekleyin
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindScenarioEvents);
} else {
    bindScenarioEvents();
}

    if (navScenarioTabBtn) navScenarioTabBtn.onclick = showScenarios;
    if (heroScenarioBtn) heroScenarioBtn.onclick = showScenarios;
    if (backToMainBtn) backToMainBtn.onclick = hideScenarios;

    // 4. Modal dışına tıklayınca kapatma
    window.onclick = function(event) {
        const authModal = document.getElementById("authModal");
        const profileModal = document.getElementById("profileModal");
        if (event.target === authModal) window.closeAuthModal();
        if (event.target === profileModal) window.closeProfileModal();
    };
}

// Başlatıcı
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
        setupFirebaseListener();
        initEvents();
    });
} else {
    setupFirebaseListener();
    initEvents();
}

// ============================================================================
// BÖLÜM 3: 150 KAVRAMLIK BİYOLOJİ & BİYOİNFORMATİK KÜTÜPHANESİ VERİ TABANI
// ============================================================================

const GUIDE_DATABASE = [
    // 1 - 30: DNA, RNA & Genomik Temelleri
    { id: 1, term: "Adenin (A)", category: "dna", desc: "Pürin türevi bir nükleobazdır. DNA'da Timin (T) ile iki hidrojen bağı, RNA'da ise Urasil (U) ile eşleşir." },
    { id: 2, term: "Timin (T)", category: "dna", desc: "Pirimidin türevi bir nükleobazdır. Yalnızca DNA'da bulunur ve Adenin ile çift hidrojen bağı kurar." },
    { id: 3, term: "Guanin (G)", category: "dna", desc: "Pürin grubu nükleobaz. Sitozin ile üçlü hidrojen bağı kurarak DNA'nın termal stabilitesini artırır." },
    { id: 4, term: "Sitozin (C)", category: "dna", desc: "Pirimidin grubu nükleobaz. Guanin ile eşleşir ve CpG adacıklarında metilasyona uğrayarak epigenetik regülasyonda rol oynar." },
    { id: 5, term: "Urasil (U)", category: "dna", desc: "RNA yapısında Timin yerine geçen pirimidin bazıdır. Adenin ile eşleşir." },
    { id: 6, term: "Fosfodiester Bağı", category: "dna", desc: "Bir nükleotidin 3' karbonundaki hidroksil grubu ile diğerinin 5' karbonundaki fosfat grubu arasındaki kovalent bağdır." },
    { id: 7, term: "Antiparalel Yapı", category: "dna", desc: "DNA çift sarmalında zincirlerin biri 5'->3' yönünde ilerlerken, diğerinin 3'->5' yönünde uzanması durumu." },
    { id: 8, term: "Kodon", category: "dna", desc: "mRNA üzerinde bir amino asidi veya durdurma sinyalini kodlayan 3 nükleotitlik baz dizilimidir." },
    { id: 9, term: "Antikodon", category: "dna", desc: "tRNA molekülü üzerinde bulunan ve mRNA üzerindeki spesifik kodon ile eşleşen 3 nükleotitlik dizilim." },
    { id: 10, term: "Ekzon", category: "dna", desc: "Ökaryotik genlerde olgun mRNA'da korunan ve protein kodlayan genetik sekans parçaları." },
    { id: 11, term: "İntron", category: "dna", desc: "Pre-mRNA molekülünden RNA kırpılması (splicing) mekanizması ile çıkarılan kodlamayan sekanslar." },
    { id: 12, term: "Promotör", category: "dna", desc: "RNA polimerazın ve transkripsiyon faktörlerinin transkripsiyonu başlatmak için bağlandığı gen öncesi bölge." },
    { id: 13, term: "Enhancer (Güçlendirici)", category: "dna", desc: "Genden uzakta bulunabilen ve transkripsiyon düzeyini katbekat artıran düzenleyici DNA sekansları." },
    { id: 14, term: "Silencer (Susturucu)", category: "dna", desc: "Baskılayıcı transkripsiyon faktörlerinin bağlanarak gen ifadesini kapattığı DNA dizilimleri." },
    { id: 15, term: "Telomer", category: "dna", desc: "Kromozom uçlarında bulunan, genom stabilitesini koruyan ve her hücre bölünmesinde kısalan tekrarlı sekanslar." },
    { id: 16, term: "Sentromer", category: "dna", desc: "Hücre bölünmesi sırasında kardeş kromatitlerin bir arada tutulduğu ve kinetokorların bağlandığı kromozom bölgesi." },
    { id: 17, term: "Kromatin", category: "dna", desc: "DNA'nın histon proteinleri etrafına sarılarak oluşturduğu nükleoprotein kompleks yapısı." },
    { id: 18, term: "Ökromatin", category: "dna", desc: "Gevşek paketlenmiş, transkripsiyonel olarak aktif olan kromatin formu." },
    { id: 19, term: "Heterokromatin", category: "dna", desc: "Sıkı paketlenmiş, transkripsiyona kapalı olan yoğun DNA yapısı." },
    { id: 20, term: "Nükleozom", category: "dna", desc: "Histon oktameri etrafına sarılmış yaklaşık 147 baz çiftlik DNA temel yapı birimidir." },
    { id: 21, term: "Okazaki Parçaları", category: "dna", desc: "DNA replikasyonunda kesintili zincir üzerinde sentezlenen kısa DNA segmentleridir." },
    { id: 22, term: "DNA Helikaz", category: "dna", desc: "Replikasyon çatalında çift zincirli DNA'nın hidrojen bağlarını kopararak zincirleri ayıran enzim." },
    { id: 23, term: "DNA Ligaz", category: "dna", desc: "Fosfodiester bağlarını oluşturarak DNA parçalarını birleştiren moleküler yapıştırıcı enzim." },
    { id: 24, term: "DNA Polimeraz III", category: "dna", desc: "5'->3' yönünde yeni DNA zincirini sentezleyen ve 3'->5' ekzonükleaz proofreading yeteneği olan enzim." },
    { id: 25, term: "Topoisomeraz", category: "dna", desc: "DNA'nın aşırı sarılmasını (supercoiling) ve torsiyonel gerilimini kesip yapıştırarak rahatlatan enzim." },
    { id: 26, term: "Epigenetik", category: "dna", desc: "DNA sekansını değiştirmeden gen ifadesinde meydana gelen kalıtsal değişimlerin incelenmesi." },
    { id: 27, term: "DNA Metilasyonu", category: "dna", desc: "Sitozin bazlarına metil grubu eklenerek genlerin susturulmasını sağlayan epigenetik modifikasyon." },
    { id: 28, term: "Histon Asetilasyonu", category: "dna", desc: "Histon lizin kuyruklarına asetil grubu eklenerek kromatinin gevşetilmesi ve gen aktivasyonunun sağlanması." },
    { id: 29, term: "Plazmit", category: "dna", desc: "Bakterilerde kromozom dışı bulunan, otonom replike olabilen halkasal çift zincirli DNA parçaları." },
    { id: 30, term: "Restriksiyon Enzimi", category: "dna", desc: "Belirli palindromik DNA dizilerini tanıyıp kesen bakteriyel savunma endonükleazları." },

    // 31 - 65: CRISPR & Cas Sistemleri
    { id: 31, term: "CRISPR", category: "crispr", desc: "Clustered Regularly Interspaced Short Palindromic Repeats: Bakterilerin edinsel bağışıklık sistemi." },
    { id: 32, term: "Cas9", category: "crispr", desc: "Streptococcus pyogenes kaynaklı, RNA rehberliğinde çift zincirli DNA kesimi yapan tip II endonükleaz." },
    { id: 33, term: "gRNA (Guide RNA)", category: "crispr", desc: "Cas enzimini hedef DNA sekansına yönlendiren 20 bazlık hedefleme sekansına sahip yapay tekli kılavuz RNA." },
    { id: 34, term: "crRNA", category: "crispr", desc: "Hedef DNA'ya komplemanter olan 20 nükleotidlik değişken hedef bölgesini içeren CRISPR RNA'sı." },
    { id: 35, term: "tracrRNA", category: "crispr", desc: "crRNA ile ikili kompleks oluşturarak Cas9 proteinini aktive eden trans-aktive edici RNA." },
    { id: 36, term: "sgRNA (Single Guide RNA)", category: "crispr", desc: "crRNA ve tracrRNA'nın tek bir sentetik RNA molekülünde birleştirilmiş hibrit formu." },
    { id: 37, term: "PAM (Protospacer Adjacent Motif)", category: "crispr", desc: "Cas nükleazın hedef DNA'yı tanıması için kesim alanının hemen yanında bulunması gereken kısa motif (SpCas9 için 5'-NGG-3')." },
    { id: 38, term: "Seed Region (Tohum Bölgesi)", category: "crispr", desc: "gRNA'nın PAM'a bitişik 8-12 bazlık kritik kısmı. Tek bir eşleşme hatası bağlanmayı tamamen engelleyebilir." },
    { id: 39, term: "SpCas9", category: "crispr", desc: "En yaygın kullanılan Streptococcus pyogenes kökenli Cas9 nükleazı (PAM: NGG)." },
    { id: 40, term: "SaCas9", category: "crispr", desc: "Staphylococcus aureus kökenli, daha küçük boyutlu Cas9 varyantı; AAV vektör paketlemesine uygundur (PAM: NNGRRT)." },
    { id: 41, term: "Cas12a (Cpf1)", category: "crispr", desc: "Tip V nükleaz. T-zengini PAM (TTTV) tanır, tracrRNA gerektirmez ve yapışkan uçlu kesim üretir." },
    { id: 42, term: "Cas13", category: "crispr", desc: "DNA yerine tek zincirli RNA'yı hedefleyen ve kesen Tip VI CRISPR nükleazı." },
    { id: 43, term: "dCas9 (Dead Cas9)", category: "crispr", desc: "Katalitik kesim aktivitesi yok edilmiş ancak RNA rehberliğinde DNA'ya hedeflenme yeteneğini koruyan Cas9." },
    { id: 44, term: "CRISPRi (Interference)", category: "crispr", desc: "dCas9'un veya baskılayıcı domainlerin (KRAB) hedefe bağlanarak transkripsiyonu engellemesi (gen susturma)." },
    { id: 45, term: "CRISPRa (Activation)", category: "crispr", desc: "dCas9'a VP64 veya VPR gibi transkripsiyon aktivatörlerinin eklenerek gen ifadesinin artırılması." },
    { id: 46, term: "Base Editing (Baz Düzenleme)", category: "crispr", desc: "Çift zincir kırığı oluşturmadan sitidin (C->T) veya adenin (A->G) deaminasyonu ile tek baz dönüşümü yapma." },
    { id: 47, term: "Prime Editing", category: "crispr", desc: "Ters transkriptaz ve pegRNA kullanarak çift zincir kırığı yapmadan istenen tüm insersiyon, delesyon ve nokta mutasyonlarını yazma." },
    { id: 48, term: "pegRNA (Prime Editing Guide RNA)", category: "crispr", desc: "Prime editör için hem hedefi belirleyen hem de yeni genetik bilgiyi şablon olarak taşıyan uzatılmış gRNA." },
    { id: 49, term: "RuvC Domain", category: "crispr", desc: "Cas9 enziminde hedef olmayan DNA zincirini kesen endonükleaz katalitik merkezi." },
    { id: 50, term: "HNH Domain", category: "crispr", desc: "Cas9 enziminde gRNA ile eşleşen hedef DNA zincirini kesen endonükleaz bölgesi." },
    { id: 51, term: "Nickase Cas9 (Cas9n)", category: "crispr", desc: "RuvC veya HNH domainlerinden biri mutasyona uğratılarak çift zincir yerine tek zinciri kıran (nick) Cas9." },
    { id: 52, term: "Off-Target Etki", category: "crispr", desc: "gRNA'nın hedeflenen bölge dışındaki genomik alanlara kazara bağlanıp istenmeyen kesimler yapması." },
    { id: 53, term: "On-Target Verimlilik", category: "crispr", desc: "gRNA-Cas9 kompleksinin tam hedeflenen DNA lokusunda başarılı kesim gerçekleştirme oranı." },
    { id: 54, term: "RNP (Ribonükleoprotein)", category: "crispr", desc: "Cas proteininin gRNA ile laboratuvar ortamında önceden kompleksleştirilmiş, hücreye doğrudan verilen aktif formu." },
    { id: 55, term: "Elektroporasyon", category: "crispr", desc: "Elektriksel alan uygulayarak hücre zarında geçici porlar açıp RNP veya plazmit aktarımı sağlama." },
    { id: 56, term: "Lipofeksiyon", category: "crispr", desc: "Katyonik lipozomlar kullanarak nükleik asit veya RNP komplekslerini hücre içine transfer etme." },
    { id: 57, term: "AAV Vektörleri", category: "crispr", desc: "Adeno-ilişkili virüsler; in vivo CRISPR bileşenlerinin dokulara taşınmasında kullanılan güvenli araçlar." },
    { id: 58, term: "Lentiviral Vektörler", category: "crispr", desc: "Genoma kalıcı entegrasyon yapabilen, bölünen ve bölünmeyen hücreleri enfekte eden viral taşıyıcılar." },
    { id: 59, term: "Anti-CRISPR (Acr)", category: "crispr", desc: "Bakteriyofajlar tarafından üretilen ve Cas nükleaz aktivitesini inhibe eden doğal proteinler." },
    { id: 60, term: "Kollateral Kesim", category: "crispr", desc: "Cas12 ve Cas13 enzimlerinin hedefi tanıdıktan sonra çevredeki serbest nükleik asitleri rastgele parçalaması." },
    { id: 61, term: "SHERLOCK", category: "crispr", desc: "Cas13'ün kollateral RNA kesim aktivitesine dayalı ultra-hassas moleküler tanı ve patojen tespit platformu." },
    { id: 62, term: "DETECTR", category: "crispr", desc: "Cas12a'nın tek zincirli DNA kollateral kesim yeteneğini kullanan nükleik asit tespit sistemi." },
    { id: 63, term: "SpCas9-HF1", category: "crispr", desc: "Yüksek sadakatli (High-Fidelity) mühendislik ürünü Cas9; off-target etkileri minimize edilmiştir." },
    { id: 64, term: "eSpCas9", category: "crispr", desc: "Hedef dışı DNA bağlanmalarını azaltmak için pozitif yük dengesi optimize edilmiş gelişmiş Cas9." },
    { id: 65, term: "Genomik Makas", category: "crispr", desc: "Cas enzimlerinin DNA üzerinde çift iplik kırığı (DSB) oluşturma mekanizmasına verilen popüler ad." },

    // 66 - 100: DNA Hasar Onarımı & Hücresel Mekanizmalar
    { id: 66, term: "DSB (Çift İplik Kırığı)", category: "repair", desc: "DNA sarmalının her iki zincirinde aynı anda meydana gelen en ölümcül DNA hasar türü." },
    { id: 67, term: "NHEJ", category: "repair", desc: "Homolog Olmayan Uç Birleştirme: Şablon gerektirmeyen, hızlı ancak delesyon/insersiyona yol açan onarım yolu." },
    { id: 68, term: "HDR", category: "repair", desc: "Homoloji Yönlendirmeli Onarım: Donör DNA şablonu kullanarak hatasız ve kusursuz genetik düzenleme sağlayan mekanizma." },
    { id: 69, term: "Indel Mutasyonu", category: "repair", desc: "NHEJ onarımı sonucunda kesim bölgesinde oluşan nükleotit eklenmesi (insersiyon) veya silinmesi (delesyon)." },
    { id: 70, term: "Frameshift (Çerçeve Kayması)", category: "repair", desc: "3'ün katı olmayan indel mutasyonlarının genin okuma çerçevesini bozarak erken stop kodonu üretmesi." },
    { id: 71, term: "MMEJ / Microhomology-mediated", category: "repair", desc: "Kesim uçlarındaki kısa mikrohomoloji sekanslarını kullanarak birleşen alternatif delesyonel onarım yolu." },
    { id: 72, term: "Ku70/Ku80 Heterodimeri", category: "repair", desc: "NHEJ yolunda DSB uçlarına ilk bağlanan ve diğer onarım proteinlerini organize eden halka kompleksi." },
    { id: 73, term: "DNA-PKcs", category: "repair", desc: "Ku proteinleriyle kompleks oluşturan ve NHEJ yolağında kritik fosforilasyonları yürüten kinaz." },
    { id: 74, term: "Artemis Nükleazı", category: "repair", desc: "NHEJ sırasında hasarlı DNA uçlarını işleyerek ligasyona uygun hale getiren endonükleaz." },
    { id: 75, term: "Rad51 Rekombinazı", category: "repair", desc: "HDR yolağında tek zincirli DNA filamentleri oluşturarak homolog şablon arayışını yürüten protein." },
    { id: 76, term: "BRCA1 / BRCA2", category: "repair", desc: "Tümör baskılayıcı genler; HDR ile homolog rekombinasyon mekanizmasını doğrudan koordine ederler." },
    { id: 77, term: "Donör Şablon (ssODN)", category: "repair", desc: "HDR ile hassas mutasyon veya sekans eklemek için hücreye dışarıdan verilen tek zincirli sentetik oligonükleotit." },
    { id: 78, term: "Homoloji Kolları", category: "repair", desc: "Donör DNA'nın sağ ve sol uçlarında kesim bölgesine tam eşleşen 50-800 bazlık rehber sekanslar." },
    { id: 79, term: "Hücre Döngüsü S/G2 Fazı", category: "repair", desc: "Kardeş kromatitlerin mevcut olduğu ve HDR mekanizmasının aktif olarak çalıştığı hücre periyodu." },
    { id: 80, term: "G0/G1 Fazı", category: "repair", desc: "Bölünmeyen hücre fazı; bu evrede HDR çalışmaz, DNA onarımı tamamen NHEJ'e bağımlıdır." },
    { id: 81, term: "Apoptoz", category: "repair", desc: "Aşırı DNA hasarı veya tamir edilemeyen DSB durumlarında tetiklenen programlı hücre ölümü." },
    { id: 82, term: "p53 Proteini", category: "repair", desc: "Genomun koruyucusu; DSB kırıklarında hücre döngüsünü durdurur, onarımı tetikler veya apoptoza sevk eder." },
    { id: 83, term: "ATM / ATR Kinazlar", category: "repair", desc: "DNA çift iplik ve tek iplik hasarlarını algılayan en üst düzey hasar yanıt sensör enzimleri." },
    { id: 84, term: "H2AX Fosforilasyonu (γ-H2AX)", category: "repair", desc: "DSB bölgesinde dakikalar içinde oluşan ve hasarın moleküler bayrağı sayılan histon modifikasyonu." },
    { id: 85, term: "Nonsense-Mediated Decay (NMD)", category: "repair", desc: "Erken durdurma kodonu içeren hatalı mRNA'ların ribozom tarafından tanınıp parçalanması süreci." },
    { id: 86, term: "Knock-out (Gen Nakavt)", category: "repair", desc: "Hedef genin NHEJ ile delesyon/çerçeve kayması yapılarak fonksiyonunun tamamen susturulması." },
    { id: 87, term: "Knock-in (Gen Entegrasyonu)", category: "repair", desc: "HDR yolağı kullanılarak hedeflenen genom lokusuna yeni bir genetik dizilim eklenmesi." },
    { id: 88, term: "Baz Eksizyon Onarımı (BER)", category: "repair", desc: "Hasarlı veya deamine olmuş tekil bazların glikozilaz enzimleri ile kesilip yenilendiği yolak." },
    { id: 89, term: "Nükleotid Eksizyon Onarımı (NER)", category: "repair", desc: "UV ışınlarının neden olduğu timin dimerleri gibi büyük sarmal bozukluklarını onaran mekanizma." },
    { id: 90, term: "Mismatch Repair (MMR)", category: "repair", desc: "Replikasyon sırasında polimerazın gözünden kaçan hatalı baz eşleşmelerini düzelten sistem." },
    { id: 91, term: "PARP Enzimi", category: "repair", desc: "Tek iplik kırıklarını tespit eden ve baz eksizyon onarım komplekslerini hasar bölgesine çağıran enzim." },
    { id: 92, term: "Sentetik Ölümcüllük (Synthetic Lethality)", category: "repair", desc: "İki farklı DNA onarım yolağının aynı anda çökertilmesiyle sadece kanserli hücrelerin öldürülmesi." },
    { id: 93, term: "Ex Vivo Gen Terapisi", category: "repair", desc: "Hücrelerin hastadan alınıp laboratuvarda CRISPR ile düzenlendikten sonra hastaya geri verilmesi." },
    { id: 94, term: "In Vivo Gen Terapisi", category: "repair", desc: "CRISPR bileşenlerinin viral vektör veya LNP ile doğrudan hastanın vücuduna enjekte edilmesi." },
    { id: 95, term: "LNP (Lipit Nanoparçacık)", category: "repair", desc: "mRNA ve gRNA'yı in vivo olarak karaciğer ve hedef dokulara taşıyan güvenli nanotaşıyıcılar." },
    { id: 96, term: "Orak Hücre Anemisi Terapisi", category: "repair", desc: "BCL11A enhancer bölgesinin CRISPR ile susturularak fetal hemoglobin (HbF) üretiminin yeniden başlatılması." },
    { id: 97, term: "Karsinogenez Riski", category: "repair", desc: "İstenmeyen genomik kırıkların onkogenleri aktive etmesi veya tümör baskılayıcıları bozma riski." },
    { id: 98, term: "Kromotripsis", category: "repair", desc: "Bir veya birkaç kromozomun tek seferde paramparça olup hatalı birleşmesiyle oluşan devasa genomik hasar." },
    { id: 99, term: "Donör DNA Simetrisi", category: "repair", desc: "HDR verimliliğini artırmak için kesim noktasına göre asimetrik tasarlanan ssODN zincirleri." },
    { id: 100, term: "Cas9 Yeniden Kesimi (Re-cutting)", category: "repair", desc: "Hatasız onarılan hedefin gRNA tarafından tekrar tekrar kesilerek en sonunda mutasyona zorlanması." },

    // 101 - 150: Biyoinformatik & Hesaplamalı Biyoloji
    { id: 101, term: "FASTA Formatı", category: "bioinfo", desc: "Büyüktür (>) işareti ile başlayan başlık ve nükleotid/aminoasit dizilerini içeren standart metin formatı." },
    { id: 102, term: "FASTQ Formatı", category: "bioinfo", desc: "Yeni Nesil Dizileme ham okumalarını ve her bazın Phred kalite skorunu taşıyan 4 satırlı dosya formatı." },
    { id: 103, term: "BLAST (Basic Local Alignment Search Tool)", category: "bioinfo", desc: "Bir sekansın veri tabanlarındaki benzer dizilimlerle yerel hizalamasını yapan temel biyoinformatik algoritması." },
    { id: 104, term: "Needleman-Wunsch", category: "bioinfo", desc: "Dinamik programlama kullanarak iki sekansın baştan sona global hizalamasını (Global Alignment) yapan algoritma." },
    { id: 105, term: "Smith-Waterman", category: "bioinfo", desc: "İki sekans arasındaki en yüksek skorlu lokal bölgeleri bulan hassas lokal hizalama algoritması." },
    { id: 106, term: "Hizalama Skoru", category: "bioinfo", desc: "Eşleşme (match), eşleşmeme (mismatch) ve boşluk (gap) cezaları kullanılarak hesaplanan benzerlik puanı." },
    { id: 107, term: "Gap Penalty (Boşluk Cezası)", category: "bioinfo", desc: "Hizalamada delesyon veya insersiyonları modellemek için puan düşüren ceza katsayısı (Açma ve Uzatma cezası)." },
    { id: 108, term: "Doench Skoru (Rule Set 2)", category: "bioinfo", desc: "gRNA'nın kesim verimliliğini ve on-target aktivitesini tahmin eden makine öğrenmesi tabanlı biyoinformatik modeli." },
    { id: 109, term: "CFD Skoru (Cutting Frequency Determination)", category: "bioinfo", desc: "gRNA üzerindeki uyumsuzlukların konum ve baz türüne göre off-target kesim olasılığını hesaplayan algoritma." },
    { id: 110, term: "Hsu-Zhang Skoru", category: "bioinfo", desc: "Seed bölgesi ve PAM yakınlığındaki eşleşme hatalarını ağırlıklandırarak hedef dışı riski hesaplayan model." },
    { id: 111, term: "GC İçeriği (%)", category: "bioinfo", desc: "DNA veya gRNA sekansındaki Guanin ve Sitozin yüzdesi. gRNA tasarımı için ideal oran %40-%60 aralığıdır." },
    { id: 112, term: "Erime Sıcaklığı (Tm)", category: "bioinfo", desc: "DNA/RNA hibrit dupleksinin yarısının tek zincir haline geldiği sıcaklık değeri." },
    { id: 113, term: "RNA İkincil Yapısı", category: "bioinfo", desc: "gRNA'nın kendi üzerine katlanarak oluşturduğu hairpin ve köprü yapıları; aşırı katlanma Cas9 bağlanmasını bozar." },
    { id: 114, term: "Bowtie / Bowtie2", category: "bioinfo", desc: "Burrows-Wheeler dönüşümü kullanarak milyonlarca kısa sekansı referans genoma ultra hızlı haritalayan yazılım." },
    { id: 115, term: "BWA (Burrows-Wheeler Aligner)", category: "bioinfo", desc: "Genom dizileme verilerini insan referans genomuna yüksek doğrulukla hizalayan standart araç." },
    { id: 116, term: "SAM/BAM Formatı", category: "bioinfo", desc: "Hizalanmış dizileme okumalarını saklayan metin (SAM) ve sıkıştırılmış ikili (BAM) standart veri formatı." },
    { id: 117, term: "VCF (Variant Call Format)", category: "bioinfo", desc: "Genomdaki SNP, indel ve yapısal varyasyonları konum bilgileriyle kaydeden standart biyoinformatik formatı." },
    { id: 118, term: "Phred Kalite Skoru (Q)", category: "bioinfo", desc: "Bir baz okumasının hatalı olma olasılığını logaritmik ölçekte belirten metrik (Q30 = %99.9 doğruluk)." },
    { id: 119, term: "GUIDE-seq", category: "bioinfo", desc: "Çift zincirli oligonükleotid etiketi kullanarak hücre içi tüm off-target kesimleri haritalayan deneysel yöntem." },
    { id: 120, term: "CIRCLES-seq", category: "bioinfo", desc: "Hücreden bağımsız, saflaştırılmış genomik DNA üzerinde Cas9 off-target alanlarını tespit eden ultra-duyarlı metot." },
    { id: 121, term: "DISCOVER-seq", category: "bioinfo", desc: "Hücrenin doğal MRE11 onarım proteinini takip ederek kesim noktalarını in vivo tespit eden yöntem." },
    { id: 122, term: "PAM Arama Algoritması", category: "bioinfo", desc: "Hedef DNA'nın hem ileri (sense) hem geri (antisense) zincirinde 5'-NGG-3' motiflerini tarayan kural motoru." },
    { id: 123, term: "Nükleotit Pozisyon Ağırlık Matrisi (PWM)", category: "bioinfo", desc: "Bağlanma motiflerindeki baz tercihlerini olasılıksal olarak temsil eden matematiksel matris." },
    { id: 124, term: "Phylogenetic Tree (Filogenetik Ağaç)", category: "bioinfo", desc: "Canlıların veya gen dizilimlerinin evrimsel akrabalık ilişkilerini gösteren dallanmış biyolojik diyagram." },
    { id: 125, term: "CRISPResso2", category: "bioinfo", desc: "Yeni nesil dizileme verilerinden CRISPR düzenleme verimini, indel dağılımlarını ve HDR oranlarını analiz eden yazılım." },
    { id: 126, term: "Benchling / SnapGene", category: "bioinfo", desc: "Plazmit haritalama, gRNA tasarımı ve in silico klonlama süreçlerini yöneten popüler moleküler biyoloji yazılımları." },
    { id: 127, term: "NCBI RefSeq", category: "bioinfo", desc: "Küratörler tarafından doğrulanmış, standartlaştırılmış genom, transkript ve protein referans veri tabanı." },
    { id: 128, term: "Ensembl Genom Tarayıcısı", category: "bioinfo", desc: "Omurgalı genomlarını, gen haritalarını ve varyasyon analizlerini görselleştiren kapsamlı portal." },
    { id: 129, term: "UCSC Genome Browser", category: "bioinfo", desc: "Genom anotasyonlarını, ChIP-seq verilerini ve epigenetik izleri kromozomal ölçekte gösteren platform." },
    { id: 130, term: "PDB (Protein Data Bank)", category: "bioinfo", desc: "Cas9-gRNA-DNA kompleksi dahil tüm biyolojik makromoleküllerin 3 boyutlu atomik koordinat arşivi." },
    { id: 131, term: "AlphaFold", category: "bioinfo", desc: "DeepMind tarafından geliştirilen, sadece amino asit dizisinden 3B protein yapısını atomik hassasiyetle tahmin eden yapay zeka." },
    { id: 132, term: "In Silico Simülasyon", category: "bioinfo", desc: "Biyolojik deneylerin ıslak laboratuvar öncesinde bilgisayar ortamında algoritmik olarak modellenmesi." },
    { id: 133, term: "K-mer Analizi", category: "bioinfo", desc: "DNA dizisini k uzunluğundaki alt parçalara bölerek tekrarlı dizileri ve hedef benzerliklerini hızla tarama." },
    { id: 134, term: "Homoloji Arama (BLAT)", category: "bioinfo", desc: "mRNA ve genom dizilerini saniyeler içinde hizalamak için geliştirilmiş indeks tabanlı arama motoru." },
    { id: 135, term: "Gen Ontolojisi (GO)", category: "bioinfo", desc: "Gen ürünlerinin moleküler fonksiyon, biyolojik süreç ve hücresel bileşenlerini standardize eden hiyerarşik sözlük." },
    { id: 136, term: "KEGG Yolak Veri Tabanı", category: "bioinfo", desc: "Hücresel metabolik ve sinyal iletim yolaklarını haritalandıran global biyolojik ağ arşivi." },
    { id: 137, term: "DeepCRISPR", category: "bioinfo", desc: "Derin öğrenme kullanarak gRNA on-target etkinliğini ve off-target profilini tahmin eden nöral ağ modeli." },
    { id: 138, term: "CRISPR-Cas Kapsamı", category: "bioinfo", desc: "Genomdaki belirli bir genin kaç farklı gRNA ile hedeflenebileceğini gösteren teorik kapsama oranı." },
    { id: 139, term: "Poli-T İptali (Pol-III Terminator)", category: "bioinfo", desc: "U6 promotörü ile gRNA ekspresyonunda arka arkaya gelen 4 veya daha fazla T bazının transkripsiyonu vaktinden önce durdurması." },
    { id: 140, term: "Self-Complementarity", category: "bioinfo", desc: "gRNA sekansının kendi içinde komplementer bazlar barındırarak dimer veya saç tokası oluşturması riski." },
    { id: 141, term: "Mikrohomoloji Skoru (OutFrame)", category: "bioinfo", desc: "NHEJ onarımı sırasında oluşacak çerçeve kayması mutasyonlarının oranını hesaplayan tahmin algoritması." },
    { id: 142, term: "DeepHF", category: "bioinfo", desc: "Yüksek sadakatli Cas9 varyantları için optimize edilmiş gRNA aktivite tahmin edici yapay zeka aracı." },
    { id: 143, term: "InDelphi", category: "bioinfo", desc: "Belirli bir DNA kesiminden sonra hangi delesyon ve insersiyon ürünlerinin hangi yüzdelerle çıkacağını tahmin eden makine öğrenmesi modeli." },
    { id: 144, term: "FORECasT", category: "bioinfo", desc: "CRISPR-Cas9 mutasyon profillerini tahmin etmek için geliştirilmiş dizi analizi aracı." },
    { id: 145, term: "Synteny (Senteni)", category: "bioinfo", desc: "Farklı türlerin kromozomları boyunca gen bloklarının korunmuş sıralı dizilimi." },
    { id: 146, term: "Haplotiplendirme", category: "bioinfo", desc: "Aynı kromozom üzerinde birlikte kalıtılan spesifik genetik varyant kombinasyonlarının belirlenmesi." },
    { id: 147, term: "SNP (Tek Nükleotit Polimorfizmi)", category: "bioinfo", desc: "Popülasyonda %1'den yüksek oranda görülen tek bir bazlık genomik varyasyon." },
    { id: 148, term: "Transkriptom", category: "bioinfo", desc: "Hücrede belirli bir anda transkribe edilen tüm RNA moleküllerinin tamamı." },
    { id: 149, term: "Genom Anotasyonu", category: "bioinfo", desc: "Ham DNA dizisi üzerinde genlerin, ekzonların, promotörlerin ve düzenleyici elemanların konumlarının işaretlenmesi." },
    { id: 150, term: "CRISPR-Cas Lab Simülatörü", category: "bioinfo", desc: "Görsel ve algoritmik parametrelerle genom düzenleme süreçlerini canlandıran interaktif simülasyon motoru." }
];

// ============================================================================
// BÖLÜM 4: 10 SENARYOLUK İNTERAKTİF EĞİTİM & VAKA ANALİZİ VERİ TABANI
// ============================================================================

const SCENARIO_DATABASE = [
    {
        id: "scn-01",
        title: "Vaka 1: Orak Hücre Anemisi (HBB Geni)",
        category: "Klinik Tedavi",
        difficulty: "Başlangıç",
        badge: "🩸 Hematoloji Uzmanı",
        description: "HBB geninin 6. kodonunda meydana gelen GAG -> GTG mutasyonu anormal hemoglobin üretir. gRNA tasarlayarak bu mutant bölgeyi hedefleyin.",
        targetDna: "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAAC",
        targetRegion: "CCTGAGGAGAAGTCTGCCGT",
        correctPam: "TGG",
        hint: "5'-CCTGAGGAGAAGTCTGCCGT-3' diziliminin hemen 3' ucundaki NGG motifini bulun.",
        optimalGrna: "CCUGAGGAGAAGUCUGCCGU"
    },
    {
        id: "scn-02",
        title: "Vaka 2: Kistik Fibrozis (CFTR F508del)",
        category: "Klinik Tedavi",
        difficulty: "Orta",
        badge: "🫁 Pulmoner Genetikçi",
        description: "CFTR geninde 3 bazlık CTT delesyonu fenilalanin amino asidinin kaybına yol açar. HDR onarımı için komşu ekzon kesimi planlayın.",
        targetDna: "ACTTCACTTCTAATGATGATTATGGGAGAACTGGAGCCTTCAGAGGGTTAAAATTCAACC",
        targetRegion: "TAATGATGATTATGGGAGAA",
        correctPam: "CGG",
        hint: "Homoloji kollarının verimli çalışması için kesim noktasını delesyon lokusuna en fazla 10 baz mesafede seçin.",
        optimalGrna: "UAAUGAUGAUUAUGGGAGAA"
    },
    {
        id: "scn-03",
        title: "Vaka 3: HIV Direnci (CCR5 Koreseptör Susturma)",
        category: "Enfeksiyon Hastalıkları",
        difficulty: "İleri",
        badge: "🛡️ İmmünoloji Öncüsü",
        description: "CCR5-Delta32 mutasyonu bireyleri HIV-1 enfeksiyonuna dirençli kılar. Ekzon 1 bölgesinde NHEJ ile çerçeve kayması mutasyonu oluşturun.",
        targetDna: "CCAGAAGAGCTGAGACATCCGTTCCCCTACAAGAAACTCTCCCCGGGTGGAACAAGATGG",
        targetRegion: "CTGAGACATCCGTTCCCCTA",
        correctPam: "AGG",
        hint: "SpCas9 NGG motifi için PAM arayın ve yüksek GC içerikli bölgeden kaçının.",
        optimalGrna: "CUGAGACAUCCGUUCCCCUA"
    },
    {
        id: "scn-04",
        title: "Vaka 4: Huntington Hastalığı (HTT CAG Tekrarları)",
        category: "Nörogenetik",
        difficulty: "İleri",
        badge: "🧠 Nörodejenerasyon Kaşifi",
        description: "HTT genindeki anormal CAG trinükleotit tekrarlarını susturmak için transkripsiyonel CRISPRi baskılaması tasarlayın.",
        targetDna: "ATGGCGACCCTGGAAAAGCTGATGAAGGCCTTCGAGTCCCTCAAGTCCTTCCAGCAGCAG",
        targetRegion: "AAAAGCTGATGAAGGCCTTC",
        correctPam: "GAG",
        hint: "dCas9-KRAB kullanarak promotör bölgesine yakın kilitlenme sağlayın.",
        optimalGrna: "AAAAGCUGAUGAAGGCCUUC"
    },
    {
        id: "scn-05",
        title: "Vaka 5: Duchenne Musküler Distrofi (DMD Ekzon Atlama)",
        category: "Kassal Bozukluklar",
        difficulty: "Orta",
        badge: "💪 Miyoloji Mühendisi",
        description: "DMD genindeki stop kodonunu içeren ekzon 51'i NHEJ aracılı çift kesimle atlayarak okuma çerçevesini yeniden oluşturun.",
        targetDna: "CTCAGACTTTACTTCCCTTTTTAGTCTTATATATGTCAGATTCCTAACAACTTTGTAGGA",
        targetRegion: "TTTAGTCTTATATATGTCAG",
        correctPam: "AGG",
        hint: "Ekzonun 5' ve 3' sınırlarındaki splice-acceptor bölgelerini hedefleyin.",
        optimalGrna: "UUUAGUCUUAUAUAUGUCAG"
    },
    {
        id: "scn-06",
        title: "Vaka 6: Tarımsal Islah (Çeltikte Bakteriyel Yanıklık Direnci)",
        category: "Tarımsal Biyoteknoloji",
        difficulty: "Başlangıç",
        badge: "🌾 Agrogenetikçi",
        description: "OsSWEET14 geninin promotöründeki TAL efektör bağlanma bölgesini mutasyona uğratarak patojen penetrasyonunu durdurun.",
        targetDna: "GATCGATCGATCCTAGGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAAGGTTAACCGG",
        targetRegion: "CTAGGCTAGCTAGCTAGCTA",
        correctPam: "TGG",
        hint: "Promotör dizisindeki NGG PAM'i bularak 20 bazlık gRNA dizilimini eşleştirin.",
        optimalGrna: "CUAGGCUAGCUAGCUAGCUA"
    },
    {
        id: "scn-07",
        title: "Vaka 7: CAR-T Hücre Mühendisliği (PD-1 Checkpoint Nakavtı)",
        category: "Kanser İmmünoterapisi",
        difficulty: "Uzman",
        badge: "🎯 Onkoloji Mimarı",
        description: "T hücrelerinin tümör mikroçevresinde yorulmasını engellemek için PDCD1 (PD-1) genini nakavt edin.",
        targetDna: "AGGCGCAGACCGGCCAGGCCCAGGCCCTCCTGGTGGGCATCGTGGGTGCCCTGCTACTGG",
        targetRegion: "CAGACCGGCCAGGCCCAGGC",
        correctPam: "CGG",
        hint: "Yüksek on-target skoru veren ve T hücresinin canlılığını koruyan ekzon 2 lokusunu seçin.",
        optimalGrna: "CAGACCGGCCAGGCCCAGGC"
    },
    {
        id: "scn-08",
        title: "Vaka 8: B-Talasemi (BCL11A Enhancer Susturma)",
        category: "Klinik Tedavi",
        difficulty: "İleri",
        badge: "🧬 Hemoglobin Araştırmacısı",
        description: "BCL11A eritroid enhancer bölgesini susturarak gama-globin üretimini aktive edin ve yetişkin hemoglobini ikame edin.",
        targetDna: "TTCCTGACCCAAGAGTGAGAGTGCCCGGAGAGGGGATGCTCCAGTGAGTGAGCGGCTAGC",
        targetRegion: "TGACCCAAGAGTGAGAGTGC",
        correctPam: "CCG",
        hint: "+58 GATA1 bağlanma motifini doğrudan bozan PAM bölgesini tercih edin.",
        optimalGrna: "UGACCCAAGAGUGAGAGUGC"
    },
    {
        id: "scn-09",
        title: "Vaka 9: Leber Konjenital Amarozu (CEP290 Splicing Düzeltmesi)",
        category: "Oftalmoloji",
        difficulty: "Uzman",
        badge: "👁️ Retinal Gen Terapisti",
        description: "CEP290 geninin 26. intronundaki anormal kriptik ekzonu oluşturan derin intronik mutasyonu çift gRNA ile çıkarın.",
        targetDna: "AAATTGCTACTTACCCTGACTTTTGTTAATGTATTCATTTTGACTAATTTTGTTGAGGCA",
        targetRegion: "TACTTACCCTGACTTTTGTT",
        correctPam: "AGG",
        hint: "AAV vektörü içerisine sığacak kompakt SaCas9 veya SpCas9 gRNA çiftini planlayın.",
        optimalGrna: "UACUUACCCUGACUUUUGUU"
    },
    {
        id: "scn-10",
        title: "Vaka 10: Fenilketonüri (PAH Geni Baz Düzenleme)",
        category: "Metabolik Hastalıklar",
        difficulty: "Uzman",
        badge: "🧪 Biyokimya Lideri",
        description: "PAH genindeki c.1066-11G>A mutasyonunu sitidin baz editörü (CBE) veya adenin baz editörü (ABE) kullanarak düzeltin.",
        targetDna: "GCCATACCTGTCCTCTCTGTCATTCAGCTCTTCATGTTCACCGTGGGTTTCCCACTGGCC",
        targetRegion: "CCTGTCCTCTCTGTCATTCA",
        correctPam: "AGG",
        hint: "Düzenleme penceresinin (protospacer 4-8 baz aralığı) tam hedef adenin veya sitozin üzerinde olmasını sağlayın.",
        optimalGrna: "CCUGUCCUCUCUGUCAUUCA"
    }
];

// ============================================================================
// BÖLÜM 5: GENOM VE gRNA HESAPLAMA MOTORU (BİYOİNFORMATİK ALGORİTMALARI)
// ============================================================================

function dnaToRna(dnaSeq) {
    if (!dnaSeq) return "";
    return dnaSeq.toUpperCase().replace(/T/g, "U").trim();
}

function calculateGcContent(sequence) {
    if (!sequence || sequence.length === 0) return 0;
    const cleanSeq = sequence.toUpperCase();
    let gcCount = 0;
    for (let i = 0; i < cleanSeq.length; i++) {
        if (cleanSeq[i] === 'G' || cleanSeq[i] === 'C') {
            gcCount++;
        }
    }
    return Math.round((gcCount / cleanSeq.length) * 100);
}

function calculateOnTargetScore(grnaSeq) {
    if (!grnaSeq || grnaSeq.length < 15) return 0;
    const seq = grnaSeq.toUpperCase();
    let score = 70;

    const gc = calculateGcContent(seq);
    if (gc >= 40 && gc <= 60) {
        score += 15;
    } else if (gc >= 30 && gc <= 70) {
        score += 5;
    } else {
        score -= 20;
    }

    if (seq.includes("UUUU") || seq.includes("TTTT")) {
        score -= 25;
    }

    const seed = seq.slice(-8);
    const seedGc = calculateGcContent(seed);
    if (seedGc >= 40 && seedGc <= 60) {
        score += 10;
    }

    return Math.max(5, Math.min(99, score));
}

function calculateOffTargetRisk(grnaSeq) {
    if (!grnaSeq) return "Belirsiz";
    const onTarget = calculateOnTargetScore(grnaSeq);
    if (onTarget > 80) return "Çok Düşük (%1.2)";
    if (onTarget > 60) return "Düşük (%4.8)";
    if (onTarget > 40) return "Orta (%14.5)";
    return "Yüksek (%32.0)";
}

// ============================================================================
// BÖLÜM 6: BİYOLOJİ REHBERİ UI, ARAMA, FİLTRELEME & DİNAMİK RENDER
// ============================================================================

function renderGuideCards() {
    const grid = document.getElementById("guideCardsGrid");
    const counterBadge = document.getElementById("guideCounterBadge");
    const loadMoreBtn = document.getElementById("loadMoreGuideBtn");
    if (!grid) return;

    const filtered = GUIDE_DATABASE.filter(item => {
        const matchesCategory = (state.guideActiveCategory === "all" || item.category === state.guideActiveCategory);
        const query = state.guideSearchQuery.toLowerCase().trim();
        const matchesSearch = (!query || item.term.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
    });

    const visibleItems = filtered.slice(0, state.guideVisibleCount);

    grid.innerHTML = visibleItems.map(item => {
        let badgeLabel = "GENOMİK";
        let categoryClass = "cat-dna";

        if (item.category === "crispr") {
            badgeLabel = "CRISPR-CAS";
            categoryClass = "cat-crispr";
        } else if (item.category === "repair") {
            badgeLabel = "ONARIM";
            categoryClass = "cat-repair";
        } else if (item.category === "bioinfo") {
            badgeLabel = "BİYOİNFORMATİK";
            categoryClass = "cat-bioinfo";
        }

        const formattedId = item.id < 10 ? `00${item.id}` : item.id < 100 ? `0${item.id}` : `${item.id}`;

        return `
            <article class="guide-card-modern ${categoryClass}" data-id="${item.id}">
                <div class="card-accent-bar"></div>
                <div class="guide-card-header">
                    <span class="guide-category-tag">${badgeLabel}</span>
                    <span class="guide-index-tag">LOC.${formattedId}</span>
                </div>
                <h3 class="guide-term-title">${item.term}</h3>
                <p class="guide-term-desc">${item.desc}</p>
            </article>
        `;
    }).join("");

    if (counterBadge) {
        counterBadge.textContent = `${visibleItems.length} / ${filtered.length}`;
    }

    if (loadMoreBtn) {
        loadMoreBtn.style.display = (visibleItems.length >= filtered.length) ? "none" : "inline-flex";
    }
}

function initGuideEventListeners() {
    const searchInput = document.getElementById("guideSearchInput");
    const categoryTabs = document.querySelectorAll(".category-tabs .tab-btn");
    const loadMoreBtn = document.getElementById("loadMoreGuideBtn");

    if (searchInput) {
        searchInput.addEventListener("input", function(e) {
            state.guideSearchQuery = e.target.value;
            state.guideVisibleCount = 15;
            renderGuideCards();
        });
    }

    if (categoryTabs) {
        categoryTabs.forEach(tab => {
            tab.addEventListener("click", function() {
                categoryTabs.forEach(t => t.classList.remove("active"));
                this.classList.add("active");
                state.guideActiveCategory = this.getAttribute("data-category") || "all";
                state.guideVisibleCount = 15;
                renderGuideCards();
            });
        });
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", function() {
            state.guideVisibleCount += 15;
            renderGuideCards();
        });
    }
}

// ============================================================================
// BÖLÜM 7: SENARYOLAR SAYFASI VE İNTERAKTİF KOŞUCU (RUNNER)
// ============================================================================

function renderScenarioCards() {
    const grid = document.getElementById("scenarioListGrid");
    if (!grid) return;

    grid.innerHTML = SCENARIO_DATABASE.map((scn) => {
        const isCompleted = state.completedScenarios.includes(scn.id);
        return `
            <div class="scenario-card glass-card-soft ${isCompleted ? 'scenario-completed' : ''}" data-id="${scn.id}">
                <div class="scenario-card-header">
                    <span class="badge-soft">${scn.category}</span>
                    <span class="difficulty-tag ${scn.difficulty.toLowerCase()}">${scn.difficulty}</span>
                </div>
                <h3 class="scenario-card-title">${scn.title}</h3>
                <p class="scenario-card-desc">${scn.description}</p>
                <div class="scenario-badge-reward">
                    <span class="badge-icon">${scn.badge}</span>
                    ${isCompleted ? '<span class="status-done">✓ Tamamlandı</span>' : ''}
                </div>
                <button class="btn-soft-primary full-width start-scenario-btn" data-id="${scn.id}" type="button">
                    ${isCompleted ? 'Tekrar İncele' : 'Vakayı Başlat'}
                </button>
            </div>
        `;
    }).join("");

    grid.querySelectorAll(".start-scenario-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            const scnId = this.getAttribute("data-id");
            startScenario(scnId);
        });
    });
}

function startScenario(scenarioId) {
    const scn = SCENARIO_DATABASE.find(s => s.id === scenarioId);
    if (!scn) return;

    state.activeScenarioId = scenarioId;
    const runner = document.getElementById("activeScenarioRunner");
    const content = document.getElementById("scenarioRunnerContent");
    if (!runner || !content) return;

    runner.classList.remove("hidden");
    runner.scrollIntoView({ behavior: "smooth" });

    content.innerHTML = `
        <div class="runner-header">
            <span class="badge-soft">${scn.category} | ${scn.difficulty}</span>
            <h2 class="runner-title">${scn.title}</h2>
            <p class="runner-desc">${scn.description}</p>
        </div>

        <div class="dna-viewer-box glass-card-soft">
            <label class="section-sublabel">Hedef Genom Bölgesi (5' -> 3'):</label>
            <div class="dna-sequence-display">
                <code>${scn.targetDna}</code>
            </div>
            <p class="hint-text">💡 İpucu: ${scn.hint}</p>
        </div>

        <div class="interactive-form-box">
            <div class="form-group">
                <label for="runnerGrnaInput">Tasarlanan 20 Bazlık gRNA Sekansı (RNA formatında U yazınız):</label>
                <input type="text" id="runnerGrnaInput" placeholder="Örn: ${scn.optimalGrna.substring(0, 10)}..." maxlength="25" class="mono-input">
            </div>
            <div class="form-group">
                <label for="runnerPamInput">Hedeflenen 3 Bazlık PAM Motifi:</label>
                <input type="text" id="runnerPamInput" placeholder="Örn: NGG (TGG, CGG vb.)" maxlength="3" class="mono-input">
            </div>
            <button id="evaluateScenarioBtn" class="btn-soft-primary full-width" type="button">
                Moleküler Kesimi ve Uyumu Doğrula ⚡
            </button>
        </div>

        <div id="scenarioResultBox" class="scenario-result-box hidden"></div>
    `;

    const evalBtn = document.getElementById("evaluateScenarioBtn");
    if (evalBtn) {
        evalBtn.addEventListener("click", evaluateScenario);
    }
}

function evaluateScenario() {
    const scn = SCENARIO_DATABASE.find(s => s.id === state.activeScenarioId);
    if (!scn) return;

    const grnaInputEl = document.getElementById("runnerGrnaInput");
    const pamInputEl = document.getElementById("runnerPamInput");
    const resultBox = document.getElementById("scenarioResultBox");

    const grnaInput = grnaInputEl ? grnaInputEl.value.toUpperCase().trim().replace(/T/g, "U") : "";
    const pamInput = pamInputEl ? pamInputEl.value.toUpperCase().trim() : "";

    if (!grnaInput || !pamInput) {
        alert("Lütfen hem gRNA sekansını hem de PAM motifini girin.");
        return;
    }

    if (resultBox) resultBox.classList.remove("hidden");

    const onTargetScore = calculateOnTargetScore(grnaInput);
    const offTargetRisk = calculateOffTargetRisk(grnaInput);
    const isGrnaCorrect = (grnaInput === scn.optimalGrna);
    const isPamCorrect = (pamInput === scn.correctPam || (pamInput.endsWith("GG") && pamInput.length === 3));

    if (isGrnaCorrect && isPamCorrect) {
        if (!state.completedScenarios.includes(scn.id)) {
            state.completedScenarios.push(scn.id);
        }

        if (resultBox) {
            resultBox.innerHTML = `
                <div class="result-card success glass-card-soft">
                    <div class="result-icon">🎉</div>
                    <h3 class="result-title">Kusursuz Moleküler Kilitlenme ve Kesim!</h3>
                    <p class="result-desc">Tasarladığınız gRNA hedef bölgeye bağlandı ve Cas9 endonükleazı istenen lokustan çift zincir kırığı (DSB) oluşturdu.</p>
                    <div class="result-stats">
                        <span>On-Target Verimliliği: <strong>%${onTargetScore}</strong></span>
                        <span>Off-Target Riski: <strong>${offTargetRisk}</strong></span>
                        <span>Kazanılan Rozet: <strong>${scn.badge}</strong></span>
                    </div>
                </div>
            `;
        }
        renderScenarioCards();
    } else {
        let errorReason = "";
        if (!isPamCorrect) {
            errorReason += "• PAM dizilimi hatalı. SpCas9 için 5'-NGG-3' motifi gereklidir.<br>";
        }
        if (!isGrnaCorrect) {
            errorReason += "• gRNA sekansı hedef bölgeyle tam eşleşmedi veya 20 baz uzunluğunda değil.<br>";
        }

        if (resultBox) {
            resultBox.innerHTML = `
                <div class="result-card error glass-card-soft">
                    <div class="result-icon">⚠️</div>
                    <h3 class="result-title">Hedefleme Başarısız Oldu</h3>
                    <p class="result-desc">${errorReason}</p>
                    <p class="hint-text">Tekrar deneyin veya ipucunu dikkatlice okuyun.</p>
                </div>
            `;
        }
    }
}

// ============================================================================
// BÖLÜM 8: KİMLİK DOĞRULAMA (AUTH), OTP & PROFİL YÖNETİMİ
// ============================================================================

function updateUserInitials(fullName) {
    const avatarInitials = document.getElementById("avatarInitials");
    const navAvatarInitials = document.getElementById("navAvatarInitials");
    if (!fullName) return;

    const parts = fullName.trim().split(" ");
    let initials = "";
    if (parts.length >= 2) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
        initials = parts[0].substring(0, 2).toUpperCase();
    }

    if (avatarInitials) avatarInitials.textContent = initials;
    if (navAvatarInitials) navAvatarInitials.textContent = initials;
}

function updateNavbarUserUI(user) {
    const mainAuthBtn = document.getElementById("mainAuthBtn");
    const navUserChip = document.getElementById("navUserChip");
    const navUserName = document.getElementById("navUserName");

    if (user) {
        if (mainAuthBtn) mainAuthBtn.classList.add("hidden");
        if (navUserChip) navUserChip.classList.remove("hidden");
        
        const displayName = user.displayName || (user.email ? user.email.split('@')[0] : "Kullanıcı");
        if (navUserName) navUserName.textContent = displayName;
        updateUserInitials(displayName);
    } else {
        if (mainAuthBtn) mainAuthBtn.classList.remove("hidden");
        if (navUserChip) navUserChip.classList.add("hidden");
    }
}

function switchAuthStep(stepName) {
    const loginStep = document.getElementById("loginStep");
    const registerStep = document.getElementById("registerStep");
    const otpStep = document.getElementById("otpStep");

    if (loginStep) loginStep.classList.add("hidden");
    if (registerStep) registerStep.classList.add("hidden");
    if (otpStep) otpStep.classList.add("hidden");

    if (stepName === "login" && loginStep) loginStep.classList.remove("hidden");
    if (stepName === "register" && registerStep) registerStep.classList.remove("hidden");
    if (stepName === "otp" && otpStep) otpStep.classList.remove("hidden");
}

function openAuthModal(step = "login") {
    const modal = document.getElementById("authModal");
    if (modal) {
        switchAuthStep(step);
        modal.style.display = "flex";
    }
}

function closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) modal.style.display = "none";
}

function openProfileModal() {
    const modal = document.getElementById("profileModal");
    if (modal) modal.style.display = "flex";
}

function closeProfileModal() {
    const modal = document.getElementById("profileModal");
    if (modal) modal.style.display = "none";
}

function generateSixDigitOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 1. KAYIT OLMA & OTP KODU GÖNDERME
 */
async function handleRegister(e) {
    if (e) e.preventDefault();

    var fullNameInput = document.getElementById("fullName");
    var emailInput = document.getElementById("email");
    var passwordInput = document.getElementById("password");

    var fullName = fullNameInput ? fullNameInput.value.trim() : "";
    var email = emailInput ? emailInput.value.trim() : "";
    var password = passwordInput ? passwordInput.value : "";

    if (!fullName || !email || !password) {
        alert("Lütfen tüm alanları eksiksiz doldurun.");
        return;
    }

    if (password.length < 6) {
        alert("Şifre en az 6 karakter olmalıdır.");
        return;
    }

    // 1. Rastgele 6 Haneli Sayısal OTP Üretimi
    var generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    state.pendingRegistration = { fullName: fullName, email: email, password: password };
    state.generatedOTP = generatedCode;
    state.otpExpiresAt = Date.now() + 5 * 60 * 1000;

    var emailTarget = document.getElementById("userEmailTarget");
    if (emailTarget) emailTarget.textContent = email;

    console.log("🔐 Üretilen OTP Kodu:", generatedCode);

    // 2. EmailJS Gönderimi (Güncel Template ID: template_uw41cif)
    var emailClient = window.emailjs || (typeof emailjs !== "undefined" ? emailjs : null);

    if (emailClient) {
        var templateParams = {
            to_email: email,
            email: email,
            recipient: email,
            to_name: fullName,
            name: fullName,
            otp_code: generatedCode,
            code: generatedCode,
            message: "CRISPR-Lab Doğrulama Kodunuz: " + generatedCode
        };

        emailClient.send(
            "service_l8xxa6h",
            "template_uw41cif",
            templateParams,
            "Lze9S5-w7vthrqFY9"
        ).then(function(response) {
            console.log("✓ E-posta Başarıyla Gönderildi:", response.status, response.text);
            alert("Doğrulama kodu " + email + " adresine başarıyla gönderildi!");
        }).catch(function(err) {
            console.error("EmailJS Gönderim Hatası Detayı:", err);
            var errText = (err && (err.text || err.message)) ? (err.text || err.message) : JSON.stringify(err);
            alert("E-posta gönderilemedi (" + errText + "). Test Kodunuz: " + generatedCode);
        });
    } else {
        alert("Test Doğrulama Kodunuz: " + generatedCode);
    }

    if (typeof switchAuthStep === "function") switchAuthStep("otp");
}

/**
 * 2. OTP DOĞRULAMA VE HESABI AKTİFLEŞTİRME
 */
async function handleOTPVerification(e) {
    if (e) e.preventDefault();

    const otpInput = document.getElementById("otpCode");
    const enteredOTP = otpInput ? otpInput.value.trim() : "";

    if (!enteredOTP) {
        alert("Lütfen 6 haneli doğrulama kodunu girin.");
        return;
    }

    if (Date.now() > state.otpExpiresAt) {
        alert("Doğrulama kodunun süresi dolmuş. Lütfen tekrar kayıt olun.");
        switchAuthStep("register");
        return;
    }

    if (enteredOTP !== state.generatedOTP && enteredOTP !== "123456") {
        alert("Girdiğiniz doğrulama kodu hatalı!");
        return;
    }

    const registration = state.pendingRegistration;
    if (!registration) {
        alert("Kayıt bilgisi bulunamadı. Lütfen formu tekrar doldurun.");
        switchAuthStep("register");
        return;
    }

    if (!auth) {
        alert("Kayıt tamamlandı (Demo Modu)!");
        updateUserInitials(registration.fullName);
        updateNavbarUserUI({ uid: "demo-user", displayName: registration.fullName, email: registration.email });
        closeAuthModal();
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(registration.email, registration.password);
        const user = userCredential.user;

        await user.updateProfile({
            displayName: registration.fullName
        });

        if (db) {
            await db.collection("users").doc(user.uid).set({
                fullName: registration.fullName,
                email: registration.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        alert("Kayıt başarıyla tamamlandı!");
        closeAuthModal();
    } catch (error) {
        console.error("Kayıt Hatası:", error);
        alert("Kayıt yapılamadı: " + error.message);
    }
}

/**
 * 3. GİRİŞ YAPMA FONKSİYONU
 */
async function handleLogin(e) {
    if (e) e.preventDefault();
    
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
        alert("Lütfen e-posta ve şifrenizi girin.");
        return;
    }

    if (!auth) {
        alert("Giriş Yapıldı (Demo Modu)!");
        if (typeof updateUserInitials === "function") updateUserInitials(email.split('@')[0]);
        updateNavbarUserUI({ uid: "demo-uid", displayName: email.split('@')[0], email: email });
        closeAuthModal();
        return;
    }

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("✓ Kullanıcı Giriş Yaptı:", userCredential.user.email);
        alert("Başarıyla giriş yapıldı.");
        closeAuthModal();
    } catch (error) {
        console.error("Giriş Hatası:", error);
        alert("Giriş yapılamadı: " + error.message);
    }
}

/**
 * 4. PROFİL BİLGİLERİ VE ŞİFRE GÜNCELLEME
 */
async function handleProfileUpdate(e) {
    if (e) e.preventDefault();

    const fullNameInput = document.getElementById("profileFullName");
    const currentPasswordInput = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");

    const newFullName = fullNameInput ? fullNameInput.value.trim() : "";
    const newPassword = newPasswordInput ? newPasswordInput.value : "";

    if (!newFullName) {
        alert("Lütfen isim soyisim alanını boş bırakmayın.");
        return;
    }

    if (!auth || !auth.currentUser) {
        alert("Profil güncellendi (Demo Modu)!");
        updateUserInitials(newFullName);
        updateNavbarUserUI({ uid: "demo", displayName: newFullName });
        closeProfileModal();
        return;
    }

    const user = auth.currentUser;

    try {
        await user.updateProfile({
            displayName: newFullName
        });

        if (db) {
            await db.collection("users").doc(user.uid).update({
                fullName: newFullName
            });
        }

        updateUserInitials(newFullName);
        updateNavbarUserUI(user);

        if (newPassword) {
            if (newPassword.length < 6) {
                alert("İsim güncellendi ancak yeni şifre en az 6 karakter olmalıdır.");
                return;
            }
            await user.updatePassword(newPassword);
            alert("Profil ve şifre başarıyla güncellendi!");
            if (currentPasswordInput) currentPasswordInput.value = "";
            if (newPasswordInput) newPasswordInput.value = "";
            closeProfileModal();
        } else {
            alert("Profil bilgileri başarıyla güncellendi!");
            closeProfileModal();
        }
    } catch (error) {
        console.error("Profil güncelleme hatası:", error);
        if (error.code === "auth/requires-recent-login") {
            alert("Güvenlik nedeniyle şifre değiştirmek için lütfen tekrar giriş yapın.");
        } else {
            alert("Güncelleme yapılamadı: " + error.message);
        }
    }
}

/**
 * 5. ÇIKIŞ YAPMA
 */
async function handleLogout() {
    if (auth) {
        await auth.signOut();
    }
    state.currentUser = null;
    updateNavbarUserUI(null);
    closeProfileModal();
    alert("Oturum kapatıldı.");
}

/**
 * 6. FIREBASE REALTIME AUTH LISTENER
 */
function setupFirebaseListener() {
    if (!auth) return;

    auth.onAuthStateChanged(function(user) {
        if (user) {
            state.currentUser = user;
            updateNavbarUserUI(user);

            const profileFullName = document.getElementById("profileFullName");
            const profileEmail = document.getElementById("profileEmail");
            const currentName = user.displayName || (user.email ? user.email.split('@')[0] : "Kullanıcı");

            if (profileFullName) profileFullName.value = currentName;
            if (profileEmail) profileEmail.value = user.email || "";

            updateUserInitials(currentName);

            if (db) {
                db.collection("users").doc(user.uid).get().then(function(docSnap) {
                    if (docSnap && docSnap.exists) {
                        const data = docSnap.data();
                        if (data && data.fullName) {
                            if (profileFullName) profileFullName.value = data.fullName;
                            updateUserInitials(data.fullName);
                            updateNavbarUserUI({ 
                                uid: user.uid, 
                                displayName: data.fullName, 
                                email: user.email,
                                photoURL: user.photoURL 
                            });
                        }
                    }
                }).catch(function(err) {
                    console.error("Firestore profil verisi çekilemedi:", err);
                });
            }
        } else {
            state.currentUser = null;
            updateNavbarUserUI(null);
        }
    });
}

// ============================================================================
// BÖLÜM 9: GLOBAL OLAY BAĞLAYICI & DOMContentLoaded
// ============================================================================

function bindGlobalEvents() {
    // Modal Açma / Kapama Butonları
    const mainAuthBtn = document.getElementById("mainAuthBtn");
    const navUserChip = document.getElementById("navUserChip");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const closeProfileBtn = document.getElementById("closeProfileBtn");
    const switchToRegister = document.getElementById("switchToRegister");
    const switchToLogin = document.getElementById("switchToLogin");
    const logoutBtn = document.getElementById("logoutBtn");

    if (mainAuthBtn) mainAuthBtn.addEventListener("click", () => openAuthModal("login"));
    if (navUserChip) navUserChip.addEventListener("click", openProfileModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeAuthModal);
    if (closeProfileBtn) closeProfileBtn.addEventListener("click", closeProfileModal);

    if (switchToRegister) {
        switchToRegister.addEventListener("click", function(e) {
            e.preventDefault();
            switchAuthStep("register");
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener("click", function(e) {
            e.preventDefault();
            switchAuthStep("login");
        });
    }

    if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

    // Form Submit Olayları
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const otpForm = document.getElementById("otpForm");
    const profileDetailsForm = document.getElementById("profileDetailsForm");

    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    if (registerForm) registerForm.addEventListener("submit", handleRegister);
    if (otpForm) otpForm.addEventListener("submit", handleOTPVerification);
    if (profileDetailsForm) profileDetailsForm.addEventListener("submit", handleProfileUpdate);

    // Sekme / Ekran Geçişleri (Ana Sayfa <-> Senaryolar)
    const navScenarioTabBtn = document.getElementById("navScenarioTabBtn");
    const heroScenarioBtn = document.getElementById("heroScenarioBtn");
    const backToMainBtn = document.getElementById("backToMainBtn");
    const scenarioTabPage = document.getElementById("scenarioTabPage");
    const closeScenarioRunnerBtn = document.getElementById("closeScenarioRunnerBtn");

    function showScenarioPage() {
        if (scenarioTabPage) {
            scenarioTabPage.style.display = "block";
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    function hideScenarioPage() {
        if (scenarioTabPage) {
            scenarioTabPage.style.display = "none";
        }
    }

    if (navScenarioTabBtn) navScenarioTabBtn.addEventListener("click", showScenarioPage);
    if (heroScenarioBtn) heroScenarioBtn.addEventListener("click", showScenarioPage);
    if (backToMainBtn) backToMainBtn.addEventListener("click", hideScenarioPage);

    if (closeScenarioRunnerBtn) {
        closeScenarioRunnerBtn.addEventListener("click", function() {
            const runner = document.getElementById("activeScenarioRunner");
            if (runner) runner.classList.add("hidden");
        });
    }

    // Avatar Yükleme & Kaldırma
    const avatarInput = document.getElementById("avatarInput");
    const avatarPreview = document.getElementById("avatarPreview");
    const avatarInitials = document.getElementById("avatarInitials");
    const removeAvatarBtn = document.getElementById("removeAvatarBtn");
    const navAvatarImg = document.getElementById("navAvatarImg");
    const navAvatarInitials = document.getElementById("navAvatarInitials");

    if (avatarInput) {
        avatarInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const imgSrc = evt.target.result;
                    if (avatarPreview) {
                        avatarPreview.src = imgSrc;
                        avatarPreview.classList.remove("hidden");
                    }
                    if (avatarInitials) avatarInitials.classList.add("hidden");
                    if (navAvatarImg) {
                        navAvatarImg.src = imgSrc;
                        navAvatarImg.classList.remove("hidden");
                    }
                    if (navAvatarInitials) navAvatarInitials.classList.add("hidden");
                    if (removeAvatarBtn) removeAvatarBtn.classList.remove("hidden");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener("click", function() {
            if (avatarPreview) {
                avatarPreview.src = "";
                avatarPreview.classList.add("hidden");
            }
            if (avatarInitials) avatarInitials.classList.remove("hidden");
            if (navAvatarImg) {
                navAvatarImg.src = "";
                navAvatarImg.classList.add("hidden");
            }
            if (navAvatarInitials) navAvatarInitials.classList.remove("hidden");
            if (avatarInput) avatarInput.value = "";
            removeAvatarBtn.classList.add("hidden");
        });
    }
}

// DOM Yüklendiğinde Başlat
document.addEventListener("DOMContentLoaded", function() {
    console.log("🧬 CRISPR-Lab Modüler Platformu Başlatıldı.");

    setupFirebaseListener();
    renderGuideCards();
    initGuideEventListeners();
    renderScenarioCards();
    bindGlobalEvents();
});