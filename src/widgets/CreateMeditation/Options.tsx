import React from "react";
import { FaLock } from "react-icons/fa";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
import { profanityFilter } from "../../pages/MeditationGenerator/helper";
import VoiceOptions from "../../components/VoiceOptions/VoiceOptions";
import Accordion from "../../components/Accordion/Accordion";

const Options = ({
  title,
  titleRef,
  currentUser,
  setTitle,
  immersive,
  setImmersive,
  duration,
  setDuration,
  includedMeds,
  medTokens,
  allowedValues,
  voiceOptionsArray,
  voice,
  setVoice,
}) => {
  const getSizeIsLocked = (value: string): boolean => {
    if (value === "Recharge" && !includedMeds && !medTokens) return true;
    if ((value === "Refresh" || value === "Relax") && !medTokens) return true;
    if (value === "Refresh" && medTokens < 2) return true;
    if (value === "Relax" && medTokens < 3) return true;

    return false;
  };

  const renderContent = () => (
    <>
      <div className='create-widget__columns'>
        <div className={currentUser ? "form-group" : "form-group form-group--locked"}>
          {!currentUser && (
            <span className='form-group-lock'>
              <FaLock color='orange' />
            </span>
          )}
          <label className='create-widget__label'>Name your meditation</label>
          {profanityFilter(title) && (
            <p className='ai-meditation-generator__warning'>Title must not contain profanities</p>
          )}
          <input ref={titleRef} value={title} placeholder='Enter a title' onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className={currentUser ? "form-group " : "form-group form-group--locked"}>
          {!currentUser && (
            <span className='form-group-lock'>
              <FaLock color='orange' />
            </span>
          )}
          <label className='create-widget__label'>With Immersive Sound? </label>
          {/* <span className='create-widget__credit'>Voice only = 2 meditation tokens, Immersive = 3. </span> */}
          <ToggleSwitch checked={immersive} onChange={setImmersive} />
        </div>
      </div>
      <div className='create-widget__columns'>
        <div className={currentUser ? "form-group" : "form-group form-group--locked "}>
          {!currentUser && (
            <span className='form-group-lock'>
              <FaLock color='orange' />
            </span>
          )}
          <label className='create-widget__label' htmlFor='duration'>
            Select a Size
          </label>
          <div className='create-widget__size-select'>
            <VoiceOptions
              useLabelForActive
              selectedId={duration === "Recharge" ? "Short" : duration === "Refresh" ? "Med" : "Long"}
              onSelect={(value) => setDuration(value.id)}
              options={allowedValues.map((value) => ({
                locked: getSizeIsLocked(value),
                id: value,
                label: value === "Recharge" ? "Short" : value === "Refresh" ? "Med" : "Long",
              }))}
            />
            {/* <small className='create-widget-disclaimer'>
                      Short meditations will deduct from your included meditations, and thereafter from any extra tokens
                      you may have purchased.
                    </small>
                    <small className='create-widget-disclaimer'>
                      When using tokens: Short:1 token, Medium: 2 and Long: 3
                    </small> */}
          </div>
        </div>
        <div>
          {duration !== "Relax" ? (
            <div
              className={currentUser ? "form-group form-group-block" : "form-group form-group--locked form-group-block"}
            >
              {!currentUser && (
                <span className='form-group-lock'>
                  <FaLock color='orange' />
                </span>
              )}
              <label className='create-widget__label'>Select a Voice </label>
              <VoiceOptions
                selectedId={voice.id}
                onSelect={setVoice}
                options={
                  duration !== "Relax" ? voiceOptionsArray : voiceOptionsArray.filter((item) => item.label === "Willow")
                }
              />
            </div>
          ) : (
            <div className='form-group form-group-block'>
              <label>Voice: Willow </label>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div>{!currentUser ? <Accordion header='Advanced Options'>{renderContent()}</Accordion> : renderContent()}</div>
  );
};

export default Options;
