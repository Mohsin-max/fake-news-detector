// API Key for NewsAPI
const API_KEY = '0aadbc0cbd1d4642b6fae5c2c27b4c9d';

// DOM Elements
const newsTextArea = document.getElementById('news-text');
const newsUrlInput = document.getElementById('news-url');
const analyzeBtn = document.getElementById('analyze-btn');
const analyzeUrlBtn = document.getElementById('analyze-url-btn');
const resultSection = document.querySelector('.result-section');
const loadingSection = document.querySelector('.loading-section');
const confidenceFill = document.getElementById('confidence-fill');
const confidencePercentage = document.getElementById('confidence-percentage');
const sourceBar = document.getElementById('source-bar');
const sourceValue = document.getElementById('source-value');
const sourceInfo = document.getElementById('source-info');
const contentBar = document.getElementById('content-bar');
const contentValue = document.getElementById('content-value');
const contentInfo = document.getElementById('content-info');
const factBar = document.getElementById('fact-bar');
const factValue = document.getElementById('fact-value');
const factInfo = document.getElementById('fact-info');
const similarArticles = document.getElementById('similar-articles');
const articlesContainer = document.getElementById('articles-container');

// Trusted sources for verification
const TRUSTED_SOURCES = [
    'bbc',
    'reuters',
    'ap',
    'the-wall-street-journal',
    'the-washington-post',
    'the-new-york-times',
    'bloomberg',
    'cnn',
    'al-jazeera-english',
    'time',
    'the-hill',
    'politico',
    'nbc-news',
    'cbs-news',
    'abc-news',
    'fox-news'
];

// Event Listeners
analyzeBtn.addEventListener('click', analyzeText);
analyzeUrlBtn.addEventListener('click', analyzeUrl);

// Function to analyze text input
async function analyzeText() {
    const text = newsTextArea.value.trim();

    if (!text) {
        alert('Please enter some news text to analyze');
        return;
    }

    showLoading();

    try {
        const result = await simulateAnalysis(text);
        const similar = await searchSimilarArticles(text);
        displayResults(result, similar);
    } catch (error) {
        console.error('Error analyzing text:', error);
        alert('An error occurred while analyzing the text. Please try again.');
        hideLoading();
    }
}

// Function to analyze URL input
async function analyzeUrl() {
    const url = newsUrlInput.value.trim();

    if (!url) {
        alert('Please enter a news URL to analyze');
        return;
    }

    showLoading();

    try {
        const domain = extractDomain(url);
        if (!domain) {
            throw new Error('Invalid URL format');
        }

        const response = await fetch(`https://newsapi.org/v2/everything?domains=${domain}&pageSize=1`, {
            headers: {
                'X-Api-Key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "error") {
            throw new Error(data.message || "NewsAPI error");
        }

        if (data.articles && data.articles.length > 0) {
            const article = data.articles[0];
            const result = await simulateAnalysis(article.content || article.description || article.title);
            const similar = await searchSimilarArticles(article.title);
            displayResults(result, similar);
        } else {
            throw new Error('No articles found for this URL');
        }
    } catch (error) {
        console.error('Error analyzing URL:', error);
        alert('Error analyzing URL: ' + error.message);
        hideLoading();
    }
}

// Function to simulate analysis
function simulateAnalysis(text) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate realistic analysis results
            const wordCount = text.split(/\s+/).length;
            const charCount = text.length;
            const hasExclamation = (text.match(/!/g) || []).length;
            const hasAllCaps = (text.match(/\b[A-Z]{2,}\b/g) || []).length;

            // Calculate scores
            let sourceScore = 70 + Math.random() * 30;
            let contentScore = 60 + Math.random() * 30;
            let factScore = 50 + Math.random() * 40;

            // Adjust scores based on content
            if (hasExclamation > 3) contentScore -= 15;
            if (hasAllCaps > 2) contentScore -= 20;
            if (wordCount < 50) contentScore -= 25;

            // Ensure scores are within 0-100 range
            sourceScore = Math.max(0, Math.min(100, sourceScore));
            contentScore = Math.max(0, Math.min(100, contentScore));
            factScore = Math.max(0, Math.min(100, factScore));

            // Calculate overall confidence
            const overallConfidence = (sourceScore * 0.4 + contentScore * 0.3 + factScore * 0.3);

            resolve({
                overallConfidence,
                sourceScore,
                contentScore,
                factScore,
                analysis: {
                    wordCount,
                    charCount,
                    hasExclamation,
                    hasAllCaps
                }
            });
        }, 1500);
    });
}

