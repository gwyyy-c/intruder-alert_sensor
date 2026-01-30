<?php
  require 'connection.php';

//if POST request, save detection data
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $sensor = $_POST['sensor'] ?? "";
  $distance = $_POST['distance'] ?? "";
  //validate input
//then insert into database
  if ($sensor !== "" && is_numeric($distance)) {
    $stmt = $pdo->prepare(
      "INSERT INTO detections (sensor_type, distance)
             VALUES (?, ?)"
    );
    $stmt->execute([$sensor, $distance]);

    echo "OK";
  } else {
    echo "INVALID_DATA";
  }
  exit;
}

// Fetch all detection records
$stmt = $pdo->query("SELECT sensor_type, distance, time_detected FROM detections ORDER BY time_detected");
$allrows = $stmt->fetchAll(PDO::FETCH_ASSOC);

?>