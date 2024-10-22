
const Keyword = (props) => {
	return <>
		<li data-id={props.id}>
			<button type="button" aria-label="추천키워드삭제하기" title="추천키워드삭제하기" onClick={ () => props.deleteKeyword(props.id) }></button>
			{props.name}
		</li>
	</>;
};
export default Keyword;
