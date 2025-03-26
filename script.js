
// async function checkNews() {
//     const newsText = document.getElementById("newsInput").value.trim();
//     const resultContainer = document.getElementById("result-container");
//     const resultText = document.getElementById("result-text");
//     const sourcesElement = document.getElementById("sources");

//     // Reset UI
//     resultContainer.style.display = "none";
//     document.getElementById("real-circle").setAttribute("stroke-dasharray", "0, 100");
//     document.getElementById("fake-circle").setAttribute("stroke-dasharray", "0, 100");
//     document.getElementById("real-percent").textContent = "0%";
//     document.getElementById("fake-percent").textContent = "0%";

//     // Validation
//     if (!newsText) {
//         showResult("Please enter news text", "error");
//         return;
//     }
//     if (newsText.length < 15) {
//         showResult("Text too short (min 15 chars)", "error");
//         return;
//     }

//     // Show loading
//     resultText.className = "result-text loading";
//     resultText.textContent = "Searching news sources...";
//     resultContainer.style.display = "block";

//     const TRUSTED_SOURCES = [
//         "Dawn", "Geo News", "ARY News", "BBC", "NDTV",
//         "Reuters", "Al Jazeera", "The Express Tribune"
//     ];

//     try {
//         const API_KEY = "0aadbc0cbd1d4642b6fae5c2c27b4c9d";
//         const proxyUrl = "https://api.allorigins.win/raw?url=";
//         const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(newsText)}&pageSize=5&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;

//         const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
//         const text = await response.text();
        
//         if (text.startsWith("<!DOCTYPE html")) {
//             throw new Error("Proxy server blocked the request. Try again later.");
//         }

//         const data = JSON.parse(text);

//         if (!data.articles || data.articles.length === 0) {
//             showResult("❌ No matches found in news databases", "fake-text");
//             updateCircles(0, 100);
//             sourcesElement.textContent = "No sources found";
//             return;
//         }

//         // Calculate trust score
//         let trustedCount = 0;
//         const foundSources = [];

//         data.articles.forEach(article => {
//             const sourceName = article.source?.name || "";
//             const isTrusted = TRUSTED_SOURCES.some(src => 
//                 sourceName.toLowerCase().includes(src.toLowerCase())
//             );
//             if (isTrusted) trustedCount++;
//             foundSources.push(sourceName);
//         });

//         const trustPercentage = Math.round((trustedCount / data.articles.length) * 100);
//         const fakePercentage = 100 - trustPercentage;
//         const uniqueSources = [...new Set(foundSources)].join(", ");

//         // Update UI
//         updateCircles(trustPercentage, fakePercentage);
//         sourcesElement.textContent = `Sources: ${uniqueSources || 'unknown'}`;

//         if (trustPercentage >= 70) {
//             showResult(`✅ Verified by ${trustedCount}/${data.articles.length} trusted sources`, "real-text");
//         } 
//         else if (trustPercentage >= 30) {
//             showResult(`⚠️ Partially verified (${trustedCount}/${data.articles.length} trusted sources)`, "fake-text");
//         }
//         else {
//             showResult(`❌ Low verification (${trustedCount}/${data.articles.length} trusted sources)`, "fake-text");
//         }

//     } catch (error) {
//         showResult(`🔧 Error: ${error.message}`, "error");
//         sourcesElement.textContent = "";
//         console.error("Error:", error);
//     }
// }

// function showResult(message, className) {
//     const resultText = document.getElementById("result-text");
//     resultText.textContent = message;
//     resultText.className = "result-text " + className;
// }

// function updateCircles(realPercent, fakePercent) {
//     // Animate the circles
//     const realCircle = document.getElementById("real-circle");
//     const fakeCircle = document.getElementById("fake-circle");
//     const realText = document.getElementById("real-percent");
//     const fakeText = document.getElementById("fake-percent");

//     realCircle.setAttribute("stroke-dasharray", `${realPercent}, 100`);
//     fakeCircle.setAttribute("stroke-dasharray", `${fakePercent}, 100`);
    
//     // Animate the percentage numbers
//     animateValue(realText, 0, realPercent, 800);
//     animateValue(fakeText, 0, fakePercent, 800);
// }

