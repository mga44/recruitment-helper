const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const TOKEN_PATH = path.join(__dirname, '..', 'tokens.json');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Load existing tokens if available
if (fs.existsSync(TOKEN_PATH)) {
  const token = fs.readFileSync(TOKEN_PATH);
  oauth2Client.setCredentials(JSON.parse(token));
}

const getAuthUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        prompt: 'consent'
    });
};

const saveTokens = async (code) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    return tokens;
};

const hasValidToken = () => {
    return fs.existsSync(TOKEN_PATH);
};

const createEvent = async ({ summary, description, start, end }) => {
    if (!hasValidToken()) {
        throw new Error('Google Calendar is not connected. Please connect first.');
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: {
                summary,
                description,
                start: {
                    dateTime: new Date(start).toISOString(),
                },
                end: {
                    dateTime: new Date(end).toISOString(),
                },
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        throw error;
    }
};

module.exports = {
    getAuthUrl,
    saveTokens,
    createEvent,
    hasValidToken
};
