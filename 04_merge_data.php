<?php
$json = json_decode(file_get_contents(__DIR__ . '/raw/map/20210324.json'), true);
$pool = [];
foreach($json['features'] AS $f) {
    if('未編定村里' === $f['properties']['NOTE']) {
        continue;
    }
    $pool[$f['properties']['VILLCODE']] = $f;
}

$features = [];
foreach (glob(__DIR__ . '/raw/*.csv') as $csvFile) {
    $fh = fopen($csvFile, 'r');
    $header = fgetcsv($fh, 2048);
    fgetcsv($fh, 2048);
    while ($line = fgetcsv($fh, 2048)) {
        $data = array_combine($header, $line);
        if(isset($pool[$data['里代碼']])) {
            if(!isset($features[$data['里代碼']])) {
                $features[$data['里代碼']] = [
                    'dead' => 0,
                    'hurt' => 0,
                    'feature' => $pool[$data['里代碼']],
                ];
            }
            $features[$data['里代碼']]['dead'] += $data['死亡人數'];
            $features[$data['里代碼']]['hurt'] += $data['受傷人數(含2~30日內死亡)'];
        }
    }
}

$fc = [
    'type' => 'FeatureCollection',
    'features' => [],
];
foreach($features AS $feature) {
    $f = $feature['feature'];
    $f['properties']['dead'] = $feature['dead'];
    $f['properties']['hurt'] = $feature['hurt'];
    $fc['features'][] = $f;
}

file_put_contents(__DIR__ . '/data/map.json', json_encode($fc, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));