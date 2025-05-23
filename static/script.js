document.getElementById("imageForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const prompt = document.getElementById("prompt").value;
    const resultDiv = document.getElementById("result");
    const loading = document.getElementById("loading");

    loading.style.display = "flex";
    resultDiv.innerHTML = "";

    try {
        let anonId = localStorage.getItem("anon_id");
        if (!anonId) {
            anonId = crypto.randomUUID();
            localStorage.setItem("anon_id", anonId);
        }

        const response = await fetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-ANON-ID": anonId 
            },
            body: JSON.stringify({ prompt }),
        });

        const contentType = response.headers.get("Content-Type") || "";
        const isJson = contentType.includes("application/json");
        const data = isJson ? await response.json() : {};

        loading.style.display = "none";

        if (response.status === 429) {
            resultDiv.innerHTML = `<p style="color: red;">You've reached your daily limit. Please try again tomorrow.</p>`;
            return;
        }

        if (!response.ok || !data.image_url) {
            resultDiv.innerHTML = `<p style="color: red;">Error: ${data.error || "Image generation failed."}</p>`;
            return;
        }

        let generatedImage = document.getElementById("generatedImage");
        if (!generatedImage) {
            generatedImage = document.createElement("img");
            generatedImage.id = "generatedImage";
            generatedImage.className = "generated-image";
            generatedImage.alt = "Your AI-generated image";
            resultDiv.appendChild(generatedImage);
        }

        generatedImage.src = data.image_url;
        generatedImage.style.display = "block";

        let downloadButton = document.getElementById("downloadButton");
        if (!downloadButton) {
            downloadButton = document.createElement("a");
            downloadButton.id = "downloadButton";
            downloadButton.className = "btn";
            downloadButton.innerHTML = '<i class="fas fa-download"></i> Download Image';
            resultDiv.appendChild(downloadButton);
        }

        downloadButton.href = `/download-image?image_url=${encodeURIComponent(data.image_url)}`;
        downloadButton.style.display = "inline-block";

    } catch (err) {
        loading.style.display = "none";
        resultDiv.innerHTML = `<p style="color: red;">Unexpected Error: ${err.message}</p>`;
    }
});
