let text, pattern;
let lps;
let i = 0, j = 0;
let currentStep = 0;
let lpsSteps = [];
let currentLpsStep = 0;
let matchFound = false;

function createPatternChar(char, index, isActive = false, isPrefix = false, isSuffix = false) {
    const div = document.createElement('div');
    div.className = 'pattern-char';
    div.textContent = char;
    if (isActive) div.classList.add('active');
    if (isPrefix) div.classList.add('prefix');
    if (isSuffix) div.classList.add('suffix');
    return div;
}

function displayPatternGrowth(step) {
    const slider = document.getElementById('patternSlider');
    slider.innerHTML = '';
    
    // 접두사 행 추가
    const prefixRow = document.createElement('div');
    prefixRow.className = 'pattern-row prefix-row';
    
    // 패턴 행 추가
    const patternRow = document.createElement('div');
    patternRow.className = 'pattern-row pattern-main';
    
    // 접미사 행 추가
    const suffixRow = document.createElement('div');
    suffixRow.className = 'pattern-row suffix-row';
    
    for (let k = 0; k <= step.i; k++) {
        const isPrefix = k < step.len;
        const isSuffix = k > step.i - step.len && k <= step.i;
        
        // 접두사 문자 생성
        const prefixChar = document.createElement('div');
        prefixChar.className = 'pattern-char';
        if (isPrefix) {
            prefixChar.textContent = pattern[k];
            prefixChar.classList.add('prefix');
        }
        
        // 메인 패턴 문자 생성
        const patternChar = document.createElement('div');
        patternChar.className = 'pattern-char';
        patternChar.textContent = pattern[k];
        if (k === step.i) patternChar.classList.add('active');
        
        // 접미사 문자 생성
        const suffixChar = document.createElement('div');
        suffixChar.className = 'pattern-char';
        if (isSuffix) {
            suffixChar.textContent = pattern[k];
            suffixChar.classList.add('suffix');
        }
        
        prefixRow.appendChild(prefixChar);
        patternRow.appendChild(patternChar);
        suffixRow.appendChild(suffixChar);
    }
    
    const container = document.createElement('div');
    container.className = 'pattern-rows-container';
    container.appendChild(prefixRow);
    container.appendChild(patternRow);
    container.appendChild(suffixRow);
    
    slider.appendChild(container);
}

function displayLPSTable(step) {
    displayPatternGrowth(step);

    const patternRow = document.getElementById('patternRow');
    const indexRow = document.getElementById('indexRow');
    const lpsRow = document.getElementById('lpsRow');

    while (patternRow.cells.length > 1) {
        patternRow.deleteCell(1);
        indexRow.deleteCell(1);
        lpsRow.deleteCell(1);
    }

    for (let k = 0; k < pattern.length; k++) {
        const patternCell = patternRow.insertCell();
        const indexCell = indexRow.insertCell();
        const lpsCell = lpsRow.insertCell();

        patternCell.textContent = k;
        indexCell.textContent = pattern[k];
        lpsCell.textContent = k <= step.i ? step.lps[k] : '';

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

    i = 0;
    j = 0;
    currentStep = 0;
    currentLpsStep = 0;
    matchFound = false;

    document.getElementById('startBtn').disabled = true;
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;

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

    for (let k = 0; k < text.length; k++) {
        const charDiv = document.createElement('div');
        charDiv.className = 'char';
        charDiv.textContent = text[k];
        if (k === i) charDiv.classList.add('highlight');
        if (k < i && k >= i - j) charDiv.classList.add('match');
        textDisplay.appendChild(charDiv);
    }

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
}

function reset() {
    i = 0;
    j = 0;
    currentStep = 0;
    currentLpsStep = 0;
    matchFound = false;

    document.getElementById('startBtn').disabled = false;
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('resetBtn').disabled = true;

    document.getElementById('info').textContent = '';
    document.getElementById('stepInfo').textContent = '';
    document.getElementById('lpsInfo').textContent = '';
    document.getElementById('textDisplay').innerHTML = '';
    document.getElementById('patternDisplay').innerHTML = '';
    document.getElementById('prefixSuffixDisplay').innerHTML = '';

    const patternRow = document.getElementById('patternRow');
    const indexRow = document.getElementById('indexRow');
    const lpsRow = document.getElementById('lpsRow');
    
    while (patternRow.cells.length > 1) {
        patternRow.deleteCell(1);
        indexRow.deleteCell(1);
        lpsRow.deleteCell(1);
    }
}
