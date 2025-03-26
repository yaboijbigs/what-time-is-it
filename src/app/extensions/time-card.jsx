import React, { useState, useEffect } from 'react';
import {
  Text,
  Flex,
  Box,
  LoadingSpinner,
  StatusTag,
  Divider,
  hubspot,
} from '@hubspot/ui-extensions';

// Main extension component
hubspot.extend(({ context }) => (
  <TimeCard context={context} />
));

// Time card component
const TimeCard = ({ context }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState(null);
  const [timezoneStatus, setTimezoneStatus] = useState('set');
  const [errorMessage, setErrorMessage] = useState('');
  const [objectDetails, setObjectDetails] = useState({});
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Get object details from context
        const objectTypeId = context?.crm?.objectTypeId;
        const objectId = context?.crm?.objectId;
        
        // Determine if we're looking at a contact or company
        let objectType = 'unknown';
        if (objectTypeId === '0-1') objectType = 'contacts';
        else if (objectTypeId === '0-2') objectType = 'companies';
        
        setObjectDetails({
          objectType,
          objectId,
          objectTypeId
        });
        
        // Call serverless function to get timezone data
        const result = await hubspot.serverless('getContactData', {
          parameters: {
            hs_object_id: objectId,
            objectType: objectType
          }
        });
        
        if (result.status === 'SUCCESS') {
          setName(result.properties.name);
          setTimezone(result.timezone);
          setTimezoneStatus(result.timezoneStatus || 'set');
        } else {
          throw new Error(result.message || 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage(`Error: ${error.message || 'Unknown error'}`);
        setTimezone('UTC');
        setTimezoneStatus('error');
        setName('Unknown');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [context]);
  
  // Update time based on timezone
  useEffect(() => {
    if (!timezone) return;
    
    // Don't update time if timezone is not set
    if (timezoneStatus === 'not_set') {
      setCurrentTime('No timezone set');
      return;
    }
    
    const updateTime = () => {
      try {
        const time = new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
          timeZone: timezone
        });
        
        setCurrentTime(time);
      } catch (error) {
        console.error('Error formatting time:', error);
        setCurrentTime('Unavailable');
      }
    };
    
    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    
    return () => clearInterval(intervalId);
  }, [timezone, timezoneStatus]);
  
  if (loading) {
    return (
      <Flex direction="column" gap="md" padding="md" alignItems="center">
        <LoadingSpinner />
        <Text>Loading time data...</Text>
      </Flex>
    );
  }
  
  return (
    <Flex direction="column" gap="md" padding="md">
      <Box>
        <Text variant="h3">
          Current time for {name}: {' '}
          <Text inline format={{ fontWeight: "bold" }}>
            {timezoneStatus === 'not_set' ? 'No timezone set' : currentTime}
          </Text>
        </Text>
        <Text>
          <StatusTag variant={timezoneStatus === 'not_set' ? 'warning' : 'info'}>
            {timezoneStatus === 'not_set' ? 'No timezone' : timezone}
          </StatusTag>
        </Text>
      </Box>
      {errorMessage && (
        <Box>
          <Text color="error">{errorMessage}</Text>
        </Box>
      )}
    </Flex>
  );
}; 