"use client";

/**
 * page.tsx は、トップページに表示する画面を作るファイルです。
 *
 * 今回の調整ポイント：
 * ・スマホでは 100dvh の中に全要素を収める
 * ・縦横スクロールを出さない
 * ・iPhone 16e相当の画面で見やすいよう、余白・文字・グラフを圧縮
 * ・PCでは横長ダッシュボード表示を維持
 */

import { useEffect, useMemo, useRef, useState } from "react";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/**
 * Date型の日付を "YYYY-MM-DD" 形式に変換します。
 * toISOString() はUTC基準で日付ズレすることがあるため使いません。
 */
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 日付スライダーに表示する短い日付を作ります。
 */
function formatDisplayDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 今日を中心に前後14日、合計29日分の日付一覧を作ります。
 */
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

/**
 * GAS APIのURLです。
 * 読み込み・保存の両方で使います。
 */
const GAS_API_URL =
  "https://script.google.com/macros/s/AKfycbxa367T9hp2lYbg_-tKcxJaH1m5s-TuzMs90JSSsYx2uU9v02i4nOfBCnQ7y-DOqwepAQ/exec";

export default function Home() {
  /**
   * 日付スライダー用の日付一覧です。
   */
  const dates = useMemo(() => createDateList(), []);

  /**
   * 今日の日付です。
   */
  const todayText = formatDate(new Date());
  
  /**
  * 今日の日付ボタンを参照するためのものです。
  * 初回表示時に、このボタンが中央に来るようスクロールします。
  */
  const todayButtonRef = useRef<HTMLButtonElement | null>(null);
  
  const dateSliderRef = useRef<HTMLDivElement | null>(null);

  /**
   * 現在選択されている日付です。
   */
  const [selectedDate, setSelectedDate] = useState(todayText);

  /**
   * 体重入力欄の数字部分だけを保持します。
   */
  const [weightDigits, setWeightDigits] = useState("");

  /**
   * APIから取得したグラフデータです。
   */
  const [chartData, setChartData] = useState<any[]>([]);

  /**
   * 体重の表示用テキストです。
   * 例：633 → 63.3
   */
  const displayWeight =
    weightDigits.length >= 2
      ? `${weightDigits.slice(0, 2)}.${weightDigits.slice(2)}`
      : weightDigits;

  /**
   * 体重入力欄の変更処理です。
   * 数字以外を除外し、最大3桁までに制限します。
   */
  const handleWeightChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");
    const limitedNumbers = onlyNumbers.slice(0, 3);
    setWeightDigits(limitedNumbers);
  };

  /**
   * 保存ボタンを押したときの処理です。
   * GAS APIに日付と体重を送り、スプレッドシートへ保存します。
   */
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

      /**
       * ページ全体はリロードせず、
       * 該当日のグラフデータだけを更新します。
       */
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
 * 初回表示時に、日付スライダーの「今日」を中央へスクロールします。
 */
  useEffect(() => {
    const slider = dateSliderRef.current;
    const todayButton = todayButtonRef.current;
  
    if (!slider || !todayButton) return;
  
    requestAnimationFrame(() => {
      const sliderCenter = slider.clientWidth / 2;
      const buttonCenter = todayButton.offsetLeft + todayButton.offsetWidth / 2;
  
      slider.scrollLeft = buttonCenter - sliderCenter;
    });
  }, []);

  /**
   * 初回表示時にGAS APIからスプレッドシートのデータを取得します。
   */
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
    /**
     * 画面全体です。
     *
     * h-[100dvh]：
     * スマホブラウザ/PWAの実表示高さに合わせます。
     *
     * overflow-hidden：
     * 縦横スクロールを出さないようにします。
     */
    <main className="flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-gradient-to-bl from-[#00ffff] to-[#27a239] p-2 lg:p-4">
      {/**
       * アプリ本体カードです。
       *
       * スマホ：
       * ・画面内いっぱい
       * ・最大390px
       * ・高さ100%
       *
       * PC：
       * ・横長ダッシュボード
       */}
      <div className="flex h-full w-full max-w-[390px] flex-col overflow-hidden rounded-[26px] bg-white/95 p-3 shadow-2xl backdrop-blur lg:h-auto lg:min-h-[calc(100vh-32px)] lg:max-w-7xl lg:p-5">
        {/**
         * ヘッダー部分です。
         * スマホでは小さめ、PCでは通常サイズにしています。
         */}
        <header className="mb-2 shrink-0 lg:mb-4">
          <p className="text-xs font-semibold text-[#27a239] lg:text-sm">
            Weight Tracker
          </p>

          <h1 className="mt-0.5 text-2xl font-bold leading-tight text-gray-900 lg:mt-1 lg:text-3xl">
            体重管理アプリ
          </h1>
        </header>

        {/**
         * メインコンテンツです。
         *
         * スマホ：
         * ・縦並び
         * ・全体を画面内に収める
         *
         * PC：
         * ・左グラフ、右入力の2カラム
         */}
        <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-3 lg:grid-cols-[1.5fr_1fr] lg:grid-rows-none lg:gap-4">
          {/**
           * グラフカードです。
           */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#27a239]/20 bg-white p-3 shadow-sm lg:rounded-3xl lg:p-4">
            <div className="mb-2 flex shrink-0 items-start justify-between lg:mb-3">
              <div>
                <h2 className="text-lg font-bold leading-tight text-gray-900 lg:text-xl">
                  体重推移
                </h2>
                <p className="text-xs text-gray-500 lg:text-sm">
                  目標と実績のグラフ
                </p>
              </div>

              <div className="rounded-full bg-gradient-to-bl from-[#00ffff] to-[#27a239] px-2.5 py-1 text-[10px] font-bold text-white lg:px-3 lg:text-xs">
                Demo
              </div>
            </div>

            {/**
             * グラフ本体です。
             * スマホでは高さを圧縮し、PCでは大きく表示します。
             */}
            <div className="min-h-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
                >
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />

                  <YAxis
                    domain={["dataMin - 1", "dataMax + 1"]}
                    tick={{ fontSize: 10 }}
                    width={36}
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

          {/**
           * 入力カードです。
           */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#27a239]/20 bg-white p-3 shadow-sm lg:rounded-3xl lg:p-4">
            <h2 className="mb-2 shrink-0 text-lg font-bold text-gray-900 lg:mb-4 lg:text-xl">
              体重を入力
            </h2>

            {/**
             * 日付スライダーです。
             * 横にスライドして選択できます。
             */}
            <div className="mb-3 shrink-0 lg:mb-5">
              <label className="mb-1.5 block text-xs font-bold text-gray-700 lg:mb-2 lg:text-sm">
                日付
              </label>

              <div className="w-full overflow-hidden">
              <div
                ref={dateSliderRef}
                className="flex max-w-full gap-2 overflow-x-auto pb-1"
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
                        className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold transition lg:rounded-2xl lg:py-2 lg:text-sm ${
                          isSelected
                            ? "border-transparent bg-gradient-to-bl from-[#00ffff] to-[#27a239] text-white shadow"
                            : "border-[#27a239]/20 bg-white text-gray-700"
                        }`}
                      >
                        <div className="min-w-[42px] lg:min-w-[48px]">
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

            {/**
             * 体重入力欄です。
             */}
            <div className="mb-3 shrink-0 lg:mb-5">
              <label className="mb-1.5 block text-xs font-bold text-gray-700 lg:mb-2 lg:text-sm">
                体重（kg）
              </label>

              <div className="flex w-full items-center rounded-2xl border border-[#27a239]/30 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#00ffff]/50 lg:px-4 lg:py-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayWeight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder="63.3"
                  className="min-w-0 flex-1 bg-transparent text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-300 lg:text-3xl"
                />

                <span className="ml-2 shrink-0 text-base font-bold text-gray-500 lg:text-lg">
                  kg
                </span>
              </div>

              <p className="mt-1.5 text-[10px] text-gray-500 lg:mt-2 lg:text-xs">
                例：633 と入力すると 63.3kg と表示されます。
              </p>
            </div>

            {/**
             * 保存ボタンです。
             */}
            <button
              onClick={handleSave}
              className="shrink-0 rounded-2xl bg-gradient-to-bl from-[#00ffff] to-[#27a239] p-3 text-base font-bold text-white shadow-lg transition active:scale-[0.98] lg:p-4 lg:text-lg"
            >
              保存する
            </button>

            {/**
             * 開発中の確認用エリアです。
             * スマホでは小さく表示して、画面内に収まりやすくします。
             */}
            <div className="mt-2 shrink-0 rounded-2xl bg-gray-50 p-2 text-[10px] text-gray-600 lg:mt-4 lg:p-3 lg:text-sm">
              <p>選択中の日付：{selectedDate}</p>
              <p>入力中の体重：{displayWeight || "未入力"}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}