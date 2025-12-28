console.log("Frontend JS loaded");

const weddingDate = new Date("2026-02-21T00:00:00").getTime();

setInterval(() => {
    const now = new Date().getTime();
    const diff = weddingDate - now;

    if(diff <= 0) return;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = String(hours).padStart(2,"0");
    document.getElementById("minutes").innerText = String(minutes).padStart(2,"0");
    document.getElementById("seconds").innerText = String(seconds).padStart(2,"0");
}, 1000);


function toggleMusic(button) {
    const card = button.closest('.card');
    const audio = card.querySelector('audio');

    // Pause all other audios
    document.querySelectorAll('audio').forEach(a => {
        if (a !== audio) {
            a.pause();
            a.currentTime = 0;
        }
    });

    // Reset all buttons text
    document.querySelectorAll('.music-box').forEach(b => {
        b.innerText = 'Play';
    });

    // Play / Pause current
    if (audio.paused) {
        audio.play();
        button.innerText = 'Pause';
    } else {
        audio.pause();
        button.innerText = 'Play';
    }
  }


  document.querySelector(".wedding-form").addEventListener("submit", async function(e) {
  e.preventDefault(); // ❌ Stop page reload

  const formData = new FormData(this);

  try {
    const response = await fetch("/submit", {
      method: "POST",
      body: new URLSearchParams(formData)
    });

    const result = await response.text();
    const messageDiv = document.getElementById("success-message");
    if (response.ok) {
      messageDiv.textContent = result;
      messageDiv.style.color = "green";
      this.reset();
    } else {
      messageDiv.textContent = "Error: " + result;
      messageDiv.style.color = "red";
    }
    messageDiv.style.display = "block";
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 5000); // Hide after 5 seconds
  } catch (error) {
    console.error("Fetch error:", error);
    const messageDiv = document.getElementById("success-message");
    messageDiv.textContent = "Network error. Please try again.";
    messageDiv.style.color = "red";
    messageDiv.style.display = "block";
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 5000);
  }
});