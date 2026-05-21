import { useEffect, useState, useRef } from "react";

const avatarOptions = [
  "😊",
  "😎",
  "🌟",
  "🦄",
  "🌈",
  "🎭",
  "🌸",
  "⚡",
  "🎨",
  "🎵",
  "🚀",
  "🌺",
];

export default function Settings({ isOpen, onClose }) {
  const [nickname, setNickname] = useState(
    localStorage.getItem("userNickname") || "",
  );
  const [avatar, setAvatar] = useState(
    localStorage.getItem("userAvatar") || "😊",
  );
  const [showAvatars, setShowAvatars] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(
    localStorage.getItem("animationsEnabled") !== "false",
  );

  const [moodCount, setMoodCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [assessmentCount, setAssessmentCount] = useState(0);

  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    document.body.style.overflow = "hidden";
    updateCounts();
    if (containerRef.current) containerRef.current.focus();

    const escHandler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", escHandler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", escHandler);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    localStorage.setItem("animationsEnabled", animationsEnabled);
  }, [animationsEnabled]);

  const updateCounts = () => {
    let moodData = [];
    let journalData = [];
    let assessmentResults = {};
    try {
      moodData = JSON.parse(localStorage.getItem("moodData") || "[]") || [];
    } catch (e) {
      moodData = [];
    }
    try {
      journalData = JSON.parse(localStorage.getItem("journalEntries") || "[]") || [];
    } catch (e) {
      journalData = [];
    }
    try {
      assessmentResults = JSON.parse(localStorage.getItem("assessmentResults") || "{}") || {};
    } catch (e) {
      assessmentResults = {};
    }

    const totalAssessments = Object.values(assessmentResults).reduce(
      (acc, val) => acc + (Array.isArray(val) ? val.length : 0),
      0,
    );

    setMoodCount(Array.isArray(moodData) ? moodData.length : 0);
    setJournalCount(Array.isArray(journalData) ? journalData.length : 0);
    setAssessmentCount(totalAssessments);
  };

  const handleSaveNickname = () => {
    localStorage.setItem("userNickname", nickname);
    alert("Nickname saved 😊");
  };

  const handleChangeAvatar = (newAvatar) => {
    setAvatar(newAvatar);
    localStorage.setItem("userAvatar", newAvatar);
    setShowAvatars(false);
    alert("Avatar updated 🎨");
  };

  const handleExportData = () => {
    const dataToExport = {
      nickname,
      avatar,
      moodData: JSON.parse(localStorage.getItem("moodData") || "[]"),
      journalEntries: JSON.parse(
        localStorage.getItem("journalEntries") || "[]",
      ),
      assessmentResults: JSON.parse(
        localStorage.getItem("assessmentResults") || "{}",
      ),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auracare-data-${new Date().toISOString().split("T")[0]}.json`;
    // Append then click to ensure compatibility across browsers
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleClearData = (key, label) => {
    if (confirm(`Are you sure you want to clear ${label}?`)) {
      localStorage.removeItem(key);
      alert(`${label} cleared`);
      updateCounts();
    }
  };

  const handleClearAll = () => {
    if (
      confirm("Are you sure you want to clear ALL data? This cannot be undone.")
    ) {
      [
        "moodData",
        "journalEntries",
        "assessmentResults",
        "chatHistory",
      ].forEach(localStorage.removeItem.bind(localStorage));
      alert("All data cleared");
      updateCounts();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="settings-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settingsTitle"
        aria-describedby="settingsDescription"
        className="settings-panel relative w-full max-w-3xl overflow-auto rounded-[32px] border border-slate-200/70 bg-white/95 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)] max-h-[90vh] md:mx-auto"
      >
        <button
          type="button"
          aria-label="Close settings"
          className="settings-close-button absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          onClick={onClose}
        >
          ×
        </button>

        <div className="settings-header rounded-b-[32px] bg-gradient-to-r from-teal-100 via-white to-orange-100 px-8 py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black">
            Auracare Settings
          </p>
          <h1
            id="settingsTitle"
            className="mt-3 text-4xl font-semibold tracking-tight text-black"
          >
            Personalize your experience
          </h1>
          <p
            id="settingsDescription"
            className="mt-3 max-w-2xl text-sm leading-6 text-black"
          >
            Keep your profile current, choose a friendly avatar, and manage your
            stored data from one clean control center.
          </p>
        </div>

        <div className="settings-body space-y-6 p-6 overflow-y-auto">
          <section className="settings-section rounded-[28px] border border-slate-200 bg-slate-50/90 p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Update your display name and avatar for a more personal app
                    experience.
                  </p>
                </div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-700">
                  Profile
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="form-label" htmlFor="nicknameInput">
                  Nickname
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="nicknameInput"
                    type="text"
                    className="form-control flex-1"
                    maxLength={20}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={handleSaveNickname}
                  >
                    Save nickname
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="form-label">Avatar</label>
                <div className="flex flex-wrap items-center gap-4 rounded-[20px] border border-slate-200 bg-white px-4 py-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-100 text-4xl">
                    {avatar}
                  </div>
                  <div className="min-w-[180px] text-sm text-slate-600">
                    Choose a new avatar to make your profile stand out across
                    the app.
                  </div>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => setShowAvatars(!showAvatars)}
                  >
                    {showAvatars ? "Hide avatars" : "Choose avatar"}
                  </button>
                </div>

                {showAvatars && (
                  <div className="avatar-grid mt-4">
                    {avatarOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleChangeAvatar(option)}
                        className={`avatar-tile ${avatar === option ? "active" : ""}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="settings-section rounded-[28px] border border-slate-200 bg-slate-50/90 p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-slate-900">
                Appearance
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose whether motion effects are enabled for a smoother
                experience.
              </p>
            </div>
            <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-4">
              <label
                htmlFor="animationsToggle"
                className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-800"
              >
                <input
                  id="animationsToggle"
                  type="checkbox"
                  checked={animationsEnabled}
                  onChange={() => setAnimationsEnabled(!animationsEnabled)}
                  className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Enable animations
              </label>
            </div>
          </section>

          <section className="settings-section rounded-[28px] border border-slate-200 bg-slate-50/90 p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold text-slate-900">
                Privacy & Data
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Export your records or clear specific data anytime.
              </p>
            </div>

            <div className="settings-metrics grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="settings-metric-card">
                <p className="text-sm text-black">Mood entries</p>
                <p className="mt-3 text-3xl font-semibold text-black">
                  {moodCount}
                </p>
              </div>
              <div className="settings-metric-card">
                <p className="text-sm text-black">Journal entries</p>
                <p className="mt-3 text-3xl font-semibold text-black">
                  {journalCount}
                </p>
              </div>
              <div className="settings-metric-card">
                <p className="text-sm text-black">Assessment results</p>
                <p className="mt-3 text-3xl font-semibold text-black">
                  {assessmentCount}
                </p>
              </div>
            </div>

            <div className="settings-action-group mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={handleExportData}
              >
                Export my data
              </button>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => handleClearData("moodData", "Mood data")}
              >
                Clear mood data
              </button>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() =>
                  handleClearData("journalEntries", "Journal entries")
                }
              >
                Clear journal
              </button>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() =>
                  handleClearData("assessmentResults", "Assessment results")
                }
              >
                Clear results
              </button>
              <button
                type="button"
                className="btn btn--secondary btn--sm text-red-600 hover:bg-red-100"
                onClick={handleClearAll}
              >
                Clear all data
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Clearing data removes it permanently from this device.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}