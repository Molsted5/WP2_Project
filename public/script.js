function loadApod() {
  const url = '/spaceStation/get';

  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      const formattedDate = new Date(data.timestamp * 1000).toLocaleString();

      // Use class selectors since your HTML uses class="date" and class="latitude"
      const dateElement = document.querySelector('.date');
      const latitudeElement = document.querySelector('.latitude');

      if (dateElement && latitudeElement) {
        dateElement.textContent = `Date: ${formattedDate}`;
        latitudeElement.textContent = `Latitude: ${data.iss_position.latitude}`;
      } else {
        console.warn('Missing DOM elements to display data');
      }
    })
    .catch(err => {
      console.error('Failed to load space station data:', err);
      document.body.innerHTML = '<p>Could not load space station data. Please try again later.</p>';
    });
}

// Load latest data on page load
loadApod();

