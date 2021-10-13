<?php
$count = [
    'dead' => 0,
    'hurt' => 0,
];
foreach(glob(__DIR__ . '/raw/*.csv') AS $csvFile) {
    $fh = fopen($csvFile, 'r');
    $header = fgetcsv($fh, 2048);
    fgetcsv($fh, 2048);
    while($line = fgetcsv($fh, 2048)) {
        $data = array_combine($header, $line);
        $count['dead'] += $data['死亡人數'];
        $count['hurt'] += $data['受傷人數(含2~30日內死亡)'];
    }
}

print_r($count);