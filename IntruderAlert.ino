//library for the arduino to connect to wifi
#include <WiFiS3.h>
//variables for wifi
const char* ssid = ""; //SSID of your WiFi
const char* password = ""; //WiFi Password
const char* server = ""; //change to your IP address
//this declares the arduino as a network client
WiFiClient client;
 
//pins
const int trigPin = 11;
const int echoPin = 10;
const int redLight = 7;
const int buzzer = 9;
 
//declaration of variables to be used later
long duration;
int distance;
String query;
String response;
 
void setup() {
pinMode(trigPin, OUTPUT);
pinMode(echoPin, INPUT);
pinMode(redLight, OUTPUT);
pinMode(buzzer, OUTPUT);
 
Serial.begin(115200); //initializes serial conn
Serial.print("Connecting to WiFi...");
WiFi.begin(ssid, password); //connect to wifi
 
//while connection is not established,
//count to 20
int attempts = 0;
while (WiFi.status() != WL_CONNECTED && attempts < 20) {
delay(500);
// FIXED: Separated these to allow compilation
Serial.print("Still trying to connect.. Attempt: ");
Serial.println(attempts);
attempts++;
}
 
//if counting is over, (either it has connected or failed)
//if connected
if (WiFi.status() == WL_CONNECTED) {
Serial.println("\nConnected to Wifi");
} else {
//if it failed to connect
Serial.println("\nFailed to connect to WiFi");
Serial.println("\n Please reset or troubleshoot.");
}
}
 
void loop() {
// Trigger sensor
digitalWrite(trigPin, LOW);
delayMicroseconds(2);
digitalWrite(trigPin, HIGH);
delayMicroseconds(10);
digitalWrite(trigPin, LOW);
 
duration = pulseIn(echoPin, HIGH);
distance = duration * 0.034 / 2; //compute distance
 
// Trigger if closer than 35cm
if (distance > 0 && distance < 35) {
digitalWrite(redLight, HIGH);
tone(buzzer, 800);
Serial.println("ALERT! Motion detected at " + String(distance) + "cm");
 
query = "sensor=Ultrasonic&distance=" + String(distance); //the actual data its gonna send
 
//build the post request once connected to the server
//and send it
if(client.connect(server, 80)) {
Serial.print("Connection to server: ");
Serial.println(server);
Serial.println("Connection established successfully");
Serial.println("Sending data..");
 
//header
client.println("POST /Actual04/save_detection.php HTTP/1.1");
client.print("Host: "); client.println(server);
client.println("Content-Type: application/x-www-form-urlencoded");
client.println("Content-Length: " + String(query.length()));
client.println();
 
//post data
Serial.println("POST data: " + query);
client.print(query);
 
response = "";
unsigned long startTime = millis();
//while there's still unread data that has alr arrived at arduino
//OR the connection hasnt closed yet
//theres a 3 sec timeout
while ((client.connected() || client.available()) && millis() - startTime < 3000) {
if (client.available()) //if there's still atleast 1 byte in the buffer
{
//read and print it
response += (char)client.read();
}
}
client.stop(); //stop connection if server is done responding
 
if (response.indexOf("OK") >= 0) {
Serial.println("Server saved data successfully");
} else {
Serial.println("Server error");
}
} else {
Serial.println("Can't connect to server");
}
 
delay(5000);
 
} else {
digitalWrite(redLight, LOW);
noTone(buzzer);
}
 
delay(100);
}
