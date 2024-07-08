<?php

function fetchHTML($url) {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    $html = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($httpCode >= 400) {
        return false;
    }

    return $html;
}

function scrapeInstagramUser($username) {
    $url = "https://www.instagram.com/" . urlencode($username) . "/";
    $html = fetchHTML($url);

    if (!$html) {
        return array('error' => 'No se pudo obtener la información del usuario de Instagram.');
    }

    $patterns = array(
        'fullName' => '/"full_name":"([^"]+)"/',
        'bio' => '/"biography":"([^"]*)"/',
        'followers' => '/"edge_followed_by":{"count":(\d+)}/',
        'following' => '/"edge_follow":{"count":(\d+)}/',
        'posts' => '/"edge_owner_to_timeline_media":{"count":(\d+)}/',
        'profilePicture' => '/"profile_pic_url_hd":"([^"]+)"/',
        'isPrivate' => '/"is_private":(true|false)/',
        'isVerified' => '/"is_verified":(true|false)/'
    );

    $userData = array(
        'username' => $username,
        'fullName' => '',
        'bio' => '',
        'followers' => 0,
        'following' => 0,
        'posts' => 0,
        'profilePicture' => '',
        'isPrivate' => false,
        'isVerified' => false,
        'region' => ''
    );

    foreach ($patterns as $key => $pattern) {
        if (preg_match($pattern, $html, $matches)) {
            if ($key === 'bio') {
                $userData[$key] = html_entity_decode($matches[1], ENT_QUOTES);
            } elseif ($key === 'profilePicture') {
                $userData[$key] = str_replace('\\u0026', '&', $matches[1]);
            } elseif ($key === 'isPrivate' || $key === 'isVerified') {
                $userData[$key] = ($matches[1] === 'true');
            } else {
                $userData[$key] = $matches[1];
            }
        }
    }

    return $userData;
}

$username = isset($_GET['username']) ? $_GET['username'] : '';

if (!empty($username)) {
    $userData = scrapeInstagramUser($username);

    if (isset($userData['error'])) {
        header('Content-Type: application/json');
        echo json_encode(array('error' => $userData['error']), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        header('Content-Type: application/json');
        echo json_encode($userData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
} else {
    header('Content-Type: application/json');
    echo json_encode(array('error' => 'Debe proporcionar un nombre de usuario de Instagram.'), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
?>
