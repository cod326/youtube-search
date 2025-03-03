let API_KEY = "AIzaSyCKIci3U9lMK3kJkzmvJUpT7kMywTjBhWU";
const BASE_URL = "https://www.googleapis.com/youtube/v3/search";
const VIDEO_DETAILS_URL = "https://www.googleapis.com/youtube/v3/videos";

async function searchYouTube() {
    const query = document.getElementById("searchQuery").value;
    if (!query) return;

    const url = `${BASE_URL}?part=snippet&q=${query}&type=video&maxResults=50&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const videoMap = new Map(data.items.map(video => [video.id.videoId, video.snippet]));
        const videoIds = Array.from(videoMap.keys());
        const filteredVideos = await filterOutShorts(videoIds, videoMap);
        displayResults(filteredVideos);
    } catch (error) {
        console.error("Error fetching data", error);
    }
}

async function filterOutShorts(videoIds, videoMap) {
    if (videoIds.length === 0) return [];
    const url = `${VIDEO_DETAILS_URL}?part=contentDetails&id=${videoIds.join(",")}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.items.filter(video => {
            const duration = video.contentDetails.duration;
            return !isShorts(duration);
        }).map(video => ({ id: video.id, snippet: videoMap.get(video.id) }));
    } catch (error) {
        console.error("Error fetching video details", error);
        return [];
    }
}

function isShorts(duration) {
    const match = duration.match(/PT(\d+)M?(\d+)?S?/);
    if (!match) return false;
    const minutes = parseInt(match[1] || 0, 10);
    const seconds = parseInt(match[2] || 0, 10);
    return minutes === 0 && seconds <= 60;
}

function displayResults(videos) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    videos.forEach(video => {
        if (!video.snippet) return;
        const videoElement = document.createElement("div");
        videoElement.classList.add("video");
        videoElement.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${video.id}" frameborder="0" allowfullscreen></iframe>
            <div>${video.snippet.title}</div>
        `;
        resultsDiv.appendChild(videoElement);
    });
}
