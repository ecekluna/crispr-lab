/* ==========================================================================
   1. FIREBASE COMPAT & EMAILJS CONFIGURATION
   ========================================================================== */
var firebaseConfig = {
  apiKey: "AIzaSyBMounoTqxTCyc1TP5iLmv8nYdyN9KP7nE",
  authDomain: "crispr-lab-a2110.firebaseapp.com",
  projectId: "crispr-lab-a2110",
  storageBucket: "crispr-lab-a2110.firebasestorage.app",
  messagingSenderId: "275247865959",
  appId: "1:275247865959:web:cb25ad6a4178a7932cf4c2",
  measurementId: "G-CB9W19DW7Y"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

var auth = typeof firebase !== 'undefined' ? firebase.auth() : null;
var db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

var emailJsConfig = {
  serviceId: "service_l8xxa6h",
  templateId: "template_uw41cif",
  publicKey: "Lze9S5-w7vthrqFY9"
};

var state = {
    currentUser: null,
    pendingRegistration: null,
    generatedOTP: null,
    guideItemsPerPage: 15,
    guideCurrentVisibleCount: 15,
    activeGuideCategory: 'all',
    guideSearchQuery: ''
};

/* ==========================================================================
   2. 150 KAVRAMLIK DEV BİYOLOJİ & BİYOİNFORMATİK VERİTABANI
   ========================================================================== */
var guideDatabase = [
    // --- DNA & GENOMİK (1-38) ---
    { title: "Adenin (A)", category: "dna", desc: "DNA ve RNA'da bulunan pürin türevi azotlu bir organik bazdır. Timin ile 2'li hidrojen bağı kurar." },
    { title: "Timin (T)", category: "dna", desc: "Sadece DNA'da bulunan pirimidin türevi organik bazdır. Adenin ile 2'li hidrojen bağı oluşturur." },
    { title: "Guanin (G)", category: "dna", desc: "DNA ve RNA'da yer alan pürin türevi bazdır. Sitozin ile 3'lü güçlü hidrojen bağı kurar." },
    { title: "Sitozin (C)", category: "dna", desc: "DNA ve RNA yapısında bulunan pirimidin türevi bazdır. Guanin ile 3'lü bağ yapar." },
    { title: "Urasil (U)", category: "dna", desc: "Sadece RNA'da bulunan ve Timin yerine geçen pirimidin türevi organik bazdır." },
    { title: "Deoksiriboz", category: "dna", desc: "DNA'nın omurgasını oluşturan 5 karbonlu (pentoza ait) şeker molekülüdür." },
    { title: "Riboz", category: "dna", desc: "RNA ve ATP yapısında yer alan 5 karbonlu şeker molekülüdür." },
    { title: "Fosfodiester Bağı", category: "dna", desc: "Nükleotitleri tek bir DNA/RNA zinciri üzerinde birbirine bağlayan kovalent bağ türüdür." },
    { title: "Çift Sarmal (Double Helix)", category: "dna", desc: "DNA'nın anti-paralel iki zincirden oluşan helikal üç boyutlu yapısıdır." },
    { title: "Kodon", category: "dna", desc: "mRNA üzerinde bulunan ve belirli bir amino asidi kodlayan 3'lü nükleotit dizisidir." },
    { title: "Antikodon", category: "dna", desc: "tRNA üzerinde bulunan ve mRNA kodonu ile hidrojen bağı kuran 3'lü nükleotit dizisidir." },
    { title: "Promotör", category: "dna", desc: "Genin anlatımını başlatmak için RNA polimerazın bağlandığı regülatör DNA bölgesidir." },
    { title: "Ekzon", category: "dna", desc: "Sinyal dizilimlerinin ardından proteini kodlayan, olgun mRNA'da korunan gen dizisidir." },
    { title: "İntron", category: "dna", desc: "Protein kodlamayan ve kırpılma (splicing) süreciyle pre-mRNA'dan uzaklaştırılan gen dizisidir." },
    { title: "Kromozom", category: "dna", desc: "DNA'nın histon proteinleri etrafına sarılarak sıkışması sonucu oluşan genetik yapıdır." },
    { title: "Kromatit", category: "dna", desc: "Hücre bölünmesi öncesinde eşlenen bir kromozomun iki özdeş yarısından her biridir." },
    { title: "Kromatin", category: "dna", desc: "Ökaryotik hücre çekirdeğinde bulunan DNA ve protein karmaşık yapısıdır." },
    { title: "Histon", category: "dna", desc: "DNA'nın etrafına sarılarak nükleozomları oluşturduğu alkali (bazik) proteinlerdir." },
    { title: "Nükleozom", category: "dna", desc: "8 adet histon protein grubunun etrafına sarılmış 147 baz çiftlik DNA birimidir." },
    { title: "Telomer", category: "dna", desc: "Ökaryotik kromozomların uçlarında bulunan ve genetik kayıpları önleyen koruyucu tekrarlı dizilerdir." },
    { title: "Telomeraz", category: "dna", desc: "Kromozom uçlarındaki telomer dizilerini uzatarak hücresel yaşlanmayı geciktiren enzimdir." },
    { title: "Sıkı Bağ (Ojenik DNA)", category: "dna", desc: "Genom üzerinde birbiriyle yüksek oranda rekombinasyon göstermeyen gen gruplarıdır." },
    { title: "Epigenetik", category: "dna", desc: "DNA dizisini değiştirmeden gen ifadesinde meydana gelen kalıtsal değişiklikleri inceleyen bilim alanıdır." },
    { title: "DNA Metilasyonu", category: "dna", desc: "Sitozin bazlarına metil grubu eklenerek genlerin susturulmasını sağlayan epigenetik mekanizmadır." },
    { title: "Histon Asetilasyonu", category: "dna", desc: "Histon proteinlerine asetil grubu eklenerek kromatin yapısının gevşetilmesi ve gen ifadesinin artırılmasıdır." },
    { title: "Ökromatin", category: "dna", desc: "Gevşek paketlenmiş, transkripsiyonel olarak aktif kromatin bölgesidir." },
    { title: "Heterokromatin", category: "dna", desc: "Sıkı paketlenmiş ve transkripsiyonel olarak pasif/sessiz kromatin bölgesidir." },
    { title: "Plasmit", category: "dna", desc: "Bakterilerde kromozomal DNA'dan bağımsız çoğalabilen halkasal küçük DNA moleküldür." },
    { title: "Mitoz", category: "dna", desc: "Tek bir hücreden özdeş iki yeni diploid hücre üreten çekirdek bölünmesi türüdür." },
    { title: "Mayoz", category: "dna", desc: "Eşey hücrelerinin oluşumunu sağlayan ve kromozom sayısını yarıya indiren bölünme türüdür." },
    { title: "Replikasyon", category: "dna", desc: "DNA molekülünün hücre bölünmesi öncesinde kendisini birebir kopyalama sürecidir." },
    { title: "Transkripsiyon", category: "dna", desc: "DNA kalıbı üzerinden messenger RNA (mRNA) sentezlenmesi sürecidir." },
    { title: "Translasiyon", category: "dna", desc: "mRNA'daki kodon bilgilerinin ribozomda amino asit zincirine (proteine) dönüştürülmesidir." },
    { title: "Okazaki Fragmanları", category: "dna", desc: "DNA replikasyonunda kesintili zincir üzerinde sentezlenen kısa DNA parçalarıdır." },
    { title: "DNA Polimeraz", category: "dna", desc: "Yeni DNA zincirini 5' ila 3' yönünde sentezleyen ana kopyalama enzimdir." },
    { title: "RNA Polimeraz", category: "dna", desc: "DNA kalıbını okuyarak RNA molekülü sentezleyen enzimdir." },
    { title: "Helikaz", category: "dna", desc: "Replikasyon sırasında DNA çift sarmalını hidrojen bağlarını kırarak açan enzimdir." },
    { title: "Ligaz", category: "dna", desc: "DNA parçalarını (örneğin Okazaki fragmanlarını) fosfodiester bağı kurarak birleştiren enzimdir." },

    // --- CRISPR & CAS SİSTEMLERİ (39-75) ---
    { title: "CRISPR", category: "crispr", desc: "Clustered Regularly Interspaced Short Palindromic Repeats; bakteriyel bağışıklık ve genom düzenleme sistemidir." },
    { title: "Cas9 Enzimi", category: "crispr", desc: "gRNA rehberliğinde çift zincirli DNA'yı belirlenen koordinatta kesen endonükleaz enzimdir." },
    { title: "sgRNA (Single Guide RNA)", category: "crispr", desc: "crRNA ve tracrRNA'nın birleştirilmesiyle oluşturulan sentetik tekli rehber RNA molekülüdür." },
    { title: "crRNA (CRISPR RNA)", category: "crispr", desc: "Hedef DNA dizisine tamamlayıcı olan 20 bazlık arayıcı (spacer) diziyi içeren RNA'dır." },
    { title: "tracrRNA", category: "crispr", desc: "crRNA'nın Cas9 enzimi ile kompleks oluşturmasını sağlayan yapısal trans-aktive edici RNA'dır." },
    { title: "PAM Dizilimi (NGG)", category: "crispr", desc: "Cas9'un hedefi tanıması için kesim bölgesinin hemen yanında bulunması zorunlu 2-6 bazlık motiftir." },
    { title: "Seed Region (Tohum Bölgesi)", category: "crispr", desc: "gRNA'nın PAM'a yakın 8-12 bazlık kısmıdır; hedef tanımada sıfır hataya tolerans gösterir." },
    { title: "Off-Target Etki", category: "crispr", desc: "gRNA'nın hedeflenen gen dışında benzer farklı bir bölgeye bağlanarak istenmeyen kesim yapmasıdır." },
    { title: "On-Target Etki", category: "crispr", desc: "Cas9 enziminin tam hedeflenen gen koordinatında kesim yapma başarısı ve verimliliğidir." },
    { title: "Cas12a (Cpf1)", category: "crispr", desc: "Zengin AT içeren TTTV PAM bölgelerini tanıyan ve yapışkan uçlu kesim yapan CRISPR enzimdir." },
    { title: "Cas13", category: "crispr", desc: "DNA yerine doğrudan RNA moleküllerini hedefleyip kesen ve virüs tespitinde kullanılan CRISPR proteinidir." },
    { title: "Base Editing (Baz Düzenleme)", category: "crispr", desc: "Çift zincir kırığı (DSB) yapmadan tek bir C->T veya A->G nükleotit dönüşümünü sağlayan tekniktir." },
    { title: "Prime Editing", category: "crispr", desc: "Revers transkriptaz birleştirilmiş Cas9 ile şablon kullanmadan ekleme/çıkarma yapabilen ileri teknik." },
    { title: "dCas9 (Dead Cas9)", category: "crispr", desc: "Katalitik kesim yeteneği kütleştirilmiş, yalnızca hedefe bağlanma fonksiyonu olan modifiye Cas9." },
    { title: "CRISPRa (Aktivasyon)", category: "crispr", desc: "dCas9 proteinine transkripsiyonel aktivatör bağlanarak hedef genin anlatımının artırılmasıdır." },
    { title: "CRISPRi (İnhibisyon)", category: "crispr", desc: "dCas9 yardımıyla RNA polimerazın engellenerek hedef genin susturulması (represyonu) işlemidir." },
    { title: "Protospacer", category: "crispr", desc: "Hedef DNA üzerinde gRNA'nın eşleştiği ve kesimin gerçekleştiği özel dizilimdir." },
    { title: "Anti-CRISPR Proteinleri", category: "crispr", desc: "Bakteriyofajların bakteriyel CRISPR bağışıklığını etkisiz hale getirmek için ürettiği inhibitörler." },
    { title: "Electroporation", category: "crispr", desc: "Elektrik alanı uygulayarak hücre zarında geçici gözenekler açıp Cas9/gRNA kompleksini içeri alma yöntemi." },
    { title: "Lipofeksiyon", category: "crispr", desc: "Lipit vezikülleri (lipozomlar) kullanarak genetik materyali hücre içine aktarma tekniği." },
    { title: "AAV (Adeno-Associated Virus)", category: "crispr", desc: "CRISPR bileşenlerini canlı organizmaya (in vivo) taşımada yaygın kullanılan zararsız viral vektör." },
    { title: "RNP (Ribonükleoprotein)", category: "crispr", desc: "Cas9 proteini ile gRNA'nın hücre dışı ortamda önceden birleştirilmiş aktif kompleks halidir." },
    { title: "Cas9 Nickase (nCas9)", category: "crispr", desc: "Çift zincir yerine DNA'nın yalnızca tek bir zincirinde çentik (nick) açan mutant Cas9 varyantı." },
    { title: "SpCas9", category: "crispr", desc: "Streptococcus pyogenes bakterisinden izole edilen ve en yaygın kullanılan standart Cas9 türüdür." },
    { title: "SaCas9", category: "crispr", desc: "Staphylococcus aureus kökenli, viral vektör paketlemelerine uygun daha küçük boyutlu Cas9 varyantı." },
    { title: "Multiplex CRISPR", category: "crispr", desc: "Birden fazla gRNA kullanılarak aynı anda çok sayıda genin eş zamanlı düzenlenmesi işlemidir." },
    { title: "Gene Drive (Gen Sürücüsü)", category: "crispr", desc: "Düzenlenmiş bir genin popülasyon içinde doğal kalıtım kurallarını aşarak %100 oranında yayılması tekniğidir." },
    { title: "Off-Target Puanlama", category: "crispr", desc: "Tasarlanan gRNA'nın genom genelinde olası hatalı bağlanma riskini hesaplayan algoritma puanı." },
    { title: "Spacer Dizisi", category: "crispr", desc: "Bakterinin daha önce karşılaştığı virüslerden alıp CRISPR lokusuna kaydettiği hafıza dizileri." },
    { title: "CRISPR Lokusu", category: "crispr", desc: "Bakteri genomunda tekrarlanan diziler ve arayıcı virüs genlerinin bulunduğu özel bölge." },
    { title: "Cas Operonu", category: "crispr", desc: "CRISPR dizilimlerinin hemen yanında bulunan ve Cas proteinlerini kodlayan gen kümesi." },
    { title: "PAM-less CRISPR", category: "crispr", desc: "Mühendislik ile geliştirilmiş, PAM bağımlılığı neredeyse kaldırılmış esnek Cas varyantları." },
    { title: "Sherlock (Teşhis)", category: "crispr", desc: "Cas13 tabanlı, viral RNA ve virüs varlığını dakikalar içinde tespit eden tanı kiti platformu." },
    { title: "Detector (Teşhis)", category: "crispr", desc: "Cas12 tabanlı, hassas DNA tespiti yapan moleküler tanı ve test teknolojisi." },
    { title: "CAR-T & CRISPR", category: "crispr", desc: "T-hücrelerinin CRISPR ile genetik olarak yeniden programlanıp kansere karşı savaştırılması." },
    { title: "Knock-out", category: "crispr", desc: "Genom üzerindeki bir genin fonksiyonunun kesim ve mutasyon ile tamamen devre dışı bırakılması." },
    { title: "Knock-in", category: "crispr", desc: "Kesim bölgesine kalıp DNA yardımıyla fonksiyonel yeni bir gen veya dizilimin entegre edilmesi." },

    // --- ONARIM & HÜCRESEL MEKANİZMALAR (76-112) ---
    { title: "NHEJ (Homolog Olmayan Uç Birleştirme)", category: "repair", desc: "Çift zincir kırıklarında hücrenin hızlı ama hataya açık olarak gerçekleştirdiği onarım yolu." },
    { title: "HDR (Homoloji Yönlendirmeli Onarım)", category: "repair", desc: "Kalıp bir DNA kullanarak çift zincir kırıklarının kusursuz biçimde onarılması mekanizması." },
    { title: "DSB (Double-Strand Break)", category: "repair", desc: "DNA'nın her iki zincirinde aynı anda meydana gelen tehlikeli çift zincir kırığı." },
    { title: "SSB (Single-Strand Break)", category: "repair", desc: "DNA'nın yalnızca tek bir zincirinde meydana gelen kopma veya çentik durumu." },
    { title: "Indel Mutasyonu", category: "repair", desc: "NHEJ onarımı sırasında oluşan rastgele nükleotit eklenmesi (insertion) veya silinmesi (deletion)." },
    { title: "Frameshift (Kayırma Mutasyonu)", category: "repair", desc: "3 ve katları olmayan indel mutasyonları sonucu okuma çerçevsinin kayarak genin bozulması." },
    { title: "Apoptoz", category: "repair", desc: "Programlanmış hücre ölümü; ağır DNA hasarı alan hücrelerin intihar etme mekanizması." },
    { title: "MNNG Onarımı", category: "repair", desc: "Alkilleyici ajanların neden olduğu nükleotit hasarlarının hücresel enzimatik temizliği." },
    { title: "BER (Baz Eksizyon Onarımı)", category: "repair", desc: "Oksitlenmiş veya hasar görmüş tekil bazların glikozilaz enzimleri ile sökülüp onarılması." },
    { title: "NER (Nükleotit Eksizyon Onarımı)", category: "repair", desc: "UV ışınlarının oluşturduğu timin dimerleri gibi büyük DNA deformasyonlarının kesilip atılması." },
    { title: "MMR (Yanlış Eşleşme Onarımı)", category: "repair", desc: "Replikasyon sırasında gözden kaçan hatalı baz eşleşmelerinin düzeltilmesi mekanizması." },
    { title: "p53 Proteini", category: "repair", desc: "Genomun koruyucusu olarak bilinen, DNA hasarında hücre döngüsünü durduran tümör baskılayıcı." },
    { title: "BRCA1 / BRCA2", category: "repair", desc: "HDR yolunda görev alan ve mutasyonlarında meme/yumurtalık kanseri riskini artıran genler." },
    { title: "Sessiz Mutasyon", category: "repair", desc: "Kodon değişse de aynı amino asit kodlandığı için protein yapısını etkilemeyen mutasyon." },
    { title: "Missense Mutasyon", category: "repair", desc: "Tek baz değişimi sonucu farklı bir amino asitin kodlanmasıyla oluşan mutasyon türü." },
    { title: "Nonsense Mutasyon", category: "repair", desc: "Amino asit kodunun erken durdurma (stop) kodonuna dönüşmesiyle proteinin yarım kalması." },
    { title: "Nükleaz", category: "repair", desc: "Nükleik asitler arasındaki fosfodiester bağlarını hidrolize ederek kıran enzimlerin genel adı." },
    { title: "Endonükleaz", category: "repair", desc: "DNA veya RNA zincirini iç bölgelerinden spesifik olarak kesen enzim sınıfı." },
    { title: "Ekzonükleaz", category: "repair", desc: "DNA veya RNA zincirini yalnızca en uç (5' veya 3') nükleotitlerinden sindiren enzim." },
    { title: "Mikrohümoloji (MMEJ)", category: "repair", desc: "Kısa benzerlik dizilerini kullanarak kırıkları onaran alternatif ve delesyon yapıcı yol." },
    { title: "Ataksi Telenjiektazi (ATM)", category: "repair", desc: "Çift zincir DNA kırıklarını algılayıp hücreye alarm sinyali gönderen kritik kinaz proteini." },
    { title: "RAD51", category: "repair", desc: "Homolog rekombinasyon (HDR) sürecinde zincir işgalini (strand invasion) yöneten ana protein." },
    { title: "Ku70 / Ku80", category: "repair", desc: "NHEJ onarımında kırık DNA uçlarına ilk bağlanan ve protein kompleksini toplayan heterodimer." },
    { title: "Hücre Döngüsü Fazları", category: "repair", desc: "G1, S (DNA kopyalama), G2 ve M (Bölünme) aşamalarından oluşan hücresel yaşam döngüsü." },
    { title: "G1 Kontrol Noktası", category: "repair", desc: "Hücrenin DNA'sını kopyalamadan önce hasar kontrolü yaptığı ana karar merkezi." },
    { title: "S Fazında HDR", category: "repair", desc: "Kardeş kromatitler mevcut olduğu için HDR onarımının en aktif çalıştığı hücre fazı." },
    { title: "Timin Dimeri", category: "repair", desc: "Güneşin UV ışınları nedeniyle yan yana iki timin bazının kovalent bağlanarak DNA'yı bükmesi." },
    { title: "Oksidatif DNA Hasarı", category: "repair", desc: "Serbest radikallerin (ROS) DNA bazlarına saldırması sonucu oluşan kimyasal bozulmalar." },
    { title: "Karyotip", category: "repair", desc: "Bir hücredeki kromozomların büyüklük ve biçimlerine göre dizilerek haritalandırılması." },
    { title: "Aneuploidi", category: "repair", desc: "Hücrede olması gerekenden eksik veya fazla kromozom bulunması durumu (Örn: Trizomi 21)." },
    { title: "Diploid (2n)", category: "repair", desc: "Biri anneden diğeri babadan gelen iki takım kromozom taşıyan hücresel durum." },
    { title: "Haploid (n)", category: "repair", desc: "Sadece tek bir takım kromozom içeren eşey (sperm/yumurta) hücresi durumu." },
    { title: "Sinyal Yutulması (Transduksiyon)", category: "repair", desc: "Hücre dışı uyarının zar reseptörleri üzerinden çekirdeğe ve genlere iletilmesi süreci." },
    { title: "Saperon (Chaperone)", category: "repair", desc: "Sentezlenen proteinlerin doğru 3 boyutlu katlanmasını sağlayan yardımcı hücresel proteinler." },
    { title: "Ubikitinasyon", category: "repair", desc: "Hasarlı veya görevi biten proteinlerin yıkılması için ubikitin ile etiketlenmesi süreci." },
    { title: "Proteazom", category: "repair", desc: "Etiketlenmiş hatalı proteinleri parçalayarak geri dönüştüren dev hücresel kompleks." },
    { title: "Otofaji", category: "repair", desc: "Hücrenin kendi yaşlanmış organellerini ve yapısını sindirerek yenileme mekanizması." },

    // --- BİYOİNFORMATİK (113-150) ---
    { title: "BLAST", category: "bioinfo", desc: "Basic Local Alignment Search Tool; DNA veya protein dizilerini veri tabanıyla kıyaslama aracı." },
    { title: "FASTA Formatı", category: "bioinfo", desc: "Nükleotit veya amino asit dizilerini ' > ' simgesiyle başlayan başlıkla saklayan standart metin." },
    { title: "FASTQ Formatı", category: "bioinfo", desc: "Dizileme cihazlarından çıkan, her nükleotit için kalite puanı (Phred score) içeren veri formatı." },
    { title: "SANGER Dizileme", category: "bioinfo", desc: "Zincir sonlandıran dideoksinükleotitler (ddNTP) kullanılan klasik ve hassas DNA dizileme." },
    { title: "NGS (Yeni Nesil Dizileme)", category: "bioinfo", desc: "Milyonlarca DNA reaksiyonunu paralel olarak okuyabilen yüksek kapasiteli dizileme teknolojisi." },
    { title: "Phred Kalite Puanı", category: "bioinfo", desc: "Dizileme sırasında okunan bir bazın hatalı olma olasılığını gösteren logaritmik skordur." },
    { title: "Alignment (Hizalama)", category: "bioinfo", desc: "Benzerlik veya evrimsel bağları bulmak için dizileri üst üste çakıştırma işlemi." },
    { title: "Multiple Sequence Alignment (MSA)", category: "bioinfo", desc: "İkiden fazla biyolojik dizinin ClustalW veya MUSCLE gibi araçlarla hizalanması." },
    { title: "Phylogenetic Tree (Filogenetik Ağaç)", category: "bioinfo", desc: "Canlılar veya genler arasındaki evrimsel akrabalık ilişkilerini gösteren ağaç şeması." },
    { title: "PDB (Protein Data Bank)", category: "bioinfo", desc: "Proteinlerin 3 boyutlu deneysel (X-Ray, Cryo-EM) atomik yapılarını barındıran küresel banka." },
    { title: "NCBI", category: "bioinfo", desc: "Biyoteknoloji bilgilerini ve GenBank veritabanını barındıran ulusal biyoinformatik merkezi." },
    { title: "GenBank", category: "bioinfo", desc: "Halka açık, dünyadaki tüm bilinen genetik dizilimlerin toplandığı ana veri deposu." },
    { title: "Entrez", category: "bioinfo", desc: "NCBI üzerindeki gen, protein, tıp ve literatür verilerini sorgulayan arama motoru." },
    { title: "AlphaFold", category: "bioinfo", desc: "DeepMind tarafından geliştirilen ve proteinlerin 3D yapısını yapay zeka ile tahmin eden model." },
    { title: "UniProt", category: "bioinfo", desc: "Protein dizileri ve fonksiyonel anotasyonlar için hazırlanmış kapsamlı küresel veritabanı." },
    { title: "ORF (Open Reading Frame)", category: "bioinfo", desc: "Başlangıç kodonu ile durdurma kodonu arasında kalan ve protein kodlama potansiyeli olan dizi." },
    { title: "K-mer", category: "bioinfo", desc: "Biyolojik bir diziden elde edilen k uzunluğundaki tüm olası alt dizilim parçacıkları." },
    { title: "Genome Assembly (Genom Montajı)", category: "bioinfo", desc: "NGS'ten çıkan milyonlarca kısa okumayı (reads) çakıştırarak tüm genomu oluşturma." },
    { title: "Contig", category: "bioinfo", desc: "Genom montajı sırasında kısa okumaların çakıştırılmasıyla elde edilen kesintisiz uzun DNA bloğu." },
    { title: "Coverage (Kapsama/Derinlik)", category: "bioinfo", desc: "Genom üzerindeki bir nükleotidin ortalama kaç defa dizilendiğini gösteren katsayı (Örn: 30x)." },
    { title: "Annotation (Anotasyon)", category: "bioinfo", desc: "Ham DNA dizisi üzerindeki genlerin, promotörlerin ve fonksiyonel yapıların işaretlenmesi." },
    { title: "SNP (Single Nucleotide Polymorphism)", category: "bioinfo", desc: "Popülasyonda %1'den yüksek oranda görülen tek bir nükleotitlik varyasyon veya farklılık." },
    { title: "VCF (Variant Call Format)", category: "bioinfo", desc: "Genom dizileme sonucunda tespit edilen genetik mutasyon ve SNP'lerin saklandığı dosya formatı." },
    { title: "BAM / SAM Formatı", category: "bioinfo", desc: "Dizileme okumalarının referans genoma hizalanma koordinatlarını tutan ikili/metin dosyaları." },
    { title: "Biyoinformatik Boru Hattı (Pipeline)", category: "bioinfo", desc: "Ham veriyi alıp analiz ederek sonuç üreten ardışık yazılım ve komut dizileri bütünü." },
    { title: "R ve Bioconductor", category: "bioinfo", desc: "Genomik verilerin istatistiksel analizi ve görselleştirilmesi için kullanılan açık kaynak platform." },
    { title: "PyMOL", category: "bioinfo", desc: "Protein ve moleküler yapıların 3 boyutlu olarak görüntülenmesini sağlayan görselleştirme aracı." },
    { title: "Molecular Docking (Moleküler Kenetlenme)", category: "bioinfo", desc: "Küçük bir ilaç molekülünün hedef proteine bağlanma oryantasyonunu ve enerjisini simüle etme." },
    { title: "Gene Ontology (GO)", category: "bioinfo", desc: "Genlerin hücresel bileşen, moleküler fonksiyon ve biyolojik süreçlerini standartlaştıran dil." },
    { title: "KEGG Pathway", category: "bioinfo", desc: "Hücresel metabolik yolları ve haritaları görsel olarak sunan veritabanı." },
    { title: "In silico", category: "bioinfo", desc: "Biyolojik deneylerin ıslak laboratuvar yerine bilgisayar ortamında ve simülasyonla yapılması." },
    { title: "In vitro", category: "bioinfo", desc: "Biyolojik süreçlerin canlı organizma dışında, deney tüpü veya petride gerçekleştirilmesi." },
    { title: "In vivo", category: "bioinfo", desc: "Deneylerin ve testlerin doğrudan canlı organizmanın (fare, insan vb.) içinde yapılması." },
    { title: "RNA-Seq", category: "bioinfo", desc: "Hücredeki tüm transkriptom yapısını ve gen anlatım seviyelerini NGS ile kantite etme yöntemi." },
    { title: "Heatmap (Sıcaklık Haritası)", category: "bioinfo", desc: "Binlerce genin anlatım düzeylerini renkli matrisler halinde görselleştiren grafik türü." },
    { title: "Volcano Plot", category: "bioinfo", desc: "Gen anlatım farklarını (fold change) ve istatistiksel anlamlılığı (p-value) gösteren saçılım grafiği." },
    { title: "PCA (Principal Component Analysis)", category: "bioinfo", desc: "Karmaşık çok boyutlu genomik verileri basitleştirerek kümelemeyi sağlayan veri analizi." },
    { title: "PAM Matrix (PAM250)", category: "bioinfo", desc: "Protein hizalamalarında amino asit değişim olasılıklarını puanlayan matris sistemi." }
];

/* ==========================================================================
   3. 10 ÖZEL BİYOLOJİK SENARYO VERİTABANI
   ========================================================================== */
var scenarioDatabase = [
    {
        id: 1,
        title: "Yeşil Floresan Protein (GFP) Susturma",
        bioGoal: "Model bakterideki denizanası kaynaklı Işıltı Genini (GFP) kapatmak.",
        story: "Laboratuvardaki model E. coli bakterileri ortama parlak yeşil bir ışık saçıyor. İlk kontrol görevin, GFP genini hedeflerden birinden keserek hücrelerin ışımasını durdurmak (Knock-out).",
        targetGene: "GFP",
        learningOutcome: "Cas9'un rastgele kesim yapmadığını, mutlaka bir PAM (NGG) motifi aradığını kavrama.",
        badge: "Stajyer Biyolog",
    },
    {
        id: 2,
        title: "Bakteriyel Antibiyotik Direnci Kırma",
        bioGoal: "Süper bakterilerde Ampisilin antibiyotik direncini (bla geni) kırmak.",
        story: "Petri kabındaki bakteriler Beta-laktamaz (bla) enzimi ürettikleri için Ampisilin antibiotiğine dirençli. Genomlarındaki bu direnç bölgesini kesip bakterileri antibiyotiğe duyarlı hale getir.",
        targetGene: "bla (Beta-lactamase)",
        learningOutcome: "CRISPR'ın dirençli bakterilerle (MRSA vb.) mücadeledeki gücünü anlama.",
        badge: "Antibiyotik Avcısı",
    },
    {
        id: 3,
        title: "Meyve Kararmasını Önleme",
        bioGoal: "Elmadaki Polifenol Oksidaz (PPO) genini kapatıp raf ömrünü uzatmak.",
        story: "Dilimlenmiş elmalar oksijenle temas ettiğinde hızla kahverengileşiyor. PPO enzim genini nakavt ederek kararmayan, tazeliğini koruyan elma varyantı geliştir.",
        targetGene: "PPO (Polyphenol Oxidase)",
        learningOutcome: "Tarımsal biyoteknolojide gıda israfını önleme mekanizmaları (Arctic Apple örneği).",
        badge: "Gıda Biyoteknoloğu",
    },
    {
        id: 4,
        title: "Şeffaf Araştırma Modeli (Albinizm)",
        bioGoal: "Zebra balığında Tirosinaz (TYR) genini susturup albino/şeffaf embriyo elde etmek.",
        story: "Gelişimsel biyologların mikroskop altında iç organları net görebilmesi için siyah melanin çizgileri olmayan şeffaf zebra balığı embriyolarına ihtiyacı var. Tirosinaz genini keserek melanin sentezini durdur.",
        targetGene: "TYR (Tyrosinase)",
        learningOutcome: "Model canlılarda fenotipik (dış görünüş) değişim takibi.",
        badge: "Gelişimsel Biyolog",
    },
    {
        id: 5,
        title: "Hiper Kas Gelişimi",
        bioGoal: "Kas gelişimini sınırlandıran Miyostatin (MSTN) genini kapatıp çifte-kas kütlesi elde etmek.",
        story: "Vücutta kas büyümesini frenleyen MSTN genini hedef alıyoruz. Hücresel kültürde bu geni susturarak kas liflerinin hacim kazanmasını ve güçlenmesini sağla.",
        targetGene: "MSTN (Myostatin)",
        learningOutcome: "Hayvancılıkta verimlilik artırma ve kas erimesi (distrofi) hastalıklarındaki tedavi mantığı.",
        badge: "Fizyoloji Araştırmacısı",
    },
    {
        id: 6,
        title: "Acısız Biber Geliştirme",
        bioGoal: "Biberdeki acılık bileşiği Kapsaisin sentezinden sorumlu Pun1 genini nakavt etmek.",
        story: "Gıda endüstrisi, biberin vitamin ve aroma profilini bozmadan acılığını sıfıra indirmek istiyor. Kapsaisin sentez yolundaki Pun1 genini keserek tatlı/acısız biberler elde et.",
        targetGene: "Pun1 (Acılık Geni)",
        learningOutcome: "Bitki ikincil metabolitlerinin (sekonder metabolit) CRISPR ile manipülasyonu.",
        badge: "Tarım Islahçısı",
    },
    {
        id: 7,
        title: "Mavi Gül Islahı",
        bioGoal: "Kırmızı pigment yolunu (DFR geni) kapatıp mavi çiçek varyantına zemin hazırlamak.",
        story: "Güllerde doğal mavi renk oluşmaz. Mavi gül elde etmenin ilk adımı, kırmızı/pembe rengi veren Antosiyanin pigment yolunu (DFR geni) kapatmaktır. Kırmızı pigment genini sustur.",
        targetGene: "DFR (Dihydroflavonol 4-reductase)",
        learningOutcome: "Çiçekçilikte ve süs bitkilerinde metabolik yolak mühendisliği (Metabolic Engineering).",
        badge: "Botanist",
    },
    {
        id: 8,
        title: "Dalında Doğal Kafeinsiz Kahve",
        bioGoal: "Kahve çekirdeğinde kafein üreten CaMXMT genini henüz meyveyken susturmak.",
        story: "Kimyasal çözücülerle kafeinsizleştirilen kahveler aromasını kaybeder. Kahve bitkisinde kafein sentezleyen CaMXMT genini dalında keserek aroması %100 korunan doğal kafeinsiz kahve yetiştir.",
        targetGene: "CaMXMT (N-methyltransferase)",
        learningOutcome: "Kimyasal işlemlere gerek kalmadan doğal ve sağlıklı gıda tasarımı.",
        badge: "Metabolit Mühendisi",
    },
    {
        id: 9,
        title: "Hipoalerjenik Yumurta",
        bioGoal: "Yumurta akındaki ana alerjen protein olan Ovomukoid (OVM) genini devre dışı bırakmak.",
        story: "Yumurta alerjisi olan çocuklar ve aşı üretimi için alerjen içermeyen yumurtalara ihtiyaç var. Yumurta akında ısıya en dayanıklı alerjen olan Ovomukoid protein genini nakavt et.",
        targetGene: "OVM (Ovomucoid)",
        learningOutcome: "Gıda alerjenlerini hücresel düzeyde temizleme ve biyomedikal güvenlik.",
        badge: "Biyomedikal Uzmanı",
    },
    {
        id: 10,
        title: "Kolay Yenebilen Çekirdeksiz Karpuz (Büyük Final)",
        bioGoal: "Karpuz çekirdeğinin sert odunsy kabuk yapmasını sağlayan St4cl genini susturmak.",
        story: "Kolay seviyenin finalinde karpuz çekirdeklerinin dışındaki sertleşmeyi sağlayan lignin/odunlaşma genini (St4cl) kesiyorsun. Böylece çekirdekler ağızda hissedilmeyecek kadar yumuşak kalıyor.",
        targetGene: "St4cl (4-coumarate-CoA ligase)",
        learningOutcome: "Bitkisel dokularda sertlik/lignin oranının ayarlanması ve ürün tüketim kalitesi.",
        badge: "Kıdemli Biyolog",
    }
];

/* ==========================================================================
   4. MODAL AÇMA / KAPAMA FONKSİYONLARI
   ========================================================================== */
function openAuthModal() {
    var modal = document.getElementById("authModal");
    if (modal) modal.classList.add("active");
}

function closeAuthModal() {
    var modal = document.getElementById("authModal");
    if (modal) modal.classList.remove("active");
}

function openProfileModal() {
    var modal = document.getElementById("profileModal");
    if (modal) modal.classList.add("active");
}

function closeProfileModal() {
    var modal = document.getElementById("profileModal");
    if (modal) modal.classList.remove("active");
}

/* ==========================================================================
   5. PROFİL & FOTOĞRAF YÖNETİMİ
   ========================================================================== */
function updateUserInitials(name) {
    var initialsElem = document.getElementById("avatarInitials");
    if (!initialsElem) return;

    if (!name || name.trim() === "") {
        initialsElem.textContent = "CR";
        return;
    }

    var nameParts = name.trim().split(" ");
    if (nameParts.length === 1) {
        initialsElem.textContent = nameParts[0].substring(0, 2).toUpperCase();
    } else {
        initialsElem.textContent = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
}

function setupAvatarUploadEvent() {
    var avatarInput = document.getElementById("avatarInput");
    var avatarPreview = document.getElementById("avatarPreview");
    var avatarInitials = document.getElementById("avatarInitials");
    var removeAvatarBtn = document.getElementById("removeAvatarBtn");

    if (avatarInput) {
        avatarInput.onchange = function(e) {
            var file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert("Fotoğraf boyutu 2MB'den küçük olmalıdır.");
                    return;
                }

                var reader = new FileReader();
                reader.onload = function(event) {
                    var base64Image = event.target.result;
                    
                    if (avatarPreview) {
                        avatarPreview.src = base64Image;
                        avatarPreview.classList.remove("hidden");
                    }
                    if (avatarInitials) avatarInitials.classList.add("hidden");
                    if (removeAvatarBtn) removeAvatarBtn.classList.remove("hidden");

                    if (state.currentUser) {
                        localStorage.setItem("user_avatar_" + state.currentUser.uid, base64Image);
                        updateNavbarUserUI(state.currentUser);
                    }
                };
                reader.readAsDataURL(file);
            }
        };
    }

    if (removeAvatarBtn) {
        removeAvatarBtn.onclick = function() {
            if (avatarPreview) {
                avatarPreview.src = "";
                avatarPreview.classList.add("hidden");
            }
            if (avatarInitials) avatarInitials.classList.remove("hidden");
            if (removeAvatarBtn) removeAvatarBtn.classList.add("hidden");

            if (state.currentUser) {
                localStorage.removeItem("user_avatar_" + state.currentUser.uid);
                updateNavbarUserUI(state.currentUser);
            }
            if (avatarInput) avatarInput.value = "";
        };
    }
}

