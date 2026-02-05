import React, { useMemo, useState } from "react";
import "./YourJourneyPanelStyles.scss";
import logo from "../../assets/logoNew.png";
import collections from "../../assets/collections.png";
import articles from "../../assets/articles.png";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../Icon/Icon";
import { FaFire } from "react-icons/fa";

type StatsRange = "total" | "thisWeek" | "lastWeek";

const KIPS = [
  { title: "Meditations", activity: "Meditations", image: logo },
  { title: "Articles", activity: "Articles", image: articles },
  { title: "Collection Meditations", activity: "Collections", image: collections },
];

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfWeek = (date: Date) => {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const YourJourneyPanel = () => {
  const { currentUser } = useAuth();
  const [statsToShow, setStatsToShow] = useState(4);
  const [statsRange, setStatsRange] = useState<StatsRange>("total");

  if (!currentUser || !currentUser?.isGod) return null;

  const activity = currentUser?.activity || { meditations: [], collections: [] };
  const allMeds = [
    ...(activity?.meditations?.map((med) => ({ ...med, type: "Meditations" })) ?? []),
    ...(activity?.collections?.map((med) => ({ ...med, type: "Collections" })) ?? []),
  ];

  // ---------------- FILTER ONLY ITEMS WITH VALID TIMESTAMP ----------------
  const allMedsWithTimestamp = useMemo(() => allMeds.filter((med) => med.timeStamp), [allMeds]);

  // ---------------- RANGE FILTERING (STATS ONLY) ----------------
  const filteredMeds = useMemo(() => {
    if (statsRange === "total") return allMedsWithTimestamp;

    const now = new Date();
    let start: Date;
    let end: Date;

    if (statsRange === "thisWeek") {
      start = startOfWeek(now);
      end = endOfWeek(now);
    } else {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      start = startOfWeek(lastWeek);
      end = endOfWeek(lastWeek);
    }

    return allMedsWithTimestamp.filter((med) => {
      const t = new Date(med.timeStamp);
      return t >= start && t <= end;
    });
  }, [allMedsWithTimestamp, statsRange]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds} minutes`;
  };

  // ---------------- STATS (RANGE-AWARE) ----------------
  const meditationCategories = filteredMeds.map((med) => med.category);
  const uniqueCatsToList = [...new Set(meditationCategories)];

  const getCatPercentage = (cat: string) => {
    if (!meditationCategories.length) return "0.0";
    const count = meditationCategories.filter((c) => c === cat).length;
    return ((count / meditationCategories.length) * 100).toFixed(1);
  };

  type CategoryStat = {
    category: string;
    count: number;
    percentage: number;
  };

  const mostUsed = useMemo<CategoryStat | null>(() => {
    if (!meditationCategories.length) return null;

    const counts: Record<string, number> = {};
    meditationCategories.forEach((c) => (counts[c] = (counts[c] || 0) + 1));

    const [category, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    return {
      category,
      count,
      percentage: Number(((count / meditationCategories.length) * 100).toFixed(1)),
    };
  }, [meditationCategories]);

  // ---------------- STREAK (ALL-TIME) ----------------
  const getUniqueDays = (meds) =>
    [...new Set(meds.filter((m) => m.timeStamp).map((m) => startOfDay(m.timeStamp).getTime()))].sort((a, b) => b - a);

  const calculateStreak = (meds) => {
    const days = getUniqueDays(meds);
    if (!days.length) return 0;

    const ONE_DAY = 86400000;
    const today = startOfDay(new Date()).getTime();
    const yesterday = today - ONE_DAY;

    if (days[0] !== yesterday && days[1] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      if (days[i - 1] - days[i] === ONE_DAY) streak++;
      else break;
    }
    return streak;
  };

  const hasLastWeekData = useMemo(() => {
    const now = new Date();
    const lastWeekStart = startOfWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    const lastWeekEnd = endOfWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));

    return allMedsWithTimestamp.some((med) => {
      const t = new Date(med.timeStamp).getTime();
      return t >= lastWeekStart.getTime() && t <= lastWeekEnd.getTime();
    });
  }, [allMedsWithTimestamp]);

  const timeSlotArray = hasLastWeekData ? ["thisWeek", "lastWeek", "total"] : ["thisWeek", "total"];

  // ---------------- RANGE-AWARE KPIs ----------------

  const getActivityCount = (name: string) =>
    activity?.[name?.toLowerCase() as keyof typeof activity]
      ?.filter((item) => item.timeStamp)
      ?.filter((item) => {
        if (statsRange === "total") return true;
        // console.log(name, item);
        const now = new Date();
        let start: Date;
        let end: Date;

        if (statsRange === "thisWeek") {
          start = startOfWeek(now);
          end = endOfWeek(now);
        } else {
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          start = startOfWeek(lastWeek);
          end = endOfWeek(lastWeek);
        }

        const t = new Date(item.timeStamp);
        return t >= start && t <= end;
      })?.length || 0;

  const timeListenedRange = useMemo(
    () => filteredMeds.reduce((acc, med) => acc + (med.duration || 0), 0),
    [filteredMeds],
  );

  const streakRange = useMemo(() => calculateStreak(filteredMeds), [filteredMeds]);
  // ---------------- RENDER ----------------
  return (
    <div className='journey'>
      <h2 className='journey__title'>Your RESZEN8 Journey</h2>
      <p className='journey__sub'>A gentle look at your recent practice</p>
      {/* ---------- RANGE SWITCH ---------- */}
      <div className='journey__range-switch'>
        {timeSlotArray.map((r) => (
          <button
            key={r}
            className={statsRange === r ? "journey-cta journey-cta--active" : "journey-cta"}
            onClick={() => setStatsRange(r as StatsRange)}
          >
            {r === "thisWeek" ? "This Week" : r === "lastWeek" ? "Last Week" : "Total Journey"}
          </button>
        ))}
      </div>
      <div className='journey__kpi-grid'>
        {KIPS.map((box) => (
          <div className='feature-card static-med journey__kpi' key={box.title}>
            {box.image && <img className='journey__kpi-image' src={box.image} />}
            <h3>{box.title}</h3>
            <span className='journey__kpi-count'>{getActivityCount(box.activity)}</span>
          </div>
        ))}
      </div>

      <div className='journey__overview-row'>
        <div className='journey__time__container'>
          <h3>Total Listening Time</h3>
          <span className='journey__time'>{formatTime(timeListenedRange)}</span>
        </div>

        {streakRange > 0 && (
          <div className='journey__time__container'>
            <h3>Listening Streak</h3>
            <div className=' journey__streak-text'>
              <FaFire color='orange' size={40} />
              <span>{streakRange} days!</span>
            </div>
          </div>
        )}
      </div>

      <div className='journey__stats-container'>
        <div className='journey__stats-column journey__stats-column--primary'>
          <h3>Primary Focus</h3>

          {mostUsed && (
            <>
              <Icon large type={mostUsed.category} />
              <h4 className='journey__stats-column--primary-title'>{mostUsed.category}</h4>
              <h5 className='journey__stats-column--primary-percent'>{mostUsed.percentage}% of sessions</h5>
              <h5 className='journey__stats-column--primary-listens'>{mostUsed.count} listens</h5>
            </>
          )}
        </div>

        <div className='journey__stats-column'>
          <h3>Focus Breakdown</h3>
          <ul className='journey__stats-list'>
            {uniqueCatsToList
              .map((c) => ({ title: c, percentage: getCatPercentage(c) }))
              .sort((a, b) => b.percentage - a.percentage)
              .slice(0, statsToShow)
              .map((cat) => (
                <li key={cat.title}>
                  <div className='journey__stats-list-item'>
                    <Icon type={cat.title} />
                    <span>{cat.title}</span>
                    <span>{cat.percentage}%</span>
                  </div>
                  <div className='journey__progress-container'>
                    <div
                      className='journey__progress'
                      style={{ width: `${cat.percentage}%`, transition: "width 500ms ease" }}
                    />
                  </div>
                </li>
              ))}
          </ul>

          <button
            className='journey__stats-cta'
            onClick={() => setStatsToShow(statsToShow === 4 ? uniqueCatsToList.length : 4)}
          >
            {statsToShow !== 4 ? "show less" : "show more"}
          </button>
        </div>
      </div>
      <p className='journey__sub'>All figures represent your chosen timeframe.</p>
    </div>
  );
};

export default YourJourneyPanel;
