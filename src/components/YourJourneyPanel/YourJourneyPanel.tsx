import React, { useMemo, useState } from "react";
import "./YourJourneyPanelStyles.scss";
import logo from "../../assets/logoNew.png";
import collections from "../../assets/collections.png";
import articles from "../../assets/articles.png";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../Icon/Icon";
import { FaFire } from "react-icons/fa";
import TabsGroup from "../TabsGroup/TabsGroup";

type StatsRange = "today" | "yesterday" | "thisWeek" | "lastWeek" | "total";

const KIPS = [
  { title: "All Meditations", activity: "Meditations", image: logo },
  { title: "Collection Meditations", activity: "Collections", image: collections },
  { title: "Articles", activity: "Articles", image: articles },
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
  const [statsRange, setStatsRange] = useState<StatsRange>("thisWeek");

  const activity = currentUser?.activity || { meditations: [], collections: [], articles: [] };
  const allMeds = [
    ...(activity?.meditations?.map((med) => ({ ...med, type: "Meditations" })) ?? []),
    ...(activity?.collections?.map((med) => ({ ...med, type: "Collections" })) ?? []),
  ];

  const allActivity = [...allMeds, ...(activity?.articles?.map((item) => ({ ...item, type: "Articles" })) ?? [])];

  // ---------------- FILTER ONLY ITEMS WITH VALID TIMESTAMP ----------------
  const allMedsWithTimestamp = useMemo(() => allMeds.filter((med) => med.timeStamp), [allMeds]);

  const getDateRange = (range: StatsRange) => {
    const now = new Date();

    switch (range) {
      case "today": {
        const start = startOfDay(now);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }

      case "yesterday": {
        const start = startOfDay(new Date(now.getTime() - 86400000));
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }

      case "thisWeek":
        return { start: startOfWeek(now), end: endOfWeek(now) };

      case "lastWeek": {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        return {
          start: startOfWeek(lastWeek),
          end: endOfWeek(lastWeek),
        };
      }

      case "total":
      default:
        return null;
    }
  };

  const filteredMeds = useMemo(() => {
    if (statsRange === "total") return allMedsWithTimestamp;

    const range = getDateRange(statsRange);
    if (!range) return allMedsWithTimestamp;

    return allMedsWithTimestamp.filter((med) => {
      const t = new Date(med.timeStamp);
      return t >= range.start && t <= range.end;
    });
  }, [allMedsWithTimestamp, statsRange]);

  const formatTime = (time: number) => {
    const secondsInMinute = 60;
    const secondsInHour = 60 * 60;
    const secondsInDay = 24 * 60 * 60;

    if (time >= secondsInDay) {
      const days = Math.floor(time / secondsInDay);
      const hours = Math.floor((time % secondsInDay) / secondsInHour);
      const minutes = Math.floor((time % secondsInHour) / secondsInMinute);
      return `${days}d ${hours}h ${minutes}m`;
    } else if (time >= secondsInHour) {
      const hours = Math.floor(time / secondsInHour);
      const minutes = Math.floor((time % secondsInHour) / secondsInMinute);
      const seconds = Math.floor(time % 60);
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      const minutes = Math.floor(time / secondsInMinute);
      const seconds = Math.floor(time % 60);
      return `${minutes}m ${seconds}s`;
    }
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

  const ALL_TIME_SLOTS: StatsRange[] = ["today", "yesterday", "thisWeek", "lastWeek", "total"];

  const hasDataForRange = (range: StatsRange) => {
    if (range === "total") return allMedsWithTimestamp.length > 0;

    const r = getDateRange(range);
    if (!r) return false;

    return allMedsWithTimestamp.some((med) => {
      const t = new Date(med.timeStamp);
      return t >= r.start && t <= r.end;
    });
  };

  const timeSlotArray = useMemo(
    () =>
      ALL_TIME_SLOTS.filter((range) => {
        if (range === "yesterday" || range === "lastWeek") {
          return hasDataForRange(range);
        }
        return true;
      }),
    [allMedsWithTimestamp],
  );

  const getActivityCount = (name: string) => {
    let items = activity?.[name.toLowerCase() as keyof typeof activity] ?? [];

    if (name === "Meditations") {
      items = allMeds;
    }

    if (statsRange === "total") {
      return items.filter((item) => item.timeStamp).length;
    }

    const range = getDateRange(statsRange);
    if (!range) return 0;

    return items.filter((item) => {
      if (!item.timeStamp) return false;
      const t = new Date(item.timeStamp);
      return t >= range.start && t <= range.end;
    }).length;
  };

  const timeListenedRange = useMemo(
    () => filteredMeds.reduce((acc, med) => acc + (med.duration || 0), 0),
    [filteredMeds],
  );

  const streakRange = useMemo(() => calculateStreak(allMeds), [allMeds]);
  // ---------------- RENDER ----------------

  if (!currentUser || !allActivity?.length) return null;

  return (
    <div className='journey'>
      <h2 className='journey__title'>Your RESZEN8 Journey</h2>
      <p className='journey__sub'>A gentle look at your recent practice</p>
      {streakRange > 0 && (
        <div className='journey__time__container'>
          <div className=' journey__streak-text'>
            <FaFire color='orange' size={40} />

            <h3>Listening Streak - </h3>

            <span>{streakRange} days!</span>
          </div>
          <p className='journey__sub'>never resets until you miss a day!</p>
        </div>
      )}
      {/* ---------- RANGE SWITCH ---------- */}
      <div className='journey__range-switch'>
        <TabsGroup
          activeItem={statsRange}
          items={timeSlotArray}
          onClick={(r: StatsRange) => setStatsRange(r as StatsRange)}
        />
      </div>
      <div className='journey__kpi-grid'>
        {KIPS.map((box) => {
          const count = getActivityCount(box.activity);
          return (
            <div className='feature-card static-med journey__kpi' key={box.title}>
              {box.image && <img className='journey__kpi-image' src={box.image} />}
              <h3>{box.title}</h3>
              <span key={count} className='journey__kpi-count'>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      <div className='journey__stats-container'>
        <div className='journey__stats-column journey__stats-column--primary'>
          <h3>Primary Focus</h3>

          {mostUsed && (
            <>
              <Icon key={mostUsed.category} large type={mostUsed.category} />
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
                    <div className='journey__stats-list-item-text'>
                      <Icon type={cat.title} />
                      <span>{cat.title}</span>
                    </div>
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

          {uniqueCatsToList?.length > 4 && (
            <button
              className='journey__stats-cta'
              onClick={() => setStatsToShow(statsToShow === 4 ? uniqueCatsToList.length : 4)}
            >
              {statsToShow !== 4 ? "show less" : "show more"}
            </button>
          )}
        </div>
      </div>
      <p className='journey__sub'>All figures represent your chosen timeframe.</p>
      <div className='journey__time__container'>
        <h3>Total Listening Time</h3>
        <p className='journey__sub'>for chosen timeframe</p>
        <span className='journey__time'>{formatTime(timeListenedRange)}</span>
      </div>
    </div>
  );
};

export default YourJourneyPanel;
