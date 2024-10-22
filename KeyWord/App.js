import React, { useState } from "react";

import WordForm from './components/WordForm';
import Keyword from './components/Keyword';

import './styles/bootstrap.css';
import './styles/reset.css';
import './styles/AddKeyword.css'


function App(props) {

	const [ words, setWords] = useState(props.wordList);

	let addKeyword = (word) => {
		console.log("yes keyword")
		let newWord = { id: "word-"+ words.length, name:word  };
		setWords( [...words, newWord] )
	}
	
	let deleteKeyword = (id) => {
		let remaingWords = words.filter( word => word.id !== id );
		setWords( remaingWords );
	}

	let wordList = words.length? words.map( word => (
		<Keyword 
			name={word.name} 
			id={word.id} 
			key={word.id} 
			deleteKeyword={deleteKeyword}
		/>
	)) : <li className="no-item">추천 키워드가 없습니다</li>;

	return <>

		<div className="bmh-example">
			<WordForm addKeyword={addKeyword} />
			<div className="hashList">
				<span>키워드</span><span className="num">{words.length}</span>
				<ul>
					{wordList} 
				</ul>
			</div>
		</div>
			
	</>;
}

export default App;
