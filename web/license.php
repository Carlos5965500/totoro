<?php
session_start();

// Datos de conexión a la base de datos
$host = 'nodo.cinammon.es';
$db = 's4_totoro';
$user = 'u4_ZzjLwctXqJ';
$pass = '^soWpcozR3W07ZMXDmr^Tb8q';
$charset = 'utf8mb4';
$port = '3306';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset;port=$port";

// Conectar a la base de datos
try {
    $conn = new PDO($dsn, $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    exit();
}

$error_message = "";

// Manejar el login
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['login'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Verificar si el usuario existe en la base de datos
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['username'] = $username;
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit();
    } else {
        $error_message = "Nombre de usuario o contraseña incorrectos";
    }
}

// Cerrar sesión
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>totorobot.wa</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap">
    <style>
        @keyframes slideIn {
            0% {
                transform: translateX(100%);
                opacity: 0;
            }

            100% {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            0% {
                transform: translateX(0);
                opacity: 1;
            }

            100% {
                transform: translateX(-100%);
                opacity: 0;
            }
        }

        /* Global Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            text-decoration: none;
            border: none;
            outline: none;
            scroll-behavior: smooth;
            font-family: 'Poppins', sans-serif;
        }

        :root {
            --bg-color: rgba(9, 9, 10, 0.4);
            --text-color: rgba(255, 215, 0, 0.9);
            --accent-color: rgba(242, 125, 121, 0.8);
            --shadow-color: rgba(11, 14, 26, 0.2);
            --black-color: rgba(0, 0, 0, 0.3);
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            font-size: 62.5%;
            height: 100vh;
            overflow: hidden;
            background-image: url('https://fondosmil.co/fondo/56260.jpg');
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
        }

        .bot-container {
            background-size: cover;
            background-repeat: no-repeat;
            background-position: center;
            background-color: var(--container-bg-color);
            padding: 2rem;
            border-radius: 1rem;
            width: 80%;
            max-width: 600px;
            color: var(--container-text-color);
            transition: background-image 0.5s;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .bot-container.show {
            animation: slideIn 1s forwards;
        }

        .bot-container.hide {
            animation: slideOut 1s forwards;
        }

        .header {
            position: fixed;
            top: 0;
            width: 100%;
            text-size-adjust: 100%;
            padding: 0.3rem 2%;
            background: var(--bg-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }

        .header .logo {
            display: flex;
            align-items: center;
            font-size: 2.5rem;
            font-weight: 600;
        }

        .header .logo img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 1rem;
        }

        .header.sticky {
            border-bottom: .1rem solid rgba(0, 0, 0, .2);
        }

        .navbar {
            list-style-type: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            background-color: #000;
        }

        .navbar a {
            font-size: 1.7rem;
            color: var(--text-color);
            margin-left: 4rem;
            transition: .3s;
            cursor: pointer;
        }

        h1 {
            margin: 0;
            padding: 1rem;
            background-color: var(--header-bg-color);
            border-radius: 1rem;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            transition: background-image 0.5s;
            opacity: 0;
            animation: slideIn 1s forwards;
        }

        .message-container {
            margin-top: 1rem;
        }

        .message {
            font-size: 1.2rem;
            background-color: var(--message-bg-color);
            padding: 1rem;
            border-radius: 0.5rem;
            opacity: 0;
            animation: slideIn 1s forwards;
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

        .section {
            display: none;
        }

        .section.active {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 10rem 9% 2rem;
            text-align: center;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 1rem;
        }

        .section h1 {
            font-size: 5.6rem;
            font-weight: 700;
        }

        .section span {
            color: var(--accent-color);
        }

        .section p {
            font-size: 1.6rem;
            margin: 2rem 0;
        }

        .btn {
            display: inline-block;
            padding: 1rem 2.8rem;
            border-radius: 4rem;
            font-size: 1.6rem;
            font-weight: 600;
            transition: .3s;
            color: var(--text-color);
            background: var(--bg-color);
            text-decoration: none;
            cursor: pointer;
        }

        .btn:hover {
            background: var(--accent-color);
            color: var(--black-color);
        }

        .form-container {
            margin-top: 3rem;
            text-align: center;
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
                background: var(#000);
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

        th {
            background: var(--accent-color);
            color: var(--bg-color);
            text-align: center;
        }

        .option-container {
            display: flex;
            justify-content: space-around;
            margin: 3rem 0;
        }

        .option-container a {
            padding: 1rem 2rem;
            background: var(--accent-color);
            border-radius: 4rem;
            font-size: 1.6rem;
            color: var(--black-color);
            font-weight: 600;
            text-decoration: none;
            transition: .3s;
        }

        .option-container a:hover {
            background: var(--text-color);
            color: var(--bg-color);
        }

        .api-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 2rem;
        }

        .api-container a {
            margin: 0.5rem 0;
            font-size: 1.6rem;
            color: var(--accent-color);
            text-decoration: underline;
        }

        .api-container a:hover {
            color: var(--text-color);
        }

        .dashboard-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .dashboard-container .form-container {
            width: 100%;
            max-width: 600px;
        }

        .dashboard-container table {
            margin-top: 2rem;
            width: 100%;
            max-width: 800px;
        }

        .dashboard-container th,
        .dashboard-container td {
            text-align: center;
        }

        .back-button {
            margin-top: 2rem;
            font-size: 1.6rem;
            color: var(--accent-color);
            text-decoration: underline;
            cursor: pointer;
        }
    </style>
</head>

<body>

    <!-- Header -->
    <header class="header">
        <div class="logo">
            <img style=" width: 100px; height: 100px;" src="https://i.ibb.co/j9N5kj3/image.jpg" alt="Login Image">
            <p>totoro</p>
        </div>
        <nav>
            <ul class="navbar">
                <li><a data-section="home">Home</a></li>
                <li><a data-section="about">About</a></li>
                <li><a data-section="services">Services</a></li>
                <li><a data-section="contact">Contact</a></li>
                <?php if (isset($_SESSION['username'])) : ?>
                    <li><a data-section="selection">Dashboard</a></li>
                    <li><a href="?logout=true">Logout</a></li>
                <?php endif; ?>
            </ul>
        </nav>
        <div id="menu-icon">&#9776;</div>
    </header>

    <!-- Home Section -->
    <section class="section" id="home">
        <div>
            <h1>Totoro<span> tu bot multipropósito</span></h1>
            <?php if (isset($_SESSION['username'])) : ?>
                <p>Bienvenido, <?php echo $_SESSION['username']; ?></p>
            <?php else : ?>
                <div class="bot-container show" id="bot-container">
                    <h1 id="bot-header">¡Hola! Soy Totoro</h1>
                    <div class="message-container" id="message-container">
                        <p class="message" id="message">Como Totoro, fui creado por Nia con el propósito de hacer su experiencia de usuario más fluida, intuitiva y eficiente.</p>
                    </div>
                </div>
            <?php endif; ?>
            <?php if (isset($_SESSION['username'])) : ?>
                <p><span class="btn" data-section="selection">Dashboard</span></p>
            <?php else : ?>
                <p><span class="btn" data-section="login">Login</span></p>
            <?php endif; ?>
        </div>
    </section>

    <!-- Login Section -->
    <section class="section" id="login">
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
                <div class="back-button" data-section="home">Atrás</div>
            </form>
        </div>
    </section>

    <!-- Section de Selección -->
    <section class="section" id="selection">
        <div class="container">
            <h1 style="text-align: center; margin-bottom: 2rem;"> Selecciona una opción</h1>
            <div class="option-container">
                <a class="btn" data-section="api">APIs</a>
                <a class="btn" data-section="commands">Comandos</a>
            </div>
            <div class="back-button" data-section="home">Atrás</div>
        </div>
    </section>

    <!-- APIs Section -->
    <section class="section" id="api">
        <div class="container">
            <h1> APIs Disponibles</h1>
            <div class="api-container">
                <a class="btn" data-section="licenses">API de Licencias</a>
                <!-- Aquí puedes agregar más enlaces a otras APIs -->
            </div>
            <div class="back-button" data-section="selection">Atrás</div>
        </div>
    </section>

    <!-- Licenses Dashboard Section -->
    <section class="section" id="licenses">
        <div class="container">
            <h1 style="text-align: center; margin-bottom: 2rem;">Licencias API Dashboard</h1>
            <div class="dashboard-container">
                <div class="form-container">
                    <form method="POST" action="">
                        <input type="text" id="phone" name="phone" placeholder="Enter phone number" required>
                        <button type="submit" name="create_license">Create License</button>
                    </form>
                    <div class="response"><?php echo $response_message; ?></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Phone</th>
                            <th>License</th>
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
            <div class="back-button" data-section="api">Atrás</div>
        </div>
    </section>

    <!-- Script for the mobile menu and navigation -->
    <script>
        document.getElementById('menu-icon').addEventListener('click', function() {
            document.querySelector('.navbar').classList.toggle('active');
        });

        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.navbar a');
        const buttons = document.querySelectorAll('.btn, .back-button');

        buttons.forEach(button => {
            button.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                if (sectionId) {
                    sections.forEach(section => {
                        section.classList.remove('active');
                    });
                    document.getElementById(sectionId).classList.add('active');
                }
            });
        });

        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                if (sectionId) {
                    sections.forEach(section => {
                        section.classList.remove('active');
                    });
                    document.getElementById(sectionId).classList.add('active');
                }
            });
        });

        // Show the home section by default
        document.getElementById('home').classList.add('active');
    </script>

</body>

</html>