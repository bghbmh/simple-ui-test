

export class Timepicker {
	constructor(obj, args) {

		this.tpItem = obj;
		this.tpItem.classList.add("bTimepicker-init");
		this.tpItem.initBTPicker = false;
		this.tpItem.initBTValues ={
			ampm : false, // ['오전', '오후'], // or false = 24시간제,  meridiem 정오 라는 뜻이라는데
			hours : 24, //  12,  24
			minutes : 1, //분 간격 false, true or 1 ,2 ~
			seconds : false, // 간격 false, true or 1 ,2 ~
			maxItem : 3, //화면에 보일 아이템 수, 3, 5 ~ 홀수만
			control : true,//취소, 선택 버튼
			time : null // 초기값,  hours가 12면 ampm 값도 넣어야함 'am:11:33',
		}

		this.tpItem.BTWrapper = null;
		this.tpItem.BTElements = {}; // ampm { body, zOptions }, hours, minutes, seconds
		this.tpItem.zSelectedTime = {};// ampm, hours, minutes, seconds

		this.testget = "tttttt?????";

		this.onMouse = "onMouse";
		this.isMouse = false;
		this.userOS = false;

		
		this.checkBrowser(); // 매직마우스 휠과 일반 마우스 휠이 달라 os를 확인함
		this.initDefaultValues(args);

		if( ( !args || !args.time ) && this.tpItem.value ){
			this.tpItem.initBTValues.time = this.tpItem.value;
			this.tpItem.value = this.tpItem.value.replace(/\s/gi, "").split(':').map(v => v).join(" : ");		
		}

		this.msgWrap = document.createElement("div");
		this.msgWrap.setAttribute("class", "btpicker-alert-msg");
		

		this.tpItem.addEventListener("focus", this.checkFocus );
		this.tpItem.addEventListener("focusout", this.checkFocus );
		this.tpItem.addEventListener("blur", this.checkFocus );
		this.tpItem.addEventListener("pointerdown", this.checkPointer );

		//this.tpItem.addEventListener("keyup", e => {})

		this.tpItem.addEventListener("keydown", e => {
			this.keyhandler(e);
		})
		
	}

	checkPointer = e => {
		if (e.pointerType === 'mouse') {
			console.log('마우스 사용');
			this.isMouse = true;
		} else if (e.pointerType === 'touch') {
			console.log('터치패드 또는 터치스크린 사용');
		} else {
			console.log('기타 입력 장치 사용');
		}		
	}

	checkBrowser = () => {
		let os = navigator.userAgent.replace(/ /g, '').toLowerCase()
		if (os.match(/macintosh/i) == "macintosh") this.userOS = "mac";
		else if (os.match(/window/i) == "window") this.userOS = "window";
		else if (os.match(/android/i) == "android") this.userOS = "android";
		else if (os.match(/iphone/i) == "iphone") this.userOS = "iphone";
		else if (os.match(/ipad/i) == "ipad") this.userOS = "ipad";
	}

	keyhandler = e => { console.log("keyhandler - ", e.key)
		switch ( e.keyCode ) {
			case 9:  
			
				break; // hide on tab out
			case 13:  // don't submit the form
					let inputValue = e.target.value.replace(/\s/gi, "").split(':') ;
						
					let num =0;
					let tempTime = {};
					for (const [key, value] of Object.entries(this.tpItem.zSelectedTime)){
						
						if( inputValue[num].length < 2 && Number(inputValue[num]) < 10 ) inputValue[num] = "0" + inputValue[num];
						tempTime[key] = inputValue[num++];

						let o = this.tpItem.BTElements[key].zOptions;
						let ck = [...o.tTarget.children].findIndex( ch => ch.textContent === tempTime[key] );
						if( ck > -1 ){
							o.currentIdx = ck - o.initIdx ;
							o.tTarget.parentNode.scrollTop = o.itemHeight * o.currentIdx;

						}
						console.log("keyhandler - ",tempTime, o.currentIdx);
					}
					e.preventDefault();
					//e.stopPropagation();
			case 27:  // hide on escape
					break;
			case 33:  // previous month/year on page up/+ ctrl
					break;
			case 34:  // next month/year on page down/+ ctrl
					break;
			case 35:  // clear on ctrl or command +end
					break;
			case 36: // current on ctrl or command +home
					break;
			case 37: // -1 day on ctrl or command +left
					break;
			case 38: // -1 week on ctrl or command +up
					if ( e.ctrlKey || e.metaKey ) {
						console.log("111 - ", e.ctrlKey,  e.metaKey )
						//$.datepicker._gotoToday( event.target );
					} else {
						console.log("222 - ", e.ctrlKey,  e.metaKey )
					}
					break;
			case 39: // +1 day on ctrl or command +right
				
				break;
			case 40: 
					break; // +1 week on ctrl or command +down
			default: 
				
				break;
			
		}

	}

