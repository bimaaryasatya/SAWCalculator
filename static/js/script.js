let criterionCount = 0;
let alternativeCount = 0;
let criteria = []; // To store criterion names and types
let alternatives = []; // To store alternative names and their values

document.addEventListener("DOMContentLoaded", () => {
	// Add initial criterion and alternative
	addCriterion();
	addAlternative();

	// Show welcome alert
	showCustomAlert(
		"Selamat Datang",
		"Selamat Datang di Kalkulator SAW! Silakan masukkan data Anda untuk memulai perhitungan."
	);

	// Event listeners for custom modal
	const modal = document.getElementById("custom-alert-modal");
	const closeButton = modal.querySelector(".close-button");
	const okButton = modal.querySelector("#modal-ok-button");

	closeButton.onclick = function () {
		modal.style.display = "none";
	};
	okButton.onclick = function () {
		modal.style.display = "none";
	};

	// Close modal when clicking outside of it
	window.onclick = function (event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	};

	// Dark Mode Toggle Logic
	const darkModeToggle = document.getElementById("darkModeToggle");
	const darkModeCheckbox = document.getElementById("darkModeCheckbox");

	// Check for saved dark mode preference
	if (localStorage.getItem("darkMode") === "enabled") {
		document.body.classList.add("dark-mode");
		darkModeToggle.classList.add("active");
		darkModeCheckbox.checked = true;
	}

	darkModeToggle.addEventListener("click", () => {
		document.body.classList.toggle("dark-mode");
		darkModeToggle.classList.toggle("active");

		// Save preference to localStorage
		if (document.body.classList.contains("dark-mode")) {
			localStorage.setItem("darkMode", "enabled");
		} else {
			localStorage.setItem("darkMode", "disabled");
		}
	});
});

darkModeCheckbox.addEventListener("change", toggleDarkMode);

function toggleDarkMode() {
	document.body.classList.toggle("dark-mode");
	darkModeToggle.classList.toggle("active"); // Update the visual state of the outer div

	// Save preference to localStorage
	if (document.body.classList.contains("dark-mode")) {
		localStorage.setItem("darkMode", "enabled");
	} else {
		localStorage.setItem("darkMode", "disabled");
	}
}
// Function to display custom alert
function showCustomAlert(title, message) {
	const modal = document.getElementById("custom-alert-modal");
	document.getElementById("modal-title").textContent = title;
	document.getElementById("modal-message").textContent = message;
	modal.style.display = "flex"; // Use flex to center
}

function addCriterion() {
	criterionCount++;
	const criteriaInputs = document.getElementById("criteria-inputs");
	const newCriterionDiv = document.createElement("div");
	newCriterionDiv.classList.add("input-row");
	newCriterionDiv.dataset.id = criterionCount;

	newCriterionDiv.innerHTML = `
        <input type="text" id="criterion-name-${criterionCount}" placeholder="Nama Kriteria C${criterionCount}" onchange="updateCriterionData(${criterionCount})" style=color: black; >
        <select id="criterion-type-${criterionCount}" onchange="updateCriterionData(${criterionCount})">
            <option value="benefit">Benefit</option>
            <option value="cost">Cost</option>
        </select>
        <button class="button-remove" onclick="removeCriterion(${criterionCount})">X</button>
    `;
	criteriaInputs.appendChild(newCriterionDiv);

	// Initialize criterion data
	criteria.push({
		id: criterionCount,
		name: "",
		type: "benefit",
	});

	updateWeightsInput();
	updateAlternativeValueInputs();
}

function removeCriterion(id) {
	const criterionDiv = document.querySelector(
		`#criteria-inputs .input-row[data-id="${id}"]`
	);
	if (criterionDiv) {
		criterionDiv.remove();
		criteria = criteria.filter((c) => c.id !== id);
		updateWeightsInput();
		updateAlternativeValueInputs();
	}
}

function updateCriterionData(id) {
	const nameInput = document.getElementById(`criterion-name-${id}`);
	const typeSelect = document.getElementById(`criterion-type-${id}`);
	const criterionIndex = criteria.findIndex((c) => c.id === id);

	if (criterionIndex !== -1) {
		criteria[criterionIndex].name = nameInput.value;
		criteria[criterionIndex].type = typeSelect.value;
	}
	updateWeightsInput(); // Update weights when criteria names change
	updateAlternativeValueInputs(); // Update alternative values when criteria names change
}

