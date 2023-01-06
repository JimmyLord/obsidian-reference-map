import { ReferenceMapSettings, SemanticPaper } from "src/types";
import React from "react";
import { RootPaperCard } from "./RootPaperCard";
import { MarkdownView } from "obsidian";
import { LoadingPuff } from "./LoadingPuff";
// import { SORTING_METADATA } from "src/constants";

export const ReferenceMapList = (props: {
	settings: ReferenceMapSettings;
	papers: SemanticPaper[];
	references: SemanticPaper[][];
	citations: SemanticPaper[][];
	view: MarkdownView | null;
}) => {
	const [isLoaded, setLoaded] = React.useState(false);
	React.useEffect(() => {
		setLoaded(false);
		if (props.papers.length > 0) {
			setLoaded(true);
		}
	}, [props.papers.length, props.view?.file.name]);

	if (!props.view) {
		return (
			<div className="orm-no-content">
				Active view is not a markdown file
			</div>
		);
	} else if (!isLoaded) {
		return (
			<div className="orm-no-content">
				{props.settings.loadingPuff && <LoadingPuff />}
				{!props.settings.loadingPuff && "Reference Map View"}
			</div>
		);
	}

	// if (props.settings.enableSorting) {
	// 	let index = 0;
	// 	if (props.settings.sortingMetadata === SORTING_METADATA[0]) index = 0;
	// 	if (props.settings.sortingMetadata === SORTING_METADATA[1]) index = 1;
	// 	if (props.settings.sortingMetadata === SORTING_METADATA[2]) index = 2;
	// 	if (props.settings.sortingMetadata === SORTING_METADATA[3]) index = 3;

	// 	props.papers = props.papers.sort((a, b) => {
	// 		return b[SORTING_METADATA[index]] - a[SORTING_METADATA[index]];
	// 	});
	// 	if (props.settings.sortingOrder === "asc") {
	// 		props.papers = props.papers.reverse();
	// 	}
	// }
	const paperList = props.papers.map((paper, index) => {
		return (
			<RootPaperCard
				// file name in the key is to force a re-render when the file changes ..
				//.. or rerender if paper id is present in multiple files
				settings={props.settings}
				key={paper.paperId + index + props.view?.file.name}
				rootPaper={paper}
				references={props.references[index]}
				citations={props.citations[index]}
			/>
		);
	});

	return <div className="orm-reference-map">{paperList}</div>;
};
