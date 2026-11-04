<?php
declare(strict_types=1);

$apiBaseUrl = rtrim(getenv('GPI_API_BASE_URL') ?: 'https://api.gpibd.com/api/v1', '/');
$siteBaseUrl = rtrim(getenv('GPI_SITE_URL') ?: 'https://www.gpibd.com', '/');
$certificateNumber = $_GET['certificate_number'] ?? '';

if (!is_string($certificateNumber) || !preg_match('/^[A-Za-z0-9-]{1,100}$/', $certificateNumber)) {
    http_response_code(400);
    exit('Invalid certificate number.');
}

$apiUrl = $apiBaseUrl . '/enrollments/certificates/verify/' . rawurlencode($certificateNumber) . '/';
$curl = curl_init($apiUrl);
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT => 8,
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
]);
$apiBody = curl_exec($curl);
$apiStatus = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
$curlError = curl_error($curl);
curl_close($curl);

if ($apiBody === false || $apiStatus !== 200) {
    error_log('Certificate share metadata lookup failed: ' . ($curlError ?: 'HTTP ' . $apiStatus));
    http_response_code(502);
    exit('Certificate verification is temporarily unavailable.');
}

$payload = json_decode($apiBody, true);
$certificate = is_array($payload) ? ($payload['data'] ?? null) : null;
if (
    !is_array($certificate) ||
    empty($payload['success']) ||
    empty($certificate['valid'])
) {
    http_response_code(404);
    exit('Certificate not found or no longer valid.');
}

function escapeMeta(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$canonicalUrl = $siteBaseUrl . '/certificate-verify/' . rawurlencode($certificateNumber);
$imageUrl = $apiBaseUrl . '/enrollments/certificates/share-card/' . rawurlencode($certificateNumber) . '.jpg';
$studentName = (string) ($certificate['student_name'] ?? 'GPI graduate');
$courseName = (string) ($certificate['course_name'] ?? 'a GPI course');
$title = $studentName . ' completed ' . $courseName . ' | GPI';
$description = 'Verify ' . $studentName . '\'s certificate for ' . $courseName . ', issued by Global Professional Institute.';
$imageAlt = 'Certificate awarded to ' . $studentName . ' for ' . $courseName;

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=600');
header('Vary: User-Agent');
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= escapeMeta($title) ?></title>
    <meta name="description" content="<?= escapeMeta($description) ?>">
    <link rel="canonical" href="<?= escapeMeta($canonicalUrl) ?>">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Global Professional Institute">
    <meta property="og:url" content="<?= escapeMeta($canonicalUrl) ?>">
    <meta property="og:title" content="<?= escapeMeta($title) ?>">
    <meta property="og:description" content="<?= escapeMeta($description) ?>">
    <meta property="og:image" content="<?= escapeMeta($imageUrl) ?>">
    <meta property="og:image:secure_url" content="<?= escapeMeta($imageUrl) ?>">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="<?= escapeMeta($imageAlt) ?>">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= escapeMeta($title) ?>">
    <meta name="twitter:description" content="<?= escapeMeta($description) ?>">
    <meta name="twitter:image" content="<?= escapeMeta($imageUrl) ?>">
    <meta name="twitter:image:alt" content="<?= escapeMeta($imageAlt) ?>">
</head>
<body>
    <p>Certificate verification: <a href="<?= escapeMeta($canonicalUrl) ?>"><?= escapeMeta($canonicalUrl) ?></a></p>
</body>
</html>
