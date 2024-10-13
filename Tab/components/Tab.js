
import { useState } from 'react';
import styles from '../styles/Tab.module.css';

function TabNav(props) {

	console.log("TabNav - ",props, props.activeTab )

	const menus = props.menus.map( menu => 
		<button key={menu.id} 
			type='button' 
			data-tab-id={menu.id} 
			className={ `${styles.btn} ${Number(props.activeTab) === menu.id ? styles.on : ""} ` } 
			onClick={e=>{
				props.onCurrentTab(e.target.dataset.tabId)
			}}>
			{menu.title}
		</button>
	);
	// {cx("menu")}
	return <>
		<nav className={styles.menu}>
			{menus}
		</nav>
	</>;
}

function TabContents(props){

	//const contents
	console.log("tab contents - ", props.activeTab)

	const cnts = props.menus.map( menu => 
		<div key={menu.id} 
			data-tab-id={menu.id} 
			className={ `${styles.contents} ${Number(props.activeTab) === menu.id ? styles.on : ""} ` }>
			{menu.title} + tab-contents
		</div>
	);

	return <>
		{cnts}
	</>;
}

function Tab(props) {
	const [activeTab, setActiveTab] = useState("1");

	return <>
		<TabNav 
			menus={props.menus} 
			activeTab={activeTab} 
			onCurrentTab={ curTab =>  setActiveTab(curTab) }>
		</TabNav>

		<TabContents 
			menus={props.menus} 
			activeTab={activeTab}>
		</TabContents>
		</>;
}

export default Tab;
