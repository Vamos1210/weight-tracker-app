"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function createDateList() {
  const today = new Date();
  const dates: Date[] = [];

  for (let i = -14; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  return dates;
}

const GAS_API_URL =
  "https://script.google.com/macros/s/AKfycbxa367T9hp2lYbg_-tKcxJaH1m5s-TuzMs90JSSsYx2uU9v02i4nOfBCnQ7y-DOqwepAQ/exec";

export default function Home() {
  const dates = useMemo(() => createDateList(), []);

  const todayText = formatDate(new Date());

  const todayButtonRef = useRef<HTMLButtonElement | null>(null);

  const dateSliderRef = useRef<HTMLDivElement | null>(null);

  const [selectedDate, setSelectedDate] = useState(todayText);

  const [weightDigits, setWeightDigits] = useState("");

  const [chartData, setChartData] = useState<any[]>([]);

  const displayWeight =
    weightDigits.length >= 2
      ? `${weightDigits.slice(0, 2)}.${weightDigits.slice(2)}`
      : weightDigits;

  const handleWeightChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");

    const limitedNumbers = onlyNumbers.slice(0, 3);

    setWeightDigits(limitedNumbers);
  };

  const handleSave = async () => {
    if (!displayWeight) {
      alert("体重を入力してください");

      return;
    }

    try {
      const response = await fetch(GAS_API_URL, {
        method: "POST",

        body: JSON.stringify({
          date: selectedDate,

          actualWeight: Number(displayWeight),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.message || "保存に失敗しました");

        return;
      }

      alert("保存しました");

      setChartData((currentData) =>
        currentData.map((item) => {
          if (item.fullDate === selectedDate) {
            return {
              ...item,

              actual: Number(displayWeight),
            };
          }

          return item;
        })
      );
    } catch (error) {
      console.error("保存失敗", error);

      alert("保存に失敗しました");
    }
  };

  /**
   * 今日ボタンを中央へスクロール
   */
  useLayoutEffect(() => {
    const slider = dateSliderRef.current;

    const todayButton = todayButtonRef.current;

    if (!slider || !todayButton) return;

    const scrollToToday = () => {
      const sliderCenter = slider.clientWidth / 2;

      const buttonCenter =
        todayButton.offsetLeft + todayButton.offsetWidth / 2;

      slider.scrollLeft = buttonCenter - sliderCenter;
    };

    scrollToToday();

    const timeoutId = window.setTimeout(() => {
      scrollToToday();
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    async function fetchChartData() {
      try {
        const response = await fetch(GAS_API_URL);

        const json = await response.json();

        const formattedData = json.data.map((item: any) => ({
          fullDate: item.date,

          date: item.date.slice(5, 10),

          target: item.targetWeight,

          actual: item.actualWeight,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("データ取得失敗", error);
      }
    }

    fetchChartData();
  }, []);

  return (
    <main className="flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-gradient-to-bl from-[#00ffff] to-[#27a239] px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-[max(10px,env(safe-area-inset-top))] lg:p-4">
      <div className="flex h-full w-full max-w-[390px] flex-col overflow-hidden rounded-[22px] bg-white/95 p-2.5 shadow-2xl backdrop-blur lg:h-auto lg:min-h-[calc(100vh-32px)] lg:max-w-7xl lg:p-5">
        <header className="mb-1 shrink-0 lg:mb-4">
          <p className="text-[11px] font-semibold leading-none text-[#27a239] lg:text-sm">
            Weight Tracker
          </p>

          <h1 className="mt-1 text-xl font-bold leading-none text-gray-900 lg:text-3xl">
            体重管理アプリ
          </h1>
        </header>

        <div className="grid min-h-0 flex-1 grid-rows-[0.88fr_1fr] gap-2 lg:grid-cols-[1.5fr_1fr] lg:grid-rows-none lg:gap-4">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#27a239]/20 bg-white p-2.5 shadow-sm lg:rounded-3xl lg:p-4">
            <div className="mb-1.5 flex shrink-0 items-start justify-between lg:mb-3">
              <div>
                <h2 className="text-base font-bold leading-tight text-gray-900 lg:text-xl">
                  体重推移
                </h2>

                <p className="text-[11px] text-gray-500 lg:text-sm">
                  目標と実績のグラフ
                </p>
              </div>

              <div className="rounded-full bg-gradient-to-bl from-[#00ffff] to-[#27a239] px-2.5 py-1 text-[10px] font-bold text-white lg:px-3 lg:text-xs">
                Demo
              </div>
            </div>

            <div className="min-h-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 4, right: 4, bottom: 0, left: -22 }}
                >
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />

                  <YAxis
                    domain={["dataMin - 1", "dataMax + 1"]}
                    tick={{ fontSize: 9 }}
                    width={34}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#7dd3fc"
                    strokeWidth={3}
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#27a239"
                    strokeWidth={4}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#27a239]/20 bg-white p-2.5 shadow-sm lg:rounded-3xl lg:p-4">
            <h2 className="mb-1.5 shrink-0 text-base font-bold text-gray-900 lg:mb-4 lg:text-xl">
              体重を入力
            </h2>

            <div className="mb-2 shrink-0 lg:mb-5">
              <label className="mb-1 block text-xs font-bold text-gray-700 lg:text-sm">
                日付
              </label>

              <div className="w-full overflow-hidden">
                <div
                  ref={dateSliderRef}
                  className="flex max-w-full gap-1.5 overflow-x-auto pb-1"
                >
                  {dates.map((date) => {
                    const dateText = formatDate(date);

                    const isSelected = selectedDate === dateText;

                    const isToday = dateText === todayText;

                    return (
                      <button
                        key={dateText}
                        ref={isToday ? todayButtonRef : null}
                        onClick={() => setSelectedDate(dateText)}
                        className={`shrink-0 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition lg:rounded-2xl lg:px-3 lg:py-2 lg:text-sm ${
                          isSelected
                            ? "border-transparent bg-gradient-to-bl from-[#00ffff] to-[#27a239] text-white shadow"
                            : "border-[#27a239]/20 bg-white text-gray-700"
                        }`}
                      >
                        <div className="min-w-[38px] lg:min-w-[48px]">
                          {isToday ? "今日" : formatDisplayDate(date)}
                        </div>

                        <div className="text-[10px] opacity-80 lg:text-xs">
                          {date.toLocaleDateString("ja-JP", {
                            weekday: "short",
                          })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mb-2 shrink-0 lg:mb-5">
              <label className="mb-1 block text-xs font-bold text-gray-700 lg:text-sm">
                体重（kg）
              </label>

              <div className="flex w-full items-center rounded-2xl border border-[#27a239]/30 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#00ffff]/50 lg:px-4 lg:py-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayWeight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder="63.3"
                  className="min-w-0 flex-1 bg-transparent text-xl font-bold text-gray-900 outline-none placeholder:text-gray-300 lg:text-3xl"
                />

                <span className="ml-2 shrink-0 text-base font-bold text-gray-500 lg:text-lg">
                  kg
                </span>
              </div>

              <p className="mt-1 text-[10px] leading-tight text-gray-500 lg:text-xs">
                例：633 と入力すると 63.3kg と表示されます。
              </p>
            </div>

            <button
              onClick={handleSave}
              className="shrink-0 rounded-2xl bg-gradient-to-bl from-[#00ffff] to-[#27a239] p-2.5 text-base font-bold text-white shadow-lg transition active:scale-[0.98] lg:p-4 lg:text-lg"
            >
              保存する
            </button>

            <div className="mt-1.5 shrink-0 rounded-xl bg-gray-50 p-1.5 text-[9px] leading-tight text-gray-600 lg:mt-4 lg:rounded-2xl lg:p-3 lg:text-sm">
              <p>選択中の日付：{selectedDate}</p>

              <p>入力中の体重：{displayWeight || "未入力"}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}