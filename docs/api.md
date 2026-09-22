# SiraLink (ስራLink) — REST API Documentation

SiraLink provides a voice-first, location-based marketplace API tailored for Ethiopian users. All responses follow a standardized JSON envelope.

## Base URL
- **Local Development**: `http://localhost:3000` (or `http://10.0.2.2:3000` for Android Emulator)
- **Production (Render)**: `https://<your-render-service>.onrender.com`

---

## Response Envelopes

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-facing error description",
    "details": {}
  }
}
```

---

## 1. Authentication (`/api/auth`)

### Request OTP
`POST /api/auth/request-otp`
- **Auth**: None
- **Body**:
  ```json
  {
    "phoneNumber": "0911223344"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "OTP sent successfully",
      "devOtp": "123456"
    }
  }
  ```

### Verify OTP
`POST /api/auth/verify-otp`
- **Auth**: None
- **Body**:
  ```json
  {
    "phoneNumber": "0911223344",
    "otpCode": "123456",
    "role": "CLIENT",
    "fullName": "Kidus Yohannes",
    "language": "am"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "uuid",
        "phone_number": "+251911223344",
        "full_name": "Kidus Yohannes",
        "role": "CLIENT",
        "language_preference": "am",
        "is_verified": true
      }
    }
  }
  ```

### Get Current User (`Me`)
`GET /api/auth/me`
- **Auth**: Bearer Token
- **Response**: Current user profile and worker profile if applicable.

### Logout
`POST /api/auth/logout`
- **Auth**: Bearer Token

---

## 2. Voice Pipeline (`/api/voice`)

### Transcribe Voice Recording
`POST /api/voice/transcribe`
- **Auth**: None / Optional Bearer Token
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `file`: Audio file (`m4a`, `wav`, `mp3`, up to 30MB)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "audioUrl": "http://localhost:3000/uploads/audio/uuid.m4a",
      "transcript": "ቤቴ ውስጥ የውሃ ቧንቧ ተበላሽቷል። በፍጥነት የሚመጣ ሰው እፈልጋለሁ።",
      "detectedLanguage": "am",
      "category": "PLUMBING",
      "confidence": 0.95
    }
  }
  ```

---

## 3. Workers & PostGIS Spatial Search (`/api/workers`)

### Find Nearby Workers
`GET /api/workers/nearby`
- **Auth**: None
- **Query Parameters**:
  - `latitude` (required): float (e.g. `9.0125`)
  - `longitude` (required): float (e.g. `38.7692`)
  - `radiusKm` (optional, default `5`): float
  - `category` (optional): `PLUMBING`, `ELECTRICAL`, `CARPENTRY`, `PAINTING`, `CLEANING`, `MECHANIC`, `CONSTRUCTION`, `MOVING`, `GARDENING`, `OTHER`
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "full_name": "Abebe Tadesse",
        "phone_number": "+251921001001",
        "skill_category": "PLUMBING",
        "hourly_rate_etb": 450.00,
        "rating_avg": 4.85,
        "rating_count": 38,
        "is_available": true,
        "distance_meters": 820,
        "distance_km": 0.8
      }
    ]
  }
  ```

### Update Worker Location
`POST /api/workers/location`
- **Auth**: Bearer Token (Worker)
- **Body**:
  ```json
  {
    "latitude": 9.0125,
    "longitude": 38.7692
  }
  ```

### Toggle Availability
`PATCH /api/workers/availability`
- **Auth**: Bearer Token (Worker)
- **Body**:
  ```json
  {
    "isAvailable": true
  }
  ```

### Upsert Worker Profile
`POST /api/workers/profile` or `PATCH /api/workers/profile`
- **Auth**: Bearer Token (Worker)
- **Body**:
  ```json
  {
    "skillCategory": "PLUMBING",
    "skillDescription": "Specialist in kitchen leak repairs and pump maintenance",
    "experienceYears": 8,
    "hourlyRateEtb": 450.00
  }
  ```

---

## 4. Jobs Lifecycle (`/api/jobs`)

### Create Job Request
`POST /api/jobs`
- **Auth**: Bearer Token (Client)
- **Body**:
  ```json
  {
    "category": "PLUMBING",
    "title": "Kitchen pipe leaking",
    "audioDescriptionUrl": "http://localhost:3000/uploads/audio/uuid.m4a",
    "textDescription": "Water pipe under the sink ruptured.",
    "offeredPriceEtb": 450.00,
    "latitude": 9.0125,
    "longitude": 38.7692,
    "workerId": "optional-target-worker-uuid"
  }
  ```

### Get User Jobs
`GET /api/jobs?status=ASSIGNED`
- **Auth**: Bearer Token

### Update Job Status
`PATCH /api/jobs/:id/status`
- **Auth**: Bearer Token
- **Body**:
  ```json
  {
    "status": "IN_PROGRESS"
  }
  ```

### Complete Job
`POST /api/jobs/:id/complete`
- **Auth**: Bearer Token

---

## 5. Ratings (`/api/ratings`)

### Submit Rating
`POST /api/ratings`
- **Auth**: Bearer Token (Client)
- **Body**:
  ```json
  {
    "jobId": "job-uuid",
    "rating": 5,
    "comment": "Chala arrived on time and fixed the electrical issue quickly!"
  }
  ```

### Get Worker Ratings
`GET /api/ratings/workers/:id`

---

## 6. Admin Endpoints (`/api/admin`)
Requires `role = 'ADMIN'`.
- `GET /api/admin/users`: List users.
- `GET /api/admin/workers`: List workers.
- `GET /api/admin/jobs`: List platform jobs.
- `PATCH /api/admin/users/:id/status`: Enable or disable user.
- `PATCH /api/admin/workers/:id/verify`: Toggle worker badge.
- `GET /api/admin/statistics`: Platform metrics summary.
