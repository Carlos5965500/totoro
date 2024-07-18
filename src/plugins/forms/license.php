<?php

// Configuración de la base de datos
function getDatabaseConnection()
{
    $host = 'nodo.cinammon.es';
    $db = 's4_totoro';
    $user = 'u4_ZzjLwctXqJ';
    $pass = '^soWpcozR3W07ZMXDmr^Tb8q';
    $charset = 'utf8mb4';
    $port = '3306';

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error en la conexión a la base de datos: " . $e->getMessage()]);
        exit;
    }
}

function isInBlacklist($phone)
{
    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare('SELECT * FROM totoBlacklist WHERE userPhone = ?');
    if (!$stmt) {
        echo json_encode(["error" => "Error en la preparación de la consulta isInBlacklist: " . implode(" ", $pdo->errorInfo())]);
        exit;
    }
    $stmt->execute([$phone]);
    return $stmt->fetch() !== false;
}

function isInWhitelist($phone)
{
    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare('SELECT * FROM totoWhitelist WHERE userPhone = ?');
    if (!$stmt) {
        echo json_encode(["error" => "Error en la preparación de la consulta isInWhitelist: " . implode(" ", $pdo->errorInfo())]);
        exit;
    }
    $stmt->execute([$phone]);
    return $stmt->fetch() !== false;
}

function createLicense($phone)
{
    header('Content-Type: application/json');
    if (isInBlacklist($phone)) {
        return json_encode(["error" => "El usuario está en la lista negra"]);
    }

    $pdo = getDatabaseConnection();

    $stmt = $pdo->prepare('SELECT * FROM totoUsers WHERE phone = ?');
    if (!$stmt) {
        echo json_encode(["error" => "Error en la preparación de la consulta createLicense: " . implode(" ", $pdo->errorInfo())]);
        exit;
    }
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $pdo->prepare('SELECT * FROM totoPremiumUsers WHERE totoUserId = ?');
        if (!$stmt) {
            echo json_encode(["error" => "Error en la preparación de la consulta createLicense (verificar licencia): " . implode(" ", $pdo->errorInfo())]);
            exit;
        }
        $stmt->execute([$user['id']]);
        $existingLicense = $stmt->fetch();

        if ($existingLicense) {
            return json_encode(["error" => "El usuario ya tiene una licencia"]);
        }

        $stmt = $pdo->prepare('INSERT INTO totoPremiumUsers (totoUserId, totoLicense) VALUES (?, UUID())');
        if (!$stmt) {
            echo json_encode(["error" => "Error en la preparación de la consulta createLicense (crear licencia): " . implode(" ", $pdo->errorInfo())]);
            exit;
        }
        $stmt->execute([$user['id']]);
        return json_encode(["success" => "Licencia creada para el usuario con teléfono: $phone"]);
    } else {
        return json_encode(["error" => "Usuario no encontrado"]);
    }
}

function getLicense($phone)
{
    header('Content-Type: application/json');
    if (isInBlacklist($phone)) {
        return json_encode(["error" => "El usuario está en la lista negra"]);
    }

    if (!isInWhitelist($phone)) {
        return json_encode(["error" => "El usuario no está en la lista blanca"]);
    }

    $pdo = getDatabaseConnection();

    $stmt = $pdo->prepare('SELECT * FROM totoUsers WHERE phone = ?');
    if (!$stmt) {
        echo json_encode(["error" => "Error en la preparación de la consulta getLicense: " . implode(" ", $pdo->errorInfo())]);
        exit;
    }
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $pdo->prepare('SELECT * FROM totoPremiumUsers WHERE totoUserId = ?');
        if (!$stmt) {
            echo json_encode(["error" => "Error en la preparación de la consulta getLicense (obtener licencia): " . implode(" ", $pdo->errorInfo())]);
            exit;
        }
        $stmt->execute([$user['id']]);
        $license = $stmt->fetch();

        if ($license) {
            return json_encode($license);
        } else {
            return json_encode(["error" => "Licencia no encontrada para el usuario con teléfono: $phone"]);
        }
    } else {
        return json_encode(["error" => "Usuario no encontrado"]);
    }
}

function updateLicense($phone, $newLicense)
{
    header('Content-Type: application/json');
    if (isInBlacklist($phone)) {
        return json_encode(["error" => "El usuario está en la lista negra"]);
    }

    if (!isInWhitelist($phone)) {
        return json_encode(["error" => "El usuario no está en la lista blanca"]);
    }

    $pdo = getDatabaseConnection();

    $stmt = $pdo->prepare('SELECT * FROM totoUsers WHERE phone = ?');
    if (!$stmt) {
        echo json_encode(["error" => "Error en la preparación de la consulta updateLicense: " . implode(" ", $pdo->errorInfo())]);
        exit;
    }
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $pdo->prepare('UPDATE totoPremiumUsers SET totoLicense = ? WHERE totoUserId = ?');
        if (!$stmt) {
            echo json_encode(["error" => "Error en la preparación de la consulta updateLicense (actualizar licencia): " . implode(" ", $pdo->errorInfo())]);
            exit;
        }
        $stmt->execute([$newLicense, $user['id']]);
        return json_encode(["success" => "Licencia actualizada para el usuario con teléfono: $phone"]);
    } else {
        return json_encode(["error" => "Usuario no encontrado"]);
    }
}

function deleteLicense($phone)
{
    header('Content-Type: application/json');
    if (isInBlacklist($phone)) {
        return json_encode(["error" => "El usuario está en la lista negra"]);
    }

    if (!isInWhitelist($phone)) {
        return json_encode(["error" => "El usuario no está en la lista blanca"]);
    }

    $pdo = getDatabaseConnection();

    $stmt = $pdo->prepare('SELECT * FROM totoUsers WHERE phone = ?');
    if (!$stmt) {
        echo json_encode(["error" => "Error en la preparación de la consulta deleteLicense: " . implode(" ", $pdo->errorInfo())]);
        exit;
    }
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if ($user) {
        $stmt = $pdo->prepare('DELETE FROM totoPremiumUsers WHERE totoUserId = ?');
        if (!$stmt) {
            echo json_encode(["error" => "Error en la preparación de la consulta deleteLicense (eliminar licencia): " . implode(" ", $pdo->errorInfo())]);
            exit;
        }
        $stmt->execute([$user['id']]);
        return json_encode(["success" => "Licencia eliminada para el usuario con teléfono: $phone"]);
    } else {
        return json_encode(["error" => "Usuario no encontrado"]);
    }
}

try {
    header('Content-Type: application/json');
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['phone'])) {
        echo createLicense($_POST['phone']);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['phone'])) {
        echo getLicense($_GET['phone']);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['phone'])) {
        parse_str(file_get_contents("php://input"), $_PUT);
        echo updateLicense($_GET['phone'], $_PUT['newLicense']);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['phone'])) {
        echo deleteLicense($_GET['phone']);
    } else {
        http_response_code(405);
        echo json_encode(["warning" => "No se ha aportado un teléfono"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error en el servidor: " . $e->getMessage()]);
}
