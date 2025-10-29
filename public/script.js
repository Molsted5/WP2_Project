let currentDate = null;

function loadApod(date = null) {
  const url = date ? `/apod/get?date=${date}` : '/apod/get';
  fetch(url)
    .then(res => res.json())
    .then(data => {
      currentDate = data.date;
      document.getElementById('image').src = data.url;
      document.getElementById('date').textContent = `Date: ${data.date}`;
      document.getElementById('explanation').textContent = data.explanation;
    })
    .catch(err => {
      console.error('Failed to load APOD:', err);
      document.body.innerHTML = '<p>Could not load APOD. Please try again later.</p>';
    });
}

// Load latest APOD on page load
loadApod();

// Navigation buttons
document.getElementById('prev').addEventListener('click', () => {
  fetch(`/apod/prev?date=${currentDate}`)
    .then(res => res.json())
    .then(data => loadApod(data.date));
});

document.getElementById('next').addEventListener('click', () => {
  fetch(`/apod/next?date=${currentDate}`)
    .then(res => res.json())
    .then(data => loadApod(data.date));
});