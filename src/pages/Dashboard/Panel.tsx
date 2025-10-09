import React, { useRef, useEffect } from "react";
import Icon from "@mdi/react";

import { FaArrowRight } from "react-icons/fa";
import AudioPlayer from "../../components/AudioPlayer/AudioController";
import { Link } from "react-router-dom";
import immersiveLogo from "../../assets/icons/immersiveAudio.png";
import Popup from "../../components/Popup/Popup";
const Panel = ({
  dataKey,
  itemToRemove,
  notification,
  data,
  activeTab,
  destination,
  showPopup,
  setShowPopup,
  setItemToRemove,
  setActiveTab,
  handleDeleteBespokeMed,
}: {
  dataKey: string;
  itemToRemove: any;
  notification: { message: string };
  activeTab: string;
  destination: string;
  data: any;
  showPopup: boolean;
  setShowPopup: (value: boolean) => void;
  setItemToRemove: (item: any) => void;
  setActiveTab: (tab: string) => void;
  handleDeleteBespokeMed: (itemId: string, shouldDelete: boolean) => void;
  handleRemoveItem: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelIds = ["introMeditations", "myMeds", "meditations", "publications", "deleted"];

  const mapKeyToTitle = {
    myMeds: "My Bespoke Meditations",
    introMeditations: "Introduction Meditations",
    meditations: "Library Meditations",
    publications: "My Articles",
    deleted: "Recently Deleted",
  };

  return (
    <div id={`panel-${dataKey}`} className='dashboard-content dashboard__content-panel'>
      {notification.show && (
        <div className='fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'>
          {notification.message}
        </div>
      )}
      <div ref={containerRef} style={{ position: "absolute", top: 0, left: 0 }} />
      {data?.length === 0 && dataKey !== "deleted" && dataKey !== "myMeds" ? (
        <div className='text-center py-10'>
          <p className='text-gray-400 mb-4'>You haven't added any {dataKey} to your dashboard yet.</p>
          <Link to={`/${destination}`} className='text-orange-400 hover:text-orange-300 font-medium'>
            Browse{" "}
            {dataKey === "publications" ? "Articles" : dataKey.charAt(0).toUpperCase() + dataKey.slice(1, -1) + "s"} →
          </Link>
        </div>
      ) : (
        <>
          <h3 className='panel-title'>{mapKeyToTitle[dataKey]}</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {data
              ?.filter((item) => {
                if (dataKey === "deleted") return true;
                return !item.willDelete;
              })
              .map((item, i) => {
                const keyId = `${dataKey}-${item?.uid ?? item?.id ?? i}`;
                function isToday(timestamp: number) {
                  const today = new Date();
                  const dateToCheck = new Date(timestamp);

                  return (
                    today.getFullYear() === dateToCheck.getFullYear() &&
                    today.getMonth() === dateToCheck.getMonth() &&
                    today.getDate() === dateToCheck.getDate()
                  );
                }
                function getDeletionCountdown(timestampSeconds: number) {
                  const now = new Date();
                  const deleteDate = new Date(timestampSeconds * 1000); // convert seconds → ms

                  if (deleteDate <= now) return "Deleted";

                  const diffMs = deleteDate.getTime() - now.getTime();

                  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
                  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
                  const seconds = Math.floor((diffMs / 1000) % 60);

                  if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
                  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
                  if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} left`;
                  return `${seconds} sec${seconds !== 1 ? "s" : ""} left`;
                }

                return (
                  <div key={keyId} className='feature-card publication__card'>
                    <div className='publications__card-content dashboard__card-inner'>
                      <div>
                        <h3>{item.title}</h3>
                        <div>
                          {/* {item.createdAt && (
                  <span className='flex items-center'>{new Date(item.createdAt).toLocaleDateString()}</span>
                )} */}
                          {item.style && <p>{item.style}</p>}
                          {item.willDelete && <p>This item will be deleted: {getDeletionCountdown(item.willDelete)}</p>}
                          {item.createdAt && !item.staticMed && dataKey !== "publications" && (
                            <span className='dashboard__date'>
                              Created: {isToday(item.createdAt) ? "Today" : new Date(item.createdAt).toDateString()}{" "}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.immersive && (
                        <div className='dashboard__immersive-icon'>
                          <img className='immersive-icon' src={immersiveLogo} />
                        </div>
                      )}

                      <div className='dashboard-buttons'>
                        {item.audioUrl && dataKey !== "publications" && (
                          <div className='dashboard__audio'>
                            <AudioPlayer isImmersive={item.immersive} audioUrl={item.audioUrl} />
                          </div>
                        )}
                        {dataKey === "publications" && (
                          <Link className='read-link' to={`/articles/${item.title}`}>
                            <span className='read-link-text'> Read</span>
                            <FaArrowRight />{" "}
                          </Link>
                        )}
                        <div>
                          {dataKey === "deleted" && (
                            <button
                              onClick={() => {
                                handleDeleteBespokeMed(item.uid, false);
                              }}
                              className='dashboard-button dashboard__remove-cta'
                            >
                              Recover
                            </button>
                          )}
                          {dataKey !== "myMeds" && dataKey !== "introMeditations" && dataKey !== "deleted" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setItemToRemove(item);
                                setShowPopup(item.uid);
                              }}
                              className='dashboard-button dashboard__remove-cta'
                            >
                              Remove
                            </button>
                          )}
                          {dataKey === "myMeds" && (
                            <button
                              onClick={() => {
                                setItemToRemove(item);
                                setShowPopup(item.uid);
                              }}
                              className='dashboard-button dashboard__remove-cta'
                            >
                              Delete
                            </button>
                          )}
                          <Popup
                            showClose={false}
                            fitContent
                            show={showPopup === item.uid}
                            onClose={() => setShowPopup("")}
                          >
                            {dataKey !== "myMeds" ? (
                              <>
                                <h3>Remove from your Journey</h3>
                                <p>
                                  "{itemToRemove?.title}" will be removed from your Journey, but still be available in
                                  the {dataKey === "publications" ? "the Articles page" : "the Meditation Library"}
                                </p>
                                <button onClick={() => setShowPopup(false)} className='dashboard-button'>
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    handleRemoveItem(itemToRemove, dataKey as keyof typeof savedItems, i);
                                    setShowPopup(false);
                                  }}
                                  className='dashboard-button'
                                >
                                  Okay
                                </button>
                              </>
                            ) : (
                              <>
                                <h3>Delete Bespoke Meditation</h3>
                                <p>
                                  "{itemToRemove?.title}" will be removed from your dashboard, and will be available to
                                  recover, in the Recently Deleted tab for 14 days
                                </p>
                                <button onClick={() => setShowPopup(false)} className='dashboard-button'>
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteBespokeMed(itemToRemove.uid, true);
                                    // handleRemoveItem(item, activeTab as keyof typeof savedItems, i);
                                    setShowPopup(false);
                                  }}
                                  className='dashboard-button'
                                >
                                  Okay
                                </button>
                              </>
                            )}
                          </Popup>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default Panel;