function addAlternative() {
	alternativeCount++;
	const alternativesInputs = document.getElementById("alternatives-inputs");
	const newAlternativeDiv = document.createElement("div");
	newAlternativeDiv.classList.add("input-row");
	newAlternativeDiv.dataset.id = alternativeCount;

	newAlternativeDiv.innerHTML = `
        <input type="text" id="alternative-name-${alternativeCount}" placeholder="Nama Alternatif A${alternativeCount}" onchange="updateAlternativeData(${alternativeCount})">
        <button class="button-remove" onclick="removeAlternative(${alternativeCount})">X</button>
    `;
	alternativesInputs.appendChild(newAlternativeDiv);

	// Initialize alternative data
	alternatives.push({
		id: alternativeCount,
		name: "",
		values: {},
	});

	updateAlternativeValueInputs();
}

function removeAlternative(id) {
	const alternativeDiv = document.querySelector(
		`#alternatives-inputs .input-row[data-id="${id}"]`
	);
	if (alternativeDiv) {
		alternativeDiv.remove();
		alternatives = alternatives.filter((a) => a.id !== id);
		updateAlternativeValueInputs();
	}
}

function updateAlternativeData(id) {
	const nameInput = document.getElementById(`alternative-name-${id}`);
	const alternativeIndex = alternatives.findIndex((a) => a.id === id);
	if (alternativeIndex !== -1) {
		alternatives[alternativeIndex].name = nameInput.value;
	}
	updateAlternativeValueInputs();
}

function updateWeightsInput() {
	const weightsInputDiv = document.getElementById("weights-inputs");
	weightsInputDiv.innerHTML = ""; // Clear previous weights

	if (criteria.length === 0) {
		weightsInputDiv.innerHTML =
			"<p>Tambahkan kriteria terlebih dahulu untuk mengatur bobot.</p>";
		return;
	}

	criteria.forEach((criterion) => {
		if (criterion.name) {
			const weightDiv = document.createElement("div");
			weightDiv.classList.add("input-row");
			weightDiv.innerHTML = `
                <label for="weight-${criterion.id}">${criterion.name} (Bobot):</label>
                <input type="number" id="weight-${criterion.id}" step="0.01" value="1" min="0">
            `;
			weightsInputDiv.appendChild(weightDiv);
		}
	});
}

function updateAlternativeValueInputs() {
	let alternativeValuesSection = document.getElementById(
		"alternative-values-section"
	);
	if (!alternativeValuesSection) {
		alternativeValuesSection = document.createElement("div");
		alternativeValuesSection.id = "alternative-values-section";
		alternativeValuesSection.classList.add("card");
		alternativeValuesSection.innerHTML =
			"<h3>Nilai Alternatif per Kriteria</h3>";
		document
			.querySelector(".input-section")
			.appendChild(alternativeValuesSection);
	}
	alternativeValuesSection.innerHTML = "<h3>Nilai Alternatif per Kriteria</h3>"; // Clear previous content

	if (alternatives.length === 0 || criteria.length === 0) {
		alternativeValuesSection.innerHTML +=
			"<p>Tambahkan alternatif dan kriteria untuk memasukkan nilai.</p>";
		return;
	}

	const tableDiv = document.createElement("div");
	tableDiv.classList.add("table-container"); // Use table container styling
	const table = document.createElement("table");
	const thead = document.createElement("thead");
	const tbody = document.createElement("tbody");

	// Create table header
	let headerRow = "<tr><th>Alternatif</th>";
	criteria.forEach((c) => {
		if (c.name) {
			headerRow += `<th>${c.name}</th>`;
		}
	});
	headerRow += "</tr>";
	thead.innerHTML = headerRow;
	table.appendChild(thead);

	// Create table body
	alternatives.forEach((alt) => {
		if (alt.name) {
			let row = `<tr><td>${alt.name}</td>`;
			criteria.forEach((crit) => {
				if (crit.name) {
					// Use crit.name for the key in alt.values
					const currentValue =
						alt.values[crit.name] !== undefined ? alt.values[crit.name] : "";
					row += `<td><input type="number" step="0.01" id="alt-${alt.id}-crit-${crit.id}" 
                               value="${currentValue}" 
                               onchange="updateAlternativeCriterionValue(${alt.id}, ${crit.id}, '${crit.name}')"></td>`;
				}
			});
			row += "</tr>";
			tbody.innerHTML += row;
		}
	});
	table.appendChild(tbody);
	tableDiv.appendChild(table);
	alternativeValuesSection.appendChild(tableDiv);
}

