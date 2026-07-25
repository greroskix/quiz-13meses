document.addEventListener('DOMContentLoaded', () => {

    // ── Áudio ──
    const bgAudio          = document.getElementById('bg-music');
    const enigmaAudio      = document.getElementById('enigma-music');
    const coinAudio        = document.getElementById('coin-sound');
    const successAudio     = document.getElementById('success-sound');
    const playAudio        = document.getElementById('play-sound');
    const theme1Audio      = document.getElementById('theme1-music');
    const theme2Audio      = document.getElementById('theme2-music');
    const theme3Audio      = document.getElementById('theme3-music');
    const contagemAudio    = document.getElementById('contagem-sound');
    const selectAudio      = document.getElementById('select-sound');
    const derrotaAudio     = document.getElementById('sound-derrota');
    const victoryAudio     = document.getElementById('sound-victory');
    const musicaFinalAudio = document.getElementById('musica-final');
    const themeTracks      = [theme1Audio, theme2Audio, theme3Audio];

    // ── Telas ──
    const startScreen     = document.getElementById('start-screen');
    const enigmaScreen    = document.getElementById('enigma-screen');
    const victoryScreen   = document.getElementById('victory-screen');
    const victoryModal    = document.getElementById('victory-modal');
    const animationScreen = document.getElementById('animation-screen');
    const loadingScreen   = document.getElementById('loading-screen');
    const countdownScreen = document.getElementById('countdown-screen');
    const quizScreen      = document.getElementById('quiz-screen');
    const resultsScreen   = document.getElementById('results-screen');
    const prizeScreen     = document.getElementById('prize-screen');

    // ── Menu ──
    const coverImage    = document.getElementById('cover-image');
    const gameTitle     = document.getElementById('game-title');
    const menuContainer = document.getElementById('main-menu-buttons');
    const playBtn       = document.getElementById('play-btn');
    const goToGameBtn   = document.getElementById('go-to-game-btn');

    // ── Resultados ──
    const resultsTitle   = document.getElementById('results-title');
    const scoreVal       = document.getElementById('score-val');
    const resultsDesc    = document.getElementById('results-desc');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');
    const claimPrizeBtn  = document.getElementById('claim-prize-btn');

    // ── Enigma ──
    const enigmaInput  = document.getElementById('enigma-answer');
    const submitEnigma = document.getElementById('submit-enigma');
    const enigmaError  = document.getElementById('enigma-error');
    const enigmaHint   = document.getElementById('enigma-hint');

    // ── Modais (sobre / configurações) ──
    document.getElementById('about-btn').addEventListener('click',  () => document.getElementById('about-modal').classList.remove('hidden'));
    document.getElementById('config-btn').addEventListener('click', () => document.getElementById('config-modal').classList.remove('hidden'));
    document.getElementById('close-about').addEventListener('click',  () => document.getElementById('about-modal').classList.add('hidden'));
    document.getElementById('close-config').addEventListener('click', () => document.getElementById('config-modal').classList.add('hidden'));

    // ── Controle de volume ──
    const volumeSlider = document.getElementById('volume-slider');
    const muteBtn      = document.getElementById('mute-btn');
    let isMuted = false, preMuteVolume = 1, masterVolume = 1;

    const todosAudios = () => [bgAudio, enigmaAudio, coinAudio, successAudio, playAudio,
        theme1Audio, theme2Audio, theme3Audio, contagemAudio, selectAudio, derrotaAudio, victoryAudio];

    function setVolume(vol) {
        masterVolume = parseFloat(vol);
        todosAudios().forEach(a => { if (a && !a._isFading) a.volume = masterVolume; });
    }

    volumeSlider.addEventListener('input', e => {
        setVolume(e.target.value);
        isMuted = parseFloat(e.target.value) <= 0;
        muteBtn.textContent = isMuted ? 'DESMUTAR' : 'MUTAR SOM';
    });
    muteBtn.addEventListener('click', () => {
        if (!isMuted) {
            preMuteVolume = volumeSlider.value > 0 ? volumeSlider.value : 1;
            volumeSlider.value = 0;
            setVolume(0);
            isMuted = true;
            muteBtn.textContent = 'DESMUTAR';
        } else {
            volumeSlider.value = preMuteVolume;
            setVolume(preMuteVolume);
            isMuted = false;
            muteBtn.textContent = 'MUTAR SOM';
        }
    });

    // ── Playlist com crossfade (tema 1 → 2 → 3 → 1...) ──
    let currentThemeIndex = 0;
    let crossfadeInterval = null;
    let isCrossfading = false;

    function playQuizMusic() {
        stopQuizMusic();
        currentThemeIndex = 0;
        const track = themeTracks[currentThemeIndex];
        if (!track) return;
        track.currentTime = 0;
        track.volume = masterVolume;
        track.play().catch(() => {});
        setupTrackEvents(track);
    }

    function stopQuizMusic() {
        if (crossfadeInterval) clearInterval(crossfadeInterval);
        isCrossfading = false;
        themeTracks.forEach(t => {
            if (!t) return;
            t.pause();
            t.currentTime = 0;
            t.removeEventListener('timeupdate', checkCrossfade);
            t.removeEventListener('ended', onTrackEnded);
            t._isFading = false;
        });
    }

    function setupTrackEvents(track) {
        track.removeEventListener('timeupdate', checkCrossfade);
        track.removeEventListener('ended', onTrackEnded);
        track.addEventListener('timeupdate', checkCrossfade);
        track.addEventListener('ended', onTrackEnded);
    }

    function checkCrossfade(e) {
        const t = e.target;
        if (!isCrossfading && t.duration && (t.duration - t.currentTime <= 2.5)) {
            triggerCrossfade();
        }
    }

    function onTrackEnded() {
        if (!isCrossfading) triggerCrossfade();
    }

    function triggerCrossfade() {
        if (isCrossfading) return;
        isCrossfading = true;

        const oldTrack = themeTracks[currentThemeIndex];
        currentThemeIndex = (currentThemeIndex + 1) % themeTracks.length;
        const newTrack = themeTracks[currentThemeIndex];
        if (!newTrack) return;

        newTrack.currentTime = 0;
        newTrack.volume = 0;
        newTrack.play().catch(() => {});
        setupTrackEvents(newTrack);

        const steps = 2000 / 50;
        let step = 0;
        if (oldTrack) oldTrack._isFading = true;
        newTrack._isFading = true;

        crossfadeInterval = setInterval(() => {
            step++;
            const p = step / steps;
            if (oldTrack) oldTrack.volume = Math.max(0, masterVolume * (1 - p));
            newTrack.volume = Math.min(masterVolume, masterVolume * p);

            if (step >= steps) {
                clearInterval(crossfadeInterval);
                if (oldTrack) { oldTrack.pause(); oldTrack.currentTime = 0; oldTrack._isFading = false; }
                newTrack.volume = masterVolume;
                newTrack._isFading = false;
                isCrossfading = false;
            }
        }, 50);
    }

    // ── Estado do jogo ──
    let wrongAttempts = 0;
    let currentQuestion = 0;
    let score = 0;

    createPixelStars();

    // ── Tela inicial ──
    document.getElementById('start-btn').addEventListener('click', () => {
        coinAudio.play().catch(() => {});
        document.getElementById('start-btn').style.pointerEvents = 'none';
        setTimeout(() => {
            startScreen.classList.add('hidden');
            enigmaScreen.classList.remove('hidden');
            enigmaAudio.play().catch(() => {});
            enigmaInput.focus();
        }, 800);
    });

    // ── Enigma ──
    submitEnigma.addEventListener('click', checkEnigma);
    enigmaInput.addEventListener('keypress', e => { if (e.key === 'Enter') checkEnigma(); });

    function checkEnigma() {
        const val = enigmaInput.value.trim().toLowerCase();
        if (val !== 'dormir') {
            wrongAttempts++;
            enigmaError.classList.remove('hidden');
            enigmaError.style.animation = 'none';
            enigmaError.offsetHeight;
            enigmaError.style.animation = null;

            if (wrongAttempts >= 3 && wrongAttempts < 5) {
                enigmaHint.textContent = 'DICA 1: Envolve um travesseiro, uma cama e uma péssima escolha';
                enigmaHint.classList.remove('hidden');
            } else if (wrongAttempts === 5) {
                enigmaHint.textContent = 'DICA 2: Esse momento aconteceu no Max Fevver!';
            } else if (wrongAttempts >= 6) {
                const ans = 'DORMIR', reveal = wrongAttempts - 5;
                let s = `A palavra tem ${ans.length} letras: `;
                for (let i = 0; i < ans.length; i++) s += i < reveal ? ans[i] + ' ' : '_ ';
                enigmaHint.textContent = 'DICA 3: ' + s;
            }
            enigmaInput.value = '';
            enigmaInput.focus();
            return;
        }

        enigmaError.classList.add('hidden');
        enigmaHint.classList.add('hidden');
        submitEnigma.style.pointerEvents = 'none';
        enigmaInput.disabled = true;

        enigmaAudio.pause();
        successAudio.currentTime = 0;
        successAudio.play().catch(() => {});

        setTimeout(() => {
            victoryScreen.classList.remove('hidden');
            setTimeout(() => {
                victoryModal.classList.add('slide-up');
                setTimeout(() => {
                    const laisW = document.getElementById('lais-walking');
                    const laisJ = document.getElementById('lais-jumping');
                    laisW.classList.remove('hidden');
                    laisW.classList.add('walk-to-stairs');
                    setTimeout(() => {
                        laisW.classList.remove('walk-to-stairs');
                        laisW.classList.add('climb-stairs');
                        setTimeout(() => {
                            laisW.classList.add('hidden');
                            laisJ.classList.remove('hidden');
                            laisJ.classList.add('jump-from-stairs');
                            setTimeout(() => {
                                laisJ.classList.remove('jump-from-stairs');
                                laisJ.classList.add('slide-down-pole');
                                setTimeout(() => {
                                    laisJ.classList.add('hidden');
                                    laisW.classList.remove('climb-stairs');
                                    laisW.classList.remove('hidden');
                                    laisW.classList.add('walk-to-castle');
                                    setTimeout(() => {
                                        triggerCastleFireworks();
                                        goToGameBtn.classList.remove('hidden');
                                        goToGameBtn.classList.add('show');
                                    }, 1500);
                                }, 1000);
                            }, 1500);
                        }, 1500);
                    }, 1500);
                }, 800);
            }, 50);
        }, 300);
    }

    // ── Ir para o menu principal ──
    goToGameBtn.addEventListener('click', () => {
        enigmaScreen.classList.add('hidden');
        victoryScreen.classList.add('hidden');
        bgAudio.play().catch(() => {});
        showAnimationScreen();
    });

    function showAnimationScreen() {
        animationScreen.classList.remove('hidden');
        setTimeout(() => {
            coverImage.classList.add('animate-in');
            setTimeout(() => {
                gameTitle.classList.remove('hidden');
                setTimeout(() => gameTitle.classList.add('show'), 50);
                menuContainer.classList.remove('hidden');
                setTimeout(() => menuContainer.classList.add('show'), 1000);
            }, 2000);
        }, 100);
    }

    // ── Botão PLAY (animação Mario 64) ──
    playBtn.addEventListener('click', () => {
        playBtn.style.pointerEvents = 'none';
        playAudio.play().catch(() => {});
        menuContainer.classList.remove('show');
        gameTitle.classList.remove('show');
        coverImage.classList.add('mario-dive');
        setTimeout(() => {
            animationScreen.classList.add('hidden');
            bgAudio.pause();
            startLoadingScreen();
        }, 1200);
    });

    // ── Tela de loading ──
    function startLoadingScreen() {
        loadingScreen.classList.remove('hidden');

        const andre      = document.getElementById('andre-runner');
        const lais       = document.getElementById('lais-runner');
        const loadBar    = document.getElementById('loading-bar');
        const barPercent = document.getElementById('bar-percent');
        const track      = document.querySelector('.loading-track');
        const DURACAO    = 7000;

        andre.classList.add('sprite-running');
        lais.classList.add('sprite-running');

        let startTime = null, animFrame, catchFeito = false;

        function animar(ts) {
            if (!startTime) startTime = ts;
            const elapsed  = ts - startTime;
            const progress = Math.min(elapsed / DURACAO, 1);
            const pct      = Math.round(progress * 100);

            loadBar.style.width = pct + '%';
            if (barPercent) barPercent.textContent = pct + '%';

            const trackW  = track.offsetWidth;
            const charW   = 100;
            const andrePx = progress * (trackW - charW);
            const laisPx  = Math.min(andrePx + 110, trackW - charW);

            andre.style.left = andrePx + 'px';
            lais.style.left  = laisPx  + 'px';

            // André alcançou Laís
            if ((laisPx - andrePx) < 18 && !catchFeito) {
                catchFeito = true;
                cancelAnimationFrame(animFrame);
                triggerCatchTransition();
                return;
            }
            if (progress < 1) {
                animFrame = requestAnimationFrame(animar);
            } else if (!catchFeito) {
                catchFeito = true;
                triggerCatchTransition();
            }
        }

        animFrame = requestAnimationFrame(animar);
    }

    function triggerCatchTransition() {
        document.getElementById('andre-runner').classList.remove('sprite-running');
        document.getElementById('lais-runner').classList.remove('sprite-running');
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            startCountdown();
        }, 400);
    }

    // ── Contagem regressiva ──
    function startCountdown() {
        countdownScreen.classList.remove('hidden');
        const numEl = document.getElementById('countdown-number');
        contagemAudio.play().catch(() => {});

        const steps = ['3', '2', '1'];
        let step = 0;

        function mostrarProximo() {
            if (step >= steps.length) {
                numEl.classList.add('fade-out');
                setTimeout(() => {
                    countdownScreen.classList.add('hidden');
                    playQuizMusic();
                    startQuiz();
                }, 300);
                return;
            }
            numEl.style.animation = 'none';
            numEl.offsetHeight;
            numEl.classList.remove('fade-out');
            numEl.style.animation = '';
            numEl.textContent = steps[step++];
            setTimeout(() => {
                numEl.classList.add('fade-out');
                setTimeout(mostrarProximo, 280);
            }, 900);
        }

        mostrarProximo();
    }

    // ── Quiz ──
    function startQuiz() {
        quizScreen.classList.remove('hidden');
        currentQuestion = 0;
        score = 0;
        loadQuestion();
    }

    function loadQuestion() {
        const q = QUESTIONS[currentQuestion];
        document.getElementById('q-number').textContent = String(currentQuestion + 1).padStart(2, '0');
        document.getElementById('question-text').textContent = q.question;

        const btns = document.querySelectorAll('.answer-btn');
        btns.forEach((btn, i) => {
            btn.textContent = q.answers[i];
            btn.dataset.label = LABELS[i];
            btn.className = 'answer-btn';
            btn.style.pointerEvents = 'auto';
            btn.onclick = () => handleAnswer(btn, i);
        });

        // Animação de entrada da pergunta
        const qBox = document.querySelector('.question-box');
        qBox.style.opacity = '0';
        qBox.style.transform = 'translateY(20px)';
        qBox.style.transition = 'all 0.35s ease';
        requestAnimationFrame(() => requestAnimationFrame(() => {
            qBox.style.opacity = '1';
            qBox.style.transform = 'translateY(0)';
        }));
    }

    function handleAnswer(btn, idx) {
        selectAudio.currentTime = 0;
        selectAudio.play().catch(() => {});

        const q = QUESTIONS[currentQuestion];
        document.querySelectorAll('.answer-btn').forEach(b => b.style.pointerEvents = 'none');
        btn.classList.add('selected');

        if (idx === q.correct) score++;

        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < QUESTIONS.length) {
                loadQuestion();
            } else {
                showResults();
            }
        }, 1000);
    }

    // ── Tela de resultados ──
    function showResults() {
        quizScreen.classList.add('hidden');
        stopQuizMusic();
        resultsScreen.classList.remove('hidden');
        scoreVal.textContent = score;

        if (score === QUESTIONS.length) {
            resultsTitle.textContent = 'PARABÉNS! 🏆';
            resultsDesc.textContent  = 'INCRÍVEL! VOCÊ PROVOU QUE ME CONHECE E ME AMA DE VERDADE! TODAS AS 13 RESPOSTAS CORRETAS!';
            restartQuizBtn.classList.add('hidden');
            claimPrizeBtn.classList.remove('hidden');
            victoryAudio.currentTime = 0;
            victoryAudio.volume = masterVolume;
            victoryAudio.play().catch(() => {});
        } else {
            resultsTitle.textContent = 'FIM DE JOGO!';
            resultsDesc.textContent  = 'POXA! PARA GANHAR O PRÊMIO FINAL, VOCÊ PRECISA ACERTAR TODAS AS 13 PERGUNTAS!';
            claimPrizeBtn.classList.add('hidden');
            restartQuizBtn.classList.remove('hidden');
            derrotaAudio.currentTime = 0;
            derrotaAudio.volume = masterVolume;
            derrotaAudio.play().catch(() => {});
        }
    }

    restartQuizBtn.addEventListener('click', () => {
        derrotaAudio.pause();
        derrotaAudio.currentTime = 0;
        resultsScreen.classList.add('hidden');
        startQuiz();
        playQuizMusic();
    });

    // ── Resgate do prêmio (animação Mario 64 → tela do prêmio) ──
    claimPrizeBtn.addEventListener('click', () => {
        claimPrizeBtn.style.pointerEvents = 'none';
        victoryAudio.pause();
        victoryAudio.currentTime = 0;
        resultsScreen.classList.add('hidden');

        animationScreen.classList.remove('hidden');
        coverImage.classList.remove('mario-dive', 'animate-in');
        coverImage.offsetHeight;
        coverImage.classList.add('animate-in');

        playAudio.currentTime = 0;
        playAudio.play().catch(() => {});

        setTimeout(() => {
            coverImage.classList.add('mario-dive');
            setTimeout(() => {
                animationScreen.classList.add('hidden');
                showPrizeScreen();
            }, 1200);
        }, 300);
    });

    function showPrizeScreen() {
        bgAudio.pause();
        musicaFinalAudio.currentTime = 0;
        musicaFinalAudio.volume = masterVolume;
        musicaFinalAudio.play().catch(() => {});
        prizeScreen.classList.remove('hidden');
        prizeScreen.scrollTop = 0;
    }

});

