<?php

// Función para ejecutar el script de scraping y obtener los datos
function scrapeInstagramUser($username)
{
    // Comando para ejecutar el script de Python
    $command = escapeshellcmd("python src/modules/instagram_scraper.py $username");
    $output = shell_exec($command);

    // Para depuración, muestra el comando y la salida
    echo "<pre>Command: $command\nOutput: $output</pre>";

    // Decodificar la salida JSON del script de Python
    $data = json_decode($output, true);

    // Verificar si json_decode falló
    if (json_last_error() !== JSON_ERROR_NONE) {
        return array('error' => 'Error al decodificar JSON: ' . json_last_error_msg());
    }

    return $data;
}

// Verificar si se proporcionó un nombre de usuario
$username = isset($_GET['username']) ? $_GET['username'] : '';

if (!empty($username)) {
    // Obtener datos del usuario
    $userData = scrapeInstagramUser($username);

    if (isset($userData['error'])) {
        // Devolver error si no se pudo obtener la información
        header('Content-Type: application/json');
        echo json_encode(array('error' => $userData['error']), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        // Devolver los datos del usuario incluyendo el enlace del avatar
        header('Content-Type: application/json');
        echo json_encode($userData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
} else {
    // Devolver error si no se proporcionó un nombre de usuario
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Debe proporcionar un nombre de usuario de Instagram.'), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
