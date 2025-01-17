import { Engine, Render, Runner, World, Bodies, Body, Events, Composite } from "matter-js";
import { PLANETS } from "./planets";


// 기본 환경 구성
const engine = Engine.create();  // 물리 엔진 정의
const world = engine.world;  // 환경 조성

let gamescore = 0; //게임스코어
let timer = 180; // 초기 제한시간
let practimer = 30; // 연습모드 제한시간

// 일정 기준 점수 넘었을 때의 시간 추가를 위한 변수
let fust = false;
let sacund = false;
let serd = false;

engine.gravity.scale = 0;  // 중력의 크기

// 게임 화면 그리기
const render = Render.create({
  element: document.body,  // 어디에 그릴 것인지
  engine: engine,  // 게임 엔진
  // 게임의 화면 크기
  options: {  
    width: 1980,  
    height: 1080,
    wireframes: false,
    background: './space.png',
  }
});

Render.run(render);  // 렌더 실행
Runner.run(engine);  // 엔진 실행

// 점수 표시 요소 생성 및 스타일 설정
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '900px';
scoreElement.style.left = '40px';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '50px';
scoreElement.style.fontWeight = 'bold';
document.body.appendChild(scoreElement);

// 타이머 표시 요소 생성 및 스타일 설정
const timerElement = document.createElement('div');
timerElement.style.position = 'absolute';
timerElement.style.top = '30px';
timerElement.style.left = '1700px';
timerElement.style.color = 'white';
timerElement.style.fontSize = '50px';
timerElement.style.fontWeight = 'bold';
document.body.appendChild(timerElement);

// 시작 이미지 생성 및 스타일 설정
const startImage = new Image();
startImage.src = 'start_image.png';
startImage.style.position = 'absolute';
startImage.style.top = '200px'
startImage.style.left = '750px';
startImage.style.width = '400px';
startImage.style.height = 'auto';
startImage.style.cursor = 'pointer';
document.body.appendChild(startImage);

// 연습 모드 이미지 생성 및 스타일 설정
const pracImage = new Image(); 
pracImage.src = 'prac_image.png'; 
pracImage.style.position = 'absolute';
pracImage.style.top = '500px'; 
pracImage.style.left = '750px'; 
pracImage.style.width = '400px'; 
pracImage.style.height = 'auto'; 
pracImage.style.cursor = 'pointer';
document.body.appendChild(pracImage);

// 게임 오버 이미지 생성 및 초기 숨김 처리
const gameOverImage = new Image();
gameOverImage.src = 'game_over.png';
gameOverImage.style.position = 'absolute';
gameOverImage.style.top = '450px';
gameOverImage.style.left = '850px';
gameOverImage.style.width = '200px';
gameOverImage.style.height = 'auto';
gameOverImage.style.display = 'none'; 
document.body.appendChild(gameOverImage); 

// 오디오 엘리먼트 생성
const buttonSound = new Audio('start_button.mp3');
const bgm = new Audio('background_music.mp3'); // 배경 음악 추가
bgm.loop = true; // 배경 음악을 반복 재생
bgm.volume = 0.3;

startImage.style.transition = 'transform 0.3s'; // 변환에 대한 전환 효과 설정
pracImage.style.transition = 'transform 0.3s'; // 변환에 대한 전환 효과 설정

// 시작 이미지 클릭 이벤트
startImage.addEventListener('click', () => {
  startImage.style.display = 'none';  // 시작 이미지 숨김
  pracImage.style.display = 'none';   // 시작 이미지 숨김
  startGame();                        // 게임 시작 함수 호출
  buttonSound.play();
  bgm.play();
});

// 마우스가 이미지 위에 있을 때 크기 조정
startImage.addEventListener('mouseenter', () => {
  startImage.style.transform = 'scale(1.2)'; // 1.2배 확대
});

// 마우스가 이미지를 벗어날 때 원래 크기로 복원
startImage.addEventListener('mouseleave', () => {
  startImage.style.transform = 'scale(1)'; // 원래 크기로 복원
});

// 연습 모드 이미지 클릭 이벤트
pracImage.addEventListener('click', () => {
  pracImage.style.display = 'none';   // 시작 이미지 숨김
  startImage.style.display = 'none';  // 시작 이미지 숨김
  pracGame();                         // 게임 시작 함수 호출
  buttonSound.play();
  bgm.play();
});

// 마우스가 이미지 위에 있을 때 크기 조정
pracImage.addEventListener('mouseenter', () => {
  pracImage.style.transform = 'scale(1.2)'; // 1.2배 확대
});

