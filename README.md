# AI Redis Integration

A server application integrating Cloudflare AI and Redis for conversational AI sessions. This application allows users to interact with an AI model through session-based conversations, where the chat history is stored temporarily in Redis with a TTL (time-to-live) of 3 hours.

## Features

- **Session-based Chat History**: Chat history is stored in Redis and linked to unique sessions.
- **Integration with Cloudflare AI**: Queries are sent to Cloudflare's AI service to generate responses.
- **Timestamp-based Query**: Retrieve specific messages using timestamps.
- **Environment Configuration**: Uses `.env` files for sensitive configurations like Redis credentials and Cloudflare API keys.

## Prerequisites

- **Node.js** (>=14.x)
- **Redis Server**: Redis should be running and accessible as per the configuration in the `.env` file.

## Installation

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/Cloud-Dark/ai_redis
    cd ai_redis
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Set Up Environment Variables**:
    - Copy `.env.example` to `.env`:
      ```bash
      cp .env.example .env
      ```
    - Update the values in `.env` according to your setup (Redis credentials, Cloudflare API details, and application port).

4. **Start the Application**:
    ```bash
    node app.js
    ```

## Configuration

The application relies on the following environment variables (defined in the `.env` file):

```env
# Redis Configuration
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port

# Cloudflare AI Configuration
CLOUDFLARE_API_KEY=your_cloudflare_api_key
CLOUDFLARE_AI_URL=your_cloudflare_ai_url
AI_SYSTEM_MESSAGE=your_custom_system_message

# Application Port
PORT=3003
```

## API Endpoints

### 1. **Start a Conversation**
   **POST** `/api/session`

   **Request Body**:
   ```json
   {
       "session": "unique_session_id",
       "message": "user_message"
   }
   ```

   **Response**:
   ```json
   {
       "session": "unique_session_id",
       "botMessage": "response_from_ai",
       "chatHistory": [ ... ]
   }
   ```

### 2. **Query a Conversation by Timestamp**
   **GET** `/api/session/:session/query`

   **Query Parameters**:
   - `timestamp` (ISO format string)

   **Response**:
   ```json
   {
       "timestamp": "message_timestamp",
       "question": "user_message"
   }
   ```

## Project Structure

- `app.js`: Main server logic, handles routing and integration with Redis and Cloudflare AI.
- `redis.js`: Redis client configuration and connection.
- `.env`: Configuration file for sensitive credentials.
- `package.json`: Project metadata and dependencies.

## Dependencies

The application uses the following npm packages:

- `axios`: For HTTP requests to Cloudflare AI.
- `dotenv`: For environment variable management.
- `express`: Web server framework.
- `redis`: Redis client for Node.js.

## License

This project is licensed under the **ISC License**.

## Author

[Your Name]

## Contribution

Feel free to fork this repository and submit pull requests to contribute to the project.
