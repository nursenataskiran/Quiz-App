const qEl = document.getElementById('question');
const aEl = document.getElementById('answers');
const metaEl = document.getElementById('meta');
const errEl = document.getElementById('error');
const reloadBtn = document.getElementById('reload');
const categoryEl = document.getElementById('category');
const difficultyEl = document.getElementById('difficulty');

let locked = false;
function decode(str) {
  const t = document.createElement('textarea');
  t.innerHTML = str;
  return t.value;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function handleAnswer(btn, isCorrect, correctText) {
  if (locked) return;
  locked = true;

  // Tüm şıkları boya ve kilitle
  Array.from(aEl.children).forEach(b => {
    const ok = b.textContent === correctText;
    b.classList.add(ok ? 'correct' : 'wrong');
    b.disabled = true;
  });
}

async function loadQuestion(){
    locked = false;
    errEl.textContent = '';
    qEl.textContent = 'Soru yükleniyor...'
    aEl.innerHTML='';
    metaEl.textContent='';
    reloadBtn.disabled = true;
    try{
        const params = new URLSearchParams({ amount: '1', type: 'multiple' });
        //.trim() metoduyla stringin başında veya sonunda herhangi bir boşluk varsa onu temizliyoruz.
        const cat = categoryEl.value.trim();
        const diff = difficultyEl.value.trim();
        if (cat) params.append('category', cat);
        if (diff) params.append('difficulty', diff);
        const url = `https://opentdb.com/api.php?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok){
            throw new Error("Ağ hatası" + res.status);
        }
        console.log('FETCH URL =>', url);
        const data = await res.json();
        console.log('response_code:', data.response_code, 'results:', data.results?.length);
        //eğer data.result değeri varsa length değerini al,yoksa undefined döner
        if(!data.results?.length){
            throw new Error("Bu filtrelerle alakalı soru bulunamadı.");
        }
        const raw = data.results[0];
        const question = decode(raw.question);
        const correct = decode(raw.correct_answer);
        const answers = shuffle([...raw.incorrect_answers.map(decode),correct]);

        metaEl.textContent = `${raw.category} • ${raw.difficulty}`;
        qEl.textContent = question;

        answers.forEach(txt => {
            const btn = document.createElement('button');
            btn.className = 'answer';
            btn.textContent = txt;
            btn.onclick = () => handleAnswer(btn, txt === correct, correct);
            aEl.appendChild(btn); 
        });
        } catch(error){
            errEl.textContent = error.message || 'Beklenmeyen bir hata oluştu';
            qEl.textContent = '-'
        } finally {
            reloadBtn.disabled = false;
        }

    }

reloadBtn.addEventListener('click', loadQuestion);