// function animateValue(element, start, end, duration) {
//     let startTimestamp = null;
//     const step = (timestamp) => {
//         if (!startTimestamp) startTimestamp = timestamp;
//         const progress = Math.min((timestamp - startTimestamp) / duration, 1);
//         const value = Math.floor(progress * (end - start) + start);
//         element.textContent = value + "%";
//         if (progress < 1) {
//             window.requestAnimationFrame(step);
//         }
//     };
//     window.requestAnimationFrame(step);
// }




async function checkNews() {
    const newsText = document.getElementById("newsInput").value.trim();
    const resultContainer = document.getElementById("result-container");
    const resultText = document.getElementById("result-text");
    const sourcesElement = document.getElementById("sources");

    // Reset UI
    resultContainer.style.display = "none";
    document.getElementById("real-circle").setAttribute("stroke-dasharray", "0, 100");
    document.getElementById("fake-circle").setAttribute("stroke-dasharray", "0, 100");
    document.getElementById("real-percent").textContent = "0%";
    document.getElementById("fake-percent").textContent = "0%";

    // Validation - EMPTY CHECK
    if (!newsText) {
        showResult("❌ Please enter some news text", "error");
        resultContainer.style.display = "block";
        return;
    }

    // Validation - MINIMUM 15 CHARACTERS
    if (newsText.length < 15) {
        showResult(`❌ Text too short (${newsText.length}/15 characters)`, "error");
        resultContainer.style.display = "block";
        return;
    }

    // Show loading
    resultText.className = "result-text loading";
    resultText.textContent = "Searching news sources...";
    resultContainer.style.display = "block";

    const TRUSTED_SOURCES = [
        "Dawn", "Geo News", "ARY News", "BBC", "NDTV",
        "Reuters", "Al Jazeera", "The Express Tribune"
    ];

    try {
        const API_KEY = "0aadbc0cbd1d4642b6fae5c2c27b4c9d";
        const proxyUrl = "https://api.allorigins.win/raw?url=";
        const apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(newsText)}&pageSize=5&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;

        const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
        const text = await response.text();
        
        if (text.startsWith("<!DOCTYPE html")) {
            throw new Error("Proxy server blocked the request. Try again later.");
        }

        const data = JSON.parse(text);

        if (!data.articles || data.articles.length === 0) {
            showResult("❌ No matches found in news databases", "fake-text");
            updateCircles(0, 100);
            sourcesElement.textContent = "No sources found";
            return;
        }

        // Calculate trust score
        let trustedCount = 0;
        const foundSources = [];

        data.articles.forEach(article => {
            const sourceName = article.source?.name || "";
            const isTrusted = TRUSTED_SOURCES.some(src => 
                sourceName.toLowerCase().includes(src.toLowerCase())
            );
            if (isTrusted) trustedCount++;
            foundSources.push(sourceName);
        });

        const trustPercentage = Math.round((trustedCount / data.articles.length) * 100);
        const fakePercentage = 100 - trustPercentage;
        const uniqueSources = [...new Set(foundSources)].join(", ");

        // Update UI
        updateCircles(trustPercentage, fakePercentage);
        sourcesElement.textContent = `Sources: ${uniqueSources || 'unknown'}`;

        if (trustPercentage >= 70) {
            showResult(`✅ Verified by ${trustedCount}/${data.articles.length} trusted sources`, "real-text");
        } 
        else if (trustPercentage >= 30) {
            showResult(`⚠️ Partially verified (${trustedCount}/${data.articles.length} trusted sources)`, "fake-text");
        }
        else {
            showResult(`❌ Low verification (${trustedCount}/${data.articles.length} trusted sources)`, "fake-text");
        }

    } catch (error) {
        showResult(`🔧 Error: ${error.message}`, "error");
        sourcesElement.textContent = "";
        console.error("Error:", error);
    }
}

function showResult(message, className) {
    const resultText = document.getElementById("result-text");
    resultText.textContent = message;
    resultText.className = "result-text " + className;
}

function updateCircles(realPercent, fakePercent) {
    // Animate the circles
    const realCircle = document.getElementById("real-circle");
    const fakeCircle = document.getElementById("fake-circle");
    const realText = document.getElementById("real-percent");
    const fakeText = document.getElementById("fake-percent");

    realCircle.setAttribute("stroke-dasharray", `${realPercent}, 100`);
    fakeCircle.setAttribute("stroke-dasharray", `${fakePercent}, 100`);
    
    // Animate the percentage numbers
    animateValue(realText, 0, realPercent, 800);
    animateValue(fakeText, 0, fakePercent, 800);
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + "%";
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}