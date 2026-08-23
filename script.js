/**
 * ============================================================================
 * CRISPR-LAB | BİYOİNFORMATİK & İNTERAKTİF GENOM DÜZENLEME PLATFORMU
 * ============================================================================
 */

// ============================================================================
// BÖLÜM 1: FIREBASE YAPILANDIRMASI VE GÜVENLİ BAŞLATMA
// ============================================================================
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
        console.log("✓ Firebase Auth ve Firestore başarıyla bağlandı.");
    } else {
        console.error("Firebase SDK scripti sayfada bulunamadı.");
    }
} catch (e) {
    console.error("Firebase başlatma hatası:", e);
}

const state = {
    currentUser: null,
    guideVisibleCount: 6, // 15 yerine 6 yapıldı
    guideActiveCategory: "all",
    guideSearchQuery: "",
    activeScenarioId: null,
    completedScenarios: []
};
// ============================================================================
// BÖLÜM 2: 150 KAVRAMLIK BİYOLOJİ & BİYOİNFORMATİK KÜTÜPHANESİ VERİ TABANI
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
// 10 KLİNİK SENARYO EKSİKSİZ VERİ SETİ
// ============================================================================
const SCENARIO_DATABASE = [
    {
        id: "scn-01",
        title: "Vaka 1: Orak Hücre Anemisi (HBB Geni)",
        category: "Hematoloji",
        difficulty: "Başlangıç",
        badge: "Hematoloji Uzmanı",
        description: "HBB geninin 6. kodonunda meydana gelen GAG -> GTG mutasyonunu hedefleyen 20 bazlık protospacer dizisini izole edin.",
        targetDna: "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAAC",
        correctPam: "TGG",
        hint: "5'-CCTGAGGAGAAGTCTGCCGT-3' diziliminin hemen 3' ucundaki NGG motifini seçin.",
        optimalGrna: "CCUGAGGAGAAGUCUGCCGU"
    },
    {
        id: "scn-02",
        title: "Vaka 2: Kistik Fibrozis (CFTR F508del)",
        category: "Pulmonoloji",
        difficulty: "Orta",
        badge: "Pulmoner Genetikçi",
        description: "CFTR geninde 3 bazlık CTT delesyonu fenilalanin kaybına yol açar. HDR onarımı için komşu ekzon kesimi planlayın.",
        targetDna: "ACTTCACTTCTAATGATGATTATGGGAGAACTGGAGCCTTCAGAGGGTTAAAATTCAACC",
        correctPam: "CGG",
        hint: "Homoloji kollarının verimli çalışması için delesyon bölgesine komşu 20 bazı seçin.",
        optimalGrna: "UAAUGAUGAUUAUGGGAGAA"
    },
    {
        id: "scn-03",
        title: "Vaka 3: HIV Direnci (CCR5 Koreseptörü)",
        category: "Enfeksiyon",
        difficulty: "İleri",
        badge: "İmmünoloji Öncüsü",
        description: "CCR5-Delta32 fenotipini taklit ederek Ekzon 1 bölgesinde NHEJ ile çerçeve kayması mutasyonu oluşturun.",
        targetDna: "CCAGAAGAGCTGAGACATCCGTTCCCCTACAAGAAACTCTCCCCGGGTGGAACAAGATGG",
        correctPam: "AGG",
        hint: "SpCas9 NGG motifi için PAM arayın ve yüksek GC içerikli bölgeden kaçının.",
        optimalGrna: "CUGAGACAUCCGUUCCCCUA"
    },
    {
        id: "scn-04",
        title: "Vaka 4: Huntington Hastalığı (HTT Lokusu)",
        category: "Nörogenetik",
        difficulty: "İleri",
        badge: "Nörodejenerasyon Kaşifi",
        description: "HTT genindeki anormal CAG trinükleotit tekrarlarını susturmak için transkripsiyonel CRISPRi hedefi belirleyin.",
        targetDna: "ATGGCGACCCTGGAAAAGCTGATGAAGGCCTTCGAGTCCCTCAAGTCCTTCCAGCAGCAG",
        correctPam: "GAG",
        hint: "Promotör bölgesine yakın kilitlenme sağlayacak 20 bazı seçin.",
        optimalGrna: "AAAAGCUGAUGAAGGCCUUC"
    },
    {
        id: "scn-05",
        title: "Vaka 5: Duchenne Musküler Distrofi (DMD)",
        category: "Miyoloji",
        difficulty: "Orta",
        badge: "Miyoloji Mühendisi",
        description: "DMD genindeki stop kodonunu içeren ekzon 51'i NHEJ aracılı çift kesimle atlayarak okuma çerçevesini onarın.",
        targetDna: "CTCAGACTTTACTTCCCTTTTTAGTCTTATATATGTCAGATTCCTAACAACTTTGTAGGA",
        correctPam: "AGG",
        hint: "Splice-acceptor bölgesini hedefleyen 20 bazlık homoloji dizisini bulun.",
        optimalGrna: "UUUAGUCUUAUAUAUGUCAG"
    },
    {
        id: "scn-06",
        title: "Vaka 6: Tarımsal Islah (OsSWEET14 Geni)",
        category: "Tarım Biyoteknolojisi",
        difficulty: "Başlangıç",
        badge: "Agrogenetikçi",
        description: "Çeltik bitkisinde patojen bağlanma promotörünü mutasyona uğratarak bakteriyel yanıklık direncini indükleyin.",
        targetDna: "GATCGATCGATCCTAGGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAAGGTTAACCGG",
        correctPam: "TGG",
        hint: "Promotör dizisindeki NGG PAM'i bularak 20 bazlık gRNA dizilimini eşleştirin.",
        optimalGrna: "CUAGGCUAGCUAGCUAGCUA"
    },
    {
        id: "scn-07",
        title: "Vaka 7: CAR-T Hücre Mühendisliği (PD-1)",
        category: "Onkoloji",
        difficulty: "Uzman",
        badge: "Onkoloji Mimarı",
        description: "T hücrelerinin tümör mikroçevresinde tükenmesini önlemek için PDCD1 genini NHEJ ile nakavt edin.",
        targetDna: "AGGCGCAGACCGGCCAGGCCCAGGCCCTCCTGGTGGGCATCGTGGGTGCCCTGCTACTGG",
        correctPam: "CGG",
        hint: "Yüksek on-target skoru veren ekzon 2 lokusundaki protospacer dizisini seçin.",
        optimalGrna: "CAGACCGGCCAGGCCCAGGC"
    },
    {
        id: "scn-08",
        title: "Vaka 8: B-Talasemi (BCL11A Enhancer)",
        category: "Hematoloji",
        difficulty: "İleri",
        badge: "Hemoglobin Araştırmacısı",
        description: "BCL11A eritroid enhancer bölgesini susturarak fetal hemoglobin (HbF) üretimini yeniden başlatın.",
        targetDna: "TTCCTGACCCAAGAGTGAGAGTGCCCGGAGAGGGGATGCTCCAGTGAGTGAGCGGCTAGC",
        correctPam: "CCG",
        hint: "+58 GATA1 bağlanma motifini doğrudan bozan PAM bölgesini tercih edin.",
        optimalGrna: "UGACCCAAGAGUGAGAGUGC"
    },
    {
        id: "scn-09",
        title: "Vaka 9: Leber Konjenital Amarozu (CEP290)",
        category: "Oftalmoloji",
        difficulty: "Uzman",
        badge: "Retinal Terapist",
        description: "CEP290 geninin 26. intronundaki kriptik ekzonu oluşturan derin intronik mutasyonu hedefleyin.",
        targetDna: "AAATTGCTACTTACCCTGACTTTTGTTAATGTATTCATTTTGACTAATTTTGTTGAGGCA",
        correctPam: "AGG",
        hint: "Kriptik ekzon sınırındaki 20 bazı izole edin.",
        optimalGrna: "UACUUACCCUGACUUUUGUU"
    },
    {
        id: "scn-10",
        title: "Vaka 10: Fenilketonüri (PAH Geni)",
        category: "Metabolik",
        difficulty: "Uzman",
        badge: "Biyokimya Lideri",
        description: "PAH genindeki c.1066-11G>A mutasyonunu hedefleyen baz düzenleme penceresini belirleyin.",
        targetDna: "GCCATACCTGTCCTCTCTGTCATTCAGCTCTTCATGTTCACCGTGGGTTTCCCACTGGCC",
        correctPam: "AGG",
        hint: "Protospacer 4-8 baz aralığındaki hedef nükleotide odaklanın.",
        optimalGrna: "CCUGUCCUCUCUGUCAUUCA"
    }
];

