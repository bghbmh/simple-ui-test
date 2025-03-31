

export class Timepicker {

    	static initInputTimepickerCount = 0; // 열려있는 타임피커의 수를 추적
	
	static documentMouseUpHandler = null;
    	static documentMouseMoveHandler = null;
	static documentResizeHandler = null;

	boundHandleClickOutside = null; //
    	boundResizeHandler = null; //

	constructor(obj, args) {

		this.boundHandleClickOutside = this.handleClickOutside.bind(this); // 바인딩
        this.boundResizeHandler = reTime.debounce(this.setPositionTimepickerWrapper.bind(this, 'transition: all .3s;')); //바인딩


		this.timepickerInput = obj;
		this.timepickerInput.classList.add("bTimepicker-init");
		this.timepickerInput.initBTPicker = false;
		this.timepickerInput.initBTValues = this.initializeDefaults(args); // 기본 속성 설정

		this.timepickerWrapper = null;
		this.timepickerElements = {}; // ampm { body, zOptions }, hours, minutes, seconds
		this.selectedTime = {};// ampm, hours, minutes, seconds

		this.testget = "tttttt?????";

		this.isTimepickerVisible = false;
		this.isMouse = false;
        this.userOS = this.getUserOS();   // 매직마우스 휠과 일반 마우스 휠이 달라 os를 확인함

		this.initDefaultValues(args);// 사용자 정의 초기값 설정
		this.initTime(args);

		this.setupEventListeners();

		this.render();

		reTime.initInputTimepickerCount++; // 타임피커를 사용하는 요소 개수

		this.msgList = {
            t1: `초기 설정 값과 입력 값을 확인해주세요 `
        };
		
        console.log("done reTime", reTime.initInputTimepickerCount);
	}

	// 브라우저 정보 확인
	getUserOS() {
		const os = navigator.userAgent.toLowerCase();
		if (os.match(/macintosh/i)) return "mac";
		if (os.match(/window/i)) return "window";
		if (os.match(/android/i)) return "android";
		if (os.match(/iphone/i)) return "iphone";
		if (os.match(/ipad/i)) return "ipad";
		return null;
	}

	// 기본 속성설정
	initializeDefaults(args) {
		return {
			timeFormat: 'ap hh:mm',
            ampm: false, // ['오전', '오후'], // or false = 24시간제,   meridiem 정오 라는 뜻이라는데
            hours: 24, //   12,   24
			minutes: true, //
			seconds: false, // 간격 false, true or 1 ,2 ~
			interval: 1,//분 간격 false, true or 1 ,2 ~
			maxItem: 3, //화면에 보일 아이템 수, 3, 5 ~ 홀수만
			control: true,//취소, 선택 버튼
            time: null // 초기값,   hours가 12면 ampm 값도 넣어야함 'am:11:33',
		};
	}

	// 사용자 정의 초기값 설정
	initDefaultValues = (args) => {
		if (!args) return;
		for (let key in args) {
			if (key === "ampm") {
				if (typeof args[key] === "boolean" && args[key]) args[key] = ['오전', '오후'];
			}
			this.timepickerInput.initBTValues[key] = args[key];
		}
	}

	// 시간 포맷
	formatTime(time) {
		return time.replace(/\s/gi, "").split(':').map(v => v).join(" : ");
	}

	// 이벤트 리스너 설정
	setupEventListeners() {
		this.timepickerInput.addEventListener("focus", this.inputHandler.bind(this));
	}


	// 포커스 이벤트 처리
	inputHandler(e) {
		if (e.type === "focus") {
			if (!this.timepickerInput.initBTPicker) {
				this.handleFocus(e);
			}
		} else if (e.type === "focusout") {
			this.handleFocusOut(e);
		}
	}

	// 포커스 처리
	handleFocus(e) {   
        // 이미 열려있는 타임피커가 있는지 확인
        if (reTime.initInputTimepickerCount > 1) {
            console.log("222 - ", this.timepickerInput.initBTPicker);
            // 현재 포커스를 받은 input 요소가 아닌 다른 타임피커가 열려있다면 닫기
            const restTimepickerInput = [...document.querySelectorAll('.bTimepicker-init')].filter(b => b !== this.timepickerInput);

            restTimepickerInput.forEach(r => r.orderBTID ? this.closeTimepicker(r) : '');
        }

        // 새로운 타임피커 생성 및 열기
		this.createTimepicker(null, Date.now());

		document.addEventListener("mousedown", this.boundHandleClickOutside); 
        window.addEventListener('resize', this.boundResizeHandler); // 리사이즈 이벤트 리스너 추가
	}

