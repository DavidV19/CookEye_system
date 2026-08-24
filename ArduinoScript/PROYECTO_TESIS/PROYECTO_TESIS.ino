#include <Arduino.h>
#include <WiFi.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_MLX90640.h>
#include <SPI.h>
#include "max6675.h"

// ---------------------- Configuración ----------------------
#define ONE_WIRE_BUS 4      // DS18B20
#define RELAY_PIN 14        // Control de transistor (GPIO14 -> base 2N2222 con R)

// Pines I2C MLX90640
#define I2C_SDA 22
#define I2C_SCL 23

// MAX6675 (SPI VSPI)
const int thermoSO = 19;
const int thermoCS = 5;
const int thermoSCK = 18;
//MAX6675 thermocouple(thermocouple(thermoSCK, thermoCS, thermoSO)); // << corregir más abajo si tu IDE se queja
// CORRECCIÓN: si da error la línea anterior, usa esta:
MAX6675 thermocouple_fix(thermoSCK, thermoCS, thermoSO);

// Wi-Fi
const char* ssid = "XTRIM_FAMILIA VELOZ_5G";
const char* password = "luisleonidas1957";

// Backend
const char* dataUrl = "http://192.168.1.7:5000/api/temperature_data";
// Si quieres quitar también el current-process, comenta la función getProcessId() y usa un processId fijo.
const char* currentProcessUrl = "http://192.168.1.7:5000/api/current-process";

// ---------------------- Objetos ----------------------
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
Adafruit_MLX90640 mlx;
float frame[32 * 24];  // 768 elementos

// Estados
int tempMin = 20, tempMax = 25; // valores por defecto (ajusta)
bool relayState = false;        // false = apagado, true = encendido
float hysteresis = 0.5;

// ---------------------- Setup ----------------------
void setup() {
  Serial.begin(9600);

  // I2C para MLX90640
  Wire.begin(I2C_SDA, I2C_SCL);
  Wire.setClock(1000000);

  sensors.begin();

  if (!mlx.begin(MLX90640_I2CADDR_DEFAULT, &Wire)) {
    Serial.println("MLX90640 no encontrado");
    while (1);
  }

  mlx.setMode(MLX90640_CHESS);
  mlx.setResolution(MLX90640_ADC_18BIT);
  mlx.setRefreshRate(MLX90640_8_HZ);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Relé apagado al inicio (con transistor)

  // Conectar WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConectado a Wi-Fi");

  // Ya no llamamos a updateActiveConfig()
}

// ---------------------- Loop ----------------------
void loop() {
  // Si NO quieres usar current-process del backend, comenta estas 3 líneas y usa processId = 1 (por ejemplo)
  int processId = getProcessId();
  if (processId == -1) {
    Serial.println("No se pudo obtener process_id (usando 1 por defecto)");
    processId = 1; // <-- quita esta línea si prefieres esperar al backend
  }

  // ------------------ Sensores ------------------
  sensors.requestTemperatures();
  float tempAmbiente = sensors.getTempCByIndex(0);

  if (tempAmbiente == DEVICE_DISCONNECTED_C) {
    Serial.println("DS18B20 desconectado");
    delay(3000);
    return;
  }

  // Si usaste la corrección del MAX6675, cambia el nombre del objeto aquí:
  float tempTermocupla =
      #ifdef thermocouple
        thermocouple.readCelsius();
      #else
        thermocouple_fix.readCelsius();
      #endif

  if (isnan(tempTermocupla) || tempTermocupla <= 0.0) {
    Serial.println("Error con MAX6675");
    delay(3000);
    return;
  }

  if (mlx.getFrame(frame) != 0) {
    Serial.println("Error leyendo MLX90640");
    delay(3000);
    return;
  }

  // ------------------ Control de Relé con histéresis (sobre límite superior) ------------------
  // Enciende si supera tempMax; apaga cuando baja a tempMax - h
  if (!relayState && tempAmbiente >= tempMax) {
    digitalWrite(RELAY_PIN, HIGH);  // 🔥 Enciende turbina
    relayState = true;
    Serial.println("Relé ENCENDIDO (sobre límite)");
  } else if (relayState && tempAmbiente <= (tempMax - hysteresis)) {
    digitalWrite(RELAY_PIN, LOW);   // ❄️ Apaga turbina
    relayState = false;
    Serial.println("Relé APAGADO (debajo del límite - histéresis)");
  }

  // ------------------ Enviar datos ------------------
  DynamicJsonDocument jsonDoc(4096);
  jsonDoc["sensor_id"] = 2;
  jsonDoc["process_id"] = processId;
  jsonDoc["temperature_ambiente"] = tempAmbiente;
  jsonDoc["temperature_termocupla"] = tempTermocupla;

  JsonArray matrix = jsonDoc.createNestedArray("matrix");
  for (int i = 0; i < 768; i++) {
    matrix.add(frame[i]);
  }

  String output;
  serializeJson(jsonDoc, output);
  sendPostData(output);

  delay(3000);
}

// ---------------------- Funciones auxiliares ----------------------
int getProcessId() {
  if (WiFi.status() != WL_CONNECTED) return -1;

  HTTPClient http;
  http.begin(currentProcessUrl);
  int code = http.GET();
  int id = -1;

  if (code == 200) {
    String response = http.getString();
    DynamicJsonDocument doc(256);
    DeserializationError err = deserializeJson(doc, response);
    if (err == DeserializationError::Ok && doc.containsKey("process_id")) {
      id = doc["process_id"];
    } else {
      Serial.println("JSON inválido en /current-process");
    }
  } else {
    Serial.printf("HTTP %d en /current-process\n", code);
  }

  http.end();
  return id;
}

void sendPostData(String payload) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(dataUrl);
  http.addHeader("Content-Type", "application/json");

  int code = http.POST(payload);
  if (code > 0) {
    Serial.print("Código HTTP recibido: ");
    Serial.println(code);
    String response = http.getString();
    Serial.print("Respuesta del servidor: ");
    Serial.println(response);
  } else {
    Serial.println("Error al enviar datos.");
  }

  http.end();
}
