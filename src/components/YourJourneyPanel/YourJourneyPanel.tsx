import React, { useMemo, useState } from "react";
import "./YourJourneyPanelStyles.scss";
import logo from "../../assets/logoNew.png";
import collections from "../../assets/collections.png";
import articles from "../../assets/articles.png";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../Icon/Icon";
import { FaFire } from "react-icons/fa";

const KIPS = [
  { title: "Meditations", activity: "Meditations", image: logo },
  { title: "Articles", activity: "Articles", image: articles },
  { title: "Collection Meditations", activity: "Collections", image: collections },
];

const YourJourneyPanel = () => {
  const { currentUser } = useAuth();
  const [statsToShow, setStatsToShow] = useState(4);
  if (!currentUser || !currentUser?.isGod) return null;

  const activity = currentUser?.activity || { meditations: [], collections: [] };

  const allMeds = [...(activity?.meditations ?? []), ...(activity?.collections ?? [])];
  const getActivityCount = (name: string) => activity?.[name?.toLowerCase() as keyof typeof activity]?.length || 0;

  const meditationCategories = allMeds?.map((med) => med.category);

  const uniqueCatsToList = [...new Set(meditationCategories)];

  const getCatPercentage = (cat: string) => {
    const total = [...meditationCategories]?.length;
    const totalForCat = meditationCategories?.filter((c) => c === cat)?.length;
    return Number((totalForCat / total) * 100).toFixed(1);
  };

  const timeListened = allMeds.reduce((acc, med) => {
    if (!med.duration) return acc;

    return acc + med.duration;
  }, 0);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds} minutes`;
  };

  type CategoryStat = {
    category: string;
    count: number;
    percentage: number;
  };

  const getMostUsedCategoryStats = (items: string[]): CategoryStat | null => {
    if (!items.length) return null;

    const total = items.length;

    const counts = items.reduce<Record<string, number>>((acc, category) => {
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    let topCategory = "";
    let topCount = 0;

    for (const [category, count] of Object.entries(counts)) {
      if (count > topCount) {
        topCategory = category;
        topCount = count;
      }
    }

    return {
      category: topCategory,
      count: topCount,
      percentage: Number(((topCount / total) * 100).toFixed(1)),
    };
  };

  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getUniqueDays = (allMeds) => {
    const days = allMeds.filter((med) => med.timeStamp).map((a) => startOfDay(a.timeStamp).getTime());
    return Array.from(new Set(days)).sort((a, b) => b - a);
  };

  const calculateStreak = (allMeds) => {
    const days = getUniqueDays(allMeds);
    if (days.length === 0) return 0;

    const ONE_DAY = 24 * 60 * 60 * 1000;

    const today = startOfDay(new Date()).getTime();
    const yesterday = today - ONE_DAY;

    // If they weren’t active yesterday, streak is 0
    if (days[0] !== yesterday && days[1] !== yesterday) return 0;

    let streak = 1;

    for (let i = 1; i < days.length; i++) {
      const diff = days[i - 1] - days[i];

      if (diff === ONE_DAY) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = useMemo(() => calculateStreak(allMeds), [allMeds]);

  return (
    <div className='journey'>
      <h2 className='journey__title'>Your RESZEN8 Journey</h2>
      <p className='journey__sub'>A gentle look at your recent practice</p>
      <div className='journey__kpi-grid'>
        {KIPS.map((box) => (
          <div className='feature-card static-med journey__kpi'>
            {box.image && <img className='journey__kpi-image' src={box.image} />}
            <h3>{box.title}</h3>
            <span className='journey__kpi-count'>{getActivityCount(box.activity)}</span>
            {/* <p className='journey__kpi-comparison'>+4 from last week</p> */}
          </div>
        ))}
      </div>
      <div className='journey__overview-row'>
        <div className='journey__time__container'>
          <h3>Total Listening Time</h3>
          <span className='journey__time'>{formatTime(timeListened)}</span>
        </div>

        {streak && (
          <div className='journey__time__container journey__streak'>
            <h3>Listening Streak</h3>
            <div className='journey__streak-text'>
              <FaFire color='orange' size={40} />
              <span>{streak} days!</span>
            </div>
          </div>
        )}
      </div>

      <div className='journey__stats-header'>
        <h3>Most Used Focus</h3>
        {/* <p className='journey__sub'>Based on your selected time range</p> */}
      </div>

      <div className='journey__stats-container'>
        <div className='journey__stats-column journey__stats-column--primary'>
          <h3>Primary Focus</h3>
          <Icon large type={getMostUsedCategoryStats(meditationCategories).category} />

          <h4 className='journey__stats-column--primary-title'>
            {getMostUsedCategoryStats(meditationCategories).category}
          </h4>
          <h5 className='journey__stats-column--primary-percent'>
            {getMostUsedCategoryStats(meditationCategories).percentage}% of sessions
          </h5>
          <h5 className='journey__stats-column--primary-listens'>
            {getMostUsedCategoryStats(meditationCategories).count} listens
          </h5>
        </div>
        <div className='journey__stats-column'>
          <h3>Focus Breakdown</h3>
          <ul className='journey__stats-list'>
            {uniqueCatsToList
              ?.map((c) => ({ title: c, percentage: getCatPercentage(c) }))
              .sort((a, b) => b.percentage - a.percentage)
              .slice(0, statsToShow)

              ?.map((cat) => (
                <li>
                  <div className='journey__stats-list-item'>
                    <div className='journey__stats-list-item-text'>
                      <Icon type={cat.title} />
                      <span> {cat.title}</span>
                    </div>
                    <span>{cat.percentage}%</span>
                  </div>
                  <div className='journey__progress-container'>
                    <div className='journey__progress' style={{ width: `${cat.percentage}%` }} />
                  </div>
                </li>
              ))}
          </ul>
          <button
            className='journey__stats-cta'
            onClick={() => setStatsToShow(statsToShow === 4 ? uniqueCatsToList.length - 1 : 4)}
          >
            {statsToShow !== 4 ? "show less" : "show more"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default YourJourneyPanel;
