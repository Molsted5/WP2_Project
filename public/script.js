async function loadApod() {
  const url = '/spaceStation/get';

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}`);
    }
    const data = await res.json();

    const dateElement = document.querySelector('.date');
    if (dateElement) {
      let output = '';
      for(let i = 0; i < data.length; i++) {
        const formattedDate = new Date(data[i].timestamp * 1000).toLocaleString();
        output += `Date: ${formattedDate}, Latitude: ${data[i].iss_position.latitude}`;
      }
      dateElement.textContent = output;
    } else {
      console.warn('Missing DOM element to display data');
    }
  } catch(err) {
    console.error('Failed to load space station data:', err);
    document.body.innerHTML = '<p>Could not load space station data. Please try again later.</p>';
  }
}

loadApod();
