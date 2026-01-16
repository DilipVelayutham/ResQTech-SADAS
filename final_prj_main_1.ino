#include <Wire.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

// ================= OBJECTS =================
TinyGPSPlus gps;
HardwareSerial gsmSerial(1);   // GSM
HardwareSerial gpsSerial(2);   // GPS

// ================= PINS =================
#define GPS_RX 16
#define GPS_TX 17
#define GSM_RX 26
#define GSM_TX 27

#define LED_PIN 33
#define BUZZER_PIN 25
#define CANCEL_BUTTON_PIN 32   // ONLY BUTTON

#define SDA_PIN 21
#define SCL_PIN 22
#define MPU_ADDR 0x68

// ================= SETTINGS =================
const float ACCIDENT_THRESHOLD = 5.0;      // g
const unsigned long CANCEL_DELAY = 10000;  // 10 seconds
const unsigned long ALERT_DURATION = 30000;
const char phoneNumber[] = "+916381502231";

// ================= STATE =================
enum SystemState { IDLE, DETECTING, ALERTING };
SystemState currentState = IDLE;

unsigned long stateTimer = 0;

// ================= FILTER =================
float prevAx = 0, prevAy = 0, prevAz = 0;
const float alpha = 0.8;

// ================= SETUP =================
void setup() {
  Serial.begin(115200);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(CANCEL_BUTTON_PIN, INPUT_PULLUP);

  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.setClock(100000);

  // MPU6050 init
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0x00);
  if (Wire.endTransmission() != 0) {
    Serial.println("❌ MPU6050 NOT DETECTED");
    while (1);
  }

  // GSM init
  gsmSerial.begin(9600, SERIAL_8N1, GSM_RX, GSM_TX);
  delay(3000);
  gsmSerial.println("AT");
  delay(1000);
  gsmSerial.println("AT+CMGF=1");
  delay(1000);
  gsmSerial.println("AT+CLIP=1"); // call info
  gsmSerial.println("AT+COLP=1"); // call progress

  // GPS init
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX, GPS_TX);

  Serial.println("✅ SMART ACCIDENT SYSTEM READY");
}

// ================= LOOP =================
void loop() {
  readGPS();

  switch (currentState) {

    case IDLE:
      detectAccident();
      break;

    case DETECTING:
      if (digitalRead(CANCEL_BUTTON_PIN) == LOW) {
        cancelAlert();
      } 
      else if (millis() - stateTimer >= CANCEL_DELAY) {
        triggerAlert("AUTOMATIC ACCIDENT DETECTED");
      }
      break;

    case ALERTING:
      if (millis() - stateTimer >= ALERT_DURATION) {
        resetSystem();
      }
      break;
  }

  delay(100);
}

// ================= FUNCTIONS =================

void readGPS() {
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }
}

void detectAccident() {
  float ax, ay, az;
  if (!readAcceleration(ax, ay, az)) return;

  ax = alpha * (ax - prevAx);
  ay = alpha * (ay - prevAy);
  az = alpha * (az - prevAz);

  prevAx = ax;
  prevAy = ay;
  prevAz = az;

  float magnitude = sqrt(ax * ax + ay * ay + az * az);

  // REQUIRED SERIAL PRINT
  Serial.print("Accel (g): X=");
  Serial.print(ax, 2);
  Serial.print(" Y=");
  Serial.print(ay, 2);
  Serial.print(" Z=");
  Serial.print(az, 2);
  Serial.print(" | Magnitude=");
  Serial.println(magnitude, 2);

  if (magnitude > ACCIDENT_THRESHOLD) {
    currentState = DETECTING;
    stateTimer = millis();
    digitalWrite(LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    Serial.println("⚠️ Accident detected — press CANCEL within 10s");
  }
}

bool readAcceleration(float &ax, float &ay, float &az) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) != 0) return false;

  Wire.requestFrom(MPU_ADDR, 6);
  if (Wire.available() < 6) return false;

  ax = (Wire.read() << 8 | Wire.read()) / 16384.0;
  ay = (Wire.read() << 8 | Wire.read()) / 16384.0;
  az = (Wire.read() << 8 | Wire.read()) / 16384.0;
  return true;
}

void cancelAlert() {
  currentState = IDLE;
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("❌ ALERT CANCELLED — SMS & CALL STOPPED");
}

void triggerAlert(String reason) {
  currentState = ALERTING;
  stateTimer = millis();

  String msg = reason;
  msg += "\nEmergency Alert\nAccident Detected!";

  if (gps.location.isValid()) {
    msg += "\nhttps://maps.google.com/?q=";
    msg += String(gps.location.lat(), 6);
    msg += ",";
    msg += String(gps.location.lng(), 6);
  } else {
    msg += "\nGPS NOT FIXED";
  }

  // PRINT SMS CONTENT
  Serial.println("=================================");
  Serial.println("📩 SMS MESSAGE:");
  Serial.println(msg);
  Serial.println("=================================");

  sendSMS(msg.c_str());
  makeEmergencyCall();
}

void resetSystem() {
  currentState = IDLE;
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("🔄 System reset");
}

void sendSMS(const char* msg) {
  gsmSerial.print("AT+CMGS=\"");
  gsmSerial.print(phoneNumber);
  gsmSerial.println("\"");
  delay(1000);
  gsmSerial.print(msg);
  gsmSerial.write(26);
  Serial.println("✅ SMS SENT");
}

void makeEmergencyCall() {
  Serial.println("📞 Making emergency call...");

  gsmSerial.print("ATD");
  gsmSerial.print(phoneNumber);
  gsmSerial.println(";");

  unsigned long start = millis();
  while (millis() - start < 5000) {
    if (gsmSerial.available()) {
      Serial.write(gsmSerial.read()); // show GSM response
    }
  }

  delay(30000);   // keep call active
  gsmSerial.println("ATH");
  Serial.println("📴 Call ended");
}