	// 외부 클릭 감지
	handleClickOutside(event) {  
        const openTimepicker = [...document.querySelectorAll('.bTimepicker-wrap')]; // 현재 열려있는 타임피커
        const [...initTimepickerInput] = document.querySelectorAll('.bTimepicker-init');

		if (openTimepicker 
            && !openTimepicker.some(p => p.contains(event.target))
			&& event.target.closest("input") !== this.timepickerInput) {
			
            const relatedInput = initTimepickerInput.find(o => openTimepicker.find(z => z.id === o.orderBTID));

            if (relatedInput) this.closeTimepicker(relatedInput);
		}
	}

    handleFocusOut() {
        setTimeout(() => {
			if (this.timepickerWrapper && !this.isTimepickerVisible && !this.timepickerWrapper.contains(document.activeElement)) {
				this.closeTimepicker(this.timepickerInput);
			}
		}, 100);
	}

	// Timepicker 닫기
	closeTimepicker(tInput) {  
		if (!document.querySelector("#" + tInput.orderBTID)) return;
		
		document.body.removeChild(document.querySelector("#" + tInput.orderBTID));
		
        console.log("closeTimepicker 11 - ", tInput);

		this.timepickerWrapper = null;
		this.timepickerElements = {};
		tInput.orderBTID = null;
		tInput.initBTPicker = false;

		document.removeEventListener("mousedown", this.boundHandleClickOutside);
        if (reTime.documentMouseMoveHandler) {
			document.removeEventListener('mousemove', reTime.documentMouseMoveHandler);
            reTime.documentMouseMoveHandler = null;
        }
        if (reTime.documentMouseUpHandler) {
			document.removeEventListener('mouseup', reTime.documentMouseUpHandler);
			reTime.documentMouseUpHandler = null;
        }
        window.removeEventListener('resize', this.boundResizeHandler);
	}

	// Timepicker 생성
	createTimepicker(args, timestamp = Date.now()) {
		const picker = this.timepickerInput;

		this.timepickerWrapper = document.createElement("div");
		this.timepickerWrapper.setAttribute("aria-label", "Timepicker");
		this.timepickerWrapper.setAttribute("class", "bTimepicker-wrap");
		this.timepickerWrapper.id = "bt" + Math.floor(timestamp);
		document.body.appendChild(this.timepickerWrapper);

		picker.dataset.timeOrder = this.timepickerWrapper.id;
		picker.orderBTID = this.timepickerWrapper.id;
		picker.initBTPicker = true;

		this.createClockItems();
		this.createInitTime();
		this.setPositionTimepickerWrapper();
	}

	checkElementVerticalPosition(element) {
		const rect = element.getBoundingClientRect();
		const windowHeight = window.innerHeight;
		const midpoint = windowHeight / 2;

		// rect.top은 뷰포트의 상단에서 요소의 상단까지의 거리입니다.
        return rect.top < midpoint;
	}

	createInitTime() {
		for (const [key, value] of Object.entries(this.selectedTime)) {
			const o = this.timepickerElements[key]?.zOptions;

            if (o) {
                console.log("2 - tTarget children:", [...o.tTarget.children].map(ch => ch.textContent));
                o.currentIdx = [...o.tTarget.children].findIndex(ch => ch.textContent === value);
                console.log("3 - currentIdx:", o.currentIdx, o.tTarget.children[2].textContent);

                const scrollTop = o.itemHeight * (o.currentIdx - o.initIdx);
                console.log("4 - scrollTop:", scrollTop);

                console.log("5 - element to scroll:", this.timepickerElements[key].body);
                console.log("6 - scroll to:", scrollTop);
                this.setScrollTop(this.timepickerElements[key].body, scrollTop);

                if (o.currentIdx < 0) this.alertMsg(this.msgList.t1);
                else if (o.currentIdx === 0) this.setSelectedItem(key, o.tTarget, o.initIdx);
                else this.setSelectedItem(key, o.tTarget, o.currentIdx);
            }

			console.log("1 - key:", key, "value:", value, "o:", o, this.timepickerElements[key].body);
		}
	}

	setScrollTop(obj, top) {
		obj.scrollTop = top;
	}

	setSelectedItem = (key, target, curIdx) => {
		[...target.children].forEach(z => {
			z.classList.remove("selected");
			z.ariaSelected = false;
		});
		target.children[curIdx].classList.add("selected");
		target.children[curIdx].ariaSelected = true;
		this.selectedTime[key] = target.children[curIdx].textContent;
	};

