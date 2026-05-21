"use client";

/**
 * page.tsx は、トップページに表示する画面を作るファイルです。
 *
 * 今回はここで、
 * ・体重管理アプリの画面
 * ・日付スライダー
 * ・体重入力ルール
 * ・スマホ/PC対応レイアウト
 * ・グラデーションテーマ
 * をまとめて実装しています。
 */

import { useEffect, useMemo, useState } from "react";

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
 * 選択中の日付を判定するために使います。
 * toISOString() がUTC基準なので、日本時間だと日付がズレることがあるためです
 */
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 日付スライダーに表示する短い日付を作ります。
 * 例：2026年5月20日 → "5/20"
 */
function formatDisplayDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 日付スライダーに並べる日付一覧を作ります。
 * 今日を中心に、前後14日分、合計29日分を表示します。
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

export default function Home() {
  /**
   * 日付一覧を作ります。
   * useMemoで、画面更新のたびに日付一覧を作り直さないようにしています。
   */
  const dates = useMemo(() => createDateList(), []);

  /**
   * 今日の日付です。
   * 初期表示で「今日」を選択するために使います。
   */
  const todayText = formatDate(new Date());

  /**
   * 現在選択されている日付です。
   * 初期値を今日にしているので、画面を開くと今日が選ばれています。
   */
  const [selectedDate, setSelectedDate] = useState(todayText);

  /**
   * 体重入力欄の数字部分だけを保持します。
   *
   * 例：
   * 633 と入力されたら、内部では "633" として保存します。
   * 表示するときだけ "63.3" に変換します。
   */
  const [weightDigits, setWeightDigits] = useState("");
  /**
   * APIから取得したグラフデータを保存します。
   */
  const [chartData, setChartData] = useState<any[]>([]);

  /**
   * 体重の表示用テキストです。
   *
   * 仕様：
   * ・数字は最大3桁
   * ・2桁目の右に小数点を入れる
   *
   * 例：
   * "6"   → "6"
   * "63"  → "63."
   * "633" → "63.3"
   */
  const displayWeight =
    weightDigits.length >= 2
      ? `${weightDigits.slice(0, 2)}.${weightDigits.slice(2)}`
      : weightDigits;

  /**
   * 体重入力欄が変更されたときの処理です。
   *
   * やっていること：
   * 1. 数字以外を取り除く
   * 2. 最大3桁までに制限する
   * 3. 入力値を保存する
   *
   * 例：
   * 6334 と入力しても、内部では 633 までしか保存されません。
   */
  const handleWeightChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");
    const limitedNumbers = onlyNumbers.slice(0, 3);
    setWeightDigits(limitedNumbers);
  };
/**
 * 保存ボタンを押したときの処理です。
 *
 * やっていること：
 * ・選択中の日付を送る
 * ・入力中の体重を送る
 * ・GAS側でスプレッドシート3行目に保存する
 * ・保存後にデータを再取得してグラフを更新する
 */
