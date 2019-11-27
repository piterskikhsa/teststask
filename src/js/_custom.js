document.addEventListener("DOMContentLoaded", function () {
	ymaps.ready(function () {
		var map = new ymaps.Map("map", {
			center: [55.831, 38.260],
			zoom: 15
		});
	});

	const maxItem = 5

	let pageEvents = 0,
		pageInstr = 0,
		lenEvents = 0,
		lenInstr = 0

	function getCoords(elem) {
		const element = elem.getBoundingClientRect();
		return {
			top: element.top + pageYOffset - 10,
			left: element.left + pageXOffset - 20
		};
	}

	function setCookie(frameID, coords) {
		const left_positin = frameID + "_left=" + coords.left,
			top_positin = frameID + "_top=" + coords.top;
		document.cookie = left_positin
		document.cookie = top_positin
	}

	function getCookie(frameID) {
		const cookies = document.cookie.split(';').filter((item) => item.trim().startsWith(frameID))
		let startCoords = { left: null, top: null }
		if (cookies) {
			cookies.forEach((cookie) => {
				const data = cookie.split('=')
				if (data[0].endsWith('_left')) {
					startCoords.left = parseFloat(data[1])
				} else if (data[0].endsWith('_top')) {
					startCoords.top = parseFloat(data[1])
				}
			})
		}
		return startCoords
	}

	function renderPage() {
		const container = document.querySelector('.container'),
			frames = container.querySelectorAll('.frame');

		frames.forEach((frame) => {
			const frameID = frame.getAttribute('data-id'),
				{ left, top } = getCookie(frameID),
				table = frame.querySelector('table');
			let data = null;
			if (left !== null && top !== null) {
				frame.style.left = left + 'px';
				frame.style.top = top + 'px';
			}
		})
	}

	function actionPage() {
		const expands = document.querySelectorAll('.control__expand'),
			collapses = document.querySelectorAll('.control__collapse'),
			closes = document.querySelectorAll('.control__close'),
			headers = document.querySelectorAll('.frame__header'),
			instrments = document.querySelectorAll('.instrments__table tbody tr'),
			events = document.querySelectorAll('.events__table tbody tr'),
			buttons_left = document.querySelectorAll('.page_left'),
			buttons_right = document.querySelectorAll('.page_right');

		lenEvents = events.length
		lenInstr = instrments.length

		buttons_left.forEach((button_left) => {
			button_left.addEventListener('click', function (event) {
				const activePage = this.parentNode.parentNode.querySelector('.current_page'),
					parent = this.parentNode.parentNode.parentNode.parentNode,
					table = parent.querySelector('table');
				if (parent.classList.contains('instrments')) {
					if (pageInstr < 1) {
						return false
					}
					pageInstr--
					listInstrPage()
				} else if (parent.classList.contains('events')) {
					if (pageEvents < 1) {
						return false
					}
					pageEvents--
					listEventPage()
				}
			})
		})

		buttons_right.forEach((button_right) => {
			button_right.addEventListener('click', function (event) {
				const parent = this.parentNode.parentNode.parentNode.parentNode;

				if (parent.classList.contains('instrments')) {
					if (pageInstr > lenInstr / maxItem - 1) {
						return false
					}
					pageInstr++
					listInstrPage()
				} else if (parent.classList.contains('events')) {
					if (pageEvents > lenEvents / maxItem - 1) {
						return false
					}
					pageEvents++
					listEventPage()
				}
			})
		})

		instrments.forEach((instr) => {
			instr.addEventListener('click', filterEvent)
		})

		headers.forEach((header) => {
			header.addEventListener('mousedown', function (event) {
				const parent = this.parentNode,
					coords = getCoords(parent),
					parentID = parent.getAttribute('data-id')
				if (!parent.classList.contains('collapse')) {
					let shiftX = event.pageX - coords.left,
						shiftY = event.pageY - coords.top;

					parent.style.zIndex = 1000;
					if (event.target === this) {
						dragable(event)
					}

					function dragable(e) {
						parent.style.left = e.pageX - shiftX + 'px';
						parent.style.top = e.pageY - shiftY + 'px';
					}

					document.onmousemove = function (event) {
						dragable(event);
					};
					parent.onmouseup = function () {
						document.onmousemove = null;
						parent.onmouseup = null;
						parent.style.zIndex = 0;
						setCookie(parentID, getCoords(parent))
					}
				}
			})
		})

		expands.forEach((expand) => {
			expand.addEventListener('click', function (event) {
				const parentFrame = this.parentNode.parentNode.parentNode
				event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
				if (parentFrame.classList.contains('collapse')) {
					parentFrame.classList.remove('collapse')
				}
				parentFrame.classList.toggle('full-screen')
				this.classList.toggle('control__unexpand')
			})
		})
		collapses.forEach((collapse) => {
			collapse.addEventListener('click', function (event) {
				const parentFrame = this.parentNode.parentNode.parentNode
				event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
				if (parentFrame.classList.contains('full-screen')) {
					parentFrame.classList.remove('full-screen')
					this.nextElementSibling.classList.remove('control__unexpand')
				}
				parentFrame.classList.toggle('collapse')
			})
		})

		closes.forEach((close) => {
			close.addEventListener('click', function (event) {
				const parentFrame = this.parentNode.parentNode.parentNode
				event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
				parentFrame.remove()
			})
		})
	}

	function listEventPage() {
		const eventFrame = document.querySelector('.events')
		const startPosition = pageEvents * maxItem
		const finishPosition = startPosition + maxItem,
			activePage = eventFrame.querySelector('.current_page'),
			maxPage = eventFrame.querySelector('.pages');
		let events = eventFrame.querySelectorAll('tbody tr');

		activePage.textContent = pageEvents + 1
		maxPage.textContent = Math.floor(lenEvents / maxItem) + 1
		events.forEach((eventRow, index) => {
			if ((index < startPosition || index >= finishPosition) || (eventRow.hasAttribute('data-display') && eventRow.getAttribute('data-display') === 'none')) {
				eventRow.style.display = "none";
			} else {
				eventRow.style.display = "";
			}
		})
	}
	function listInstrPage() {
		const instrFrame = document.querySelector('.instrments')
		const instrs = instrFrame.querySelectorAll('tbody tr')
		const startPosition = pageInstr * maxItem
		const finishPosition = startPosition + maxItem,
			activePage = instrFrame.querySelector('.current_page'),
			maxPage = instrFrame.querySelector('.pages');
		activePage.textContent = pageInstr + 1
		maxPage.textContent = Math.floor(lenInstr / maxItem) + 1

		instrs.forEach((instrRow, index) => {
			if (index < startPosition || index >= finishPosition) {
				instrRow.style.display = "none";
			} else {
				instrRow.style.display = "";
			}
		})
	}

	function filterEvent() {
		const events = document.querySelectorAll('.events__table tbody tr'),
			instrments = document.querySelectorAll('.instrments__table tbody tr');

		instrments.forEach(instr => {
			if (instr === this) {
				instr.classList.add('active')
			} else {
				instr.classList.remove('active')
			}
		})

		if (events) {
			events.forEach(eventRow => {
				if (!eventRow.hasAttribute('data-instId') || this.getAttribute('data-id') !== eventRow.getAttribute('data-instId')) {
					eventRow.setAttribute('data-display', 'none')
					eventRow.style.display = 'none';
				} else {
					eventRow.style.display = '';
					eventRow.removeAttribute('data-display')
				}
			})
		}
	}

	function instrFormatter(data) {
		return `<td>${data.title}</td>
				<td>${data.type}</td>
				<td>${data.location}</td>`
	}

	function eventsFormatter(data) {
		return `<td>${data.type}</td>
				<td>${data.time}</td>
				<td><span class="green block">${data.i1[0]}</span><span class="red block">${data.i1[1]}</span></td>
				<td><span class="green block">${data.i2[0]}</span><span class="red block">${data.i2[1]}</span></td>
				<td><span class="green block">${data.i3[0]}</span><span class="red block">${data.i3[1]}</span></td>
				<td><span class="green block">${data.u1[0]}</span><span class="red block">${data.u1[1]}</span></td>
				<td><span class="green block">${data.u2[0]}</span><span class="red block">${data.u2[1]}</span></td>
				<td><span class="green block">${data.u3[0]}</span><span class="red block">${data.u3[1]}</span></td>`
	}

	function createRow(data, rowFormatter) {
		const tableRow = document.createElement("tr")
		tableRow.setAttribute('data-id', data.id)

		if (data.instId !== undefined) {
			tableRow.setAttribute('data-instId', data.instId)
		}

		tableRow.innerHTML = rowFormatter(data)
		return tableRow
	}

	function renderEvents(data) {
		let tableBody = document.createElement("tbody");
		const eventsWrapper = document.querySelector('.events__table')
		data.forEach((eventRowData) => {
			const row = createRow(eventRowData, eventsFormatter)
			tableBody.append(row)
		})
		eventsWrapper.append(tableBody)
	}
	function renderInstrumments(data) {
		let tableBody = document.createElement("tbody");

		const instrumentsWrapper = document.querySelector('.instrments__table')
		data.forEach((instrRowData) => {
			const row = createRow(instrRowData, instrFormatter)
			tableBody.append(row)
		})
		instrumentsWrapper.append(tableBody)
	}
	function getData() {
		return fetch('../db/db.json')
			.then((response) => {
				if (response.ok) {
					return response.json()
				} else {
					throw new Error('Данные не были получены, ошибка: ' + response.status)
				}
			}).then((data) => {
				return data
			}).catch((err) => {
				console.warn(err)
			});
	}
	function renderTables(data) {
		renderInstrumments(data.instruments)
		renderEvents(data.events)
	}
	//with gulp
	// getData().then((data) => {
	// 	renderTables(data)
	// 	renderPage()
	// 	actionPage()
	// 	listEventPage()
	// 	listInstrPage()
	// })

	//without gulp
	renderTables(database)
	renderPage()
	actionPage()
	listEventPage()
	listInstrPage()

});
const database = {
	"instruments":
		[{ "id": 0, "title": "Прибор 1", "type": "Тип прибора 1", "location": "местоположение прибора 1" },
		{ "id": 1, "title": "Прибор 2", "type": "Тип прибора 2", "location": "местоположение прибора 2" },
		{ "id": 2, "title": "Прибор 3", "type": "Тип прибора 3", "location": "местоположение прибора 3" },
		{ "id": 3, "title": "Прибор 4", "type": "Тип прибора 4", "location": "местоположение прибора 4" },
		{ "id": 4, "title": "Прибор 5", "type": "Тип прибора 5", "location": "местоположение прибора 5" },
		{ "id": 5, "title": "Прибор 6", "type": "Тип прибора 6", "location": "местоположение прибора 6" },
		{ "id": 6, "title": "Прибор 7", "type": "Тип прибора 7", "location": "местоположение прибора 7" },
		{ "id": 7, "title": "Прибор 8", "type": "Тип прибора 8", "location": "местоположение прибора 8" },
		{ "id": 8, "title": "Прибор 9", "type": "Тип прибора 9", "location": "местоположение прибора 9" },
		{ "id": 9, "title": "Прибор 10", "type": "Тип прибора 10", "location": "местоположение прибора 10" },
		{ "id": 10, "title": "Прибор 11", "type": "Тип прибора 11", "location": "местоположение прибора 11" },
		{ "id": 11, "title": "Прибор 12", "type": "Тип прибора 12", "location": "местоположение прибора 12" },
		{ "id": 12, "title": "Прибор 13", "type": "Тип прибора 13", "location": "местоположение прибора 13" },
		{ "id": 13, "title": "Прибор 14", "type": "Тип прибора 14", "location": "местоположение прибора 14" },
		{ "id": 14, "title": "Прибор 15", "type": "Тип прибора 15", "location": "местоположение прибора 15" },
		{ "id": 15, "title": "Прибор 16", "type": "Тип прибора 16", "location": "местоположение прибора 16" }],
	"events":
		[{ "instId": 0, "id": 0, "type": "Событие 1", "time": "05:11", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 0, "id": 1, "type": "Событие 2", "time": "05:12", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 0, "id": 2, "type": "Событие 3", "time": "05:13", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 0, "id": 3, "type": "Событие 4", "time": "05:14", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 0, "id": 4, "type": "Событие 5", "time": "05:15", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 0, "id": 5, "type": "Событие 6", "time": "05:16", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 0, "id": 6, "type": "Событие 7", "time": "05:17", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 0, "id": 7, "type": "Событие 8", "time": "05:18", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 1, "id": 8, "type": "Событие 9", "time": "05:19", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 1, "id": 9, "type": "Событие 10", "time": "05:20", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 1, "id": 10, "type": "Событие 11", "time": "05:21", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 1, "id": 11, "type": "Событие 12", "time": "05:22", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 2, "id": 12, "type": "Событие 13", "time": "05:18", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 3, "id": 13, "type": "Событие 14", "time": "05:19", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 4, "id": 14, "type": "Событие 15", "time": "05:20", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 4, "id": 15, "type": "Событие 16", "time": "05:21", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] },
		{ "instId": 4, "id": 16, "type": "Событие 17", "time": "05:22", "i1": [100, 10], "i2": [100, 10], "i3": [100, 10], "u1": [100, 10], "u2": [10000, 100], "u3": [10000, 100] }]
}