	// 시계 아이템 생성
	createClockItems() {
		this.timepickerInput.initBTValues.ampm && this.makeClockItem('ampm');
		this.timepickerInput.initBTValues.hours && this.makeClockItem('hours');
		this.timepickerInput.initBTValues.minutes && this.makeClockItem('minutes');
		this.timepickerInput.initBTValues.seconds && this.makeClockItem('seconds');
		this.timepickerInput.initBTValues.control && this.initControl();
	}

	// 시계 아이템 만들기
	makeClockItem(key) {
		const element = document.createElement("div");
		this.timepickerElements[key] = { body: element };
		this.timepickerElements[key].body.setAttribute("class", key + "-wrap");

		let list = document.createElement("ol");
		list.setAttribute("class", key);

        const values = [];
        if (key === "ampm") {
            values.push(...this.timepickerInput.initBTValues[key]);
        } else if (key === "hours") {
            for (let i = 1; i <= this.timepickerInput.initBTValues[key]; i++) {
                values.push(i);
            }
        } else {
            const interval = this.timepickerInput.initBTValues[key] === true ? this.timepickerInput.initBTValues.interval : '';
            for (let i = 0; i < 60; i += interval) {
                values.push(i);
            }
        }

		values.forEach(val => this.addItems(list, val));
		this.addBlankItems(list);// 위치를 맞추기 위한 빈태그 삽입

		this.timepickerElements[key].body.appendChild(list);
        this.timepickerWrapper.appendChild(this.timepickerElements[key].body);

		this.timepickerElements[key].zOptions = this.initDefaultOptions(key, this.timepickerElements[key].body);

		
		this.attachEventListener(this.timepickerElements[key], this.timepickerElements[key].body);
		
	}

    setPositionTimepickerWrapper = (pickerTransition = '') => {
		if (!this.timepickerWrapper) return; // timepickerWrapper가 존재하는지 확인

        this.timepickerWrapper.style.cssText = `
            position: absolute;
            top: ${window.scrollY + this.timepickerInput.getBoundingClientRect().top + this.timepickerInput.getBoundingClientRect().height}px;
            left: ${window.scrollX + this.timepickerInput.getBoundingClientRect().left}px;
            --maxItem: ${this.timepickerInput.initBTValues.maxItem};
            ${pickerTransition}
        `;

        if (!this.checkElementVerticalPosition(this.timepickerInput)) {
            this.timepickerWrapper.style.cssText += `
                transform: translateY( calc(-100% - ${this.timepickerInput.getBoundingClientRect().height}px));
            `;
        }
	};

