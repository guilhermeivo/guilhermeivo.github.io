let audio = new Audio('./assets/audio/Clown horn.mp3');
let playAudio = document.querySelector('#playAudio');

playAudio.addEventListener('click', () => {
    playAudio.classList.remove('press');
    if (audio.paused) {
        audio.play();                                
    }else{
        audio.currentTime = 0;
    }

    playAudio.classList.add('press');

    setTimeout(() => {
        playAudio.classList.remove('press');
    }, 300);
})