// 마우스가 이미지를 벗어날 때 원래 크기로 복원
pracImage.addEventListener('mouseleave', () => {
  pracImage.style.transform = 'scale(1)'; // 원래 크기로 복원
});

// 중력의 중심 역할을 하는 원형 몸체
const circle = Bodies.circle(600, 540, 150, {
  isStatic: true,
  isSensor: true,
  render: {
    fillStyle: 'rgba(255, 255, 255, 0.2)', // 투명도 조절
    strokeStyle: 'transparent', // 테두리 색상
  }
});

// 두 번째 원형 몸체 생성
const circle2 = Bodies.circle(1350, 540, 380, {
  isStatic: true,
  isSensor: true,
  render: {
    fillStyle: 'rgba(255, 255, 255, 0.2)', // 투명도 조절
    strokeStyle: 'transparent', // 테두리 색상
  }
});

// 더블클릭 이벤트를 무시하는 함수
function disableDoubleClick(event) {
  event.preventDefault();
}

const startGame = () => {
  // 중력이 모이는 가운에 원 만들기
  const centerGravity = Bodies.circle(1350, 540, 40, {  // x좌표 : 700, y좌표 : 300, radius(반지름) : 30
    isStatic: true,  // 움직이지 않도록 고정
    // isSensor: true, // 충돌 감지만 가능하도록 설정
    render: {  // 그리기
      fillStyle: 'transparent',  // 투명 스타일로 지정
      strokeStyle: 'white',  // 선 색상
      lineWidth: 3,  // 선 두께
    }
  });

  // 로켓 이미지 생성
  const ex1 = new Image();
  ex1.src = 'rocket.png';
  ex1.alt = 'Rocket 1';
  ex1.style.position = 'absolute';
  ex1.style.top = '50px';
  ex1.style.left = '75px';
  ex1.style.width = '50px';
  ex1.style.height = 'auto';
  ex1.style.cursor = 'pointer'; // 클릭 가능한 커서 스타일 설정
  ex1.addEventListener('click', () => {
      createRocket(); // 클릭 이벤트에서 createRocket() 함수 호출
      ex1.style.display = 'none'; // 클릭한 이미지 숨기기
  });

  const ex2 = new Image();
  ex2.src = 'rocket.png';
  ex2.alt = 'Rocket 2';
  ex2.style.position = 'absolute';
  ex2.style.top = '50px';
  ex2.style.left = '150px';
  ex2.style.width = '50px';
  ex2.style.height = 'auto';
  ex2.style.cursor = 'pointer';
  ex2.addEventListener('click', () => {
      createRocket(); // 클릭 이벤트에서 createRocket() 함수 호출
      ex2.style.display = 'none'; // 클릭한 이미지 숨기기
  });

  const ex3 = new Image();
  ex3.src = 'rocket.png';
  ex3.alt = 'Rocket 3';
  ex3.style.position = 'absolute';
  ex3.style.top = '50px';
  ex3.style.left = '225px';
  ex3.style.width = '50px';
  ex3.style.height = 'auto';
  ex3.style.cursor = 'pointer';
  ex3.addEventListener('click', () => {
      createRocket(); // 클릭 이벤트에서 createRocket() 함수 호출
      ex3.style.display = 'none'; // 클릭한 이미지 숨기기
  });

  // 생성된 이미지를 문서에 추가
  document.body.appendChild(ex1);
  document.body.appendChild(ex2);
  document.body.appendChild(ex3);

  // 점수 및 타이머 초기화
  scoreElement.textContent = `Score: ${gamescore}`;
  timerElement.textContent = `Timer: ${timer}`;
  World.add(world, [centerGravity,ex1,ex2,ex3, circle, circle2]); //[centerGravity, 계속 추가 가능]
  const gameOverSound = new Audio('game_over.mp3'); // 합쳐질 때 재생될 효과음 파일 경로
  gameOverSound.volume = 1;

  //타이머
  const countdown = setInterval(() => {
    // 타이머가 0이 되면 타이머 종료
    if (timer === 0) {
      gameOverSound.play(); // 효과음 재생
      clearInterval(countdown);
      bgm.pause();
      bgm.currentTime = 0;
      console.log('score : ', gamescore);
      alert(`게임 오버!!\n 총 스코어 : ${gamescore}`);
    }
    
    timer--;  // 타이머 시간 감소
    timerElement.textContent = `Timer: ${timer}`;  // 화면에 타이머 표시
  }, 1000);

  // 행성 생성하기
  let shootingPlanet;  // 플레이어가 쏠 행성
  let isDragging = false;  // 행성 드래그
  let isShooting = false;  // 행성 쏘기

  const createPlanet = () => {
    let index = Math.floor(Math.random() * 5); // 행성 인덱스
    let planet = PLANETS[index];

    shootingPlanet = Bodies.circle(600, 540, planet.radius, {
      index: index,
      isStatic: true,  // 행성 고정
      render: {
        sprite: { texture: `./${planet.name}.png` }  // 행성 이미지 경로
      }
    });
    World.add(world, shootingPlanet);
  };

  const createRocket = () => {
    // shootingPlanet 객체가 600, 540 위치에 있는지 확인하는 함수
    function isAtPosition(shootingPlanet, x, y) {
      return shootingPlanet.position.x === x && shootingPlanet.position.y === y;
    }
    
    if (shootingPlanet && isAtPosition(shootingPlanet, 600, 540)) {
      World.remove(world, shootingPlanet);
    }

    let index = 1;  // 0~1까지 랜덤으로 행성 생성
    let planet = PLANETS[index];  // index에는 0~1까지 들어감

    shootingPlanet = Bodies.circle(600, 540, planet.radius, {
      index: index,
      angle: Math.PI / 2,
      isStatic: true,  // 행성 고정
      render: {
        sprite: { texture: `./rocket.png` }  // 행성 이미지 경로
      }
    });
    World.add(world, shootingPlanet);
  };

  // 더블클릭 이벤트 방지
  window.addEventListener('dblclick', disableDoubleClick);

  // 행성 간의 거리 측정
  window.addEventListener('mousedown', (event) => {
    // 마우스 좌표
    const mousePosition = {
      x: event.clientX,
      y: event.clientY
    };

    // 행성의 중심과 마우스 좌표의 거리 계산 -> 유클리드 거리
    const distanceToPlanet = Math.sqrt(
      (mousePosition.x - shootingPlanet.position.x) ** 2 +
      (mousePosition.y - shootingPlanet.position.y) ** 2
    );

    // 행성의 중심과 마우스 좌표의 거리가 쏘는 행성의 반지름보다 작으면
    // isDragging = true가 되어 행성을 드래그 할 수 있다.
    if (distanceToPlanet < shootingPlanet.circleRadius) {
      isDragging = true;
      // console.log('click') -> 디버깅 용
    }
  });

  // isDragging = true 일 경우만 행성이 마우스 포인트를 따라간다.
  window.addEventListener('mousemove', (event) => {
    if (isDragging) {
        // 마우스의 새로운 위치
        const newPosition = { x: event.clientX, y: event.clientY };

        // 원의 중심 좌표
        const circleCenterX = circle.position.x;
        const circleCenterY = circle.position.y;

        // 원의 반지름
        const circleRadius = 150;

        // 왼쪽 반원 내에서만 움직이도록 제한
        if (newPosition.x <= circleCenterX) {
            // 마우스와 원의 중심 사이의 거리 계산
            const distanceToCircleCenter = Math.sqrt(
                (newPosition.x - circleCenterX) ** 2 +
                (newPosition.y - circleCenterY) ** 2
            );

            // 행성의 위치를 새로운 위치로 업데이트
            if (distanceToCircleCenter <= circleRadius) {
                Body.setPosition(shootingPlanet, newPosition);
            } else {
                // 행성의 위치를 원의 경계에 맞게 조정하여 원 안에 머무르도록 함
                const angle = Math.atan2(newPosition.y - circleCenterY, newPosition.x - circleCenterX);
                const x = circleCenterX + circleRadius * Math.cos(angle);
                const y = circleCenterY + circleRadius * Math.sin(angle);
                Body.setPosition(shootingPlanet, { x, y });
            }
        } else {
            // 마우스가 원의 중심보다 오른쪽에 있는 경우
            // x 좌표는 원의 중심 x 좌표로 고정
            // y 좌표는 원의 중심 기준으로 최대 150 이동
            const clampedY = Math.min(Math.max(newPosition.y, circleCenterY - circleRadius), circleCenterY + circleRadius);
            Body.setPosition(shootingPlanet, { x: circleCenterX, y: clampedY });
        }
    }
  });

  // 행성마다 힘의 크기
  const forceMultiplier = [0.00075, 0.0013, 0.0027, 0.004, 0.0077];
  // 오디오 엘리먼트 생성
  const shootingSound = new Audio('shooting_sound.mp3');

  // 마우스를 떼면 isDragging = false로 한다.
  window.addEventListener('mouseup', (event) => {
    if (isDragging) {
      // 마우스 커서를 숨기고 지정된 위치로 이동한 것처럼 보이게 함
      document.body.style.cursor = 'none';
      const fakeCursor = document.createElement('div');
      fakeCursor.style.position = 'absolute';
      fakeCursor.style.width = '10px';
      fakeCursor.style.height = '10px';
      fakeCursor.style.backgroundColor = 'rgnb(0,0,0,0)';
      fakeCursor.style.borderRadius = '50%';
      fakeCursor.style.pointerEvents = 'none';
      fakeCursor.style.left = '600px';
      fakeCursor.style.top = '540px';
      document.body.appendChild(fakeCursor);

      isShooting = true;
  
      setTimeout(() => {
        document.body.style.cursor = 'default';
        document.body.removeChild(fakeCursor);
      }, 1250);
    } else {
      return;
    }


    // 원의 중심 좌표
    const circleCenterX = circle.position.x;
    const circleCenterY = circle.position.y;

    // 행성의 현재 위치
    const shootingPlanetX = shootingPlanet.position.x;
    const shootingPlanetY = shootingPlanet.position.y;

    // 행성과 원 중심 사이의 거리 계산
    const distanceX = shootingPlanetX - circleCenterX;
    const distanceY = shootingPlanetY - circleCenterY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if(distance==0){
      
      isDragging = false;
      isShooting = false;
      return
    }
    // 효과음 재생
    shootingSound.play();
    shootingSound.currentTime = 0;

    // 행성을 발사할 위치 (원의 중심 방향)
    const shootingPosition = {
      x: shootingPlanetX - (distanceX / distance) * shootingPlanet.circleRadius,
      y: shootingPlanetY - (distanceY / distance) * shootingPlanet.circleRadius
    };

    // 행성의 고정 해제
    Body.setStatic(shootingPlanet, false);

    // 행성을 원의 중심 방향으로 발사하기 위한 힘의 방향 계산
    const forceDirection = {
      x: circleCenterX - shootingPosition.x,
      y: circleCenterY - shootingPosition.y
    };

    // 힘을 작용시키는 applyForce 함수
    // 행성의 인덱스에 따라 다른 힘의 크기를 적용합니다.
    const index = shootingPlanet.index;
    const forceMultiplierForPlanet = forceMultiplier[index];
    Body.applyForce(shootingPlanet, shootingPosition, {
      x: forceDirection.x * forceMultiplierForPlanet,  
      y: forceDirection.y * forceMultiplierForPlanet  
    });

    isDragging = false;
    isShooting = false;

    setTimeout(() => {
      createPlanet();
    }, 1250);  // 몇 초 뒤에 행성이 다시 생성되는지 시간 설정
  });

  // 만유인력의 법칙
  Events.on(engine, 'beforeUpdate', (event) => {
    const bodies = Composite.allBodies(world);

    bodies.forEach(body => {
      const dx = centerGravity.position.x - body.position.x;
      const dy = centerGravity.position.y - body.position.y;

      const distanceSquared = dx * dx + dy * dy;
      const forceMagnitude = 0.3 * body.mass / distanceSquared;

      // 만유인력에 작용하는 힘의 크기를 증가시킵니다.
      const increasedForceMagnitude = forceMagnitude * 2; // 기존 힘의 크기에 2를 곱하여 증가시킵니다.

      Body.applyForce(body, body.position, { x: increasedForceMagnitude * dx, y: increasedForceMagnitude * dy });
    });
  });

  Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((collision) => {
      const textureA = collision.bodyA.render.sprite.texture;  // bodyA의 텍스처
      const textureB = collision.bodyB.render.sprite.texture;  // bodyB의 텍스처
      const timeSound = new Audio('time.mp3'); // 합쳐질 때 재생될 효과음 파일 경로

      // rocket.png와의 충돌을 확인하는 조건
      const isRocketCollision = (
        (textureA === './rocket.png' && collision.bodyB !== centerGravity && collision.bodyB !== ex1 && collision.bodyB !== ex2 && collision.bodyB !== ex3 && collision.bodyB !== circle && collision.bodyB !== circle2) ||
        (textureB === './rocket.png' && collision.bodyA !== centerGravity && collision.bodyA !== ex1 && collision.bodyA !== ex2 && collision.bodyA !== ex3 && collision.bodyA !== circle && collision.bodyA !== circle2)
      );
  
      // rocket.png와 충돌한 경우 점수를 추가하는 로직
      if (isRocketCollision) {
        const index = textureA === './rocket.png' ? collision.bodyB.index : collision.bodyA.index;
        switch (index) {
          case 0:
            gamescore += 1; // rocket과 충돌 시 다른 점수
            break;
          case 1:
            gamescore += 2;
            break;
          case 2:
            gamescore += 4;
            break;
          case 3:
            gamescore += 8;
            break;
          case 4:
            gamescore += 16;
            break;
          case 5:
            gamescore += 32;
            break;
          case 6:
            gamescore += 64;
            break;
          case 7:
            gamescore += 128;
            break;
          case 8:
            gamescore += 256;
            break;
        }
        scoreElement.textContent = `Score: ${gamescore}`;         // 업데이트 스코어
        World.remove(world, [collision.bodyA, collision.bodyB]);  // 충돌한 두 물체 제거

        // 로켓과 행성이 충돌했을 때 효과음 재생
        const shootingSound = new Audio('boom_short.mp3'); // 효과음 추가
        shootingSound.play(); // 효과음 재생
      } else {
        // 충돌한 두 물체의 인덱스가 같은 경우에만 다음 행성을 생성하여 추가합니다.
        if (collision.bodyA.index === collision.bodyB.index) {
          const index = collision.bodyA.index;
  
          // 행성이 합쳐질 때 인덱스에 따라 점수를 추가
          switch (index) {
            case 0:
              gamescore += 2;
              break;
            case 1:
              gamescore += 4;
              break;
            case 2:
              gamescore += 8;
              break;
            case 3:
              gamescore += 16;
              break;
            case 4:
              gamescore += 32;
              break;
            case 5:
              gamescore += 64;
              break;
            case 6:
              gamescore += 128;
              break;
            case 7:
              gamescore += 256;
              break;
            case 8:
              gamescore += 512;
              break;
          }
          scoreElement.textContent = `Score: ${gamescore}`;  // 업데이트 스코어
  
          if (index === PLANETS.length - 1) {
            return;
          }
          World.remove(world, [collision.bodyA, collision.bodyB]);
          
          // 행성이 합쳐질 때 효과음 재생
          const mergeSound = new Audio('merge_sound.mp3'); // 합쳐질 때 재생될 효과음 파일 경로
          mergeSound.play(); // 효과음 재생
  
          const newPlanet = PLANETS[index + 1];
          const newBody = Bodies.circle(
            collision.collision.supports[0].x,
            collision.collision.supports[0].y,
            newPlanet.radius,
            {
              index: index + 1,
              render: {
                sprite: { texture: `./${newPlanet.name}.png` }
              }
            }
          );
  
          World.add(world, newBody);
        }
      }
      // 보너스 시간 추가
      if (!fust && gamescore >= 600) {
        fust = true;
        timer += 30;
        timeSound.play();
      }
      if (!sacund && gamescore >= 1000) {
        sacund = true;
        timer += 30;
        timeSound.play();
      }
      if (!serd && gamescore >= 1500) {
        serd = true;
        timer += 60;
        timeSound.play();
      }
    });
  });

  createPlanet();
};


