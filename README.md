# Hotel Booking Web App (Ascenda) 

This is a responsive hotel booking web app built using **React**, **Vite**, and **Tailwind CSS**.

## Features

- Fast destination search (coming soon)
- Hotel listings with filters and sorting
- Responsive design using Tailwind CSS
- Built with Vite for fast dev experience

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

## Using Booking API
1. Create a local database on mysql
2. Change the following parameters [DB_HOST, DB_USE, DB_PASSWORD, DB_NAME] in .env.development folder to a locally created database
3. Set the PORT to an available port on your device
4. run the following commands from BookingAPI folder
```BASH
npm i
npm run dev
```

## Setting up PostGreSQL

```bash
sudo -u postgres psql
```
```sql
CREATE USER [username] WITH PASSWORD '[password]';

-- Grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO [username];

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON TABLES TO [username];

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON SEQUENCES TO [username];

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT ALL ON FUNCTIONS TO [username];
```



### Testing Booking API
- All unit and system tests are contained in BookingAPI\Tests
- To perform a unit test, type the following command in the command terminal 
```BASH
npm run test [test_folder]
```
- test_folder is a placeholder for all tests available in the tests folder.











