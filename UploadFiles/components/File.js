
let iconImgDelete = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed" aria-hidden="true"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>;

const File = (props) => {	

	return <>
		<figure className="item" data-id={props.id}>
			<img src={props.file.src} alt="이미지" />
			<figcaption className="figcaption">
				<span className="title">{props.file.name}</span>
				<span>{checksize(Number(props.file.size))}</span>
				<div className="ctrl">
					<button type="button" data-action="delete" className="btn" title="이미지 삭제하기" aria-label="이미지 삭제하기" onClick={() => props.deleteFile(props.id)}>
						{iconImgDelete}
					</button>
				</div>	
			</figcaption>
		</figure>
	</>;
};
export default File;


function checksize(number) {
	if (number < 1024) {
		return number + "bytes";
	} else if (number >= 1024 && number < 1048576) {
		return (number / 1024).toFixed(1) + "KB";
	} else if (number >= 1048576) {
		return (number / 1048576).toFixed(1) + "MB";
	}
}