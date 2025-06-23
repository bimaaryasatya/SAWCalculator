let criteria = [];
let alternatives = [];
let selectedAlternatives = [];

document.addEventListener("DOMContentLoaded", () => {
	criteria = window.initialCriteria || [];
	alternatives = window.initialAlternatives || [];

	renderCriteriaWeights();
	renderAlternativesDropdown();

	showCustomAlert(
		"Selamat Datang",
		"Silakan pilih alternatif dan masukkan nilai untuk setiap kriteria."
	);

	const modal = document.getElementById("custom-alert-modal");
	const closeButton = modal.querySelector(".close-button");
	const okButton = modal.querySelector("#modal-ok-button");

	closeButton.onclick = function () {
		modal.style.display = "none";
	};
	okButton.onclick = function () {
		modal.style.display = "none";
	};

	window.onclick = function (event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	};

	const darkModeToggle = document.getElementById("darkModeToggle");
	const darkModeCheckbox = document.getElementById("darkModeCheckbox");

	if (localStorage.getItem("darkMode") === "enabled") {
		document.body.classList.add("dark-mode");
		darkModeToggle.classList.add("active");
		darkModeCheckbox.checked = true;
	}

	darkModeToggle.addEventListener("click", () => {
		document.body.classList.toggle("dark-mode");
		darkModeToggle.classList.toggle("active");

		if (document.body.classList.contains("dark-mode")) {
			localStorage.setItem("darkMode", "enabled");
		} else {
			localStorage.setItem("darkMode", "disabled");
		}
	});
});

function renderCriteriaWeights() {
	const container = document.getElementById("criteria-inputs");
	container.innerHTML = "";
	criteria.forEach((crit, index) => {
		const div = document.createElement("div");
		div.classList.add("input-row");
		div.innerHTML = `
			<label>${crit.name} (${crit.type})</label>
			<input type="number" step="0.01" id="weight-${index}" value="1" min="0" />
		`;
		container.appendChild(div);
	});
}

function renderAlternativesDropdown() {
	const select = document.getElementById("alternatives-select");
	select.innerHTML = "";
	alternatives.forEach((alt) => {
		const option = document.createElement("option");
		option.value = alt;
		option.textContent = alt;
		select.appendChild(option);
	});
}

function addSelectedAlternative() {
	const select = document.getElementById("alternatives-select");
	const selectedOption = select.value;
	if (!selectedOption) {
		showCustomAlert("Error", "Pilih alternatif terlebih dahulu.");
		return;
	}
	if (selectedAlternatives.includes(selectedOption)) {
		showCustomAlert("Error", "Alternatif sudah dipilih.");
		return;
	}
	selectedAlternatives.push(selectedOption);
	renderSelectedAlternatives();
	renderAlternativeValuesTable();
}

function removeSelectedAlternative(altName) {
	selectedAlternatives = selectedAlternatives.filter((alt) => alt !== altName);
	renderSelectedAlternatives();
	renderAlternativeValuesTable();
}

function renderSelectedAlternatives() {
	const container = document.getElementById("selected-alternatives");
	container.innerHTML = "";
	selectedAlternatives.forEach((alt) => {
		const div = document.createElement("div");
		div.classList.add("input-row");
		div.style.display = "flex";
		div.style.justifyContent = "space-between";
		div.style.alignItems = "center";
		div.style.marginBottom = "5px";
		div.innerHTML = `
			<span>${alt}</span>
			<button class="button-remove" onclick="removeSelectedAlternative('${alt}')">X</button>
		`;
		container.appendChild(div);
	});
}

