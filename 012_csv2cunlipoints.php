<?php
$pool = [];
foreach (glob(__DIR__ . '/raw/*.csv') as $csvFile) {
    $fh = fopen($csvFile, 'r');
    $header = fgetcsv($fh, 2048);
    fgetcsv($fh, 2048);
    while ($line = fgetcsv($fh, 2048)) {
        $data = array_combine($header, $line);

        if (!empty($data['緯度'])) {
            if (!isset($pool[$data['里代碼']])) {
                $pool[$data['里代碼']] = [
                    'type' => 'FeatureCollection',
                    'features' => [],
                ];
            }
            $f = [
                'type' => 'Feature',
                'properties' => [
                    'dead' => $data['死亡人數'],
                    'hurt' => $data['受傷人數(含2~30日內死亡)'],
                ],
                'geometry' => [
                    'type' => 'Point',
                    'coordinates' => [
                        floatval($data['經度']),
                        floatval($data['緯度']),
                    ],
                ],
            ];
            $pool[$data['里代碼']]['features'][] = $f;
        }
    }
}

foreach($pool AS $code => $fc) {
    file_put_contents(__DIR__ . '/docs/cunli/' . $code . '.json', json_encode($fc, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}