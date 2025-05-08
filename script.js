const apiKey = "d33da303ccaf2b4c621f7cadfca2b428";
const analyzeBtn = document.getElementById('analyze-btn');
const resultSection = document.getElementById('result');
const realBar = document.getElementById('real-bar');
const fakeBar = document.getElementById('fake-bar');
const articlesContainer = document.getElementById('articles');

function sanitizeQuery(query) {
  return query.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(" ").slice(0, 5).join(" ");
}

function fakeDetectionLogic(title, description) {
  const fakeKeywords = ['shocking', 'cure', 'miracle', 'instantly', 'guaranteed'];
  let score = 0;
  fakeKeywords.forEach(k => {
    if(title.toLowerCase().includes(k) || description.toLowerCase().includes(k)) {
      score += 20;
    }
  });
  return Math.min(score, 80) + 20;
}

analyzeBtn.addEventListener('click', async ()=>{
  const text = document.getElementById('news-text').value;
  if(text.length < 10){ alert("Please enter valid news text."); return; }

  resultSection.style.display = 'block';
  realBar.style.width = '0%';
  fakeBar.style.width = '0%';
  articlesContainer.innerHTML = '';

  const query = sanitizeQuery(text);

  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&token=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if(data.articles && data.articles.length > 0){
      const firstArticle = data.articles[0];
      const fakeScore = fakeDetectionLogic(firstArticle.title, firstArticle.description);
      const realScore = 100 - fakeScore;

      realBar.style.width = realScore + '%';
      realBar.textContent = realScore + '%';

      fakeBar.style.width = fakeScore + '%';
      fakeBar.textContent = fakeScore + '%';

      data.articles.slice(0, 4).forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `<h4>${article.title}</h4><p>${article.description}</p><a href="${article.url}" target="_blank">Read More</a>`;
        articlesContainer.appendChild(card);
      });

    } else {
      alert("No articles found. Please try a different keyword.");
    }
  } catch(err){
    alert("Error fetching articles. Please try again.");
  }
});

const examples = document.querySelectorAll('.example-card');
examples.forEach(card =>{
  card.addEventListener('click', ()=>{
    document.getElementById('news-text').value = card.textContent;
    window.scrollTo({top:0, behavior:'smooth'});
  });
});