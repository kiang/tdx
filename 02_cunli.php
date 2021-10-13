<?php
$count = [];
foreach (glob(__DIR__ . '/raw/*.csv') as $csvFile) {
    $fh = fopen($csvFile, 'r');
    $header = fgetcsv($fh, 2048);
    fgetcsv($fh, 2048);
    while ($line = fgetcsv($fh, 2048)) {
        $data = array_combine($header, $line);
        if (!isset($count[$data['里代碼']])) {
            $count[$data['里代碼']] = [
                'dead' => 0,
                'hurt' => 0,
            ];
        }
        $count[$data['里代碼']]['dead'] += $data['死亡人數'];
        $count[$data['里代碼']]['hurt'] += $data['受傷人數(含2~30日內死亡)'];
    }
}

uasort($count, 'cmp');

function cmp($a, $b) {
    if ($a['hurt'] == $b['hurt']) {
        return 0;
    }
    return ($a['hurt'] > $b['hurt']) ? -1 : 1;
}

print_r($count);