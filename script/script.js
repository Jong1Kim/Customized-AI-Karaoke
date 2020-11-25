function submitYoutube() {
    var currentUrl = new URL(window.location.href);
    var usernote = currentUrl.searchParams.get('usernote');
    var youtubeUrl = new URL(document.getElementById('input').value);
    var youtubeID = youtubeUrl.searchParams.get('v');
    var wrapper = document.getElementById('wrapper');

    wrapper.innerHTML = `
        <h1>❸ Please wait</h1>
    `;

    // DON'T REMOVE!
    // get mp3 file link from youtube link
    // async function getMP3() {
    //     const response = await fetch(
    //         `https://youtube-to-mp32.p.rapidapi.com/yt_to_mp3?video_id=${youtubeID}`,
    //         {
    //             method: 'GET',
    //             headers: {
    //                 'x-rapidapi-key':
    //                     '76b3ab0246mshe435987951b0de0p106ccajsn5eadd7215507',
    //                 'x-rapidapi-host': 'youtube-to-mp32.p.rapidapi.com',
    //             },
    //         }
    //     );
    //     const responseData = await response.json();
    //     console.log(responseData);
    //     wrapper.innerHTML += `
    //         <div><img src="${responseData.Video_Thumbnail}" alt="${responseData.Title}"></div>
    //         <a href="${responseData.Download_url}" id="downloadYT">Download MP3</a>
    //     `;
    //     var downloadEl = document.getElementById('downloadYT');
    //     downloadEl.click();
    // }
    // getMP3();

    // temporary code not to use api
    wrapper.innerHTML += `
        <div><img src="https://img.youtube.com/vi/2ZtHF0UJO3o/hqdefault.jpg" alt="적재-풍경"></div>
        <a href="https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3" id="downloadYT">Download MP3</a>
        `;
    var downloadEl = document.getElementById('downloadYT');
    downloadEl.click();
}
