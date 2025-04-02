const fetch = require('node-fetch');

const API_KEY = 'YOUR_OPENCAGE_API_KEY'; // Replace with your API Key

async function reverseGeocode(latitude, longitude) {
    try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results.length > 0) {
            return data.results[0].formatted; // City, Country, etc.
        } else {
            return 'Unknown location';
        }
    } catch (error) {
        console.error('Reverse Geocoding Error:', error);
        return 'Error fetching location data';
    }
}

const locationHandler = async (client, message, args) => {
    const chatId = message.key.remoteJid;
    let latitude, longitude;

    // ✅ If user REPLIES to a location message
    if (message.message.extendedTextMessage?.contextInfo?.quotedMessage?.locationMessage) {
        const location = message.message.extendedTextMessage.contextInfo.quotedMessage.locationMessage;
        latitude = location.degreesLatitude;
        longitude = location.degreesLongitude;
    } 
    // ✅ If user PROVIDES coordinates (e.g., `!location 37.7749 -122.4194`)
    else if (args.length === 2) {
        latitude = parseFloat(args[0]);
        longitude = parseFloat(args[1]);

        if (isNaN(latitude) || isNaN(longitude)) {
            return await client.sendMessage(chatId, { 
                text: '❌ Invalid coordinates! Please provide latitude and longitude.\n\nExample: `!location 37.7749 -122.4194`' 
            });
        }
    } 
    // ❌ If user provides nothing
    else {
        return await client.sendMessage(chatId, { 
            text: '❌ Please reply to a location message or provide coordinates.\n\nExample: `!location 37.7749 -122.4194`' 
        });
    }

    // 🌍 Get City Name from Coordinates
    const cityName = await reverseGeocode(latitude, longitude);
    
    // 📍 Google Maps Link
    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    await client.sendMessage(chatId, { 
        text: `📍 *Location Details:*\n\n🌎 *City:* ${cityName}\n📌 *Coordinates:* ${latitude}, ${longitude}\n🗺 *Google Maps:* [Click Here](${mapsLink})`
    });
};

module.exports = { location: locationHandler };
