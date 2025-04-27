/* export */ class UploadFiles {
    constructor(args) {
        this.handler = this.initializeDefaults(args);

        this.selectedFiles = [];
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
            multiple: args.multiple !== undefined ? args.multiple : true, 
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
            }, { once: true });  

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

			// dragend 이벤트: 드래그 작업이 끝났을 때 (성공이든 취소든) 발생 
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

        if (this.handler.maxFiles > 0 && this.selectedFiles.length + files.length > this.handler.maxFiles) {
             this.onMssage(`허용 파일 개수를 초과했습니다. 
				업로드 가능한 전체 파일 수는 ${this.handler.maxFiles}개 입니다. 
				현재 ${this.selectedFiles.length + files.length}개 선택됨.`);
        }


        for (let i = 0; i < files.length; i++) {

             if (this.handler.maxFiles > 0 && this.selectedFiles.length >= this.handler.maxFiles)  break;

            const file = files[i];
            this.selectedFiles.push(file);

            let item = document.createElement("figure");
            item.setAttribute("class", "item");
            item.dataset.fileName = file.name;

            // url 만듦
            const objectURL = window.URL.createObjectURL(file);
            this.objectURLs.set(file, objectURL); 

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

    // 현재 선택된 파일 확인
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

	//한번에 삭제
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

	// 하나씩 삭제
	deleteFile(fileToDelete, itemToRemove) {
		console.log("파일 삭제 로직 실행:", fileToDelete, itemToRemove  );

		// URL 해지 
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
		const ALERT_DURATION = 3000; 

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

window.bUploadFiles = window.bUploadFiles || {};
window.bUploadFiles.init = function(args) {
    return new UploadFiles(args);
};