function renderAlternativeValuesTable() {
	const container = document.getElementById("alternative-values-section");
	container.innerHTML = "";

	if (selectedAlternatives.length === 0) {
		container.innerHTML = "<p>Silakan pilih minimal satu alternatif.</p>";
		return;
	}

	const table = document.createElement("table");
	table.classList.add("values-table");
	const thead = document.createElement("thead");
	const tbody = document.createElement("tbody");

	// Header row
	let headerRow = "<tr><th>Alternatif</th>";
	criteria.forEach((crit) => {
		headerRow += `<th>${crit.name}</th>`;
	});
	headerRow += "</tr>";
	thead.innerHTML = headerRow;
	table.appendChild(thead);

	// Body rows
	selectedAlternatives.forEach((alt, altIndex) => {
		const tr = document.createElement("tr");
		const tdName = document.createElement("td");
		tdName.textContent = alt;
		tr.appendChild(tdName);

		criteria.forEach((crit, critIndex) => {
			const td = document.createElement("td");
			const input = document.createElement("input");
			input.type = "number";
			input.step = "0.01";
			input.min = "0";
			input.id = `alt-${altIndex}-crit-${critIndex}`;
			input.dataset.alt = alt;
			input.dataset.crit = crit.name;
			td.appendChild(input);
			tr.appendChild(td);
		});
		tbody.appendChild(tr);
	});
	table.appendChild(tbody);
	container.appendChild(table);
}

async function calculateSAW() {
	if (selectedAlternatives.length === 0) {
		showCustomAlert("Error", "Pilih minimal satu alternatif.");
		return;
	}

	// Get weights
	const weights = [];
	let allWeightsFilled = true;
	criteria.forEach((crit, index) => {
		const weightInput = document.getElementById(`weight-${index}`);
		const weightValue = parseFloat(weightInput.value);
		if (isNaN(weightValue)) {
			allWeightsFilled = false;
		}
		weights.push(weightValue);
	});

	if (!allWeightsFilled) {
		showCustomAlert("Error", "Mohon lengkapi semua bobot kriteria.");
		return;
	}

	// Get alternative values
	const alternativesData = [];
	selectedAlternatives.forEach((alt, altIndex) => {
		const values = {};
		criteria.forEach((crit, critIndex) => {
			const input = document.getElementById(`alt-${altIndex}-crit-${critIndex}`);
			const val = parseFloat(input.value);
			if (isNaN(val)) {
				allWeightsFilled = false;
			}
			values[crit.name] = val;
		});
		alternativesData.push({ name: alt, values: values });
	});

	if (!allWeightsFilled) {
		showCustomAlert("Error", "Mohon lengkapi semua nilai alternatif per kriteria.");
		return;
	}

	const payload = {
		criteria: criteria,
		alternatives: alternativesData,
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
	resultsDisplay.style.display = "block";

	const headerTitle = document.querySelector("header h1");
	headerTitle.textContent = window.initialTitle || "SAW Calculator";

	const normalizationTable = document.getElementById("normalization-table");
	renderTable(
		normalizationTable,
		result.alternative_names,
		result.criteria_names,
		result.normalized_matrix
	);

	const weightedNormalizationTable = document.getElementById(
		"weighted-normalization-table"
	);
	renderTable(
		weightedNormalizationTable,
		result.alternative_names,
		result.criteria_names,
		result.weighted_normalized_matrix
	);

	const finalResultsTable = document.getElementById("final-results-table");
	const finalResultsTbody = finalResultsTable.querySelector("tbody");
	finalResultsTbody.innerHTML = "";

	result.final_scores.forEach((item, index) => {
		const row = finalResultsTbody.insertRow();
		row.insertCell(0).textContent = item.name;
		row.insertCell(1).textContent = item.score.toFixed(4);
		row.insertCell(2).textContent = index + 1;
	});

	const winnerDisplay = document.getElementById("winner-display");
	const bestAlternativeName = document.getElementById("best-alternative-name");
	const bestAlternativeScore = document.getElementById("best-alternative-score");

	if (result.final_scores.length > 0) {
		const winner = result.final_scores[0];
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

	let headerRow = "<tr><th>Alternatif</th>";
	colHeaders.forEach((header) => {
		headerRow += `<th>${header}</th>`;
	});
	headerRow += "</tr>";
	thead.innerHTML = headerRow;

	dataMatrix.forEach((row, rowIndex) => {
		const tr = tbody.insertRow();
		tr.insertCell(0).textContent = rowHeaders[rowIndex];
		row.forEach((cellData) => {
			const td = tr.insertCell(-1);
			td.textContent = cellData.toFixed(4);
		});
	});
}

function showCustomAlert(title, message) {
	const modal = document.getElementById("custom-alert-modal");
	document.getElementById("modal-title").textContent = title;
	document.getElementById("modal-message").textContent = message;
	modal.style.display = "flex";
}