	checkFocus = e => {

		if( e.type == "focus"  ){

			if( !this.tpItem.initBTPicker ){

				let relatedTarget = this.checkRelatedTarget(e.relatedTarget) || this.checkRelatedTarget( document.querySelector(".bTimepicker-wrap"));

				if( relatedTarget ){
					this.closeTimepicker(relatedTarget );
					document.body.removeEventListener("click", this.checkClick , {capture:true});
				}

				this.createTimepicker(null, e.timeStamp);
				document.body.addEventListener("click", this.checkClick, {capture:true});
			}
			//document.querySelector("#timeText3").textContent = " focus : " + this.tpItem.orderBTID;

		} else if( e.type == "focusout" ){
			console.log('focusout --- ', );

			let actived = false;
			let z = this.tpItem.BTElements;
			for( let key in z ){
				if( z[key].hasOwnProperty("activedMouseSubButton")  ){
					console.log("activedMouseSubButton - ", z[key].activedMouseSubButton );
					actived = z[key].activedMouseSubButton ;
					delete z[key].activedMouseSubButton;
				}
			}

			if( !actived ){ 

				//document.querySelector("#timeText5").textContent = " focusout :  " + e.relatedTarget ? e.relatedTarget.textContent : 'vvvv';

				if( e.relatedTarget && e.relatedTarget.classList.contains("btime-ctrl") ){

					//document.querySelector("#timeText5").textContent = " isMouse :  " + this.isMouse + " OS : " + this.checkBrowser();
					return;
				}

				let relatedTarget = this.checkRelatedTarget(e.relatedTarget)
									 || this.checkRelatedTarget( document.querySelector(".bTimepicker-wrap"));

				if( relatedTarget ){
					this.closeTimepicker(relatedTarget);
					document.body.removeEventListener("click", this.checkClick , {capture:true});
				}
			}

			//document.querySelector("#timeText4").textContent = " focusout : " + this.tpItem.orderBTID;

		} else if(e.type == "blur"){
			console.log('blur --- ',  );
		}
	}

	checkClick(e) {
		let node = e.target.closest(".bTimepicker-wrap");
		if( !node) {

			node = document.querySelector(".bTimepicker-wrap");
			let relatedTarget =  node ? document.querySelector(`[data-parent-order="${node.parentOrder}"]`) : null;

			if( relatedTarget && e.target !== relatedTarget ){
				document.body.removeChild( node ) ;
				relatedTarget.BTWrapper = null;
				relatedTarget.BTElements = {};
				relatedTarget.orderBTID = null;
				relatedTarget.initBTPicker = false;
			}
			//this.closeTimepicker(e.relatedTarget)
		}
	}

	checkRelatedTarget = ( a) => {
		if( a && a.orderBTID ) return a; 
		if( a && a.parentOrder ) return document.querySelector(`[data-parent-order="${a.parentOrder}"]`); 
		return null;
	}


	closeTimepicker = (zPicker) => {
		console.log("close timepicker - ", zPicker.orderBTID);
		
		let node = document.querySelector("#" + zPicker.orderBTID);
		document.body.removeChild( node ) ;

		zPicker.BTWrapper = null;
		zPicker.BTElements = {};
		zPicker.orderBTID = null;
		zPicker.initBTPicker = false;

	}

	createTimepicker = (args, timestamp = undefined) => {

		let zPicker = this.tpItem;

		zPicker.BTWrapper = document.createElement("div");
		zPicker.BTWrapper.setAttribute("aria-label", "Timepicker");
		zPicker.BTWrapper.setAttribute("class", "bTimepicker-wrap");
		zPicker.BTWrapper.parentOrder = "bt" + Math.floor(timestamp) ;
		document.body.appendChild(zPicker.BTWrapper);

		zPicker.dataset.parentOrder = zPicker.BTWrapper.parentOrder
		zPicker.orderBTID = zPicker.BTWrapper.parentOrder ;
		zPicker.initBTPicker = true;
		//zPicker.wrapper = this.wrapper;
		zPicker.BTWrapper.setAttribute("id", zPicker.orderBTID );

		//console.log("createTimepicker : ",window.pageYOffset, window.scrollY)
		
		zPicker.BTWrapper.style.cssText = `
			position: absolute;
			top : ${window.scrollY + zPicker.getBoundingClientRect().top + zPicker.getBoundingClientRect().height  }px;
			left : ${window.scrollX + zPicker.getBoundingClientRect().left }px;
			--maxItem : ${zPicker.initBTValues.maxItem};
		`;

		//zPicker.BTWrapper.addEventListener('mouseover', this.overOut(zPicker.BTWrapper));
		//zPicker.BTWrapper.addEventListener('mouseout', this.overOut(zPicker.BTWrapper));


		let z = zPicker.initBTValues;

		if( z.hours === 12 ){
			typeof z.ampm !== "boolean" ?  "" : z.ampm = ['오전', '오후'];
		} else if( z.hours === 24 ){

		}

		z.ampm ? this.makeClockItem('ampm') : '';
		z.hours ? this.makeClockItem('hours') : '';

		if( z.minutes && typeof z.minutes === "boolean" ) z.minutes = 1;
		z.minutes ? this.makeClockItem('minutes') : '';

		if( z.seconds && typeof z.seconds === "boolean" ) z.seconds = 1;
		z.seconds ? this.makeClockItem('seconds') : '';

		z.control ? this.initControl() : '';

		this.checkInitTime();
		this.render();

		console.log("create timepicker" )

	}

	overOut = (node) => {
		let selected = node;
		return e => {
			console.log("wrapper - over / out")
			if( selected !== e.target ){
				selected.classList.remove(this.onMouse);
				e.target.classList.add(this.onMouse);
				selected = e.target;
			}
		}
	}	

	scrollHandler = (a) => {
		let timer;
		let ele = a;
		return function(e) {   

			clearTimeout(timer);
			timer = setTimeout(() => {  
				
				let o = ele.zOptions;
				o.currentIdx = Math.round( ele.body.scrollTop / o.itemHeight);
				ele.body.scrollTop = o.itemHeight * o.currentIdx;
				o.dy = ele.body.scrollTop;
				this.setSelectedItem(o.key, o.tTarget, o.currentIdx + o.initIdx );
				o.time = this.tpItem.value;

				console.log('===stop scroll!===')
				//document.querySelector("#timeText").textContent = " now after stopping scroll : " + o.currentIdx;

				this.render();
			}, 300);
		}
	}	

	wheelHandlerForMac = (a) => {
		let timer;
		let ele = a;
		let opt = a.zOptions;
		return function(e) {
			//e.preventDefault();
			clearTimeout(timer);
			timer = setTimeout(() => { 
				e.deltaY > 0 ? opt.dy+=opt.itemHeight : opt.dy-=opt.itemHeight;

				if( opt.dy < 0 ) opt.dy = 0;
				else  if( opt.dy > opt.maxDy  )opt.dy = opt.maxDy;

				//console.log(e.type, opt.dy );
			}, 300);
		}
	}	

	wheelHandlerForWindow = (a) => {
		let timer;
		let ele = a;
		let opt = a.zOptions;
		return function(e) {
			//e.preventDefault();
			e.deltaY > 0 ? opt.dy+=opt.itemHeight : opt.dy-=opt.itemHeight;

			if( opt.dy < 0 ) opt.dy = 0;
			else  if( opt.dy > opt.maxDy  )opt.dy = opt.maxDy;

			ele.body.scrollTop = Math.abs(opt.dy);
		}
	}


	mousehandler(e){

		let opt = this.zOptions;
		
		if( e.button === 2 | e.which === 3  ){
			this.activedMouseSubButton = true;
		}
		
		switch( e.type ){
			case "click":
				if( !opt.moving ){
					opt.currentIdx = [...opt.tTarget.children].findIndex( ch => ch == e.target);
					//console.log("click : ", e.target, opt.currentIdx )
					this.body.scrollTop = opt.itemHeight * ( opt.currentIdx  - opt.initIdx );
					opt.moving = false;
				}
				break;
			case "mouseleave":
				opt.isClicked = false;
				opt.moving = false;
				break;
			case "mousedown":
				opt.y1 = e.pageY;
				opt.isClicked = true;
				opt.moving = false;
				break;
			case "mousemove":
				if( opt.isClicked ) { 
					opt.moving = true;
					opt.y2 = e.pageY;
					
					opt.dy += opt.y1 - opt.y2;

					if( opt.dy < 0 ) opt.dy = 0;
					else  if( opt.dy > opt.maxDy  ) opt.dy = opt.maxDy;

					//console.log("!!! - ", opt.dy)

					opt.y1 = opt.y2;
					this.body.scrollTop = Math.abs(opt.dy);
				}
				break;
			case "mouseup":
				opt.isClicked = false;
				opt.currentIdx = Math.round( this.body.scrollTop / opt.itemHeight);
				//this.body.scrollTop = opt.itemHeight * opt.currentIdx;
				break;
		}
		e.preventDefault();
		e.stopPropagation();
	}

