// =====================================================================
//  TEKS & DATA DUNIA IMPIANMU (aman diedit, jaga tanda kutip & koma)
// =====================================================================

export const DAY = 4;
export const STATUS = { gold: 30, warga: 565, rumah: 67 };

export const LINKS = [
  { name: 'YouTube', handle: '@DuniaImpianmu', url: 'https://www.youtube.com/@DuniaImpianmu', color: '#ff3b30', icon: '▶' },
  { name: 'Instagram', handle: '@dunia_impianmu', url: 'https://www.instagram.com/dunia_impianmu/', color: '#d6249f', icon: '◎' },
  { name: 'TikTok', handle: '@dunia_impianmu', url: 'https://www.tiktok.com/@dunia_impianmu', color: '#111111', icon: '♪' },
];

// Info bangunan yang muncul saat didekati & di peta besar: [nama, keterangan]
export const INFO = {
  balai_kota: ['BALAI KOTA', 'Gagal di Day 3 karena kurang 7 Gold, akhirnya berdiri di Day 4 (-150 Gold)'],
  tambang: ['TAMBANG GOLD', 'Permintaan @huda_laper_buk & @lilisrahmawati1838 · langsung memberi bonus 1000 Gold!'],
  markas: ['MARKAS MILITER', 'Permintaan agil k 2 · biar negeri selalu aman'],
  kedai_es: ['KEDAI ES KRIM', 'Tukang es krimnya: PP Ramadhan 2027'],
  minimarket: ['MINIMARKET', 'Gagal di Day 3, akhirnya berdiri di Day 4'],
  hotel: ['HOTEL', 'Dibangun di Day 4 (-200 Gold)'],
  kantor_polisi: ['KANTOR POLISI', 'Dibangun di Day 4 (-180 Gold)'],
  stadion: ['STADION', 'Bangunan termahal Day 4 (-500 Gold)'],
  wisata: ['TEMPAT WISATA', 'Dibangun di Day 4 (-100 Gold)'],
  teknologi: ['PUSAT TEKNOLOGI', 'Teknologi modern negeri (-80 Gold)'],
  sekolah: ['SEKOLAH', 'Permintaan srimursejati & ★◇B0BY_R4NT\'S◇★ (Day 2) · Kepala Sekolah: $Wan$'],
  gudang: ['GUDANG GOLD', 'Kas negeri. Setiap koin tercatat di Papan Kas Negeri'],
  rumah_ucil: ['RUMAH UCIL', 'Rumah pertama di negeri ini (Day 1)'],
  rumah_ucup: ['RUMAH UCUP', 'Gagal di Day 1 karena Gold habis, janji ditepati di Day 2'],
  pos_ronda: ['POS RONDA', 'Permintaan @NafisahUtoi (Day 2) · penjaga malam negeri'],
  rumah_sakit: ['RUMAH SAKIT', 'Permintaan tils_05, yang juga jadi dokternya (Day 2)'],
  pos_damkar: ['POS DAMKAR', 'Day 3 · ada warga yang jadi damkar, dan satu lagi rela jadi mobilnya'],
  warkop: ['WARKOP', 'Permintaan deeeaaaa28 (Day 3)'],
  ladang: ['LADANG', 'Permintaan CAT LOVERSS (Day 3)'],
  ladang2: ['LADANG', 'Permintaan CAT LOVERSS (Day 3)'],
  kolam_lele: ['KOLAM LELE', 'Permintaan darkness (Day 3)'],
};

