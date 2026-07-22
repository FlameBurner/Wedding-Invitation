<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $data): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function database(): PDO {
    $host = getenv('DB_HOST') ?: (getenv('MYSQLHOST') ?: '127.0.0.1');
    $port = getenv('DB_PORT') ?: (getenv('MYSQLPORT') ?: '3306');
    $name = getenv('DB_NAME') ?: (getenv('MYSQLDATABASE') ?: 'wedding_invitation');
    $user = getenv('DB_USER') ?: (getenv('MYSQLUSER') ?: 'root');
    $pass = getenv('DB_PASSWORD') ?: (getenv('MYSQLPASSWORD') ?: '');
    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
    return new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
}

function value(array $input, string $key, int $max, bool $required = true): string {
    $text = trim((string)($input[$key] ?? ''));
    if ($required && $text === '') respond(422, ['error' => "{$key} is required."]);
    if (mb_strlen($text) > $max) respond(422, ['error' => "{$key} is too long."]);
    return $text;
}

try {
    $db = database();
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $rows = $db->query('SELECT name, wish, created_at FROM wishes ORDER BY created_at DESC LIMIT 100')->fetchAll();
        respond(200, ['wishes' => $rows]);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['error' => 'Method not allowed.']);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) respond(400, ['error' => 'Invalid request body.']);
    $action = $input['action'] ?? '';
    if ($action === 'rsvp') {
        $name = value($input, 'name', 100);
        $attendance = value($input, 'attendance', 20);
        if (!in_array($attendance, ['Hadir', 'Tidak hadir'], true)) respond(422, ['error' => 'Invalid attendance.']);
        $message = value($input, 'message', 1000, false);
        $db->prepare('INSERT INTO rsvps (name, attendance, message) VALUES (?, ?, ?)')->execute([$name, $attendance, $message ?: null]);
        respond(201, ['message' => 'RSVP saved.']);
    }
    if ($action === 'wish') {
        $name = value($input, 'name', 100);
        $wish = value($input, 'wish', 1000);
        $db->prepare('INSERT INTO wishes (name, wish) VALUES (?, ?)')->execute([$name, $wish]);
        respond(201, ['message' => 'Wish saved.']);
    }
    respond(400, ['error' => 'Unknown action.']);
} catch (PDOException $error) {
    error_log($error->getMessage());
    respond(503, ['error' => 'Database is unavailable. Check the database configuration.']);
}
