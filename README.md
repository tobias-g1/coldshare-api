# Coldstack API

This is a Node.js API project named "coldstack-api" that serves as a backend for the Coldstack application. The API provides functionality related to authentication, data encryption, and interaction with a MongoDB database.

## Prerequisites

Before running the API, ensure that you have the following installed:

- Node.js (version >= 12.0.0)
- MongoDB

## Installation

1. Clone the repository or download the source code.
2. Navigate to the project's root directory.
3. Install the dependencies by running the following command:

   ```bash
   npm install
   ```

## Configuration

The API requires some configuration settings to run properly. Create a file named `.env` in the root directory of the project and populate it with the necessary values. Here's an example:

DB=<MongoDB_Connection_String>
JWT_SECRET=<JWT_Secret_Key>

For the DB variable, you can use a free cloud instance of MongoDB on Atlas or any other MongoDB provider.

## Usage

The following scripts are available to run the API:

- `npm run dev`: Starts the API in development mode using Nodemon for automatic reloading upon file changes.
- `npm start`: Starts the API in production mode using Node.js.

To start the API, run one of the above commands in the project's root directory.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.
