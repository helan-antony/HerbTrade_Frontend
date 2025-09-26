// Utility to fetch address from latitude and longitude using OpenStreetMap Nominatim
export async function getAddressFromCoords(lat, lng) {
	if (!lat || !lng) return '';
	try {
		const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
		if (!response.ok) return '';
		const data = await response.json();
		return data.display_name || '';
	} catch (e) {
		return '';
	}
}