const handleSave = async () => {
  if (!displayWeight) {
    alert("体重を入力してください");
    return;
  }

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxa367T9hp2lYbg_-tKcxJaH1m5s-TuzMs90JSSsYx2uU9v02i4nOfBCnQ7y-DOqwepAQ/exec", {
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

useEffect(() => {
  async function fetchChartData() {
    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxa367T9hp2lYbg_-tKcxJaH1m5s-TuzMs90JSSsYx2uU9v02i4nOfBCnQ7y-DOqwepAQ/exec"
      );

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
     * 画面全体の背景です。
     *
     * flex items-center justify-center：
     * 白いアプリ本体を画面中央に配置します。
     *
     * bg-gradient-to-bl：
     * 右上から左下に向かってグラデーションをかけます。
     */
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-bl from-[#00ffff] to-[#27a239] p-4">
      {/**
       * アプリ本体の白いカードです。
       *
       * スマホ表示：
       * ・最大幅390px
       * ・高さ844px
       * ・iPhone 16eに近い見た目
       *
       * PC表示：
       * ・最大幅を広げる
       * ・高さは自動
       * ・横長ダッシュボードにする
       */}
      <div className="flex h-[844px] w-full max-w-[390px] flex-col overflow-hidden rounded-[32px] bg-white/95 p-5 shadow-2xl backdrop-blur lg:h-auto lg:min-h-[calc(100vh-32px)] lg:max-w-7xl">
        {/**
         * アプリのタイトル部分です。
         */}
        <header className="mb-4 shrink-0">
          <p className="text-sm font-semibold text-[#27a239]">
            Weight Tracker
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            体重管理アプリ
          </h1>
        </header>

        {/**
         * メインコンテンツです。
         *
         * スマホ：
         * ・縦並び
         *
         * PC：
         * ・左にグラフ
         * ・右に入力欄
         */
        }
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          {/**
           * 体重推移グラフのカードです。
           * 今は仮エリアです。後で本物の折れ線グラフに置き換えます。
           */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-[#27a239]/20 bg-white p-4 shadow-sm">
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">体重推移</h2>
                <p className="text-sm text-gray-500">目標と実績のグラフ</p>
              </div>

              <div className="rounded-full bg-gradient-to-bl from-[#00ffff] to-[#27a239] px-3 py-1 text-xs font-bold text-white">
                Demo
              </div>
            </div>

            <div className="h-full min-h-[220px] w-full lg:min-h-[520px]">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={chartData}>
      <XAxis
        dataKey="date"
        tick={{ fontSize: 12 }}
      />

      <YAxis
        domain={["dataMin - 1", "dataMax + 1"]}
        tick={{ fontSize: 12 }}
      />

      <Tooltip />

      {/**
       * 目標体重ライン
       *
       * 薄めカラー
       */}
      <Line
        type="monotone"
        dataKey="target"
        stroke="#7dd3fc"
        strokeWidth={3}
        dot={false}
      />

      {/**
       * 実績体重ライン
       *
       * 濃いカラー
       */}
      <Line
        type="monotone"
        dataKey="actual"
        stroke="#27a239"
        strokeWidth={4}
        dot={{
          r: 4,
        }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
          </section>

          {/**
           * 体重入力フォームのカードです。
           */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-[#27a239]/20 bg-white p-4 shadow-sm">
            <h2 className="mb-4 shrink-0 text-xl font-bold text-gray-900">
              体重を入力
            </h2>

            {/**
             * 日付選択エリアです。
             * カレンダーではなく、横スクロールできるスライダー式にしています。
             */}
            <div className="mb-5 shrink-0">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                日付
              </label>

              <div className="w-full overflow-hidden">
                <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
                  {dates.map((date) => {
                    const dateText = formatDate(date);
                    const isSelected = selectedDate === dateText;
                    const isToday = dateText === todayText;

                    return (
                      <button
                        key={dateText}
                        onClick={() => setSelectedDate(dateText)}
                        className={`shrink-0 rounded-2xl border px-3 py-2 text-sm font-bold transition ${
                          isSelected
                            ? "border-transparent bg-gradient-to-bl from-[#00ffff] to-[#27a239] text-white shadow"
                            : "border-[#27a239]/20 bg-white text-gray-700"
                        }`}
                      >
                        <div className="min-w-[48px]">
                          {isToday ? "今日" : formatDisplayDate(date)}
                        </div>

                        <div className="text-xs opacity-80">
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
             *
             * inputMode="numeric"：
             * スマホで数字キーボードを出しやすくします。
             */}
            <div className="mb-5 shrink-0">
              <label className="mb-2 block text-sm font-bold text-gray-700">
                体重（kg）
              </label>

              <div className="flex w-full items-center rounded-2xl border border-[#27a239]/30 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-[#00ffff]/50">
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayWeight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder="63.3"
                  className="min-w-0 flex-1 bg-transparent text-3xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
                />

                <span className="ml-2 shrink-0 text-lg font-bold text-gray-500">
                  kg
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                例：633 と入力すると 63.3kg と表示されます。
              </p>
            </div>

            {/**
             * 保存ボタンです。
             * 今は見た目だけで、後でスプレッドシート保存処理を追加します。
             */}
            <button
  onClick={handleSave}
  className="shrink-0 rounded-2xl bg-gradient-to-bl from-[#00ffff] to-[#27a239] p-4 text-lg font-bold text-white shadow-lg transition active:scale-[0.98]"
>
  保存する
</button>

            {/**
             * 開発中の確認用エリアです。
             * 選択中の日付と入力中の体重を確認できます。
             */}
            <div className="mt-4 rounded-2xl bg-gray-50 p-3 text-sm text-gray-600">
              <p>選択中の日付：{selectedDate}</p>
              <p>入力中の体重：{displayWeight || "未入力"}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}