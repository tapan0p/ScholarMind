import axios from "axios";

const FileExplorer = ({ researchPapers, setPaper }) => {
  const handleSelectPaper = async (paper) => {
    const response = await axios.post("http://localhost:8000/api/paper", { paper });
    if (response.status !== 200) {
      console.error("Error fetching paper:", response.statusText);
      return;
    }
    setPaper(paper);
  };

  return (
    <div className="w-auto bg-slate-800 text-white p-4 overflow-y-auto h-full shadow-md border-r border-slate-700">
      <h2 className="text-lg font-semibold mb-4">Research Papers</h2>
      <div className="space-y-2">
        {researchPapers?.map((paper, index) => (
          <div
            key={index}
            onClick={() => handleSelectPaper(paper)}
            className="group cursor-pointer p-3 rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-[.98] transition-all duration-150 ease-in-out shadow hover:shadow-md"
          >
            <h3 className="font-medium text-sm group-hover:text-white">{paper.title}</h3>
            <p className="text-xs text-slate-400 group-hover:text-slate-200">{paper.authors}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