// =====================================================================
//  DIALOG BERPILIHAN
//  Tiap tokoh: name (nama tampil), panggil (sapaan ke pemain Slime; default "Raja"),
//  start (simpul awal), nodes: { id: { say: 'kalimat tokoh', opts: [['pilihanmu', 'simpul_berikut'], ...] } }
//  - simpul tanpa opts = obrolan selesai
//  - {panggil} diganti otomatis: main Slime -> sapaan tokoh, main Ucil -> "Cil", main Ucup -> "Cup"
//  - '?ikan:A:B' = ke simpul A kalau pemain sudah pernah dapat ikan, kalau belum ke B
//  - fx: 'love' = muncul hati
// =====================================================================
export const DIALOG = {
  slime: { name: 'Slime', panggil: 'Cil', start: 'a', nodes: {
    a: { say: 'Eh, {panggil}! Lagi jalan-jalan keliling negeri?', opts: [['Iya, negerinya makin luas!', 'luas'], ['Bang lagi ngapain?', 'ngapain'], ['Dadah, Bang!', 'bye']] },
    luas: { say: 'Berkat warga semua. Di Day 4 kita bangun 65 rumah dan 11 bangunan baru sekaligus!', opts: [['Gold kita tinggal berapa?', 'gold'], ['Keren, Bang!', 'bye']] },
    gold: { say: 'Tinggal 30. Tapi tenang, satu Like dari penonton itu satu Gold, satu repost sepuluh Gold!', opts: [['Siap, aku bantu ajak!', 'bye']] },
    ngapain: { say: 'Lagi mikir mau bangun apa di episode berikutnya. Kamu ada ide?', opts: [['Taman bermain!', 'ide'], ['Bandara!', 'ide'], ['Belum ada...', 'ide2']] },
    ide: { say: 'Wah, menarik! Tulis di kolom komentar ya, biar Gold-nya dikumpulkan bareng warga.' },
    ide2: { say: 'Gak apa-apa. Kalau nanti dapat ide, tulis di komentar ya!' },
    bye: { say: 'Hati-hati di jalan, {panggil}!' },
  } },
  ucil: { name: 'Ucil', panggil: 'Bang', start: 'a', nodes: {
    a: { say: '{panggil}! Aku lagi ngitung rumah di negeri ini.', opts: [['Udah sampai berapa?', 'hitung'], ['Masih ingat rumah pertamamu?', 'pertama'], ['Dadah, Cil!', 'bye']] },
    hitung: { say: 'Hmm... 40... 41... eh, lupa lagi! Pokoknya banyak banget, {panggil}!', opts: [['Ada 67 rumah, Cil', 'benar'], ['Semangat ngitungnya!', 'bye']] },
    benar: { say: '67?! Dulu cuma rumahku sendirian di sini... sekarang ramai banget!', opts: [['Berkat kamu juga, Cil', 'haru'], ['Dadah!', 'bye']] },
    pertama: { say: 'Ingat dong! Rumah pertama di negeri ini, dibangun waktu Gold kita masih sedikit banget.', opts: [['Sekarang rasanya gimana?', 'haru'], ['Dadah!', 'bye']] },
    haru: { say: 'Hehe... aku jadi terharu, {panggil}. Jangan lupa ajak penonton Like ya!' },
    bye: { say: 'Dadah, {panggil}! Hati-hati!' },
  } },
  ucup: { name: 'Ucup', panggil: 'Bang', start: 'a', nodes: {
    a: { say: '{panggil}! Gold kita banyak banget... eh, sekarang tinggal 30 ya?', opts: [['Iya, habis buat membangun', 'habis'], ['Kok kamu senyum-senyum?', 'senyum'], ['Dadah, Cup!', 'bye']] },
    habis: { say: 'Gak apa-apa! Hasilnya gokil: stadion, hotel, tambang... semuanya jadi!', opts: [['Kamu paling suka yang mana?', 'suka'], ['Dadah!', 'bye']] },
    suka: { say: 'Stadion! Aku mau main bola di sana. Eh, tapi bolanya belum ada...', opts: [['Nanti kita minta ke penonton', 'minta']] },
    minta: { say: 'Setuju! Penonton, tulis di komentar ya: bola buat Ucup!' },
    senyum: { say: 'Aku masih ingat, dulu rumahku gagal dibangun gara-gara Gold habis. Sekarang negeri kita luas banget!', opts: [['Janji tetap ditepati, kan?', 'janji'], ['Dadah!', 'bye']] },
    janji: { say: 'Iya! Janji adalah janji. Makasih ya, {panggil}!' },
    bye: { say: 'Dadah, {panggil}! Gokil!' },
  } },
  wakil: { name: 'Bocil SCP', start: 'a', nodes: {
    a: { say: 'Lapor, {panggil}! Bocil SCP, Wakil Menteri Pembangunan, siap bertugas!', opts: [['Gimana laporan hari ini?', 'lapor'], ['Kamu suka jadi wakil?', 'suka'], ['Lanjutkan tugasmu!', 'bye']] },
    lapor: { say: 'Day 4: 65 rumah gotong royong dan 11 bangunan baru. Sisa Gold 30. Semua tercatat di Papan Kas Negeri!', opts: [['Kerja bagus!', 'bagus'], ['Tidak ada yang dikorupsi, kan?', 'korupsi']] },
    bagus: { say: 'Terima kasih, {panggil}! Target berikutnya saya tunggu dari komentar penonton.' },
    korupsi: { say: 'Tidak ada satu koin pun, {panggil}! Kalau ada yang berani, Papan Kas Negeri bakal bersinar!' },
    suka: { say: 'Suka banget! Dulu saya cuma minta jadi wakil... eh, langsung diangkat. Terima kasih, {panggil}!', opts: [['Sama-sama!', 'bye']] },
    bye: { say: 'Siap, {panggil}!' },
  } },
  pak_rt: { name: 'Pak RT', start: 'a', nodes: {
    a: { say: 'Selamat datang, {panggil}! Ada keperluan apa dengan Pak RT?', opts: [['Mau daftar jadi warga', 'lapor'], ['Pak RT masih pusing?', 'pusing'], ['Cuma mampir, Pak', 'bye']] },
    lapor: { say: 'Gampang! Tinggal Follow, langsung resmi jadi warga negeri ini.', opts: [['Ada lagi, Pak?', 'lagi'], ['Siap, Pak!', 'bye']] },
    lagi: { say: 'Komen juga! Siapa tahu namamu muncul di episode berikutnya, kayak saya dulu.' },
    pusing: { say: 'Hehe, sudah sembuh. Dulu di Day 3 bangunan gagal semua, saya sampai muter-muter...', opts: [['Sekarang semuanya berdiri!', 'senang'], ['Hahaha', 'senang']] },
    senang: { say: 'Betul! Lihat itu, balai kota akhirnya berdiri. Lega rasanya.' },
    bye: { say: 'Mampir lagi ya, {panggil}!' },
  } },
  penambang: { name: 'Penambang', start: 'a', nodes: {
    a: { say: 'Wah, {panggil} datang! Mau lihat Tambang Gold?', opts: [['Gimana bisa dapat 1000 Gold?', 'seribu'], ['Siapa yang minta tambang ini?', 'siapa'], ['Dadah!', 'bye']] },
    seribu: { say: 'Kami juga kaget! Baru dibuka, emasnya langsung berhamburan keluar...', opts: [['Besok dapat berapa?', 'besok'], ['Mantap!', 'bye']] },
    besok: { say: 'Hehe, itu rahasia tambang. Kadang banyak, kadang sedikit. Tunggu episode berikutnya!' },
    siapa: { say: '@huda_laper_buk dan @lilisrahmawati1838! Sudah ditagih sejak Day 1, akhirnya terwujud di Day 4.', opts: [['Terima kasih buat mereka!', 'makasih']] },
    makasih: { say: 'Setuju! Berkat mereka, kas negeri jadi penuh.' },
    bye: { say: 'Hati-hati di jalan, {panggil}! Awas batu jatuh.' },
  } },
  tentara: { name: 'Tentara', start: 'a', nodes: {
    a: { say: 'Hormat, {panggil}! Markas militer siap siaga!', opts: [['Markas ini permintaan siapa?', 'siapa'], ['Kalau bayangan itu datang lagi?', 'boss'], ['Istirahat di tempat!', 'bye']] },
    siapa: { say: 'Permintaan agil k 2, biar negeri kita selalu aman!', opts: [['Bagus!', 'bye']] },
    boss: { say: 'Kami siap! Tapi katanya dia cuma muncul di malam hari... di bukit.', opts: [['Serem juga...', 'serem'], ['Tetap waspada!', 'bye']] },
    serem: { say: 'Tenang, {panggil}. Selama warga bersatu, dia tidak akan menang.' },
    bye: { say: 'Siap, {panggil}!' },
  } },
  tukang_es: { name: 'PP Ramadhan 2027', start: 'a', nodes: {
    a: { say: 'Es krim, es krim! Eh, {panggil}! Mau rasa apa?', opts: [['Cokelat!', 'cokelat'], ['Stroberi!', 'stroberi'], ['Ada rasa Gold?', 'gold']] },
    cokelat: { say: 'Satu es krim cokelat! Manis kayak negeri ini.', opts: [['Kok bisa jadi tukang es krim?', 'kenapa'], ['Makasih!', 'bye']] },
    stroberi: { say: 'Satu es krim stroberi! Segar banget buat siang-siang.', opts: [['Kok bisa jadi tukang es krim?', 'kenapa'], ['Makasih!', 'bye']] },
    gold: { say: 'Hahaha! Rasa Gold belum ada. Kalau ada, kas negeri bisa habis dimakan!', opts: [['Kok bisa jadi tukang es krim?', 'kenapa'], ['Hahaha', 'bye']] },
    kenapa: { say: 'Aku minta di komentar, dan langsung dikabulkan! Sekarang aku tukang es krim resmi negeri ini.' },
    bye: { say: 'Datang lagi ya, {panggil}!' },
  } },
  kepsek: { name: '$Wan$', start: 'a', nodes: {
    a: { say: 'Selamat siang, {panggil}. Saya $Wan$, Kepala Sekolah.', opts: [['Sekolahnya ramai?', 'ramai'], ['Gimana rasanya jadi kepsek?', 'rasa'], ['Permisi, Pak', 'bye']] },
    ramai: { say: 'Ramai sekali! Sekolah ini permintaan srimursejati dan Boby sejak Day 2. Boby bahkan jadi gurunya.', opts: [['Pelajaran favoritnya apa?', 'pelajaran'], ['Keren!', 'bye']] },
    pelajaran: { say: 'Pelajaran kejujuran! Biar tidak ada yang korupsi di negeri ini.' },
    rasa: { say: 'Bangga sekali. Saya minta lewat komentar, dan resmi diangkat di Day 4.', opts: [['Selamat, Pak!', 'bye']] },
    bye: { say: 'Belajar yang rajin ya, {panggil}!' },
  } },
  polisi: { name: 'Polisi', start: 'a', nodes: {
    a: { say: 'Selamat siang, {panggil}! Ada yang bisa dibantu?', opts: [['Negeri aman, Pak?', 'aman'], ['Saya mau lapor!', 'lapor'], ['Tidak, Pak. Permisi', 'bye']] },
    aman: { say: 'Aman terkendali! Kantor polisi baru buka di Day 4.', opts: [['Ada yang pernah ditilang?', 'tilang']] },
    tilang: { say: 'Ada! Warga yang lari-lari di jalan raya. Kamu jangan ya!' },
    lapor: { say: 'Lapor apa?', opts: [['Ada bayangan di bukit!', 'bayangan'], ['Ada kucing tidur di jalan', 'kucing']] },
    bayangan: { say: 'Bayangan bertopi tinggi? Penjaga ronda juga bilang begitu... Kami akan berjaga malam ini.' },
    kucing: { say: 'Hahaha, biarkan saja. Kucing di negeri ini memang suka tidur sembarangan.' },
    bye: { say: 'Hati-hati di jalan!' },
  } },
  turis: { name: 'Turis', start: 'a', nodes: {
    a: { say: 'Halo! Kamu warga sini? Negerimu keren banget!', opts: [['Kamu dari mana?', 'dari'], ['Sudah ke tempat wisata?', 'wisata'], ['Selamat berlibur!', 'bye']] },
    dari: { say: 'Dari jauh! Aku dengar ada negeri yang dibangun dari Like penonton, jadi penasaran.', opts: [['Betul, 1 Like = 1 Gold', 'like']] },
    like: { say: 'Unik banget! Nanti aku Like juga deh.' },
    wisata: { say: 'Sudah! Habis ini nginap di hotel, besok mau ke stadion.', opts: [['Jangan lupa mancing di sungai', 'mancing']] },
    mancing: { say: 'Oh, ada tempat mancing? Katanya ada ikan emas yang langka banget...' },
    bye: { say: 'Makasih! Dadah!' },
  } },
  barista: { name: 'Barista', start: 'a', nodes: {
    a: { say: 'Selamat datang di warkop! Mau pesan apa, {panggil}?', opts: [['Kopi hitam', 'kopi'], ['Teh manis', 'teh'], ['Cuma lihat-lihat', 'bye']] },
    kopi: { say: 'Satu kopi hitam, siap! Warkop ini permintaan deeeaaaa28, lho.', opts: [['Enak!', 'enak']] },
    teh: { say: 'Teh manis hangat, siap! Cocok buat sore-sore.', opts: [['Enak!', 'enak']] },
    enak: { say: 'Makasih! Kata Ucup kopinya juga enak. Ngopi dulu biar semangat bangun negeri!' },
    bye: { say: 'Mampir lagi ya!' },
  } },
  petani: { name: 'Petani', start: 'a', nodes: {
    a: { say: 'Halo, {panggil}! Lagi lihat-lihat ladang?', opts: [['Lagi tanam apa?', 'tanam'], ['Ladang ini permintaan siapa?', 'siapa'], ['Semangat bertani!', 'bye']] },
    tanam: { say: 'Sayur dan jagung! Kalau panen, warga negeri bisa makan bareng.' },
    siapa: { say: 'Permintaan CAT LOVERSS di Day 3. Sekarang jadi tempatku bekerja.' },
    bye: { say: 'Makasih! Panen lancar!' },
  } },
  peternak_lele: { name: 'Peternak Lele', start: 'a', nodes: {
    a: { say: 'Mau lihat lele, {panggil}?', opts: [['Lelenya gede-gede ya', 'gede'], ['Kolam ini permintaan siapa?', 'siapa'], ['Nanti saja', 'bye']] },
    gede: { say: 'Iya dong! Kalau mau mancing, coba di sungai ya. Lele di sini jangan dipancing!' },
    siapa: { say: 'Permintaan darkness di Day 3!' },
    bye: { say: 'Oke, mampir lagi!' },
  } },
  penjaga_ronda: { name: 'Penjaga Ronda', start: 'a', nodes: {
    a: { say: 'Siapa itu? Oh, {panggil}! Aku kira ada yang mencurigakan.', opts: [['Malam ini aman?', 'aman'], ['Ceritakan malam penyerangan', 'serang'], ['Selamat bertugas!', 'bye']] },
    aman: { say: 'Sejauh ini aman. Tapi kadang... ada bayangan aneh di bukit. Kamu pernah lihat?', opts: [['Pernah!', 'pernah'], ['Belum', 'belum']] },
    pernah: { say: 'Benarkah?! Bertopi tinggi, matanya merah? Berarti dia memang masih mengintai...' },
    belum: { say: 'Coba lihat ke arah bukit waktu malam. Tapi jangan lama-lama...' },
    serang: { say: 'Waktu Day 3, dia menyerang gudang Gold. Aku pukul kentongan sekeras-kerasnya, dan ratusan warga keluar bawa obor!', opts: [['Kamu pahlawan!', 'pahlawan']] },
    pahlawan: { say: 'Hehe, semua warga pahlawan. Pos ronda ini permintaan Nafisah, biar negeri aman di malam hari.' },
    bye: { say: 'Siap! Kentongan selalu di tanganku.' },
  } },
  damkar: { name: 'Damkar', start: 'a', nodes: {
    a: { say: 'Pos damkar siap siaga, {panggil}!', opts: [['Pernah ada kebakaran?', 'kebakaran'], ['Mobil damkarnya mana?', 'mobil'], ['Semangat!', 'bye']] },
    kebakaran: { say: 'Belum pernah, untungnya. Tapi kami latihan tiap hari!' },
    mobil: { say: 'Waktu Day 3 ada warga yang rela jadi mobilnya, plus satu Gold. Hehe.' },
    bye: { say: 'Siap, {panggil}!' },
  } },
  kucing: { name: 'Kucing', start: 'a', nodes: {
    a: { say: 'Meong?', opts: [['Elus', 'elus'], ['Kasih ikan', '?ikan:ikan:kosong'], ['Ajak main', 'main']] },
    elus: { say: 'Purrr... (kucingnya memejamkan mata, senang)', fx: 'love' },
    ikan: { say: 'Nyam nyam! Meong~! (kucingnya makan ikan dengan lahap)', fx: 'love' },
    kosong: { say: 'Meong? (kamu belum punya ikan. Coba mancing di sungai dulu!)' },
    main: { say: '(kucingnya mengejar ekornya sendiri... lalu tidur lagi)' },
  } },
};

