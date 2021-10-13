<?php
$json = json_decode(file_get_contents(__DIR__ . '/raw/map/20210324.json'), true);
$pool = [];
foreach($json['features'] AS $f) {
    if('未編定村里' === $f['properties']['NOTE']) {
        continue;
    }
    $pool[$f['properties']['VILLCODE']] = $f['properties']['COUNTYNAME'] . $f['properties']['TOWNNAME'] . $f['properties']['VILLNAME'];
}

$count = [
    'found' => 0,
    'notfound' => 0,
];
foreach (glob(__DIR__ . '/raw/*.csv') as $csvFile) {
    $fh = fopen($csvFile, 'r');
    $header = fgetcsv($fh, 2048);
    fgetcsv($fh, 2048);
    while ($line = fgetcsv($fh, 2048)) {
        $data = array_combine($header, $line);
        if(isset($pool[$data['里代碼']])) {
            ++$count['found'];
        } else {
            ++$count['notfound'];
        }
    }
}

print_r($count);