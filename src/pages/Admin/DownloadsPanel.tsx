import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMeditations, getStaticMeditations } from "../../store/contentSelectors";
import { Meditation } from "../../models";
import { AWS_DB_ENDPOINT } from "../../constants";
import { getStaticMeditations as fetchStaticMeditations } from "../../store/apiUtils";
import { setStaticMeditations } from "../../store/contentSlice";
import { marked } from "marked";
import Popup from "../../components/Popup/Popup";
import AudioController from "../../components/AudioPlayer/AudioController";
import Checkbox from "../../components/Checkbox/Checkbox";
import ThreeDotsLoader from "../../components/ThreeDotsLoads";
const DownloadsPanel = () => {
  const meds = useSelector(getStaticMeditations);
  const myMeds = useSelector(getMeditations);
  const dispatch = useDispatch();
  const allMeds = [...myMeds, ...meds];
  const [updating, setUpdating] = useState("");
  const [script, setScript] = useState("");

  const [visibleMeds, setVisibleMeds] = useState([]);
  const [value, setValue] = useState("");

  const handleSearch = (e) => {
    const query = e?.target?.value?.toLowerCase();
    setValue(query);
  };

  useEffect(() => {
    if (!value || !value.length) return setVisibleMeds([]);
    setVisibleMeds([...allMeds].filter((m) => m?.title?.toLowerCase().includes(value)));
  }, [value, meds]);

  const toggleHide = async (med: Meditation) => {
    if (!med.staticMed) return;
    setUpdating(med.uid);
    await fetch(`${AWS_DB_ENDPOINT}/updateStaticMed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: med.uid, hidden: !med.hidden }),
    }).then(() => {
      fetchStaticMeditations().then((data) => {
        if (data) {
          dispatch(setStaticMeditations(data));
          setUpdating("");
        }
      });
    });
  };

  const handleDelete = async (med: Meditation) => {
    if (!med.staticMed) return;

    const id = med.uid;
    setUpdating(id);

    await fetch(`${AWS_DB_ENDPOINT}/deleteStaticMed`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: id }),
    }).then(() => {
      fetchStaticMeditations().then((data) => {
        if (data) {
          dispatch(setStaticMeditations(data));
          setUpdating("");
        }
      });
    });
  };

  const verifyM = async (item: Meditation) => {
    if (!item.staticMed) return;

    setUpdating(item.uid);

    await fetch(`${AWS_DB_ENDPOINT}/updateStaticMed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: item.uid, verified: !item.verified }),
    }).then(() => {
      fetchStaticMeditations().then((data) => {
        if (data) {
          dispatch(setStaticMeditations(data));
          setUpdating("");
        }
      });
    });
  };

  return (
    <div className='downloads-panel'>
      <h2>Downloads Panel</h2>
      <p>Total Static Meds: {meds?.length}</p>
      <input onChange={handleSearch} value={value} />

      <table>
        <tbody>
          {visibleMeds?.map((med: Meditation) => {
            return (
              <tr style={{ height: 190, width: 150 }} key={med.uid}>
                <td style={{ width: 200 }}>
                  {updating === med.uid ? <ThreeDotsLoader /> : <AudioController small audioUrl={med.audioUrl} />}
                </td>
                <td className='downloads-panel-title'>{med.title}</td>
                <td>type: {med.staticMed ? "Static" : "Bespoke"}</td>

                <td>
                  <span style={{ marginRight: 8 }}> Hidden:</span>
                  <Checkbox checked={med.hidden} onChange={() => toggleHide(med)} />
                </td>
                <td>
                  <span style={{ marginRight: 8 }}> Verified:</span>
                  <Checkbox checked={med.verified} onChange={() => verifyM(med)} />
                </td>
                <td>
                  <button onClick={() => setScript(med.content)}>Show Script</button>
                </td>
                <td>
                  <a target='_blank' href={med.audioUrl} download>
                    download
                  </a>
                </td>

                <td>
                  <button style={{ background: "red" }} onClick={() => handleDelete(med)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Popup show={!!script} onClose={() => setScript("")} showClose>
        {script && <div>{script}</div>}
      </Popup>
    </div>
  );
};

export default DownloadsPanel;