function updateAlternativeCriterionValue(altId, critId, critName) {
	const inputElement = document.getElementById(`alt-${altId}-crit-${critId}`);
	const value = parseFloat(inputElement.value);

	const alternativeIndex = alternatives.findIndex((a) => a.id === altId);
	if (alternativeIndex !== -1) {
		if (!isNaN(value)) {
			alternatives[alternativeIndex].values[critName] = value;
		} else {
			// If input is cleared or not a number, delete the value for this criterion
			delete alternatives[alternativeIndex].values[critName];
		}
	}
}

// Fungsi untuk "menyimpan" konfigurasi input
function saveConfiguration() {
	// Lakukan validasi dasar sebelum "menyimpan"
	const allCriteriaNamed = criteria.every((c) => c.name.trim() !== "");
	if (!allCriteriaNamed && criteria.length > 0) {
		showCustomAlert("Error", "Mohon isi nama untuk semua kriteria.");
		return;
	}

	const allAlternativesNamed = alternatives.every((a) => a.name.trim() !== "");
	if (!allAlternativesNamed && alternatives.length > 0) {
		showCustomAlert("Error", "Mohon isi nama untuk semua alternatif.");
		return;
	}

	// Pastikan semua bobot diisi
	let allWeightsFilled = true;
	if (criteria.length > 0) {
		criteria.forEach((c) => {
			if (c.name) {
				const weightInput = document.getElementById(`weight-${c.id}`);
				if (!weightInput || isNaN(parseFloat(weightInput.value))) {
					allWeightsFilled = false;
				}
			}
		});
	} else {
		allWeightsFilled = false; // No criteria, so no weights to save
	}

	if (!allWeightsFilled) {
		showCustomAlert("Error", "Mohon lengkapi semua bobot kriteria.");
		return;
	}

	// Pastikan semua nilai alternatif per kriteria diisi
	let allValuesFilled = true;
	alternatives.forEach((alt) => {
		criteria.forEach((crit) => {
			if (
				crit.name &&
				(alt.values[crit.name] === undefined || isNaN(alt.values[crit.name]))
			) {
				allValuesFilled = false;
			}
		});
	});

	if (!allValuesFilled) {
		showCustomAlert(
			"Error",
			"Mohon lengkapi semua nilai alternatif untuk setiap kriteria."
		);
		return;
	}

	showCustomAlert(
		"Konfigurasi Disimpan!",
		"Data kriteria, alternatif, dan bobot telah berhasil disimpan dan siap untuk perhitungan."
	);
}

async function calculateSAW() {
	const appTitle = document.getElementById("appTitle").value;

	// Get weights
	const weights = [];
	let allWeightsFilled = true; // For pre-check
	criteria.forEach((c) => {
		if (c.name) {
			const weightInput = document.getElementById(`weight-${c.id}`);
			const weightValue = parseFloat(weightInput.value);
			if (isNaN(weightValue)) {
				allWeightsFilled = false;
			}
			weights.push(weightValue);
		}
	});

	// Validate inputs using custom alert
	if (
		criteria.length === 0 ||
		alternatives.length === 0 ||
		weights.length === 0 ||
		!allWeightsFilled
	) {
		showCustomAlert(
			"Validasi Input",
			"Mohon lengkapi data kriteria, alternatif, dan bobot dengan benar."
		);
		return;
	}

	const allCriteriaNamed = criteria.every((c) => c.name.trim() !== "");
	if (!allCriteriaNamed) {
		showCustomAlert("Validasi Input", "Mohon isi nama untuk semua kriteria.");
		return;
	}

	const allAlternativesNamed = alternatives.every((a) => a.name.trim() !== "");
	if (!allAlternativesNamed) {
		showCustomAlert("Validasi Input", "Mohon isi nama untuk semua alternatif.");
		return;
	}

	let allValuesFilled = true;
	alternatives.forEach((alt) => {
		criteria.forEach((crit) => {
			if (
				crit.name &&
				(alt.values[crit.name] === undefined || isNaN(alt.values[crit.name]))
			) {
				allValuesFilled = false;
			}
		});
	});

	if (!allValuesFilled) {
		showCustomAlert(
			"Validasi Input",
			"Mohon lengkapi semua nilai alternatif untuk setiap kriteria."
		);
		return;
	}

	const payload = {
		criteria: criteria.map((c) => ({ name: c.name, type: c.type })),
		alternatives: alternatives.map((a) => ({ name: a.name, values: a.values })),
		weights: weights,
	};

	try {
		const response = await fetch("/calculate_saw", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`HTTP error! status: ${response.status}. Detail: ${errorText}`
			);
		}

		const result = await response.json();
		displayResults(result);
	} catch (error) {
		console.error("Error calculating SAW:", error);
		showCustomAlert(
			"Error Perhitungan",
			`Terjadi kesalahan saat menghitung SAW: ${error.message}. Silakan cek konsol untuk detailnya.`
		);
	}
}

