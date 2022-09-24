// @ts-check

const adj = [
  '멋진',
  '잘생긴',
  '예쁜',
  '졸린',
  '우아한',
  '힙한',
  '배고픈',
  '집에 가기 싫은',
  '집에 가고 싶은',
  '귀여운',
  '중후한',
  '똑똑한',
  '이게 뭔가 싶은',
  '까리한',
  '프론트가 하고 싶은',
  '백엔드가 재미 있는',
  '몽고 디비 날려 먹은',
  '열심히하는',
  '피곤한',
  '눈빛이 초롱초롱한',
  '치킨이 땡기는',
  '술이 땡기는',
];

const member = [
  'A님',
  'B님',
  'C님',
  'D님',
  'E님',
  'F님',
  'G님',
  'H님',
  'I님',
  'J님',
  'K님',
  'L님',
  'N님',
  'M님',
  'O님',
  'P님',
  'Q님',
  'R님',
  'S님',
  'T님',
];

const bootColor = [
  { bg: 'bg-primary', text: 'text-white' },
  { bg: 'bg-success', text: 'text-white' },
  { bg: 'bg-warning', text: 'text-black' },
  { bg: 'bg-info', text: 'text-white' },
  { bg: 'alert-primary', text: 'text-black' },
  { bg: 'alert-secondary', text: 'text-black' },
  { bg: 'alert-success', text: 'text-black' },
  { bg: 'alert-danger', text: 'text-black' },
  { bg: 'alert-warning', text: 'text-black' },
  { bg: 'alert-info', text: 'text-black' },
];

(function () {
  const socket = new WebSocket(`ws://${window.location.host}/chat`);
  const btn = document.getElementById('btn');
  const inputEl = document.querySelector('#input');
  const chatEl = document.getElementById('chat');

  function pickRandomArr(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  const nickName = `${pickRandomArr(adj)} ${pickRandomArr(member)}`;
  const thema = pickRandomArr(bootColor);
  btn?.addEventListener('click', () => {
    const msg = inputEl?.value;
    const data = {
      name: nickName,
      msg: msg,
      bg: thema.bg,
      text: thema.text,
    };
    socket.send(JSON.stringify(data));
    inputEl.value = '';
  });

  inputEl?.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
      btn?.click();
    }
  });

  // const intervalCall = require('interval-call');

  // const interval1s = intervalCall(1000);

  // inputEl?.addEventListener('keyup', (event) => {
  //   if (event.keyCode === 13) {
  //     intervalCall1000(() => {
  //       btn?.click();
  //     });
  //   }
  // });

  socket.addEventListener('open', () => {
    // socket.send('저는 클라이언트입니다. ');
  });

  const chats = []; // 데이터를 담기 위한 빈 배열 선언

  //< 함수화 시키기
  function drawChats(type, data) {
    if (type === 'sync') {
      chatEl.innerHTML = '';

      // 아무것도 없는 상태에서 시작할게
      chats.forEach(({ name, msg, bg, text }) => {
        // 배열에 하나씩 접근하기(배열의 길이만큼 반복될 것.), 구조분해 할당
        const msgEl = document.createElement('p');
        msgEl.innerText = `${name} : ${msg}`;

        msgEl.classList.add('p-2');
        msgEl.classList.add(bg);
        msgEl.classList.add(text);
        msgEl.classList.add('fw-bold');

        chatEl?.appendChild(msgEl);
        chatEl.scrollTop = chatEl.scrollHeight - chatEl.clientHeight;
      });
    } else if (type === 'chat') {
      const msgEl = document.createElement('p');
      msgEl.innerText = `${data.name} : ${data.msg}`;

      msgEl.classList.add('p-2');
      msgEl.classList.add(data.bg);
      msgEl.classList.add(data.text);
      msgEl.classList.add('fw-bold');

      chatEl?.appendChild(msgEl);
      chatEl.scrollTop = chatEl.scrollHeight - chatEl.clientHeight;
    }
  }

  socket.addEventListener('message', (event) => {
    // const { name, msg, bg, text } = JSON.parse(event.data);
    // console.log(name, msg);

    const msgData = JSON.parse(event.data);
    const { type, data } = msgData;

    if (type === 'sync') {
      const oldChats = data.chatsData;
      // chats.push(oldChats); => 너무 큰 한 덩어리가 오게됨
      chats.push(...oldChats);
      drawChats(type, data);
    } else if (type === 'chat') {
      chats.push(data);
      drawChats(type, data);
    }

    // const msgEl = document.createElement('p');
    // msgEl.innerText = `${name} : ${msg}`;

    // msgEl.classList.add('p-2');
    // msgEl.classList.add(bg);
    // msgEl.classList.add(text);
    // msgEl.classList.add('fw-bold');

    // chatEl?.appendChild(msgEl);
    // chatEl.scrollTop = chatEl.scrollHeight - chatEl.clientHeight;
  });
})();
