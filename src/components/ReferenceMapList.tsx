import { citeKeyLibrary, IndexPaper, ReferenceMapSettings } from "src/types";
import React, { useEffect, useState } from "react";
import { IndexPaperCard } from "./IndexPaperCard";
import { MarkdownView } from "obsidian";
import { ViewManager } from "src/viewManager";
import { getCiteKeyIds, getCiteKeys, getPaperIds, removeNullReferences, setCiteKeyId } from "src/utils";
import { LoadingPuff } from "./LoadingPuff";


export const ReferenceMapList = (props: {
	settings: ReferenceMapSettings;
	view: MarkdownView | null;
	viewManager: ViewManager;
	frontMatterString: string;
	fileNameString: string;
	citeKeyData: citeKeyLibrary[] | null;
	adapter: string;
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
			let paperCiteId = paperId
			if (props.settings.searchCiteKey && props.citeKeyData && props.settings.findZoteroCiteKeyFromID) {
				paperCiteId = setCiteKeyId(paperId, props.citeKeyData, props.adapter)

			}
			if (paper !== null) rootPapers.push({ id: paperCiteId, paper: paper });
			if (rootPapers.length > 0) setPapers(removeNullReferences(rootPapers));
		});

		if (props.settings.searchCiteKey && props.citeKeyData) {
			const citeKeys = getCiteKeys(fileContent);
			const citeKeyMap = getCiteKeyIds(citeKeys, props.citeKeyData, props.adapter);
			if (citeKeyMap) {
				citeKeyMap.forEach(async (item) => {
					const paper = await props.viewManager.getIndexPaper(item.paperId);
					if (paper !== null) rootPapers.push({ id: item.citeKey, paper: paper });
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

		if (rootPapers.length > 0) {
			setPapers(removeNullReferences(rootPapers));
		} else {
			setPapers([]);
		}

		setIsLoading(false);
	};

	if (!props.view) {
		return (
			<div className="orm-no-content">
				<div>
					Reference Map View
					<div className="orm-no-content-subtext">
						No Active Markdown File.
						<br />
						Click on a file to view its references.
					</div>
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
						<IndexPaperCard
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
					<div className="orm-no-content-subtext">
						No Valid References Found.
					</div>
				</div>
			</div>
		);
	}
};
