/* export */ class UploadFiles {
    constructor(args) {
        this.handler = this.initializeDefaults(args);

        // 선택된 파일을 저장하기 위해 클래스 속성을 사용합니다.
        this.selectedFiles = [];
        // 파일 객체를 키로 사용하여 객체 URL을 저장하기 위한 맵을 사용합니다.
        this.objectURLs = new Map();

		this.deleteAllButton = null; // 전체삭제버튼

        console.log("files constructor");
        this.create(args);
    }

	// 기본 속성 설정
    initializeDefaults(args) {
        return {
            loadBtn: args.loadBtn ? args.loadBtn : null,
            fileBox: args.fileBox ? args.fileBox : null,
            multiple: args.multiple !== undefined ? args.multiple : true, // multiple 값 재정의 허용
			maxFiles : args.maxFiles ? args.maxFiles : 0,
            onPreviewMarkUp: args.onPreviewMarkUp ? args.onPreviewMarkUp : null,
        };
    }

    create = (args) => {
        if (!this.handler.loadBtn || !this.handler.fileBox) {
            console.log("파일 업로드 버튼 loadBtn이나 파일 상자 fileBox 가 없습니다");
            return;
        }

		if( this.handler.multiple ) {
			this.setDeleteAllFiles();
			this.setCountFiles();
		}

        this.handler.loadBtn.addEventListener("click", e => {
            let clickBtn = e.target.closest("button");
            if (!clickBtn) return;

            // 파일 입력 요소 생성 및 처리
            const newFile = document.createElement("input");
            newFile.type = 'file';
            newFile.name = clickBtn.dataset.name;
            newFile.multiple = this.handler.multiple;
            newFile.addEventListener("change", e => {
                const files = e.target.files;

                if (files.length > 0) this.processFiles(files);
                else console.log('선택된 파일이 없습니다.');
                
                newFile.remove();
            }, { once: true }); // 입력 요소의 change 리스너에 once: true를 사용합니다.

            // 파일 선택 대화상자를 트리거합니다.
            newFile.click();
        });

		// dragover 이벤트: 드래그된 요소가 유효한 드롭 대상으로 있을 때 발생
		this.handler.fileBox.parentNode.addEventListener('dragover', (e) => {
			e.preventDefault(); // 기본 동작 방지 (파일 열기 등)
			e.stopPropagation(); // 이벤트 전파 중지
			this.handler.fileBox.classList.add('drag-over'); // 드래그 오버 상태 표시
		});

		// dragleave 이벤트: 드래그된 요소가 유효한 드롭 대상을 벗어날 때 발생
		this.handler.fileBox.parentNode.addEventListener('dragleave', (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.handler.fileBox.classList.remove('drag-over'); // 드래그 오버 상태 제거
		});

			// dragend 이벤트: 드래그 작업이 끝났을 때 (성공이든 취소든) 발생 - 불필요할 수 있지만, dragleave 누락 시 정리 용도로 사용 가능
		this.handler.fileBox.parentNode.addEventListener('dragend', (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.handler.fileBox.classList.remove('drag-over');
		});


		// drop 이벤트: 드래그된 요소가 드롭 대상에 놓였을 때 발생
		this.handler.fileBox.parentNode.addEventListener('drop', (e) => {
			e.preventDefault(); 
			e.stopPropagation();
			this.handler.fileBox.classList.remove('drag-over'); // 드래그 오버 상태 제거

			const files = e.dataTransfer.files; // 드롭된 파일 목록

			if (files.length > 0) {
				this.processFiles(files);
			} else {
				console.log('드롭된 파일이 없습니다.');
			}
		});
    }

	processFiles(files) {
        //console.log('Processing files:', files);

        // 최대 파일 개수 초과 체크
        if (this.handler.maxFiles > 0 && this.selectedFiles.length + files.length > this.handler.maxFiles) {
             this.onMssage(`허용 파일 개수를 초과했습니다. 
				업로드 가능한 전체 파일 수는 ${this.handler.maxFiles}개 입니다. 
				현재 ${this.selectedFiles.length + files.length}개 선택됨.`);
             // 너무 많은 파일을 드롭했을 경우, 처리를 중단하거나 일부만 추가할 수 있습니다.
             // 여기서는 메시지만 띄우고, 아래 루프에서 maxFiles 제한을 따릅니다.
        }


        for (let i = 0; i < files.length; i++) {
             // 현재 선택된 파일 + 새로 추가될 파일의 총 개수가 maxFiles를 초과하는 경우 추가 중단
             if (this.handler.maxFiles > 0 && this.selectedFiles.length >= this.handler.maxFiles) {
				console.log("Max files reached, stopping processing.");
				// 추가 메시지를 띄울 수도 있습니다.
				// this.onMssage(`최대 파일 개수(${this.handler.maxFiles}개)에 도달하여 추가 파일을 처리하지 못했습니다.`);
				break; // 루프 중단
             }

            const file = files[i];

            // 파일을 클래스의 선택된 파일 배열에 추가합니다.
            this.selectedFiles.push(file);

            let item = document.createElement("figure");
            item.setAttribute("class", "item");
            item.dataset.fileName = file.name;

            // 객체 URL을 생성하고 저장합니다.
            const objectURL = window.URL.createObjectURL(file);
            this.objectURLs.set(file, objectURL); // 파일 객체를 키로 URL을 저장합니다.

            // 미리보기 함수 실행
            if (typeof this.handler.onPreviewMarkUp === "function") {
                this.handler.onPreviewMarkUp(item, file, objectURL);
            }

            // 하나씩 삭제
            const deleteButton = this.CreateElement({tag : "button", "type" : "button", "class": "btn delete-one", "aria-label" : "삭제"});
            deleteButton.addEventListener("click", () =>  this.deleteFile(file, item) );

            const ctrl = this.CreateElement({tag : "div", class : 'ctrl'});
            ctrl.appendChild(deleteButton);

            item.appendChild(ctrl); //삭제 버튼
            this.handler.fileBox.appendChild(item);

            if( this.handler.multiple ) this.checkSelectedFiles(); // 파일 개수 업데이트
            if( this.handler.multiple ) this.checkDeleteAllButton(); // 전체삭제 버튼 상태 업데이트

        }

        //console.log('현재 선택 파일:', this.selectedFiles);

    }

    // 현재 선택된 파일을 가져오는 메서드
    getSelectedFiles() {
        return this.selectedFiles;
    }

	setDeleteAllFiles(){
		this.deleteAllButton = this.CreateElement({
			tag : "button", 
			"type" : "button", 
			"class": "btn delete-all off", 
			"aria-label" : "전체삭제",
			"textContent" : "전체삭제"
		});
		this.deleteAllButton.addEventListener("click", () =>  this.deleteAllFiles() );
		this.handler.loadBtn.parentNode.appendChild(this.deleteAllButton);
	}

    deleteAllFiles() {
        this.objectURLs.forEach(url => window.URL.revokeObjectURL(url));
        this.objectURLs.clear(); // Map 비우기

        // 선택된 파일 배열 비우기
        this.selectedFiles = [];

        // fileBox의 모든 자식 요소 제거
        while (this.handler.fileBox.firstChild) {
            this.handler.fileBox.removeChild(this.handler.fileBox.firstChild);
        }
		
		this.checkDeleteAllButton();
		this.checkSelectedFiles();
    }

	setCountFiles(){
		let tag1 = `<span class="guide-count" aria-label="선택한 파일 개수">0</span>개<span class='guide-text' aria-label="업로드 가능한 파일 개수">${this.handler.maxFiles}</span>개`;
		let tag2 = `<span class='guide-text'>선택한 파일 수</span><span class="guide-count">0</span>개`;

		const count = this.CreateElement({
			tag : "div", 
			"class": "file-count", 
			innerHTML : this.handler.maxFiles > 0 ? tag1 : tag2
		});
		this.handler.loadBtn.parentNode.appendChild(count);
	}



	checkSelectedFiles(){
		const countElement = this.handler.loadBtn.parentNode.querySelector(".guide-count");
        if(countElement) {
            countElement.textContent = this.selectedFiles.length;
        }
	}

	checkDeleteAllButton(){
		if( this.selectedFiles.length === 0 ) {
			this.deleteAllButton.classList.add("off");
		} else {
			this.deleteAllButton.classList.remove("off");
		}
	}

	// 파일 하나를 삭제하는 내부 로직 메서드
	deleteFile(fileToDelete, itemToRemove) {
		console.log("파일 삭제 로직 실행:", fileToDelete, itemToRemove  );

		// 객체 URL 해지 (저장된 URL이 있는 경우)
		const objectURL = this.objectURLs.get(fileToDelete);
		if (objectURL) {
			window.URL.revokeObjectURL(objectURL);
			this.objectURLs.delete(fileToDelete); // Map에서도 제거
		}

		const index = this.selectedFiles.indexOf(fileToDelete);
		if (index > -1) this.selectedFiles.splice(index, 1);

		// 해당 항목(item) 제거
		if (itemToRemove && itemToRemove.parentNode === this.handler.fileBox) {
			this.handler.fileBox.removeChild(itemToRemove);
		} else {
			console.warn("fileBox에 삭제하려는 파일이 없습니다.", itemToRemove);
		}
		
		if( this.handler.multiple )  this.checkSelectedFiles();

		this.checkDeleteAllButton();

	}

	CreateElement(attributes = {}) { // { tag : "div", class: "sample", ...} 
		if (!attributes.hasOwnProperty("tag")) return alert("태그 이름이 없습니다");

		let tag = document.createElement(attributes.tag);
		for (let prop in attributes) {
			if (prop == "tag") continue;
			if( prop == "textContent" || prop == "innerHTML" ){
				tag[prop] = attributes[prop];
				continue;
			}
			tag.setAttribute(prop, attributes[prop]);
		}
		return tag;
	}

	onMssage(msg){
		console.log(msg);
		const ALERT_DURATION = 3000; // 상수로 쓸때 대문자로 많이 쓴다고 함

		let msgWrap = this.CreateElement({ tag : "div", "class": "upload-alert-msg" });
		msgWrap.textContent = msg ? msg : "alert msg";
		msgWrap.style.whiteSpace = 'pre-line';

		this.handler.loadBtn.parentNode.appendChild(msgWrap);

		let msgDeleteBtn = this.CreateElement({ tag : "button", type:"button", "class": "upload-msg-close-btn" });

		msgDeleteBtn.addEventListener("click", () => { msgWrap.remove() } , { once : true})
		msgWrap.appendChild(msgDeleteBtn);

		// setTimeout(() => { 
		// 	if (msgWrap && msgWrap.parentNode) msgWrap.remove();  
		// }, ALERT_DURATION);
	}

}

// 전역 init 함수를 사용하려는 경우, 먼저 window.bUploadFiles를 정의합니다.
window.bUploadFiles = window.bUploadFiles || {};
window.bUploadFiles.init = function(args) {
    return new UploadFiles(args);
};

