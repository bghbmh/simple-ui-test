import React from "react";
import UploadFiles from './components/UploadFiles';


import './styles/bootstrap.css';
import './styles/reset.css';

const json = [
	{
		id: "file-0", 
		name : "test111.png",
		size:9999999,
		type:"image/png",
		src: "https://github.githubassets.com/assets/hero-desktop-a38b0fd77b6c.webp" ,
		lastModified : 1718802520190
	},
	{
		id: "file-1",
		name : "test33333.png",
		size:111111,
		type:"image/png", 
		src: "https://githubuniverse.com/visual.webp" ,
		lastModified : 1718802520190
	}
];


function App(props) {
	return <>

		<div className="bmh-example">

			<UploadFiles fileList={json}/>

		</div>
			
	</>;
}

export default App;

