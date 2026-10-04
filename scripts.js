document.addEventListener("DOMContentLoaded", () => {
    const tree = document.querySelector(".tree");
    const trackBtn = document.querySelector(".features-btn");

    const buyModal = document.getElementById("buyModal");
    const trackModal = document.getElementById("trackModal");

    const myTreesCount = document.getElementById("myTreesCount");
    const totalTreesCount = document.getElementById("totalTreesCount");

    const qtyMinus = document.getElementById("qtyMinus");
    const qtyPlus = document.getElementById("qtyPlus");
    const qtyInput = document.getElementById("qtyInput");
    const qtyText = document.getElementById("qtyText");
    const buyBtn = document.getElementById("buyBtn");
    const resetBtn = document.getElementById("resetTrees");

    const countEl = document.querySelector(".features-count-num");

    const STORAGE_KEY = "treesPurchased";


    let liveBase = (() => {
        if (!countEl) return 0;
        const n = parseInt(String(countEl.textContent).replace(/\D/g, ""), 10);
        return Number.isFinite(n) ? n : 0;
    })();

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (liveTimer) clearTimeout(liveTimer);
        } else {
            if (liveTimer) clearTimeout(liveTimer);
            scheduleNextLiveAdd();
        }
    });


    const getPurchased = () => {
        const v = Number(localStorage.getItem(STORAGE_KEY));
        return Number.isFinite(v) && v >= 0 ? v : 0;
    };

    const setPurchased = (v) => {
        localStorage.setItem(STORAGE_KEY, String(v));
    };

    const clampQty = (v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n < 1) return 1;
        return Math.floor(n);
    };

    const updateTotalCounter = () => {
        if (!countEl) return;
        countEl.textContent = liveBase + getPurchased();
    };

    const openModal = (modalEl) => {
        if (!modalEl) return;
        modalEl.classList.add("open");
        modalEl.setAttribute("aria-hidden", "false");
    };

    const closeModal = (modalEl) => {
        if (!modalEl) return;
        modalEl.classList.remove("open");
        modalEl.setAttribute("aria-hidden", "true");
    };

    const syncQty = () => {
        if (!qtyInput || !qtyText) return;
        qtyInput.value = clampQty(qtyInput.value);
        qtyText.textContent = qtyInput.value;
    };


    if (tree) {
        tree.addEventListener("click", () => {
            openModal(buyModal);
            qtyInput.value = 1;
            qtyText.textContent = "1";
        });
    }

    if (qtyMinus) {
        qtyMinus.addEventListener("click", () => {
            qtyInput.value = clampQty(qtyInput.value) - 1;
            syncQty();
        });
    }

    if (qtyPlus) {
        qtyPlus.addEventListener("click", () => {
            qtyInput.value = clampQty(qtyInput.value) + 1;
            syncQty();
        });
    }

    if (qtyInput) {
        qtyInput.addEventListener("input", syncQty);
    }


    if (buyBtn) {
        buyBtn.addEventListener("click", () => {
            const qty = clampQty(qtyInput.value);
            setPurchased(getPurchased() + qty);
            updateTotalCounter();
            closeModal(buyModal);
        });
    }


    if (trackBtn) {
        trackBtn.addEventListener("click", () => {
            if (myTreesCount) myTreesCount.textContent = getPurchased();
            if (totalTreesCount) totalTreesCount.textContent = liveBase + getPurchased();
            openModal(trackModal);
        });
    }


    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            localStorage.removeItem(STORAGE_KEY);
            if (myTreesCount) myTreesCount.textContent = 0;
            updateTotalCounter();
        });
    }


    [buyModal, trackModal].forEach((m) => {
        if (!m) return;
        m.addEventListener("click", (e) => {
            if (e.target.dataset.close === "1") closeModal(m);
        });
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (buyModal?.classList.contains("open")) closeModal(buyModal);
            if (trackModal?.classList.contains("open")) closeModal(trackModal);
        }
    });


    let liveTimer = null;

    function scheduleNextLiveAdd() {
        const delay = 2500 + Math.random() * 4500;

        liveTimer = setTimeout(() => {
            let steps = 1 + Math.floor(Math.random() * 3);
            const stepTimer = setInterval(() => {
                liveBase += 1;
                updateTotalCounter();
                steps -= 1;
                if (steps <= 0) clearInterval(stepTimer);
            }, 220);

            scheduleNextLiveAdd();
        }, delay);
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (liveTimer) clearTimeout(liveTimer);
        } else {
            scheduleNextLiveAdd();
        }
    });

    scheduleNextLiveAdd();

    updateTotalCounter();
});