////////////////////////////연습 게임////////////////////////////

const pracGame = () => {
  // 중력이 모이는 가운에 원 만들기
  // x좌표 : 1350, y좌표 : 540, radius(반지름) : 40
  const centerGravity = Bodies.circle(1350, 540, 40, { 
    isStatic: true,     // 움직이지 않도록 고정
    // isSensor: true,  // 충돌 감지만 가능하도록 설정
    render: {           // 그리기
      fillStyle: 'transparent',   // 투명 스타일로 지정
      strokeStyle: 'white',       // 선 색상
      lineWidth: 3,     // 선 두께
    }
  });

  // 로켓 수 이미지 생성
  const ex1 = new Image();
  ex1.src = 'rocket.png';
  ex1.alt = 'Rocket 1';
  ex1.style.position = 'absolute';
  ex1.style.top = '50px';
  ex1.style.left = '75px';
  ex1.style.width = '50px';
  ex1.style.height = 'auto';
  ex1.style.cursor = 'pointer'; // 클릭 가능한 커서 스타일 설정
  ex1.addEventListener('click', () => {
      createRocket(); // 클릭 이벤트에서 createRocket() 함수 호출
      ex1.style.display = 'none'; // 클릭한 이미지 숨기기
  });

  const ex2 = new Image();
  ex2.src = 'rocket.png';
  ex2.alt = 'Rocket 2';
  ex2.style.position = 'absolute';
  ex2.style.top = '50px';
  ex2.style.left = '150px';
  ex2.style.width = '50px';
  ex2.style.height = 'auto';
  ex2.style.cursor = 'pointer';
  ex2.addEventListener('click', () => {
      createRocket(); // 클릭 이벤트에서 createRocket() 함수 호출
      ex2.style.display = 'none'; // 클릭한 이미지 숨기기
  });

  const ex3 = new Image();
  ex3.src = 'rocket.png';
  ex3.alt = 'Rocket 3';
  ex3.style.position = 'absolute';
  ex3.style.top = '50px';
  ex3.style.left = '225px';
  ex3.style.width = '50px';
  ex3.style.height = 'auto';
  ex3.style.cursor = 'pointer';
  ex3.addEventListener('click', () => {
      createRocket(); // 클릭 이벤트에서 createRocket() 함수 호출
      ex3.style.display = 'none'; // 클릭한 이미지 숨기기
  });

  // 생성된 이미지를 문서에 추가
  document.body.appendChild(ex1);
  document.body.appendChild(ex2);
  document.body.appendChild(ex3);

  scoreElement.textContent = `Score: ${gamescore}`;
  timerElement.textContent = `Timer: ${practimer}`;
  World.add(world, [centerGravity,ex1,ex2,ex3, circle, circle2]); //[centerGravity, 계속 추가 가능]
  const gameOverSound = new Audio('game_over.mp3'); // 합쳐질 때 재생될 효과음 파일 경로
  gameOverSound.volume = 1;

  //타이머
  const countdown = setInterval(() => {
    // 타이머가 0이 되면 타이머 종료
    if (practimer === 0) {
      gameOverSound.play(); // 효과음 재생
      clearInterval(countdown);
      bgm.pause();
      bgm.currentTime = 0;
      console.log('score : ', gamescore);
      alert(`게임 오버!!\n 총 스코어 : ${gamescore}`);
    }
    
    practimer--;  // 타이머 시간 감소
    timerElement.textContent = `Timer: ${practimer}`; // 화면에 타이머 표시
  }, 1000);

  // 행성 생성하기

  let shootingPlanet;  // 플레이어가 쏠 행성
  let isDragging = false;  // 행성 드래그
  let isShooting = false;  // 행성 쏘기

  const createPlanet = () => {
    let index = Math.floor(Math.random() * 4); // 행성 인덱스
    let planet = PLANETS[index];

    shootingPlanet = Bodies.circle(600, 540, planet.radius, {
      index: index,
      isStatic: true,  // 행성 고정
      render: {
        sprite: { texture: `./${planet.name}.png` }  // 행성 이미지 경로
      }
    });
    World.add(world, shootingPlanet);
  };

  const createRocket = () => {
    
    // shootingPlanet 객체가 600, 540 위치에 있는지 확인하는 함수
    function isAtPosition(shootingPlanet, x, y) {
      return shootingPlanet.position.x === x && shootingPlanet.position.y === y;
    }
    
    if (shootingPlanet && isAtPosition(shootingPlanet, 600, 540)) {
      World.remove(world, shootingPlanet);
    }

    let index = 1;  // 0~1까지 랜덤으로 행성 생성
    let planet = PLANETS[index];  // index에는 0~1까지 들어감

    shootingPlanet = Bodies.circle(600, 540, planet.radius, {
      index: index,
      angle: Math.PI / 2,
      isStatic: true,  // 행성 고정
      render: {
        sprite: { texture: `./rocket.png` }  // 행성 이미지 경로
      }
    });
    World.add(world, shootingPlanet);
  };

  // 행성 간의 거리 측정
  window.addEventListener('mousedown', (event) => {
    // 마우스 좌표
    const mousePosition = {
      x: event.clientX,
      y: event.clientY
    };

    // 행성의 중심과 마우스 좌표의 거리 계산 -> 유클리드 거리
    const distanceToPlanet = Math.sqrt(
      (mousePosition.x - shootingPlanet.position.x) ** 2 +
      (mousePosition.y - shootingPlanet.position.y) ** 2
    );

    // 행성의 중심과 마우스 좌표의 거리가 쏘는 행성의 반지름보다 작으면
    // isDragging = true가 되어 행성을 드래그 할 수 있다.
    if (distanceToPlanet < shootingPlanet.circleRadius) {
      isDragging = true;
      // console.log('click') -> 디버깅 용
    }
  });

  // isDragging = true 일 경우만 행성이 마우스 포인트를 따라간다.
  window.addEventListener('mousemove', (event) => {
    if (isDragging) {
        // 마우스의 새로운 위치
        const newPosition = { x: event.clientX, y: event.clientY };

        // 원의 중심 좌표
        const circleCenterX = circle.position.x;
        const circleCenterY = circle.position.y;

        // 원의 반지름
        const circleRadius = 150;

        // 왼쪽 반원 내에서만 움직이도록 제한
        if (newPosition.x <= circleCenterX) {
            // 마우스와 원의 중심 사이의 거리 계산
            const distanceToCircleCenter = Math.sqrt(
                (newPosition.x - circleCenterX) ** 2 +
                (newPosition.y - circleCenterY) ** 2
            );

            // 행성의 위치를 새로운 위치로 업데이트
            if (distanceToCircleCenter <= circleRadius) {
                Body.setPosition(shootingPlanet, newPosition);
            } else {
                // 행성의 위치를 원의 경계에 맞게 조정하여 원 안에 머무르도록 함
                const angle = Math.atan2(newPosition.y - circleCenterY, newPosition.x - circleCenterX);
                const x = circleCenterX + circleRadius * Math.cos(angle);
                const y = circleCenterY + circleRadius * Math.sin(angle);
                Body.setPosition(shootingPlanet, { x, y });
            }
        } else {
            // 마우스가 원의 중심보다 오른쪽에 있는 경우
            // x 좌표는 원의 중심 x 좌표로 고정
            // y 좌표는 원의 중심 기준으로 최대 150 이동
            const clampedY = Math.min(Math.max(newPosition.y, circleCenterY - circleRadius), circleCenterY + circleRadius);
            Body.setPosition(shootingPlanet, { x: circleCenterX, y: clampedY });
        }
    }
  });

  // 행성마다 힘의 크기
  const forceMultiplier = [0.00075, 0.0013, 0.0027, 0.004, 0.0077];
  // 오디오 엘리먼트 생성
  const shootingSound = new Audio('shooting_sound.mp3');

  // 마우스를 떼면 isDragging = false로 한다.
  window.addEventListener('mouseup', (event) => {
    if (isDragging) {
      // 마우스 커서를 숨기고 지정된 위치로 이동한 것처럼 보이게 함
      document.body.style.cursor = 'none';
      const fakeCursor = document.createElement('div');
      fakeCursor.style.position = 'absolute';
      fakeCursor.style.width = '10px';
      fakeCursor.style.height = '10px';
      fakeCursor.style.backgroundColor = 'rgba(0, 0, 0, 0)';
      fakeCursor.style.borderRadius = '50%';
      fakeCursor.style.pointerEvents = 'none';
      fakeCursor.style.left = '600px';
      fakeCursor.style.top = '540px';
      document.body.appendChild(fakeCursor);

      isShooting = true;
  
      setTimeout(() => {
        document.body.style.cursor = 'default';
        document.body.removeChild(fakeCursor);
      }, 1250);
    } else {
      return;
    }


    // 원의 중심 좌표
    const circleCenterX = circle.position.x;
    const circleCenterY = circle.position.y;

    // 행성의 현재 위치
    const shootingPlanetX = shootingPlanet.position.x;
    const shootingPlanetY = shootingPlanet.position.y;

    // 행성과 원 중심 사이의 거리 계산
    const distanceX = shootingPlanetX - circleCenterX;
    const distanceY = shootingPlanetY - circleCenterY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if(distance==0){
      
      isDragging = false;
      isShooting = false;
      return
    }
    // 효과음 재생
    shootingSound.play();
    shootingSound.currentTime = 0;

    
    // 행성을 발사할 위치 (원의 중심 방향)
    const shootingPosition = {
      x: shootingPlanetX - (distanceX / distance) * shootingPlanet.circleRadius,
      y: shootingPlanetY - (distanceY / distance) * shootingPlanet.circleRadius
    };

    // 행성의 고정 해제
    Body.setStatic(shootingPlanet, false);

    // 행성을 원의 중심 방향으로 발사하기 위한 힘의 방향 계산
    const forceDirection = {
      x: circleCenterX - shootingPosition.x,
      y: circleCenterY - shootingPosition.y
    };

    // 힘을 작용시키는 applyForce 함수
    // 행성의 인덱스에 따라 다른 힘의 크기를 적용합니다.
    const index = shootingPlanet.index;
    const forceMultiplierForPlanet = forceMultiplier[index];
    Body.applyForce(shootingPlanet, shootingPosition, {
      x: forceDirection.x * forceMultiplierForPlanet,  
      y: forceDirection.y * forceMultiplierForPlanet  
    });

    isDragging = false;
    isShooting = false;

    setTimeout(() => {
      createPlanet();
    }, 1250);  // 몇 초 뒤에 행성이 다시 생성되는지 시간 설정
  });

  // 만유인력의 법칙
  Events.on(engine, 'beforeUpdate', (event) => {
    const bodies = Composite.allBodies(world);

    bodies.forEach(body => {
      const dx = centerGravity.position.x - body.position.x;
      const dy = centerGravity.position.y - body.position.y;

      const distanceSquared = dx * dx + dy * dy;
      const forceMagnitude = 0.3 * body.mass / distanceSquared;

      // 만유인력에 작용하는 힘의 크기를 증가시킵니다.
      const increasedForceMagnitude = forceMagnitude * 2; // 기존 힘의 크기에 2를 곱하여 증가시킵니다.

      Body.applyForce(body, body.position, { x: increasedForceMagnitude * dx, y: increasedForceMagnitude * dy });
    });
  });


  Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((collision) => {
      const textureA = collision.bodyA.render.sprite.texture;  // bodyA의 텍스처
      const textureB = collision.bodyB.render.sprite.texture;  // bodyB의 텍스처
      const timeSound = new Audio('time.mp3'); // 합쳐질 때 재생될 효과음 파일 경로
  
      // rocket.png와의 충돌을 확인하는 조건
      const isRocketCollision = (
        (textureA === './rocket.png' && collision.bodyB !== centerGravity && collision.bodyB !== ex1 && collision.bodyB !== ex2 && collision.bodyB !== ex3 && collision.bodyB !== circle && collision.bodyB !== circle2) ||
        (textureB === './rocket.png' && collision.bodyA !== centerGravity && collision.bodyA !== ex1 && collision.bodyA !== ex2 && collision.bodyA !== ex3 && collision.bodyA !== circle && collision.bodyA !== circle2)
      );
  
      // rocket.png와 충돌한 경우 점수를 추가하는 로직
      if (isRocketCollision) {
        const index = textureA === './rocket.png' ? collision.bodyB.index : collision.bodyA.index;
        switch (index) {
          case 0:
            gamescore += 1; // rocket과 충돌 시 다른 점수
            break;
          case 1:
            gamescore += 2;
            break;
          case 2:
            gamescore += 4;
            break;
          case 3:
            gamescore += 8;
            break;
          case 4:
            gamescore += 16;
            break;
          case 5:
            gamescore += 32;
            break;
          case 6:
            gamescore += 64;
            break;
          case 7:
            gamescore += 128;
            break;
          case 8:
            gamescore += 256;
            break;
        }
        scoreElement.textContent = `Score: ${gamescore}`;  // 업데이트 스코어
        World.remove(world, [collision.bodyA, collision.bodyB]);  // 충돌한 두 물체 제거

        // 로켓과 행성이 충돌했을 때 효과음 재생
        const shootingSound = new Audio('boom_short.mp3'); // 효과음 추가
        shootingSound.play(); // 효과음 재생
      } else {
        // 충돌한 두 물체의 인덱스가 같은 경우에만 다음 행성을 생성하여 추가합니다.
        if (collision.bodyA.index === collision.bodyB.index) {
          const index = collision.bodyA.index;
  
          // 행성이 합쳐질 때 인덱스에 따라 점수를 추가
          switch (index) {
            case 0:
              gamescore += 2;
              break;
            case 1:
              gamescore += 4;
              break;
            case 2:
              gamescore += 8;
              break;
            case 3:
              gamescore += 16;
              break;
            case 4:
              gamescore += 32;
              break;
            case 5:
              gamescore += 64;
              break;
            case 6:
              gamescore += 128;
              break;
            case 7:
              gamescore += 256;
              break;
            case 8:
              gamescore += 512;
              break;
          }
          scoreElement.textContent = `Score: ${gamescore}`;  // 업데이트 스코어
  
          if (index === PLANETS.length - 1) {
            return;
          }
          World.remove(world, [collision.bodyA, collision.bodyB]);
          
          // 행성이 합쳐질 때 효과음 재생
          const mergeSound = new Audio('merge_sound.mp3'); // 합쳐질 때 재생될 효과음 파일 경로
          mergeSound.play(); // 효과음 재생
  
          const newPlanet = PLANETS[index + 1];
          const newBody = Bodies.circle(
            collision.collision.supports[0].x,
            collision.collision.supports[0].y,
            newPlanet.radius,
            {
              index: index + 1,
              render: {
                sprite: { texture: `./${newPlanet.name}.png` }
              }
            }
          );
  
          World.add(world, newBody);
        }
      }
      // 보너스 시간 추가
      if (!fust && gamescore >= 100) {
        fust = true;
        practimer += 30;
        timeSound.play();
      }
      if (!sacund && gamescore >= 200) {
        sacund = true;
        practimer += 30;
        timeSound.play();
      }
      if (!serd && gamescore >= 300) {
        serd = true;
        practimer += 30;
        timeSound.play();
      }
    });
  });

  createPlanet();
};