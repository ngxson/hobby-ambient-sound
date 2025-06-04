# Ambient Sound

A React-based ambient sound player that automatically adjusts soundscapes based on the time of day and solar events (sunrise/sunset).

## Features

- **Solar-based timing**: Uses sunrise/sunset calculations for your location to determine sound transitions
- **Automatic soundscape changes**: Different ambient sounds play during different periods:
- **Real-time updates**: Automatically switches soundscapes every 30 seconds
- **Volume control**: Each sound has configurable volume levels
- **Visual feedback**: Shows current time, next event, and playing sounds with volume indicators

## Configuration

Edit `src/config.ts` to customize:
- **Location**: Set your latitude/longitude for accurate sunrise/sunset times
- **Sound events**: Define which sounds play during different time periods
- **Volume levels**: Adjust individual sound volumes (0.0 to 1.0)
- **Sound files**: Add new sounds by updating the `soundNameToFile` mapping
