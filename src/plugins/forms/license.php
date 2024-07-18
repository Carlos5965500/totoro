<?php
session_start();

// Variables de autenticación
$valid_username = "admin";
$valid_password = "password";
$error_message = "";
$response_message = "";

// Manejar el login
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['login'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];

    if ($username === $valid_username && $password === $valid_password) {
        $_SESSION['username'] = $username;
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit();
    } else {
        $error_message = "Nombre de usuario o contraseña incorrectos";
    }
}

// Manejar la creación de licencias
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['create_license'])) {
    $phone = $_POST['phone'];
    // Lógica para crear una licencia aquí
    // Supongamos que guardamos la licencia en una base de datos o archivo
    $license = "LIC-" . rand(1000, 9999); // Generar una licencia falsa para demostrar

    // Guardar la licencia en la sesión (solo para demostración)
    if (!isset($_SESSION['licenses'])) {
        $_SESSION['licenses'] = [];
    }
    $_SESSION['licenses'][] = ['id' => count($_SESSION['licenses']) + 1, 'phone' => $phone, 'license' => $license];

    $response_message = "Licencia creada: $license";
}

// Cerrar sesión
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit();
}

// Obtener las licencias
$licenses = isset($_SESSION['licenses']) ? $_SESSION['licenses'] : [];
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Licencias API</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap">
    <style>
        /* Global Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            text-decoration: none;
            font-family: 'Poppins', sans-serif;
        }

        :root {
            --bg-color: #1B2138;
            /* Azul oscuro para el fondo */
            --text-color: #FFD700;
            /* Amarillo claro para el texto principal */
            --accent-color: #F27D79;
            /* Rosado anaranjado para acentos */
            --shadow-color: #0B0E1A;
            /* Azul marino oscuro para sombras */
            --black-color: #000000;
            /* Negro para siluetas y texto */
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-size: 62.5%;
            background-image: url('https://fotografias-neox.atresmedia.com/clipping/cmsimages02/2020/05/25/9C8FD6E8-1A67-4BAC-B6E2-C3C28DD446D4/98.jpg?crop=1827,1028,x0,y0&width=1900&height=1069&optimize=high&format=webply');
            /* Cambia esto a la ruta de tu imagen */
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
        }

        .header {
            position: fixed;
            top: 0;
            width: 100%;
            padding: 2rem 9%;
            background: rgba(27, 33, 56, 0.9);
            /* Semitransparente */
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }

        .logo {
            font-size: 2.5rem;
            font-weight: 600;
        }

        .navbar {
            list-style-type: none;
            display: flex;
        }

        .navbar a {
            font-size: 1.7rem;
            color: var(--text-color);
            margin-left: 4rem;
            transition: .3s;
        }

        .navbar a:hover,
        .navbar a.active {
            color: var(--accent-color);
        }

        #menu-icon {
            display: none;
            font-size: 3.6rem;
            color: var(--text-color);
        }

        .home {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 10rem 9% 2rem;
            text-align: center;
            background: rgba(0, 0, 0, 0.5);
            /* Semitransparente para mejor legibilidad */
            border-radius: 1rem;
        }

        .home h1 {
            font-size: 5.6rem;
            font-weight: 700;
        }

        .home span {
            color: var(--accent-color);
        }

        .home p {
            font-size: 1.6rem;
            margin: 2rem 0;
        }

        .btn {
            display: inline-block;
            padding: 1rem 2.8rem;
            background: var(--accent-color);
            border-radius: 4rem;
            font-size: 1.6rem;
            color: var(--black-color);
            font-weight: 600;
            transition: .3s;
            text-decoration: none;
        }

        .btn:hover {
            background: var(--text-color);
            color: var(--bg-color);
        }

        .form-container {
            margin-top: 3rem;
        }

        .form-container input {
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 0.5rem;
            border: 1px solid var(--accent-color);
            width: calc(100% - 2rem);
        }

        .form-container button {
            padding: 1rem 2.8rem;
            background: var(--accent-color);
            border: none;
            border-radius: 4rem;
            font-size: 1.6rem;
            color: var(--black-color);
            font-weight: 600;
            cursor: pointer;
            transition: .3s;
        }

        .form-container button:hover {
            background: var(--text-color);
            color: var(--bg-color);
        }

        .response {
            margin-top: 2rem;
            font-size: 1.6rem;
            color: var(--accent-color);
        }

        @media (max-width: 1068px) {
            html {
                font-size: 55%;
            }

            .navbar {
                position: absolute;
                top: 100%;
                left: -100%;
                width: 100%;
                height: 100vh;
                background: rgba(27, 33, 56, 0.9);
                /* Semitransparente */
                flex-direction: column;
                justify-content: center;
                align-items: center;
                transition: 0.3s;
            }

            .navbar a {
                margin: 1.5rem 0;
                font-size: 2rem;
            }

            .navbar.active {
                left: 0;
            }

            #menu-icon {
                display: block;
                cursor: pointer;
            }
        }

        .container {
            width: 90%;
            margin: 0 auto;
            padding: 2rem 0;
        }

        .row {
            display: flex;
            flex-wrap: wrap;
            margin: 0 -1rem;
        }

        .col-md-12 {
            width: 100%;
            padding: 0 1rem;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 1.6rem;
        }

        .form-group input {
            width: 100%;
            padding: 0.8rem;
            border-radius: 0.5rem;
            border: 1px solid var(--accent-color);
            font-size: 1.6rem;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2rem;
        }

        table,
        th,
        td {
            border: 1px solid var(--accent-color);
        }

        th,
        td {
            padding: 1rem;
            text-align: left;
        }
    </style>
