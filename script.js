let text, pattern;
let lps;
let i = 0, j = 0;
let currentStep = 0;
let lpsSteps = [];
let currentLpsStep = 0;
let matchFound = false;

function displayLPSTable(step) {
    const patternRow = document.getElementById('patternRow');
    const indexRow = document.getElementById('indexRow');
    const lpsRow = document.getElementById('lpsRow');

    // 테이블 초기화
    while (patternRow.cells.length > 1) {
        patternRow.deleteCell(1);
        indexRow.deleteCell(1);
        lpsRow.deleteCell(1);
    }

    // LPS 테이블 생성
    for (let k = 0; k < pattern.length; k++) {
        const patternCell = patternRow.insertCell();
        const indexCell = indexRow.insertCell();
        const lpsCell = lpsRow.insertCell();

        patternCell.textContent = k;
        indexCell.textContent = pattern[k];
        lpsCell.textContent = step.lps[k];

        if (k === step.i) {
            patternCell.classList.add('lps-highlight');
            indexCell.classList.add('lps-highlight');
            lpsCell.classList.add('lps-highlight');
        }
    }
    document.getElementById('lpsInfo').textContent = step.info;
}

function computeLPSArrayWithSteps(pattern) {
    const lps = new Array(pattern.length).fill(0);
    let len = 0;
    let i = 1;
    lpsSteps = [];
    lpsSteps.push({ 
        i: 0, 
        len: len, 
        lps: [...lps], 
        info: "LPS 배열 초기화: 첫 번째 위치는 항상 0" 
    });

    while (i < pattern.length) {
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            lpsSteps.push({ 
                i: i, 
                len: len, 
                lps: [...lps], 
                info: `패턴[${i}] '${pattern[i]}' = 패턴[${len-1}] '${pattern[len-1]}' → LPS[${i}] = ${len}` 
            });
            i++;
        } else {
            if (len !== 0) {
                let prevLen = len;
                len = lps[len - 1];
                lpsSteps.push({ 
                    i: i, 
                    len: len, 
                    lps: [...lps], 
                    info: `불일치: len값을 LPS[${prevLen-1}] = ${len}로 변경` 
                });
            } else {
                lps[i] = 0;
                lpsSteps.push({ 
                    i: i, 
                    len: len, 
                    lps: [...lps], 
                    info: `불일치: len=0 → LPS[${i}] = 0` 
                });
                i++;
            }
        }
    }
    return lps;
}

function startKMP() {
    text = document.getElementById('text').value;
    pattern = document.getElementById('pattern').value;
    
    if (!text || !pattern) {
        alert('텍스트와 패턴을 모두 입력해주세요.');
        return;
    }

    // 초기화
    i = 0;
    j = 0;
    currentStep = 0;
    currentLpsStep = 0;
    matchFound = false;

    // 버튼 상태 변경
    document.getElementById('startBtn').disabled = true;
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;

    // LPS 배열 계산 및 표시
    lps = computeLPSArrayWithSteps(pattern);
    displayLPSTable(lpsSteps[0]);
    displayState();
    
    document.getElementById('info').textContent = 'LPS 배열을 계산중입니다. [다음 단계] 버튼을 눌러주세요.';
    document.getElementById('stepInfo').textContent = '';
}

function displayState() {
    const textDisplay = document.getElementById('textDisplay');
    const patternDisplay = document.getElementById('patternDisplay');
    
    textDisplay.innerHTML = '';
    patternDisplay.innerHTML = '';

    // 텍스트 표시
    for (let k = 0; k < text.length; k++) {
        const charDiv = document.createElement('div');
        charDiv.className = 'char';
        charDiv.textContent = text[k];
        if (k === i) charDiv.classList.add('highlight');
        if (k < i && k >= i - j) charDiv.classList.add('match');
        textDisplay.appendChild(charDiv);
    }

    // 패턴 표시
    for (let k = 0; k < i - j; k++) {
        const spaceDiv = document.createElement('div');
        spaceDiv.className = 'char';
        spaceDiv.style.visibility = 'hidden';
        patternDisplay.appendChild(spaceDiv);
    }
    
    for (let k = 0; k < pattern.length; k++) {
        const charDiv = document.createElement('div');
        charDiv.className = 'char';
        charDiv.textContent = pattern[k];
        if (k === j) charDiv.classList.add('highlight');
        patternDisplay.appendChild(charDiv);
    }
}

function nextStep() {
    if (currentLpsStep < lpsSteps.length - 1) {
        // LPS 배열 계산 단계 표시
        currentLpsStep++;
        displayLPSTable(lpsSteps[currentLpsStep]);
        return;
    }

    if (i >= text.length) {
        document.getElementById('nextBtn').disabled = true;
        if (!matchFound) {
            document.getElementById('info').textContent = '패턴을 찾지 못했습니다.';
        }
        return;
    }

    if (text[i] === pattern[j]) {
        document.getElementById('stepInfo').textContent = 
            `일치: 텍스트[${i}] '${text[i]}' = 패턴[${j}] '${pattern[j]}'`;
        i++;
        j++;

        if (j === pattern.length) {
            matchFound = true;
            document.getElementById('info').textContent = 
                `패턴을 찾았습니다! 위치: ${i - j}`;

        }
    } else {
        document.getElementById('stepInfo').textContent = 
            `불일치: 텍스트[${i}] '${text[i]}' ≠ 패턴[${j}] '${pattern[j]}'`;
        if (j !== 0) {
            j = lps[j - 1];
        } else {
            i++;
        }
    }

    displayState();

    // 텍스트의 끝에 도달했을 때 처리
    if (i >= text.length) {
        document.getElementById('nextBtn').disabled = true;
        if (!matchFound) {
            document.getElementById('info').textContent = '패턴을 찾지 못했습니다.';
        }
    }
}

function reset() {
    // 변수 초기화
    i = 0;
    j = 0;
    currentStep = 0;
    currentLpsStep = 0;
    matchFound = false;
    
    // 버튼 상태 초기화
    document.getElementById('startBtn').disabled = false;
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('resetBtn').disabled = true;
    
    // 화면 초기화
    document.getElementById('info').textContent = '';
    document.getElementById('stepInfo').textContent = '';
    document.getElementById('lpsInfo').textContent = '';
    document.getElementById('textDisplay').innerHTML = '';
    document.getElementById('patternDisplay').innerHTML = '';
    
    // LPS 테이블 초기화
    const patternRow = document.getElementById('patternRow');
    const indexRow = document.getElementById('indexRow');
    const lpsRow = document.getElementById('lpsRow');
    
    while (patternRow.cells.length > 1) {
        patternRow.deleteCell(1);
        indexRow.deleteCell(1);
        lpsRow.deleteCell(1);
    }
}