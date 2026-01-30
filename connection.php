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
?>