// ── Estrelas de pixel (fundo animado) ──
function createPixelStars() {
    const container = document.body;
    const colors = ['#ff0055', '#00ffff', '#ffd700', '#ffffff'];
    for (let i = 0; i < 30; i++) spawnStar(container, colors, true);
    setInterval(() => spawnStar(container, colors, false), 400);
}

function spawnStar(container, colors, isStatic) {
    const star  = document.createElement('div');
    star.classList.add('pixel-star');
    const size  = Math.floor(Math.random() * 3) * 4 + 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    star.style.left  = `${Math.random() * 100}vw`;
    star.style.width = star.style.height = `${size}px`;
    star.style.setProperty('--star-color', color);

    if (isStatic) {
        star.style.top = `${Math.random() * 100}vh`;
        star.style.animation = Math.random() > 0.7
            ? `blink ${Math.random() * 2 + 1}s infinite`
            : 'none';
        if (star.style.animation === 'none') star.style.opacity = Math.random() > 0.5 ? 0.8 : 0.2;
    } else {
        const dur = Math.random() * 5 + 3;
        star.style.animationDuration = `${dur}s`;
        setTimeout(() => star.remove(), dur * 1000);
    }
    container.appendChild(star);
}

// ── Fogos de artifício no castelo (tela de vitória do enigma) ──
function triggerCastleFireworks() {
    const container = document.getElementById('castle-fireworks');
    if (!container) return;
    container.innerHTML = '';

    const colors = ['#ffd700', '#ff4b72', '#00ffff', '#00ff66', '#ffffff'];
    const bursts = [
        { left: '78%', top: '25%' },
        { left: '73%', top: '18%' },
        { left: '83%', top: '22%' }
    ];

    bursts.forEach((burst, idx) => {
        setTimeout(() => {
            for (let i = 0; i < 16; i++) {
                const p = document.createElement('div');
                p.className = 'firework-particle';
                p.style.left = burst.left;
                p.style.top  = burst.top;
                p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                const angle = (i / 16) * Math.PI * 2;
                const dist  = Math.random() * 50 + 30;
                p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
                p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
                container.appendChild(p);
                setTimeout(() => p.remove(), 800);
            }
        }, idx * 300);
    });
}
