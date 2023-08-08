# SAP Transfer Module Backend

This is a Node.js (Express.js) project that provides a backend for the SAP Transfer Module.

## Prerequisites

Before you can install and run this project, you’ll need to have the following installed on your system:

- [Node.js](https://nodejs.org/): A JavaScript runtime built on Chrome’s V8 JavaScript engine.
- [npm](https://www.npmjs.com/): A package manager for Node.js.

## Installation

To install the project, follow these steps:

1. Clone the repository to your local machine by running `git clone <repository-url>` in your terminal.
2. Navigate to the project’s root directory by running `cd sap-transfer-module-backend`.
3. Install the dependencies by running `npm install`.

## Running the Project

To run the project, follow these steps:

1. Start the server by running `node index.js` in the project’s root directory.

Alternatively, you can use nodemon to automatically restart the server when changes are made to the code:

1. Install nodemon by running `npm install nodemon` in the project’s root directory.
2. Start the server using nodemon by running `npx nodemon index.js`.

## Running in Production

To run this project in a production environment, you can use PM2 to manage the application process. Here are the steps to set up PM2:

1. Install PM2 globally on your machine by running `npm install -g pm2`.
2. Create an ecosystem file (e.g., `ecosystem.config.js`) that specifies the application’s configuration and environment variables.
3. Start your application in production mode by running `pm2 start ecosystem.config.js --env production`.

PM2 will automatically manage your application, restarting it if it crashes and keeping a log of unhandled exceptions. You can also use PM2 to scale your application by specifying the number of instances you want to run in the ecosystem file.

## Configuration

You can configure various aspects of the project by modifying the `.env` file in the project’s root directory. This file contains environment variables that are used by the application.

For example, you can set the `PORT` environment variable to specify which port the server should listen on.
