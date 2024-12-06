# Travel Booking System API Guide

## Base URL

```
http://localhost:4000
```

## Authentication

The API uses session-based authentication. After successful login, a session cookie is set that must be included in subsequent requests.

### Testing with Postman

1. **Enable Cookies in Postman**:

   - Go to Settings (File > Settings)
   - Turn on "Automatically follow redirects"
   - Turn on "Send cookies"

2. **Authentication Flow**:
   1. Register a new user
   2. Login with credentials
   3. Postman will automatically store and send the session cookie
   4. Use the same Postman instance for subsequent requests

### Register New User

```http
POST /auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword"
}
```

Response (201 Created):

```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword"
}
```

Response (200 OK):

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### Logout

```http
POST /auth/logout
```

Response (200 OK):

```json
{
  "message": "Logout successful"
}
```

## Protected Routes

All routes except `/auth/register` and `/auth/login` require authentication. The session cookie must be included in the request.

### Create New Trip

```http
POST /trips
Content-Type: application/json

{
    "name": "Summer Vacation 2024",
    "destination": "Paris, France",
    "startDate": "2024-06-01",
    "endDate": "2024-06-15"
}
```

Response (201 Created):

```json
{
  "id": 1,
  "name": "Summer Vacation 2024",
  "destination": "Paris, France",
  "startDate": "2024-06-01",
  "endDate": "2024-06-15",
  "userId": 1,
  "createdAt": "2024-01-20T12:00:00.000Z",
  "updatedAt": "2024-01-20T12:00:00.000Z"
}
```

### Get All User Trips

```http
GET /trips 
```
(or get a specific trip details by /trips/:tripid)
Response (200 OK):

```json
{
	"id": 1,
	"userId": 1,
	"name": "Summer Vacation 2026",
	"destination": "Miami, USA",
	"startDate": "2025-06-01T00:00:00.000Z",
	"endDate": "2024-06-15T00:00:00.000Z",
	"createdAt": "2024-12-06T09:18:32.834Z",
	"updatedAt": "2024-12-06T09:18:32.834Z",
	"events": [
		{
			"id": 1,
			"tripId": 1,
			"name": "Kayaking in Hawaii",
			"date": "2024-12-01T00:00:00.000Z",
			"time": "24:00:00",
			"createdAt": "2024-12-06T09:18:38.767Z",
			"updatedAt": "2024-12-06T09:18:38.768Z"
		}
	],
	"flightOffers": [
		{
			"flightID": 1,
			"tripId": 1,
			"offer": "{\"offerId\":\"1\",\"isDirectFlight\":false,\"transitInfo\":\"1 stop, transit\",\"transitDetails\":{\"transitLocation\":\"MSP\",\"transitDuration\":\"PT3H43M\"},\"airline\":{\"code\":\"SY\",\"name\":\"SUN COUNTRY\"},\"totalPrice\":\"158.35\",\"currency\":\"USD\",\"flights\":[{\"departure\":{\"airportCode\":\"JFK\",\"airportName\":\"NYC\",\"time\":\"2024-12-29T11:38:00\"},\"arrival\":{\"airportCode\":\"MSP\",\"airportName\":\"MSP\",\"time\":\"2024-12-29T13:44:00\"},\"carrier\":{\"code\":\"SY\",\"name\":\"SUN COUNTRY\"},\"flightNumber\":\"568\",\"aircraft\":{\"code\":\"738\",\"name\":\"BOEING 737-800\"},\"duration\":\"PT3H6M\"},{\"departure\":{\"airportCode\":\"MSP\",\"airportName\":\"MSP\",\"time\":\"2024-12-29T17:27:00\"},\"arrival\":{\"airportCode\":\"ORD\",\"airportName\":\"CHI\",\"time\":\"2024-12-29T19:05:00\"},\"carrier\":{\"code\":\"SY\",\"name\":\"SUN COUNTRY\"},\"flightNumber\":\"261\",\"aircraft\":{\"code\":\"738\",\"name\":\"BOEING 737-800\"},\"duration\":\"PT1H38M\"}]}",
			"pnr": "0R2XB4",
			"ticketNo": "9995213804439",
			"passengers": "[{\"firstName\":\"John\",\"lastName\":\"Doe\",\"phoneNumber\":\"+1 (123) 456-7890\",\"gender\":\"Male\",\"nationality\":\"American\",\"email\":\"john.doe@example.com\",\"dateOfBirth\":\"01/01/1980\",\"frequentFlyerNumber\":\"ABC123\",\"travelerType\":\"ADT\"},{\"firstName\":\"Jane\",\"lastName\":\"Smith\",\"phoneNumber\":\"+1 (987) 654-3210\",\"gender\":\"Female\",\"nationality\":\"Canadian\",\"email\":\"jane.smith@example.com\",\"dateOfBirth\":\"05/15/2015\",\"frequentFlyerNumber\":\"DEF456\",\"travelerType\":\"CHD\"}]",
			"createdAt": "2024-12-06T09:18:48.035Z",
			"updatedAt": "2024-12-06T09:18:48.035Z"
		}
	]
}
```

