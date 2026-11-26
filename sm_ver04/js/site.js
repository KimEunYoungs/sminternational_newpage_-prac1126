document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
});

siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        menuToggle.setAttribute("aria-expanded", "false");
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.focus();
    }
});

const form = document.querySelector("#product-search");
const input = document.querySelector("#search-input");
const categories = [...document.querySelectorAll("[data-category]")];
const results = document.querySelector("#search-results");
const resultsTitle = document.querySelector("#results-title");
const resultsMessage = document.querySelector("#results-message");
const resultsList = document.querySelector("#result-list");

for (const link of document.querySelectorAll('a[href="#finder"]')) {
    link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        menuToggle.setAttribute("aria-expanded", "false");
        requestAnimationFrame(() => input.focus({ preventScroll: true }));
    });
}

const backTop = document.querySelector(".back-top");
const heroObserver = new IntersectionObserver(([hero]) => {
    backTop.classList.toggle("is-visible", !hero.isIntersecting);
});
heroObserver.observe(document.querySelector(".hero"));

function normalize(text) {
    return text.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}+]/gu, "");
}

const products = [...document.querySelectorAll("[data-product]")].map((link) => ({
    name: (link.querySelector(".product-name") ?? link).textContent.trim(),
    href: link.getAttribute("href"),
    categories: link.dataset.product.split(" "),
    terms: link.dataset.terms
}));

const otherAmenities = [
    ["FRECO Deodorant", "19", "프레코 데오도란트 탈취"],
    ["FRECO Hair & Body", "18", "프레코 헤어앤바디 샴푸 바디워시 바디로션"],
    ["Be Different", "17", "비디퍼런트"],
    ["Hydro Basics", "16", "하이드로베이직"],
    ["Primage Organic Kids", "13", "프리메라쥬 프리마쥬 유아 어린이 키즈"],
    ["NATURA", "12", "나투라"],
    ["ARDER Premium", "9", "아르더 프리미엄"],
    ["Nature Story", "8", "네이처스토리 내추럴스토리"],
    ["ARDER", "2", "아르더"]
];

for (const [name, route, terms] of otherAmenities) {
    products.push({
        name,
        href: `../이전/sm/amenities/${route}/index.html`,
        categories: ["amenity"],
        terms
    });
}

for (const product of products) {
    product.searchText = normalize(`${product.name} ${product.terms}`);
    product.searchName = normalize(product.name);
}

function setActiveCategory(active) {
    for (const link of categories) {
        if (link === active) {
            link.setAttribute("aria-current", "true");
        } else {
            link.removeAttribute("aria-current");
        }
    }
}

function showResults(label, matches) {
    resultsMessage.textContent = matches.length
        ? `“${label}” 관련 제품·제품군 ${matches.length}개`
        : `“${label}”와 일치하는 제품이 없습니다. 다른 제품명이나 키워드로 검색해 보세요.`;

    const rows = matches.map(({ name, href }) => {
        const row = document.createElement("li");
        const link = document.createElement("a");
        const arrow = document.createElement("span");
        link.href = href;
        link.textContent = name;
        arrow.className = "arrow-right";
        arrow.setAttribute("aria-hidden", "true");
        link.append(arrow);
        row.append(link);
        return row;
    });

    resultsList.replaceChildren(...rows);
    results.hidden = false;
    resultsTitle.focus({ preventScroll: true });
    results.scrollIntoView({ block: "start" });
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const terms = query.split(/\s+/u).map(normalize).filter(Boolean);
    if (!terms.length) {
        input.setCustomValidity("제품명 또는 키워드를 입력해 주세요.");
        input.reportValidity();
        return;
    }

    const matches = products.filter((product) => terms.every((term) => product.searchText.includes(term)));
    const exact = normalize(query);
    matches.sort((first, second) => Number(second.searchName.includes(exact)) - Number(first.searchName.includes(exact)));
    setActiveCategory(null);
    showResults(query, matches);
});

input.addEventListener("input", () => input.setCustomValidity(""));

for (const link of categories) {
    link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        input.value = "";
        input.setCustomValidity("");
        setActiveCategory(link);
        const matches = products.filter((product) => product.categories.includes(link.dataset.category));
        showResults(link.textContent.trim(), matches);
    });
}

document.querySelector(".clear-search").addEventListener("click", () => {
    form.reset();
    input.setCustomValidity("");
    setActiveCategory(null);
    results.hidden = true;
    resultsList.replaceChildren();
    input.focus();
});
