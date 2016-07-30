# grow-web-service

### Web Service Application

Main application template delivery at root (/). Static resources delivered from /css and /js.

### Web Service API

Not accessible to the public

#### POST /api/v1/auth

Validates token with Grow Auth's token validation service and if it is valid, we then create an access_token the web application will use to create a connection to the Chat Service.

##### Body
* google_id_token - string

##### 200 Response
* access_token - string
* picture - string
* given_name - string
* family_name - string
* locale - string

##### 401 Unauthorized
* statusCode = 401
* error = 'Unauthorized'
* message - string

#### DELETE /api/v1/auth

Kills access_token session

##### Body
* access_token - string

##### 200 Response
* success - boolean

#### GET /api/v1/chat-service

Instructs front-end on where to connect

##### 200 Response
* url - string
