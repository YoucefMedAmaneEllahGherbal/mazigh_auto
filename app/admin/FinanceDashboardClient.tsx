"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeDollarSign,
  ChartNoAxesCombined,
  CircleAlert,
  Percent,
  TrendingUp,
  CarFront,
  Download,
} from "lucide-react";
import type { CarFinance, FinanceCarSummary } from "@/app/data/car-finances";
import { formatPriceDZD } from "@/app/data/cars";

type FinanceDashboardClientProps = {
  cars: FinanceCarSummary[];
  finances: CarFinance[];
};

type FinanceRow = FinanceCarSummary & {
  finance: CarFinance | null;
  dateKey: string | null;
};

type MonthProfit = {
  month: string;
  profit: number;
  salesCount: number;
  knownCostCount: number;
};

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function currentAlgiersYear() {
  return Number(
    new Intl.DateTimeFormat("en", {
      timeZone: "Africa/Algiers",
      year: "numeric",
    }).format(new Date()),
  );
}

function dateKeyInAlgiers(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Algiers",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatCompactDzd(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function safeCsvCell(value: string | number | null) {
  const text = value == null ? "" : String(value);
  const safe =
    typeof value === "number" || !/^[=+\-@\t\r]/.test(text) ? text : `'${text}`;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function FinanceDashboardClient({
  cars,
  finances,
}: FinanceDashboardClientProps) {
  const [selectedYear, setSelectedYear] = useState(currentAlgiersYear);
  const [selectedMonth, setSelectedMonth] = useState("all");

  const rows = useMemo(() => {
    const financeByCar = new Map(finances.map((finance) => [finance.car_id, finance]));
    return cars
      .filter((car) => car.statut === "vendue")
      .map((car): FinanceRow => {
        const finance = financeByCar.get(car.id) ?? null;
        return {
          ...car,
          finance,
          dateKey: dateKeyInAlgiers(finance?.date_vente),
        };
      });
  }, [cars, finances]);

  const years = useMemo(() => {
    const availableYears = rows.flatMap((row) =>
      row.dateKey ? [Number(row.dateKey.slice(0, 4))] : [],
    );
    return Array.from(new Set([currentAlgiersYear(), ...availableYears])).sort(
      (a, b) => b - a,
    );
  }, [rows]);

  const yearRows = useMemo(
    () => rows.filter((row) => !row.dateKey || row.dateKey.startsWith(`${selectedYear}-`)),
    [rows, selectedYear],
  );

  const filteredRows = useMemo(
    () =>
      yearRows
        .filter(
          (row) =>
            !row.dateKey ||
            selectedMonth === "all" ||
            row.dateKey.slice(5, 7) === selectedMonth,
        )
        .sort((a, b) => (b.dateKey ?? "").localeCompare(a.dateKey ?? "")),
    [selectedMonth, yearRows],
  );

  const monthlyProfits = useMemo<MonthProfit[]>(
    () =>
      MONTHS.map((month, index) => {
        const monthNumber = String(index + 1).padStart(2, "0");
        const monthRows = yearRows.filter((row) => row.dateKey?.slice(5, 7) === monthNumber);
        const knownRows = monthRows.filter(
          (row) =>
            row.finance?.prix_achat != null &&
            row.finance.frais != null &&
            row.finance.prix_vente != null,
        );
        return {
          month: month.slice(0, 3),
          profit: knownRows.reduce(
            (total, row) =>
              total +
              (row.finance!.prix_vente! - row.finance!.prix_achat! - row.finance!.frais!),
            0,
          ),
          salesCount: monthRows.length,
          knownCostCount: knownRows.length,
        };
      }),
    [yearRows],
  );

  const totalRevenue = filteredRows.reduce(
    (total, row) => total + (row.finance?.prix_vente ?? 0),
    0,
  );
  const knownCostRows = filteredRows.filter(
    (row) =>
      row.finance?.prix_achat != null &&
      row.finance.frais != null &&
      row.finance.prix_vente != null,
  );
  const totalProfit = knownCostRows.reduce(
    (total, row) =>
      total + row.finance!.prix_vente! - row.finance!.prix_achat! - row.finance!.frais!,
    0,
  );
  const marginRows = knownCostRows.filter((row) => row.finance!.prix_vente! > 0);
  const averageMargin =
    marginRows.length === 0
      ? null
      : marginRows.reduce(
          (total, row) =>
            total +
            (row.finance!.prix_vente! > 0
              ? ((row.finance!.prix_vente! -
                  row.finance!.prix_achat! -
                  row.finance!.frais!) /
                  row.finance!.prix_vente!) *
                100
              : 0),
          0,
        ) / marginRows.length;
  const missingCostCount = filteredRows.filter(
    (row) => row.finance?.prix_achat == null || row.finance.frais == null,
  ).length;

  const stockRows = cars.filter(
    (car) => car.statut !== "vendue",
  );
  const stockFinanceByCar = new Map(finances.map((finance) => [finance.car_id, finance]));
  const stockValue = stockRows.reduce(
    (total, car) => total + (stockFinanceByCar.get(car.id)?.prix_achat ?? 0),
    0,
  );
  const stockMissingCostCount = stockRows.filter(
    (car) => stockFinanceByCar.get(car.id)?.prix_achat == null,
  ).length;

  const exportCsv = () => {
    const header = [
      "Date",
      "Voiture",
      "Achat (DA)",
      "Frais (DA)",
      "Vente (DA)",
      "Bénéfice (DA)",
      "Marge (%)",
    ];
    const csvRows = filteredRows.map((row) => {
      const finance = row.finance;
      const hasProfit =
        finance?.prix_achat != null &&
        finance.frais != null &&
        finance.prix_vente != null;
      const profit = hasProfit
        ? finance.prix_vente! - finance.prix_achat! - finance.frais!
        : null;
      const margin =
        profit !== null && finance?.prix_vente
          ? ((profit / finance.prix_vente) * 100).toFixed(2)
          : null;
      return [
        row.dateKey,
        `${row.marque} ${row.modele} ${row.version} (${row.annee})`.trim(),
        finance?.prix_achat ?? null,
        finance?.frais ?? null,
        finance?.prix_vente ?? null,
        profit,
        margin,
      ]
        .map(safeCsvCell)
        .join(",");
    });
    const blob = new Blob(["\uFEFF", [header.map(safeCsvCell).join(","), ...csvRows].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `finances-${selectedYear}-${selectedMonth === "all" ? "annee" : selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(href);
  };

  const cardClass =
    "rounded-xl border border-[#262626] bg-[#141414] p-4 sm:p-5";

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-[#262626] bg-[#141414] px-5 py-16 text-center">
        <ChartNoAxesCombined className="mx-auto h-10 w-10 text-gray-500" />
        <h2 className="mt-4 text-lg font-semibold text-white">Aucune vente enregistrée</h2>
        <p className="mt-1 text-sm text-gray-400">
          Les ventes confirmées depuis la gestion des véhicules apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-[#262626] bg-[#141414] p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-medium text-gray-400">
            Année
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="block w-full rounded-lg border border-[#333] bg-[#1E1E1E] px-3 py-2 text-sm text-white"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-gray-400">
            Mois
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="block w-full rounded-lg border border-[#333] bg-[#1E1E1E] px-3 py-2 text-sm text-white"
            >
              <option value="all">Toute l&apos;année</option>
              {MONTHS.map((month, index) => (
                <option key={month} value={String(index + 1).padStart(2, "0")}>
                  {month}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="secondary-button inline-flex items-center justify-center gap-2 text-sm !px-4 !py-2"
        >
          <Download className="h-4 w-4" />
          Exporter en CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className={cardClass}>
          <CarFront className="h-5 w-5 text-[var(--primary)]" />
          <p className="mt-3 text-xs uppercase text-gray-400">Voitures vendues</p>
          <p className="mt-1 text-2xl font-bold text-white">{filteredRows.length}</p>
        </article>
        <article className={cardClass}>
          <BadgeDollarSign className="h-5 w-5 text-[var(--primary)]" />
          <p className="mt-3 text-xs uppercase text-gray-400">Chiffre d&apos;affaires</p>
          <p className="mt-1 text-xl font-bold text-white">{formatPriceDZD(totalRevenue)}</p>
        </article>
        <article className={cardClass}>
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <p className="mt-3 text-xs uppercase text-gray-400">Bénéfice total</p>
          <p className={`mt-1 text-xl font-bold ${totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatPriceDZD(totalProfit)}
          </p>
        </article>
        <article className={cardClass}>
          <Percent className="h-5 w-5 text-blue-400" />
          <p className="mt-3 text-xs uppercase text-gray-400">Marge moyenne</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {averageMargin == null ? "—" : `${averageMargin.toFixed(1)} %`}
          </p>
        </article>
        <article className={cardClass}>
          <BadgeDollarSign className="h-5 w-5 text-amber-400" />
          <p className="mt-3 text-xs uppercase text-gray-400">Stock au prix d&apos;achat</p>
          <p className="mt-1 text-xl font-bold text-white">{formatPriceDZD(stockValue)}</p>
          {stockMissingCostCount > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Coût non renseigné pour {stockMissingCostCount} véhicule(s)
            </p>
          )}
        </article>
      </div>

      <section className="rounded-xl border border-[#262626] bg-[#141414] p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <ChartNoAxesCombined className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="font-semibold text-white">Bénéfice par mois — {selectedYear}</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="h-[300px] min-w-[680px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProfits} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
                <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#9ca3af" tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompactDzd}
                />
                <Tooltip
                  cursor={{ fill: "#ffffff0b" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const entry = payload[0].payload as MonthProfit;
                    return (
                      <div className="rounded-lg border border-[#444] bg-[#111] p-3 text-sm shadow-xl">
                        <p className="font-semibold text-white">{entry.month}</p>
                        <p className={entry.profit >= 0 ? "text-emerald-400" : "text-violet-300"}>
                          Bénéfice : {formatPriceDZD(entry.profit)}
                        </p>
                        <p className="text-gray-300">{entry.salesCount} voiture(s) vendue(s)</p>
                        {entry.knownCostCount < entry.salesCount && (
                          <p className="text-xs text-gray-500">
                            {entry.salesCount - entry.knownCostCount} coût(s) manquant(s)
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="profit" name="Bénéfice" radius={[4, 4, 0, 0]}>
                  {monthlyProfits.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={entry.profit < 0 ? "#8b5cf6" : "var(--primary)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {missingCostCount > 0 && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-700/40 bg-amber-950/30 p-3 text-sm text-amber-200">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {missingCostCount} vente(s) exclue(s) du calcul des bénéfices, car le prix d&apos;achat ou les frais sont manquants.
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-[#262626] bg-[#141414]">
        <h2 className="p-4 font-semibold text-white sm:px-5">Voitures vendues</h2>
        {filteredRows.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-gray-400">
            Aucune vente enregistrée pour cette période.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#1A1A1A] text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Voiture</th>
                  <th className="px-4 py-3">Achat</th>
                  <th className="px-4 py-3">Frais</th>
                  <th className="px-4 py-3">Vente</th>
                  <th className="px-4 py-3">Bénéfice</th>
                  <th className="px-4 py-3">Marge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {filteredRows.map((row) => {
                  const finance = row.finance;
                  const hasProfit =
                    finance?.prix_achat != null &&
                    finance.frais != null &&
                    finance.prix_vente != null;
                  const profit = hasProfit
                    ? finance.prix_vente! - finance.prix_achat! - finance.frais!
                    : null;
                  const margin =
                    profit !== null && finance?.prix_vente
                      ? (profit / finance.prix_vente) * 100
                      : null;
                  return (
                    <tr key={row.id} className="text-gray-300">
                      <td className="whitespace-nowrap px-4 py-3">
                        {row.dateKey
                          ? new Intl.DateTimeFormat("fr-DZ", {
                              timeZone: "Africa/Algiers",
                              dateStyle: "medium",
                            }).format(new Date(`${row.dateKey}T12:00:00+01:00`))
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">
                        {row.marque} {row.modele} {row.version} ({row.annee})
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {finance?.prix_achat == null ? "—" : formatPriceDZD(finance.prix_achat)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {finance?.frais == null ? "—" : formatPriceDZD(finance.frais)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {finance?.prix_vente == null ? "—" : formatPriceDZD(finance.prix_vente)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {profit == null ? (
                          <span className="rounded-full bg-amber-950/60 px-2 py-1 text-xs text-amber-200">
                            coût manquant
                          </span>
                        ) : (
                          <span className={profit >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {formatPriceDZD(profit)}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {margin == null ? "—" : `${margin.toFixed(1)} %`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
