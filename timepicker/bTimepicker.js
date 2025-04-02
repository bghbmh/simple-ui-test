
/* export */ class Timepicker {

    static initInputTimepickerCount = 0; // 열려있는 타임피커 수를 추적
	
	static documentMouseUpHandler = null;
    static documentMouseMoveHandler = null;
	static documentResizeHandler = null;

    // 마우스 이벤트 관련 변수
    isMouseDown = false;
    startY = 0;
    startScrollTop = 0;
    isDragging = false;

    // 터치 이벤트 관련 변수
    isTouched = false;
    isTouchDragging = false;
    touchStartY = 0;

	// 스크롤 상태 변수
    isScrolling = false;

	boundHandleClickOutside = null; //
    boundResizeHandler = null; //

	constructor(obj, args) {

		this.boundHandleClickOutside = this.handleClickOutside.bind(this); // 바인딩
        this.boundResizeHandler = Timepicker.debounce(this.setPositionTimepickerWrapper.bind(this)); //  , 'transition: all .3s;'   바인딩


		this.timepickerInput = obj;
		this.timepickerInput.classList.add("bTimepicker-init");
		this.timepickerInput.initBTPicker = false;
		this.timepickerInput.initBTValues = this.initializeDefaults(args); // 기본 속성 설정

		this.timepickerWrapper = null;
		this.timepickerElements = {}; // ampm { body, zOptions }, hours, minutes, seconds
		this.selectedTime = {};// ampm, hours, minutes, seconds


		this.isTimepickerVisible = false;
		this.isMouse = false;
        this.userOS = this.getUserOS(); // 매직마우스 휠과 일반 마우스 휠이 달라 os를 확인함

		this.initDefaultValues(args);// 사용자 정의 초기값 설정
		this.initTime(args);

		this.setupEventListeners();

		this.render();

		Timepicker.initInputTimepickerCount++; // 타임피커를 사용하는 요소 개수

		this.msgList = {
            t1: `초기 설정 값과 입력 값을 확인해주세요 `
        };
		
        console.log("done Timepicker", Timepicker.initInputTimepickerCount);
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
			maxItem: 3, //화면에 보일 아이템 수, 3, 5 ~ 홀수만 가능
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

		document.body.style.setProperty('--btime-maxItem', this.timepickerInput.initBTValues.maxItem);
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
        if (Timepicker.initInputTimepickerCount > 1) {
            //console.log("222 - ", this.timepickerInput.initBTPicker);
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
        if (Timepicker.documentMouseMoveHandler) {
			document.removeEventListener('mousemove', Timepicker.documentMouseMoveHandler);
            Timepicker.documentMouseMoveHandler = null;
        }
        if (Timepicker.documentMouseUpHandler) {
			document.removeEventListener('mouseup', Timepicker.documentMouseUpHandler);
			Timepicker.documentMouseUpHandler = null;
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

        return rect.top < midpoint; // rect.top은 뷰포트의 상단에서 요소의 상단까지의 거리
	}

	createInitTime() { 
		for (const [key, value] of Object.entries(this.selectedTime)) {
			const o = this.timepickerElements[key]?.zOptions;
			//console.log("1 - key:", key, " /  value:", value, this.timepickerInput );
	
			if (o ) {
				o.currentIdx = [...o.tTarget.children].findIndex(ch => ch.textContent === value);
	
				let scrollTop = o.itemHeight * (o.currentIdx - o.initIdx);
				this.setScrollTop(this.timepickerElements[key].body, scrollTop);
	
				if (o.currentIdx < 0) this.alertMsg(this.msgList.t1);
				else if (o.currentIdx === 0) this.setSelectedItem(key, o.tTarget, o.initIdx);
				else this.setSelectedItem(key, o.tTarget, o.currentIdx);
			}
		}
	}

	setScrollTop(obj, top) {  
		obj.scrollTo({top: top});
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
            --btime-maxItem: ${this.timepickerInput.initBTValues.maxItem};
            ${pickerTransition}
        `;

        if (!this.checkElementVerticalPosition(this.timepickerInput)) {
            this.timepickerWrapper.style.cssText += `
                transform: translateY( calc(-100% - ${this.timepickerInput.getBoundingClientRect().height}px));
            `;
        }
	};


	mouseupHandler = (e) => { 
		if (this.isTouched) return; // 터치 입력 시 무시
		
		if (this.isMouseDown) {
			this.isMouseDown = false;
			
			if (!this.isDragging) {
				const item = e.target.closest(".item");
				const listWrap = e.target.closest('div[class$="-wrap"]');
				const zOptions = listWrap ? this.findZOptions(listWrap) : null;

				if (zOptions) {
					zOptions.currentIdx = [...zOptions.tTarget.children].findIndex(t => t.textContent === item.textContent);
					let scrollTop = (zOptions.currentIdx - zOptions.initIdx) * zOptions.itemHeight;
					this.updateSelectedItem( scrollTop, zOptions);
				}
			}
		}
	};

	mousemoveHandler = (e) => {  
		if (!this.isMouseDown) return;
		e.preventDefault();

		if (Math.abs( e.clientY - this.startY ) > 0) this.isDragging = true;

		const currentY = e.clientY;
		this.startScrollTop += this.startY - currentY ;

		if (!this.isScrolling) {
			this.isScrolling = true;
			requestAnimationFrame(() => {

				const wrapElement = e.target.closest('div[class$="-wrap"]');

				if (wrapElement) {
					const zOptions = this.findZOptions(wrapElement);

					if (zOptions) 
						this.updateSelectedItem(this.startScrollTop, zOptions);
				}
				this.startY = currentY; // 현재 마우스 위치를 다음 움직임의 시작점으로 업데이트
				this.isScrolling = false;
			});
		}
	}; 

	//선택된 아이템 설정
	updateSelectedItem = (scrollTop, zOptions) => {  
		const currentIdx = Math.round(scrollTop / zOptions.itemHeight); 
		zOptions.currentIdx = Math.max(0, Math.min(currentIdx, zOptions.lastIdx)); 
		zOptions.tTarget.parentNode.scrollTop = zOptions.currentIdx * zOptions.itemHeight; 
		this.setSelectedItem(zOptions.key, zOptions.tTarget, zOptions.currentIdx + zOptions.initIdx);
		this.render(); 
	};

	attachEventListener(node, element, scrollStep = 50) {
		if (!element) {
			console.error("Element가 유효하지 않습니다.");
			return;
		}
		scrollStep = node.zOptions.itemHeight;
		const maxScrollTop = element.scrollHeight - element.offsetHeight;

		// 터치 이벤트 관련 변수
		let timer = null;

		//마우스 핸들러
		const mouseleaveHandler = () => {
            if (this.isMouseDown) this.isMouseDown = false;
		}
		
		const mousedownHandler = e => {
            if (this.isTouched) return; // 터치 입력 시 무시
            this.isMouseDown = true;
            this.isDragging = false;
            this.startY = e.clientY;
            this.startScrollTop = element.scrollTop;
		};

		const wheelHandler = e => {
			e.preventDefault();
			const deltaY = e.deltaY;
			let newScrollTop = element.scrollTop + (deltaY > 0 ? scrollStep : -scrollStep);

			if (!this.isScrolling) {  
				this.isScrolling = true;
				requestAnimationFrame(() => {
					newScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop));
					element.scrollTop = newScrollTop;
					this.updateSelectedItem(newScrollTop, node.zOptions);
					this.isScrolling = false;
				});
			}
		};


		//터치 핸들러
		const touchstartHandler = e => {
            this.isTouched = true;
            this.isTouchDragging = false;
            this.touchStartY = e.touches[0].clientY;
            this.startScrollTop = element.scrollTop;
		};

		const touchendHandler = e => { 
            if (this.isTouched && !this.isTouchDragging ) {
				const item = e.target.closest(".item");
				if (item) {
					const idx = [...node.zOptions.tTarget.children].findIndex(t => t.textContent === item.textContent);

					if ( idx !== -1) {
						const fst = (idx - node.zOptions.initIdx) * scrollStep;
						element.scrollTop = fst;
						this.updateSelectedItem(fst, node.zOptions);
					}
				}
			}
		};

		const touchmoveHandler = e => {
            if (!this.isTouched) return;
			//e.preventDefault();  주석지우면 브라우저 기본 터치스크롤 동작이 안됨// 기본 터치스크롤 동작허용

			if (e.touches.length === 1) {
                if (Math.abs(e.touches[0].clientY - this.touchStartY) > 0)
                    this.isTouchDragging = true;
			}
		};

		const scrollHandler = e => {	
			clearTimeout(timer);
            timer = setTimeout(() => {				
				const currentIdx = Math.round(element.scrollTop / node.zOptions.itemHeight);
				const scrollTop = currentIdx * node.zOptions.itemHeight;
				this.updateSelectedItem(scrollTop, node.zOptions);

                this.isTouched = false;
                this.isTouchDragging = false;
			}, 200);
		};

		// document에 mouseup, mousemove 이벤트 리스너를 한 번만 등록
        if (!Timepicker.documentMouseUpHandler) { 
			const boundMouseupHandler = this.mouseupHandler.bind(this);
            document.addEventListener('mouseup', boundMouseupHandler);
            Timepicker.documentMouseUpHandler = boundMouseupHandler;
		}
		if (!Timepicker.documentMouseMoveHandler) {
			const boundMousemoveHandler = this.mousemoveHandler.bind(this);
            document.addEventListener('mousemove', boundMousemoveHandler);
            Timepicker.documentMouseMoveHandler = boundMousemoveHandler;
		}
		
		element.addEventListener('wheel', wheelHandler, { passive: false });
		element.addEventListener('mousedown', mousedownHandler );
		element.addEventListener('mouseleave', mouseleaveHandler);

		element.addEventListener('touchstart', touchstartHandler);
		element.addEventListener('touchend', touchendHandler);
		element.addEventListener('scroll', scrollHandler);

		element.addEventListener('touchmove', touchmoveHandler, { passive: false }); // passive: false 필요
	
	}

	// 각 wrap 요소에서 zOptions를 찾는 함수
	findZOptions(wrapElement) {
		for (const key in this.timepickerElements) {
			if (this.timepickerElements[key].body === wrapElement) {
				return this.timepickerElements[key].zOptions;
			}
		}
		return null;
	}

	//시, 분 추가
	addItems = (obj, num) => { 
		const li = document.createElement("li");
		li.setAttribute("class", "item");
		li.ariaSelected = false;
		li.textContent = typeof num === "string" ? num : num.toString().padStart(2, '0');

		//console.log("addItems - ", obj, num, li.textContent, Number(li.textContent))

		obj.appendChild(li);
	};

	// 위치를 맞추기 위한 빈태그 삽입
	addBlankItems = (obj) => {
		const blankCount = Math.floor(this.timepickerInput.initBTValues.maxItem / 2);
		for (let i = 0; i < blankCount; i++) {
			const li1 = document.createElement("li");
			li1.setAttribute("class", "item blank");
			li1.ariaSelected = false;
			li1.setAttribute("aria-hidden", "true");
			obj.prepend(li1);

			const li2 = document.createElement("li");
			li2.setAttribute("class", "item blank");
			li2.ariaSelected = false;
			li2.setAttribute("aria-hidden", "true");
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
					this.selectedTime[key] = timeParts[idx].toString().padStart(2, '0');
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


window.bTimepicker = function(obj, args) {
    return new Timepicker(obj, args);
};
