import axios from 'axios';

interface Coordinates {
    lat: number;
    lon: number;
}

async function getCoordinates(city: string): Promise<Coordinates | null> {
    const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json&addressdetails=1`;

    try {
        const response = await axios.get(url);

        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { lat: parseFloat(lat), lon: parseFloat(lon) };
        } else {
            console.log("City not found.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching coordinates: ", error);
        return null;
    }
}

export default getCoordinates;