## Events API

### Add Event to Trip

- **POST** `/trips/:tripId/events`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "name": "Kayaking in Hawaii",
    "date": "2023-12-01",
    "time": "10:00-21"
  }
  ```
- **Success Response**: `201 Created`
  ```json
  {
    "id": 1,
    "tripId": 1,
    "name": "Kayaking in Hawaii",
    "date": "2023-12-01",
    "time": "10:00"
  }
  ```

### Get Trip Events

- **GET** `/trips/:tripId/events`
- **Auth Required**: Yes
- **Success Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "tripId": 1,
      "name": "Flight to Hawaii",
      "date": "2023-12-01",
      "time": "10:00"
    }
  ]
  ```

(or get a specific trip event by /trips/:eventid)


## Flights API

## /flights/search (POST)

**Description:** Searches for flights using the Amadeus API. All flight searches must be associated with a trip.

**Request Body:**

```json
{
  "tripId": "integer (required)",
  "origin": "string (e.g., JFK)",
  "destination": "string (e.g., LHR)",
  "departureDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD (Currently not supported)",
  "adults": "integer",
  "children": "integer",
  "infants": "integer",
  "travelClass": "string (e.g., ECONOMY, BUSINESS)",
  "tripType": "string (one-way or return, only one-way supported as of now)"
}
```

**Response Structure:**

```json
{
  "success": true,
  "responseType": "flight-search",
  "params": {
    "tripId": "integer",
    "origin": "string",
    "destination": "string",
    "departureDate": "YYYY-MM-DD",
    "adults": "integer",
    "children": "integer",
    "infants": "integer",
    "travelClass": "string",
    "tripType": "string"
  },
  "data": {
    "tripId": "integer",
    "simpliefiedRes": [
      {
        "offerId": "string",
        "isDirectFlight": "boolean",
        "transitInfo": "string",
        "transitDetails": {
          "transitLocation": "string",
          "transitDuration": "ISO-8601 duration format"
        },
        "airline": {
          "code": "string",
          "name": "string"
        },
        "totalPrice": "string",
        "currency": "string",
        "flights": [
          {
            "departure": {
              "airportCode": "string",
              "airportName": "string",
              "time": "ISO-8601 format"
            },
            "arrival": {
              "airportCode": "string",
              "airportName": "string",
              "time": "ISO-8601 format"
            },
            "carrier": {
              "code": "string",
              "name": "string"
            },
            "flightNumber": "string",
            "aircraft": {
              "code": "string",
              "name": "string"
            },
            "duration": "ISO-8601 duration format"
          }
        ]
      }
    ]
  }
}
```

## Response Example##

