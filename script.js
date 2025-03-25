// async function checkNews() {
//     const newsText = document.getElementById("newsInput").value.trim();
//     const resultDiv = document.getElementById("result");

//     // Reset result display
//     resultDiv.style.display = "none";

//     // Validation checks
//     if (!newsText) {
//         showResult("Please enter some text to analyze", "error");
//         return;
//     }

//     if (newsText.length < 20) {
//         showResult("Please enter more detailed text (at least 20 characters)", "error");
//         return;
//     }

//     // Show loading message
//     showResult("Searching news sources...", "loading");

//     // Replace with your NewsAPI key (get from https://newsapi.org/)
//     const API_KEY = "YOUR_API_KEY_HERE"; // <<< PASTE YOUR KEY HERE
//     const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(newsText)}&sortBy=publishedAt&apiKey=${API_KEY}`;

//     try {
//         const response = await fetch(apiUrl);
//         const data = await response.json();

//         // Check if news is found on trusted sources (BBC, NDTV, etc.)
//         if (data.articles && data.articles.length > 0) {
//             const trustedSources = data.articles.some(article => 
//                 article.source.name.includes("BBC") || 
//                 article.source.name.includes("NDTV") ||
//                 article.source.name.includes("The Hindu") ||
//                 article.source.name.includes("Times of India")
//             );

//             if (trustedSources) {
//                 showResult("✅ This news appears on trusted sources (likely REAL).", "real");
//             } else {
//                 showResult("⚠️ News found, but not on major trusted sources. Verify carefully!", "fake");
//             }
//         } else {
//             showResult("❌ No matching news found on reliable sources. Could be FAKE!", "fake");
//         }
//     } catch (error) {
//         showResult("Error fetching data. Try again later.", "error");
//     }
// }

// function showResult(message, type) {
//     const resultDiv = document.getElementById("result");
//     resultDiv.textContent = message;
//     resultDiv.className = type;
//     resultDiv.style.display = "block";
// }



async function checkNews() {
    const newsText = document.getElementById("newsInput").value.trim();
    const resultDiv = document.getElementById("result");

    // Reset and validate
    resultDiv.style.display = "none";
    if (!newsText) return showResult("Please enter news text", "error");
    if (newsText.length < 15) return showResult("Text too short (min 15 chars)", "error");

    // Updated trusted sources
    const TRUSTED_SOURCES = [
        "Dawn", "Geo News", "ARY News", "BBC", "NDTV",
        "Reuters", "Al Jazeera", "The Express Tribune"
    ];

    try {
        // Using a more reliable CORS proxy
        const API_KEY = "0aadbc0cbd1d4642b6fae5c2c27b4c9d"; // Replace with your key
        const proxyUrl = "https://api.allorigins.win/raw?url=";
        const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(newsText)}&pageSize=5&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;

        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));

        // First check if response is HTML (error)
        const text = await response.text();
        if (text.startsWith("<!DOCTYPE html") || text.includes("CORS Anywhere")) {
            throw new Error("Proxy server blocked the request. Try again later.");
        }

        // Now parse as JSON
        const data = JSON.parse(text);

        console.log("API Response:", data); // For debugging

        if (!data.articles || data.articles.length === 0) {
            return showResult("❌ No matches found in news databases", "fake");
        }

        // Case-insensitive source check
        const isTrusted = data.articles.some(article => {
            const sourceName = article.source?.name || "";
            return TRUSTED_SOURCES.some(src =>
                sourceName.toLowerCase().includes(src.toLowerCase())
            );
        });

        if (isTrusted) {
            const verifiedBy = data.articles.find(article =>
                TRUSTED_SOURCES.some(src =>
                    article.source?.name.toLowerCase().includes(src.toLowerCase())
                )
            ).source.name;
            showResult(`✅ Verified by ${verifiedBy}`, "real");
        } else {
            const foundSources = [...new Set(data.articles.map(a => a.source?.name))].join(", ");
            showResult(`⚠️ Found on: ${foundSources || 'unknown sources'} - verify manually`, "fake");
        }

    } catch (error) {
        console.error("Error:", error);
        showResult(`🔧 Error: ${error.message}`, "error");
    }
}

function showResult(message, type) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = message;
    resultDiv.className = type;
    resultDiv.style.display = "block";
}