	attachEventListener(node, element, scrollStep = 50) {
		if (!element) {
			console.error("Element가 유효하지 않습니다.");
			return;
		}
		scrollStep = node.zOptions.itemHeight;
		let isScrolling = false;
		let isMouseDown = false;
		let isDragging = false; // 드래그 여부를 추적하는 플래그
		let startY = 0;
		let startScrollTop = 0;

		const maxScrollTop = element.scrollHeight - element.offsetHeight;

		// 터치 이벤트 관련 변수
		let isTouched = false;
		let touchStartY = 0;
		let touchStartScrollTop = 0;
		let isTouchDragging = false;
		let timer = null;

		const updateSelectedItem = (scrollTop) => {  
			const currentIdx = Math.round(scrollTop / scrollStep);
			node.zOptions.currentIdx = Math.max(0, Math.min(currentIdx, node.zOptions.lastIdx));
			element.scrollTop = node.zOptions.currentIdx * scrollStep;
			this.setSelectedItem(node.zOptions.key, node.zOptions.tTarget, node.zOptions.currentIdx + node.zOptions.initIdx);

			this.render();
		};
		
		element.addEventListener('mouseleave', (e) => { 
			if (isMouseDown) isMouseDown = false;
		});

		element.addEventListener('mousedown', (e) => { 
			isMouseDown = true;
			isDragging = false; // mousedown 시 드래그 상태 초기화
			startY = e.clientY;
			startScrollTop = element.scrollTop;
		});
		
		const mouseupHandler = (e) => {
			if (e.pointerType === 'touch') return; // 터치 입력 시 무시
			if (isMouseDown) {  
				isMouseDown = false;

				if (!isDragging) { 
					const clickedItem = e.target.closest(".item");				
					if (clickedItem) {
						node.zOptions.currentIdx = [...node.zOptions.tTarget.children].findIndex(t => t.textContent === clickedItem.textContent);
						updateSelectedItem((node.zOptions.currentIdx - node.zOptions.initIdx) * scrollStep);
					}
					isDragging = false; // mouseup 시 드래그 상태 초기화
					return;
				}
			}
		};

		const mousemoveHandler = (e) => { 
			if (!isMouseDown) return;
			e.preventDefault();
			const deltaY = e.clientY - startY;
			const newScrollTop = startScrollTop - deltaY;

			// 마우스가 조금이라도 움직였다면 드래그 상태로 설정
			if (Math.abs(deltaY) > 0) {
				isDragging = true;
			}

			if (!isScrolling) {
				isScrolling = true;
				requestAnimationFrame(() => {
					element.scrollTop = newScrollTop;
					updateSelectedItem(newScrollTop);
					isScrolling = false;
				});
			}
		}; 

        document.addEventListener('mouseup', mouseupHandler);
		document.addEventListener('mousemove', mousemoveHandler);

		reTime.documentMouseUpHandler = mouseupHandler;
        reTime.documentMouseMoveHandler = mousemoveHandler;
		
		element.addEventListener('wheel', (e) => {
			e.preventDefault();
			const deltaY = e.deltaY;
			let newScrollTop = element.scrollTop + (deltaY > 0 ? scrollStep : -scrollStep);

			if (!isScrolling) {
				isScrolling = true;
				requestAnimationFrame(() => {
					newScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));
					element.scrollTop = newScrollTop;
					updateSelectedItem(newScrollTop);
					isScrolling = false;
				});
			}
		}, { passive: false });

		// 터치 이벤트 리스너
		element.addEventListener('touchstart', (e) => { 
			isTouched = true;
			isTouchDragging = false;
			touchStartY = e.touches[0].clientY;
        });
	
		element.addEventListener('touchmove', (e) => {  
			if (!isTouched) return;
			const deltaY = e.touches[0].clientY - touchStartY;

			if (!isTouchDragging && Math.abs(deltaY) > 5) { //
				isTouchDragging = true;
			}
        }, { passive: true }); // preventDefault 사용 시 passive: false 필요

		element.addEventListener('touchend', (e) => { 
            if (isTouched && !isTouchDragging) {
				const clickedItem = e.target.closest(".item");	
				if (clickedItem) {
					node.zOptions.currentIdx = [...node.zOptions.tTarget.children].findIndex(t => t.textContent === clickedItem.textContent);
					element.scrollTop = (node.zOptions.currentIdx - node.zOptions.initIdx) * scrollStep;
				}
			}
            isTouched = false;
            isTouchDragging = false;
        });
		
		element.addEventListener('scroll', (e) => {
            if (!isTouched && !isMouseDown) return; // 터치 또는 마우스 입력이 없을 때는 무시
	
			clearTimeout(timer);
            timer = setTimeout(() => {
				updateSelectedItem(element.scrollTop);
                isTouched = false;
				isTouchDragging = false;
				isMouseDown = false;
				isDragging = false;
			}, 200);
		});
	
	}

	//시, 분 추가
	addItems = (obj, num) => {
		const li = document.createElement("li");
		li.setAttribute("class", "item");
		li.ariaSelected = false;
		li.textContent = typeof num === "string" ? num : num.toString().padStart(2, '0');
		obj.appendChild(li);
	};

	// 위치를 맞추기 위한 빈태그 삽입
	addBlankItems = (obj) => {
		const blankCount = Math.floor(this.timepickerInput.initBTValues.maxItem / 2);
		for (let i = 0; i < blankCount; i++) {
			const li1 = document.createElement("li");
			li1.setAttribute("class", "item blank");
			li1.ariaSelected = false;
			li1.setAttribute("aria-hidden", "true"); // 추가
			obj.prepend(li1);

			const li2 = document.createElement("li");
			li2.setAttribute("class", "item blank");
			li2.ariaSelected = false;
			li2.setAttribute("aria-hidden", "true"); // 추가
			obj.appendChild(li2);
		}
	}

	// 이벤트 처리에 필요한 기본 값 설정_임시
	initDefaultOptions = (key, o) => {
		return {
			key: key,
			tTarget: o.firstElementChild,
			itemHeight: o.firstElementChild.offsetHeight / o.firstElementChild.children.length,
			time: this.timepickerInput.initBTValues.time ? this.timepickerInput.initBTValues.time : '',
			maxDy: Math.abs(o.offsetHeight - o.firstElementChild.offsetHeight), // 최대 이동거리
			initIdx: parseInt(this.timepickerInput.initBTValues.maxItem / 2),
			currentIdx: parseInt(this.timepickerInput.initBTValues.maxItem / 2),// 현재 아이템
			lastIdx: o.firstElementChild.children.length - parseInt(this.timepickerInput.initBTValues.maxItem / 2) - 1,// 마지막 아이템
        };
	}

	// O 선택, X 취소 컨트롤 생성
	initControl() {
		let ctrl = document.createElement("div");
		ctrl.setAttribute("class", "ctrl");

		let cancelBtn = document.createElement("button");
		cancelBtn.setAttribute("type", "button");
		cancelBtn.setAttribute("class", "btime-ctrl cancel");
		cancelBtn.ariaLabel = "선택안함, cancel";
		cancelBtn.addEventListener("click", this.cancelTimepicker);
		ctrl.appendChild(cancelBtn);

		let okBtn = document.createElement("button");
		okBtn.setAttribute("type", "button");
		okBtn.setAttribute("class", "btime-ctrl ok");
		okBtn.ariaLabel = "선택함, ok";
		okBtn.addEventListener("click", this.okTimepicker);
		ctrl.appendChild(okBtn);

		this.timepickerWrapper.appendChild(ctrl);
	}

	cancelTimepicker = e => {
		e.stopPropagation();

        const initTime = this.timepickerInput.initBTValues.time?.replace(/\s/g, '');
        const selectedTime = this.timepickerInput.value?.replace(/\s/g, '');

		if (initTime && initTime !== selectedTime) {
			const timeParts = initTime.split(":");
			Object.keys(this.selectedTime).forEach((key, index) => {
				if (index < timeParts.length) {
					this.selectedTime[key] = timeParts[index];
				}
			});
        } else if (initTime === undefined || initTime === null || initTime === '') {
			for (const key in this.selectedTime) {
				this.selectedTime[key] = '';
			}
		}

		this.render();
		this.closeTimepicker(this.timepickerInput);
	}

	okTimepicker = e => {
		e.stopPropagation();

		this.render();
		this.timepickerInput.initBTValues.time = this.timepickerInput.value;
		this.closeTimepicker(this.timepickerInput);
	}

	initTime = (args) => {
		const z = this.timepickerInput.initBTValues;

		if (z.ampm) this.selectedTime['ampm'] = '';
		if (z.hours === 24 && z.ampm) z.hours = 12;
		if (z.hours) this.selectedTime['hours'] = '';
		if (z.minutes) this.selectedTime['minutes'] = '';
		if (z.seconds) this.selectedTime['seconds'] = '';

		this.timepickerInput.initBTValues.time = this.timepickerInput.value || args?.time || "";
		this.timepickerInput.value = this.formatTime(this.timepickerInput.initBTValues.time);
		
		if (this.timepickerInput.initBTValues.time) {
			let timeParts = this.timepickerInput.initBTValues.time.replace(/\s/gi, "").split(':');

			Object.keys(this.selectedTime).forEach((key, idx) => {
				if (idx < timeParts.length) 
					this.selectedTime[key] = timeParts[idx];
			})
		}

		console.log("initTime - ", this.selectedTime);
	}

    render = () => {
		let a = [];
		for (const key in this.selectedTime) {
            if (this.selectedTime[key] !== "") {
                a.push(this.selectedTime[key])
			}
		}
        this.timepickerInput.value = a.length > 0 ? a.map(v => v).join(" : ") : '';
	}

	alertMsg = (str = null) => {
        const ALERT_DURATION = 3000; // 메시지 표시 시간 (상수)

		let msgWrap = document.createElement("div");
		msgWrap.setAttribute("class", "btpicker-alert-msg");
		msgWrap.textContent = str ? str : "alert msg";

		document.body.appendChild(msgWrap);

		msgWrap.style.cssText = `
			position: absolute;
            top : ${window.scrollY + this.timepickerInput.getBoundingClientRect().top}px;
            left : ${window.scrollX + this.timepickerInput.getBoundingClientRect().left}px;
		`;

        setTimeout(() => msgWrap.remove(), ALERT_DURATION); // 설정된 시간 후 메시지 제거
	}

	static debounce(func, delay = 300) {
		let timeoutId;
		return function (...args) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				func.apply(this, args);
			}, delay);
		};
	}

	static init(obj = null, args = null) {
		if (!obj) return null;

		if (obj instanceof NodeList) {
            obj.forEach(o => new this(o, args))
		} else {
			return new this(obj, args);
		}

		return null;
	}
	
}







