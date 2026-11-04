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
  Warehouse,
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

  if (rows.length === 0) {
    return (
      <div className="adm-card adm-empty">
        <ChartNoAxesCombined aria-hidden="true" />
        <h2>Aucune vente enregistrée</h2>
        <p>Les ventes confirmées depuis la gestion des véhicules apparaîtront ici.</p>
      </div>
    );
  }

  const periodLabel =
    selectedMonth === "all" ? String(selectedYear) : `${MONTHS[Number(selectedMonth) - 1]} ${selectedYear}`;

  return (
    <div className="adm-stack">
      {/* Period filter */}
      <div className="adm-card">
        <div className="adm-toolbar justify-between">
          <div className="adm-toolbar-group">
            <label htmlFor="finance-year" className="sr-only">
              Année
            </label>
            <select
              id="finance-year"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="adm-input"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <label htmlFor="finance-month" className="sr-only">
              Mois
            </label>
            <select
              id="finance-month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="adm-input"
            >
              <option value="all">Toute l&apos;année</option>
              {MONTHS.map((month, index) => (
                <option key={month} value={String(index + 1).padStart(2, "0")}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={exportCsv} className="adm-btn">
            <Download className="h-4 w-4" aria-hidden="true" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="adm-stats is-5">
        <article className="adm-stat">
          <span className="adm-stat-label">
            <CarFront className="h-4 w-4" aria-hidden="true" /> Voitures vendues
          </span>
          <span className="adm-stat-value">{filteredRows.length}</span>
          <span className="adm-stat-hint">{periodLabel}</span>
        </article>
        <article className="adm-stat">
          <span className="adm-stat-label">
            <BadgeDollarSign className="h-4 w-4" aria-hidden="true" /> Chiffre d&apos;affaires
          </span>
          <span className="adm-stat-value is-money" title={formatPriceDZD(totalRevenue)}>
            {formatPriceDZD(totalRevenue)}
          </span>
          <span className="adm-stat-hint">{periodLabel}</span>
        </article>
        <article className="adm-stat">
          <span className="adm-stat-label">
            <TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Bénéfice total
          </span>
          <span
            className={`adm-stat-value is-money ${totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}
            title={formatPriceDZD(totalProfit)}
          >
            {formatPriceDZD(totalProfit)}
          </span>
          <span className="adm-stat-hint">
            {knownCostRows.length} vente{knownCostRows.length !== 1 ? "s" : ""} avec coûts connus
          </span>
        </article>
        <article className="adm-stat">
          <span className="adm-stat-label">
            <Percent className="h-4 w-4 text-sky-400" aria-hidden="true" /> Marge moyenne
          </span>
          <span className="adm-stat-value">
            {averageMargin == null ? "—" : `${averageMargin.toFixed(1)} %`}
          </span>
          <span className="adm-stat-hint">sur le prix de vente</span>
        </article>
        <article className="adm-stat">
          <span className="adm-stat-label">
            <Warehouse className="h-4 w-4 text-amber-400" aria-hidden="true" /> Stock (prix d&apos;achat)
          </span>
          <span className="adm-stat-value is-money" title={formatPriceDZD(stockValue)}>
            {formatPriceDZD(stockValue)}
          </span>
          <span className="adm-stat-hint">
            {stockMissingCostCount > 0
              ? `${stockMissingCostCount} coût(s) non renseigné(s)`
              : `${stockRows.length} véhicule(s) en stock`}
          </span>
        </article>
      </div>

      {missingCostCount > 0 && (
        <div className="adm-alert is-warning">
          <CircleAlert aria-hidden="true" />
          {missingCostCount} vente(s) exclue(s) du calcul des bénéfices : prix d&apos;achat ou frais manquants.
        </div>
      )}

      {/* Chart */}
      <section className="adm-card">
        <header className="adm-card-header">
          <h2 className="adm-card-title">
            <ChartNoAxesCombined className="h-[18px] w-[18px]" aria-hidden="true" />
            Bénéfice par mois — {selectedYear}
          </h2>
        </header>
        <div className="adm-card-body">
          <div className="overflow-x-auto">
            <div className="h-[280px] min-w-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProfits} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#25252b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tickFormatter={formatCompactDzd}
                  />
                  <Tooltip
                    cursor={{ fill: "#ffffff08" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const entry = payload[0].payload as MonthProfit;
                      return (
                        <div className="rounded-lg border border-[#33333a] bg-[#121215] p-3 text-sm shadow-xl">
                          <p className="font-semibold text-white">{entry.month}</p>
                          <p className={entry.profit >= 0 ? "text-emerald-400" : "text-violet-300"}>
                            Bénéfice : {formatPriceDZD(entry.profit)}
                          </p>
                          <p className="text-zinc-300">{entry.salesCount} voiture(s) vendue(s)</p>
                          {entry.knownCostCount < entry.salesCount && (
                            <p className="text-xs text-zinc-500">
                              {entry.salesCount - entry.knownCostCount} coût(s) manquant(s)
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="profit" name="Bénéfice" radius={[4, 4, 0, 0]} maxBarSize={44}>
                    {monthlyProfits.map((entry) => (
                      <Cell key={entry.month} fill={entry.profit < 0 ? "#8b5cf6" : "var(--primary)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Sales table */}
      <section className="adm-card">
        <header className="adm-card-header">
          <h2 className="adm-card-title">Voitures vendues — {periodLabel}</h2>
        </header>
        {filteredRows.length === 0 ? (
          <p className="adm-card-body adm-muted">Aucune vente enregistrée pour cette période.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table min-w-[760px]">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Voiture</th>
                  <th scope="col" className="is-right">Achat</th>
                  <th scope="col" className="is-right">Frais</th>
                  <th scope="col" className="is-right">Vente</th>
                  <th scope="col" className="is-right">Bénéfice</th>
                  <th scope="col" className="is-right">Marge</th>
                </tr>
              </thead>
              <tbody>
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
                    <tr key={row.id}>
                      <td className="is-num text-[var(--adm-muted)]">
                        {row.dateKey
                          ? new Intl.DateTimeFormat("fr-DZ", {
                              timeZone: "Africa/Algiers",
                              dateStyle: "medium",
                            }).format(new Date(`${row.dateKey}T12:00:00+01:00`))
                          : "—"}
                      </td>
                      <td className="font-medium">
                        {row.marque} {row.modele}
                        <span className="adm-secondary-line">
                          {[row.version, row.annee].filter(Boolean).join(" · ")}
                        </span>
                      </td>
                      <td className="is-num is-right">
                        {finance?.prix_achat == null ? "—" : formatPriceDZD(finance.prix_achat)}
                      </td>
                      <td className="is-num is-right">
                        {finance?.frais == null ? "—" : formatPriceDZD(finance.frais)}
                      </td>
                      <td className="is-num is-right">
                        {finance?.prix_vente == null ? "—" : formatPriceDZD(finance.prix_vente)}
                      </td>
                      <td className="is-num is-right">
                        {profit == null ? (
                          <span className="rounded-full bg-amber-950/60 px-2 py-1 text-xs text-amber-200">
                            coût manquant
                          </span>
                        ) : (
                          <span className={`font-semibold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {formatPriceDZD(profit)}
                          </span>
                        )}
                      </td>
                      <td className="is-num is-right">{margin == null ? "—" : `${margin.toFixed(1)} %`}</td>
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