	initControl = () => {
		let ctrl = document.createElement("div");
		ctrl.setAttribute("class", "ctrl");

		let cancel = document.createElement("button");
		cancel.setAttribute("type", "button"); 
		cancel.setAttribute("class", "btime-ctrl cancel");
		cancel.ariaLabel = "선택안함, cancel";
		cancel.addEventListener("click",  this.cancelTimepicker , { capture:true, once : true } );

		let ok = document.createElement("button");
		ok.setAttribute("type", "button");
		ok.setAttribute("class", "btime-ctrl ok");
		ok.ariaLabel = "선택함, ok";
		ok.addEventListener("click",  this.okTimepicker, {once : true }  );

		ctrl.appendChild(cancel);
		ctrl.appendChild(ok);

		this.tpItem.BTWrapper.appendChild(ctrl)
	}

	cancelTimepicker = e => {
		e.stopPropagation();
		console.log("------- cancel", this.tpItem.value)
		this.tpItem.value = "";
		this.closeTimepicker(this.tpItem );
	}

	okTimepicker = e => {
		e.stopPropagation();

		console.log("------- ok", this.tpItem.value);
		this.render();
		this.closeTimepicker(this.tpItem );

	}

	makeClockItem = (key) => {  
		this.tpItem.BTElements[key] = {};
		
		this.tpItem.BTElements[key].body = document.createElement("div");
		this.tpItem.BTElements[key].body.setAttribute("class", key + "-wrap");

		let ol = document.createElement("ol");
		ol.setAttribute("class", key);

		if( key === "ampm" ) {	
			this.tpItem.initBTValues[key].map( str => this.addItems(ol, str )  ); 
		} else if( key === "hours" )  {
			Array.from({ length: this.tpItem.initBTValues[key] }, (_, idx) => idx + 1 ).map( tNum => this.addItems(ol, tNum)  );
		} else {
			Array.from({ length: 60/this.tpItem.initBTValues[key] }, (_, idx) => idx * this.tpItem.initBTValues[key] ).map(tNum => this.addItems(ol, tNum)  );
		}
			
		this.addBlankItems(ol);// 위치를 맞추기 위한 빈태그 삽입

		this.tpItem.BTElements[key].body.appendChild(ol);
		this.tpItem.BTWrapper.appendChild(this.tpItem.BTElements[key].body)

		this.tpItem.BTElements[key].zOptions = this.initDefaultOptions(key,this.tpItem.BTElements[key].body);
		this.tpItem.zSelectedTime[key] = '';

		this.attachEventListener(this.tpItem.BTElements[key]);

		this.setSelectedItem(key, this.tpItem.BTElements[key].zOptions.tTarget, this.tpItem.BTElements[key].zOptions.initIdx);

	}

	attachEventListener = (node ) => {
		["mousedown","mouseup","mousemove" ,"mouseleave", "scroll", "wheel", "click" ].forEach( eType => {
			if( eType === "scroll"){
				node.body.addEventListener(eType, this.scrollHandler(node).bind(this) ); //, { passive: true }
			} else if ( eType === "wheel") {

				console.log('window - ', this.userOS, this.isMouse)

				if( this.userOS === "mac" && this.isMouse ){
					node.body.addEventListener(eType, this.wheelHandlerForMac(node).bind(this) );
				} else{
					//document.querySelector("#timeText6").textContent = " isMouse :  " + this.isMouse + " OS : " + this.checkBrowser();
					node.body.addEventListener(eType, this.wheelHandlerForWindow(node).bind(this) );
				}

			} else {
				node.body.addEventListener(eType, this.mousehandler.bind(node));
			}
		});
	}

