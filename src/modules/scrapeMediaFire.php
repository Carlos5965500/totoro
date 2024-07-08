<?php

function getURLContent($url)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    $data = curl_exec($ch);

    if (curl_errno($ch)) {
        error_log('Error en cURL: ' . curl_error($ch));
    }

    curl_close($ch);
    return $data;
}

function getTextContent($xpath, $query)
{
    $nodeList = $xpath->query($query);
    if ($nodeList->length > 0) {
        return trim($nodeList->item(0)->textContent);
    }
    return null;
}

function getAttribute($xpath, $query, $attribute)
{
    $nodeList = $xpath->query($query);
    if ($nodeList->length > 0) {
        return $nodeList->item(0)->getAttribute($attribute);
    }
    return null;
}

if (isset($_GET['url'])) {
    $url = $_GET['url'];
    $html = getURLContent($url);

    if ($html !== FALSE) {
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($html);
        libxml_clear_errors();
        $xpath = new DOMXPath($dom);

        $title = getTextContent($xpath, '//title');
        $downloadLink = getAttribute($xpath, '//a[@aria-label="Download file"]', 'href');
        $fileSize = getTextContent($xpath, '//ul[@class="details"]/li[1]');
        $uploadDate = getTextContent($xpath, '//ul[@class="details"]/li[2]');
        $uploadDate = date('d/m/Y', strtotime($uploadDate));
        $fileSize = str_replace('File size: ', '', $fileSize);
        $fileType = pathinfo(parse_url($downloadLink, PHP_URL_PATH), PATHINFO_EXTENSION);

        $data = [
            'Nombre' => $title,
            'Subido' => $uploadDate,
            'MimeType' => $fileType,
            'Peso' => $fileSize,
            'Link' => $downloadLink,
            'Archivo' => $downloadLink
        ];

        header('Content-Type: application/json');
        echo json_encode($data);
    } else {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Error al obtener los datos.']);
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'URL no proporcionada.']);
}
?>
