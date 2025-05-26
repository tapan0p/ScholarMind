from langchain_core.tools import tool
import arxiv
from typing import List, Dict

@tool
def search_arxiv(query:str,max_results:int=3) -> List[Dict]:
    """Search research papers on Arxiv based on a given query"""
    print("Tool called = search")
    client = arxiv.Client()
    search = arxiv.Search(
        query = query,
        max_results=max_results,
        sort_by = arxiv.SortCriterion.Relevance
    )

    try:
        results = client.results(search)
        papers = []
        for result in results:
            papers.append({
                "title": result.title,
                "abstract": result.summary,
                "authors": [author.name for author in result.authors],
                "published": result.published.strftime("%Y-%m-%d"),
                "url": result.pdf_url
            })
        return papers
    except Exception as e:
        return f"Error searching Arxiv: {e}"