	initDefaultOptions = (key,o) => {
		return {
			key : key,
			tTarget : o.firstElementChild,
			itemHeight : o.firstElementChild.offsetHeight / o.firstElementChild.children.length,
			isClicked : false,
			time : this.tpItem.initBTValues.time ? this.tpItem.initBTValues.time : '',
			y1 : 0,
			y2 : 0,
			dy : 0, // 움직인 거리
			moving : false,
			maxDy : Math.abs(o.offsetHeight - o.firstElementChild.offsetHeight), // 최대 이동거리
			initIdx : parseInt( this.tpItem.initBTValues.maxItem / 2),
			currentIdx : parseInt( this.tpItem.initBTValues.maxItem / 2),// 현재 아이템
			lastIdx : o.firstElementChild.children.length - parseInt( this.tpItem.initBTValues.maxItem / 2) - 1,// 마지막 아이템
		}
	}

	initDefaultValues = (args) => {
		if(!args) return;
		for( let key in args ){
			this.tpItem.initBTValues[key] = args[key];
		}
	}

	checkInitTime = () => {

		if( !this.tpItem.value && !this.tpItem.initBTValues.time ) {
			console.log("'value no no no no")	
			return;}

		let zPicker = this.tpItem;
		let tempTime = zPicker.value ? zPicker.value : zPicker.initBTValues.time;
	
		let num =0;
		let o ;
		for (const [key, value] of Object.entries(zPicker.zSelectedTime)) {
			o = zPicker.BTElements[key].zOptions;
			zPicker.zSelectedTime[key] = tempTime.replace(/\s/gi, "").split(':')[num++];

			o.currentIdx = [...o.tTarget.children].findIndex( ch => ch.textContent === zPicker.zSelectedTime[key] );

			o.currentIdx > -1 ? this.setSelectedItem(key, o.tTarget, o.currentIdx ) : this.alertMsg('설정한 시간을 다시 확인해 주세요');

			zPicker.BTElements[key].body.scrollTop = o.itemHeight * (o.currentIdx  - o.initIdx);
			o.dy = zPicker.BTElements[key].body.scrollTop;
		}

		this.tpItem.initBTValues.time = null;

	}

	setSelectedItem = (key, tTarget, curIdx) => {
		//console.log("setSelectedItem - ", tTarget, curIdx);

		[...tTarget.children].forEach( z => {
			z.classList.remove("selected");
			z.ariaSelected = false;
		});
		tTarget.children[curIdx].classList.add("selected");
		tTarget.children[curIdx].ariaSelected = true;

		this.tpItem.zSelectedTime[key] = tTarget.children[curIdx].textContent;
	}

	render = () => { 
		if( this.tpItem.zSelectedTime ){
			//console.log("render time - ", this.tpItem.zSelectedTime)
		}
		this.tpItem.value = Object.entries(this.tpItem.zSelectedTime).map( ([key, value]) =>  value ).join(" : ")
	}

	copyTouch({ identifier, pageX, pageY, screenX, screenY }) {
		return { identifier, pageX, pageY, screenX, screenY };
	}

	static init(obj=null, args = null){
		if(!obj) return false; 
		return new this(obj, args);
	}

	get fgfgfg(){
		return "test......"
	}

	//시, 분 추가
	addItems = (obj, num ) => {
		let li = document.createElement("li");
		li.setAttribute("class", "item");
		li.ariaSelected = false;

		if( typeof num === "string" ) li.textContent = num;
		else li.textContent = num < 10 ? "0"+ num : num;

		obj.appendChild(li);
	}

	// 위치를 맞추기 위한 빈태그 삽입
	addBlankItems = (obj) => {
		Array.from({ length: this.tpItem.initBTValues.maxItem/2 }, (_, idx) => idx ).map( () => {
			let li1 = document.createElement("li");
			li1.setAttribute("class", "item blank");
			li1.ariaSelected = false;
			let li2 = document.createElement("li");
			li2.setAttribute("class", "item blank");
			li2.ariaSelected = false;
			obj.prepend(li1);
			obj.appendChild(li2);
		});
	}

	findElement = (tar, findElem) => {
		while( tar !== findElem )
		{
			tar = tar.parentNode;
			if( tar === document ){
				return null;
			}
		}
		return tar;
	}

	alertMsg = (str = null) => {
		this.msgWrap.textContent = str ? str : "alert msg";

		document.body.appendChild(this.msgWrap);

		this.msgWrap.style.cssText = `
			position: absolute;
			top : ${window.scrollY + this.tpItem.getBoundingClientRect().top   }px;
			left : ${window.scrollX + this.tpItem.getBoundingClientRect().left }px;
		`;

	}
}