function updateNavbarUserUI(user) {
    var mainAuthBtn = document.getElementById("mainAuthBtn");
    var navUserChip = document.getElementById("navUserChip");
    var navUserName = document.getElementById("navUserName");
    var navAvatarImg = document.getElementById("navAvatarImg");
    var navAvatarInitials = document.getElementById("navAvatarInitials");

    if (!mainAuthBtn || !navUserChip) return;

    if (user) {
        mainAuthBtn.classList.add("hidden");
        navUserChip.classList.remove("hidden");

        var displayName = user.displayName || "Kullanıcı";
        if (navUserName) navUserName.textContent = displayName;

        var initials = "CR";
        var nameParts = displayName.trim().split(" ");
        if (nameParts.length === 1) {
            initials = nameParts[0].substring(0, 2).toUpperCase();
        } else if (nameParts.length > 1) {
            initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        }

        if (navAvatarInitials) navAvatarInitials.textContent = initials;

        var savedAvatar = localStorage.getItem("user_avatar_" + user.uid) || user.photoURL;

        if (savedAvatar) {
            if (navAvatarImg) {
                navAvatarImg.src = savedAvatar;
                navAvatarImg.classList.remove("hidden");
            }
            if (navAvatarInitials) navAvatarInitials.classList.add("hidden");
        } else {
            if (navAvatarImg) navAvatarImg.classList.add("hidden");
            if (navAvatarInitials) navAvatarInitials.classList.remove("hidden");
        }
    } else {
        mainAuthBtn.classList.remove("hidden");
        navUserChip.classList.add("hidden");
    }
}

