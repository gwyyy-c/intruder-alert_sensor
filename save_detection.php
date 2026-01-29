<?php
$host = "localhost";
$dbname = "intruder_detection_sys";
$username = "root";                
$password = "";                   

//connect to database
try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
  exit;
}



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



<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <table border="1">
    <tr>
      <th>Sensor Type</th>
      <th>Distance</th>
      <th>Time Detected</th>
    </tr>
    <?php foreach ($allrows as $row): ?>
      <tr>
        <td>
          <?php echo htmlspecialchars($row['sensor_type']); ?>
        </td>
        <td>
          <?php echo htmlspecialchars($row['distance']); ?>
        </td>
        <td>
          <?php echo htmlspecialchars($row['time_detected']); ?>
        </td>
      </tr>
    <?php endforeach; ?>
  </table>
</body>

</html>