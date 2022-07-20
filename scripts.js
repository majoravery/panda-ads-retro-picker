/**
 * Specify which member was the previous retro's presenter and which members are
 * excluded from this retro (on vacation, sick etc).
 *
 * Please capitalise the first letter of the name!
 *
 * Example usage: https://majoravery.github.io/panda-ads-retro-picker?previous=Adiba&excluded=Vinh,Jimmy
 */
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
const PREVIOUS_PRESENTER = params.previous;
const EXCLUDED_MEMBERS = params.excluded?.split(",") || [];

const TEAM_MEMBERS = [
  {
    name: "Adiba",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U029RB7QDGD-054e15a6c2c7-512",
  },
  {
    name: "Ankur",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U01LGAF29GS-8c49e6cf9d9e-512",
  },
  {
    name: "Avery",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U03AU807MA9-186cf9aa6568-512",
  },
  {
    name: "Bryan",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U02GCPG45DW-5699818473ca-512",
  },
  {
    name: "David",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U02N4DC3D1Q-ce9147f4f373-512",
  },
  {
    name: "Dang",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U02TYL2MFT2-682a7e2c7903-512",
  },
  {
    name: "Drishti",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U01DJF1MJUQ-be1b7392b385-512",
  },
  {
    name: "Duy",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U01J6BU4WSJ-a3cab36d5c0c-512",
  },
  {
    name: "Jimmy",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U02M9EG8M0B-7485f953ddb8-512",
  },
  {
    name: "Junji",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U031V2H15SP-72e83e34e145-512",
  },
  {
    name: "Kenji",
    imageUrl: "https://ca.slack-edge.com/T052P4KCD-UMZAL0B8X-00eb27f2360e-512",
  },
  {
    name: "Nirvin",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U034S8KT51B-53fd716a0f5f-512",
  },
  {
    name: "Prince",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U031S4NSZRT-755be2899a72-512",
  },
  {
    name: "Tri",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U02PH4JH0HW-755f758bb9e4-512",
  },
  {
    name: "Tumul",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U02HF4LPLS3-cfba8b14f0c5-512",
  },
  {
    name: "Vinh",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U012LJB4KLN-756ea9eb8ddc-512",
  },
  {
    name: "Xuan Yu",
    imageUrl:
      "https://ca.slack-edge.com/T052P4KCD-U03N8LVBREY-c406c91e16ea-512",
  },
];

const ANIMATION_DURATION = 3000;
const FRAMES_PER_SECOND = 20;

let excludedMembersIndices = [];

// Global NodeList of all div.face
let facesNodeList;

// Index of currently circled div.face
let circledIndex;

// Index of previous week's presenter's div.face
let prevPresenterIndex;

// requestAnimationFrame related variables
let prevTimestamp;
let start;
let then;
let now;
let done = false;

function loadMembers() {
  const facesDiv = document.querySelector("div.faces");

  TEAM_MEMBERS.forEach(({ name, imageUrl }, index) => {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = name;

    const nameEl = document.createElement("p");
    nameEl.innerHTML = name;
    const faveDiv = document.createElement("div");
    faveDiv.classList.add("face");
    if (PREVIOUS_PRESENTER === name) {
      faveDiv.classList.add("previous");
      prevPresenterIndex = index;
    }
    if (EXCLUDED_MEMBERS.includes(name)) {
      faveDiv.classList.add("excluded");
      excludedMembersIndices.push(index);
    }
    faveDiv.appendChild(img);

    const wrapDiv = document.createElement("div");
    wrapDiv.classList.add("wrap");
    wrapDiv.appendChild(faveDiv);
    wrapDiv.appendChild(nameEl);

    facesDiv.appendChild(wrapDiv);
  });

  facesNodeList = document.querySelectorAll(".face");
}

function attachListeners() {
  document
    .querySelector("button")
    .addEventListener("click", selectNextPresenter);
  document.querySelector(".modal-button").addEventListener("click", resetPage);
}

function selectNextPresenter() {
  resetAnimation();
  circledIndex = getStartIndex();
  window.requestAnimationFrame(animate);
}

function getStartIndex() {
  const totalMembers = TEAM_MEMBERS.length;
  let nextPresenter = -1;
  do {
    nextPresenter = Math.floor(Math.random() * totalMembers);
  } while (nextPresenter.name === PREVIOUS_PRESENTER);
  return nextPresenter;
}

function animate(timestamp) {
  if (start === undefined) {
    start = timestamp;
    then = Date.now();
  }

  const elapsed = timestamp - start;

  // timeFraction goes from 0 to 1
  const timeFraction = elapsed / ANIMATION_DURATION;

  // Apply timing
  const step = timing(timeFraction);

  // Scale step to fps
  const fps = 1000 / FRAMES_PER_SECOND;
  const interval = step * fps * 4;

  // Apply fps
  now = Date.now();
  const fpsElapsed = now - then;
  if (fpsElapsed > fps + interval) {
    then = now - (fpsElapsed % fps);

    moveCircle();
  }

  // Stop the animation after ANIMATION_DURATION
  if (elapsed < ANIMATION_DURATION) {
    window.requestAnimationFrame(animate);
  } else {
    setTimeout(openModalWithWinner, 300);
  }
}

// Ease in out cubic
function timing(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function moveCircle() {
  // Un-circle current circled face
  facesNodeList[circledIndex].classList.remove("circled");

  circledIndex++;

  if (
    circledIndex === prevPresenterIndex ||
    excludedMembersIndices.includes(circledIndex)
  ) {
    circledIndex++;
  }

  if (circledIndex === TEAM_MEMBERS.length) {
    circledIndex = 0;
  }

  // Circle next face
  facesNodeList[circledIndex].classList.add("circled");
}

function resetAnimation() {
  if (circledIndex) {
    facesNodeList[circledIndex].classList.remove("circled");
  }
  done = false;
  prevTimestamp = undefined;
  start = undefined;
}

function openModalWithWinner() {
  const { name, imageUrl } = TEAM_MEMBERS[circledIndex];
  document.querySelector(".modal-name").innerHTML = name;
  document.querySelector(".modal-image").alt = name;
  document.querySelector(".modal-image").src = imageUrl;
  document.querySelector("body").classList.add("modal-open");
  confetti();
}

function resetPage() {
  document.querySelector("body").classList.remove("modal-open");
  resetAnimation();
}

function init() {
  loadMembers();
  attachListeners();
}

init();