// Profil tokoh (tab "Tokoh"). Tokoh selain Slime/Ucil/Ucup terbuka setelah diajak ngobrol.
export const PROFILES = [
  { key: 'slime', name: 'Slime', role: 'Raja negeri', first: 'Day 1', trait: 'Jujur, pantang ingkar janji', bio: 'Dulu pekerja kantoran di negara yang penuh korupsi. Setelah meninggal, ia terlahir kembali di dunia ini dengan Skill Penciptaan, dan bertekad membangun negeri tanpa korupsi.', quote: 'Janji adalah janji.' },
  { key: 'ucil', name: 'Ucil', role: 'Warga pertama', first: 'Day 1', trait: 'Polos & penasaran', bio: 'Goblin hijau yang pertama kali minta rumah. Rumahnya jadi bangunan pertama di negeri ini.', quote: 'Bang, terus warga baru tinggal di mana?' },
  { key: 'ucup', name: 'Ucup', role: 'Warga kedua', first: 'Day 1', trait: 'Heboh & semangat', bio: 'Rumahnya gagal dibangun di Day 1 karena Gold habis. Berkat Like dari kalian, janji itu ditepati di Day 2.', quote: 'Gokil, Bang!' },
  { key: 'wakil', name: 'Bocil SCP', role: 'Wakil Menteri Pembangunan', first: 'Day 2', trait: 'Sigap', bio: 'Ingin jadi wakil raja, dan resmi diangkat menjadi Wakil Menteri Pembangunan.', quote: 'Siap, Raja!' },
  { key: 'penjaga_ronda', name: 'Penjaga Ronda', role: 'Penjaga malam', first: 'Day 2', trait: 'Waspada', bio: 'Menjaga Pos Ronda permintaan Nafisah. Membunyikan kentongan saat gudang Gold diserang di Day 3.', quote: 'Kentongan, bunyi!' },
  { key: 'pak_rt', name: 'Pak RT', role: 'Ketua RT', first: 'Day 3', trait: 'Ramah, gampang pusing', bio: 'Warga yang minta jabatan, lalu resmi diangkat jadi Pak RT di Day 3.', quote: 'Warga baru silakan lapor ke saya!' },
  { key: 'damkar', name: 'Damkar', role: 'Pemadam kebakaran', first: 'Day 3', trait: 'Siaga', bio: 'Warga yang siap jadi damkar. Temannya bahkan rela jadi mobilnya.', quote: 'Pos damkar siap siaga!' },
  { key: 'barista', name: 'Barista', role: 'Penjaga warkop', first: 'Day 3', trait: 'Santai', bio: 'Meracik kopi di warkop permintaan deeeaaaa28.', quote: 'Ngopi dulu biar semangat.' },
  { key: 'petani', name: 'Petani', role: 'Pengurus ladang', first: 'Day 3', trait: 'Rajin', bio: 'Merawat ladang permintaan CAT LOVERSS.', quote: 'Panen lancar!' },
  { key: 'peternak_lele', name: 'Peternak Lele', role: 'Pengurus kolam lele', first: 'Day 3', trait: 'Sabar', bio: 'Merawat kolam lele permintaan darkness.', quote: 'Lelenya gede-gede!' },
  { key: 'penambang', name: 'Penambang', role: 'Pekerja tambang', first: 'Day 4', trait: 'Pekerja keras', bio: 'Bekerja di Tambang Gold permintaan @huda_laper_buk & @lilisrahmawati1838. Hasil tambang tiap hari berbeda-beda.', quote: 'Itu rahasia tambang...' },
  { key: 'tentara', name: 'Tentara', role: 'Penjaga negeri', first: 'Day 4', trait: 'Disiplin', bio: 'Bertugas di Markas Militer permintaan agil k 2.', quote: 'Negeri aman!' },
  { key: 'tukang_es', name: 'PP Ramadhan 2027', role: 'Tukang es krim', first: 'Day 4', trait: 'Ceria', bio: 'Minta jadi tukang es krim, dan resmi berjualan di Kedai Es Krim sejak Day 4.', quote: 'Mau rasa apa?' },
  { key: 'kepsek', name: '$Wan$', role: 'Kepala Sekolah', first: 'Day 4', trait: 'Bijak', bio: 'Resmi menjadi Kepala Sekolah di Day 4.', quote: 'Belajar yang rajin ya!' },
  { key: 'polisi', name: 'Polisi', role: 'Penjaga ketertiban', first: 'Day 4', trait: 'Tegas', bio: 'Bertugas di Kantor Polisi yang dibangun di Day 4.', quote: 'Aman terkendali!' },
  { key: 'turis', name: 'Turis', role: 'Pengunjung', first: 'Day 4', trait: 'Suka jalan-jalan', bio: 'Datang dari jauh untuk melihat Tempat Wisata negeri ini.', quote: 'Negeri ini hebat!' },
  { key: 'dia', name: '???', role: 'Bayangan bertopi tinggi', first: 'Day 1', trait: 'Rakus', bio: 'Mirip pejabat korup dari dunia lama. Menyerang gudang Gold di Day 3, kalah oleh cahaya Papan Kas Negeri... dan bilang akan kembali.', quote: 'Aku... akan kembali!', secret: true },
];

