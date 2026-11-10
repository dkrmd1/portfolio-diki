# Portofolio Diki Ramdani

Website statis responsif untuk GitHub Pages. Tidak memerlukan framework atau proses build.

## Isi

- Ringkasan profil dan teknologi
- Logo SVG teknologi Laravel, PHP, HTML, Bootstrap, CSS, JavaScript, MySQL, dan Flutter (Simple Icons, disimpan lokal)
- Grafik teknologi yang dihitung hanya dari repositori publik
- Game cacing yang dimainkan langsung di halaman dengan keyboard atau kontrol sentuh
- Daftar repositori publik yang diperbarui dari GitHub API saat halaman dibuka
- Screenshot dashboard Sistem Berita Acara pada kartu proyek, dengan nama pengguna dan angka dashboard disamarkan
- Screenshot dashboard Log Activity pada kartu proyek dengan angka statistik disamarkan
- Nama repositori private pilihan ditampilkan manual tanpa deskripsi, bahasa, tautan, atau isi kode
- Navigasi proyek per halaman dengan tombol sebelumnya dan berikutnya
- Font game pada judul dan navigasi, kartu proyek bergaya kartu game, serta profil yang bisa digeser dengan mouse/sentuhan
- Statistik jumlah repositori dan stars publik
- Kartu proyek tidak memiliki tautan keluar
- Tombol kontak langsung ke WhatsApp
- Animasi saat menggulir, navigasi responsif, dan dukungan reduced motion

## Menjalankan lokal

Buka `index.html` di browser. Untuk memeriksa pemuatan statistik GitHub, gunakan koneksi internet.

## Publikasi

Salin isi folder ini ke repositori GitHub Pages Anda, misalnya `dkrmd.github.io`, lalu aktifkan Pages dari branch dan folder yang digunakan repositori tersebut.

Statistik, grafik keahlian, dan daftar repo publik bersumber dari GitHub API dan dapat tidak tampil sementara jika API mengalami gangguan atau pembatasan permintaan. Nama repo private di `script.js` dikelola manual; nama-nama tersebut menjadi informasi publik di website. Jangan tambahkan deskripsi, URL, token, atau informasi sensitif. Kartu proyek tidak menautkan pengunjung ke GitHub.

## Profil GitHub

README profil siap pakai ada di folder `../github-profile/README.md`. Untuk menampilkannya di profil `github.com/dkrmd1`, buat repositori publik bernama `dkrmd1` dan letakkan isinya sebagai `README.md` pada root repositori.
