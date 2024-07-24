<?php
header('Content-Type: application/json');

// Obtener la URL o el título de la canción de la solicitud GET
$url = isset($_GET['url']) ? $_GET['url'] : '';
$trackTitle = isset($_GET['title']) ? $_GET['title'] : '';

if (empty($url) && empty($trackTitle)) {
    echo json_encode(['error' => 'Por favor, proporciona una URL o un título de canción.']);
    exit;
}

if (!empty($url) && !empty($trackTitle)) {
    echo json_encode(['error' => 'Proporciona solo una URL o un título de canción, no ambos.']);
    exit;
}

// Función para obtener contenido HTML usando cURL
function getHTMLContent($url)
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $html = curl_exec($ch);
    curl_close($ch);
    return $html;
}

// Si se proporciona un título de canción, buscar en SoundCloud
if (!empty($trackTitle)) {
    // Realizar una búsqueda en SoundCloud
    $searchUrl = 'https://soundcloud.com/search?q=' . urlencode($trackTitle);

    // Obtener el contenido HTML de la página de búsqueda
    $html = getHTMLContent($searchUrl);

    if ($html === FALSE) {
        echo json_encode(['error' => 'Error al obtener el contenido de la página de búsqueda. URL: ' . $searchUrl]);
        exit;
    }

    // Para manejar errores de HTML malformado
    libxml_use_internal_errors(true);

    // Crear un nuevo DOMDocument y cargar el HTML
    $dom = new DOMDocument();
    if (!$dom->loadHTML($html)) {
        echo json_encode(['error' => 'Error al procesar el HTML de la página de búsqueda.']);
        exit;
    }
    libxml_clear_errors();

    // Crear un nuevo XPath para consultar el DOM
    $xpath = new DOMXPath($dom);

    // Consultar los títulos de las pistas en la página de búsqueda
    $titles = $xpath->query('//a[contains(@class, "sc-link-primary")]');

    $response = [];

    // Variable para rastrear si se encontró al menos una coincidencia
    $found = false;

    if ($titles->length === 0) {
        $response['message'] = 'No se encontraron canciones con el título especificado.';
    } else {
        foreach ($titles as $title) {
            if (stripos($title->nodeValue, $trackTitle) !== false) {
                $response['titles'][] = $title->nodeValue;
                $found = true;
            }
        }
        if (!$found) {
            $response['message'] = 'No se encontraron canciones con el título especificado.';
        }
    }

    echo json_encode($response);
    exit;
}

// Validar la URL
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    echo json_encode(['error' => 'URL no válida.']);
    exit;
}

// Obtener el contenido HTML de la página
$html = getHTMLContent($url);

if ($html === FALSE) {
    echo json_encode(['error' => 'Error al obtener el contenido de la página. URL: ' . $url]);
    exit;
}

// Para manejar errores de HTML malformado
libxml_use_internal_errors(true);

// Crear un nuevo DOMDocument y cargar el HTML
$dom = new DOMDocument();
if (!$dom->loadHTML($html)) {
    echo json_encode(['error' => 'Error al procesar el HTML de la página.']);
    exit;
}
libxml_clear_errors();

// Crear un nuevo XPath para consultar el DOM
$xpath = new DOMXPath($dom);

// Consultar los títulos de las pistas
$titles = $xpath->query('//a[contains(@class, "sc-link-primary")]');

$response = [];

if ($titles->length === 0) {
    $response['message'] = 'No se encontraron títulos de canciones.';
} else {
    foreach ($titles as $title) {
        $response['titles'][] = $title->nodeValue;
    }
}

echo json_encode($response);
