// © Dunia Impianmu. Hak cipta dilindungi: dilarang menyalin atau menerbitkan ulang tanpa izin.
// =====================================================================
//  TEKS & DATA DUNIA IMPIANMU (aman diedit, jaga tanda kutip & koma)
// =====================================================================

export const DAY = 5;
export const STATUS = { gold: 1087, warga: 628, rumah: 67 };

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
  gudang: ['GUDANG GOLD', 'Kas negeri, kini di samping Tambang Gold. Setiap koin tercatat di Papan Kas Negeri'],
  rumah_ucil: ['RUMAH UCIL', 'Rumah pertama di negeri ini (Day 1)'],
  rumah_ucup: ['RUMAH UCUP', 'Gagal di Day 1 karena Gold habis, janji ditepati di Day 2'],
  pos_ronda: ['POS RONDA', 'Permintaan @NafisahUtoi (Day 2) · penjaga malam negeri'],
  rumah_sakit: ['RUMAH SAKIT', 'Permintaan tils_05, yang juga jadi dokternya (Day 2)'],
  pos_damkar: ['POS DAMKAR', 'Day 3 · ada warga yang jadi damkar, dan satu lagi rela jadi mobilnya'],
  warkop: ['WARKOP', 'Permintaan deeeaaaa28 (Day 3)'],
  ladang: ['LADANG', 'Permintaan CAT LOVERSS (Day 3)'],
  ladang2: ['LADANG', 'Permintaan CAT LOVERSS (Day 3)'],
  kolam_lele: ['KOLAM LELE', 'Permintaan darkness (Day 3)'],
  pasar: ['PASAR', 'Permintaan @dremholl76 (Day 5, -150 Gold)'],
  kios_roti: ['TOKO ROTI', 'Permintaan des._0.0 (Day 5, -40 Gold)'],
  kios_seblak: ['TOKO SEBLAK', 'Permintaan nesya25074 (Day 5, -30 Gold) · kata Ucup, seblak level 10 paling enak!'],
  kios_padang: ['NASI PADANG', 'Permintaan kesatria_bebas (Day 5, -40 Gold)'],
  sawah: ['PERTANIAN', 'Permintaan @ondingondingonding3001 (Day 5, -60 Gold) · dialiri air bendungan'],
  bendungan: ['BENDUNGAN', 'Permintaan agil k 2 (Day 5, -250 Gold)'],
  waduk: ['WADUK', 'Air dari bendungan untuk sawah dan listrik negeri'],
  pembangkit: ['PEMBANGKIT LISTRIK', 'Permintaan @naga_hilang (Day 5, -300 Gold) · air jadi listrik untuk seluruh negeri'],
  taman_safari: ['TAMAN SAFARI', 'Permintaan N🙅_ (Day 5, -400 Gold) · tempat wisata pertama negeri. Singanya jinak... katanya'],
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
    luas: { say: 'Berkat warga semua. Di Day 5 kita buka kawasan selatan: pasar, sawah, bendungan, pembangkit listrik, sampai taman safari!', opts: [['Gold kita tinggal berapa?', 'gold'], ['Bang, katanya ada yang nyogok?', 'sogok'], ['Keren, Bang!', 'bye']] },
    gold: { say: 'Sisa 1.087 Gold. Satu Like dari penonton itu satu Gold, satu repost sepuluh Gold!', opts: [['Siap, aku bantu ajak!', 'bye']] },
    sogok: { say: 'Juragan bawa 5.000 Gold, lalu dua karung 10.000 Gold. Jawabanku tetap: TIDAK! Jabatan di negeri ini tidak dijual.', opts: [['Terus menterinya siapa?', 'menteri']] },
    menteri: { say: 'Dipilih dari niat baik! Tulis rencanamu di komentar. Rencana terbaik jadi menteri di Day 6.' },
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
    a: { say: '{panggil}! Udah ke pasar baru di selatan? Ada toko seblak!', opts: [['Udah, ramai banget', 'habis'], ['Aku bawa bola buat kamu!', '?punya:bola:bola:nobola'], ['Kok kamu senyum-senyum?', 'senyum']] },
    habis: { say: 'Aku pesan seblak level sepuluh... sekarang lidahku masih kebakar. Gokil!', opts: [['Kamu paling suka bangunan yang mana?', 'suka'], ['Dadah!', 'bye']] },
    suka: { say: 'Stadion! Aku mau main bola di sana. Eh, tapi bolanya belum ada...', opts: [['Nanti kita minta ke penonton', 'minta']] },
    minta: { say: 'Setuju! Penonton, tulis di komentar ya: bola buat Ucup!', opts: [['Aku punya bola! Nih', '?punya:bola:bola:nobola']] },
    bola: { say: 'BOLA?! Buat aku?! Makasih, {panggil}! Besok aku main di stadion!', fx: 'love', give: 'bola' },
    nobola: { say: 'Hah, mana? Hehe... katanya di pasar ada yang jual bola lho.' },
    senyum: { say: 'Aku masih ingat, dulu rumahku gagal dibangun gara-gara Gold habis. Sekarang negeri kita luas banget!', opts: [['Janji tetap ditepati, kan?', 'janji'], ['Dadah!', 'bye']] },
    janji: { say: 'Iya! Janji adalah janji. Makasih ya, {panggil}!' },
    bye: { say: 'Dadah, {panggil}! Gokil!' },
  } },
  wakil: { name: 'Bocil SCP', start: 'a', nodes: {
    a: { say: 'Lapor, {panggil}! Bocil SCP, Wakil Menteri Pembangunan, siap bertugas!', opts: [['Gimana laporan hari ini?', 'lapor'], ['Siapa yang jadi menteri?', 'menteri'], ['Kamu suka jadi wakil?', 'suka']] },
    menteri: { say: 'Menteri tidak bisa dibeli pakai Gold! Dipilih dari niat baik. Tulis rencanamu di kolom komentar video, rencana terbaik diumumkan di Day 6!', opts: [['Siap, aku tulis!', 'bye']] },
    lapor: { say: 'Day 5: Gold masuk 2.357, delapan bangunan baru di kawasan selatan, sisa 1.087. Sogokan Juragan TIDAK masuk kas. Semua tercatat di Papan Kas Negeri!', opts: [['Kerja bagus!', 'bagus'], ['Tidak ada yang dikorupsi, kan?', 'korupsi']] },
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
    a: { say: 'Wah, {panggil} datang! Mau lihat Tambang Gold?', opts: [['Ada kerjaan buatku?', 'kerja'], ['Gimana bisa dapat 1000 Gold?', 'seribu'], ['Siapa yang minta tambang ini?', 'siapa']] },
    kerja: { say: 'Ada! Bantu angkut 3 karung emas dari tambang ke Gudang Gold. Gudangnya di sebelah utara tambang. Cepat ya, 60 detik!', opts: [['Siap, angkut!', 'job:angkut'], ['Nanti dulu', 'bye']] },
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
  pedagang_buah: { name: 'Pedagang Buah', start: 'a', nodes: {
    a: { say: 'Buah segar, buah segar! Mampir, {panggil}!', opts: [['Mau beli', 'shop:buah'], ['Pasar ini permintaan siapa?', 'siapa'], ['Lihat-lihat dulu', 'bye']] },
    siapa: { say: 'Permintaan @dremholl76 di Day 5! Sejak ada pasar, daganganku laris manis.', opts: [['Mau beli', 'shop:buah'], ['Mantap!', 'bye']] },
    bye: { say: 'Datang lagi ya, {panggil}!' },
  } },
  pedagang_sayur: { name: 'Pedagang Sayur', start: 'a', nodes: {
    a: { say: 'Sayurnya baru dipetik dari sawah, {panggil}! Airnya dari bendungan, jadi segar terus.', opts: [['Mau beli', 'shop:sayur'], ['Ada kerjaan buatku?', 'kerja'], ['Sawahnya di mana?', 'sawah']] },
    kerja: { say: 'Bantu panen padi di sawah, yuk! Kumpulkan 6 ikat padi yang berkilau sebelum waktunya habis.', opts: [['Gas panen!', 'job:panen'], ['Nanti dulu', 'bye']] },
    sawah: { say: 'Di sebelah barat jalan, dekat bendungan. Permintaan @ondingondingonding3001!' },
    bye: { say: 'Oke, mampir lagi!' },
  } },
  pedagang_mainan: { name: 'Pedagang Mainan', start: 'a', nodes: {
    a: { say: 'Mainan dan barang lucu! Ada bola, layangan, payung...', opts: [['Mau beli', 'shop:mainan'], ['Ada yang lagi dicari warga?', 'cari'], ['Lihat-lihat dulu', 'bye']] },
    cari: { say: 'Katanya Ucup lagi cari bola buat main di stadion. Hehe, kebetulan aku jual!', opts: [['Mau beli', 'shop:mainan'], ['Oke!', 'bye']] },
    bye: { say: 'Dadah, {panggil}!' },
  } },
  pedagang_jajan: { name: 'Pedagang Jajanan', start: 'a', nodes: {
    a: { say: 'Haus? Lapar? Es teh dan cilok siap, {panggil}!', opts: [['Mau beli', 'shop:jajan'], ['Ramai banget pasarnya', 'ramai'], ['Nanti saja', 'bye']] },
    ramai: { say: 'Iya! Semua warga belanja di sini. Kas negeri aman, kami dagang jujur.' },
    bye: { say: 'Siap, mampir lagi!' },
  } },
  penjual_roti: { name: 'Penjual Roti', start: 'a', nodes: {
    a: { say: 'Roti hangat baru keluar dari oven, {panggil}!', opts: [['Mau beli', 'shop:roti'], ['Toko ini permintaan siapa?', 'siapa'], ['Nanti saja', 'bye']] },
    siapa: { say: 'Permintaan des._0.0 di Day 5! Wanginya sampai ke gapura.' },
    bye: { say: 'Datang lagi ya!' },
  } },
  penjual_seblak: { name: 'Penjual Seblak', start: 'a', nodes: {
    a: { say: 'Seblak! Mau level berapa, {panggil}? Level 10 khusus yang berani.', opts: [['Mau beli', 'shop:seblak'], ['Ucup pernah ke sini?', 'ucup'], ['Nanti saja', 'bye']] },
    ucup: { say: 'Pernah! Pesan level sepuluh, terus lari keliling pasar sambil teriak kepedasan. Hahaha!' },
    bye: { say: 'Hati-hati, jangan kepedasan!' },
  } },
  penjual_padang: { name: 'Uda Nasi Padang', start: 'a', nodes: {
    a: { say: 'Silakan, {panggil}! Rendang, ayam pop, semua ada.', opts: [['Mau beli', 'shop:padang'], ['Toko ini permintaan siapa?', 'siapa'], ['Nanti saja', 'bye']] },
    siapa: { say: 'Permintaan kesatria_bebas di Day 5! Atapnya gonjong, kayak rumah gadang.' },
    bye: { say: 'Jadi lai, {panggil}! Datang lagi!' },
  } },
  penjaga_safari: { name: 'Penjaga Safari', start: 'a', nodes: {
    a: { say: 'Selamat datang di Taman Safari, {panggil}! Silakan masuk lewat gerbang.', opts: [['Singanya jinak?', 'singa'], ['Ada oleh-oleh?', 'shop:safari'], ['Ada kerjaan buatku?', 'kerja']] },
    kerja: { say: 'Tolong beri makan 4 hewan yang sedang lapar di dalam kandang. Dekati saja hewannya!', opts: [['Siap!', 'job:pakan'], ['Nanti dulu', 'bye']] },
    singa: { say: 'Jinak kok... asal jangan ditarik ekornya. Hehe.', opts: [['Ada oleh-oleh?', 'shop:safari'], ['Oke!', 'bye']] },
    siapa: { say: 'Permintaan N🙅_ di Day 5. Sekaligus jadi tempat wisata pertama negeri!' },
    bye: { say: 'Selamat berkeliling!' },
  } },
  pembeli_a: { name: 'Warga Belanja', start: 'a', nodes: {
    a: { say: 'Wah, Raja ada di pasar! Eh, maksudnya... halo, {panggil}!', opts: [['Belanja apa?', 'apa'], ['Dadah!', 'bye']] },
    apa: { say: 'Beli seblak level satu. Level sepuluh mah buat Ucup aja.' },
    bye: { say: 'Dadah!' },
  } },
  pembeli_b: { name: 'Warga Belanja', start: 'a', nodes: {
    a: { say: 'Dulu di dunia lama harga naik terus. Di sini harganya jujur!', opts: [['Iya, negeri tanpa korupsi', 'jujur'], ['Dadah!', 'bye']] },
    jujur: { say: 'Katanya ada juragan yang mau nyogok Raja... tapi ditolak mentah-mentah! Keren.' },
    bye: { say: 'Hati-hati di jalan!' },
  } },
  pembeli_c: { name: 'Warga Belanja', start: 'a', nodes: {
    a: { say: 'Kamu sudah ke Taman Safari? Gerbangnya di ujung jalan sana.', opts: [['Belum, nanti ke sana', 'nanti'], ['Sudah!', 'sudah']] },
    nanti: { say: 'Jangan lupa beli boneka singa buat oleh-oleh!' },
    sudah: { say: 'Gajahnya besar banget ya! Aku sampai kaget.' },
  } },
  kucing: { name: 'Kucing', start: 'a', nodes: {
    a: { say: 'Meong?', opts: [['Elus', 'elus'], ['Kasih ikan', '?ikan:ikan:kosong'], ['Ajak main', 'main']] },
    elus: { say: 'Purrr... (kucingnya memejamkan mata, senang)', fx: 'love' },
    ikan: { say: 'Nyam nyam! Meong~! (kucingnya makan ikan dengan lahap)', fx: 'love' },
    kosong: { say: 'Meong? (kamu belum punya ikan. Coba mancing di sungai dulu!)' },
    main: { say: '(kucingnya mengejar ekornya sendiri... lalu tidur lagi)' },
  } },
};

// =====================================================================
//  TOKO: dibuka dari dialog (pilihan 'shop:<kunci>'). Bayar pakai KOIN SAKU pemain (bukan Gold kas negeri!).
//  Koin saku didapat dari mancing. kind: 'makan' (langsung dimakan) / 'barang' (masuk Tas)
//  fx: 'pedas' = lari lebih cepat + asap merah · 'kuat' = lari lebih cepat · 'segar' / 'enak' = muncul hati
// =====================================================================
export const KOIN_AWAL = 50;
export const KOIN_IKAN = { Umum: 5, Jarang: 12, Langka: 30, Lucu: 2, Legendaris: 150 };
export const SHOPS = {
  buah: { name: 'Lapak Buah', items: [
    ['apel', 'Apel', '🍎', 5, 'makan', 'enak', 'Manis dan renyah'],
    ['pisang', 'Pisang', '🍌', 4, 'makan', 'enak', 'Kesukaan Ucil'],
    ['semangka', 'Semangka', '🍉', 12, 'makan', 'segar', 'Segar banget pas siang'],
  ] },
  sayur: { name: 'Lapak Sayur', items: [
    ['jagung', 'Jagung Bakar', '🌽', 8, 'makan', 'enak', 'Dari sawah negeri'],
    ['wortel', 'Wortel', '🥕', 4, 'barang', '', 'Katanya zebra suka wortel...'],
  ] },
  mainan: { name: 'Lapak Mainan', items: [
    ['bola', 'Bola', '⚽', 25, 'barang', '', 'Ucup lagi cari bola!'],
    ['layangan', 'Layangan', '🪁', 20, 'barang', '', 'Buat main di lapangan'],
    ['payung', 'Payung', '☂️', 30, 'barang', '', 'Siaga kalau hujan'],
  ] },
  jajan: { name: 'Lapak Jajanan', items: [
    ['esteh', 'Es Teh', '🧋', 5, 'makan', 'segar', 'Dingin dan manis'],
    ['cilok', 'Cilok', '🍡', 8, 'makan', 'enak', 'Kenyal, pakai saus kacang'],
  ] },
  roti: { name: 'Toko Roti', items: [
    ['roti', 'Roti Tawar', '🍞', 8, 'makan', 'enak', 'Hangat dari oven'],
    ['roticoklat', 'Roti Cokelat', '🥐', 12, 'makan', 'enak', 'Lumer di mulut'],
    ['donat', 'Donat', '🍩', 10, 'makan', 'enak', 'Bertabur gula'],
  ] },
  seblak: { name: 'Toko Seblak', items: [
    ['seblak1', 'Seblak Level 1', '🍜', 10, 'makan', 'enak', 'Pedas sedikit'],
    ['seblak5', 'Seblak Level 5', '🍜', 15, 'makan', 'kuat', 'Mulai berkeringat...'],
    ['seblak10', 'Seblak Level 10', '🔥', 20, 'makan', 'pedas', 'Khusus yang berani! (lari jadi kencang)'],
  ] },
  padang: { name: 'Nasi Padang', items: [
    ['rendang', 'Nasi Rendang', '🍛', 25, 'makan', 'kuat', 'Kenyang, tenaga penuh (lari lebih cepat)'],
    ['ayampop', 'Nasi Ayam Pop', '🍗', 20, 'makan', 'enak', 'Gurih dan lembut'],
  ] },
  safari: { name: 'Oleh-oleh Safari', items: [
    ['bonekasinga', 'Boneka Singa', '🦁', 60, 'barang', '', 'Kenang-kenangan Taman Safari'],
    ['topisafari', 'Topi Safari', '👒', 40, 'barang', '', 'Gaya penjelajah'],
    ['gantungan', 'Gantungan Jerapah', '🦒', 15, 'barang', '', 'Lucu dan murah'],
  ] },
};

// Teleport dari peta besar: [nama, emoji, x, y] (posisi di depan tempatnya)
export const TELEPORTS = [
  ['Balai Kota', '🏛️', 0, 11.6],
  ['Stadion', '🏟️', 0, 30.6],
  ['Tambang Gold', '⛏️', 21.6, 14.0],
  ['Tempat Wisata', '🎡', -23.6, 20.1],
  ['Pasar', '🛒', 0, -31.0],
  ['Taman Safari', '🦁', 10.8, -42.0],
];

// =====================================================================
//  MISI & KERJA SAMBILAN · hadiah = KOIN SAKU pemain (bukan Gold kas negeri)
//  goal.type: visit (selatan/safari/stadion/tambang) · eat (daftar toko) · give (barang@tokoh) · sign (papan nama Day 5)
//             node (tokoh:simpul dialog) · job (jumlah kerja) · fish · buy · walk (meter) · photo · teleport · talkSeller
// =====================================================================
export const MAIN_MISSIONS = {
  bab: 'Bab 5 · Jabatan Tidak Dijual',
  list: [
    { id: 'm1', title: 'Ke Kawasan Baru', desc: 'Lewati gapura selatan dan lihat kawasan baru Day 5.', goal: { type: 'visit', target: 'selatan' }, koin: 20 },
    { id: 'm2', title: 'Cicipi Kios Day 5', desc: 'Makan di Toko Roti, Toko Seblak, dan Nasi Padang.', goal: { type: 'eat', target: ['roti', 'seblak', 'padang'] }, koin: 40,
      // item gratis khusus misi (muncul paling atas di toko selama misi berjalan): [id, nama, emoji, kind, fx, teks]
      free: { roti: ['roti', 'Roti Hangat', '🍞', 'makan', 'enak', '🎯 GRATIS untuk misi · traktiran Penjual Roti'],
              seblak: ['seblak1', 'Seblak Level 1', '🍜', 'makan', 'enak', '🎯 GRATIS untuk misi · cicipi dulu yang ringan'],
              padang: ['rendang', 'Nasi Rendang', '🍛', 'makan', 'kuat', '🎯 GRATIS untuk misi · traktiran Uda'] } },
    { id: 'm3', title: 'Bola untuk Ucup', desc: 'Beli bola di Lapak Mainan pasar, lalu berikan ke Ucup di dekat Balai Kota.', goal: { type: 'give', target: 'bola@ucup' }, koin: 35,
      free: { mainan: ['bola', 'Bola untuk Ucup', '⚽', 'barang', '', '🎯 GRATIS untuk misi · titipan buat Ucup'] } },
    { id: 'm4', title: 'Pemburu Papan Nama', desc: 'Temukan 8 papan nama peminta bangunan Day 5.', goal: { type: 'sign', target: 'day5', n: 8 }, koin: 60, badge: ['papan', '🪧', 'Pemburu Papan'] },
    { id: 'm5', title: 'Kerja Bakti', desc: 'Selesaikan 2 kerja sambilan (tanya pedagang sayur, penambang, atau penjaga safari).', goal: { type: 'job', n: 2 }, koin: 50 },
    { id: 'm6', title: 'Lowongan Menteri', desc: 'Tanya Bocil SCP: siapa yang jadi menteri?', goal: { type: 'node', target: 'wakil:menteri' }, koin: 30, badge: ['day5', '👑', 'Anti Sogok (Day 5)'] },
  ],
};
// Misi harian: tiap hari dipilih 3 secara acak. Selesai semua = bonus.
export const DAILY_BONUS = 25;
export const DAILY_POOL = [
  { id: 'd_ikan', title: 'Tangkap 3 ikan', goal: { type: 'fish', n: 3 }, koin: 20 },
  { id: 'd_jalan', title: 'Jalan-jalan 400 meter', goal: { type: 'walk', n: 400 }, koin: 15 },
  { id: 'd_ngobrol', title: 'Ngobrol dengan 3 pedagang', goal: { type: 'talkSeller', n: 3 }, koin: 15 },
  { id: 'd_jajan', title: 'Beli 2 barang atau makanan', goal: { type: 'buy', n: 2 }, koin: 10 },
  { id: 'd_foto', title: 'Ambil 2 foto', goal: { type: 'photo', n: 2 }, koin: 10 },
  { id: 'd_kerja', title: 'Selesaikan 1 kerja sambilan', goal: { type: 'job', n: 1 }, koin: 20 },
  { id: 'd_safari', title: 'Masuk ke kandang Taman Safari', goal: { type: 'visit', target: 'safari' }, koin: 10 },
  { id: 'd_stadion', title: 'Kunjungi Stadion', goal: { type: 'visit', target: 'stadion' }, koin: 10 },
  { id: 'd_tambang', title: 'Kunjungi Tambang Gold', goal: { type: 'visit', target: 'tambang' }, koin: 10 },
  { id: 'd_teleport', title: 'Teleport 2 kali dari peta', goal: { type: 'teleport', n: 2 }, koin: 10 },
];
// Kerja sambilan: datangi titik-titik berkilau sebelum waktu habis. Bisa diulang (jeda 'cd' detik).
export const JOBS = {
  panen: { name: 'Panen Padi', em: '🌾', desc: 'Kumpulkan ikat padi di sawah', time: 70, koin: 15, cd: 60, act: 1.6, verb: 'Panen',
    points: 'acak', area: [-14.5, -7.8, -42.2, -36.2], n: 6, label: 'ikat padi' },
  angkut: { name: 'Angkut Emas', em: '💰', desc: 'Bawa karung emas dari tambang ke gudang', time: 90, koin: 25, cd: 90, act: 1.3, verb: ['Angkat karung', 'Simpan emas'],
    points: [[23.4, 14.0], [25.2, 21.1], [23.4, 14.0], [25.2, 21.1], [23.4, 14.0], [25.2, 21.1]], label: 'antaran', pair: true },
  pakan: { name: 'Beri Makan Hewan', em: '🥕', desc: 'Dekati 4 hewan yang lapar', time: 70, koin: 15, cd: 60, act: 1.6, verb: 'Beri makan',
    points: [[18.9, -38.8], [20.1, -43.6], [15.9, -41.0], [17.5, -46.0]], label: 'hewan', reach: 1.7 },
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
  { day: 'Day 5', title: 'Jabatan Tidak Dijual', text: 'Juragan menyogok 5.000 Gold supaya jadi menteri, Raja bilang TIDAK! Tambang memberi 2.000 Gold. Kawasan selatan dibuka: Pasar, Toko Roti, Seblak, Nasi Padang, Bendungan, Pembangkit Listrik, Sawah, dan Taman Safari.' },
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
