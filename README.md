# Smart Accident Detection and Alert System 🚑

An IoT-based smart accident detection and alert system designed to automatically identify vehicle accidents and notify emergency contacts with real-time location details. The system aims to reduce emergency response time and enhance urban safety, supporting the vision of **Sustainable Cities and Communities (SDG 11)**.

---

##  Project Overview

Road accidents often result in delayed emergency response due to the inability of victims to report incidents manually. This project addresses that issue by using sensors and communication modules to **automatically detect accidents** and **send emergency alerts** with a live Google Maps location link.

The system works even when the victim is unconscious or unable to seek help, making it suitable for highways and urban environments.

---

##  System Features

- Automatic accident detection using motion and impact sensing  
- Real-time GPS location tracking  
- Emergency SMS alerts via GSM  
- Live Google Maps navigation link  
- False-alert minimization using threshold logic  
- Manual SOS and cancel options  
- Low-cost and scalable design  

---

##  Hardware Components

- ESP32 Development Board  
- MPU6050 Accelerometer & Gyroscope  
- Neo-6M GPS Module  
- SIM800L / SIM900 GSM Module  
- Buzzer and LED indicators  
- SOS and Cancel push buttons  
- Breadboard / PCB and jumper wires  

---

##  Software Stack

- Arduino IDE  
- Embedded C/C++  
- HTML, CSS, JavaScript (Web-based UI)  
- Google Maps (location navigation link)  

---

##  Working Principle

1. MPU6050 continuously monitors motion and impact data.  
2. ESP32 processes sensor data using threshold-based logic.  
3. On accident detection, GPS coordinates are captured.  
4. A live Google Maps link is generated.  
5. GSM module sends an emergency SMS alert to predefined contacts.  
6. Buzzer delay allows false-alert cancellation before alert transmission.  

---

##  Web Interface

A simplified web-based UI is implemented as an interface to:
- Display system status  
- Monitor alert activity  
- Access accident location links  

The interface is lightweight, open-source, and does not rely on closed platforms.

---

##  Applications

- Smart vehicles  
- Highway safety systems  
- Emergency response automation  
- Smart and sustainable city infrastructure  

---

##  Future Enhancements

- AI-based accident prediction  
- Automatic ambulance dispatch  
- Smart traffic signal integration  
- Cloud-based monitoring dashboard  

---

##  Team

**ResQ Tech**  
- Dilip V (Team Leader)  
- Dhilip Rajkumar S  
- Divakaran R  
- Hemchand A  

---

##  License

This project is open-source and intended for academic and educational purposes.

---

##  Acknowledgement

Inspired by existing IoT-based accident detection research and community-driven open-source projects aimed at improving road safety.
