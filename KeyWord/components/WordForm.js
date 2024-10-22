import React, { useState } from "react";

const WordForm = (props) => {

	const [value, setValue] = useState('');
	const [ errType, setErrType] = useState('');

	let handleChange = e => {
		if( e.target.value !== "" )  setErrType('');
		setValue(e.target.value);
	};
	let handleSubmit = e => {
		e.preventDefault();

		if( !value ){			
			setErrType(<small className="no-word">키워드를 입력하세요</small>);		
		} else {
			props.addKeyword(value);
			setValue("");
		}
	}

	return (
		
		<form className="add-hash" onSubmit={handleSubmit}>
			<div className="item">
				{errType}
				<label>
					<input 
						type="text" 
						value={value} 
						onChange={handleChange} 
						placeholder="추천 키워드를 입력하세요" />
				</label>
				<button type="submit" className="btn btn-icon" title="추천키워드 추가하기" aria-label="추천키워드 추가하기">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>
				</button>
			</div>
		</form>
		
	);
};
export default WordForm;
