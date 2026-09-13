<?php
/**
 * DEBUG & START Backend Node.js — Akses via browser
 * URL: https://survasi.com/debug_server.php
 * HAPUS FILE INI SETELAH BACKEND BERHASIL JALAN!
 */
header('Content-Type: text/plain; charset=utf-8');

echo "=== SURVASI.COM SERVER DIAGNOSTICS ===\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n";
echo "User: " . exec('whoami') . "\n\n";

// 1. Cari lokasi Node.js
echo "--- STEP 1: Mencari lokasi Node.js ---\n";
$nodePaths = [
    '/home/survasi/.nvm/versions/node/*/bin/node',
    '/usr/local/bin/node',
    '/usr/bin/node',
    '/usr/bin/nodejs',
    '/opt/node/bin/node',
];

$foundNode = '';
foreach ($nodePaths as $p) {
    $result = trim(shell_exec("ls $p 2>/dev/null | head -1"));
    if ($result) {
        $foundNode = $result;
        echo "  ✓ DITEMUKAN: $result\n";
        echo "  Versi: " . trim(shell_exec("$result --version 2>&1")) . "\n";
        break;
    }
}

// Fallback: which / find
if (!$foundNode) {
    $which = trim(shell_exec('which node 2>/dev/null || which nodejs 2>/dev/null'));
    if ($which) {
        $foundNode = $which;
        echo "  ✓ DITEMUKAN via which: $which\n";
    }
}
if (!$foundNode) {
    $find = trim(shell_exec('find /home/survasi/.nvm -name "node" -type f 2>/dev/null | head -1'));
    if ($find) {
        $foundNode = $find;
        echo "  ✓ DITEMUKAN via find: $find\n";
    }
}
if (!$foundNode) {
    $find2 = trim(shell_exec('find / -name "node" -type f 2>/dev/null | head -3'));
    echo "  ✗ Node TIDAK ditemukan di path standar!\n";
    echo "  Find hasil pencarian seluruh server:\n  $find2\n";
    echo "\n=== GAGAL: Node.js belum terinstall di server ini ===\n";
    exit;
}

// 2. Cek apakah port 3001 sudah digunakan
echo "\n--- STEP 2: Cek port 3001 ---\n";
$port = trim(shell_exec("ss -tlnp 2>/dev/null | grep 3001 || netstat -tlnp 2>/dev/null | grep 3001 || echo 'Port 3001 KOSONG (backend belum jalan)'"));
echo "  $port\n";

// 3. Cek file .env
echo "\n--- STEP 3: Cek file .env backend ---\n";
$envPath = '/home/survasi/htdocs/survasi.com/server/.env';
if (file_exists($envPath)) {
    echo "  ✓ File .env ADA\n";
    // Tampilkan tanpa password
    $env = file_get_contents($envPath);
    $lines = explode("\n", $env);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || $line[0] === '#') continue;
        if (stripos($line, 'PASS') !== false || stripos($line, 'SECRET') !== false || stripos($line, 'KEY') !== false) {
            $parts = explode('=', $line, 2);
            echo "  " . $parts[0] . "=****\n";
        } else {
            echo "  $line\n";
        }
    }
} else {
    echo "  ✗ File .env TIDAK ADA!\n";
}

// 4. Cek node_modules
echo "\n--- STEP 4: Cek node_modules ---\n";
$nmPath = '/home/survasi/htdocs/survasi.com/server/node_modules';
if (is_dir($nmPath)) {
    $count = trim(shell_exec("ls '$nmPath' | wc -l"));
    echo "  ✓ node_modules ADA ($count packages)\n";
    // Cek dependency kritis
    $deps = ['express', 'cors', 'dotenv', 'mysql2', 'helmet', 'compression', 'hpp', 'morgan', 'jsonwebtoken', 'bcryptjs'];
    $missing = [];
    foreach ($deps as $dep) {
        if (!is_dir("$nmPath/$dep")) $missing[] = $dep;
    }
    if ($missing) {
        echo "  ✗ MISSING dependencies: " . implode(', ', $missing) . "\n";
    } else {
        echo "  ✓ Semua dependency kritis terinstall\n";
    }
} else {
    echo "  ✗ node_modules TIDAK ADA! Perlu 'npm install'\n";
}

// 5. Cek index.js
echo "\n--- STEP 5: Cek index.js ---\n";
$indexPath = '/home/survasi/htdocs/survasi.com/server/index.js';
if (file_exists($indexPath)) {
    echo "  ✓ index.js ADA (" . filesize($indexPath) . " bytes)\n";
} else {
    echo "  ✗ index.js TIDAK ADA!\n";
}

// 6. Coba jalankan node index.js (dry-run test)
echo "\n--- STEP 6: Test jalankan Node.js ---\n";
$testCmd = "cd /home/survasi/htdocs/survasi.com/server && $foundNode -e \"require('dotenv').config(); console.log('Node OK, DB_NAME=' + process.env.DB_NAME);\" 2>&1";
$testResult = trim(shell_exec($testCmd));
echo "  Test result: $testResult\n";

// 7. START BACKEND (jika parameter ?start=1)
if (isset($_GET['start'])) {
    echo "\n--- STEP 7: STARTING BACKEND ---\n";
    // Kill existing
    shell_exec("pkill -f 'node index.js' 2>/dev/null");
    sleep(1);
    
    $startCmd = "cd /home/survasi/htdocs/survasi.com/server && nohup $foundNode index.js > /home/survasi/htdocs/survasi.com/server/backend.log 2>&1 & echo $!";
    $pid = trim(shell_exec($startCmd));
    echo "  ✓ Backend dilaunching dengan PID: $pid\n";
    
    sleep(2);
    
    // Cek apakah masih running
    $check = trim(shell_exec("ps -p $pid -o comm= 2>/dev/null"));
    if ($check) {
        echo "  ✓ Proses MASIH BERJALAN (status: $check)\n";
    } else {
        echo "  ✗ Proses MATI! Cek backend.log untuk error\n";
    }
    
    // Tampilkan isi backend.log
    echo "\n--- backend.log (last 20 lines) ---\n";
    echo shell_exec("tail -20 /home/survasi/htdocs/survasi.com/server/backend.log 2>/dev/null");
} else {
    echo "\n=== Untuk MENYALAKAN backend, buka URL: ===\n";
    echo "https://survasi.com/debug_server.php?start=1\n";
}

echo "\n=== SELESAI ===\n";