/* ==========================================================================
   6. FIREBASE & FIRESTORE AUTHENTICATION
   ========================================================================== */
function setupFirebaseListener() {
    if (!auth) return;

    auth.onAuthStateChanged(function(user) {
        if (user) {
            state.currentUser = user;
            updateNavbarUserUI(user);

            var profileFullName = document.getElementById("profileFullName");
            var profileEmail = document.getElementById("profileEmail");
            var avatarPreview = document.getElementById("avatarPreview");
            var avatarInitials = document.getElementById("avatarInitials");
            var removeAvatarBtn = document.getElementById("removeAvatarBtn");
            
            var displayName = user.displayName || "Kullanıcı";
            if (profileFullName) profileFullName.value = displayName;
            if (profileEmail) profileEmail.value = user.email || "";

            updateUserInitials(displayName);

            var savedAvatar = localStorage.getItem("user_avatar_" + user.uid) || user.photoURL;

            if (savedAvatar) {
                if (avatarPreview) {
                    avatarPreview.src = savedAvatar;
                    avatarPreview.classList.remove("hidden");
                }
                if (avatarInitials) avatarInitials.classList.add("hidden");
                if (removeAvatarBtn) removeAvatarBtn.classList.remove("hidden");
            } else {
                if (avatarPreview) avatarPreview.classList.add("hidden");
                if (avatarInitials) avatarInitials.classList.remove("hidden");
                if (removeAvatarBtn) removeAvatarBtn.classList.add("hidden");
            }

            if (db) {
                db.collection("users").doc(user.uid).get().then(function(docSnap) {
                    if (docSnap.exists) {
                        var data = docSnap.data();
                        if (data.fullName) {
                            if (profileFullName) profileFullName.value = data.fullName;
                            updateUserInitials(data.fullName);
                            updateNavbarUserUI({ uid: user.uid, displayName: data.fullName, photoURL: user.photoURL });
                        }
                    }
                }).catch(function(err) {});
            }
        } else {
            state.currentUser = null;
            updateNavbarUserUI(null);
        }
    });
}

