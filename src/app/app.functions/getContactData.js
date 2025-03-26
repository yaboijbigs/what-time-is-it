// Super simplified serverless function following HubSpot's exact pattern
const hubspot = require('@hubspot/api-client');

// Helper function to convert HubSpot timezone format to IANA format
function convertHubSpotTimezone(hubspotTimezone) {
  if (!hubspotTimezone) return 'UTC';
  
  console.log('Original timezone from HubSpot:', hubspotTimezone);
  
  // If it's already a valid IANA timezone format, return it
  try {
    new Date().toLocaleString('en-US', { timeZone: hubspotTimezone });
    console.log('Valid IANA timezone, using as-is:', hubspotTimezone);
    return hubspotTimezone;
  } catch (e) {
    // Continue with conversion
    console.log('Not a valid IANA timezone, will convert');
  }
  
  // Special direct mappings for known problematic timezones
  const directMappings = {
    'australia_slash_broken_hill': 'Australia/Broken_Hill',
    'america_slash_indiana_slash_indianapolis': 'America/Indiana/Indianapolis',
    'america_slash_indiana_slash_knox': 'America/Indiana/Knox',
    'america_slash_indiana_slash_marengo': 'America/Indiana/Marengo',
    'america_slash_indiana_slash_petersburg': 'America/Indiana/Petersburg',
    'america_slash_indiana_slash_tell_city': 'America/Indiana/Tell_City',
    'america_slash_indiana_slash_vevay': 'America/Indiana/Vevay',
    'america_slash_indiana_slash_vincennes': 'America/Indiana/Vincennes',
    'america_slash_indiana_slash_winamac': 'America/Indiana/Winamac',
    'america_slash_kentucky_slash_louisville': 'America/Kentucky/Louisville',
    'america_slash_kentucky_slash_monticello': 'America/Kentucky/Monticello',
    'america_slash_north_dakota_slash_beulah': 'America/North_Dakota/Beulah',
    'america_slash_north_dakota_slash_center': 'America/North_Dakota/Center',
    'america_slash_north_dakota_slash_new_salem': 'America/North_Dakota/New_Salem',
    'america_slash_argentina_slash_buenos_aires': 'America/Argentina/Buenos_Aires',
    'america_slash_argentina_slash_catamarca': 'America/Argentina/Catamarca',
    'america_slash_argentina_slash_cordoba': 'America/Argentina/Cordoba',
    'america_slash_argentina_slash_jujuy': 'America/Argentina/Jujuy',
    'america_slash_argentina_slash_la_rioja': 'America/Argentina/La_Rioja',
    'america_slash_argentina_slash_mendoza': 'America/Argentina/Mendoza',
    'america_slash_argentina_slash_rio_gallegos': 'America/Argentina/Rio_Gallegos',
    'america_slash_argentina_slash_salta': 'America/Argentina/Salta',
    'america_slash_argentina_slash_san_juan': 'America/Argentina/San_Juan',
    'america_slash_argentina_slash_san_luis': 'America/Argentina/San_Luis',
    'america_slash_argentina_slash_tucuman': 'America/Argentina/Tucuman',
    'america_slash_argentina_slash_ushuaia': 'America/Argentina/Ushuaia',
    'america_slash_lower_princes': 'America/Lower_Princes'
  };
  
  // Check for exact matches in our direct mappings
  if (directMappings[hubspotTimezone.toLowerCase()]) {
    const result = directMappings[hubspotTimezone.toLowerCase()];
    console.log('Using direct mapping:', hubspotTimezone, '->', result);
    return result;
  }
  
  // Check for the _slash_ pattern (e.g., "europe_slash_dublin", "us_slash_arizona")
  if (hubspotTimezone.includes('_slash_')) {
    // First, split by _slash_ to get the major parts
    const majorParts = hubspotTimezone.split('_slash_');
    
    // Process each major part (capitalize and handle underscores correctly)
    const processedParts = majorParts.map(part => {
      // Split each part by underscores
      const words = part.split('_');
      
      // Capitalize first letter of each word
      return words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join('_'); // Join words with underscores
    });
    
    // Join the processed parts with slashes
    const converted = processedParts.join('/');
    
    console.log('Converted _slash_ format:', hubspotTimezone, '->', converted);
    
    // Validate the converted timezone
    try {
      new Date().toLocaleString('en-US', { timeZone: converted });
      return converted;
    } catch (e) {
      console.log('Converted timezone is invalid:', converted);
      // Continue to other conversion methods
    }
  }
  
  // Handle HubSpot format: "UTC -04:00 America New York"
  // First check if it starts with "UTC" and extract the region/city part
  let locationPart = hubspotTimezone;
  
  // Use a more flexible regex that handles the UTC offset part optionally
  const matches = hubspotTimezone.match(/UTC\s+(?:[+-]\d{2}:\d{2}\s+)?(.+)/i);
  if (matches && matches[1]) {
    locationPart = matches[1];
    console.log('Extracted location part:', locationPart);
  }
  
  // Special cases that need handling
  const specialCases = {
    'US Samoa': 'Pacific/Samoa',
    'US Hawaii': 'Pacific/Honolulu',
    'US Alaska': 'America/Anchorage',
    'US Arizona': 'America/Phoenix',
    'US Mountain': 'America/Denver',
    'US Central': 'America/Chicago',
    'US Eastern': 'America/New_York',
    'US East-Indiana': 'America/Indiana/Indianapolis',
    'US Pacific': 'America/Los_Angeles',
    'US Pacific-New': 'America/Los_Angeles',
    'US Michigan': 'America/Detroit',
    'US Aleutian': 'America/Adak',
    'US Indiana-Starke': 'America/Indiana/Knox',
    'Canada Pacific': 'America/Vancouver',
    'Canada Mountain': 'America/Edmonton',
    'Canada Central': 'America/Winnipeg',
    'Canada Eastern': 'America/Toronto',
    'Canada Atlantic': 'America/Halifax',
    'Canada Newfoundland': 'America/St_Johns',
    'Canada Yukon': 'America/Whitehorse',
    'Canada Saskatchewan': 'America/Regina',
    'Brazil Acre': 'America/Rio_Branco',
    'Brazil East': 'America/Sao_Paulo',
    'Brazil West': 'America/Manaus',
    'Brazil DeNoronha': 'America/Noronha',
    'Mexico BajaNorte': 'America/Tijuana',
    'Mexico BajaSur': 'America/Mazatlan',
    'Mexico General': 'America/Mexico_City',
    'Chile Continental': 'America/Santiago',
    'Chile EasterIsland': 'Pacific/Easter',
    'Asia Tel Aviv': 'Asia/Jerusalem',
    'Asia Türkiye': 'Europe/Istanbul',
    'Asia Turkey': 'Europe/Istanbul',
    'Europe Eire': 'Europe/Dublin',
    'Europe Kiev': 'Europe/Kyiv',
    'Europe Kyiv': 'Europe/Kyiv',
    'Europe Turkey': 'Europe/Istanbul',
    'Europe Türkiye': 'Europe/Istanbul',
    'Australia ACT': 'Australia/Sydney',
    'Australia NSW': 'Australia/Sydney',
    'Australia North': 'Australia/Darwin',
    'Australia South': 'Australia/Adelaide',
    'Australia West': 'Australia/Perth',
    'Australia Queensland': 'Australia/Brisbane',
    'Australia Tasmania': 'Australia/Hobart',
    'Australia Victoria': 'Australia/Melbourne',
    'Australia LHI': 'Australia/Lord_Howe',
    'America New York': 'America/New_York',
    'Pacific Honolulu': 'Pacific/Honolulu',
    'America Chicago': 'America/Chicago',
    'America Los Angeles': 'America/Los_Angeles',
    'Europe London': 'Europe/London',
    'Europe Paris': 'Europe/Paris',
    'Asia Tokyo': 'Asia/Tokyo',
  };
  
  if (specialCases[locationPart]) {
    const result = specialCases[locationPart];
    console.log('Using special case mapping:', locationPart, '->', result);
    return result;
  }
  
  // Process regular format: Convert "Region City" to "Region/City"
  // Handle multi-word city names by joining with underscores
  const parts = locationPart.split(' ');
  if (parts.length >= 2) {
    const region = parts[0];
    const city = parts.slice(1).join('_');
    const result = `${region}/${city}`;
    console.log('Converted to standard format:', locationPart, '->', result);
    
    // Validate the converted timezone
    try {
      new Date().toLocaleString('en-US', { timeZone: result });
      return result;
    } catch (e) {
      console.log('Converted timezone is invalid:', result);
      // Continue to fallback
    }
  }
  
  // If nothing else works
  console.log('No conversion worked, falling back to UTC');
  return 'UTC';
}