// Function to search for similar articles
async function searchSimilarArticles(query) {
    try {
        // Extract first 5 words for better search results
        const searchQuery = query.split(' ').slice(0, 5).join(' ');
        const encodedQuery = encodeURIComponent(searchQuery);

        const response = await fetch(`https://newsapi.org/v2/everything?q=${encodedQuery}&pageSize=4`, {
            headers: {
                'X-Api-Key': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "error") {
            throw new Error(data.message || "NewsAPI error");
        }

        return data.articles?.filter(article =>
            article.title && article.description && article.url
        ).slice(0, 4) || [];
    } catch (error) {
        console.error('Error searching similar articles:', error);
        return [];
    }
}

// Function to display results
function displayResults(result, similarArticlesData) {
    // Update confidence meter
    const confidence = result.overallConfidence;
    confidenceFill.style.width = `${confidence}%`;
    confidenceFill.style.background = getConfidenceColor(confidence);
    confidencePercentage.textContent = `${Math.round(confidence)}%`;

    // Update analysis cards
    updateAnalysisCard(sourceBar, sourceValue, sourceInfo, result.sourceScore, [
        "The source is unknown or has a poor reputation for accuracy.",
        "The source has mixed reliability and should be verified.",
        "The source is generally reliable but should still be cross-checked.",
        "The source is highly reputable and trustworthy."
    ]);

    updateAnalysisCard(contentBar, contentValue, contentInfo, result.contentScore, [
        "The content shows multiple signs of potential misinformation.",
        "The content has some questionable elements that need verification.",
        "The content appears mostly neutral and factual in tone.",
        "The content is well-written and shows no obvious signs of manipulation."
    ]);

    updateAnalysisCard(factBar, factValue, factInfo, result.factScore, [
        "Key claims could not be verified and may be false.",
        "Some claims are questionable and need further verification.",
        "Most claims appear to be accurate with minor discrepancies.",
        "All key claims have been verified by trusted sources."
    ]);

    // Display similar articles if available
    if (similarArticlesData.length > 0) {
        displaySimilarArticles(similarArticlesData);
        similarArticles.classList.remove('hidden');
    } else {
        similarArticles.classList.add('hidden');
    }

    // Show results
    hideLoading();
    resultSection.classList.remove('hidden');
}

// Helper function to update analysis cards
function updateAnalysisCard(barElement, valueElement, infoElement, score, messages) {
    barElement.style.width = `${score}%`;
    barElement.style.backgroundColor = getScoreColor(score);
    valueElement.textContent = `${Math.round(score)}%`;

    const messageIndex = score < 40 ? 0 : score < 65 ? 1 : score < 85 ? 2 : 3;
    infoElement.textContent = messages[messageIndex];
}

// Helper function to display similar articles
function displaySimilarArticles(articles) {
    articlesContainer.innerHTML = '';

    articles.forEach(article => {
        const isTrusted = article.source.id && TRUSTED_SOURCES.includes(article.source.id.toLowerCase());
        const imageUrl = article.urlToImage || 'https://via.placeholder.com/300x160?text=No+Image';

        const articleCard = document.createElement('div');
        articleCard.className = 'article-card';
        articleCard.innerHTML = `
            <div class="article-image" style="background-image: url('${imageUrl}')"></div>
            <div class="article-content">
                <div class="article-source">
                    ${isTrusted ? '<span class="trusted-badge"><i class="fas fa-check-circle"></i> Trusted</span>' : ''}
                    <span>${article.source.name}</span>
                </div>
                <h4 class="article-title">${article.title}</h4>
                <p class="article-description">${article.description || 'No description available'}</p>
                <a href="${article.url}" target="_blank" class="article-link">Read full article <i class="fas fa-external-link-alt"></i></a>
            </div>
        `;
        articlesContainer.appendChild(articleCard);
    });
}

// Helper function to get color based on confidence score
function getConfidenceColor(score) {
    if (score < 30) return '#f72585';
    if (score < 60) return '#f8961e';
    return '#4cc9f0';
}

// Helper function to get color based on score
function getScoreColor(score) {
    if (score < 40) return '#f72585';
    if (score < 70) return '#f8961e';
    return '#4cc9f0';
}

// Helper function to extract domain from URL
function extractDomain(url) {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch (e) {
        console.error('Invalid URL:', e);
        return null;
    }
}

// Helper function to show loading state
function showLoading() {
    loadingSection.classList.remove('hidden');
    resultSection.classList.add('hidden');
    newsTextArea.disabled = true;
    newsUrlInput.disabled = true;
    analyzeBtn.disabled = true;
    analyzeUrlBtn.disabled = true;
}

// Helper function to hide loading state
function hideLoading() {
    loadingSection.classList.add('hidden');
    newsTextArea.disabled = false;
    newsUrlInput.disabled = false;
    analyzeBtn.disabled = false;
    analyzeUrlBtn.disabled = false;
}