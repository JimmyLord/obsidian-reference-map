import { CslJson, IndexPaper, ReferenceMapSettings } from "src/types";
import React, { useEffect, useState } from "react";
import { RootPaperCard } from "./RootPaperCard";
import { MarkdownView } from "obsidian";
import { ViewManager } from "src/viewManager";
import { getCiteKeyIds, getCiteKeys, getPaperIds, removeNullReferences } from "src/utils";
import { LoadingPuff } from "./LoadingPuff";


export const ReferenceMapList = (props: {
	settings: ReferenceMapSettings;
	view: MarkdownView | null;
	viewManager: ViewManager;
	frontMatterString: string;
	fileNameString: string;
	citeKeyData: CslJson[] | null;
}) => {
	const [papers, setPapers] = useState<IndexPaper[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (props.view) processPapers(props.view);
	}, [props.view?.data, props.frontMatterString, props.fileNameString]);

	useEffect(() => {
		setIsLoading(true);
	}, [props.view?.file.basename]);

	const processPapers = async (currentView: MarkdownView) => {
		const rootPapers: IndexPaper[] = [];
		const fileContent = await app.vault.cachedRead(currentView.file);
		const paperIds = getPaperIds(fileContent);
		paperIds.forEach(async (paperId) => {
			const paper = await props.viewManager.getIndexPaper(paperId);
			if (paper) rootPapers.push({ id: paperId, paper: paper });
			if (rootPapers.length > 0) setPapers(removeNullReferences(rootPapers));
		});

		if (props.settings.searchCiteKey && props.citeKeyData) {
			const citeKeys = getCiteKeys(fileContent);
			const citeKeyMap = getCiteKeyIds(citeKeys, props.citeKeyData);
			if (citeKeyMap) {
				citeKeyMap.forEach(async (item) => {
					const paper = await props.viewManager.getIndexPaper(item.paperId);
					if (paper) rootPapers.push({ id: item.citeKey, paper: paper });
					if (rootPapers.length > 0) setPapers(removeNullReferences(rootPapers));
				});
			}
		}
		if (props.settings.searchTitle && props.fileNameString) {
			const titleSearchPapers = await props.viewManager.searchRootPapers(
				props.fileNameString,
				[0, props.settings.searchLimit]
			);
			titleSearchPapers.forEach((paper) => {
				rootPapers.push({ id: paper.paperId, paper: paper });
			});
		}
		if (props.settings.searchFrontMatter && props.frontMatterString) {
			const frontMatterPapers = await props.viewManager.searchRootPapers(
				props.frontMatterString,
				[0, props.settings.searchFrontMatterLimit]
			);
			frontMatterPapers.forEach((paper) => {
				rootPapers.push({ id: paper.paperId, paper: paper });
			});
		}

		if (rootPapers.length > 0) setPapers(removeNullReferences(rootPapers));

		setIsLoading(false);
	};

	if (!props.view) {
		return (
			<div className="orm-no-content">
				<div>
					Reference Map View
					<br />
					No Active Markdown File
				</div>
			</div>
		);
	} else if (isLoading) {
		return (
			<div className="orm-no-content">
				<div>
					Reference Map View
					<LoadingPuff />
				</div>
			</div>
		);
	} else if (papers.length > 0) {
		return (
			<div className="orm-reference-map">
				{papers.map((paper, index) => {
					return (
						<RootPaperCard
							settings={props.settings}
							key={paper.paper.paperId + index + props.view?.file.basename}
							rootPaper={paper}
							viewManager={props.viewManager}
						/>
					);
				})}
			</div>
		);
	} else {
		return (
			<div className="orm-no-content">
				<div>
					Reference Map View
					<br />
					No References Found
				</div>
			</div>
		);
	}
};