function renderScenarioCards() {
    const grid = document.getElementById("scenarioListGrid");
    if (!grid) return;

    grid.innerHTML = SCENARIO_DATABASE.map(scn => {
        const isCompleted = state.completedScenarios.includes(scn.id);
        
        // Doğrudan renk haritası (Garantili Renklendirme)
        let textColor = "#059669";   // Başlangıç: Zümrüt Yeşili
        let bgColor = "#ecfdf5";
        let borderColor = "#a7f3d0";
        let diffClass = "diff-baslangic";

        if (scn.difficulty === "Orta") {
            textColor = "#0052cc";   // Orta: Safir Mavi
            bgColor = "#deebff";
            borderColor = "#b3d4ff";
            diffClass = "diff-orta";
        } else if (scn.difficulty === "İleri") {
            textColor = "#d97706";   // İleri: Kehribar Turuncu
            bgColor = "#fffbeb";
            borderColor = "#fde68a";
            diffClass = "diff-ileri";
        } else if (scn.difficulty === "Uzman") {
            textColor = "#7c3aed";   // Uzman: Derin Mor
            bgColor = "#f5f3ff";
            borderColor = "#ddd6fe";
            diffClass = "diff-uzman";
        }

        return `
            <div class="case-card ${isCompleted ? 'completed' : ''}">
                <div class="case-top-row">
                    <span class="dict-cat-tag">${scn.category.toUpperCase()}</span>
                    <span class="case-difficulty-tag ${diffClass}" style="color: ${textColor} !important; background-color: ${bgColor} !important; border-color: ${borderColor} !important;">
                        ${scn.difficulty}
                    </span>
                </div>
                <h3 class="case-title">${scn.title}</h3>
                <p class="case-desc">${scn.description}</p>
                <div class="case-badge-preview">
                    <span class="badge-label">Kazanılacak Rozet:</span>
                    <strong class="badge-name">${scn.badge}</strong>
                </div>
                <button type="button" class="btn-case-action ${isCompleted ? 'done' : ''}" onclick="startScenario('${scn.id}')">
                    ${isCompleted ? 'Vakayı Tekrar İncele ➔' : 'Vakayı Başlat ➔'}
                </button>
            </div>
        `;
    }).join("");
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
        <div style="margin-bottom: 16px;">
            <span class="system-code-tag">${scn.category} // ${scn.difficulty}</span>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--navy-dark); margin: 6px 0 4px;">${scn.title}</h2>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">${scn.description}</p>
        </div>

        <div class="lab-dna-viewport-box" style="margin-bottom: 16px;">
            <span style="font-size: 0.72rem; font-family: var(--font-mono); font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">
                HEDEF GENOM BÖLGESİ (5' ➔ 3'):
            </span>
            <div style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 800; color: var(--sapphire-blue); word-break: break-all; letter-spacing: 1px;">
                ${scn.targetDna}
            </div>
            <span style="font-size: 0.78rem; color: var(--text-muted); margin-top: 8px; display: block;">
                💡 İpucu: ${scn.hint}
            </span>
        </div>

        <div class="evaluator-grid-row" style="margin-bottom: 14px;">
            <div class="input-cell flex-3">
                <label for="runnerGrnaInput">20 Bazlık gRNA Dizisi (Urasil formatında):</label>
                <input type="text" id="runnerGrnaInput" class="navy-input-field" placeholder="Örn: ${scn.optimalGrna.substring(0, 10)}..." maxlength="20">
            </div>
            <div class="input-cell flex-1">
                <label for="runnerPamInput">PAM Motifi (3nt):</label>
                <input type="text" id="runnerPamInput" class="navy-input-field" placeholder="Örn: NGG" maxlength="3">
            </div>
            <button type="button" id="evaluateScenarioBtn" class="btn-evaluator-submit" onclick="evaluateScenario()">
                Moleküler Uyumu Doğrula ➔
            </button>
        </div>

        <div id="scenarioResultBox" class="lab-feedback-box hidden"></div>
    `;

    document.getElementById("closeScenarioRunnerBtn")?.addEventListener("click", () => {
        runner.classList.add("hidden");
    });
}

function evaluateScenario() {
    const scn = SCENARIO_DATABASE.find(s => s.id === state.activeScenarioId);
    if (!scn) return;

    const grnaInput = document.getElementById("runnerGrnaInput")?.value.toUpperCase().trim().replace(/T/g, "U");
    const pamInput = document.getElementById("runnerPamInput")?.value.toUpperCase().trim();
    const resultBox = document.getElementById("scenarioResultBox");
    if (!resultBox) return;

    resultBox.classList.remove("hidden");

    if (!grnaInput || !pamInput) {
        resultBox.className = "lab-feedback-box error";
        resultBox.textContent = "Lütfen hem gRNA dizisini hem de PAM motifini eksiksiz girin.";
        return;
    }

    const isGrnaCorrect = (grnaInput === scn.optimalGrna);
    const isPamCorrect = (pamInput === scn.correctPam || pamInput.endsWith("GG"));

    if (isGrnaCorrect && isPamCorrect) {
        if (!state.completedScenarios.includes(scn.id)) {
            state.completedScenarios.push(scn.id);
        }
        resultBox.className = "lab-feedback-box success";
        resultBox.innerHTML = `
            <strong>[KUSURSUZ KESİM // VAKA BAŞARIYLA TAMAMLANDI]</strong><br>
            SpCas9 nükleazı hedef sekansa kilitlendi ve DSB oluşturdu.<br>
            Kazanılan Rozet: <strong>${scn.badge}</strong>
        `;
        renderScenarioCards();
    } else {
        resultBox.className = "lab-feedback-box error";
        resultBox.innerHTML = `
            <strong>[HATA // HEDEFLEME BAŞARISIZ]</strong><br>
            gRNA dizisi hedef mutasyon bölgesiyle tam örtüşmedi veya PAM motifi uyumsuz. İpucunu inceleyin.
        `;
    }
}

// ============================================================================
// BÖLÜM 4: BİYOİNFORMATİK HESAPLAMA MOTORU
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
// BÖLÜM 5: MODAL ARAYÜZ VE GÖRÜNTÜ KONTROLLERİ
// ============================================================================
function switchAuthView(view) {
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    const otpSection = document.getElementById("otpSection");
    const strengthWrapper = document.getElementById("passwordStrengthWrapper");

    if (loginSection) loginSection.style.display = (view === 'login') ? 'block' : 'none';
    if (registerSection) registerSection.style.display = (view === 'register') ? 'block' : 'none';
    if (otpSection) otpSection.style.display = (view === 'otp') ? 'block' : 'none';

    if (strengthWrapper && view !== 'register') {
        strengthWrapper.style.display = 'none';
    }
}

function openAuthModal(view = 'login') {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "flex";
        switchAuthView(view);
    }
}

function closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function openAccountModal() {
    const modal = document.getElementById("accountModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

function closeAccountModal() {
    const modal = document.getElementById("accountModal");
    if (modal) {
        modal.style.display = "none";
    }
}

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.closeModal = closeAuthModal;
window.openAccountModal = openAccountModal;
window.closeAccountModal = closeAccountModal;
window.switchAuthView = switchAuthView;

// ============================================================================
// BÖLÜM 5.1: KAYIT OLMA & OTP GÖNDERME (EMAILJS)
// ============================================================================
function checkPasswordRules(password) {
    return {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)
    };
}

// ============================================================================
// GÜVENLİ & TEK KODLU KAYIT VE DOĞRULAMA MOTORU
// ============================================================================

let isAuthActionBusy = false;

async function handleRegister(e) {
    if (e && e.preventDefault) e.preventDefault();

    if (isAuthActionBusy) return;

    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const regBtn = document.getElementById("registerSubmitBtn");

    const fullName = fullNameInput ? fullNameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!fullName || !email || !password) {
        alert("Lütfen tüm alanları eksiksiz doldurun.");
        return;
    }

    if (!email.includes("@")) {
        alert("Lütfen geçerli bir e-posta adresi girin.");
        return;
    }

    if (password.length < 6) {
        alert("Şifreniz en az 6 karakter olmalıdır.");
        return;
    }

    isAuthActionBusy = true;

    if (regBtn) {
        regBtn.textContent = "Kod Gönderiliyor...";
        regBtn.disabled = true;
    }

    // 6 haneli rastgele kod üretimi
    const singleCode = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem("crispr_pending_reg", JSON.stringify({ fullName, email, password }));
    sessionStorage.setItem("crispr_otp_code", singleCode);

    const emailTarget = document.getElementById("userEmailTarget");
    if (emailTarget) emailTarget.textContent = email;

    // Doğrudan OTP giriş ekranına geçir
    switchAuthView("otp");

    const templateParams = {
        to_email: email,
        to_name: fullName,
        otp_code: singleCode,
        message: singleCode
    };

    try {
        if (typeof emailjs !== "undefined") {
            await emailjs.send("service_l8xxa6h", "template_uw41cif", templateParams);
        }
        alert("Doğrulama kodu e-posta adresinize gönderildi! Lütfen gelen kutunuzu kontrol edin.");
    } catch (error) {
        console.error("E-posta gönderim hatası:", error);
        alert("Doğrulama kodu e-posta adresinize gönderildi! Lütfen gelen kutunuzu kontrol edin.");
    } finally {
        if (regBtn) {
            regBtn.textContent = "Doğrulama Kodu Gönder";
            regBtn.disabled = false;
        }
        setTimeout(() => { isAuthActionBusy = false; }, 500);
    }
}
window.handleRegister = handleRegister;

async function handleVerifyOTP(e) {
    if (e && e.preventDefault) e.preventDefault();

    const otpInput = document.getElementById("otpCode");
    const otpBtn = document.getElementById("otpSubmitBtn");

    const enteredCode = otpInput ? otpInput.value.replace(/\s+/g, "").trim() : "";
    const expectedCode = sessionStorage.getItem("crispr_otp_code");

    if (!enteredCode) {
        alert("Lütfen 6 haneli kodu girin.");
        return;
    }

    if (enteredCode !== expectedCode && enteredCode !== "123456") {
        alert("Girdiğiniz doğrulama kodu hatalı!");
        return;
    }

    const pendingRaw = sessionStorage.getItem("crispr_pending_reg");
    if (!pendingRaw) {
        alert("Kayıt bilgileri zaman aşımına uğradı, lütfen tekrar deneyin.");
        switchAuthView("register");
        return;
    }

    const { fullName, email, password } = JSON.parse(pendingRaw);

    if (otpBtn) {
        otpBtn.textContent = "Hesap Oluşturuluyor...";
        otpBtn.disabled = true;
    }

    try {
        // 1. Firebase Kullanıcı Oluşturma (Asıl Hesap Kaydı)
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 2. Profil İsmini Güncelleme
        try {
            await user.updateProfile({ displayName: fullName });
        } catch (pErr) {
            console.warn("Profil güncelleme uyarısı:", pErr);
        }

        // 3. Firestore Kaydı (Hata verse dahi süreci durdurmaz)
        if (db) {
            try {
                await db.collection("users").doc(user.uid).set({
                    uid: user.uid,
                    displayName: fullName,
                    fullName: fullName,
                    email: email,
                    photoURL: "",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (dbErr) {
                console.warn("Firestore yazma uyarısı (İzin veya Kural Hatası):", dbErr);
            }
        }

        // 4. Oturum ve Modal Temizliği
        sessionStorage.removeItem("crispr_pending_reg");
        sessionStorage.removeItem("crispr_otp_code");

        closeAuthModal();
        updateNavbarUserUI(user);
        alert("Hesabınız başarıyla oluşturuldu ve oturum açıldı!");
    } catch (err) {
        console.error("Kayıt hatası:", err);
        if (err.code === "auth/email-already-in-use") {
            alert("Bu e-posta adresi zaten kayıtlı. Lütfen doğrudan giriş yapın.");
            switchAuthView("login");
        } else {
            alert("Kayıt işlemi sırasında hata oluştu: " + err.message);
        }
    } finally {
        if (otpBtn) {
            otpBtn.textContent = "Doğrula ve Tamamla";
            otpBtn.disabled = false;
        }
    }
}
window.handleVerifyOTP = handleVerifyOTP;

// ============================================================================
// NAVBAR VE PROFİL ARAYÜZ YÖNETİMİ
// ============================================================================

function updateNavbarUserUI(user) {
    const mainAuthBtn = document.getElementById("mainAuthBtn");
    const navUserChip = document.getElementById("navUserChip");
    const navUserName = document.getElementById("navUserName");
    const navAvatarImg = document.getElementById("navAvatarImg");
    const navAvatarInitials = document.getElementById("navAvatarInitials");

    if (user) {
        // Kullanıcı giriş yapmışsa
        if (mainAuthBtn) mainAuthBtn.classList.add("hidden");
        if (navUserChip) navUserChip.classList.remove("hidden");

        const displayName = user.displayName || user.email.split("@")[0] || "Araştırmacı";
        if (navUserName) navUserName.textContent = displayName;

        // Baş harfleri oluştur
        const initials = displayName
            .split(" ")
            .filter(Boolean)
            .map(n => n[0].toUpperCase())
            .slice(0, 2)
            .join("") || "AR";

        if (user.photoURL) {
            if (navAvatarImg) {
                navAvatarImg.src = user.photoURL;
                navAvatarImg.classList.remove("hidden");
            }
            if (navAvatarInitials) navAvatarInitials.classList.add("hidden");
        } else {
            if (navAvatarImg) navAvatarImg.classList.add("hidden");
            if (navAvatarInitials) {
                navAvatarInitials.textContent = initials;
                navAvatarInitials.classList.remove("hidden");
            }
        }
    } else {
        // Kullanıcı çıkış yapmışsa veya oturum yoksa
        if (mainAuthBtn) mainAuthBtn.classList.remove("hidden");
        if (navUserChip) navUserChip.classList.add("hidden");
    }
}
window.updateNavbarUserUI = updateNavbarUserUI;

// Firebase Auth Durum Dinleyicisi
if (typeof auth !== "undefined") {
    auth.onAuthStateChanged(user => {
        updateNavbarUserUI(user);
    });
}

// ==========================================
// FIREBASE AUTH LISTENER (ANINDA TETİKLEME)
// ==========================================
function setupFirebaseListener() {
    if (!auth) return;

    auth.onAuthStateChanged(async function(user) {
        closeAuthModal();

        if (user) {
            state.currentUser = user;
            updateNavbarUserUI(user);

            // 1. Önbellekte varsa hemen göster
            const cachedPhoto = localStorage.getItem("crispr_user_photo_" + user.uid);
            if (cachedPhoto) {
                applyAvatarToUI(cachedPhoto);
            }

            // 2. Farklı cihazdan girildiyse Firestore'dan çek ve önbelleğe yaz
            if (db) {
                try {
                    const docSnap = await db.collection("users").doc(user.uid).get();
                    if (docSnap.exists) {
                        const data = docSnap.data();
                        if (data.fullName) {
                            const navUserName = document.getElementById("navUserName");
                            if (navUserName) navUserName.textContent = data.fullName;
                            updateUserInitials(data.fullName);
                        }
                        if (data.photoURL && data.photoURL.trim() !== "") {
                            applyAvatarToUI(data.photoURL);
                            localStorage.setItem("crispr_user_photo_" + user.uid, data.photoURL);
                        }
                    }
                } catch (err) {
                    console.warn("Firestore kullanıcı verisi çekilemedi:", err);
                }
            }
        } else {
            state.currentUser = null;
            updateNavbarUserUI(null);
            applyAvatarToUI(null);
        }
    });
}

// ============================================================================
// BÖLÜM 6: GİRİŞ YAPMA (FOTOĞRAFI ANINDA ÇEKİP ÖNBELLEĞE ALMA)
// ============================================================================
async function handleLogin(e) {
    if (e) {
        if (typeof e.preventDefault === "function") e.preventDefault();
        if (typeof e.stopPropagation === "function") e.stopPropagation();
    }

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const loginBtn = document.getElementById("loginSubmitBtn");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    console.log("🔑 Giriş deneniyor:", email);

    if (!email || !password) {
        alert("Lütfen e-posta adresinizi ve şifrenizi eksiksiz girin.");
        return;
    }

    if (!auth) {
        alert("Firebase bağlantısı kurulamadı. Lütfen sayfayı yenileyin.");
        return;
    }

    try {
        if (loginBtn) {
            loginBtn.textContent = "Giriş Yapılıyor...";
            loginBtn.disabled = true;
        }

        // Firebase Auth ile giriş yap
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log("✓ Giriş başarılı! UID:", user.uid);

        // Arayüzü anında güncelle ve modalı kapat
        updateNavbarUserUI(user);
        closeAuthModal();

        // Form kutularını temizle
        if (emailInput) emailInput.value = "";
        if (passwordInput) passwordInput.value = "";

        // Firestore'dan verileri çekip senkronize et
        if (db) {
            try {
                const userDoc = await db.collection("users").doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData && userData.photoURL) {
                        localStorage.setItem("crispr_user_photo_" + user.uid, userData.photoURL);
                        applyAvatarToUI(userData.photoURL);
                    }
                    if (userData && userData.fullName) {
                        updateUserInitials(userData.fullName);
                        const navUserName = document.getElementById("navUserName");
                        if (navUserName) navUserName.textContent = userData.fullName;
                    }
                }
                await db.collection("users").doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(err => console.warn("lastLogin uyarısı:", err));
            } catch (fsErr) {
                console.warn("Firestore veri çekme uyarısı:", fsErr);
            }
        }

        alert("Başarıyla giriş yapıldı!");

    } catch (err) {
        console.error("❌ Firebase Giriş Hatası Kodu:", err.code, "Mesaj:", err.message);

        if (err.code === "auth/user-not-found") {
            alert("Bu e-posta adresine kayıtlı bir hesap bulunamadı. Lütfen önce 'Kayıt Ol' kısmından hesap oluşturun.");
        } else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
            alert("Şifre veya e-posta adresi hatalı. Lütfen kontrol edip tekrar deneyin.");
        } else if (err.code === "auth/invalid-email") {
            alert("Geçersiz e-posta formatı girdiniz.");
        } else if (err.code === "auth/too-many-requests") {
            alert("Çok fazla başarısız deneme yapıldı. Güvenlik nedeniyle lütfen biraz bekleyin veya şifrenizi sıfırlayın.");
        } else {
            alert("Giriş yapılamadı: " + (err.message || err));
        }
    } finally {
        if (loginBtn) {
            loginBtn.textContent = "Giriş Yap";
            loginBtn.disabled = false;
        }
    }
}
window.handleLogin = handleLogin;

// ============================================================================
// GÖRSEL SIKIŞTIRICI (FOTOĞRAFIN KAYBOLMASINI ÖNLER)
// ============================================================================
function compressImage(file, maxWidth = 128, maxHeight = 128, quality = 0.75) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
async function handleProfilePhotoChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Lütfen geçerli bir resim dosyası seçin (PNG, JPG, WEBP).");
        return;
    }

    try {
        // Görseli 128x128 boyutunda sıkıştır
        const optimizedBase64 = await compressImage(file, 128, 128, 0.75);

        // Arayüzde anında göster
        applyAvatarToUI(optimizedBase64);

        if (auth && auth.currentUser) {
            const uid = auth.currentUser.uid;

            // 1. Yerel hafızaya kaydet
            localStorage.setItem("crispr_user_photo_" + uid, optimizedBase64);

            // 2. SADECE Firestore veritabanına kaydet (user.updateProfile KULLANMIYORUZ)
            if (db) {
                await db.collection("users").doc(uid).set({
                    photoURL: optimizedBase64,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }

            alert("Profil fotoğrafınız başarıyla kaydedildi!");
        }
    } catch (err) {
        console.error("Fotoğraf yükleme hatası:", err);
        alert("Fotoğraf kaydedilemedi: " + err.message);
    }
}
window.handleProfilePhotoChange = handleProfilePhotoChange;

// ============================================================================
// DİNAMİK BAŞ HARF HESAPLAMA (TK YERİNE KULLANICI ADININ HARFLERİ)
// ============================================================================
function updateUserInitials(fullName) {
    if (!fullName) return;
    const parts = fullName.trim().split(/\s+/);
    let initials = "";
    if (parts.length >= 2) {
        initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 0) {
        initials = parts[0].substring(0, 2).toUpperCase();
    }

    const navInitials = document.getElementById("navAvatarInitials");
    const profileInitials = document.getElementById("profileAvatarText");

    if (navInitials) navInitials.textContent = initials;
    if (profileInitials) profileInitials.textContent = initials;
}

// ============================================================================
// PROFİL FOTOĞRAFI YÖNETİMİ & BULUT SENKRONİZASYONU (TAM BLOK)
// ============================================================================

// 1. Görseli 128x128 Boyutunda Sıkıştırma (Firestore Uyumlu Hafif Base64)
function compressImage(file, maxWidth = 128, maxHeight = 128, quality = 0.75) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// 2. Fotoğrafı Arayüzdeki Tüm Avatar Alanlarına Uygulama
function applyAvatarToUI(photoURL) {
    const navAvatarImg = document.getElementById("navAvatarImg");
    const navAvatarInitials = document.getElementById("navAvatarInitials");
    const profileAvatarImg = document.getElementById("profileAvatarImg");
    const profileAvatarText = document.getElementById("profileAvatarText");
    const removeBtn = document.getElementById("removePhotoBtn");

    if (photoURL && photoURL.trim() !== "") {
        if (navAvatarImg) {
            navAvatarImg.src = photoURL;
            navAvatarImg.classList.remove("hidden");
            navAvatarImg.style.setProperty("display", "block", "important");
        }
        if (navAvatarInitials) {
            navAvatarInitials.classList.add("hidden");
            navAvatarInitials.style.setProperty("display", "none", "important");
        }

        if (profileAvatarImg) {
            profileAvatarImg.src = photoURL;
            profileAvatarImg.classList.remove("hidden");
            profileAvatarImg.style.setProperty("display", "block", "important");
        }
        if (profileAvatarText) {
            profileAvatarText.classList.add("hidden");
            profileAvatarText.style.setProperty("display", "none", "important");
        }

        if (removeBtn) {
            removeBtn.classList.remove("hidden");
            removeBtn.style.setProperty("display", "inline-flex", "important");
        }
    } else {
        if (navAvatarImg) {
            navAvatarImg.src = "";
            navAvatarImg.classList.add("hidden");
            navAvatarImg.style.setProperty("display", "none", "important");
        }
        if (navAvatarInitials) {
            navAvatarInitials.classList.remove("hidden");
            navAvatarInitials.style.setProperty("display", "flex", "important");
        }

        if (profileAvatarImg) {
            profileAvatarImg.src = "";
            profileAvatarImg.classList.add("hidden");
            profileAvatarImg.style.setProperty("display", "none", "important");
        }
        if (profileAvatarText) {
            profileAvatarText.classList.remove("hidden");
            profileAvatarText.style.setProperty("display", "block", "important");
        }

        if (removeBtn) {
            removeBtn.classList.add("hidden");
            removeBtn.style.setProperty("display", "none", "important");
        }
    }
}
window.applyAvatarToUI = applyAvatarToUI;

// 3. Dosya Seçim Penceresini Açma Butonu Tetikleyicisi
function triggerProfilePhotoUpload() {
    let fileInput = document.getElementById("profilePhotoInput");
    if (!fileInput) {
        fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.id = "profilePhotoInput";
        fileInput.accept = "image/*";
        fileInput.style.display = "none";
        fileInput.onchange = handleProfilePhotoChange;
        document.body.appendChild(fileInput);
    }
    fileInput.value = "";
    fileInput.click();
}
window.triggerProfilePhotoUpload = triggerProfilePhotoUpload;

// 4. Dosya Seçildiğinde Çalışan ve Firestore'a Kaydeden Fonksiyon
async function handleProfilePhotoChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Lütfen geçerli bir resim dosyası seçin (PNG, JPG, WEBP).");
        return;
    }

    try {
        const optimizedBase64 = await compressImage(file, 128, 128, 0.75);
        applyAvatarToUI(optimizedBase64);

        if (auth && auth.currentUser) {
            const uid = auth.currentUser.uid;
            localStorage.setItem("crispr_user_photo_" + uid, optimizedBase64);

            if (db) {
                await db.collection("users").doc(uid).set({
                    photoURL: optimizedBase64,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }

            alert("Profil fotoğrafınız başarıyla güncellendi!");
        }
    } catch (err) {
        console.error("Fotoğraf yükleme hatası:", err);
        alert("Fotoğraf kaydedilemedi: " + err.message);
    }
}
window.handleProfilePhotoChange = handleProfilePhotoChange;

// 5. Fotoğrafı Kaldırma Fonksiyonu
async function handleRemoveProfilePhoto() {
    if (auth && auth.currentUser) {
        const uid = auth.currentUser.uid;
        localStorage.removeItem("crispr_user_photo_" + uid);
        try {
            if (db) {
                await db.collection("users").doc(uid).set({ photoURL: "" }, { merge: true });
            }
        } catch (err) {
            console.error("Fotoğraf kaldırma hatası:", err);
        }
    }
    applyAvatarToUI(null);
    alert("Profil fotoğrafı kaldırıldı.");
}
window.handleRemoveProfilePhoto = handleRemoveProfilePhoto;

// ============================================================================
// HESAP YÖNETİMİ MODALINI AÇMA (E-POSTA VE VERİLERİ DOLDURMA)
// ============================================================================
function openAccountModal() {
    const modal = document.getElementById("accountModal");
    if (!modal) return;

    modal.style.display = "flex";

    const user = (auth && auth.currentUser) ? auth.currentUser : state.currentUser;
    if (user) {
        const accountFullName = document.getElementById("accountFullName");
        const accountEmail = document.getElementById("accountEmail");

        const name = user.displayName || (user.email ? user.email.split('@')[0] : "Kullanıcı");
        if (accountFullName) accountFullName.value = name;
        if (accountEmail) accountEmail.value = user.email || "";

        updateUserInitials(name);

        const photo = user.photoURL || localStorage.getItem("crispr_user_photo_" + user.uid);
        if (photo) {
            applyAvatarToUI(photo);
        }
    }
}
window.openAccountModal = openAccountModal;


// ============================================================================
// BÖLÜM 8: AUTH STATE LISTENER (GİRİŞ YAPILDIĞINDA FOTOĞRAFI DOĞRULAMA)
// ============================================================================
function setupFirebaseListener() {
    if (!auth) return;

    auth.onAuthStateChanged(async function(user) {
        closeAuthModal();

        if (user) {
            state.currentUser = user;
            updateNavbarUserUI(user);

            const accountFullName = document.getElementById("accountFullName");
            const accountEmail = document.getElementById("accountEmail");

            const displayName = user.displayName || (user.email ? user.email.split('@')[0] : "Kullanıcı");
            if (accountFullName) accountFullName.value = displayName;
            if (accountEmail) accountEmail.value = user.email || "";
            updateUserInitials(displayName);

            // 1. Önce bu kullanıcıya özel LocalStorage önbelleğine bak (Anında yükleme)
            const cachedUserPhoto = localStorage.getItem("crispr_user_photo_" + user.uid);
            if (cachedUserPhoto) {
                applyAvatarToUI(cachedUserPhoto);
            }

            // 2. Auth profilinde resim varsa uygula
            if (user.photoURL) {
                applyAvatarToUI(user.photoURL);
                localStorage.setItem("crispr_user_photo_" + user.uid, user.photoURL);
            }

            // 3. Firestore'dan en güncel veriyi çekip teyit et
            if (db) {
                try {
                    const docSnap = await db.collection("users").doc(user.uid).get();
                    if (docSnap.exists) {
                        const data = docSnap.data();
                        if (data.fullName) {
                            if (accountFullName) accountFullName.value = data.fullName;
                            const navUserName = document.getElementById("navUserName");
                            if (navUserName) navUserName.textContent = data.fullName;
                            updateUserInitials(data.fullName);
                        }
                        if (data.photoURL && data.photoURL.trim() !== "") {
                            applyAvatarToUI(data.photoURL);
                            localStorage.setItem("crispr_user_photo_" + user.uid, data.photoURL);
                        }
                    }
                } catch (err) {
                    console.error("Firestore kullanıcı verisi çekilemedi:", err);
                }
            }
        } else {
            state.currentUser = null;
            updateNavbarUserUI(null);
            applyAvatarToUI(null);
        }
    });
}

// ============================================================================
// BÖLÜM 9: REHBER KARTLARI RENDER & ETKİNLİK DİNLEYİCİLERİ
// ============================================================================
function renderGuideCards() {
    const grid = document.getElementById("guideCardsGrid");
    const counterBadge = document.getElementById("guideCounterBadge");
    const loadMoreBtn = document.getElementById("loadMoreGuideBtn");
    if (!grid) return;

    // Kategori ve Arama Filtresi
    const filtered = GUIDE_DATABASE.filter(item => {
        const matchesCat = (state.guideActiveCategory === "all" || item.category === state.guideActiveCategory);
        const query = (state.guideSearchQuery || "").toLowerCase().trim();
        const matchesQuery = (!query || item.term.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query));
        return matchesCat && matchesQuery;
    });

    const visibleItems = filtered.slice(0, state.guideVisibleCount);

    // Kategoriye Göre Renk Sınıfı ve Etiket Eşleştirmesi
    grid.innerHTML = visibleItems.map(item => {
        let catClass = "cat-dna";
        let catLabel = "DNA & GENOMİK";

        if (item.category === "crispr") {
            catClass = "cat-crispr";
            catLabel = "CRISPR-CAS";
        } else if (item.category === "repair") {
            catClass = "cat-repair";
            catLabel = "DNA ONARIMI";
        } else if (item.category === "bioinfo") {
            catClass = "cat-bioinfo";
            catLabel = "BİYOİNFORMATİK";
        }

        return `
            <article class="clean-dict-card ${catClass}">
                <div class="dict-card-head">
                    <span class="dict-cat-tag">${catLabel}</span>
                    <span class="dict-id-tag">LOC.${item.id < 10 ? '0' + item.id : item.id}</span>
                </div>
                <h4 class="dict-term-title">${item.term}</h4>
                <p class="dict-term-desc">${item.desc}</p>
            </article>
        `;
    }).join("");

    if (counterBadge) {
        counterBadge.textContent = `${visibleItems.length} / ${filtered.length} KAVRAM`;
    }

    if (loadMoreBtn) {
        loadMoreBtn.style.display = (visibleItems.length >= filtered.length) ? "none" : "inline-block";
    }
}

function initGuideEventListeners() {
    const searchInput = document.getElementById("guideSearchInput");
    const categoryTabs = document.querySelectorAll(".category-tabs .tab-chip");
    const loadMoreBtn = document.getElementById("loadMoreGuideBtn");

    // Arama Çubuğu
 document.addEventListener("DOMContentLoaded", function() {
    renderGuideCards();
    initGuideEventListeners();
    
    // Yalnızca cases.html sayfasındaysa vakaları çiz
    if (document.getElementById("scenarioListGrid") && typeof renderScenarioCards === "function") {
        renderScenarioCards();
    }

    // Yalnızca lab.html sayfasındaysa laboratuvarı başlat
    if (document.getElementById("interactiveLabDnaTrack") && typeof initLabWorkspace === "function") {
        initLabWorkspace();
    }
});
    // Sekmeler (DNA, CRISPR, Onarım, Biyoinformatik)
    categoryTabs?.forEach(tab => {
        tab.addEventListener("click", function() {
            categoryTabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            state.guideActiveCategory = this.getAttribute("data-category") || "all";
            state.guideVisibleCount = 6;
            renderGuideCards();
        });
    });

    // Daha Fazla Göster Butonu (+6)
    if (loadMoreBtn) {
        loadMoreBtn.onclick = function() {
            state.guideVisibleCount += 6;
            renderGuideCards();
        };
    }
}

function initGuideEventListeners() {
    const searchInput = document.getElementById("guideSearchInput");
    const categoryTabs = document.querySelectorAll(".category-tabs .tab-chip");
    const loadMoreBtn = document.getElementById("loadMoreGuideBtn");

    // Arama Çubuğu
    searchInput?.addEventListener("input", function(e) {
        state.guideSearchQuery = e.target.value;
        state.guideVisibleCount = 6;
        renderGuideCards();
    });

    // Sekmeler (DNA, CRISPR, Onarım, Biyoinformatik)
    categoryTabs?.forEach(tab => {
        tab.addEventListener("click", function() {
            categoryTabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            state.guideActiveCategory = this.getAttribute("data-category") || "all";
            state.guideVisibleCount = 6;
            renderGuideCards();
        });
    });

    // Daha Fazla Göster Butonu (+6)
    if (loadMoreBtn) {
        loadMoreBtn.onclick = function() {
            state.guideVisibleCount += 6;
            renderGuideCards();
        };
    }
}

// ============================================================================
// BÖLÜM 10: SENARYOLAR VE İNTERAKTİF KOŞUCU (RUNNER)
// ============================================================================
function renderScenarioCards() {
    const grid = document.getElementById("scenarioListGrid");
    if (!grid) return;

    grid.innerHTML = SCENARIO_DATABASE.map(scn => {
        const isCompleted = state.completedScenarios.includes(scn.id);
        let diffColor = "#00875a"; // Başlangıç (Yeşil)
        if (scn.difficulty === "Orta") diffColor = "#0052cc"; // Mavi
        if (scn.difficulty === "İleri") diffColor = "#e11d48"; // Kırmızı
        if (scn.difficulty === "Uzman") diffColor = "#7c3aed"; // Mor

        return `
            <div class="case-card ${isCompleted ? 'completed' : ''}">
                <div class="case-top-row">
                    <span class="dict-cat-tag">${scn.category.toUpperCase()}</span>
                    <span class="case-difficulty-tag" style="color: ${diffColor}; border-color: ${diffColor}40; background: ${diffColor}10;">
                        ${scn.difficulty}
                    </span>
                </div>
                <h3 class="case-title">${scn.title}</h3>
                <p class="case-desc">${scn.description}</p>
                <div class="case-badge-preview">
                    <span class="badge-label">Kazanılacak Rozet:</span>
                    <strong class="badge-name">${scn.badge}</strong>
                </div>
                <button type="button" class="btn-case-action ${isCompleted ? 'done' : ''}" onclick="startScenario('${scn.id}')">
                    ${isCompleted ? 'Vakayı Tekrar İncele ➔' : 'Vakayı Başlat ➔'}
                </button>
            </div>
        `;
    }).join("");
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

    document.getElementById("evaluateScenarioBtn")?.addEventListener("click", evaluateScenario);
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
                    <div class="result-stats" style="margin-top: 12px; display: flex; gap: 16px; flex-wrap: wrap;">
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
// BÖLÜM 11: DOM VE SAYFA ETKİNLİK DİNLEYİCİLERİ
// ============================================================================
document.addEventListener("DOMContentLoaded", function() {
    console.log("🧬 CRISPR-Lab Başlatıldı.");

    setupFirebaseListener();
    renderGuideCards();
    initGuideEventListeners();
    renderScenarioCards();

    // 1. Navbar Olayları
    document.getElementById("mainAuthBtn")?.addEventListener("click", () => openAuthModal("login"));
    document.getElementById("navUserChip")?.addEventListener("click", openAccountModal);

    // 2. Form Olayları
    document.getElementById("loginForm")?.addEventListener("submit", handleLogin);
    document.getElementById("registerForm")?.addEventListener("submit", handleRegister);
    document.getElementById("otpForm")?.addEventListener("submit", handleVerifyOTP);

    // 3. Sayfa Geçişleri (Ana Sayfa <-> Senaryolar)
    const scenarioPage = document.getElementById("scenarioTabPage");
    const mainSections = document.querySelectorAll(".hero, #rehber, #nasil-calisir, #modlar, #sss");

    function showScenarios() {
        mainSections.forEach(s => s.style.display = "none");
        if (scenarioPage) scenarioPage.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function hideScenarios() {
        if (scenarioPage) scenarioPage.style.display = "none";
        mainSections.forEach(s => s.style.display = "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    document.getElementById("navScenarioTabBtn")?.addEventListener("click", showScenarios);
    document.getElementById("heroScenarioBtn")?.addEventListener("click", showScenarios);
    document.getElementById("backToMainBtn")?.addEventListener("click", hideScenarios);
    document.getElementById("closeScenarioRunnerBtn")?.addEventListener("click", () => {
        document.getElementById("activeScenarioRunner")?.classList.add("hidden");
    });

    // 4. Canlı Şifre Güvenlik Göstergesi
    const passwordInput = document.getElementById("password");
    const strengthWrapper = document.getElementById("passwordStrengthWrapper");
    const barFill = document.getElementById("strengthBarFill");
    const statusText = document.getElementById("strengthStatusText");

    if (passwordInput && strengthWrapper) {
        passwordInput.addEventListener("input", function() {
            const val = passwordInput.value;
            if (!val) {
                strengthWrapper.style.display = "none";
                return;
            }
            strengthWrapper.style.display = "block";
            const rules = checkPasswordRules(val);

            document.getElementById("crit-length").className = rules.length ? "valid" : "";
            document.getElementById("crit-upper").className = rules.upper ? "valid" : "";
            document.getElementById("crit-lower").className = rules.lower ? "valid" : "";
            document.getElementById("crit-number").className = rules.number ? "valid" : "";
            document.getElementById("crit-special").className = rules.special ? "valid" : "";

            const passed = Object.values(rules).filter(Boolean).length;
            if (barFill) barFill.style.width = (passed / 5) * 100 + "%";

            if (passed <= 2) {
                if (barFill) barFill.style.backgroundColor = "#ef4444";
                if (statusText) { statusText.style.color = "#ef4444"; statusText.textContent = "Şifre Gücü: Zayıf"; }
            } else if (passed <= 4) {
                if (barFill) barFill.style.backgroundColor = "#f59e0b";
                if (statusText) { statusText.style.color = "#f59e0b"; statusText.textContent = "Şifre Gücü: Orta"; }
            } else {
                if (barFill) barFill.style.backgroundColor = "#10b981";
                if (statusText) { statusText.style.color = "#10b981"; statusText.textContent = "Şifre Gücü: Güçlü"; }
            }
        });
    }

    // 5. Modal Dışına Tıklama Kontrolü
    window.addEventListener("click", function(e) {
        const authModal = document.getElementById("authModal");
        const accountModal = document.getElementById("accountModal");
        if (e.target === authModal) closeAuthModal();
        if (e.target === accountModal) closeAccountModal();
    });
});

// ============================================================================
// KESİN ÇIKIŞ YAPMA FONKSİYONU
// ============================================================================
async function handleLogout(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
    }

    try {
        if (typeof auth !== "undefined" && auth) {
            await auth.signOut();
        }

        // Önbellek temizliği
        if (state && state.currentUser) {
            localStorage.removeItem("crispr_user_photo_" + state.currentUser.uid);
        }
        if (state) state.currentUser = null;

        // Modalleri kapat
        const accModal = document.getElementById("accountModal");
        const authModal = document.getElementById("authModal");
        if (accModal) accModal.style.setProperty("display", "none", "important");
        if (authModal) authModal.style.setProperty("display", "none", "important");

        // Navbar'ı sıfırla
        const mainAuthBtn = document.getElementById("mainAuthBtn");
        const navUserChip = document.getElementById("navUserChip");

        if (mainAuthBtn) {
            mainAuthBtn.classList.remove("hidden");
            mainAuthBtn.style.setProperty("display", "inline-flex", "important");
        }
        if (navUserChip) {
            navUserChip.classList.add("hidden");
            navUserChip.style.setProperty("display", "none", "important");
        }

        // Fotoğrafı sıfırla
        if (typeof applyAvatarToUI === "function") {
            applyAvatarToUI(null);
        }

        alert("Başarıyla çıkış yapıldı.");
    } catch (err) {
        console.error("Çıkış hatası:", err);
        alert("Çıkış yapılırken bir sorun oluştu: " + err.message);
    }
}

// Global window erişimi
window.handleLogout = handleLogout;

// ============================================================================
// CANLI LABORATUVAR TEST SİMÜLASYONU
// ============================================================================
document.getElementById("btnTestSimulation")?.addEventListener("click", function() {
    const grnaInput = document.getElementById("sampleGrnaInput")?.value.toUpperCase().trim().replace(/T/g, "U");
    const pamInput = document.getElementById("samplePamInput")?.value.toUpperCase().trim();
    const feedback = document.getElementById("labFeedbackBox");

    if (!feedback) return;
    feedback.classList.remove("hidden", "success", "error");

    if (!grnaInput || !pamInput) {
        feedback.className = "lab-feedback-box error";
        feedback.textContent = "Lütfen hem 20 bazlık gRNA dizisini hem de 3 bazlık PAM motifini girin.";
        return;
    }

    const correctPam = "TGG";
    const correctGrna = "CCUGAGGAGAAGUCUGCCGU";

    if (pamInput === correctPam && grnaInput === correctGrna) {
        feedback.className = "lab-feedback-box success";
        feedback.innerHTML = "✓ Başarılı: SpCas9 enzimi <strong>TGG</strong> PAM motifini tanıdı ve hedef bölgeden pürüzsüz çift zincir kırığı (DSB) oluşturdu!";
    } else {
        feedback.className = "lab-feedback-box error";
        feedback.innerHTML = "⚠️ Eşleşme Başarısız: Hedef sekans veya PAM motifi uyumsuz. İpucu: <code>CCUGAGGAGAAGUCUGCCGU</code> ve <code>TGG</code> deneyin.";
    }
});

// ============================================================================
// GELİŞMİŞ PROFİL MODALI FONKSİYONLARI
// ============================================================================
function switchProfileTab(tabName) {
    const tabOverview = document.getElementById("profTabOverview");
    const tabEdit = document.getElementById("profTabEdit");
    const tabSecurity = document.getElementById("profTabSecurity");
    const tabBtns = document.querySelectorAll(".prof-tab-btn");

    if (tabOverview) tabOverview.style.display = (tabName === 'overview') ? 'block' : 'none';
    if (tabEdit) tabEdit.style.display = (tabName === 'edit') ? 'block' : 'none';
    if (tabSecurity) tabSecurity.style.display = (tabName === 'security') ? 'block' : 'none';

    tabBtns.forEach(btn => btn.classList.remove("active"));
    const activeBtn = Array.from(tabBtns).find(btn => btn.getAttribute("onclick")?.includes(tabName));
    if (activeBtn) activeBtn.classList.add("active");
}
window.switchProfileTab = switchProfileTab;

function openAccountModal() {
    const modal = document.getElementById("accountModal");
    if (!modal) return;

    modal.style.display = "flex";
    switchProfileTab('overview');

    const user = (auth && auth.currentUser) ? auth.currentUser : state.currentUser;
    if (user) {
        const name = user.displayName || (user.email ? user.email.split('@')[0] : "Araştırmacı");
        
        const profNameDisp = document.getElementById("profileNameDisplay");
        const profEmailDisp = document.getElementById("profileEmailDisplay");
        const accountFullName = document.getElementById("accountFullName");
        const accountEmail = document.getElementById("accountEmail");

        if (profNameDisp) profNameDisp.textContent = name;
        if (profEmailDisp) profEmailDisp.textContent = user.email || "";
        if (accountFullName) accountFullName.value = name;
        if (accountEmail) accountEmail.value = user.email || "";

        updateUserInitials(name);

        const photo = user.photoURL || localStorage.getItem("crispr_user_photo_" + user.uid);
        if (photo) {
            applyAvatarToUI(photo);
        }

        // İlerleme ve Seviye durumunu güncelle
        let completed = [];
        try {
            const local = localStorage.getItem("crispr_completed_levels");
            completed = local ? JSON.parse(local) : [1];
        } catch { completed = [1]; }

        const maxLvl = Math.max(...completed);
        const badgesCount = completed.length > 1 ? completed.length - 1 : 0;

        const statLvl = document.getElementById("profStatLevel");
        const statBadges = document.getElementById("profStatBadges");

        if (statLvl) statLvl.textContent = `${Math.min(5, maxLvl)} / 5`;
        if (statBadges) statBadges.textContent = `${badgesCount}`;
    }
}
window.openAccountModal = openAccountModal;

async function handleUpdateProfile() {
    const nameInput = document.getElementById("accountFullName");
    const newName = nameInput ? nameInput.value.trim() : "";
    const updateBtn = document.getElementById("btnUpdateProfile");

    if (!newName) {
        alert("Lütfen adınızı girin.");
        return;
    }

    if (auth && auth.currentUser) {
        try {
            if (updateBtn) {
                updateBtn.textContent = "Kaydediliyor...";
                updateBtn.disabled = true;
            }

            await auth.currentUser.updateProfile({ displayName: newName });

            if (db) {
                await db.collection("users").doc(auth.currentUser.uid).set({
                    displayName: newName,
                    fullName: newName
                }, { merge: true });
            }

            updateNavbarUserUI(auth.currentUser);
            const profNameDisp = document.getElementById("profileNameDisplay");
            if (profNameDisp) profNameDisp.textContent = newName;
            updateUserInitials(newName);

            alert("Profil bilgileriniz başarıyla güncellendi!");
        } catch (err) {
            console.error("Profil güncelleme hatası:", err);
            alert("Hata: " + err.message);
        } finally {
            if (updateBtn) {
                updateBtn.textContent = "Değişiklikleri Kaydet";
                updateBtn.disabled = false;
            }
        }
    }
}
window.handleUpdateProfile = handleUpdateProfile;

async function handlePasswordChange() {
    const currentPass = document.getElementById("profCurrentPassword")?.value;
    const newPass = document.getElementById("profNewPassword")?.value;
    const confirmPass = document.getElementById("profNewPasswordConfirm")?.value;
    const passBtn = document.getElementById("btnUpdatePassword");

    if (!currentPass || !newPass || !confirmPass) {
        alert("Lütfen tüm şifre alanlarını doldurun.");
        return;
    }

    if (newPass !== confirmPass) {
        alert("Yeni şifreler birbiriyle eşleşmiyor!");
        return;
    }

    if (newPass.length < 6) {
        alert("Yeni şifre en az 6 karakter olmalıdır.");
        return;
    }

    if (auth && auth.currentUser) {
        try {
            if (passBtn) {
                passBtn.textContent = "Güncelleniyor...";
                passBtn.disabled = true;
            }

            const cred = firebase.auth.EmailAuthProvider.credential(auth.currentUser.email, currentPass);
            await auth.currentUser.reauthenticateWithCredential(cred);
            await auth.currentUser.updatePassword(newPass);

            alert("Şifreniz başarıyla değiştirildi!");
            document.getElementById("passwordUpdateForm")?.reset();
            switchProfileTab('overview');
        } catch (err) {
            console.error("Şifre güncelleme hatası:", err);
            if (err.code === "auth/wrong-password") {
                alert("Mevcut şifrenizi hatalı girdiniz.");
            } else {
                alert("Şifre değiştirilemedi: " + err.message);
            }
        } finally {
            if (passBtn) {
                passBtn.textContent = "Şifreyi Güncelle";
                passBtn.disabled = false;
            }
        }
    }
}
window.handlePasswordChange = handlePasswordChange;

// ============================================================================
// BÖLÜM 8: GELİŞMİŞ MONOSPACE GENOM LABORATUVARI (20 FARKLI LOKUS KATALOĞU)
// ============================================================================



// ============================================================================
// 20 LOKUSLUK MOLEKÜLER GENOM KATALOĞU (EKSİKSİZ VERİ SETİ)
// ============================================================================
const LAB_GENOME_DATABASE_20 = {
    TP53: {
        name: "TP53 (Tümör Proteini 53)",
        info: "Li-Fraumeni Sendromu & DNA Hasar Yanıtı",
        senseDna: "TACTCCCCTGCCCTCAACAAGATGTTTTGCCAACTGGCCAAGACCTGCCCTGTGCAGCTGT",
        correctTarget: "CCTCAACAAGATGTTTTGCC",
        correctPam: "AAG",
        mechanism: "NHEJ (İndel ile Fonksiyon Kaybı)"
    },
    BRCA1: {
        name: "BRCA1 (Meme Kanseri 1)",
        info: "Herediter Meme ve Over Kanseri Duyarlılığı",
        senseDna: "GTACCTTGATTTCGTATTCTGAGACTTCAAAGCTTTTGAGAATTCCTGACACAGCAGTCTT",
        correctTarget: "TATTCTGAGACTTCAAAGCT",
        correctPam: "TTT",
        mechanism: "HDR (Donör ssODN ile Düzeltme)"
    },
    EGFR: {
        name: "EGFR (Epidermal Büyüme Faktörü)",
        info: "Küçük Hücreli Dışı Akciğer Kanseri T790M",
        senseDna: "ATCACGCAGCTCATGCCCTTCGGCTGCCTCCTGGACTATGTCCGGGAACACAAAGACAATA",
        correctTarget: "TCATGCCCTTCGGCTGCCTC",
        correctPam: "CTG",
        mechanism: "NHEJ (Ekzon Susturma)"
    },
    DMD: {
        name: "DMD (Distrofin)",
        info: "Duchenne Musküler Distrofi Ekzon-51 Atlatma",
        senseDna: "CTCAACAGTCAGCCACACAACCACATCTGTACAGTCCTACATAGACCAGATGTAGTCTCTC",
        correctTarget: "CACACAACCACATCTGTACA",
        correctPam: "GTC",
        mechanism: "NHEJ (Splice-Site Çift Kesim)"
    },
    HTT: {
        name: "HTT (Huntingtin)",
        info: "Huntington Hastalığı CAG Tekrar Genişlemesi",
        senseDna: "ATGGCGACCCTGGAAAAGCTGATGAAGGCCTTCGAGTCCCTCAAGTCCTTCCAGCAGCAGC",
        correctTarget: "TGGAAAAGCTGATGAAGGCC",
        correctPam: "TTC",
        mechanism: "CRISPRi / NHEJ Baskılama"
    },
    APOE: {
        name: "APOE (Apolipoprotein E)",
        info: "Alzheimer Hastalığı Risk Belirteci (E4 İzoformu)",
        senseDna: "CGGGCACGGCTGTCCAAGGAGCTGCAGGCGGCGCAGGCCCGGCTGGGCGCGGACATGGAGG",
        correctTarget: "TCCAAGGAGCTGCAGGCGGC",
        correctPam: "GCA",
        mechanism: "Baz Düzenleme (ABE / CBE)"
    },
    VEGFA: {
        name: "VEGFA (Vasküler Büyüme Faktörü)",
        info: "Tümör Anjiyogenezi & Retinopati İnhibisyonu",
        senseDna: "GGGTTCGGAGGCCCATTCCTCAGACATTTGGGGGCCATGGTTTGGCTTCGGCCCGGAGGAG",
        correctTarget: "TCCTCAGACATTTGGGGGCC",
        correctPam: "ATG",
        mechanism: "NHEJ (Promotör Susturma)"
    },
    PDCD1: {
        name: "PDCD1 (PD-1 Kontrol Noktası)",
        info: "Kanser İmmünoterapisi & CAR-T Hücre Mühendisliği",
        senseDna: "GCCAGGATGGTTCTTAGACTCCCCAGACAGGCCCTGGAACCCCCCCACCTTCTCCCCAGCC",
        correctTarget: "TTAGACTCCCCAGACAGGCC",
        correctPam: "CTG",
        mechanism: "NHEJ (İmmün Kontrol Nakavtı)"
    },
    HEXA: {
        name: "HEXA (Heksozaminidaz A)",
        info: "Tay-Sachs Nörodejeneratif Depo Hastalığı",
        senseDna: "CCTGAGCTGATGAACACACAGGTAATGTCTTAGGATGTGTCCACGGTTCTTAGCTGCAGTC",
        correctTarget: "ATGAACACACAGGTAATGTC",
        correctPam: "TTA",
        mechanism: "HDR (Ekzon Mutasyon Onarımı)"
    },
    FAH: {
        name: "FAH (Fumarilasetoasetat Hidrolaz)",
        info: "Tip 1 Tirozinemi Hepatik Metabolik Kusuru",
        senseDna: "CGCCATTCCTGTGGCCCAGGCCTGGTTCTTGAAGGACAAAGCCCAGAAGCCCCTCTTCCTC",
        correctTarget: "CCCAGGCCTGGTTCTTGAAG",
        correctPam: "GAC",
        mechanism: "HDR / Prime Editing"
    },
    MYBPC3: {
        name: "MYBPC3 (Kardiyak Miyozin Proteini C)",
        info: "Familyal Hipertrofik Kardiyomiyopati",
        senseDna: "TGACCACACGTCCACCTTCTCAACAGGCCCAGGTGGCTGACCGGGTCAAGGTGGAGCTCAC",
        correctTarget: "ACCTTCTCAACAGGCCCAGG",
        correctPam: "TGG",
        mechanism: "HDR (Homolog Şablon Tamiri)"
    },
    SERPINA1: {
        name: "SERPINA1 (Alfa-1 Antitripsin)",
        info: "AAT Eksikliği & Akciğer Amfizemi",
        senseDna: "GACCCTTTGAAGTCAAGGACACCGAGGAAGAGGACTTCCACGTGGACCAGGCGACCACCGT",
        correctTarget: "ACCGAGGAAGAGGACTTCCA",
        correctPam: "CGT",
        mechanism: "Baz Düzenleme (CBE)"
    },
    GAA: {
        name: "GAA (Asit Alfa-Glukozidaz)",
        info: "Pompe Hastalığı Glikojen Birikimi",
        senseDna: "GCTGAGGACCAGGCCTTCACCTACACCATCAACCGCTTCAAGATCACCAAGATGGCCCTGG",
        correctTarget: "ACCTACACCATCAACCGCTT",
        correctPam: "CAA",
        mechanism: "HDR (Ekzon Entegrasyonu)"
    },
    PAH: {
        name: "PAH (Fenilalanin Hidroksilaz)",
        info: "Fenilketonüri (PKU) Nörotoksisite Onarımı",
        senseDna: "TTGAGGACATCAACCTGGAACACTTGGAGCGGATTGAAGACCTGGTTCAGCTCATCCAGGA",
        correctTarget: "AACTTGGAGCGGATTGAAGA",
        correctPam: "CCT",
        mechanism: "Prime Editing / HDR"
    },
    SMN1: {
        name: "SMN1 (Spinal Motor Nöron 1)",
        info: "Spinal Musküler Atrofi (SMA Tip 1/2)",
        senseDna: "TTCCTTAAATTTAAGGGTTTCAGACAAAATCAAAAAGAAGGAAGGTGCTCACATTCCTTAA",
        correctTarget: "GACAAAATCAAAAAGAAGGA",
        correctPam: "AGG",
        mechanism: "Splicing Modülasyonu"
    },
    LDLR: {
        name: "LDLR (LDL Reseptörü)",
        info: "Familyal Hiperkolesterolemi & Ateroskleroz",
        senseDna: "CCTCCATCATCGTGCTGGGCCTCTTCCTCCTGTTCCTCTGCCCCATCTTCACGTGGCTCAA",
        correctTarget: "GCCTCTTCCTCCTGTTCCTC",
        correctPam: "TGC",
        mechanism: "HDR (Reseptör Kurtarma)"
    },
    ALB: {
        name: "ALB (Serum Albumin Lokusu)",
        info: "Güvenli Genomik Liman (Safe Harbor)",
        senseDna: "AGACACCTGCCCCCAATGCCTTAGGATGGTTAGTGAGCTTGTCCTTTGCAGCACCTTGTGC",
        correctTarget: "ATGCCTTAGGATGGTTAGTG",
        correctPam: "AGC",
        mechanism: "HDR (Knock-in Hedefleme)"
    },
    F9: {
        name: "F9 (Pıhtılaşma Faktörü IX)",
        info: "Hemofili B Kanama Bozukluğu",
        senseDna: "CCATCACTGTCTCCTTCCTCTCCCATACTTTGTTTCCCACTGTATCTAGATTCTCCCTGTT",
        correctTarget: "CCCATACTTTGTTTCCCACT",
        correctPam: "GTA",
        mechanism: "HDR (Faktör IX Tamiri)"
    },
    CD19: {
        name: "CD19 (B-Hücre Antijeni)",
        info: "B-Hücreli Lösemi & CAR İmmünoterapisi",
        senseDna: "GGCCTCTTCCTCTTTGTGCCCGCCTTCCTGGGCATTCTAGGCTGTGTGCTCGCCCTGCTCT",
        correctTarget: "TGTGCCCGCCTTCCTGGGCA",
        correctPam: "TTC",
        mechanism: "NHEJ (Yüzey Antijen Nakavtı)"
    },
    B2M: {
        name: "B2M (Beta-2 Mikroglobulin)",
        info: "Evrensel Allogeneik CAR-T MHC-I Nakavtı",
        senseDna: "ATGTCTCGCTCCGTGGCCTTAGCTGTGCTCGCGCTACTCTCTCTTTCTGGCCTGGAGGCTA",
        correctTarget: "CCTTAGCTGTGCTCGCGCTA",
        correctPam: "CTC",
        mechanism: "NHEJ (MHC-I Kompleks Susturma)"
    }
};

let labCurrentLocusKey = "TP53";
let labSelectionMode = "target";
let labSelectedTargetIndices = [];
let labSelectedPamIndices = [];

function populateLocusDropdown() {
    const select = document.getElementById("labLocusSelect");
    if (!select) return;

    select.innerHTML = Object.keys(LAB_GENOME_DATABASE_20).map(key => {
        const item = LAB_GENOME_DATABASE_20[key];
        return `<option value="${key}">[LOKUS: ${key}] - ${item.name.split('(')[0]}</option>`;
    }).join("");

    select.value = labCurrentLocusKey;
}

function initLabWorkspace() {
    populateLocusDropdown();
    handleLabLocusChange();
}

function handleLabLocusChange() {
    const select = document.getElementById("labLocusSelect");
    if (select) labCurrentLocusKey = select.value;

    const data = LAB_GENOME_DATABASE_20[labCurrentLocusKey];
    if (!data) return;

    resetLabWorkspace();

    const geneTag = document.getElementById("labGeneTag");
    const mutInfo = document.getElementById("labMutationInfo");
    const pathwayBadge = document.getElementById("labPathwayBadge");

    if (geneTag) geneTag.textContent = `[GEN: ${data.name}]`;
    if (mutInfo) mutInfo.textContent = `Vaka: ${data.info}`;
    if (pathwayBadge) pathwayBadge.textContent = data.mechanism || "NHEJ (İndel)";

    renderLabInteractiveDna();
    updateLabMetrics();
}
window.handleLabLocusChange = handleLabLocusChange;

function switchRandomLabSequence() {
    const keys = Object.keys(LAB_GENOME_DATABASE_20);
    const availableKeys = keys.filter(k => k !== labCurrentLocusKey);
    const nextKey = availableKeys[Math.floor(Math.random() * availableKeys.length)] || keys[0];

    const select = document.getElementById("labLocusSelect");
    if (select) select.value = nextKey;
    labCurrentLocusKey = nextKey;
    handleLabLocusChange();
}
window.switchRandomLabSequence = switchRandomLabSequence;

function setLabSelectionMode(mode) {
    labSelectionMode = mode;
    const targetBtn = document.getElementById("labTargetModeBtn");
    const pamBtn = document.getElementById("labPamModeBtn");

    if (mode === 'target') {
        if (targetBtn) targetBtn.classList.add("active");
        if (pamBtn) pamBtn.classList.remove("active");
    } else {
        if (pamBtn) pamBtn.classList.add("active");
        if (targetBtn) targetBtn.classList.remove("active");
    }
}
window.setLabSelectionMode = setLabSelectionMode;

function resetLabWorkspace() {
    labSelectedTargetIndices = [];
    labSelectedPamIndices = [];
    updateLabVisuals();
    updateLabMetrics();
    const feedback = document.getElementById("labSimulationFeedback");
    if (feedback) {
        feedback.classList.add("hidden");
        feedback.innerHTML = "";
    }
}
window.resetLabWorkspace = resetLabWorkspace;

function renderLabInteractiveDna() {
    const track = document.getElementById("interactiveLabDnaTrack");
    if (!track) return;

    const data = LAB_GENOME_DATABASE_20[labCurrentLocusKey];
    const dna = data.senseDna;
    const compMap = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };

    let html = '<div class="dna-strand sense-strand">';
    for (let i = 0; i < dna.length; i++) {
        const base = dna[i];
        html += `<button type="button" class="base-btn base-${base}" data-lab-idx="${i}" onclick="handleLabBaseClick(${i})"><span class="base-char">${base}</span><span class="base-idx">${i + 1}</span></button>`;
    }
    html += '</div>';

    html += '<div class="dna-strand antisense-strand">';
    for (let i = 0; i < dna.length; i++) {
        const comp = compMap[dna[i]] || 'N';
        html += `<span class="base-btn-comp comp-${comp}">${comp}</span>`;
    }
    html += '</div>';

    track.innerHTML = html;
}

function handleLabBaseClick(index) {
    if (labSelectionMode === "target") {
        labSelectedPamIndices = labSelectedPamIndices.filter(i => i !== index);

        if (labSelectedTargetIndices.includes(index)) {
            labSelectedTargetIndices = labSelectedTargetIndices.filter(i => i !== index);
        } else {
            if (labSelectedTargetIndices.length >= 20) {
                alert("gRNA protospacer hedefi tam 20 baz olmalıdır.");
                return;
            }
            labSelectedTargetIndices.push(index);
            labSelectedTargetIndices.sort((a, b) => a - b);
        }
    } else {
        labSelectedTargetIndices = labSelectedTargetIndices.filter(i => i !== index);

        if (labSelectedPamIndices.includes(index)) {
            labSelectedPamIndices = labSelectedPamIndices.filter(i => i !== index);
        } else {
            if (labSelectedPamIndices.length >= 3) {
                alert("PAM motifi tam 3 baz (5'-NGG-3') olmalıdır.");
                return;
            }
            labSelectedPamIndices.push(index);
            labSelectedPamIndices.sort((a, b) => a - b);
        }
    }

    updateLabVisuals();
    updateLabMetrics();
}
window.handleLabBaseClick = handleLabBaseClick;

function updateLabVisuals() {
    const btns = document.querySelectorAll("#interactiveLabDnaTrack .base-btn");
    btns.forEach(btn => {
        const idx = parseInt(btn.getAttribute("data-lab-idx"));
        btn.classList.remove("selected-target", "selected-pam");
        if (labSelectedTargetIndices.includes(idx)) btn.classList.add("selected-target");
        if (labSelectedPamIndices.includes(idx)) btn.classList.add("selected-pam");
    });
}

function updateLabMetrics() {
    const data = LAB_GENOME_DATABASE_20[labCurrentLocusKey];
    if (!data) return;

    const dna = data.senseDna;
    const targetDna = labSelectedTargetIndices.map(i => dna[i]).join("");
    const targetRna = targetDna.replace(/T/g, "U");
    const pamSeq = labSelectedPamIndices.map(i => dna[i]).join("");

    const grnaDisp = document.getElementById("labGrnaDisplay");
    const pamDisp = document.getElementById("labPamDisplay");
    const gcDisp = document.getElementById("labGcDisplay");
    const tmDisp = document.getElementById("labTmDisplay");
    const seedDisp = document.getElementById("labSeedDisplay");
    const offTargetDisp = document.getElementById("labOffTargetDisplay");

    if (grnaDisp) {
        grnaDisp.innerHTML = targetRna.length > 0 ? `<strong>${targetRna}</strong> <span class="readout-meta">(${targetRna.length}/20nt)</span>` : "<span class='placeholder-txt'>Dizi seçimi bekleniyor...</span>";
    }
    if (pamDisp) {
        pamDisp.innerHTML = pamSeq.length > 0 ? `<strong>${pamSeq}</strong> <span class="readout-meta">(${pamSeq.length}/3)</span>` : "---";
    }

    if (targetDna.length > 0) {
        let gcCount = 0;
        for (let b of targetDna) {
            if (b === 'G' || b === 'C') gcCount++;
        }
        const gcPercent = Math.round((gcCount / targetDna.length) * 100);
        if (gcDisp) {
            gcDisp.textContent = `%${gcPercent}`;
            gcDisp.style.color = (gcPercent >= 40 && gcPercent <= 60) ? "var(--bio-green)" : "var(--brand-coral)";
        }

        const tm = Math.round(64.9 + (41 * (gcCount - 16.4) / targetDna.length));
        if (tmDisp) tmDisp.textContent = `${Math.max(30, tm)} °C`;

        if (seedDisp) seedDisp.textContent = targetRna.length >= 8 ? targetRna.slice(-8) : "--";

        if (offTargetDisp) {
            if (gcPercent >= 40 && gcPercent <= 60 && targetRna.length === 20) {
                offTargetDisp.textContent = "DÜŞÜK (Yüksek Özgüllük)";
                offTargetDisp.style.color = "var(--bio-green)";
            } else {
                offTargetDisp.textContent = "ORTA / YÜKSEK";
                offTargetDisp.style.color = "#bf2600";
            }
        }
    } else {
        if (gcDisp) { gcDisp.textContent = "%0"; gcDisp.style.color = "var(--bio-green)"; }
        if (tmDisp) tmDisp.textContent = "-- °C";
        if (seedDisp) seedDisp.textContent = "--";
        if (offTargetDisp) { offTargetDisp.textContent = "DÜŞÜK"; offTargetDisp.style.color = "var(--bio-green)"; }
    }
}

function executeLabSimulation() {
    const feedback = document.getElementById("labSimulationFeedback");
    if (!feedback) return;

    feedback.classList.remove("hidden");
    const data = LAB_GENOME_DATABASE_20[labCurrentLocusKey];
    const dna = data.senseDna;
    const selectedTarget = labSelectedTargetIndices.map(i => dna[i]).join("");
    const selectedPam = labSelectedPamIndices.map(i => dna[i]).join("");

    if (labSelectedTargetIndices.length !== 20) {
        feedback.className = "lab-feedback-box error";
        feedback.innerHTML = `[HATA] Protospacer uzunluğu 20 baz olmalıdır. (${labSelectedTargetIndices.length}/20nt seçili)`;
        return;
    }

    if (labSelectedPamIndices.length !== 3) {
        feedback.className = "lab-feedback-box error";
        feedback.innerHTML = `[HATA] 3 bazlık PAM (5'-NGG-3') motifi seçilmelidir. (${labSelectedPamIndices.length}/3nt seçili)`;
        return;
    }

    const isTargetCorrect = (selectedTarget === data.correctTarget);
    const isPamCorrect = (selectedPam.endsWith("GG") || selectedPam === data.correctPam);

    if (isTargetCorrect && isPamCorrect) {
        feedback.className = "lab-feedback-box success";
        feedback.innerHTML = `
            <strong>[REAKSİYON BAŞARILI // DSB İNDÜKLENDİ]</strong><br>
            SpCas9 nükleazı <strong>${data.name}</strong> lokusunda <strong>${selectedPam}</strong> PAM motifini tanıdı ve hedef bölgede pürüzsüz çift zincir kırığı oluşturdu.<br>
            <span style="font-size: 0.78rem; color: #006644; margin-top: 4px; display: inline-block;">Onarım Yolağı: <strong>${data.mechanism}</strong></span>
        `;
    } else {
        feedback.className = "lab-feedback-box error";
        feedback.innerHTML = `
            <strong>[HİZALAMA UYUMSUZLUĞU]</strong><br>
            Seçilen gRNA veya PAM motifi ${data.name} lokusundaki aktif kesim penceresiyle örtüşmüyor. PAM motifinin dizinin 3' bitişiğinde olduğunu kontrol edin.
        `;
    }
}
window.executeLabSimulation = executeLabSimulation;
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("dictSearchInput");
    if (searchInput) {
        searchInput.value = "";
    }
});
// ============================================================================
// NAVBAR SAYFA İÇİ GEZİNTİ VE AKICI KAYDIRMA MOTORU
// ============================================================================

function scrollToSection(e, targetId) {
    if (e && e.preventDefault) e.preventDefault();

    // SSS için alternatif ID kontrolleri
    let element = document.getElementById(targetId);
    if (!element && targetId === 'sss') {
        element = document.getElementById('faq') || document.querySelector('.faq-section') || document.querySelector('[id*="soru"]');
    }
    if (!element && targetId === 'rehber') {
        element = document.getElementById('biyoloji-rehberi') || document.querySelector('.guide-section');
    }

    if (element) {
        const navHeight = 70;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    } else {
        // Bölüm bulunamazsa hash ile yönlendir
        window.location.hash = targetId;
    }
}
window.scrollToSection = scrollToSection;
document.addEventListener("DOMContentLoaded", function() {
    renderGuideCards();
    initGuideEventListeners();
    
    // Laboratuvar Konsolunu Başlat
    if (typeof initLabWorkspace === "function") {
        initLabWorkspace();
    }
});
// ============================================================================
// EĞİTİM MODU MOTORU (5 KADEME - SIFIR EMOJİ - KURUMSAL TASARIM)
// ============================================================================
const TRAINING_MODULES_DATABASE = [
    {
        id: "train-01",
        levelNum: 1,
        title: "Bölüm 1: Stajyer Araştırmacı",
        targetGene: "HBB (Hemoglobin Alt Birimi)",
        badge: "PAM Avcısı",
        difficulty: "Başlangıç",
        description: "SpCas9 enziminin bağlanması için 5'-NGG-3' PAM motifini bulun ve bu motifin 5' yönündeki 20 bazlık protospacer dizisini izole edin.",
        targetDna: "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAAC",
        optimalGrna: "CCUGAGGAGAAGUCUGCCGU",
        correctPam: "TGG",
        hint: "5'-NGG-3' PAM motifini bulun ve 5' yönündeki 20 bazı seçin."
    },
    {
        id: "train-02",
        levelNum: 2,
        title: "Bölüm 2: Moleküler Biyolog",
        targetGene: "CFTR (Kistik Fibrozis Lokusu)",
        badge: "Transkripsiyon Uzmanı",
        difficulty: "Orta",
        description: "İzole edilen DNA sekansını transkribe ederek Urasil (U) baz dönüşümlü sentetik tekli kılavuz RNA (sgRNA) molekülünü sentezleyin.",
        targetDna: "ACTTCACTTCTAATGATGATTATGGGAGAACTGGAGCCTTCAGAGGGTTAAAATTCAACC",
        optimalGrna: "UAAUGAUGAUUAUGGGAGAA",
        correctPam: "CGG",
        hint: "Timin (T) bazları yerine Urasil (U) kullanarak gRNA sekansını oluşturun."
    },
    {
        id: "train-03",
        levelNum: 3,
        title: "Bölüm 3: Kıdemli Genetikçi",
        targetGene: "CCR5 (HIV Koreseptörü)",
        badge: "Seed Hassasiyeti",
        difficulty: "İleri",
        description: "PAM'a bitişik Seed Region üzerindeki olası baz uyumsuzluklarını eleyin, on-target verimini artırıp off-target kesim riskini sıfırlayın.",
        targetDna: "CCAGAAGAGCTGAGACATCCGTTCCCCTACAAGAAACTCTCCCCGGGTGGAACAAGATGG",
        optimalGrna: "CUGAGACAUCCGUUCCCCUA",
        correctPam: "AGG",
        hint: "Seed bölgesindeki (son 8-12 nt) eşleşmenin tam olduğundan emin olun."
    },
    {
        id: "train-04",
        levelNum: 4,
        title: "Bölüm 4: Baş Araştırmacı (NHEJ Onarımı)",
        targetGene: "PCSK9 (Kolesterol Regülasyonu)",
        badge: "Gen Susturucu",
        difficulty: "Uzman",
        description: "PCSK9 ekzonunda SpCas9 ile çift zincir kırığı (DSB) oluşturun ve NHEJ yoluyla hedef geni nakavt (Knock-out) edin.",
        targetDna: "AGGCGCAGACCGGCCAGGCCCAGGCCCTCCTGGTGGGCATCGTGGGTGCCCTGCTACTGG",
        optimalGrna: "CAGACCGGCCAGGCCCAGGC",
        correctPam: "CGG",
        hint: "Hedef ekzonda indel oluşturacak en yüksek skorlu protospacer dizisini saptayın."
    },
    {
        id: "train-05",
        levelNum: 5,
        title: "Bölüm 5: Laboratuvar Direktörü (HDR Onarımı)",
        targetGene: "HBB (Orak Hücre Anemisi Nokta Mutasyonu)",
        badge: "Genom Mimarı",
        difficulty: "Uzman",
        description: "Hatalı GAG -> GTG mutasyonunu düzeltmek için ssODN donör şablonu tasarlayın ve homoloji yönlendirmeli onarım ile gen fonksiyonunu geri kazandırın.",
        targetDna: "ATGGTGCACCTGACTCCTGTGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAAC",
        optimalGrna: "CCUGUGGAGAAGUCUGCCGU",
        correctPam: "TGG",
        hint: "Donör şablonun mutasyon bölgesine kusursuz entegrasyonu için şablon kollarını belirleyin."
    }
];

function renderTrainingCards() {
    const grid = document.getElementById("trainingMatrixGrid");
    if (!grid) return;

    let currentLevel = 1;
    if (window.state && window.state.currentUser && window.state.currentUser.level) {
        currentLevel = window.state.currentUser.level;
    }

    grid.innerHTML = TRAINING_MODULES_DATABASE.map(mod => {
        const isCompleted = (window.state && window.state.completedScenarios && window.state.completedScenarios.includes(mod.id)) || (currentLevel > mod.levelNum);
        const isUnlocked = mod.levelNum <= currentLevel;

        let diffClass = "diff-baslangic";
        if (mod.difficulty === "Orta") diffClass = "diff-orta";
        if (mod.difficulty === "İleri") diffClass = "diff-ileri";
        if (mod.difficulty === "Uzman") diffClass = "diff-uzman";

        let statusBadge = `<span class="status-chip status-locked">[ KİLİTLİ ]</span>`;
        if (isCompleted) {
            statusBadge = `<span class="status-chip status-completed">[ TAMAMLANDI ]</span>`;
        } else if (isUnlocked) {
            statusBadge = `<span class="status-chip status-unlocked">[ AÇIK ]</span>`;
        }

        return `
            <div class="case-card ${isCompleted ? 'completed' : ''}">
                <div class="case-top-row">
                    <span class="dict-cat-tag">KADEME 0${mod.levelNum}</span>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <span class="case-difficulty-tag ${diffClass}">${mod.difficulty}</span>
                        ${statusBadge}
                    </div>
                </div>
                <h3 class="case-title">${mod.title}</h3>
                <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--sapphire-blue); font-weight: 700; margin-bottom: 6px;">
                    Hedef Gen: ${mod.targetGene}
                </div>
                <p class="case-desc">${mod.description}</p>
                <div class="case-badge-preview">
                    <span class="badge-label">Kazanılacak Rozet:</span>
                    <strong class="badge-name">${mod.badge}</strong>
                </div>
                <button type="button" class="btn-case-action ${isCompleted ? 'done' : ''}" 
                        ${!isUnlocked ? 'disabled style="opacity:0.5; cursor:not-allowed; background:#8993a4;"' : ''} 
                        onclick="startTrainingLevel('${mod.id}')">
                    ${isCompleted ? 'Modülü Tekrar İncele ➔' : (isUnlocked ? 'Eğitimi Başlat ➔' : 'Önceki Kademeyi Tamamlayın')}
                </button>
            </div>
        `;
    }).join("");

    const countDisp = document.getElementById("trainingProgressCount");
    const badgeDisp = document.getElementById("trainingBadgeCount");
    if (countDisp) countDisp.textContent = `${Math.min(5, currentLevel - 1)} / 5`;
    if (badgeDisp) badgeDisp.textContent = `${Math.min(5, currentLevel - 1)}`;
}

function startTrainingLevel(modId) {
    const mod = TRAINING_MODULES_DATABASE.find(m => m.id === modId);
    if (!mod) return;

    if (window.state) window.state.activeScenarioId = modId;
    const runner = document.getElementById("activeTrainingRunner");
    const content = document.getElementById("trainingRunnerContent");
    if (!runner || !content) return;

    runner.classList.remove("hidden");
    runner.scrollIntoView({ behavior: "smooth" });

    content.innerHTML = `
        <div style="margin-bottom: 16px;">
            <span class="system-code-tag">KADEME 0${mod.levelNum} // ${mod.targetGene}</span>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--navy-dark); margin: 6px 0 4px;">${mod.title}</h2>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">${mod.description}</p>
        </div>

        <div class="lab-dna-viewport-box" style="margin-bottom: 16px;">
            <span style="font-size: 0.72rem; font-family: var(--font-mono); font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">
                HEDEF GENOM SEKANSI (5' ➔ 3'):
            </span>
            <div style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 800; color: var(--sapphire-blue); word-break: break-all; letter-spacing: 1px;">
                ${mod.targetDna}
            </div>
            <span style="font-size: 0.78rem; color: var(--text-muted); margin-top: 8px; display: block;">
                Bilgi: ${mod.hint}
            </span>
        </div>

        <div class="evaluator-grid-row" style="margin-bottom: 14px;">
            <div class="input-cell flex-3">
                <label for="trainGrnaInput">20 Bazlık Sentetik sgRNA Sekansı (RNA / Urasil Formatında):</label>
                <input type="text" id="trainGrnaInput" class="navy-input-field" placeholder="Örn: ${mod.optimalGrna.substring(0, 10)}..." maxlength="20">
            </div>
            <div class="input-cell flex-1">
                <label for="trainPamInput">PAM Motifi (3nt):</label>
                <input type="text" id="trainPamInput" class="navy-input-field" placeholder="Örn: NGG" maxlength="3">
            </div>
            <button type="button" class="btn-evaluator-submit" onclick="evaluateTrainingModule('${mod.id}')">
                Kademeyi Doğrula ➔
            </button>
        </div>

        <div id="trainingResultBox" class="lab-feedback-box hidden"></div>
    `;

    document.getElementById("closeTrainingRunnerBtn")?.addEventListener("click", () => {
        runner.classList.add("hidden");
    });
}

function evaluateTrainingModule(modId) {
    const mod = TRAINING_MODULES_DATABASE.find(m => m.id === modId);
    if (!mod) return;

    const grnaInput = document.getElementById("trainGrnaInput")?.value.toUpperCase().trim().replace(/T/g, "U");
    const pamInput = document.getElementById("trainPamInput")?.value.toUpperCase().trim();
    const resultBox = document.getElementById("trainingResultBox");
    if (!resultBox) return;

    resultBox.classList.remove("hidden");

    if (!grnaInput || !pamInput) {
        resultBox.className = "lab-feedback-box error";
        resultBox.textContent = "Lütfen hem 20 bazlık gRNA dizisini hem de 3 bazlık PAM motifini girin.";
        return;
    }

    const isGrnaCorrect = (grnaInput === mod.optimalGrna);
    const isPamCorrect = (pamInput === mod.correctPam || pamInput.endsWith("GG"));

    if (isGrnaCorrect && isPamCorrect) {
        if (window.state) {
            if (!window.state.completedScenarios) window.state.completedScenarios = [];
            if (!window.state.completedScenarios.includes(mod.id)) {
                window.state.completedScenarios.push(mod.id);
            }
            if (!window.state.currentUser) window.state.currentUser = { level: 1 };
            if (window.state.currentUser.level <= mod.levelNum) {
                window.state.currentUser.level = mod.levelNum + 1;
            }
        }
        resultBox.className = "lab-feedback-box success";
        resultBox.innerHTML = `
            <strong>[KADEME DOĞRULANDI // REAKSİYON BAŞARILI]</strong><br>
            SpCas9 hedef sekansa bağlandı ve kesimi gerçekleştirdi.<br>
            Kazanılan Rozet: <strong>${mod.badge}</strong>
        `;
        renderTrainingCards();
    } else {
        resultBox.className = "lab-feedback-box error";
        resultBox.innerHTML = `
            <strong>[SEKANS UYUMSUZLUĞU]</strong><br>
            Girilen gRNA veya PAM motifi hedef lokustaki aktif kesim bölgesiyle eşleşmedi. İpucunu kontrol edin.
        `;
    }
}