```json
{
  "success": true,
  "responseType": "flight-search",
  "params": {
    "tripId": "integer",
    "origin": "string",
    "destination": "string",
    "departureDate": "YYYY-MM-DD",
    "adults": "integer",
    "children": "integer",
    "infants": "integer",
    "travelClass": "string",
    "tripType": "string"
  },
  "data": {
    "tripId": "integer",
    "simpliefiedRes": [
      {
        "offerId": "string",
        "isDirectFlight": "boolean",
        "transitInfo": "string",
        "transitDetails": {
          "transitLocation": "string",
          "transitDuration": "ISO-8601 duration format"
        },
        "airline": {
          "code": "string",
          "name": "string"
        },
        "totalPrice": "string",
        "currency": "string",
        "flights": [
          {
            "departure": {
              "airportCode": "string",
              "airportName": "string",
              "time": "ISO-8601 format"
            },
            "arrival": {
              "airportCode": "string",
              "airportName": "string",
              "time": "ISO-8601 format"
            },
            "carrier": {
              "code": "string",
              "name": "string"
            },
            "flightNumber": "string",
            "aircraft": {
              "code": "string",
              "name": "string"
            },
            "duration": "ISO-8601 duration format"
          }
        ]
      }
    ]
  }
}
```

## /flight/intelligent-search (POST)

**Description:** Parses a natural language flight search query and returns structured parameters that can be used with the regular flight search endpoint. This endpoint does NOT perform the actual flight search - it only converts natural language to search parameters.

**Request Body:**

```json
{
  "tripId": 1,
  "naturalQuery": "economy flight from Chicago to NYC for me and my child on December 15th"
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "",
  "data": {
    "origin": "ORD",
    "destination": "JFK",
    "departureDate": "2024-12-15",
    "returnDate": "",
    "adults": 1,
    "children": 1,
    "infants": 0,
    "travelClass": "ECONOMY",
    "tripType": "one-way",
    "tripId": 1
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Date not specified or invalid"
}
```

**Common Error Messages:**

- "Natural language query is required"
- "tripId is required"
- "Date not specified or invalid"
- "Invalid origin or destination"
- "Failed to parse LLM response"

**Usage Flow:**

1. Call `/flight/intelligent-search` with natural language query
2. Use the returned parameters to call `/flight/search`
3. Process flight search results as normal

## /flight/book (POST)

**Description:** Books a flight by storing the flight offer and passenger information. Generates a PNR and ticket number for the booking. The flightOfferInfo should be taken directly from the flight search response (simpliefiedRes array item from /flight/search endpoint) without modification.

**Request Body:**
```json
{
  "tripId": "integer (required)",
  "passengerInfo": [
    {
      "firstName": "string (required)",
      "lastName": "string (required)",
      "phoneNumber": "string",
      "gender": "string (required)",
      "nationality": "string (required)",
      "email": "string",
      "dateOfBirth": "string (required, MM/DD/YYYY)",
      "frequentFlyerNumber": "string",
      "travelerType": "string (required, e.g., ADT, CHD, INF)"
    }
  ],
  "flightOfferInfo": {
    // This should be a complete flight offer object from the search response
    // Copy an item from the simpliefiedRes array in the /flight/search response
    "offerId": "string",
    "isDirectFlight": "boolean",
    "transitInfo": "string",
    "transitDetails": {
      "transitLocation": "string",
      "transitDuration": "string (ISO-8601 duration format)"
    },
    "airline": {
      "code": "string",
      "name": "string"
    },
    "totalPrice": "string",
    "currency": "string",
    "flights": [
      {
        "departure": {
          "airportCode": "string",
          "airportName": "string",
          "time": "string (ISO-8601 format)"
        },
        "arrival": {
          "airportCode": "string",
          "airportName": "string",
          "time": "string (ISO-8601 format)"
        },
        "carrier": {
          "code": "string",
          "name": "string"
        },
        "flightNumber": "string",
        "aircraft": {
          "code": "string",
          "name": "string"
        },
        "duration": "string (ISO-8601 duration format)"
      }
    ]
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "responseType": "flight-booking",
  "data": {
    "bookingId": "integer",
    "pnr": "string (6 characters)",
    "ticketNo": "string (13 digits)",
    "tripId": "integer",
    "flightDetails": {
      // Same structure as flightOfferInfo from request
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Missing required booking information"
}
```