</head>

<body>

    <!-- Header -->
    <header class="header">
        <div class="logo">Totoro</div>
        <nav>
            <ul class="navbar">
                <li><a href="#home" class="active">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
                <?php if (isset($_SESSION['username'])) : ?>
                    <li><a href="?logout=true">Logout</a></li>
                <?php endif; ?>
            </ul>
        </nav>
        <div id="menu-icon">&#9776;</div>
    </header>

    <!-- Home Section -->
    <section class="home" id="home">
        <div>
            <h1>Totoro<span> tu bot multipropósito</span></h1>
            <p><a href="#login" class="btn">Login</a></p>
        </div>
    </section>

    <!-- Login Section -->
    <?php if (!isset($_SESSION['username'])) : ?>
        <section class="home" id="login">
            <div class="container">
                <h1 style="text-align: center; margin-bottom: 2rem;"> Login</h1>
                <?php if (!empty($error_message)) : ?>
                    <p style="color: var(--accent-color);"><?php echo $error_message; ?></p>
                <?php endif; ?>
                <form method="POST" action="">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" name="login" class="btn">Login</button>
                </form>
            </div>
        </section>
    <?php endif; ?>

    <!-- Licenses Section -->
    <?php if (isset($_SESSION['username'])) : ?>
        <section class="home" id="licenses">

            <!-- Header -->
            <header class="header">
                <div class="logo">Totoro</div>
                <nav>
                    <ul class="navbar">
                        <li><a href="#home" class="active">Home</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#licenses">Services</a></li>
                        <li><a href="#contact">Contact</a></li>
                        <?php if (isset($_SESSION['username'])) : ?>
                            <li><a href="?logout=true">Logout</a></li>
                        <?php endif; ?>
                    </ul>
                </nav>
                <div id="menu-icon">&#9776;</div>
            </header>
            <div>
                <h1>Welcome to <span>Licencias API</span></h1>
                <p>Manage your licenses efficiently and effectively with our API.</p>
                <a href="#services" class="btn">Learn More</a>

                <?php if (isset($_SESSION['username'])) : ?>
                    <div class="form-container">
                        <input type="text" id="phone" name="phone" placeholder="Enter phone number">
                        <button id="create-license">Create License</button>
                        <div class="response" id="response"></div>
                    </div>
                <?php else : ?>
                    <p>Please log in to create a license.</p>
                <?php endif; ?>
            </div>
        </section>
        <section class="home" id="licenses">
            <div class="container" style=" font-size: 1.6rem; ">
                <h1 style="text-align: center; margin-bottom: 2rem;"> Licenses</h1>
                <table>
                    <thead>
                        <tr style="
                        background: var(--accent-color);
                        color: var(--bg-color); 
                        column-width: 8%;
                        text-align: center;
                        ">
                            <th style="width: 8%; text-align: center;"> ID</th>
                            <th style="width: 20%;text-align: center;"> Phone</th>
                            <th style="text-align: center;"> License</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($licenses as $license) : ?>
                            <tr>
                                <td><?php echo $license['id']; ?></td>
                                <td><?php echo $license['phone']; ?></td>
                                <td><?php echo $license['license']; ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </section>
    <?php endif; ?>
    <!-- Script for the mobile menu -->
    <script>
        document.getElementById('menu-icon').addEventListener('click', function() {
            document.querySelector('.navbar').classList.toggle('active');
        });

        document.getElementById('create-license').addEventListener('click', function() {
            const phone = document.getElementById('phone').value;
            fetch('', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `phone=${phone}&create_license=true`
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data); // Log the response for debugging
                    if (data.success) {
                        document.getElementById('response').innerText = `Licencia creada: ${data.license}`;
                    } else if (data.message === " Licencia ya existe") {
                        document.getElementById('response').innerText = "La licencia ya existe.";
                    } else {
                        document.getElementById('response').innerText = `Error: ${data.message || 'Respuesta inesperada del servidor' }`;
                    }
                }).catch(error => {
                    document.getElementById('response').innerText = 'Error: ' + error;
                });
        });
    </script>

</body>

</html>