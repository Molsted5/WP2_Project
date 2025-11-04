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
      const dateElement = document.querySelector('.date');

      if (dateElement) {
        let output = '';
        data.forEach(entry => {
          const formattedDate = new Date(entry.timestamp * 1000).toLocaleString();
          output += `Date: ${formattedDate}, Latitude: ${entry.iss_position.latitude}, Longitude: ${entry.iss_position.longitude}`;
        });
        dateElement.textContent = output;
      } else {
        console.warn('Missing DOM element to display data');
      }
    })
    .catch(err => {
      console.error('Failed to load space station data:', err);
      document.body.innerHTML = '<p>Could not load space station data. Please try again later.</p>';
    });
}

// Load latest data on page load
loadApod();