**Common Error Messages:**
- "Missing required booking information"
- "Missing required passenger information"
- "Passengers must be an array"
- "Flight booking failed: [specific error message]"

## Implementation Details

1. **Flight Offer Selection:**
   - The flightOfferInfo should be taken directly from the flight search response
   - Use an item from the simpliefiedRes array returned by /flight/search
   - Do not modify the flight offer structure

## Airports API

### Search Airports

**GET** `/airports/search`

**Description:** Search for airports by query string. The search is performed across airport names, cities, IATA codes, and countries.

**Query Parameters:**

- `query` (required): Search string (minimum 2 characters)

**Auth Required:** Yes

**Success Response (200 OK):**

```json
{
  "success": true,
  "responseType": "airport-search",
  "data": [
    {
      "icao": "KJFK",
      "iata": "JFK",
      "name": "John F Kennedy International Airport",
      "city": "New York",
      "country": "United States",
      "displayName": "New York (JFK) - John F Kennedy International Airport",
      "countryCode": "US"
    }
  ]
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": true,
  "responseType": "airport-search",
  "data": [],
  "message": "Please provide at least 2 characters"
}
```

### Get Airport Details

**GET** `/airports/:iata`

**Description:** Get detailed information about a specific airport by its IATA code.

**Parameters:**

- `iata`: Airport IATA code (e.g., JFK, LHR)

**Auth Required:** Yes

**Success Response (200 OK):**

```json
{
  "success": true,
  "responseType": "airport-details",
  "data": {
    "icao": "KJFK",
    "iata": "JFK",
    "name": "John F Kennedy International Airport",
    "city": "New York",
    "state": "New York",
    "country": "United States",
    "elevation": 13,
    "lat": 40.639751,
    "lon": -73.778925,
    "tz": "America/New_York"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "error": "Airport not found"
}
```

### Error Responses

- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: No valid session
- `404 Not Found`: Trip not found
- `500 Internal Server Error`: Server error

## Testing Guide

### Using Postman

1. **Create a New Collection**:

   - Create a new collection for the Travel API
   - Set up environment variables for base URL

2. **Authentication Steps**:

   ```
   1. Register:
      POST http://localhost:4000/auth/register
      Body: {
          "email": "test@example.com",
          "password": "password123"
      }

   2. Login:
      POST http://localhost:4000/auth/login
      Body: {
          "email": "test@example.com",
          "password": "password123"
      }
   ```

3. **Making Authenticated Requests**:

   - After login, Postman will automatically include the session cookie
   - No need to manually set any headers
   - Just make requests to protected endpoints

4. **Example: Creating a Trip**:
   ```
   POST http://localhost:4000/trips
   Body: {
       "name": "Summer Trip",
       "destination": "Paris",
       "startDate": "2024-06-01",
       "endDate": "2024-06-15"
   }
   ```

### Using Fetch API (Frontend)

```javascript
// Login
async function login(email, password) {
  const response = await fetch("http://localhost:4000/auth/login", {
    method: "POST",
    credentials: "include", // Important for cookies
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
}

// Making authenticated requests
async function createTrip(tripData) {
  const response = await fetch("http://localhost:4000/trips", {
    method: "POST",
    credentials: "include", // Important for cookies
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tripData),
  });
  return await response.json();
}
```

### Error Responses

#### Unauthorized (401)

```json
{
  "error": "Authentication required"
}
```

#### Validation Error (400)

```json
{
  "error": "All fields are required"
}
```

#### Server Error (500)

```json
{
  "error": "Internal server error"
}
```

## Session Management

- Sessions are stored server-side
- Session cookie is automatically handled by the browser/Postman
- Session expires after 24 hours
- Logging out invalidates the session

## Security Notes

1. Always use HTTPS in production
2. Keep session cookies secure
3. Implement proper CORS in production
4. Never send passwords in plain text
5. Use environment variables for sensitive data

## Testing Checklist

1. Register new user
2. Login with credentials
3. Create a new trip (should succeed)
4. Try accessing without login (should fail)
5. Logout
6. Try accessing protected route (should fail)
7. Login again
8. Access should be restored