// Cerita "Tentang" (tab Tentang). Paragraf dipisah dengan baris kosong.
export const STORY = `Dulu, kamu hanyalah pekerja kantoran biasa di sebuah negara yang dipenuhi korupsi. Harga makin mahal, hukum hanya tajam ke rakyat kecil, sementara para pejabat duduk santai di atas tumpukan emas. Sampai akhirnya, buruknya sistem merenggut nyawamu.

Tapi ceritamu belum berakhir. Kamu terbangun di dunia yang hijau dan damai, dengan satu kemampuan: Skill Penciptaan. Kamu bisa menciptakan bangunan apa pun, asal ada Gold. Tekadmu satu: membangun negeri tanpa korupsi, tempat setiap koin tercatat di Papan Kas Negeri.

Dan Gold negeri ini datang dari kalian, para penonton.`;

export const RULES = [
  ['❤️', '1 Like = 1 Gold'],
  ['🔁', '1 Repost = 10 Gold'],
  ['➕', 'Follow = jadi warga'],
  ['💬', 'Komen = request bangunan (namamu bisa muncul!)'],
];

export const EPISODES = [
  { day: 'Day 1', title: 'Terlahir dengan Skill Penciptaan', text: 'Rumah pertama dibangun untuk Ucil. Rumah Ucup gagal karena Gold habis. Malam harinya, sosok bertopi tinggi muncul.' },
  { day: 'Day 2', title: '400 Gold dari kalian', text: 'Rumah Ucup, Pos Ronda, Sekolah, dan Rumah Sakit berdiri. Bocil SCP jadi Wakil Menteri Pembangunan. Tapi bayangan bertopi tinggi terlihat di dekat gudang Gold...' },
  { day: 'Day 3', title: 'Boss menyerang', text: 'Dia menyerang gudang Gold, tapi warga melawan dengan obor dan Papan Kas Negeri membakarnya. Pagar, Pos Damkar, Jalan, Warkop, Ladang, dan Kolam Lele berdiri. Balai Kota gagal, kurang 7 Gold!' },
  { day: 'Day 4', title: 'Bangun besar-besaran', text: '680 Gold, ditambah bonus 1000 Gold dari Tambang. 65 rumah gotong royong dan 11 bangunan baru berdiri, termasuk Balai Kota, Stadion, dan Hotel.' },
];

// Ikan di sungai: [kunci, nama, emoji, kelangkaan, bobot peluang, ukuran min-max (cm)]
export const FISH = [
  ['nila', 'Ikan Nila', '🐟', 'Umum', 26, [15, 32]],
  ['mujair', 'Ikan Mujair', '🐟', 'Umum', 22, [12, 26]],
  ['lele', 'Lele', '🐟', 'Umum', 18, [20, 45]],
  ['mas', 'Ikan Mas', '🐠', 'Jarang', 10, [20, 48]],
  ['gurame', 'Gurame', '🐠', 'Jarang', 8, [22, 50]],
  ['patin', 'Patin', '🐠', 'Jarang', 7, [30, 70]],
  ['cupang', 'Ikan Cupang', '🐡', 'Langka', 3, [4, 7]],
  ['sepatu', 'Sepatu Bekas', '👟', 'Lucu', 3, [24, 44]],
  ['kaleng', 'Kaleng Kosong', '🥫', 'Lucu', 2.5, [8, 12]],
  ['raja', 'Ikan Emas Raja', '👑', 'Legendaris', 0.5, [60, 99]],
];