function displayResults(result) {
	const resultsDisplay = document.getElementById("results-display");
	resultsDisplay.style.display = "block"; // Show results section

	const appTitleElement = document.getElementById("appTitle");
	const headerTitle = document.querySelector("header h1");
	if (appTitleElement.value) {
		headerTitle.textContent = appTitleElement.value;
	} else {
		headerTitle.textContent = "SAW Calculator";
	}

	// Display Normalization Table
	const normalizationTable = document.getElementById("normalization-table");
	renderTable(
		normalizationTable,
		result.alternative_names,
		result.criteria_names,
		result.normalized_matrix
	);

	// Display Weighted Normalization Table
	const weightedNormalizationTable = document.getElementById(
		"weighted-normalization-table"
	);
	renderTable(
		weightedNormalizationTable,
		result.alternative_names,
		result.criteria_names,
		result.weighted_normalized_matrix
	);

	// Display Final Results Table
	const finalResultsTable = document.getElementById("final-results-table");
	const finalResultsTbody = finalResultsTable.querySelector("tbody");
	finalResultsTbody.innerHTML = ""; // Clear previous results

	result.final_scores.forEach((item, index) => {
		const row = finalResultsTbody.insertRow();
		row.insertCell(0).textContent = item.name;
		row.insertCell(1).textContent = item.score.toFixed(4); // Format to 4 decimal places
		row.insertCell(2).textContent = index + 1; // Rank
	});

	// Display Winner/Best Alternative
	const winnerDisplay = document.getElementById("winner-display");
	const bestAlternativeName = document.getElementById("best-alternative-name");
	const bestAlternativeScore = document.getElementById(
		"best-alternative-score"
	);

	if (result.final_scores.length > 0) {
		const winner = result.final_scores[0]; // Assuming it's already sorted
		bestAlternativeName.textContent = winner.name;
		bestAlternativeScore.textContent = winner.score.toFixed(4);
		winnerDisplay.style.display = "block";
	} else {
		winnerDisplay.style.display = "none";
	}
}

function renderTable(tableElement, rowHeaders, colHeaders, dataMatrix) {
	const thead = tableElement.querySelector("thead");
	const tbody = tableElement.querySelector("tbody");
	thead.innerHTML = "";
	tbody.innerHTML = "";

	// Create header row
	let headerRow = "<tr><th>Alternatif</th>";
	colHeaders.forEach((header) => {
		headerRow += `<th>${header}</th>`;
	});
	headerRow += "</tr>";
	thead.innerHTML = headerRow;

	// Create data rows
	dataMatrix.forEach((row, rowIndex) => {
		const tr = tbody.insertRow();
		tr.insertCell(0).textContent = rowHeaders[rowIndex]; // Alternative Name
		row.forEach((cellData) => {
			const td = tr.insertCell(-1); // Insert at the end
			td.textContent = cellData.toFixed(4); // Format to 4 decimal places
		});
	});
}

function resetApplication() {
	// Reset global counters
	criterionCount = 0;
	alternativeCount = 0;

	// Clear criteria and alternatives arrays
	criteria = [];
	alternatives = [];

	// Clear input fields
	document.getElementById("appTitle").value = "";

	// Clear dynamic input sections
	document.getElementById("criteria-inputs").innerHTML = "";
	document.getElementById("alternatives-inputs").innerHTML = "";
	document.getElementById("weights-inputs").innerHTML = "";

	// Clear and hide alternative values section if it exists
	const alternativeValuesSection = document.getElementById(
		"alternative-values-section"
	);
	if (alternativeValuesSection) {
		alternativeValuesSection.innerHTML = "";
		// You might want to hide it completely if it's dynamically added
		// alternativeValuesSection.style.display = 'none'; // Uncomment if you want to hide the whole section
	}

	// Hide results display
	document.getElementById("results-display").style.display = "none";

	// Reset header title
	document.querySelector("header h1").textContent = "SAW Calculator";

	// Add initial criterion and alternative again for a fresh start
	addCriterion();
	addAlternative();

	showCustomAlert(
		"Aplikasi Direset",
		"Semua data telah direset. Anda bisa memulai perhitungan baru."
	);
}
