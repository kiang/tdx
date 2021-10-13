<?php
$fh = fopen(__DIR__ . '/raw/population/population.csv', 'r');
fgetcsv($fh, 8096);
fgetcsv($fh, 8096);
$pool = [];
while ($line = fgetcsv($fh, 8096)) {
    $pool[$line[1]] = $line[5];
}

$sum = [];
foreach (glob(__DIR__ . '/raw/*.csv') as $csvFile) {
    $fh = fopen($csvFile, 'r');
    $header = fgetcsv($fh, 2048);
    fgetcsv($fh, 2048);
    while ($line = fgetcsv($fh, 2048)) {
        $data = array_combine($header, $line);
        if (!isset($sum[$data['里代碼']])) {
            $sum[$data['里代碼']] = [
                'dead' => 0,
                'hurt' => 0,
                'population' => isset($pool[$data['里代碼']]) ? $pool[$data['里代碼']] : 0,
                'rateDead' => 0.0,
                'rateHurt' => 0.0,
            ];
        }
        $sum[$data['里代碼']]['dead'] += $data['死亡人數'];
        $sum[$data['里代碼']]['hurt'] += $data['受傷人數(含2~30日內死亡)'];
    }
}

foreach ($sum as $code => $line) {
    if ($line['population'] > 0) {
        $sum[$code]['rateDead'] = round($line['dead'] / $line['population'], 5) * 1000;
        $sum[$code]['rateHurt'] = round($line['hurt'] / $line['population'], 5) * 1000;
    }
}

uasort($sum, 'cmp');

function cmp($a, $b)
{
    if ($a['rateDead'] == $b['rateDead']) {
        return 0;
    }
    return ($a['rateDead'] > $b['rateDead']) ? -1 : 1;
}

$json = json_decode(file_get_contents(__DIR__ . '/raw/map/20210324.json'), true);

$fc = [
    'type' => 'FeatureCollection',
    'features' => [],
];
$count = [
    '0-5' => 0,
    '6-10' => 0,
    '11-15' => 0,
    '16-20' => 0,
    '>20' => 0,
];
foreach ($json['features'] as $f) {
    if (isset($sum[$f['properties']['VILLCODE']])) {
        $f['properties'] = array_merge($f['properties'], $sum[$f['properties']['VILLCODE']]);
        if($f['properties']['rateHurt'] < 6) {
            $count['0-5'] += 1;
        } elseif($f['properties']['rateHurt'] < 11) {
            $count['6-10'] += 1;
        } elseif($f['properties']['rateHurt'] < 16) {
            $count['11-15'] += 1;
        } elseif($f['properties']['rateHurt'] < 21) {
            $count['16-20'] += 1;
        } else {
            $count['>20'] += 1;
        }
        $fc['features'][] = $f;
    }
}

file_put_contents(__DIR__ . '/docs/map.json', json_encode($fc, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

print_r($count);