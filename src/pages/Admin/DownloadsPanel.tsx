import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getMeditations, getStaticMeditations } from "../../store/contentSelectors";
const DownloadsPanel = () => {
  const meds = useSelector(getStaticMeditations);
  const myMeds = useSelector(getMeditations);

  const allMeds = [...myMeds, ...meds];

  const [visibleMeds, setVisibleMeds] = useState([]);
  const [value, setValue] = useState("");

  const handleSearch = (e) => {
    const query = e?.target?.value?.toLowerCase();
    setValue(query);
    setVisibleMeds([...allMeds].filter((m) => m?.title?.toLowerCase().includes(query)));
  };

  useEffect(() => {
    if (!value || !value.length) setVisibleMeds([]);
  }, [value]);

  return (
    <div className='downloads-panel'>
      <h2>Downloads Panel</h2>
      <input onChange={handleSearch} value={value} />
      <table>
        <tbody>
          {visibleMeds?.map((med) => (
            <tr>
              <td className='downloads-panel-title'>{med.title}</td>
              <td>
                <a target='_blank' href={med.audioUrl} download>
                  download
                </a>
              </td>
              <td>type: {med.staticMed ? "Static" : "Bespoke"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DownloadsPanel;
