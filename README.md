# Book a Doctor App – Healthcare Booking Platform (Indian Edition 🇮🇳)

The **Book a Doctor App** is an innovative healthcare booking platform designed to streamline the process of connecting patients with healthcare providers. This system enables users to easily find, schedule, and manage medical appointments, all within a user-friendly interface. By offering functionalities like doctor browsing, appointment scheduling, and secure document uploading, the app caters to the needs of patients, doctors, and administrators alike.

The platform bridges the gap between patients, doctors, and administrators, offering a user-friendly interface with essential features such as doctor browsing, appointment scheduling, secure document uploads, and notifications. By digitizing appointment management, the app reduces the time and effort patients spend searching for doctors, while also allowing doctors to manage their schedules efficiently.

---

## 🔑 Pre-Configured Test Credentials

Use these credentials directly in the Login screen to try out different roles and capabilities:

*   **👑 Administrator**:
    *   **Email**: `admin@medibook.com`
    *   **Password**: `admin123`
*   **🩺 Vetted Doctor (Cardiology)**:
    *   **Email**: `sharma@medibook.com`
    *   **Password**: `doctor123`
*   **👤 Registered Patient**:
    *   **Email**: `patient@medibook.com`
    *   **Password**: `patient123`
*   **⏳ Pending Doctor (Neurology)**:
    *   **Email**: `deshmukh@medibook.com`
    *   **Password**: `doctor123` *(Log in as Admin to review and approve this provider!)*

---

## 🛠️ Skills Required
*   **Cascading Style Sheets (CSS)**
*   **Node.js (JavaScript Runtime & Library)**
*   **Express.js (JavaScript REST API Framework)**
*   **React.js (JavaScript Frontend Library)**
*   **MongoDB / Local Document Validation Storage**
*   **JavaScript & TypeScript (Programming Languages)**

---

## 📊 Project Stats & Metadata
*   **Epics**: Total Epics: 6
*   **Stories & Subtasks**: Total Tasks: 19 | Total Subtasks: 0
*   **Mentor**: No mentor assigned yet
*   **Assigned to**: Durga Venkata Prasad Rapeti

---

## 🏗️ Technical Architecture (MVC Model)

The Book a doctor application follows the **Model-View-Controller (MVC)** architectural pattern, separating concerns into three highly modular and maintainable layers:

### 1. Model Layer (Data Layer)
Responsible for handling all data-related logic. This includes the definition of data schemas and the operations performed on the database. In the server environment, this handles data schemas, seeding, and secure local validation modeling.

### 2. Controller Layer
Acts as an intermediary between the routing/view layer and the model. It receives incoming requests, processes input parameters (performing validations or transformations), executes clinical workflow queries, and returns responses.

### 3. View Layer (Routing Layer)
In the backend REST API context, this is implemented as the routing layer, where various HTTP endpoints are registered to listen for actions (`GET`, `POST`, `PUT`, `DELETE`). It handles URL parsing and invokes the corresponding controller functions.

---

## 📊 Entity-Relationship (ER) Specifications
The database comprises three key collections representing the core entities of the application:

1.  **Users Collection**: Stores primary account credentials and notification arrays. Includes `_id`, `name`, `email`, `password`, `phone`, `type`, `isdoctor` (boolean identifier), `status` (active or suspended), `notification`, and `seennotification`.
2.  **Doctors Collection**: Stores professional profiles linked to user accounts. Includes `_id`, `userID` (foreign key linking back to `Users`), `fullname` / `name`, `email`, `timings` / `availability`, `phone`, `address`, `specialisation`, `status` (pending or approved), `experience`, and `fees`.
3.  **Appointments Collection**: Maintains relationship states between patients, doctors, and scheduling blocks. Includes `_id`, `doctorInfo` / `doctorId`, `date`, `timeSlot`, `userInfo` / `patientId`, `document` (uploaded medical reports), and `status` (pending, confirmed, completed, cancelled).

---

## 👤 Feature Highlights by User Flow

### 1. Registration Flow
*   User opens the landing page, clicks on **Register**, and selects their chosen role (**User/Patient** or **Doctor**).
*   Fills out the input fields (Name, Email, Password, Phone) and submits.
*   Once saved, they are ready to log in immediately.

### 2. Login Flow
*   User/Admin inputs their credentials.
*   On authentication success, the server returns a stateless JWT session token.
*   The client stores this token and redirects:
    *   If role is **Patient (User)** ➔ Redirect to User Dashboard.
    *   If role is **Doctor** ➔ Redirect to Doctor Portal.
    *   If role is **Admin** ➔ Redirect to Admin Control Panel.

### 3. Patient Workspace (User Dashboard)
*   **Doctor Browsing**: Access lists of approved healthcare providers, search by name, or filter by medical specialties and maximum consulting fee.
*   **Appointment Booking**: Select a doctor, choose an available time slot, fill out symptoms/reason, upload documents, and submit under "Pending" status.
*   **In-App Notifications**: Receive instant notification cards when bookings are confirmed or cancelled.
*   **Medical Document Vault**: Access their private uploaded clinical records.
*   **PDF Summaries**: Instantly print/save beautifully styled diagnostic summaries and appointment receipts.

### 4. Doctor Portal
*   **Clinical Scheduler**: Define weekly available consulting days and hourly time slots.
*   **Booking Management**: Monitor incoming pending requests; accept/confirm or reject/cancel visits.
*   **Patient Record Sharing**: Access shared medical files uploaded by the patient during booking.
*   **Prescription Pad**: Write drug prescriptions directly on the visit card, automatically updating the status to "Completed".

### 5. Admin Control Panel
*   **Performance Metrics**: Interactive Recharts charts (Area and Bar charts) summarizing patient counts, registered providers, and projected clinical revenues.
*   **Vetting Desk**: View registered doctor applications with their DM/MD qualifications, experience, and fee details, and approve them to list them publicly.
*   **Account Governance**: View registered users list and toggle account suspension switches dynamically.

---

## 💻 System Requirements
Essential tools and platforms required to run the application:
1.  **Operating System**: Windows 10/11, macOS, or Linux.
2.  **Node.js (v16 or above)**: High-performance backend runtime.
3.  **npm (v8 or above)**: Node package manager.
4.  **React.js**: Declarative user interface library.
5.  **Browser**: Google Chrome / Firefox (latest) for preview.
6.  **Express.js**: Fast, unopinionated REST API framework.
7.  **MongoDB / Local Storage**: NoSQL collection simulator.
8.  **VS Code**: Highly recommended text editor.

---

## 🚀 How to Run the App Locally in VS Code

Follow these simple steps to run the complete full-stack environment on your system:

### Step 1: Open Project in VS Code
1.  Export or download the project ZIP from the top-right settings menu in Google AI Studio.
2.  Extract the ZIP file and launch **VS Code**.
3.  Go to **File** > **Open Folder...** and select the extracted folder.

### Step 2: Open VS Code Terminal
Press **`Ctrl + \``** (backtick) or go to **Terminal** > **New Terminal** in the top menu bar.

### Step 3: Install Packages
Run the package installation command to download all frontend and backend dependencies:
```bash
npm install
```

### Step 4: Run the Full-Stack Server
To boot the full-stack server (runs both the Express backend and Vite frontend dynamically on the same dev server), execute:
```bash
npm run dev
```

### Step 5: Start Browsing!
Open your browser and navigate to:
```text
http://localhost:3000
```
Use the pre-configured credentials to experience all administrative, clinical, and booking capabilities!

---

*For deeper architectural diagrams, entity relationships, and file path mappings, see the dedicated [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) document.*
