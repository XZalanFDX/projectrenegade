<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Adatok begyűjtése
    $adatok = [
        "Időpont" => date("Y-m-d H:i:s"),
        "Név" => $_POST['teljes_nev'],
        "Született" => $_POST['szu_ev'] . "." . $_POST['szu_honap'] . "." . $_POST['szu_nap'],
        "Lakcím" => $_POST['iranyitoszam'] . " " . $_POST['varos'] . ", " . $_POST['utca'],
        "Telefon" => "+36 " . $_POST['tel_korzet'] . " " . $_POST['tel_szam'],
        "Email" => $_POST['email'],
        "Üzenet" => str_replace("\n", " ", $_POST['uzenet']) // Sortörések kiszedése
    ];

    // Egy sorba rendezés mentéshez
    $mentendo_sor = implode(" | ", $adatok) . PHP_EOL;

    // Mentés az adatok.txt fájlba
    file_put_contents("adatok.txt", $mentendo_sor, FILE_APPEND);

    // Visszajelzés a felhasználónak
    echo "<script>alert('Sikeres beküldés!'); window.location.href='index.html';</script>";
}