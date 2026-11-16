document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll("[data-shift-filter]");
  const searchInput = document.getElementById("classSearch");
  const scheduleRows = document.querySelectorAll("#scheduleBody tr");
  const classCountBadge = document.getElementById("classCountBadge");
  const noClassesMessage = document.getElementById("noClassesMessage");

  let activeShift = "all";

  function filterTimetable() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    scheduleRows.forEach(function (row) {
      const rowShift = row.getAttribute("data-shift");
      const rowText = row.textContent.toLowerCase();

      const matchesShift = activeShift === "all" || rowShift === activeShift;
      const matchesSearch = rowText.includes(query);

      if (matchesShift && matchesSearch) {
        row.classList.remove("d-none");
        visibleCount++;
      } else {
        row.classList.add("d-none");
      }
    });

    classCountBadge.textContent = "Showing " + visibleCount + (visibleCount === 1 ? " class" : " classes");
    noClassesMessage.classList.toggle("d-none", visibleCount > 0);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });
      button.classList.add("active");
      activeShift = button.getAttribute("data-shift-filter");
      filterTimetable();
    });
  });

  searchInput.addEventListener("input", filterTimetable);

  const STORAGE_KEY = "m13_yoga_enquiry";
  const enquiryForm = document.getElementById("enquiryForm");
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("emailAddress");
  const phoneInput = document.getElementById("phoneNumber");
  const startDateInput = document.getElementById("startDate");
  const planSelect = document.getElementById("planSelect");
  const monthsInput = document.getElementById("monthsCount");
  const estimateSummary = document.getElementById("estimateSummary");
  const formFeedback = document.getElementById("formFeedback");
  const clearDraftBtn = document.getElementById("clearDraftBtn");
  const selectPlanButtons = document.querySelectorAll(".select-plan-btn");

  function saveDraft() {
    const selectedShift = document.querySelector('input[name="batchTime"]:checked');
    const draft = {
      fullName: fullNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      startDate: startDateInput.value,
      plan: planSelect.value,
      months: monthsInput.value,
      shift: selectedShift ? selectedShift.value : "Morning"
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }

  function updateFeeEstimate() {
    const rate = Number(planSelect.value) || 0;
    const months = Math.min(Math.max(Number(monthsInput.value) || 1, 1), 12);
    const total = rate * months;
    const selectedLabel = planSelect.options[planSelect.selectedIndex].text.split(" (")[0];

    estimateSummary.textContent =
      selectedLabel + " x " + months + " month(s) = INR " + total.toLocaleString("en-IN");
    saveDraft();
  }

  function loadSavedDraft() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      updateFeeEstimate();
      return;
    }

    try {
      const saved = JSON.parse(raw);
      if (saved.fullName) fullNameInput.value = saved.fullName;
      if (saved.email) emailInput.value = saved.email;
      if (saved.phone) phoneInput.value = saved.phone;
      if (saved.startDate) startDateInput.value = saved.startDate;
      if (saved.plan) planSelect.value = saved.plan;
      if (saved.months) monthsInput.value = saved.months;
      if (saved.shift) {
        const radioToSelect = document.querySelector('input[name="batchTime"][value="' + saved.shift + '"]');
        if (radioToSelect) radioToSelect.checked = true;
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }

    updateFeeEstimate();
  }

  selectPlanButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      planSelect.value = btn.getAttribute("data-plan-value");
      updateFeeEstimate();
      document.getElementById("enquiry").scrollIntoView({ behavior: "smooth" });
      fullNameInput.focus();
    });
  });

  [fullNameInput, emailInput, phoneInput, startDateInput].forEach(function (field) {
    field.addEventListener("input", saveDraft);
  });

  document.querySelectorAll('input[name="batchTime"]').forEach(function (radio) {
    radio.addEventListener("change", saveDraft);
  });

  planSelect.addEventListener("change", updateFeeEstimate);
  monthsInput.addEventListener("input", updateFeeEstimate);

  enquiryForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let isValid = true;

    if (fullNameInput.value.trim().length < 2) {
      fullNameInput.classList.add("is-invalid");
      isValid = false;
    } else {
      fullNameInput.classList.remove("is-invalid");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      emailInput.classList.add("is-invalid");
      isValid = false;
    } else {
      emailInput.classList.remove("is-invalid");
    }

    const digitsOnly = phoneInput.value.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
      phoneInput.classList.add("is-invalid");
      isValid = false;
    } else {
      phoneInput.classList.remove("is-invalid");
    }

    if (!startDateInput.value) {
      startDateInput.classList.add("is-invalid");
      isValid = false;
    } else {
      startDateInput.classList.remove("is-invalid");
    }

    if (!isValid) {
      formFeedback.classList.add("d-none");
      return;
    }

    saveDraft();
    const chosenShift = document.querySelector('input[name="batchTime"]:checked').value;
    formFeedback.textContent =
      "Thank you, " + fullNameInput.value.trim() + "! Your free trial request for the " +
      chosenShift + " batch starting " + startDateInput.value +
      " has been recorded (" + estimateSummary.textContent + ").";
    formFeedback.classList.remove("d-none");
  });

  clearDraftBtn.addEventListener("click", function () {
    localStorage.removeItem(STORAGE_KEY);
    enquiryForm.reset();
    [fullNameInput, emailInput, phoneInput, startDateInput].forEach(function (field) {
      field.classList.remove("is-invalid");
    });
    formFeedback.classList.add("d-none");
    updateFeeEstimate();
  });

  loadSavedDraft();
  filterTimetable();
});