function handleLogin(e) {
    e.preventDefault();
    var email = document.getElementById("loginEmail").value.trim();
    var password = document.getElementById("loginPassword").value;

    if (!auth) {
        alert("Giriş Yapıldı (Demo Modu)!");
        updateUserInitials(email.split('@')[0]);
        closeAuthModal();
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(function() {
            alert("Başarıyla giriş yapıldı.");
            closeAuthModal();
        })
        .catch(function(error) {
            alert("Giriş hatası: " + error.message);
        });
}

function handleRegisterInitiate(e) {
    e.preventDefault();
    var fullName = document.getElementById("fullName").value.trim();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    if (password.length < 6) {
        alert("Şifre en az 6 karakter olmalıdır.");
        return;
    }

    var generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    state.generatedOTP = generatedCode;
    state.pendingRegistration = { fullName: fullName, email: email, password: password };

// EmailJS Şablon Değişkenleri (Panelinizdeki değişken isimleriyle birebir aynı olmalı)
    var templateParams = {
        to_name: fullName,
        to_email: email, // Panelde {{to_email}} yazmalı
        email: email,    // Eğer panelde {{email}} yazdıysanız bu çalışır
        passcode: generatedCode, // Panelde {{passcode}} yazmalı
        code: generatedCode      // Eğer panelde {{code}} yazdıysanız bu çalışır
    };

    console.log("EmailJS Gönderimi Başlatılıyor...", templateParams);

    if (typeof emailjs !== 'undefined') {
        emailjs.send(
            emailJsConfig.serviceId,
            emailJsConfig.templateId,
            templateParams,
            emailJsConfig.publicKey
        ).then(function(response) {
            console.log("EmailJS Başarılı:", response.status, response.text);
            document.getElementById("registerStep").classList.add("hidden");
            document.getElementById("otpStep").classList.remove("hidden");
            document.getElementById("userEmailTarget").textContent = email;
            alert("Doğrulama kodu e-posta adresinize gönderildi! (Spam/İstenmeyen kutusunu kontrol etmeyi unutmayın)");
        }, function(error) {
            console.error("EmailJS Gönderim Hatası Detayı:", error);
            alert("E-posta gönderilemedi! Hata Detayı: " + JSON.stringify(error) + "\n\n(Test Kodunuz: " + generatedCode + ")");
            
            // Hata alsa da devam edebilmen için OTP ekranını açar:
            document.getElementById("registerStep").classList.add("hidden");
            document.getElementById("otpStep").classList.remove("hidden");
            document.getElementById("userEmailTarget").textContent = email;
        });
    } else {
        alert("EmailJS kütüphanesi yüklenemedi! Test Kodunuz: " + generatedCode);
        document.getElementById("registerStep").classList.add("hidden");
        document.getElementById("otpStep").classList.remove("hidden");
        document.getElementById("userEmailTarget").textContent = email;
    }
}

function handleOTPVerification(e) {
    e.preventDefault();
    var enteredOTP = document.getElementById("otpCode").value.trim();

    if (enteredOTP !== state.generatedOTP) {
        alert("Girdiğiniz doğrulama kodu hatalı!");
        return;
    }

    var registration = state.pendingRegistration;

    if (!auth) {
        alert("Kayıt tamamlandı!");
        updateUserInitials(registration.fullName);
        closeAuthModal();
        return;
    }

    auth.createUserWithEmailAndPassword(registration.email, registration.password)
        .then(function(userCredential) {
            var user = userCredential.user;
            user.updateProfile({ displayName: registration.fullName });

            if (db) {
                db.collection("users").doc(user.uid).set({
                    uid: user.uid,
                    fullName: registration.fullName,
                    email: registration.email,
                    createdAt: new Date().toISOString()
                });
            }

            alert("Hesabınız başarıyla oluşturuldu.");
            closeAuthModal();
        })
        .catch(function(error) {
            alert("Kayıt hatası: " + error.message);
        });
}

function handleProfileUpdate(e) {
    e.preventDefault();
    var newFullName = document.getElementById("profileFullName").value.trim();
    var newPassword = document.getElementById("newPassword").value;

    if (!state.currentUser && !auth) {
        updateUserInitials(newFullName);
        alert("Profil bilgileriniz güncellendi.");
        closeProfileModal();
        return;
    }

    var user = state.currentUser;
    if (!user) return;

    user.updateProfile({ displayName: newFullName })
        .then(function() {
            updateUserInitials(newFullName);
            if (db) {
                db.collection("users").doc(user.uid).set({ fullName: newFullName }, { merge: true });
            }

            if (newPassword) {
                if (newPassword.length < 6) {
                    alert("Yeni şifreniz en az 6 karakter olmalıdır.");
                    return;
                }

                user.updatePassword(newPassword).then(function() {
                    alert("Profil bilgileriniz ve şifreniz güncellendi!");
                    document.getElementById("currentPassword").value = "";
                    document.getElementById("newPassword").value = "";
                    closeProfileModal();
                }).catch(function(err) {
                    alert("Şifre güncellenemedi. Lütfen yeniden giriş yapıp deneyin.");
                });
            } else {
                alert("Profil bilgileriniz güncellendi.");
                closeProfileModal();
            }
        })
        .catch(function(err) {
            alert("Güncelleme hatası: " + err.message);
        });
}

function handleLogout() {
    if (auth) {
        auth.signOut();
    }
    state.currentUser = null;
    closeProfileModal();
}

/* ==========================================================================
   7. REHBER KARTLARI & 15'ERLİ YÜKLEME
   ========================================================================== */
function setupGuideSectionEvents() {
    var searchInput = document.getElementById("guideSearchInput");
    var categoryBtns = document.querySelectorAll(".category-tabs .tab-btn");
    var loadMoreBtn = document.getElementById("loadMoreGuideBtn");

    if (searchInput) {
        searchInput.oninput = function(e) {
            state.guideSearchQuery = e.target.value.toLowerCase().trim();
            state.guideCurrentVisibleCount = 15;
            renderGuideCards();
        };
    }

    categoryBtns.forEach(function(btn) {
        btn.onclick = function() {
            categoryBtns.forEach(function(b) { b.classList.remove("active"); });
            btn.classList.add("active");
            state.activeGuideCategory = btn.dataset.category;
            state.guideCurrentVisibleCount = 15;
            renderGuideCards();
        };
    });

    if (loadMoreBtn) {
        loadMoreBtn.onclick = function() {
            state.guideCurrentVisibleCount += state.guideItemsPerPage;
            renderGuideCards();
        };
    }

    renderGuideCards();
}

function renderGuideCards() {
    var grid = document.getElementById("guideCardsGrid");
    var counterBadge = document.getElementById("guideCounterBadge");
    var loadMoreBtn = document.getElementById("loadMoreGuideBtn");
    
    if (!grid) return;

    var filteredItems = guideDatabase.filter(function(item) {
        var matchesCategory = state.activeGuideCategory === 'all' || item.category === state.activeGuideCategory;
        var matchesSearch = item.title.toLowerCase().indexOf(state.guideSearchQuery) !== -1 || 
                              item.desc.toLowerCase().indexOf(state.guideSearchQuery) !== -1;
        return matchesCategory && matchesSearch;
    });

    var itemsToDisplay = filteredItems.slice(0, state.guideCurrentVisibleCount);

    if (itemsToDisplay.length === 0) {
        grid.innerHTML = '<div class="no-results-box">🔍 Aradığınız kriterlere uygun kavram bulunamadı.</div>';
    } else {
        grid.innerHTML = itemsToDisplay.map(function(item) {
            return '<div class="guide-card glass-card-soft">' +
                '<div class="guide-card-header">' +
                    '<span class="guide-category-badge category-' + item.category + '">' + getCategoryLabel(item.category) + '</span>' +
                    '<h3 class="guide-card-title">' + item.title + '</h3>' +
                '</div>' +
                '<p class="guide-card-desc">' + item.desc + '</p>' +
            '</div>';
        }).join('');
    }

    if (counterBadge) {
        counterBadge.textContent = itemsToDisplay.length + " / " + filteredItems.length;
    }

    if (loadMoreBtn) {
        if (itemsToDisplay.length >= filteredItems.length) {
            loadMoreBtn.style.display = "none";
        } else {
            loadMoreBtn.style.display = "inline-flex";
        }
    }
}

function getCategoryLabel(category) {
    var labels = {
        dna: "DNA & Genomik",
        crispr: "CRISPR & Cas",
        repair: "Onarım & Hücre",
        bioinfo: "Biyoinformatik"
    };
    return labels[category] || "Genel";
}

/* ==========================================================================
   8. SSS AKORDEON
   ========================================================================== */
function setupFAQEvents() {
    var faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(function(item) {
        item.ontoggle = function() {
            var icon = item.querySelector(".faq-icon");
            if (icon) icon.textContent = item.open ? "−" : "+";
        };
    });
}

/* ==========================================================================
   9. SENARYO DİNAMİKLERİ & YÜKLEME
   ========================================================================== */
function renderScenarioList() {
    var grid = document.getElementById("scenarioListGrid");
    if (!grid) return;

    grid.innerHTML = scenarioDatabase.map(function(item) {
        return '<div class="scenario-card-item glass-card-soft">' +
            '<div>' +
                '<div class="scenario-header-meta">' +
                    '<span class="scenario-num-badge">Senaryo ' + item.id + '</span>' +
                    '<span class="target-gene-badge">Hedef: ' + item.targetGene + '</span>' +
                '</div>' +
                '<h3 class="scenario-title">' + item.icon + ' ' + item.title + '</h3>' +
                '<p class="scenario-bio-goal"><strong>Amaç:</strong> ' + item.bioGoal + '</p>' +
                '<div class="badge-reward-box">' +
                    '<span>🏆 Rozet:</span>' +
                    '<span>' + item.badge + '</span>' +
                '</div>' +
            '</div>' +
            '<button class="btn-soft-primary full-width scenario-start-btn" data-id="' + item.id + '" type="button">' +
                'Senaryoyu İncele & Başla' +
            '</button>' +
        '</div>';
    }).join('');

    var startBtns = grid.querySelectorAll(".scenario-start-btn");
    startBtns.forEach(function(btn) {
        btn.onclick = function() {
            var id = parseInt(btn.getAttribute("data-id"));
            openScenarioRunner(id);
        };
    });
}

window.openScenarioRunner = function(scenarioId) {
    var scenario = null;
    for (var i = 0; i < scenarioDatabase.length; i++) {
        if (scenarioDatabase[i].id === scenarioId) {
            scenario = scenarioDatabase[i];
            break;
        }
    }

    var runner = document.getElementById("activeScenarioRunner");
    var content = document.getElementById("scenarioRunnerContent");

    if (!scenario || !runner || !content) return;

    content.innerHTML = 
        '<h2>' + scenario.icon + ' ' + scenario.title + '</h2>' +
        '<div class="runner-story-box">' +
            '<strong>📖 Görev Hikayesi:</strong>' +
            '<p>' + scenario.story + '</p>' +
        '</div>' +
        '<div class="runner-meta-grid">' +
            '<div class="runner-meta-item">' +
                '<strong>🎯 Hedef Gen</strong>' +
                '<span>' + scenario.targetGene + '</span>' +
            '</div>' +
            '<div class="runner-meta-item">' +
                '<strong>💡 Kazanılacak Beceri</strong>' +
                '<span>' + scenario.learningOutcome + '</span>' +
            '</div>' +
            '<div class="runner-meta-item">' +
                '<strong>🏅 Ödül Rozet</strong>' +
                '<span>' + scenario.badge + '</span>' +
            '</div>' +
        '</div>' +
        '<div style="margin-top: 24px; text-align: center;">' +
            '<button class="btn-soft-primary" type="button" onclick="alert(\'Lab simülatörü modülümüz yakında aktif edilecektir!\')">' +
                'gRNA Tasarımına ve Kesime Başla 🧬' +
            '</button>' +
        '</div>';

    runner.classList.remove("hidden");
    runner.scrollIntoView({ behavior: "smooth" });
};

/* ==========================================================================
   10. KESİN BAŞLATICI VE NAVBAR BUTONLARI DİREKT ETKİLEŞİM YÖNETİMİ
   ========================================================================== */
function bindGlobalEvents() {
    // 1. Giriş Yap ve Profil Buton Bağlantıları
    var mainAuthBtn = document.getElementById("mainAuthBtn");
    var navUserChip = document.getElementById("navUserChip");
    var closeModalBtn = document.getElementById("closeModalBtn");
    var closeProfileBtn = document.getElementById("closeProfileBtn");

    var switchToRegister = document.getElementById("switchToRegister");
    var switchToLogin = document.getElementById("switchToLogin");

    if (mainAuthBtn) {
        mainAuthBtn.onclick = function(e) {
            if (e) e.preventDefault();
            openAuthModal();
        };
    }

    if (navUserChip) {
        navUserChip.onclick = function(e) {
            if (e) e.preventDefault();
            openProfileModal();
        };
    }

    if (closeModalBtn) closeModalBtn.onclick = closeAuthModal;
    if (closeProfileBtn) closeProfileBtn.onclick = closeProfileModal;

    if (switchToRegister) {
        switchToRegister.onclick = function(e) {
            if (e) e.preventDefault();
            document.getElementById("loginStep").classList.add("hidden");
            document.getElementById("registerStep").classList.remove("hidden");
        };
    }

    if (switchToLogin) {
        switchToLogin.onclick = function(e) {
            if (e) e.preventDefault();
            document.getElementById("registerStep").classList.add("hidden");
            document.getElementById("loginStep").classList.remove("hidden");
        };
    }

    var loginForm = document.getElementById("loginForm");
    var registerForm = document.getElementById("registerForm");
    var otpForm = document.getElementById("otpForm");
    var profileDetailsForm = document.getElementById("profileDetailsForm");
    var logoutBtn = document.getElementById("logoutBtn");

    if (loginForm) loginForm.onsubmit = handleLogin;
    if (registerForm) registerForm.onsubmit = handleRegisterInitiate;
    if (otpForm) otpForm.onsubmit = handleOTPVerification;
    if (profileDetailsForm) profileDetailsForm.onsubmit = handleProfileUpdate;
    if (logoutBtn) logoutBtn.onclick = handleLogout;

    // 2. Senaryo Sekmesi ve Navbar Yönlendirmeleri
    var navScenarioTabBtn = document.getElementById("navScenarioTabBtn");
    var heroScenarioBtn = document.getElementById("heroScenarioBtn");
    var backToMainBtn = document.getElementById("backToMainBtn");
    var mainNavLinks = document.querySelectorAll(".main-page-nav-link");

    var scenarioTabPage = document.getElementById("scenarioTabPage");
    var allSections = document.querySelectorAll("section");

    // Senaryolar Sayfasını Açma
    function openScenarioTab(e) {
        if (e) e.preventDefault();
        
        for (var i = 0; i < allSections.length; i++) {
            allSections[i].style.display = "none";
        }
        
        if (scenarioTabPage) {
            scenarioTabPage.style.display = "block";
            window.scrollTo({ top: 0, behavior: "smooth" });
            renderScenarioList();
        }
    }

    // Ana Sayfadaki Bölümlere Kaydırma (Navbar Linkleri)
    function scrollToMainSection(e) {
        // Eğer Senaryo sekmesindeysek önce ana sayfayı görünür yap
        if (scenarioTabPage && scenarioTabPage.style.display !== "none") {
            scenarioTabPage.style.display = "none";
            for (var i = 0; i < allSections.length; i++) {
                allSections[i].style.display = "block";
            }
        }

        // Tıklanan linkin hedef id'sine yumuşak kaydır
        var targetId = this.getAttribute("href");
        if (targetId && targetId.startsWith("#")) {
            var targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: "smooth" });
            }
        }
    }

    // Öğrenme Modu Butonları
    if (navScenarioTabBtn) navScenarioTabBtn.onclick = openScenarioTab;
    if (heroScenarioBtn) heroScenarioBtn.onclick = openScenarioTab;
    
    // Geri Dön Butonu
    if (backToMainBtn) {
        backToMainBtn.onclick = function(e) {
            if (e) e.preventDefault();
            if (scenarioTabPage) scenarioTabPage.style.display = "none";
            for (var i = 0; i < allSections.length; i++) {
                allSections[i].style.display = "block";
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        };
    }

    // Üst Menüdeki Diğer Linkler (Laboratuvar Modları, Nasıl Çalışır, Rehber, SSS)
    mainNavLinks.forEach(function(link) {
        link.onclick = scrollToMainSection;
    });

    var closeRunnerBtn = document.getElementById("closeScenarioRunnerBtn");
    if (closeRunnerBtn) {
        closeRunnerBtn.onclick = function() {
            var runner = document.getElementById("activeScenarioRunner");
            if (runner) runner.classList.add("hidden");
        };
    }

    // Alt Modül Dinleyicileri
    setupGuideSectionEvents();
    setupFAQEvents();
    setupFirebaseListener();
    setupAvatarUploadEvent();
}

// Yükleme Anında Çift Garanti Çalıştırma
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindGlobalEvents);
} else {
    bindGlobalEvents();
}
window.onload = bindGlobalEvents;