exports.main = async (context = {}) => {
  try {
    const { hs_object_id, objectType } = context.parameters;
    
    if (!hs_object_id || !objectType) {
      return {
        message: 'Missing required parameters: hs_object_id or objectType',
        status: 'ERROR'
      };
    }
    
    // Initialize HubSpot client
    const hubspotClient = new hubspot.Client({
      accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN
    });
    
    // Determine which properties to fetch based on object type
    const properties = [];
    let timezoneProperty = '';
    
    if (objectType === 'contacts') {
      properties.push('firstname', 'lastname', 'hs_timezone');
      timezoneProperty = 'hs_timezone';
    } else if (objectType === 'companies') {
      properties.push('name', 'timezone');
      timezoneProperty = 'timezone';
    } else {
      return {
        message: `Unsupported object type: ${objectType}`,
        status: 'ERROR'
      };
    }
    
    // Use the proper API endpoint based on HubSpot's API structure
    let response;
    try {
      // Using the specific API endpoints for each object type
      if (objectType === 'contacts') {
        response = await hubspotClient.crm.contacts.basicApi.getById(
          hs_object_id,
          properties
        );
      } else if (objectType === 'companies') {
        response = await hubspotClient.crm.companies.basicApi.getById(
          hs_object_id,
          properties
        );
      }
    } catch (apiError) {
      console.error('API Error:', apiError);
      return {
        status: 'ERROR',
        message: `API Error: ${apiError.message || 'Failed to fetch data'}`,
        error: apiError.stack
      };
    }
    
    // Log the raw response from the API for debugging
    console.log('API Response:', JSON.stringify(response.properties, null, 2));
    console.log('Timezone property value:', response.properties[timezoneProperty]);
    
    // Get the timezone from the response and convert it to IANA format
    let timezone = null;
    let timezoneStatus = 'set';
    
    if (!response.properties[timezoneProperty]) {
      timezoneStatus = 'not_set';
      timezone = 'UTC'; // Default fallback, but we'll indicate it's not set
    } else {
      timezone = convertHubSpotTimezone(response.properties[timezoneProperty]);
    }
    
    console.log('Final timezone value being returned:', timezone, 'Status:', timezoneStatus);
    
    // Get display name based on object type
    let displayName = '';
    if (objectType === 'contacts') {
      displayName = `${response.properties.firstname || ''} ${response.properties.lastname || ''}`.trim();
      if (!displayName) displayName = 'Unknown Contact';
    } else {
      displayName = response.properties.name || 'Unknown Company';
    }
    
    return {
      status: 'SUCCESS',
      timezone,
      timezoneStatus, // New field to indicate if timezone was set
      properties: {
        name: displayName
      },
      rawTimezone: response.properties[timezoneProperty] || 'Not set',
      objectType,
      recordId: hs_object_id
    };
    
  } catch (error) {
    console.error('Error in getContactData:', error);
    return {
      status: 'ERROR',
      message: error.message || 'Unknown error occurred',
      error: error.stack
    };
  }
}; 