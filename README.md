# What Time Is It? - HubSpot Extension

A HubSpot extension that displays the current local time for contacts and companies based on their timezone data.

## Overview

"What Time Is It?" is a simple but powerful HubSpot extension that helps you know the current local time for your contacts and companies. This is especially useful for international teams who need to be mindful of time differences when reaching out to contacts.

## Features

- Displays real-time, current local time for contacts and companies
- Updates every second
- Automatically converts HubSpot timezone formats to standard IANA timezone formats
- Handles a wide variety of timezone formats and edge cases
- Works with both contacts and companies
- Shows warning when a contact/company has no timezone set

## How It Works

The extension:
1. Retrieves timezone data from the contact or company record in HubSpot
2. Converts the HubSpot timezone format to a standard IANA timezone format
3. Displays the current time in that timezone, updating in real-time

## Installation

This is a private HubSpot app that you can install in your own HubSpot portal:

1. Clone this repository
2. Create a private app in your HubSpot developer account
3. Set up the required scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.companies.read`
4. Create a `.env` file in the `src/app/app.functions/` directory with your private app access token:
   ```
   PRIVATE_APP_ACCESS_TOKEN=your_token_here
   ```
5. Deploy the app to your HubSpot account using the HubSpot CLI:
   ```
   hs project upload
   ```

## Requirements

- HubSpot account with CRM access
- HubSpot CLI installed
- Node.js and npm

## Development

### Project Structure

- `src/app/app.json` - Main app configuration
- `src/app/extensions/time-card.jsx` - React component for the time card
- `src/app/extensions/time-card.json` - Card configuration
- `src/app/app.functions/getContactData.js` - Serverless function to fetch contact/company data

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Run the HubSpot local development server:
   ```
   hs project dev
   ```

## Credits

www.hubspot.jbigs.com
www.jbigs.com
