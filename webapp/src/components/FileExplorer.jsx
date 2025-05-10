const FileExplorer = ({ researchPapers,setPaper }) => {
  const handleSelectPaper = (paper) => {
    setPaper(paper)
    console.log(paper)
  };
  return (
    <div className="w-64 bg-slate-700 text-white p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Research Papers</h2>
      <div className="space-y-2">
        {researchPapers?.map((paper, index) => (
          <div key={index} className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500" onClick={()=>handleSelectPaper(paper)}>
            <h3 className="font-medium text-sm">{paper.title}</h3>
            <p className="text-xs text-slate-300">{paper.authors}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer