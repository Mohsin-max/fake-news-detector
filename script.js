const apiKey = "d33da303ccaf2b4c621f7cadfca2b428";
const analyzeBtn = document.getElementById('analyze-btn');
const resultSection = document.getElementById('result');
const realBar = document.getElementById('real-bar');
const fakeBar = document.getElementById('fake-bar');
const articlesContainer = document.getElementById('articles');

function sanitizeQuery(query) {
  return query.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(" ").slice(0, 5).join(" ");
}

// ---- NEW IMPROVED FAKE DETECTION FUNCTION ----
function advancedFakeDetection(title, description) {
  const fakeKeywords = ['shocking', 'cure', 'miracle', 'instantly', 'guaranteed', 'secret', 'bizarre', 'unbelievable'];
  const suspiciousPhrases = ['you won\'t believe', 'this will blow your mind', 'click here', 'read this now'];
  
  let score = 0;

  // Keyword matching
  fakeKeywords.forEach(k => {
    if (title.toLowerCase().includes(k) || description.toLowerCase().includes(k)) {
      score += 15;
    }
  });

  // Suspicious phrases matching
  suspiciousPhrases.forEach(p => {
    if (title.toLowerCase().includes(p) || description.toLowerCase().includes(p)) {
      score += 20;
    }
  });

  // Exclamation marks count
  const exclamations = (title.match(/!/g) || []).length + (description.match(/!/g) || []).length;
  score += exclamations * 5;

  // Capital words count (like ALL CAPS)
  const capsWords = (title.match(/\b[A-Z]{3,}\b/g) || []).length + (description.match(/\b[A-Z]{3,}\b/g) || []).length;
  score += capsWords * 5;

  // Short titles are often clickbait
  if (title.split(' ').length < 6) {
    score += 10;
  }

  // Ensure score stays between 0 and 100
  return Math.min(score, 100);
}

// ---- MAIN BUTTON CLICK ----
analyzeBtn.addEventListener('click', async () => {
  const text = document.getElementById('news-text').value;
  if (text.length < 10) { 
    alert("Please enter valid news text."); 
    return; 
  }

  resultSection.style.display = 'block';
  realBar.style.width = '0%';
  fakeBar.style.width = '0%';
  articlesContainer.innerHTML = '';

  const query = sanitizeQuery(text);
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&token=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.articles && data.articles.length > 0) {
      const firstArticle = data.articles[0];

      // ---- USE NEW DETECTION FUNCTION ----
      const fakeScore = advancedFakeDetection(firstArticle.title, firstArticle.description);
      const realScore = 100 - fakeScore;

      realBar.style.width = realScore + '%';
      realBar.textContent = realScore + '% Real';

      fakeBar.style.width = fakeScore + '%';
      fakeBar.textContent = fakeScore + '% Fake';

      data.articles.slice(0, 4).forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `<h4>${article.title}</h4><p>${article.description}</p><a href="${article.url}" target="_blank">Read More</a>`;
        articlesContainer.appendChild(card);
      });

    } else {
      alert("No articles found. Please try a different keyword.");
    }
  } catch (err) {
    alert("Error fetching articles. Please try again.");
  }
});

// Example click handling (same as before)
const examples = document.querySelectorAll('.example-card');
examples.forEach(card => {
  card.addEventListener('click', () => {
    document.getElementById('news-text').value = card.textContent;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
